'use client'

import { useState } from 'react'
import InputView from '@/components/InputView'
import LoadingView from '@/components/LoadingView'
import ReportView from '@/components/ReportView'
import type { AuditReport, StepState } from '@/lib/types'
import { DEVALOK_MOCK } from '@/lib/mock'

type AppState = 'idle' | 'loading' | 'complete' | 'error'

const DEFAULT_STEPS: StepState = {
  scrape: 'pending',
  analyze: 'pending',
  synthesize: 'pending',
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export default function Home() {
  const [appState, setAppState] = useState<AppState>('idle')
  const [steps, setSteps] = useState<StepState>(DEFAULT_STEPS)
  const [report, setReport] = useState<AuditReport | null>(null)
  const [error, setError] = useState('')
  const [auditUrl, setAuditUrl] = useState('')

  /* ── Test mode — no API, fake loading ── */
  const handleTestMode = async () => {
    setAuditUrl('https://devalok.in')
    setAppState('loading')
    setSteps(DEFAULT_STEPS)
    setError('')
    setReport(null)

    setSteps((p) => ({ ...p, scrape: 'running' }))
    await sleep(1200)
    setSteps((p) => ({ ...p, scrape: 'done', analyze: 'running' }))
    await sleep(1800)
    setSteps((p) => ({ ...p, analyze: 'done', synthesize: 'running' }))
    await sleep(1400)
    setSteps((p) => ({ ...p, synthesize: 'done' }))
    await sleep(300)

    setReport(DEVALOK_MOCK)
    setAppState('complete')
  }

  /* ── Real mode — SSE pipeline ── */
  const handleAudit = async (url: string) => {
    setAuditUrl(url)
    setAppState('loading')
    setSteps(DEFAULT_STEPS)
    setError('')
    setReport(null)

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      if (!res.ok || !res.body) throw new Error(`Request failed: ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6))
            if (event.type === 'step') {
              setSteps((p) => ({ ...p, [event.step]: event.status }))
            } else if (event.type === 'complete') {
              setReport(event.report)
              setAppState('complete')
            } else if (event.type === 'error') {
              setError(event.message)
              setAppState('error')
            }
          } catch { /* skip malformed */ }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setAppState('error')
    }
  }

  const handleReset = () => {
    setAppState('idle')
    setReport(null)
    setError('')
    setAuditUrl('')
    setSteps(DEFAULT_STEPS)
  }

  if (appState === 'loading') return <LoadingView steps={steps} url={auditUrl} />
  if (appState === 'complete' && report) return <ReportView report={report} onReset={handleReset} />
  return <InputView onSubmit={handleAudit} onTestMode={handleTestMode} error={error} />
}
