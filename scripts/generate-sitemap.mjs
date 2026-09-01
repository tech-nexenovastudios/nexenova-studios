// Generates dist/sitemap.xml after the Vite build.
//
// Static routes + the 13 bundled games are always included. Devlog posts and
// open career roles are dynamic (Supabase), so we fetch their slugs at build
// time when VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY are present
// (they are on Cloudflare Pages). If they're missing or the fetch fails, we
// emit the static portion and log a warning — never fail the build.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const SITE_URL = 'https://nexenovastudios.com'

// Vite loads .env.local at build time, but this Node script does not — load it
// here (without overriding real process.env) so devlog/career URLs are included
// locally too, matching what the app is built against.
for (const f of ['.env.local', '.env']) {
  try {
    for (const line of readFileSync(resolve(root, f), 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  } catch {
    /* file may not exist — fine */
  }
}

const games = JSON.parse(
  readFileSync(resolve(root, 'src/app/data/games.seed.json'), 'utf8'),
)

const today = new Date().toISOString().slice(0, 10)

/** @type {{loc: string, lastmod?: string, changefreq?: string, priority?: number}[]} */
const urls = [
  { loc: '/', changefreq: 'weekly', priority: 1.0, lastmod: today },
  { loc: '/devlog', changefreq: 'weekly', priority: 0.7, lastmod: today },
  { loc: '/careers', changefreq: 'weekly', priority: 0.7, lastmod: today },
  { loc: '/privacy', changefreq: 'yearly', priority: 0.2 },
  { loc: '/terms', changefreq: 'yearly', priority: 0.2 },
  { loc: '/cookies', changefreq: 'yearly', priority: 0.2 },
]

for (const g of games) {
  urls.push({
    loc: `/game/${g.id}`,
    changefreq: 'monthly',
    priority: 0.8,
    lastmod: (g.updatedAt || g.createdAt || '').slice(0, 10) || undefined,
  })
}

async function fetchSupabaseRows(path) {
  const base = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (!base || !key) return null
  const res = await fetch(`${base}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

try {
  const nowIso = new Date().toISOString()
  const posts = await fetchSupabaseRows(
    `devlog_posts?select=slug,updated_at,published_at&order=published_at.desc`,
  )
  if (posts) {
    for (const p of posts) {
      if (!p.published_at || p.published_at > nowIso) continue
      urls.push({
        loc: `/devlog/${p.slug}`,
        changefreq: 'monthly',
        priority: 0.6,
        lastmod: (p.updated_at || p.published_at || '').slice(0, 10) || undefined,
      })
    }
  }

  const roles = await fetchSupabaseRows(
    `careers?select=slug,updated_at,closed_at&closed_at=is.null`,
  )
  if (roles) {
    for (const r of roles) {
      urls.push({
        loc: `/careers/${r.slug}`,
        changefreq: 'weekly',
        priority: 0.6,
        lastmod: (r.updated_at || '').slice(0, 10) || undefined,
      })
    }
  }

  if (posts === null) {
    console.warn(
      '[sitemap] Supabase env vars not set — devlog/career detail URLs omitted (static + game URLs still included).',
    )
  }
} catch (err) {
  console.warn(`[sitemap] Skipping dynamic URLs — Supabase fetch failed: ${err.message}`)
}

const body = urls
  .map((u) => {
    const parts = [`    <loc>${SITE_URL}${u.loc}</loc>`]
    if (u.lastmod) parts.push(`    <lastmod>${u.lastmod}</lastmod>`)
    if (u.changefreq) parts.push(`    <changefreq>${u.changefreq}</changefreq>`)
    if (u.priority != null) parts.push(`    <priority>${u.priority.toFixed(1)}</priority>`)
    return `  <url>\n${parts.join('\n')}\n  </url>`
  })
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`

const outDir = resolve(root, 'dist')
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
writeFileSync(resolve(outDir, 'sitemap.xml'), xml)
console.log(`[sitemap] Wrote dist/sitemap.xml with ${urls.length} URLs.`)
