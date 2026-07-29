export interface ScoreSet {
  clarity: number
  consistency: number
  differentiation: number
  trust: number
  overall: number
}

export interface AuditReport {
  url: string
  companyName: string
  scores: ScoreSet
  tone: {
    primary: string
    characteristics: string[]
  }
  positioning: {
    targetAudience: string
    valueProposition: string
    marketPosition: string
  }
  claims: string[]
  strengths: Array<{ point: string; detail: string }>
  weaknesses: Array<{ point: string; detail: string }>
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low'
    area: string
    action: string
    impact: string
  }>
  summary: string
  // Feature additions
  visualAudit?: {
    score: number
    screenshotUrl?: string
    findings: string[]
    suggestions: string[]
  }
  competitorBenchmark?: Array<{
    companyName: string
    url: string
    scores: ScoreSet
  }>
}

export interface StepState {
  scrape: 'pending' | 'running' | 'done'
  analyze: 'pending' | 'running' | 'done'
  synthesize: 'pending' | 'running' | 'done'
}

export interface HistoryEntry {
  id: string
  url: string
  companyName: string
  scores: ScoreSet
  date: string
}
