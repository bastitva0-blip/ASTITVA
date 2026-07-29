'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Logo } from './Logo'
import type { AuditReport } from '@/lib/types'

/* ── Animated counter ── */
function CountUp({ target, duration = 1400 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let current = 0
    const step = target / (duration / 16)
    const t = setInterval(() => {
      current += step
      if (current >= target) { setVal(target); clearInterval(t) }
      else setVal(Math.floor(current))
    }, 16)
    return () => clearInterval(t)
  }, [target, duration, inView])

  return <span ref={ref}>{val}</span>
}

/* ── SVG Score Ring ── */
function ScoreRing({ score }: { score: number }) {
  const size = 160
  const sw = 10
  const r = (size - sw) / 2
  const circ = 2 * Math.PI * r
  const [offset, setOffset] = useState(circ)

  useEffect(() => {
    const t = setTimeout(() => setOffset(circ - (score / 100) * circ), 400)
    return () => clearTimeout(t)
  }, [score, circ])

  return (
    <div className="relative flex items-center justify-center flex-shrink-0">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="rgba(255,255,255,0.05)" strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="url(#rg)" strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-4xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          <CountUp target={score} />
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>/ 100</p>
      </div>
    </div>
  )
}

/* ── Per-metric color config ── */
const METRICS = {
  Clarity:        { color: '#60a5fa', bg: 'rgba(96,165,250,0.07)',  border: 'rgba(96,165,250,0.2)',  icon: '◈', key: 'clarity' },
  Consistency:    { color: '#34d399', bg: 'rgba(52,211,153,0.07)',  border: 'rgba(52,211,153,0.2)',  icon: '◎', key: 'consistency' },
  Differentiation:{ color: '#a78bfa', bg: 'rgba(167,139,250,0.07)', border: 'rgba(167,139,250,0.2)', icon: '◆', key: 'differentiation' },
  Trust:          { color: '#fbbf24', bg: 'rgba(251,191,36,0.07)',  border: 'rgba(251,191,36,0.2)',  icon: '◉', key: 'trust' },
} as const

function MetricCard({ label, value }: { label: keyof typeof METRICS; value: number }) {
  const m = METRICS[label]
  const tag = value >= 80 ? 'Strong' : value >= 60 ? 'Good' : 'Weak'
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="rounded-xl border p-4"
      style={{ background: m.bg, borderColor: m.border }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg" style={{ color: m.color }}>{m.icon}</span>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: `${m.color}15`, color: m.color, border: `1px solid ${m.color}28` }}>
          {tag}
        </span>
      </div>
      <p className="text-2xl font-bold mb-0.5" style={{ color: m.color }}>
        <CountUp target={value} />
      </p>
      <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div className="h-full rounded-full" style={{ background: m.color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }} />
      </div>
    </motion.div>
  )
}

/* ── Section card with scroll-triggered animation ── */
function Section({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay, ease: 'easeOut' }}
      className="rounded-2xl border p-5"
      style={{ background: 'var(--color-bg-secondary)', borderColor: 'rgba(255,255,255,0.06)' }}
    >
      <h3 className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: 'var(--color-text-tertiary)' }}>
        {title}
      </h3>
      {children}
    </motion.div>
  )
}

const PRIORITY = {
  high:   { color: '#ef4444', bg: 'rgba(239,68,68,0.06)',   border: 'rgba(239,68,68,0.25)' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.06)',  border: 'rgba(245,158,11,0.25)' },
  low:    { color: '#10b981', bg: 'rgba(16,185,129,0.06)',  border: 'rgba(16,185,129,0.25)' },
}

/* ── Main component ── */
interface ReportViewProps {
  report: AuditReport
  onReset: () => void
}

