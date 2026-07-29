'use client'

import { motion } from 'framer-motion'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Logo } from './Logo'
import type { AuditReport, ScoreSet } from '@/lib/types'

const METRICS: Array<{ key: keyof ScoreSet; label: string; color1: string; color2: string }> = [
  { key: 'clarity',        label: 'Clarity',         color1: '#60a5fa', color2: '#93c5fd' },
  { key: 'consistency',    label: 'Consistency',     color1: '#34d399', color2: '#6ee7b7' },
  { key: 'differentiation',label: 'Differentiation', color1: '#a78bfa', color2: '#c4b5fd' },
  { key: 'trust',          label: 'Trust',           color1: '#fbbf24', color2: '#fcd34d' },
]

function RadarChart({ r1, r2, label1, label2 }: { r1: ScoreSet; r2: ScoreSet; label1: string; label2: string }) {
  const size = 220
  const cx = size / 2
  const cy = size / 2
  const maxR = 80
  const keys: (keyof ScoreSet)[] = ['clarity', 'consistency', 'differentiation', 'trust']
  const n = keys.length

  const toPoint = (score: number, idx: number) => {
    const angle = (Math.PI * 2 * idx) / n - Math.PI / 2
    const r = (score / 100) * maxR
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  }

  const poly = (scores: ScoreSet, opacity: number, color: string) => {
    const pts = keys.map((k, i) => toPoint(scores[k], i))
    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z'
    return (
      <>
        <path d={d} fill={color} fillOpacity={opacity} stroke={color} strokeWidth="2" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} />
        ))}
      </>
    )
  }

  const gridLines = [25, 50, 75, 100].map(pct => {
    const pts = keys.map((_, i) => toPoint(pct, i))
    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z'
    return <path key={pct} d={d} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
  })

  const axisLines = keys.map((_, i) => {
    const p = toPoint(100, i)
    return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
  })

  const labels = keys.map((k, i) => {
    const p = toPoint(115, i)
    return (
      <text key={k} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
            fontSize="10" fill="rgba(255,255,255,0.4)">
        {k.charAt(0).toUpperCase() + k.slice(1, 3)}
      </text>
    )
  })

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size}>
        {gridLines}
        {axisLines}
        {poly(r1, 0.15, '#7c3aed')}
        {poly(r2, 0.15, '#D33163')}
        {labels}
      </svg>
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: '#7c3aed' }} />
          <span style={{ color: 'var(--color-text-secondary)' }}>{label1}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: '#D33163' }} />
          <span style={{ color: 'var(--color-text-secondary)' }}>{label2}</span>
        </div>
      </div>
    </div>
  )
}

interface CompareViewProps {
  report1: AuditReport
  report2: AuditReport
  onReset: () => void
}

export default function CompareView({ report1, report2, onReset }: CompareViewProps) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
      {/* Topbar */}
      <div className="sticky top-0 z-50 border-b px-6 py-3 flex items-center justify-between backdrop-blur-md"
           style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(9,9,14,0.88)' }}>
        <div className="flex items-center gap-3">
          <Logo size={28} />
          <span style={{ color: 'rgba(255,255,255,0.18)' }}>/</span>
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {report1.companyName} vs {report2.companyName}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={onReset}>← New Audit</Button>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Brand Comparison
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Side-by-side audit results
          </p>
        </motion.div>

        {/* Overall scores */}
        <div className="grid grid-cols-2 gap-4">
          {[report1, report2].map((r, idx) => (
            <motion.div key={r.url}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
              className="rounded-2xl border p-5"
              style={{
                borderColor: idx === 0 ? 'rgba(124,58,237,0.25)' : 'rgba(211,49,99,0.25)',
                background: idx === 0 ? 'rgba(124,58,237,0.05)' : 'rgba(211,49,99,0.05)',
              }}
            >
              <p className="text-xs uppercase tracking-widest mb-1"
                 style={{ color: idx === 0 ? '#a78bfa' : '#D33163' }}>
                Brand {idx + 1}
              </p>
              <p className="text-xl font-bold mb-0.5" style={{ color: 'var(--color-text-primary)' }}>
                {r.companyName}
              </p>
              <p className="text-xs mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
                {r.url.replace('https://', '')}
              </p>
              <p className="text-4xl font-bold" style={{ color: idx === 0 ? '#a78bfa' : '#D33163' }}>
                {r.scores.overall}
                <span className="text-sm font-normal ml-1" style={{ color: 'var(--color-text-tertiary)' }}>/ 100</span>
              </p>
            </motion.div>
          ))}
        </div>

        {/* Radar + score table */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Radar */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="rounded-2xl border p-5 flex items-center justify-center"
            style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--color-bg-secondary)' }}
          >
            <RadarChart
              r1={report1.scores} r2={report2.scores}
              label1={report1.companyName} label2={report2.companyName}
            />
          </motion.div>

          {/* Score table */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            className="rounded-2xl border p-5"
            style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--color-bg-secondary)' }}
          >
            <h3 className="text-xs uppercase tracking-widest mb-4"
                style={{ color: 'var(--color-text-tertiary)' }}>Score Breakdown</h3>
            <div className="space-y-3">
              {METRICS.map(m => {
                const v1 = report1.scores[m.key]
                const v2 = report2.scores[m.key]
                const diff = v1 - v2
                return (
                  <div key={m.key}>
                    <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                      <span>{m.label}</span>
                      <div className="flex gap-4">
                        <span style={{ color: '#a78bfa' }}>{v1}</span>
                        <span style={{ color: '#D33163' }}>{v2}</span>
                        <span style={{ color: diff > 0 ? '#10b981' : diff < 0 ? '#f87171' : 'var(--color-text-tertiary)', fontWeight: 600 }}>
                          {diff > 0 ? `+${diff}` : diff}
                        </span>
                      </div>
                    </div>
                    {/* Dual bar */}
                    <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <motion.div className="absolute left-0 top-0 h-full rounded-full opacity-70"
                        style={{ background: '#7c3aed' }}
                        initial={{ width: 0 }} animate={{ width: `${v1}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }} />
                      <motion.div className="absolute left-0 top-0 h-full rounded-full opacity-40"
                        style={{ background: '#D33163' }}
                        initial={{ width: 0 }} animate={{ width: `${v2}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* Summary comparison */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[report1, report2].map((r, idx) => (
            <motion.div key={r.url}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + idx * 0.1 }}
              className="rounded-2xl border p-5"
              style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--color-bg-secondary)' }}
            >
              <p className="text-xs uppercase tracking-widest mb-2"
                 style={{ color: idx === 0 ? '#a78bfa' : '#D33163' }}>
                {r.companyName}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {r.summary}
              </p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}
