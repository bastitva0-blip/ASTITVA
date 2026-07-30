import { NextRequest } from 'next/server'
import { regenerateSection, SECTION_PROMPTS, type Section } from '@/lib/sections'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const { url, section } = await req.json() as { url: string; section: Section }

  if (!SECTION_PROMPTS[section]) {
    return Response.json({ error: 'Invalid section' }, { status: 400 })
  }

  try {
    const data = await regenerateSection(url, section)
    return Response.json({ section, data })
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
