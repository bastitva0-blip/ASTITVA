'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@devalok/shilp-sutra/ui/input'
import { Logo } from './Logo'
import WhyAstitva from './WhyAstitva'

const EXAMPLES = [
  { name: 'Stripe', url: 'stripe.com' },
  { name: 'Linear', url: 'linear.app' },
  { name: 'Notion', url: 'notion.so' },
  { name: 'Vercel', url: 'vercel.com' },
]

const FEATURES = [
  { icon: '◈', label: 'Clarity' },
  { icon: '◎', label: 'Consistency' },
  { icon: '◆', label: 'Differentiation' },
  { icon: '◉', label: 'Trust' },
]

interface InputViewProps {
  onSubmit: (url: string) => void
  onCompare: (url1: string, url2: string) => void
  onTestMode: () => void
  error?: string
}

export default function InputView({ onSubmit, onCompare, onTestMode, error }: InputViewProps) {
  const [url, setUrl] = useState('')
  const [url2, setUrl2] = useState('')
  const [focused, setFocused] = useState(false)
  const [compareMode, setCompareMode] = useState(false)

  const normalise = (u: string) =>
    u.trim().startsWith('http') ? u.trim() : `https://${u.trim()}`

  const handleSubmit = () => {
    if (compareMode) {
      if (!url.trim() || !url2.trim()) return
      onCompare(normalise(url), normalise(url2))
    } else {
      if (!url.trim()) return
      onSubmit(normalise(url))
    }
  }

  const canSubmit = compareMode ? (!!url.trim() && !!url2.trim()) : !!url.trim()

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pb-16"
      style={{ background: 'var(--color-bg-primary)' }}
    >
      <div className="absolute inset-0 hero-glow pointer-events-none" />
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[20%] left-[15%] w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle,#7c3aed,transparent)' }}
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-[20%] right-[15%] w-64 h-64 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle,#2563eb,transparent)' }}
      />

      <div className="relative z-10 w-full max-w-lg px-6 flex flex-col items-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }} className="flex justify-center mb-10"
        >
          <Logo size={52} />
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }} className="text-center mb-3 w-full"
        >
          <h1 className="text-5xl font-bold tracking-tight leading-[1.1] mb-4">
            <span className="gradient-text">Know your brand.</span>
            <br />
            <span style={{ color: 'var(--color-text-primary)' }}>Shape your identity.</span>
          </h1>
          <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
            AI brand audit in 60 seconds — NVIDIA NIM + Groq orchestration.
          </p>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mb-8 mt-5 w-full"
        >
          {FEATURES.map((f, i) => (
            <motion.span key={f.label}
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.06 }}
              className="text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5"
              style={{ border: '1px solid rgba(124,58,237,0.22)', background: 'rgba(124,58,237,0.06)', color: 'var(--color-text-secondary)' }}>
              <span style={{ color: '#a78bfa' }}>{f.icon}</span>{f.label}
            </motion.span>
          ))}
        </motion.div>

        {/* Input card */}
        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3 }} className="w-full"
        >
          <div className="rounded-2xl p-px transition-all duration-300"
               style={{ background: focused ? 'linear-gradient(135deg,rgba(124,58,237,0.6),rgba(37,99,235,0.5))' : 'rgba(255,255,255,0.07)' }}>
            <div className="rounded-[15px] p-5 space-y-3" style={{ background: 'var(--color-bg-secondary)' }}>

              {/* Compare toggle */}
              <div className="flex items-center justify-between">
                <label className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  {compareMode ? 'Compare mode — enter 2 URLs' : 'Single brand audit'}
                </label>
                <button
                  onClick={() => { setCompareMode(!compareMode); setUrl2('') }}
                  className="text-xs px-2.5 py-1 rounded-full transition-all"
                  style={{
                    background: compareMode ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)',
                    border: compareMode ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.08)',
                    color: compareMode ? '#a78bfa' : 'var(--color-text-tertiary)',
                  }}
                >
                  {compareMode ? '✕ Single mode' : '↔ Compare 2'}
                </button>
              </div>

              {/* URL 1 */}
              <Input
                placeholder={compareMode ? 'https://brand-one.com' : 'https://yourcompany.com'}
                value={url}
                onChange={e => setUrl(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />

              {/* URL 2 — plain conditional, no AnimatePresence */}
              {compareMode && (
                <div>
                  <Input
                    placeholder="https://competitor.com"
                    value={url2}
                    onChange={e => setUrl2(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  />
                </div>
              )}

              {error && <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{error}</p>}

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: 'white', border: 'none' }}
                >
                  {compareMode ? 'Compare →' : 'Audit Brand →'}
                </button>
                <button
                  onClick={onTestMode}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer flex items-center gap-1.5 hover:opacity-80"
                  style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)', color: '#a78bfa' }}
                >
                  <span style={{ fontSize: '10px' }}>▶</span> Demo
                </button>
              </div>

              <p className="text-xs text-center" style={{ color: 'var(--color-text-tertiary)' }}>
                Demo uses pre-loaded <span style={{ color: '#a78bfa' }}>devalok.in</span> data — no API key needed
              </p>
            </div>
          </div>
        </motion.div>

        {/* Examples */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-4 flex gap-2 flex-wrap justify-center items-center w-full"
        >
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Try:</span>
          {EXAMPLES.map(ex => (
            <button key={ex.url}
              onClick={() => setUrl(`https://${ex.url}`)}
              className="text-xs px-2.5 py-1 rounded-full cursor-pointer transition-all hover:opacity-75"
              style={{ border: '1px solid rgba(255,255,255,0.07)', color: '#a78bfa', background: 'rgba(124,58,237,0.07)' }}>
              {ex.name}
            </button>
          ))}
          {compareMode && (
            <>
              <span className="text-xs ml-1" style={{ color: 'rgba(255,255,255,0.2)' }}>vs</span>
              {EXAMPLES.slice(0, 3).map(ex => (
                <button key={`vs-${ex.url}`}
                  onClick={() => setUrl2(`https://${ex.url}`)}
                  className="text-xs px-2.5 py-1 rounded-full cursor-pointer transition-all hover:opacity-75"
                  style={{ border: '1px solid rgba(211,49,99,0.2)', color: '#D33163', background: 'rgba(211,49,99,0.06)' }}>
                  {ex.name}
                </button>
              ))}
            </>
          )}
        </motion.div>

        {/* Why Astitva comparison section */}
        <WhyAstitva />

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
          className="text-xs text-center mt-8" style={{ color: 'var(--color-text-tertiary)' }}
        >
          Built with{' '}
          <a href="https://shilp-sutra.devalok.in" target="_blank"
             className="underline underline-offset-2" style={{ color: '#a78bfa' }}>Shilp Sutra</a>
          {' '}·{' '}
          <a href="https://devalok.in" target="_blank"
             className="underline underline-offset-2" style={{ color: '#a78bfa' }}>Devalok</a>
        </motion.p>
      </div>
    </div>
  )
}
