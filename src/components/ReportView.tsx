'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Logo } from './Logo'
import EcosystemSection from './EcosystemSection'
import ChatPanel from './ChatPanel'
import HistoryPanel from './HistoryPanel'
import { copyShareUrl } from '@/lib/share'
import { saveToHistory } from '@/lib/history'
import type { AuditReport } from '@/lib/types'

/* ── Animated counter ── */
function CountUp({ target, duration = 1400 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    let cur = 0
    const step = target / (duration / 16)
    const t = setInterval(() => {
      cur += step
      if (cur >= target) { setVal(target); clearInterval(t) }
      else setVal(Math.floor(cur))
    }, 16)
    return () => clearInterval(t)
  }, [target, duration, inView])
  return <span ref={ref}>{val}</span>
}

/* ── Score ring ── */
function ScoreRing({ score }: { score: number }) {
  const size = 160, sw = 10
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
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#rg)" strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-4xl font-bold" style={{ color: 'var(--color-text-primary)' }}><CountUp target={score} /></p>
        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>/ 100</p>
      </div>
    </div>
  )
}

const METRICS = {
  Clarity:         { color: '#60a5fa', bg: 'rgba(96,165,250,0.07)',  border: 'rgba(96,165,250,0.2)',  icon: '◈', key: 'clarity' },
  Consistency:     { color: '#34d399', bg: 'rgba(52,211,153,0.07)',  border: 'rgba(52,211,153,0.2)',  icon: '◎', key: 'consistency' },
  Differentiation: { color: '#a78bfa', bg: 'rgba(167,139,250,0.07)', border: 'rgba(167,139,250,0.2)', icon: '◆', key: 'differentiation' },
  Trust:           { color: '#fbbf24', bg: 'rgba(251,191,36,0.07)',  border: 'rgba(251,191,36,0.2)',  icon: '◉', key: 'trust' },
} as const

