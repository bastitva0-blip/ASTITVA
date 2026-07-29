'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getHistory, clearHistory } from '@/lib/history'
import type { HistoryEntry } from '@/lib/types'

function Delta({ val }: { val: number }) {
  if (val === 0) return null
  return (
    <span className="text-xs font-semibold ml-1"
          style={{ color: val > 0 ? '#10b981' : '#f87171' }}>
      {val > 0 ? `+${val}` : val}
    </span>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return `${diff}d ago`
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

interface HistoryPanelProps {
  onReaudit: (url: string) => void
}

export default function HistoryPanel({ onReaudit }: HistoryPanelProps) {
  const [open, setOpen] = useState(false)
  const [entries, setEntries] = useState<HistoryEntry[]>([])

  const openPanel = () => {
    setEntries(getHistory())
    setOpen(true)
  }

  const handleClear = () => {
    clearHistory()
    setEntries([])
  }

  return (
    <>
      <button
        onClick={openPanel}
        className="no-print text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-75"
        style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-text-secondary)', background: 'transparent' }}
      >
        ⟳ History
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed left-0 top-0 h-full z-50 flex flex-col"
              style={{ width: 'min(360px,100vw)', background: 'var(--color-bg-secondary)', borderRight: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="px-5 py-4 border-b flex items-center justify-between"
                   style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  Audit History
                </p>
                <div className="flex gap-3 items-center">
                  {entries.length > 0 && (
                    <button onClick={handleClear} className="text-xs"
                            style={{ color: 'var(--color-danger)' }}>
                      Clear
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="text-lg"
                          style={{ color: 'var(--color-text-tertiary)' }}>✕</button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {entries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-2">
                    <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                      No audits yet
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                      Run your first audit to see history
                    </p>
                  </div>
                ) : (
                  entries.map((entry, i) => {
                    const prev = entries[i + 1]
                    const delta = prev && prev.url === entry.url
                      ? entry.scores.overall - prev.scores.overall
                      : null
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="rounded-xl border p-4 cursor-pointer transition-all hover:border-opacity-60"
                        style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
                        onClick={() => { onReaudit(entry.url); setOpen(false) }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                              {entry.companyName}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                              {entry.url.replace('https://', '')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold" style={{ color: '#a78bfa' }}>
                              {entry.scores.overall}
                              {delta !== null && <Delta val={delta} />}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                              {formatDate(entry.date)}
                            </p>
                          </div>
                        </div>
                        {/* Mini score bars */}
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            ['C', entry.scores.clarity, '#60a5fa'],
                            ['Co', entry.scores.consistency, '#34d399'],
                            ['D', entry.scores.differentiation, '#a78bfa'],
                            ['T', entry.scores.trust, '#fbbf24'],
                          ].map(([label, val, color]) => (
                            <div key={label as string}>
                              <div className="flex justify-between mb-0.5">
                                <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{label}</span>
                                <span className="text-xs" style={{ color: color as string }}>{val}</span>
                              </div>
                              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <div className="h-full rounded-full" style={{ width: `${val}%`, background: color as string }} />
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs mt-2" style={{ color: '#a78bfa' }}>
                          Click to re-audit →
                        </p>
                      </motion.div>
                    )
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
