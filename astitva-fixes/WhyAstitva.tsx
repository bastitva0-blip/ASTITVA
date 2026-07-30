'use client'

import { motion } from 'framer-motion'

const COMPARISONS = [
  { feature: 'Structured brand scores', astitva: true,  brand24: false, chatgpt: false, semrush: false },
  { feature: 'Agentic AI pipeline',     astitva: true,  brand24: false, chatgpt: false, semrush: false },
  { feature: 'Multi-model AI',          astitva: true,  brand24: false, chatgpt: false, semrush: false },
  { feature: 'Visual design audit',     astitva: true,  brand24: false, chatgpt: false, semrush: false },
  { feature: 'Competitor benchmark',    astitva: true,  brand24: true,  chatgpt: false, semrush: true  },
  { feature: 'Strategic recs',          astitva: true,  brand24: false, chatgpt: true,  semrush: false },
  { feature: 'Share report link',       astitva: true,  brand24: true,  chatgpt: false, semrush: true  },
  { feature: 'Free to try',             astitva: true,  brand24: false, chatgpt: true,  semrush: false },
  { feature: 'Bharat-first',            astitva: true,  brand24: false, chatgpt: false, semrush: false },
  { feature: 'Open source',             astitva: true,  brand24: false, chatgpt: false, semrush: false },
]

const TOOLS = ['Astitva', 'Brand24', 'ChatGPT', 'Semrush']
const TOOL_COLORS = ['#a78bfa', '#475569', '#475569', '#475569']

function Check({ val, highlight }: { val: boolean; highlight?: boolean }) {
  return (
    <div className="flex justify-center">
      {val ? (
        <span className="text-sm" style={{ color: highlight ? '#a78bfa' : '#10b981' }}>✓</span>
      ) : (
        <span className="text-sm" style={{ color: '#334155' }}>—</span>
      )}
    </div>
  )
}

export default function WhyAstitva() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="w-full max-w-lg mt-10"
    >
      {/* Header */}
      <div className="text-center mb-5">
        <p className="text-xs uppercase tracking-widest mb-1 font-semibold"
           style={{ color: '#a78bfa' }}>Why Astitva</p>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Most brand tools listen. Astitva audits.
        </p>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden"
           style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'var(--color-bg-secondary)' }}>
        {/* Tool headers */}
        <div className="grid border-b px-4 py-3"
             style={{ gridTemplateColumns: '1fr repeat(4,52px)', borderColor: 'rgba(255,255,255,0.07)' }}>
          <span />
          {TOOLS.map((t, i) => (
            <span key={t} className="text-xs font-semibold text-center"
                  style={{ color: TOOL_COLORS[i] }}>
              {t === 'Astitva' ? '★ ' + t : t}
            </span>
          ))}
        </div>

        {/* Rows */}
        {COMPARISONS.map((row, i) => (
          <div key={row.feature}
               className="grid px-4 py-2.5 border-b"
               style={{
                 gridTemplateColumns: '1fr repeat(4,52px)',
                 borderColor: 'rgba(255,255,255,0.04)',
                 background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
               }}>
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {row.feature}
            </span>
            <Check val={row.astitva} highlight />
            <Check val={row.brand24} />
            <Check val={row.chatgpt} />
            <Check val={row.semrush} />
          </div>
        ))}

        {/* Footer row */}
        <div className="px-4 py-3" style={{ background: 'rgba(124,58,237,0.04)' }}>
          <p className="text-xs" style={{ color: '#475569' }}>
            Brand24 = social monitoring · ChatGPT = generic chat · Semrush = SEO tool
          </p>
        </div>
      </div>

      {/* Win angle */}
      <div className="mt-4 rounded-xl border p-4"
           style={{ borderColor: 'rgba(124,58,237,0.2)', background: 'rgba(124,58,237,0.05)' }}>
        <p className="text-xs font-semibold mb-2" style={{ color: '#a78bfa' }}>
          Built for the buildathon ✦
        </p>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Astitva is the only brand audit tool built on Shilp Sutra, orchestrating
          NVIDIA NIM + Groq across an agentic pipeline — scrape → analyze → synthesize →
          visual audit → competitor benchmark — all in 60 seconds.
          No other tool combines structured AI scoring with a Bharat-first design system.
        </p>
      </div>
    </motion.div>
  )
}
