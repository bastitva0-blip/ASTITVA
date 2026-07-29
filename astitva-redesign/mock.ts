import type { AuditReport } from './types'

export const DEVALOK_MOCK: AuditReport = {
  url: 'https://devalok.in',
  companyName: 'Devalok',
  summary:
    'Devalok presents a rare combination of design rigour and cultural specificity — a Bharat-centric studio that actually means it. Brand clarity is high, differentiation is exceptional, but digital presence underserves the depth of thinking happening inside the studio.',
  scores: {
    clarity: 88,
    consistency: 82,
    differentiation: 94,
    trust: 86,
    overall: 88,
  },
  tone: {
    primary: 'Intentional',
    characteristics: ['Design-forward', 'Culturally rooted', 'Strategic', 'Precise', 'Confident'],
  },
  positioning: {
    targetAudience:
      'Indian founders, product teams, and enterprises seeking design that is both globally competitive and rooted in Bharatiya context.',
    valueProposition:
      'A full-stack design and strategy studio building products, systems, and brands from first principles — not templates.',
    marketPosition:
      'Positioned between boutique strategy consultancies and execution-only agencies; owns the "design + strategy + culture" intersection in Bharat.',
  },
  claims: [
    'Design that works',
    'Build with intention',
    'Bharat-centric design',
    'Open source design system',
    'Strategy-led execution',
  ],
  strengths: [
    {
      point: 'Exceptional differentiation',
      detail:
        'Very few studios globally combine cultural positioning with open-source tooling. Shilp Sutra as a public artifact makes Devalok's philosophy visible and verifiable.',
    },
    {
      point: 'Coherent visual identity',
      detail:
        'Typography, spacing, and colour usage across touchpoints is disciplined — the brand looks like it was designed by the same person who built the design system.',
    },
    {
      point: 'Thought leadership credibility',
      detail:
        'Publishing frameworks, tools, and events (like this buildathon) signals a studio that operates at the edge of its craft, not behind it.',
    },
  ],
  weaknesses: [
    {
      point: 'Thin digital footprint',
      detail:
        'The website communicates identity well but does not yet convert — case studies, client outcomes, and social proof are sparse relative to the studio's actual output.',
    },
    {
      point: 'Messaging complexity',
      detail:
        'The studio does strategy + design + open source + culture simultaneously. Without a clear entry narrative, first-time visitors may not know where they fit.',
    },
    {
      point: 'Community visibility gap',
      detail:
        'The "Bharat design" space is unclaimed territory — Devalok is ideally placed to own it but has not yet made the flag-planting move on platforms like LinkedIn or X.',
    },
  ],
  recommendations: [
    {
      priority: 'high',
      area: 'Content Strategy',
      action:
        'Publish 3 detailed case studies showing strategy → design → outcome for past clients, with measurable results.',
      impact:
        'Converts browsers to inquiries; gives sales conversations a concrete anchor beyond portfolio screenshots.',
    },
    {
      priority: 'high',
      area: 'Positioning',
      action:
        'Craft a single "entry narrative" — one paragraph that tells a founder in 20 seconds exactly what Devalok does and who it is for.',
      impact:
        'Reduces cognitive load for first-time visitors and tightens word-of-mouth referrals.',
    },
    {
      priority: 'medium',
      area: 'Community',
      action:
        'Launch a "Bharat Design" newsletter or weekly LinkedIn series that establishes the studio as the editorial voice of Indian design.',
      impact:
        'Builds an owned audience; compounds into inbound leads over 6–12 months.',
    },
    {
      priority: 'medium',
      area: 'Trust Signals',
      action:
        'Add a "Built with Devalok" showcase page featuring live products and client logos, linked from the homepage.',
      impact:
        'Reduces sales friction — prospects can self-validate without a call.',
    },
    {
      priority: 'low',
      area: 'Messaging',
      action:
        'Create separate landing pages for each service line (Design System, Brand Identity, Product Design) with tailored messaging per audience.',
      impact:
        'Improves SEO and conversion by matching intent to content.',
    },
  ],
}
