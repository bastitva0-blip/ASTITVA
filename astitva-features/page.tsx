'use client'

import { useState } from 'react'
import InputView from '@/components/InputView'
import LoadingView from '@/components/LoadingView'
import ReportView from '@/components/ReportView'
import CompareView from '@/components/CompareView'
import type { AuditReport, StepState } from '@/lib/types'
import { DEVALOK_MOCK } from '@/lib/mock'

type AppState = 'idle' | 'loading' | 'complete' | 'comparing' | 'compared' | 'error'

const DEFAULT_STEPS: StepState = { scrape: 'pending', analyze: 'pending', synthesize: 'pending' }
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export default function Home() {
  const [state, setState] = useState<AppState>('idle')
  const [steps, setSteps] = useState<StepState>(DEFAULT_STEPS)
  const [report, setReport] = useState<AuditReport | null>(null)
  const [compareReports, setCompareReports] = useState<[AuditReport, AuditReport] | null>(null)
  const [error, setError] = useState('')
  const [auditUrl, setAuditUrl] = useState('')

  const reset = () => {
    setState('idle'); setReport(null); setCompareReports(null)
    setError(''); setAuditUrl(''); setSteps(DEFAULT_STEPS)
  }

  /* ── Single audit ── */
  const handleAudit = async (url: string) => {
    setAuditUrl(url); setState('loading'); setSteps(DEFAULT_STEPS); setError('')
    try {
      const res = await fetch('/api/audit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      if (!res.ok || !res.body) throw new Error(`Request failed: ${res.status}`)
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        for (const line of decoder.decode(value, { stream: true }).split('\n')) {
          if (!line.startsWith('data: ')) continue
          try {
            const ev = JSON.parse(line.slice(6))
            if (ev.type === 'step') setSteps(p => ({ ...p, [ev.step]: ev.status }))
            else if (ev.type === 'complete') { setReport(ev.report); setState('complete') }
            else if (ev.type === 'error') { setError(ev.message); setState('error') }
          } catch { /* skip */ }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err)); setState('error')
    }
  }

  /* ── Test mode ── */
  const handleTestMode = async () => {
    setAuditUrl('https://devalok.in'); setState('loading'); setSteps(DEFAULT_STEPS)
    setSteps(p => ({ ...p, scrape: 'running' })); await sleep(1200)
    setSteps(p => ({ ...p, scrape: 'done', analyze: 'running' })); await sleep(1800)
    setSteps(p => ({ ...p, analyze: 'done', synthesize: 'running' })); await sleep(1400)
    setSteps(p => ({ ...p, synthesize: 'done' })); await sleep(300)
    setReport(DEVALOK_MOCK); setState('complete')
  }

  /* ── Compare mode ── */
  const handleCompare = async (url1: string, url2: string) => {
    setAuditUrl(`${url1} vs ${url2}`); setState('comparing'); setSteps(DEFAULT_STEPS)
    try {
      const res = await fetch('/api/compare', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url1, url2 }),
      })
      if (!res.ok || !res.body) throw new Error(`Compare failed: ${res.status}`)
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        for (const line of decoder.decode(value, { stream: true }).split('\n')) {
          if (!line.startsWith('data: ')) continue
          try {
            const ev = JSON.parse(line.slice(6))
            if (ev.type === 'complete') {
              setCompareReports([ev.report1, ev.report2]); setState('compared')
            } else if (ev.type === 'error') {
              setError(ev.message); setState('error')
            }
          } catch { /* skip */ }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err)); setState('error')
    }
  }

  if (state === 'loading' || state === 'comparing') {
    return <LoadingView steps={steps} url={auditUrl} />
  }
  if (state === 'complete' && report) {
    return (
      <ReportView
        report={report}
        onReset={reset}
        onCompare={reset}
      />
    )
  }
  if (state === 'compared' && compareReports) {
    return <CompareView report1={compareReports[0]} report2={compareReports[1]} onReset={reset} />
  }
  return (
    <InputView
      onSubmit={handleAudit}
      onCompare={handleCompare}
      onTestMode={handleTestMode}
      error={error}
    />
  )
}
