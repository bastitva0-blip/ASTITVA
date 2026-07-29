'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { decodeReport } from '@/lib/share'
import ReportView from '@/components/ReportView'

function SharedReportInner() {
  const params = useSearchParams()
  const data = params.get('d')

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-primary)' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>No report data in URL.</p>
      </div>
    )
  }

  const report = decodeReport(data)

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-primary)' }}>
        <p style={{ color: 'var(--color-danger)' }}>Invalid or corrupted share link.</p>
      </div>
    )
  }

  return (
    <ReportView
      report={report}
      onReset={() => { window.location.href = '/' }}
      readOnly
    />
  )
}

export default function SharedReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-primary)' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading report...</p>
      </div>
    }>
      <SharedReportInner />
    </Suspense>
  )
}
