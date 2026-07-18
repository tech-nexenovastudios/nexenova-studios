// Ping IndexNow (Bing, Yandex, and partners) with the site's live URLs so they
// re-crawl near-instantly instead of waiting for a scheduled crawl.
//
// Google does NOT participate in IndexNow — it still relies on Search Console +
// the sitemap. This complements, not replaces, those.
//
// Run this AFTER a deploy is live (the URLs must resolve), e.g.:
//   npm run indexnow
//
// It reads the live sitemap at SITE_URL/sitemap.xml, extracts <loc> URLs, and
// submits them in one batch to api.indexnow.org. The key file must already be
// served at SITE_URL/<KEY>.txt (public/c1dccf57305a2c0b0c68c0fc08977857.txt).

const SITE_URL = 'https://nexenovastudios.com'
const KEY = 'c1dccf57305a2c0b0c68c0fc08977857'
const HOST = new URL(SITE_URL).host

async function main() {
  const sitemapUrl = `${SITE_URL}/sitemap.xml`
  const res = await fetch(sitemapUrl)
  if (!res.ok) {
    console.error(`[indexnow] Could not fetch ${sitemapUrl}: ${res.status} ${res.statusText}`)
    process.exit(1)
  }
  const xml = await res.text()
  const urls = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1])
  if (urls.length === 0) {
    console.error('[indexnow] No <loc> URLs found in sitemap — nothing to submit.')
    process.exit(1)
  }

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: `${SITE_URL}/${KEY}.txt`,
    urlList: urls,
  }

  const submit = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  })

  // IndexNow returns 200 (accepted) or 202 (accepted, pending validation).
  if (submit.ok || submit.status === 202) {
    console.log(`[indexnow] Submitted ${urls.length} URLs — HTTP ${submit.status}.`)
  } else {
    const body = await submit.text().catch(() => '')
    console.error(`[indexnow] Submission failed — HTTP ${submit.status}. ${body}`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(`[indexnow] Error: ${err.message}`)
  process.exit(1)
})
