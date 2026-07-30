// Multi-provider LLM orchestration: NVIDIA NIM → Groq fallback
// This is the "orchestration angle" — same prompt, best available model

const PROVIDERS = [
  {
    name: 'NVIDIA NIM',
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    getKey: () => process.env.NVIDIA_API_KEY,
    model: 'meta/llama-3.1-70b-instruct',
  },
  {
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    getKey: () => process.env.GROQ_API_KEY,
    model: 'llama-3.3-70b-versatile',
  },
]

interface LLMOptions {
  max_tokens?: number
  temperature?: number
  json?: boolean
}

export async function callLLM(
  messages: Array<{ role: string; content: string }>,
  options: LLMOptions = {}
): Promise<string> {
  const errors: string[] = []

  for (const provider of PROVIDERS) {
    const key = provider.getKey()
    if (!key) continue

    try {
      const body: Record<string, unknown> = {
        model: provider.model,
        messages,
        temperature: options.temperature ?? 0.1,
        max_tokens: options.max_tokens ?? 2000,
      }

      // JSON mode
      if (options.json) {
        body.response_format = { type: 'json_object' }
      }

      const res = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        errors.push(`${provider.name}: ${res.status}`)
        continue
      }

      const data = await res.json()
      const content = data.choices?.[0]?.message?.content ?? ''
      if (!content) { errors.push(`${provider.name}: empty response`); continue }
      return content

    } catch (e) {
      errors.push(`${provider.name}: ${String(e)}`)
      continue
    }
  }

  throw new Error(`All LLM providers failed: ${errors.join(' | ')}. Set NVIDIA_API_KEY or GROQ_API_KEY.`)
}

// Convenience: call and parse JSON response
export async function callLLMJson<T>(
  messages: Array<{ role: string; content: string }>,
  options: LLMOptions = {}
): Promise<T> {
  const raw = await callLLM(messages, { ...options, json: true })
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean) as T
}

export function getActiveProvider(): string {
  if (process.env.NVIDIA_API_KEY) return 'NVIDIA NIM'
  if (process.env.GROQ_API_KEY) return 'Groq'
  return 'None'
}
