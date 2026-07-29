'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AuditReport } from '@/lib/types'

interface Msg { role: 'user' | 'assistant'; content: string }

const QUICK = ['What to fix first?', 'Tone deep dive', 'How to boost trust?', 'vs competitors']

export default function ChatPanel({ report }: { report: AuditReport }) {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([{
    role: 'assistant',
    content: `I have ${report.companyName}'s full audit — ${report.scores.overall}/100 overall. Ask me anything.`,
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  const send = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setInput('')
    setMsgs(p => [...p, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, report, history: msgs.slice(-6) }),
      })
      const data = await res.json()
      setMsgs(p => [...p, { role: 'assistant', content: data.reply }])
    } catch {
      setMsgs(p => [...p, { role: 'assistant', content: 'Something went wrong.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Trigger button — hidden in print */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="no-print fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full text-sm font-semibold shadow-xl"
        style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: 'white' }}
      >
        <span>✦</span> Ask AI
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="no-print fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="no-print fixed right-0 top-0 h-full z-50 flex flex-col"
            style={{ width: 'min(400px,100vw)', background: 'var(--color-bg-secondary)', borderLeft: '1px solid rgba(255,255,255,0.07)' }}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b flex items-center justify-between"
                 style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>Audit AI</p>
                <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  {report.companyName} · {report.scores.overall}/100
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="text-lg leading-none"
                      style={{ color: 'var(--color-text-tertiary)' }}>✕</button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="max-w-[88%] text-sm px-3.5 py-2.5 rounded-2xl leading-relaxed"
                    style={{
                      background: m.role === 'user'
                        ? 'linear-gradient(135deg,#7c3aed,#2563eb)'
                        : 'rgba(255,255,255,0.05)',
                      color: m.role === 'user' ? 'white' : 'var(--color-text-primary)',
                      borderBottomRightRadius: m.role === 'user' ? '4px' : undefined,
                      borderBottomLeftRadius: m.role === 'assistant' ? '4px' : undefined,
                    }}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="px-3.5 py-2.5 rounded-2xl text-sm"
                       style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-tertiary)', borderBottomLeftRadius: '4px' }}>
                    <span className="animate-pulse">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick prompts */}
            <div className="px-4 pt-2 flex gap-1.5 flex-wrap">
              {QUICK.map(q => (
                <button key={q} onClick={() => send(q)}
                        className="text-xs px-2.5 py-1 rounded-full transition-opacity hover:opacity-70"
                        style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: '#a78bfa' }}>
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder="Ask about the audit..."
                  className="flex-1 text-sm px-3.5 py-2.5 rounded-xl outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    color: 'var(--color-text-primary)',
                  }}
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  className="px-3.5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-35 transition-opacity"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: 'white' }}
                >
                  →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
