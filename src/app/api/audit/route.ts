import { NextRequest } from 'next/server'
import { runAuditPipeline } from '@/lib/pipeline'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { url } = body

  if (!url || typeof url !== 'string') {
    return Response.json({ error: 'URL required' }, { status: 400 })
  }

  // Validate URL
  try {
    new URL(url)
  } catch {
    return Response.json({ error: 'Invalid URL' }, { status: 400 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        const report = await runAuditPipeline(url, (step, status) => {
          send({ type: 'step', step, status })
        })
        send({ type: 'complete', report })
      } catch (err) {
        send({
          type: 'error',
          message: err instanceof Error ? err.message : String(err),
        })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
