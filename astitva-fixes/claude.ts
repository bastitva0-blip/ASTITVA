// Claude replaced with multi-provider LLM orchestration (NVIDIA NIM → Groq)
import { callLLMJson } from './llm'
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
  try {
    return await callLLMJson<ClaudeSynthesis>([
      {
        role: 'system',
        content: 'You are a senior brand strategist. Return ONLY valid raw JSON — no markdown, no backticks.',
      },
      {
        role: 'user',
        content: `Synthesize this brand audit for ${url} into strategic insights.

${JSON.stringify(nimAnalysis, null, 2)}

Return EXACTLY this JSON:
{
  "summary": "2-3 sentence sharp executive summary — be specific and opinionated",
  "recommendations": [
    {"priority":"high","area":"area name","action":"specific actionable recommendation","impact":"expected outcome"},
    {"priority":"high","area":"...","action":"...","impact":"..."},
    {"priority":"medium","area":"...","action":"...","impact":"..."},
    {"priority":"medium","area":"...","action":"...","impact":"..."},
    {"priority":"low","area":"...","action":"...","impact":"..."}
  ]
}`,
      },
    ], { max_tokens: 1500 })
  } catch {
    // Fallback: derive from NIM data directly
    const overall = Math.round(
      (nimAnalysis.clarityScore + nimAnalysis.consistencyScore +
        nimAnalysis.differentiationScore + nimAnalysis.trustScore) / 4
    )
    return {
      summary: `${nimAnalysis.companyName} scores ${overall}/100. ${nimAnalysis.valueProposition} Primary opportunity: ${nimAnalysis.weaknesses[0]?.point || 'improve brand consistency'}.`,
      recommendations: nimAnalysis.weaknesses.map((w, i) => ({
        priority: (i === 0 ? 'high' : i === 1 ? 'high' : 'medium') as 'high' | 'medium' | 'low',
        area: 'Brand Strategy',
        action: `Address: ${w.point}`,
        impact: w.detail,
      })),
    }
  }
}
