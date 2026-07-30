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

// Loosened beyond {role, content} so tool-calling turns (tool_calls, tool_call_id, etc.)
// can flow through the same message array without a separate type.
type ChatMessage = Record<string, unknown>

export interface ToolDef {
  type: 'function'
  function: { name: string; description: string; parameters: Record<string, unknown> }
}

export interface ToolCall {
  id: string
  name: string
  arguments: string
}

export interface ToolCallResponse {
  content: string | null
  toolCalls: ToolCall[]
}

// Same provider fallback as callLLM, but requests tool-calling and returns
// the raw tool_calls instead of forcing a text-only reply.
export async function callLLMWithTools(
  messages: ChatMessage[],
  tools: ToolDef[],
  options: LLMOptions = {}
): Promise<ToolCallResponse> {
  const errors: string[] = []

  for (const provider of PROVIDERS) {
    const key = provider.getKey()
    if (!key) continue

    try {
      const res = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: provider.model,
          messages,
          temperature: options.temperature ?? 0.2,
          max_tokens: options.max_tokens ?? 700,
          tools,
          tool_choice: 'auto',
        }),
      })

      if (!res.ok) {
        errors.push(`${provider.name}: ${res.status}`)
        continue
      }

      const data = await res.json()
      const msg = data.choices?.[0]?.message
      if (!msg) { errors.push(`${provider.name}: empty response`); continue }

      return {
        content: msg.content ?? null,
        toolCalls: (msg.tool_calls || []).map((tc: { id: string; function: { name: string; arguments: string } }) => ({
          id: tc.id,
          name: tc.function.name,
          arguments: tc.function.arguments,
        })),
      }
    } catch (e) {
      errors.push(`${provider.name}: ${String(e)}`)
      continue
    }
  }

  throw new Error(`All LLM providers failed: ${errors.join(' | ')}. Set NVIDIA_API_KEY or GROQ_API_KEY.`)
}

export async function callLLM(
  messages: ChatMessage[],
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
