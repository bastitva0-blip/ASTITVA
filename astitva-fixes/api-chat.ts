import { NextRequest } from 'next/server'
import { callLLM, getActiveProvider } from '@/lib/llm'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  const { message, report, history = [] } = await req.json()

  try {
    const reply = await callLLM([
      {
        role: 'system',
        content: `You are a sharp brand strategy expert. Be concise — 2-4 sentences max. No fluff. Answer directly.

Audit: ${report.companyName} (${report.url})
Overall: ${report.scores.overall}/100
Scores: Clarity ${report.scores.clarity} | Consistency ${report.scores.consistency} | Differentiation ${report.scores.differentiation} | Trust ${report.scores.trust}
Summary: ${report.summary}
Top rec: ${report.recommendations?.[0]?.action || 'none'}
Strengths: ${report.strengths?.map((s: { point: string }) => s.point).join(', ')}
Weaknesses: ${report.weaknesses?.map((w: { point: string }) => w.point).join(', ')}`,
      },
      ...history.slice(-6),
      { role: 'user', content: message },
    ], { max_tokens: 300 })

    return Response.json({ reply, provider: getActiveProvider() })
  } catch (err) {
    return Response.json({
      reply: `No LLM provider available. Add NVIDIA_API_KEY or GROQ_API_KEY to .env.local.`,
      error: String(err),
    })
  }
}
