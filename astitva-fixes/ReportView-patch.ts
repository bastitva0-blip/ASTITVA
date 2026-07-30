// PATCH INSTRUCTIONS for src/components/ReportView.tsx
// Apply these 2 changes manually:

// ── CHANGE 1: Update ReportViewProps interface ──
// Find:
//   interface ReportViewProps {
//     report: AuditReport
//     onReset: () => void
//     onCompare?: () => void
//     readOnly?: boolean
//   }
// Replace with:
//   interface ReportViewProps {
//     report: AuditReport
//     onReset: () => void
//     onCompare?: () => void
//     onAuditUrl?: (url: string) => void
//     readOnly?: boolean
//   }

// ── CHANGE 2: Update component signature + HistoryPanel usage ──
// Find:
//   export default function ReportView({ report, onReset, onCompare, readOnly }: ReportViewProps) {
// Replace with:
//   export default function ReportView({ report, onReset, onCompare, onAuditUrl, readOnly }: ReportViewProps) {

// ── CHANGE 3: Update HistoryPanel usage in topbar ──
// Find:
//   {!readOnly && <HistoryPanel onReaudit={(url) => { onReset(); setTimeout(() => { /* trigger audit with url */ }, 100) }} />}
// Replace with:
//   {!readOnly && onAuditUrl && <HistoryPanel onAuditUrl={onAuditUrl} />}
