#!/bin/bash
# Astitva — Apply all 8 features
# Run from /workspaces/Pratibimba

set -e

echo "📦 Updating package.json..."
cp astitva-features/package.json package.json

echo "📁 Creating new directories..."
mkdir -p src/app/api/chat
mkdir -p src/app/api/reaudit
mkdir -p src/app/api/compare
mkdir -p src/app/r

echo "📝 Updating lib files..."
cp astitva-features/types.ts      src/lib/types.ts
cp astitva-features/history.ts    src/lib/history.ts
cp astitva-features/share.ts      src/lib/share.ts
cp astitva-features/scraper.ts    src/lib/scraper.ts
cp astitva-features/nvidia.ts     src/lib/nvidia.ts
cp astitva-features/pipeline.ts   src/lib/pipeline.ts

echo "📝 Updating API routes..."
cp astitva-features/api-chat.ts      src/app/api/chat/route.ts
cp astitva-features/api-reaudit.ts   src/app/api/reaudit/route.ts
cp astitva-features/api-compare.ts   src/app/api/compare/route.ts

echo "📝 Adding shared report page..."
cp astitva-features/r-page.tsx    src/app/r/page.tsx

echo "📝 Updating components..."
cp astitva-features/ChatPanel.tsx    src/components/ChatPanel.tsx
cp astitva-features/HistoryPanel.tsx src/components/HistoryPanel.tsx
cp astitva-features/CompareView.tsx  src/components/CompareView.tsx
cp astitva-features/ReportView.tsx   src/components/ReportView.tsx
cp astitva-features/InputView.tsx    src/components/InputView.tsx

echo "📝 Updating app files..."
cp astitva-features/page.tsx      src/app/page.tsx
cp astitva-features/globals.css   src/app/globals.css

echo "📦 Installing lz-string..."
pnpm add lz-string

echo "✅ All 8 features applied. Run: pnpm dev"
