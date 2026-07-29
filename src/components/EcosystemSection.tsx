'use client'
import { motion } from 'framer-motion'

const PRODUCTS = [
  { name: 'Śilpa Sūtra', sub: 'शिल्प सूत्र', tagline: '120+ React components. One design system.', detail: 'Open-source Tailwind 4 design system for React & Next.js. The same system powering this app.', status: 'live' as const, statusLabel: 'Open Source', url: 'https://shilp-sutra.devalok.in', icon: '⬡' },
  { name: 'Setu', tagline: 'Keep every AI output perfectly on-brand.', detail: 'Your brand AI is almost here. Keeps every AI-generated output true to your brand voice.', status: 'soon' as const, statusLabel: 'Launching Soon', url: null, icon: '◈' },
  { name: 'Yojana', tagline: 'AI co-planning platform.', detail: 'Plan smarter with AI that understands your brand goals and strategy.', status: 'soon' as const, statusLabel: 'Launching Soon', url: null, icon: '◎' },
  { name: 'Karm', sub: 'कर्म', tagline: 'Workplace OS for design studios.', detail: 'Attendance, Break Framework, project management, messaging — all in one.', status: 'live' as const, statusLabel: 'Live', url: 'https://karm.devalok.in', icon: '◉' },
  { name: 'BharatTools', tagline: 'Har sarkari form ka saathi.', detail: 'Browser-only utilities for Indian government forms. Files never leave your device.', status: 'live' as const, statusLabel: 'Free', url: 'https://bharattools.app', icon: '◆' },
  { name: 'Devalok Share', tagline: 'Publish and share prototypes instantly.', detail: 'Sandboxed HTML hosting at share.devalok.dev.', status: 'live' as const, statusLabel: 'Live', url: 'https://share.devalok.dev', icon: '↗' },
  { name: 'Sarathi', sub: 'सारथी', tagline: 'AI for university innovation ecosystems.', detail: 'Where Karm runs studios, Sarathi runs academic innovation programs.', status: 'alpha' as const, statusLabel: 'Live Alpha', url: null, icon: '✦' },
  { name: 'Gurukul', sub: 'गुरुकुल', tagline: 'Free design education for builders.', detail: 'Practical guides for founders, designers, and builders.', status: 'live' as const, statusLabel: 'Free', url: 'https://gurukul.devalok.in', icon: '⟡' },
  { name: 'Devadoot', sub: 'देवदूत', tagline: 'Studio AI in Devalok voice.', detail: 'Claude-powered AI built for Devalok operations.', status: 'internal' as const, statusLabel: 'Internal', url: null, icon: '△' },
]
const STATUS = {
  live:     { color: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)' },
  soon:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
  alpha:    { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)' },
  internal: { color: '#94a3b8', bg: 'rgba(148,163,184,0.06)', border: 'rgba(148,163,184,0.15)' },
}
const PINK = '#D33163'
export default function EcosystemSection() {
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(211,49,99,0.18)', background: 'var(--color-bg-secondary)' }}>
      <div className="px-6 py-5 border-b flex items-start justify-between gap-4 flex-wrap"
           style={{ borderColor: 'rgba(211,49,99,0.12)', background: 'linear-gradient(135deg,rgba(211,49,99,0.07) 0%,rgba(211,49,99,0.02) 100%)' }}>
        <div>
          <p className="text-xs uppercase tracking-widest mb-1 font-semibold" style={{ color: PINK }}>The Devalok Ecosystem</p>
          <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Tools & products built by the studio behind this audit</h3>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>From design systems to AI platforms — built in Lucknow, used globally.</p>
        </div>
        <a href="https://talk.devalok.in" target="_blank" rel="noopener noreferrer"
           className="px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap hover:opacity-85 flex-shrink-0"
           style={{ background: `linear-gradient(135deg,${PINK},#B02651)`, color: 'white', textDecoration: 'none' }}>
          Book a Discovery Call →
        </a>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p, i) => {
            const s = STATUS[p.status]
            return (
              <motion.div key={p.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="rounded-xl border p-4 flex flex-col gap-2.5"
                style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span style={{ color: PINK, fontSize: '15px', flexShrink: 0 }}>{p.icon}</span>
                    <div className="min-w-0">
                      <span className="font-semibold text-sm block" style={{ color: 'var(--color-text-primary)' }}>{p.name}</span>
                      {p.sub && <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{p.sub}</span>}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                        style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                    {p.statusLabel}
                  </span>
                </div>
                <p className="text-xs font-semibold leading-snug" style={{ color: PINK }}>{p.tagline}</p>
                <p className="text-xs leading-relaxed flex-1" style={{ color: 'var(--color-text-tertiary)' }}>{p.detail}</p>
                {p.url ? (
                  <a href={p.url} target="_blank" rel="noopener noreferrer"
                     className="text-xs mt-auto hover:opacity-60" style={{ color: PINK, textDecoration: 'none' }}>
                    {p.url.replace('https://', '')} ↗
                  </a>
                ) : (
                  <span className="text-xs mt-auto" style={{ color: 'var(--color-text-tertiary)' }}>
                    {p.status === 'soon' ? 'Coming soon' : 'Devalok internal'}
                  </span>
                )}
              </motion.div>
            )
          })}
        </div>
        <div className="mt-4 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap"
             style={{ background: 'rgba(211,49,99,0.04)', border: '1px solid rgba(211,49,99,0.1)' }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Need the full brand treatment?</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Brand identity · Packaging · UI/UX · Motion · Print · Production — all in-house.</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <a href="https://devalok.in/works" target="_blank" rel="noopener noreferrer"
               className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-75"
               style={{ border: '1px solid rgba(211,49,99,0.3)', color: PINK, textDecoration: 'none' }}>View Work</a>
            <a href="https://talk.devalok.in" target="_blank" rel="noopener noreferrer"
               className="px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-85"
               style={{ background: PINK, color: 'white', textDecoration: 'none' }}>Talk to Mudit →</a>
          </div>
        </div>
        <p className="text-xs text-center mt-4" style={{ color: 'var(--color-text-tertiary)' }}>
          आत्मतः शिल्पं कृत्वा — <span style={{ fontStyle: 'italic' }}>From the soul, we craft.</span>
          {' '}·{' '}
          <a href="https://devalok.in" target="_blank" rel="noopener noreferrer"
             className="underline underline-offset-2 hover:opacity-70" style={{ color: PINK }}>devalok.in</a>
        </p>
      </div>
    </div>
  )
}
