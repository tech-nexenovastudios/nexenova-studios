// Build step: turn the shared route table into the two artefacts that have to
// exist as plain data at request time —
//
//   dist/sitemap.xml        the crawlable URL list
//   generated/seo-routes.js the lookup table functions/_middleware.js injects
//                           into the raw HTML (title, meta, canonical, JSON-LD)
//
// Static routes + the bundled games are always included. Devlog posts and open
// career roles live in Supabase, so their rows are fetched at build time when
// VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY are present (they are on
// Cloudflare Pages). If they're missing or the fetch fails we emit the static
// portion and log a warning — never fail the build.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

import { SITE_URL, DEFAULT_IMAGE, DEFAULT_IMAGE_ALT, absoluteUrl } from '../shared/seo/schema.mjs'
import { buildRouteTable, notFoundSeo } from '../shared/seo/routes.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

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

let posts = []
let roles = []

try {
  const nowIso = new Date().toISOString()
  const postRows = await fetchSupabaseRows(
    'devlog_posts?select=slug,title,excerpt,body,cover_image,published_at,updated_at&order=published_at.desc',
  )
  if (postRows) {
    posts = postRows.filter((p) => p.published_at && p.published_at <= nowIso)
  } else {
    console.warn(
      '[seo] Supabase env vars not set — devlog/career URLs omitted (static + game URLs still included).',
    )
  }

  const roleRows = await fetchSupabaseRows(
    'careers?select=slug,title,location,employment_type,short_summary,description,posted_at,closed_at,updated_at&closed_at=is.null',
  )
  if (roleRows) roles = roleRows
} catch (err) {
  console.warn(`[seo] Skipping dynamic URLs — Supabase fetch failed: ${err.message}`)
}

const entries = buildRouteTable({ games, posts, roles })

// ---------------------------------------------------------------------------
// dist/sitemap.xml
// ---------------------------------------------------------------------------

const sitemapBody = entries
  .filter((e) => e.sitemap && (e.seo.robots ?? 'index,follow').indexOf('noindex') === -1)
  .map(({ seo, sitemap }) => {
    const parts = [`    <loc>${SITE_URL}${seo.path}</loc>`]
    if (sitemap.lastmod) parts.push(`    <lastmod>${sitemap.lastmod}</lastmod>`)
    if (sitemap.changefreq) parts.push(`    <changefreq>${sitemap.changefreq}</changefreq>`)
    if (sitemap.priority != null) parts.push(`    <priority>${sitemap.priority.toFixed(1)}</priority>`)
    return `  <url>\n${parts.join('\n')}\n  </url>`
  })

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapBody.join('\n')}\n</urlset>\n`

const distDir = resolve(root, 'dist')
if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true })
writeFileSync(resolve(distDir, 'sitemap.xml'), xml)
console.log(`[seo] Wrote dist/sitemap.xml with ${sitemapBody.length} URLs.`)

// ---------------------------------------------------------------------------
// generated/seo-routes.js
// ---------------------------------------------------------------------------

/** Shape the middleware consumes: flat strings, no builders, no Supabase. */
function toEdgeRoute(seo) {
  const jsonLd = seo.jsonLd ? (Array.isArray(seo.jsonLd) ? seo.jsonLd : [seo.jsonLd]) : []
  const custom = Boolean(seo.image)
  return {
    title: seo.title,
    description: seo.description,
    canonical: absoluteUrl(seo.path),
    image: custom ? absoluteUrl(seo.image) : DEFAULT_IMAGE,
    imageAlt: custom ? seo.title : DEFAULT_IMAGE_ALT,
    // Only the branded card has known dimensions. Game/devlog artwork is
    // arbitrary, and advertising the wrong size is worse than saying nothing.
    imageSize: custom ? null : { width: '1200', height: '630' },
    type: seo.type ?? 'website',
    robots: seo.robots ?? 'index,follow',
    // Pre-serialised so the edge never runs JSON.stringify. "<" is escaped so a
    // stray "</script>" inside content can't break out of the script element.
    jsonLd: jsonLd.map((block) => JSON.stringify(block).replace(/</g, '\\u003c')),
  }
}

const routes = {}
for (const { seo } of entries) routes[seo.path] = toEdgeRoute(seo)

const generated = `// GENERATED by scripts/generate-seo.mjs — do not edit by hand.
// Regenerate with: npm run build
//
// Imported by functions/_middleware.js to inject per-route meta and JSON-LD
// into the app shell before it reaches a crawler.

export const ROUTES = ${JSON.stringify(routes, null, 2)}

/** Game slugs are static, so an unknown one can be answered with a real 404. */
export const GAME_SLUGS = ${JSON.stringify(games.map((g) => g.id), null, 2)}

/** Fallback applied to any URL with no entry above (real 404s). */
export const NOT_FOUND = ${JSON.stringify(toEdgeRoute(notFoundSeo('/404')), null, 2)}
`

const generatedDir = resolve(root, 'generated')
if (!existsSync(generatedDir)) mkdirSync(generatedDir, { recursive: true })
writeFileSync(resolve(generatedDir, 'seo-routes.js'), generated)
console.log(
  `[seo] Wrote generated/seo-routes.js with ${Object.keys(routes).length} routes ` +
    `(${games.length} games, ${posts.length} devlog posts, ${roles.length} roles).`,
)
