import type { NIMAnalysis } from './nvidia'

export interface ClaudeSynthesis {
  summary: string
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low'
    area: string
    action: string
    impact: string
  }>
}

export async function synthesizeWithClaude(
  nimAnalysis: NIMAnalysis,
  url: string
): Promise<ClaudeSynthesis> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system:
        'You are a senior brand strategist at a top design studio. You write sharp, opinionated, actionable brand strategy. Return ONLY valid raw JSON — no markdown, no backticks.',
      messages: [
        {
          role: 'user',
          content: `Given this brand audit data for ${url}, synthesize strategic insights and generate 5 prioritized recommendations.

Audit data:
${JSON.stringify(nimAnalysis, null, 2)}

Return EXACTLY this JSON structure:
{
  "summary": "2-3 sentence sharp executive summary — be specific and opinionated, not generic",
  "recommendations": [
    {
      "priority": "high",
      "area": "area name (e.g. Messaging, Visual Identity, Positioning, Content Strategy, Trust Signals)",
      "action": "specific, actionable recommendation in one sentence",
      "impact": "concrete expected outcome if implemented"
    },
    {
      "priority": "high",
      "area": "...",
      "action": "...",
      "impact": "..."
    },
    {
      "priority": "medium",
      "area": "...",
      "action": "...",
      "impact": "..."
    },
    {
      "priority": "medium",
      "area": "...",
      "action": "...",
      "impact": "..."
    },
    {
      "priority": "low",
      "area": "...",
      "action": "...",
      "impact": "..."
    }
  ]
}`,
        },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Claude API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const raw = data.content?.[0]?.text ?? ''
  const clean = raw.replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(clean) as ClaudeSynthesis
  } catch {
    throw new Error(`Failed to parse Claude response: ${raw.slice(0, 200)}`)
  }
}
