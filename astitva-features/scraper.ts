export async function scrapeUrl(url: string): Promise<string> {
  if (process.env.FIRECRAWL_API_KEY) {
    try {
      const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, formats: ['markdown'], onlyMainContent: true }),
      })
      if (res.ok) {
        const data = await res.json()
        const content = data.data?.markdown || data.markdown || ''
        if (content.length > 200) return content.slice(0, 12000)
      }
    } catch { /* fall through */ }
  }

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Astitva Brand Audit Bot/1.0', Accept: 'text/html' },
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  const html = await res.text()
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 10000)
}

// Returns a screenshot URL if Firecrawl API key is set, null otherwise
export async function screenshotUrl(url: string): Promise<string | null> {
  if (!process.env.FIRECRAWL_API_KEY) return null
  try {
    const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, formats: ['screenshot'] }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.data?.screenshot || null
  } catch {
    return null
  }
}
