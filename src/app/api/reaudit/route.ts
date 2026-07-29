import { NextRequest } from 'next/server'
import { scrapeUrl } from '@/lib/scraper'

const NVIDIA_BASE = 'https://integrate.api.nvidia.com/v1'

type Section = 'tone' | 'positioning' | 'claims' | 'strengths'

const SECTION_PROMPTS: Record<Section, string> = {
  tone: `Re-analyze ONLY the brand tone and voice. Return JSON:
{"primaryTone":"string","toneCharacteristics":["a","b","c"]}`,
  positioning: `Re-analyze ONLY the brand positioning. Return JSON:
{"targetAudience":"string","valueProposition":"string","marketPosition":"string"}`,
  claims: `Extract ONLY the explicit brand claims and promises. Return JSON:
{"brandClaims":["claim1","claim2","claim3"]}`,
  strengths: `Re-analyze ONLY strengths and weaknesses. Return JSON:
{"strengths":[{"point":"title","detail":"explanation"},{"point":"title","detail":"explanation"},{"point":"title","detail":"explanation"}],"weaknesses":[{"point":"title","detail":"explanation"},{"point":"title","detail":"explanation"},{"point":"title","detail":"explanation"}]}`,
}

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const { url, section } = await req.json() as { url: string; section: Section }

  if (!SECTION_PROMPTS[section]) {
    return Response.json({ error: 'Invalid section' }, { status: 400 })
  }

  const content = await scrapeUrl(url)

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
        { role: 'user', content: `${SECTION_PROMPTS[section]}\n\nBrand content from ${url}:\n${content.slice(0, 6000)}` },
      ],
      temperature: 0.1,
      max_tokens: 600,
    }),
  })

  if (!res.ok) return Response.json({ error: `NIM error ${res.status}` }, { status: 500 })
  const data = await res.json()
  const raw = data.choices?.[0]?.message?.content ?? ''
  const result = JSON.parse(raw.replace(/```json|```/g, '').trim())
  return Response.json({ section, data: result })
}
