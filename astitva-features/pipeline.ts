import { scrapeUrl, screenshotUrl } from './scraper'
import { analyzeWithNIM, analyzeScoresOnly } from './nvidia'
import { synthesizeWithClaude } from './claude'
import type { AuditReport, ScoreSet } from './types'

type StepId = 'scrape' | 'analyze' | 'synthesize'
type StepStatus = 'running' | 'done'

export async function runAuditPipeline(
  url: string,
  onStep: (step: StepId, status: StepStatus) => void
): Promise<AuditReport> {
  // Step 1: Scrape + screenshot in parallel
  onStep('scrape', 'running')
  const [content, screenshot] = await Promise.all([
    scrapeUrl(url),
    screenshotUrl(url), // null if no Firecrawl key
  ])
  onStep('scrape', 'done')

  // Step 2: NIM analysis
  onStep('analyze', 'running')
  const nim = await analyzeWithNIM(content, url)
  onStep('analyze', 'done')

  // Step 3: Claude synthesis + visual audit + competitor benchmark in parallel
  onStep('synthesize', 'running')

  const tasks: Promise<unknown>[] = [synthesizeWithClaude(nim, url)]

  // Visual audit — if screenshot available, run Claude vision
  if (screenshot && process.env.ANTHROPIC_API_KEY) {
    tasks.push(runVisualAudit(screenshot))
  } else {
    tasks.push(Promise.resolve(null))
  }

  // Competitor benchmark — lightweight NIM score for each competitor
  const competitorDomains = (nim.competitorDomains || []).slice(0, 2)
  if (competitorDomains.length > 0) {
    tasks.push(runCompetitorBenchmark(competitorDomains))
  } else {
    tasks.push(Promise.resolve([]))
  }

  const [claudeResult, visualAudit, competitorBenchmark] = await Promise.all(tasks) as [
    Awaited<ReturnType<typeof synthesizeWithClaude>>,
    Awaited<ReturnType<typeof runVisualAudit>> | null,
    Awaited<ReturnType<typeof runCompetitorBenchmark>>,
  ]
  onStep('synthesize', 'done')

  const overall = Math.round(
    (nim.clarityScore + nim.consistencyScore + nim.differentiationScore + nim.trustScore) / 4
  )

  const report: AuditReport = {
    url,
    companyName: nim.companyName,
    scores: {
      clarity: nim.clarityScore,
      consistency: nim.consistencyScore,
      differentiation: nim.differentiationScore,
      trust: nim.trustScore,
      overall,
    },
    tone: { primary: nim.primaryTone, characteristics: nim.toneCharacteristics },
    positioning: {
      targetAudience: nim.targetAudience,
      valueProposition: nim.valueProposition,
      marketPosition: nim.marketPosition,
    },
    claims: nim.brandClaims,
    strengths: nim.strengths,
    weaknesses: nim.weaknesses,
    recommendations: claudeResult.recommendations,
    summary: claudeResult.summary,
  }

  if (visualAudit) report.visualAudit = visualAudit
  if (Array.isArray(competitorBenchmark) && competitorBenchmark.length > 0) {
    report.competitorBenchmark = competitorBenchmark
  }

  return report
}

// ── Visual audit via Claude vision ──────────────────────────────────────────
async function runVisualAudit(screenshotDataUrl: string): Promise<AuditReport['visualAudit']> {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        system: 'You are a visual brand auditor. Analyze website screenshots and return ONLY valid raw JSON.',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'url', url: screenshotDataUrl },
            },
            {
              type: 'text',
              text: `Analyze this website screenshot for visual brand quality. Return JSON:
{
  "score": 75,
  "findings": ["finding1","finding2","finding3"],
  "suggestions": ["suggestion1","suggestion2","suggestion3"]
}
Score 0-100. Findings = what you observe. Suggestions = specific visual improvements.`,
            },
          ],
        }],
      }),
    })
    if (!res.ok) return undefined
    const data = await res.json()
    const raw = data.content?.[0]?.text ?? ''
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
    return { ...parsed, screenshotUrl: screenshotDataUrl }
  } catch {
    return undefined
  }
}

// ── Competitor benchmark ─────────────────────────────────────────────────────
async function runCompetitorBenchmark(
  domains: string[]
): Promise<AuditReport['competitorBenchmark']> {
  const results = await Promise.allSettled(
    domains.map(async (domain) => {
      const url = `https://${domain}`
      const content = await scrapeUrl(url)
      const scores = await analyzeScoresOnly(content, url)
      const overall = Math.round(
        (scores.clarityScore + scores.consistencyScore + scores.differentiationScore + scores.trustScore) / 4
      )
      return {
        companyName: scores.companyName,
        url,
        scores: {
          clarity: scores.clarityScore,
          consistency: scores.consistencyScore,
          differentiation: scores.differentiationScore,
          trust: scores.trustScore,
          overall,
        } as ScoreSet,
      }
    })
  )
  return results
    .filter((r): r is PromiseFulfilledResult<typeof results[0] extends PromiseFulfilledResult<infer T> ? T : never> => r.status === 'fulfilled')
    .map(r => r.value)
}
