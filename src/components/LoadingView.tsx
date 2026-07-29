'use client'

import { motion } from 'framer-motion'
import { Logo } from './Logo'
import type { StepState } from '@/lib/types'

const STEPS = [
  {
    id: 'scrape' as const,
    label: 'Scraping website',
    sub: 'Firecrawl extracting content & structure',
    color: '#10b981',
  },
  {
    id: 'analyze' as const,
    label: 'Analyzing brand elements',
    sub: 'NVIDIA NIM · tone, positioning, claims, scores',
    color: '#a78bfa',
  },
  {
    id: 'synthesize' as const,
    label: 'Synthesizing insights',
    sub: 'Claude Sonnet crafting strategic recommendations',
    color: '#60a5fa',
  },
]

interface LoadingViewProps {
  steps: StepState
  url: string
}

export default function LoadingView({ steps, url }: LoadingViewProps) {
  const doneCount = Object.values(steps).filter((s) => s === 'done').length
  const progress = Math.round((doneCount / 3) * 100)

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden"
      style={{ background: 'var(--color-bg-primary)' }}
    >
      <div className="absolute inset-0 hero-glow pointer-events-none" />
      <div className="absolute inset-0 grid-bg pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="flex justify-center mb-8"
        >
          <Logo size={44} />
        </motion.div>

        {/* URL */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-6"
        >
          <p className="text-xs uppercase tracking-widest mb-1"
             style={{ color: 'var(--color-text-tertiary)' }}>
            Auditing
          </p>
          <p className="text-sm font-medium truncate" style={{ color: '#a78bfa' }}>
            {url}
          </p>
        </motion.div>

        {/* Progress bar */}
        <div
          className="h-0.5 rounded-full mb-6 overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #7c3aed, #2563eb, #10b981)' }}
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((step, i) => {
            const status = steps[step.id]
            const isRunning = status === 'running'
            const isDone = status === 'done'
            const isPending = status === 'pending'

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 28 }}
              >
                <div
                  className="flex items-center gap-4 p-4 rounded-xl border transition-all duration-400"
                  style={{
                    borderColor: isRunning
                      ? `${step.color}35`
                      : isDone
                        ? `${step.color}18`
                        : 'rgba(255,255,255,0.04)',
                    background: isRunning
                      ? `${step.color}0c`
                      : isDone
                        ? `${step.color}06`
                        : 'rgba(255,255,255,0.015)',
                    opacity: isPending ? 0.35 : 1,
                  }}
                >
                  {/* Status icon */}
                  <div className="flex-shrink-0">
                    {isDone && (
                      <motion.div
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: step.color }}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </motion.div>
                    )}
                    {isRunning && (
                      <div className="relative w-7 h-7">
                        <motion.div
                          animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="absolute inset-0 rounded-full"
                          style={{ background: step.color }}
                        />
                        <div
                          className="relative w-7 h-7 rounded-full border-2 animate-spin"
                          style={{ borderColor: step.color, borderTopColor: 'transparent' }}
                        />
                      </div>
                    )}
                    {isPending && (
                      <div
                        className="w-7 h-7 rounded-full border-2"
                        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                      />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium"
                       style={{ color: isPending ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)' }}>
                      {step.label}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                      {step.sub}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-center mt-6"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          ~30–60 seconds
        </motion.p>
      </div>
    </div>
  )
}
