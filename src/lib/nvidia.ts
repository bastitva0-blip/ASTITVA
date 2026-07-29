const NVIDIA_BASE = 'https://integrate.api.nvidia.com/v1'

export interface NIMAnalysis {
  companyName: string
  primaryTone: string
  toneCharacteristics: string[]
  targetAudience: string
  valueProposition: string
  marketPosition: string
  brandClaims: string[]
  clarityScore: number
  consistencyScore: number
  differentiationScore: number
  trustScore: number
  strengths: Array<{ point: string; detail: string }>
  weaknesses: Array<{ point: string; detail: string }>
  competitorDomains: string[] // NEW — max 2 competitors
}

export async function analyzeWithNIM(content: string, url: string): Promise<NIMAnalysis> {
  const res = await fetch(`${NVIDIA_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta/llama-3.1-70b-instruct',
      messages: [
        {
          role: 'system',
          content: 'You are an expert brand strategist. Return ONLY valid raw JSON — no markdown, no backticks.',
        },
        {
          role: 'user',
          content: `Analyze the brand content from ${url}. Return a single JSON object:

{
  "companyName": "string",
  "primaryTone": "single adjective",
  "toneCharacteristics": ["adj1","adj2","adj3"],
  "targetAudience": "one sentence",
  "valueProposition": "one sentence",
  "marketPosition": "one sentence",
  "brandClaims": ["claim1","claim2","claim3"],
  "clarityScore": 75,
  "consistencyScore": 70,
  "differentiationScore": 65,
  "trustScore": 80,
  "strengths": [
    {"point":"title","detail":"explanation"},
    {"point":"title","detail":"explanation"},
    {"point":"title","detail":"explanation"}
  ],
  "weaknesses": [
    {"point":"title","detail":"explanation"},
    {"point":"title","detail":"explanation"},
    {"point":"title","detail":"explanation"}
  ],
  "competitorDomains": ["competitor1.com","competitor2.com"]
}

Brand content:
${content}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 2000,
    }),
  })

  if (!res.ok) throw new Error(`NVIDIA NIM error ${res.status}: ${await res.text()}`)
  const data = await res.json()
  const raw = data.choices?.[0]?.message?.content ?? ''
  const clean = raw.replace(/```json|```/g, '').trim()
  try {
    return JSON.parse(clean) as NIMAnalysis
  } catch {
    throw new Error(`Failed to parse NIM response: ${raw.slice(0, 200)}`)
  }
}

// Lightweight analysis — scores only (for competitor benchmarking)
export async function analyzeScoresOnly(content: string, url: string): Promise<{
  companyName: string
  clarityScore: number
  consistencyScore: number
  differentiationScore: number
  trustScore: number
}> {
  const res = await fetch(`${NVIDIA_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta/llama-3.1-70b-instruct',
      messages: [
        { role: 'system', content: 'Return ONLY valid raw JSON — no markdown, no backticks.' },
        {
          role: 'user',
          content: `Score this brand from ${url} on 4 dimensions (0-100 each). Return JSON:
{"companyName":"string","clarityScore":75,"consistencyScore":70,"differentiationScore":65,"trustScore":80}

Content: ${content.slice(0, 4000)}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 200,
    }),
  })
  if (!res.ok) throw new Error(`NIM score error`)
  const data = await res.json()
  const raw = data.choices?.[0]?.message?.content ?? ''
  return JSON.parse(raw.replace(/```json|```/g, '').trim())
}
