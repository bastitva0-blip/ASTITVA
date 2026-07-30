import { scrapeUrl } from './scraper'
import { analyzeScoresOnly } from './nvidia'
import { regenerateSection, type Section } from './sections'
import type { AuditReport } from './types'
import type { ToolDef } from './llm'

export const AGENT_TOOLS: ToolDef[] = [
  {
    type: 'function',
    function: {
      name: 'rescrape_page',
      description:
        "Fetch and read a specific page on the audited brand's own site (e.g. /pricing, /about) to answer questions the homepage audit alone can't cover.",
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Path or full URL on the same site, e.g. "/pricing"' },
        },
        required: ['path'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'analyze_competitor',
      description:
        'Scrape and score a named competitor domain live on clarity, consistency, differentiation, and trust — for a grounded head-to-head comparison.',
      parameters: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'Competitor domain, e.g. "stripe.com"' },
        },
        required: ['domain'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'regenerate_section',
      description:
        "Re-run a deeper, focused re-analysis of one report section against the brand's live site content.",
      parameters: {
        type: 'object',
        properties: {
          section: { type: 'string', enum: ['tone', 'positioning', 'claims', 'strengths'] },
        },
        required: ['section'],
      },
    },
  },
]

function resolveUrl(base: string, path: string): string {
  try {
    return new URL(path, base).toString()
  } catch {
    return base
  }
}

export async function executeAgentTool(
  name: string,
  args: Record<string, unknown>,
  report: AuditReport
): Promise<unknown> {
  try {
    switch (name) {
      case 'rescrape_page': {
        const target = resolveUrl(report.url, String(args.path ?? '/'))
        const content = await scrapeUrl(target)
        return { url: target, excerpt: content.slice(0, 1500) }
      }
      case 'analyze_competitor': {
        const domain = String(args.domain ?? '').replace(/^https?:\/\//, '').replace(/\/.*$/, '')
        if (!domain) return { error: 'No domain provided' }
        const url = `https://${domain}`
        const content = await scrapeUrl(url)
        const scores = await analyzeScoresOnly(content, url)
        return { url, ...scores }
      }
      case 'regenerate_section': {
        const section = String(args.section ?? '') as Section
        return await regenerateSection(report.url, section)
      }
      default:
        return { error: `Unknown tool: ${name}` }
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
}
