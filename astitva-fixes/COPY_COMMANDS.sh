#!/bin/bash
# Astitva — Apply bug fixes + new features
set -e

echo "📝 LLM orchestration layer..."
cp astitva-fixes/llm.ts           src/lib/llm.ts

echo "📝 Replacing Claude with NIM/Groq..."
cp astitva-fixes/claude.ts        src/lib/claude.ts

echo "📝 Chat API — no Claude dependency..."
cp astitva-fixes/api-chat.ts      src/app/api/chat/route.ts

echo "📝 Fixed HistoryPanel..."
cp astitva-fixes/HistoryPanel.tsx src/components/HistoryPanel.tsx

echo "📝 WhyAstitva comparison section..."
cp astitva-fixes/WhyAstitva.tsx   src/components/WhyAstitva.tsx

echo "📝 Fixed InputView (compare + WhyAstitva)..."
cp astitva-fixes/InputView.tsx    src/components/InputView.tsx

echo "📝 Updated page.tsx (onAuditUrl wiring)..."
cp astitva-fixes/page.tsx         src/app/page.tsx

echo ""
echo "⚠️  Manual step required for ReportView.tsx:"
echo "   Open src/components/ReportView.tsx and:"
echo "   1. Add 'onAuditUrl?: (url: string) => void' to ReportViewProps"
echo "   2. Destructure it: { report, onReset, onCompare, onAuditUrl, readOnly }"
echo "   3. Change HistoryPanel usage to: <HistoryPanel onAuditUrl={onAuditUrl} />"
echo ""
echo "📦 Installing (no new packages needed)..."

echo "✅ Done. Run: pnpm dev"
echo ""
echo "Add to .env.local for Groq fallback:"
echo "  GROQ_API_KEY=gsk_..."
echo "  (get free key at console.groq.com)"
