import type { AuditReport, HistoryEntry, ScoreSet } from './types'

const KEY = 'astitva-history'

export function saveToHistory(report: AuditReport): void {
  if (typeof window === 'undefined') return
  const current = getHistory()
  const entry: HistoryEntry = {
    id: Date.now().toString(),
    url: report.url,
    companyName: report.companyName,
    scores: report.scores,
    date: new Date().toISOString(),
  }
  // Dedupe by URL, keep newest, max 30
  const filtered = current.filter(h => h.url !== report.url)
  const updated = [entry, ...filtered].slice(0, 30)
  try {
    localStorage.setItem(KEY, JSON.stringify(updated))
  } catch { /* storage full */ }
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY)
}

export function getDelta(current: ScoreSet, url: string): Partial<ScoreSet> | null {
  const history = getHistory()
  // Find the PREVIOUS entry for this URL (not the current one we just saved)
  const prev = history.find((h, i) => i > 0 && h.url === url)
  if (!prev) return null
  return {
    clarity: current.clarity - prev.scores.clarity,
    consistency: current.consistency - prev.scores.consistency,
    differentiation: current.differentiation - prev.scores.differentiation,
    trust: current.trust - prev.scores.trust,
    overall: current.overall - prev.scores.overall,
  }
}
