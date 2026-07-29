import { NextRequest } from 'next/server'
import { runAuditPipeline } from '@/lib/pipeline'

export const maxDuration = 120

export async function POST(req: NextRequest) {
  const { url1, url2 } = await req.json()

  if (!url1 || !url2) {
    return Response.json({ error: 'Two URLs required' }, { status: 400 })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))

      try {
        send({ type: 'status', message: 'Running both audits in parallel...' })

        const [report1, report2] = await Promise.all([
          runAuditPipeline(url1, (step, status) =>
            send({ type: 'step', brand: 1, step, status })),
          runAuditPipeline(url2, (step, status) =>
            send({ type: 'step', brand: 2, step, status })),
        ])

        send({ type: 'complete', report1, report2 })
      } catch (err) {
        send({ type: 'error', message: err instanceof Error ? err.message : String(err) })
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
