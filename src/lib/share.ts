import LZString from 'lz-string'
import type { AuditReport } from './types'

export function encodeReport(report: AuditReport): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(report))
}

export function decodeReport(encoded: string): AuditReport | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded)
    return json ? (JSON.parse(json) as AuditReport) : null
  } catch {
    return null
  }
}

export function createShareUrl(report: AuditReport): string {
  const encoded = encodeReport(report)
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  return `${base}/r?d=${encoded}`
}

export async function copyShareUrl(report: AuditReport): Promise<string> {
  const url = createShareUrl(report)
  try {
    await navigator.clipboard.writeText(url)
  } catch { /* clipboard not available */ }
  return url
}
