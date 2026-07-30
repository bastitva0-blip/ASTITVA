'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getHistory, clearHistory } from '@/lib/history'
import type { HistoryEntry } from '@/lib/types'

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
  onAuditUrl: (url: string) => void
}

export default function HistoryPanel({ onAuditUrl }: HistoryPanelProps) {
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

  const handleSelect = (url: string) => {
    setOpen(false)
    onAuditUrl(url)
  }

  return (
    <>
      <button
        onClick={openPanel}
        className="no-print text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-75"
        style={{
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'var(--color-text-secondary)',
          background: 'transparent',
        }}
      >
        ⟳ History
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0"
              style={{ zIndex: 9998, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed left-0 top-0 h-screen flex flex-col"
              style={{
                zIndex: 9999,
                width: 'min(340px, 90vw)',
                background: '#13131a',
                borderRight: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '4px 0 40px rgba(0,0,0,0.6)',
              }}
            >
              {/* Header */}
              <div className="px-5 py-4 flex items-center justify-between flex-shrink-0"
                   style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#f1f5f9' }}>
                    Audit History
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
                    {entries.length} audit{entries.length !== 1 ? 's' : ''} saved
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {entries.length > 0 && (
                    <button onClick={handleClear} className="text-xs"
                            style={{ color: '#ef4444' }}>
                      Clear all
                    </button>
                  )}
                  <button onClick={() => setOpen(false)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                          style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                    ✕
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {entries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-3">
                    <span style={{ fontSize: '32px' }}>◎</span>
                    <p className="text-sm" style={{ color: '#475569' }}>No audits yet</p>
                    <p className="text-xs text-center" style={{ color: '#334155' }}>
                      Run an audit and it will appear here
                    </p>
                  </div>
                ) : (
                  entries.map((entry, i) => {
                    const prev = entries[i + 1]
                    const delta = prev && prev.url === entry.url
                      ? entry.scores.overall - prev.scores.overall
                      : null

                    return (
                      <button
                        key={entry.id}
                        onClick={() => handleSelect(entry.url)}
                        className="w-full text-left rounded-xl border p-4 transition-all"
                        style={{
                          borderColor: 'rgba(255,255,255,0.07)',
                          background: 'rgba(255,255,255,0.025)',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.3)'
                          ;(e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.05)'
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'
                          ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)'
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: '#f1f5f9' }}>
                              {entry.companyName}
                            </p>
                            <p className="text-xs truncate" style={{ color: '#475569' }}>
                              {entry.url.replace('https://', '')}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0 ml-3">
                            <div className="flex items-baseline gap-1">
                              <span className="text-xl font-bold" style={{ color: '#a78bfa' }}>
                                {entry.scores.overall}
                              </span>
                              {delta !== null && (
                                <span className="text-xs font-bold"
                                      style={{ color: delta > 0 ? '#10b981' : delta < 0 ? '#f87171' : '#475569' }}>
                                  {delta > 0 ? `+${delta}` : delta}
                                </span>
                              )}
                            </div>
                            <p className="text-xs" style={{ color: '#334155' }}>
                              {formatDate(entry.date)}
                            </p>
                          </div>
                        </div>

                        {/* Mini bars */}
                        <div className="grid grid-cols-4 gap-1">
                          {[
                            ['C', entry.scores.clarity, '#60a5fa'],
                            ['Co', entry.scores.consistency, '#34d399'],
                            ['D', entry.scores.differentiation, '#a78bfa'],
                            ['T', entry.scores.trust, '#fbbf24'],
                          ].map(([label, val, color]) => (
                            <div key={label as string}>
                              <div className="flex justify-between mb-0.5">
                                <span style={{ fontSize: '9px', color: '#334155' }}>{label}</span>
                                <span style={{ fontSize: '9px', color: color as string }}>{val}</span>
                              </div>
                              <div className="h-0.5 rounded-full overflow-hidden"
                                   style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <div className="h-full rounded-full"
                                     style={{ width: `${val}%`, background: color as string }} />
                              </div>
                            </div>
                          ))}
                        </div>

                        <p className="text-xs mt-2" style={{ color: '#7c3aed' }}>
                          Re-audit this brand →
                        </p>
                      </button>
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