export default function ReportView({ report, onReset }: ReportViewProps) {
  const { scores } = report

  const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } },
  }
  const card = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 28 } },
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>

      {/* ── Topbar ── */}
      <div
        className="sticky top-0 z-50 border-b px-6 py-3 flex items-center justify-between backdrop-blur-md"
        style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(9,9,14,0.88)' }}
      >
        <div className="flex items-center gap-3">
          <Logo size={28} />
          <span style={{ color: 'rgba(255,255,255,0.18)' }}>/</span>
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            {report.companyName}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={onReset}>← New Audit</Button>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            <span className="gradient-text">{report.companyName}</span>
            <span style={{ color: 'var(--color-text-primary)' }}> Brand Audit</span>
          </h1>
          <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            {report.summary}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{report.url}</p>
        </motion.div>

        {/* ── Metric cards ── */}
        <motion.div variants={stagger} initial="hidden" animate="show"
          className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(Object.entries(METRICS) as [keyof typeof METRICS, typeof METRICS[keyof typeof METRICS]][]).map(([label, m]) => (
            <motion.div key={label} variants={card}>
              <MetricCard label={label} value={scores[m.key as keyof typeof scores] as number} />
            </motion.div>
          ))}
        </motion.div>

        {/* ── Overall health ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl border p-6 flex items-center gap-8 flex-wrap"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.07) 0%, rgba(37,99,235,0.05) 100%)',
            borderColor: 'rgba(124,58,237,0.18)',
          }}
        >
          <ScoreRing score={scores.overall} />
          <div>
            <p className="text-xs uppercase tracking-widest mb-1"
               style={{ color: 'var(--color-text-tertiary)' }}>
              Overall Brand Health
            </p>
            <p className="text-xl font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              {scores.overall >= 70
                ? 'Brand is performing well'
                : scores.overall >= 50
                  ? 'Brand has room to grow'
                  : 'Brand needs attention'}
            </p>
            <span
              className="text-xs px-3 py-1.5 rounded-full font-semibold"
              style={{
                background: scores.overall >= 70 ? 'rgba(16,185,129,0.1)' : scores.overall >= 50 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                color: scores.overall >= 70 ? '#10b981' : scores.overall >= 50 ? '#f59e0b' : '#ef4444',
                border: `1px solid ${scores.overall >= 70 ? 'rgba(16,185,129,0.28)' : scores.overall >= 50 ? 'rgba(245,158,11,0.28)' : 'rgba(239,68,68,0.28)'}`,
              }}
            >
              {scores.overall >= 70 ? '✦ Healthy' : scores.overall >= 50 ? '◈ Developing' : '◎ Needs Work'}
            </span>
          </div>
        </motion.div>

        {/* ── 2-col sections ── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          <Section title="Tone & Voice" delay={0.1}>
            <div className="space-y-4">
              <div>
                <p className="text-xs mb-2" style={{ color: 'var(--color-text-tertiary)' }}>Primary</p>
                <span className="text-sm px-3 py-1.5 rounded-full font-medium inline-block"
                      style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', color: '#a78bfa' }}>
                  {report.tone.primary}
                </span>
              </div>
              <div>
                <p className="text-xs mb-2" style={{ color: 'var(--color-text-tertiary)' }}>Characteristics</p>
                <div className="flex flex-wrap gap-2">
                  {report.tone.characteristics.map((c) => (
                    <span key={c} className="text-xs px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-text-secondary)' }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section title="Positioning" delay={0.15}>
            <div className="space-y-4">
              {[
                ['Audience', report.positioning.targetAudience],
                ['Value Prop', report.positioning.valueProposition],
                ['Position', report.positioning.marketPosition],
              ].map(([l, v]) => (
                <div key={l}>
                  <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--color-text-tertiary)' }}>{l}</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{v}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Strengths" delay={0.2}>
            <div className="space-y-3">
              {report.strengths.map((s, i) => (
                <div key={i} className="flex gap-3">
                  <span className="flex-shrink-0 text-sm mt-0.5" style={{ color: '#34d399' }}>↑</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{s.point}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Weaknesses" delay={0.25}>
            <div className="space-y-3">
              {report.weaknesses.map((w, i) => (
                <div key={i} className="flex gap-3">
                  <span className="flex-shrink-0 text-sm mt-0.5" style={{ color: '#f87171' }}>↓</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{w.point}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{w.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ── Brand claims ── */}
        {report.claims.length > 0 && (
          <Section title="Brand Claims" delay={0.3}>
            <div className="flex flex-wrap gap-2">
              {report.claims.map((c, i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-full italic"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'var(--color-text-secondary)' }}>
                  "{c}"
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* ── Recommendations ── */}
        <Section title="Strategic Recommendations" delay={0.35}>
          <div className="space-y-3">
            {report.recommendations.map((rec, i) => {
              const p = PRIORITY[rec.priority]
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.07 }}
                  className="flex rounded-xl overflow-hidden border"
                  style={{ borderColor: p.border }}
                >
                  <div className="w-1 flex-shrink-0" style={{ background: p.color }} />
                  <div className="flex-1 p-4" style={{ background: p.bg }}>
                    <div className="flex items-start gap-3">
                      <span className="text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wide flex-shrink-0 mt-0.5"
                            style={{ background: `${p.color}20`, color: p.color }}>
                        {rec.priority}
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-1"
                           style={{ color: 'var(--color-text-tertiary)' }}>
                          {rec.area}
                        </p>
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {rec.action}
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                          Impact: {rec.impact}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </Section>

        {/* ── Footer ── */}
        <div className="text-center pb-12 pt-2 flex flex-col items-center gap-3">
          <Logo size={30} />
          <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            Built with{' '}
            <a href="https://shilp-sutra.devalok.in" target="_blank"
               className="underline underline-offset-2" style={{ color: '#a78bfa' }}>
              Shilp Sutra
            </a>
            {' '}by{' '}
            <a href="https://devalok.in" target="_blank"
               className="underline underline-offset-2" style={{ color: '#a78bfa' }}>
              Devalok
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
