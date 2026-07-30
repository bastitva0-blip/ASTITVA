import { callLLM, callLLMWithTools } from './llm'
import { AGENT_TOOLS, executeAgentTool } from './agentTools'
import type { AuditReport } from './types'

export interface AgentTraceStep {
  tool: string
  args: Record<string, unknown>
  result: unknown
}

export interface AgentResult {
  reply: string
  trace: AgentTraceStep[]
}

const MAX_STEPS = 3

// A ReAct-style loop: the model can call live tools (rescrape a page, score a
// competitor, redo a section) before answering, instead of only reasoning over
// the static report snapshot. Each tool round is recorded in `trace` so the UI
// can show what the agent actually did, not just what it said.
export async function runAgentChat(
  message: string,
  report: AuditReport,
  history: Array<{ role: string; content: string }>
): Promise<AgentResult> {
  const trace: AgentTraceStep[] = []

  const messages: Array<Record<string, unknown>> = [
    {
      role: 'system',
      content: `You are Astitva's brand strategy agent, embedded in a live audit of ${report.companyName} (${report.url}).

Overall score: ${report.scores.overall}/100
Summary: ${report.summary}
Weaknesses: ${report.weaknesses?.map(w => w.point).join(', ') || 'none noted'}
Strengths: ${report.strengths?.map(s => s.point).join(', ') || 'none noted'}

You have tools to pull LIVE evidence instead of guessing:
- rescrape_page: read another page on ${report.url} (e.g. pricing, about)
- analyze_competitor: score a named competitor live, right now
- regenerate_section: re-run a deeper pass on one report section

Call a tool whenever the question needs fresh evidence you don't already have — e.g. "how's the pricing page" or "vs Stripe" should trigger one. Otherwise answer directly from the audit above. Be sharp and concise: 2-4 sentences, no fluff.`,
    },
    ...history.slice(-6),
    { role: 'user', content: message },
  ]

  for (let step = 0; step < MAX_STEPS; step++) {
    const res = await callLLMWithTools(messages, AGENT_TOOLS, { max_tokens: 500 })

    if (!res.toolCalls.length) {
      return { reply: res.content || 'No response.', trace }
    }

    messages.push({
      role: 'assistant',
      content: res.content ?? '',
      tool_calls: res.toolCalls.map(tc => ({
        id: tc.id,
        type: 'function',
        function: { name: tc.name, arguments: tc.arguments },
      })),
    })

    for (const call of res.toolCalls) {
      let args: Record<string, unknown> = {}
      try { args = JSON.parse(call.arguments || '{}') } catch { /* malformed args, treat as empty */ }

      const result = await executeAgentTool(call.name, args, report)
      trace.push({ tool: call.name, args, result })

      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: JSON.stringify(result).slice(0, 3000),
      })
    }
  }

  // Ran out of tool-call rounds — force a final text answer from whatever evidence was gathered.
  const final = await callLLM(messages, { max_tokens: 400 })
  return { reply: final, trace }
}