function MetricCard({ label, value }: { label: keyof typeof METRICS; value: number }) {
  const m = METRICS[label]
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 300 }}
      className="rounded-xl border p-4" style={{ background: m.bg, borderColor: m.border }}>
      <div className="flex items-center justify-between mb-3">
        <span style={{ color: m.color }}>{m.icon}</span>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: `${m.color}15`, color: m.color, border: `1px solid ${m.color}28` }}>
          {value >= 80 ? 'Strong' : value >= 60 ? 'Good' : 'Weak'}
        </span>
      </div>
      <p className="text-2xl font-bold mb-0.5" style={{ color: m.color }}><CountUp target={value} /></p>
      <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div className="h-full rounded-full" style={{ background: m.color }}
          initial={{ width: 0 }} animate={{ width: `${value}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }} />
      </div>
    </motion.div>
  )
}

function Section({ title, children, delay = 0, onReaudit }: {
  title: string; children: React.ReactNode; delay?: number; onReaudit?: () => void
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [reauditing, setReauditing] = useState(false)
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay, ease: 'easeOut' }}
      className="rounded-2xl border p-5"
      style={{ background: 'var(--color-bg-secondary)', borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--color-text-tertiary)' }}>{title}</h3>
        {onReaudit && (
          <button onClick={async () => { setReauditing(true); await onReaudit(); setReauditing(false) }}
                  disabled={reauditing}
                  className="text-xs px-2 py-0.5 rounded-md transition-opacity hover:opacity-60 disabled:opacity-30 no-print"
                  style={{ color: '#a78bfa', border: '1px solid rgba(124,58,237,0.2)', background: 'transparent' }}>
            {reauditing ? '...' : '↺ Re-analyze'}
          </button>
        )}
      </div>
      {children}
    </motion.div>
  )
}

const PRIORITY = {
  high:   { color: '#ef4444', bg: 'rgba(239,68,68,0.06)',   border: 'rgba(239,68,68,0.25)' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.06)',  border: 'rgba(245,158,11,0.25)' },
  low:    { color: '#10b981', bg: 'rgba(16,185,129,0.06)',  border: 'rgba(16,185,129,0.25)' },
}

interface ReportViewProps {
  report: AuditReport
  onReset: () => void
  onCompare?: () => void
  onAuditUrl?: (url: string) => void
  readOnly?: boolean
}

export default function ReportView({ report, onReset, onCompare, onAuditUrl, readOnly }: ReportViewProps) {
  const [currentReport, setCurrentReport] = useState(report)
  const [shareMsg, setShareMsg] = useState('')
  const { scores } = currentReport

  // Save to history on mount
  useEffect(() => { saveToHistory(report) }, [report])

  const handleShare = async () => {
    const url = await copyShareUrl(currentReport)
    setShareMsg('Link copied!')
    setTimeout(() => setShareMsg(''), 2500)
  }

  const handleReaudit = async (section: 'tone' | 'positioning' | 'claims' | 'strengths') => {
    try {
      const res = await fetch('/api/reaudit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: currentReport.url, section }),
      })
      const { data } = await res.json()
      setCurrentReport(prev => {
        if (section === 'tone') return { ...prev, tone: { primary: data.primaryTone, characteristics: data.toneCharacteristics } }
        if (section === 'positioning') return { ...prev, positioning: data }
        if (section === 'claims') return { ...prev, claims: data.brandClaims }
        if (section === 'strengths') return { ...prev, strengths: data.strengths, weaknesses: data.weaknesses }
        return prev
      })
    } catch { /* fail silently */ }
  }

  const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }
  const card = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 28 } } }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>

      {/* ── Topbar ── */}
      <div className="sticky top-0 z-50 border-b px-4 py-3 flex items-center justify-between gap-2 flex-wrap backdrop-blur-md no-print"
           style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(9,9,14,0.9)' }}>
        <div className="flex items-center gap-3 min-w-0">
          <Logo size={26} />
          <span style={{ color: 'rgba(255,255,255,0.15)' }}>/</span>
          <span className="text-sm font-medium truncate" style={{ color: 'var(--color-text-secondary)' }}>
            {currentReport.companyName}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* PDF */}
          <button onClick={() => window.print()}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-75"
                  style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-text-secondary)', background: 'transparent' }}>
            ↓ PDF
          </button>
          {/* Share */}
          <button onClick={handleShare}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-75"
                  style={{ border: '1px solid rgba(124,58,237,0.25)', color: '#a78bfa', background: 'rgba(124,58,237,0.06)' }}>
            {shareMsg || '🔗 Share'}
          </button>
          {/* History */}
          {!readOnly && onAuditUrl && <HistoryPanel onAuditUrl={onAuditUrl} />}
          {/* Compare */}
          {!readOnly && onCompare && (
            <button onClick={onCompare}
                    className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-75"
                    style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-text-secondary)', background: 'transparent' }}>
              ↔ Compare
            </button>
          )}
          <Button variant="outline" size="sm" onClick={onReset}>← New Audit</Button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            <span className="gradient-text">{currentReport.companyName}</span>
            <span style={{ color: 'var(--color-text-primary)' }}> Brand Audit</span>
          </h1>
          <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            {currentReport.summary}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{currentReport.url}</p>
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
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }}
          className="rounded-2xl border p-6 flex items-center gap-8 flex-wrap"
          style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.07) 0%,rgba(37,99,235,0.05) 100%)', borderColor: 'rgba(124,58,237,0.18)' }}>
          <ScoreRing score={scores.overall} />
          <div>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
              Overall Brand Health
            </p>
            <p className="text-xl font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              {scores.overall >= 70 ? 'Brand is performing well'
                : scores.overall >= 50 ? 'Brand has room to grow'
                : 'Brand needs attention'}
            </p>
            <span className="text-xs px-3 py-1.5 rounded-full font-semibold"
              style={{
                background: scores.overall >= 70 ? 'rgba(16,185,129,0.1)' : scores.overall >= 50 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                color: scores.overall >= 70 ? '#10b981' : scores.overall >= 50 ? '#f59e0b' : '#ef4444',
                border: `1px solid ${scores.overall >= 70 ? 'rgba(16,185,129,0.28)' : scores.overall >= 50 ? 'rgba(245,158,11,0.28)' : 'rgba(239,68,68,0.28)'}`,
              }}>
              {scores.overall >= 70 ? '✦ Healthy' : scores.overall >= 50 ? '◈ Developing' : '◎ Needs Work'}
            </span>
          </div>
        </motion.div>

        {/* ── Visual audit ── (if available) */}
        {currentReport.visualAudit && (
          <Section title="Visual Audit" delay={0.05}>
            {currentReport.visualAudit.screenshotUrl && (
              <img src={currentReport.visualAudit.screenshotUrl} alt="Website screenshot"
                   className="w-full rounded-xl mb-4 object-cover" style={{ maxHeight: '240px' }} />
            )}
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl font-bold" style={{ color: '#a78bfa' }}>
                <CountUp target={currentReport.visualAudit.score} />
                <span className="text-sm font-normal ml-1" style={{ color: 'var(--color-text-tertiary)' }}>/100</span>
              </div>
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Visual Design Score</span>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <p className="text-xs mb-2" style={{ color: 'var(--color-text-tertiary)' }}>Findings</p>
                {currentReport.visualAudit.findings.map((f, i) => (
                  <div key={i} className="flex gap-2 mb-1.5">
                    <span style={{ color: '#f87171' }}>↓</span>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{f}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs mb-2" style={{ color: 'var(--color-text-tertiary)' }}>Suggestions</p>
                {currentReport.visualAudit.suggestions.map((s, i) => (
                  <div key={i} className="flex gap-2 mb-1.5">
                    <span style={{ color: '#34d399' }}>↑</span>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{s}</p>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* ── 2-col sections ── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Section title="Tone & Voice" delay={0.1} onReaudit={() => handleReaudit('tone')}>
            <div className="space-y-4">
              <div>
                <p className="text-xs mb-2" style={{ color: 'var(--color-text-tertiary)' }}>Primary</p>
                <span className="text-sm px-3 py-1.5 rounded-full font-medium inline-block"
                      style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', color: '#a78bfa' }}>
                  {currentReport.tone.primary}
                </span>
              </div>
              <div>
                <p className="text-xs mb-2" style={{ color: 'var(--color-text-tertiary)' }}>Characteristics</p>
                <div className="flex flex-wrap gap-2">
                  {currentReport.tone.characteristics.map(c => (
                    <span key={c} className="text-xs px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-text-secondary)' }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section title="Positioning" delay={0.15} onReaudit={() => handleReaudit('positioning')}>
            <div className="space-y-4">
              {[
                ['Audience', currentReport.positioning.targetAudience],
                ['Value Prop', currentReport.positioning.valueProposition],
                ['Position', currentReport.positioning.marketPosition],
              ].map(([l, v]) => (
                <div key={l}>
                  <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--color-text-tertiary)' }}>{l}</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{v}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Strengths" delay={0.2} onReaudit={() => handleReaudit('strengths')}>
            <div className="space-y-3">
              {currentReport.strengths.map((s, i) => (
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
              {currentReport.weaknesses.map((w, i) => (
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
        {currentReport.claims.length > 0 && (
          <Section title="Brand Claims" delay={0.3} onReaudit={() => handleReaudit('claims')}>
            <div className="flex flex-wrap gap-2">
              {currentReport.claims.map((c, i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-full italic"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'var(--color-text-secondary)' }}>
                  &ldquo;{c}&rdquo;
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* ── Recommendations ── */}
        <Section title="Strategic Recommendations" delay={0.35}>
          <div className="space-y-3">
            {currentReport.recommendations.map((rec, i) => {
              const p = PRIORITY[rec.priority]
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.07 }}
                  className="flex rounded-xl overflow-hidden border" style={{ borderColor: p.border }}>
                  <div className="w-1 flex-shrink-0" style={{ background: p.color }} />
                  <div className="flex-1 p-4" style={{ background: p.bg }}>
                    <div className="flex items-start gap-3">
                      <span className="text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wide flex-shrink-0 mt-0.5"
                            style={{ background: `${p.color}20`, color: p.color }}>
                        {rec.priority}
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-1"
                           style={{ color: 'var(--color-text-tertiary)' }}>{rec.area}</p>
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{rec.action}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>Impact: {rec.impact}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </Section>

        {/* ── Competitor benchmark ── (if available) */}
        {currentReport.competitorBenchmark && currentReport.competitorBenchmark.length > 0 && (
          <Section title="Competitor Benchmark" delay={0.4}>
            <div className="space-y-4">
              {/* Header row */}
              <div className="grid gap-2" style={{ gridTemplateColumns: '1fr repeat(3, 60px) 60px' }}>
                <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Brand</span>
                {['Clarity', 'Diff.', 'Trust'].map(l => (
                  <span key={l} className="text-xs text-center" style={{ color: 'var(--color-text-tertiary)' }}>{l}</span>
                ))}
                <span className="text-xs text-center" style={{ color: 'var(--color-text-tertiary)' }}>Overall</span>
              </div>
              {/* Subject row */}
              {[currentReport, ...currentReport.competitorBenchmark].map((b, i) => {
                const isSubject = i === 0
                const scores = 'scores' in b ? b.scores : (b as { scores: typeof currentReport.scores }).scores
                return (
                  <div key={i} className="grid gap-2 items-center py-2 rounded-lg px-2"
                       style={{ gridTemplateColumns: '1fr repeat(3, 60px) 60px', background: isSubject ? 'rgba(124,58,237,0.06)' : 'transparent' }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: isSubject ? '#a78bfa' : 'var(--color-text-primary)' }}>
                        {isSubject ? currentReport.companyName : (b as { companyName: string }).companyName}
                        {isSubject && <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}>you</span>}
                      </p>
                    </div>
                    {[scores.clarity, scores.differentiation, scores.trust].map((v, j) => (
                      <p key={j} className="text-sm text-center font-semibold"
                         style={{ color: isSubject ? '#a78bfa' : 'var(--color-text-secondary)' }}>{v}</p>
                    ))}
                    <p className="text-sm text-center font-bold"
                       style={{ color: isSubject ? '#a78bfa' : 'var(--color-text-secondary)' }}>
                      {scores.overall}
                    </p>
                  </div>
                )
              })}
            </div>
          </Section>
        )}

        {/* ── Ecosystem ── */}
        <EcosystemSection />

        {/* ── Footer ── */}
        <div className="text-center pb-12 pt-2 flex flex-col items-center gap-3">
          <Logo size={30} />
          <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            Built with{' '}
            <a href="https://shilp-sutra.devalok.in" target="_blank"
               className="underline underline-offset-2" style={{ color: '#a78bfa' }}>Shilp Sutra</a>
            {' '}by{' '}
            <a href="https://devalok.in" target="_blank"
               className="underline underline-offset-2" style={{ color: '#a78bfa' }}>Devalok</a>
          </p>
        </div>
      </main>

      {/* ── Chat panel — floating ── */}
      {!readOnly && <ChatPanel report={currentReport} />}
    </div>
  )
}