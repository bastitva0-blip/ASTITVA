import { NextRequest } from 'next/server'
import { runAgentChat } from '@/lib/agent'
import { getActiveProvider } from '@/lib/llm'

export const maxDuration = 45

export async function POST(req: NextRequest) {
  const { message, report, history = [] } = await req.json()

  try {
    const { reply, trace } = await runAgentChat(message, report, history.slice(-6))
    return Response.json({ reply, trace, provider: getActiveProvider() })
  } catch (err) {
    return Response.json({
      reply: `No LLM provider available. Add NVIDIA_API_KEY or GROQ_API_KEY to .env.local.`,
      trace: [],
      error: String(err),
    })
  }
}
