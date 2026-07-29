import { NextRequest } from 'next/server'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  const { message, report, history = [] } = await req.json()

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ reply: 'Claude API key not set. Add ANTHROPIC_API_KEY to .env.local.' })
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      system: `You are a sharp brand strategy expert reviewing an audit. Be concise — 2-4 sentences max. No fluff. Answer directly.

Audit data for ${report.companyName} (${report.url}):
- Overall: ${report.scores.overall}/100
- Clarity: ${report.scores.clarity} | Consistency: ${report.scores.consistency} | Differentiation: ${report.scores.differentiation} | Trust: ${report.scores.trust}
- Summary: ${report.summary}
- Top recommendation: ${report.recommendations?.[0]?.action || 'none'}
- Tone: ${report.tone?.primary} — ${report.tone?.characteristics?.join(', ')}
- Strengths: ${report.strengths?.map((s: {point: string}) => s.point).join(', ')}
- Weaknesses: ${report.weaknesses?.map((w: {point: string}) => w.point).join(', ')}`,
      messages: [
        ...history.slice(-6),
        { role: 'user', content: message },
      ],
    }),
  })

  if (!res.ok) {
    return Response.json({ reply: `API error: ${res.status}` }, { status: 500 })
  }

  const data = await res.json()
  return Response.json({ reply: data.content?.[0]?.text ?? 'No response.' })
}
