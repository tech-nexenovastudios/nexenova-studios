// Cloudflare Pages middleware: make the raw HTML correct before any crawler
// reads it.
//
// The SPA fallback in _redirects rewrites every navigation to /index.html, so
// without this every URL would ship the homepage's <title>, canonical, OG tags
// and no structured data — the client only fixes that after executing JS, which
// social crawlers (Facebook, X, LinkedIn, Slack, Discord, WhatsApp) never do,
// and which makes the raw-HTML canonical actively wrong on every sub-page.
//
// Two jobs:
//   1. Rewrite <title>, description, robots, canonical, OG/Twitter tags and
//      inject JSON-LD per route, using the table baked at build time by
//      scripts/generate-seo.mjs (same builders the React app uses, so the
//      pre-JS and post-JS heads agree).
//   2. Give URLs that match no route a real HTTP 404 instead of a soft 404.
//
// The injected JSON-LD carries data-seo-jsonld so the client's setJsonLd()
// cleanup removes it on hydration instead of duplicating it.

import { ROUTES, GAME_SLUGS, NOT_FOUND } from '../generated/seo-routes.js'

const SITE_URL = 'https://nexenovastudios.com'

// Detail-URL families whose slugs come from Supabase. A slug published after
// the last build won't be in ROUTES yet, so these stay lenient: serve HTTP 200
// with a self-referencing canonical and let the client resolve the content (it
// applies noindex if the item really is missing). Game slugs are static, so an
// unknown one is answered with a real 404.
const DYNAMIC_PREFIXES = ['/devlog/', '/careers/']

function normalizePath(pathname) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
}

/**
 * @returns {{route: object, status: number}} the SEO record to inject and the
 * HTTP status the shell should be served with.
 */
function resolveRoute(pathname) {
  const path = normalizePath(pathname)

  const exact = ROUTES[path]
  if (exact) return { route: exact, status: 200 }

  if (path.startsWith('/game/')) {
    const slug = path.slice('/game/'.length)
    // Known slugs are already in ROUTES; anything else does not exist.
    if (!slug || !GAME_SLUGS.includes(slug)) {
      return { route: notFoundRoute(path), status: 404 }
    }
  }

  for (const prefix of DYNAMIC_PREFIXES) {
    const slug = path.startsWith(prefix) ? path.slice(prefix.length) : ''
    if (slug && !slug.includes('/')) {
      // Unknown but plausibly newer than the build: generic head, correct
      // canonical, real content and final robots value applied client-side.
      const family = prefix === '/devlog/' ? ROUTES['/devlog'] : ROUTES['/careers']
      return {
        route: { ...family, canonical: SITE_URL + path, jsonLd: [] },
        status: 200,
      }
    }
  }

  return { route: notFoundRoute(path), status: 404 }
}

function notFoundRoute(path) {
  // Self-referencing canonical on a noindex page is harmless and far safer than
  // the homepage canonical the static shell would otherwise carry.
  return { ...NOT_FOUND, canonical: SITE_URL + path }
}

const setContent = (value) => ({
  element(element) {
    element.setAttribute('content', value)
  },
})

// og:image:width/height are only meaningful for the branded card; a game page
// swaps in artwork of unknown size, so the stale 1200x630 pair is dropped.
const dimension = (route, axis) => ({
  element(element) {
    if (route.imageSize) element.setAttribute('content', route.imageSize[axis])
    else element.remove()
  },
})

function seoRewriter(route) {
  return new HTMLRewriter()
    .on('title', {
      element(element) {
        element.setInnerContent(route.title)
      },
    })
    .on('meta[name="description"]', setContent(route.description))
    .on('meta[name="robots"]', setContent(route.robots))
    .on('link[rel="canonical"]', {
      element(element) {
        element.setAttribute('href', route.canonical)
      },
    })
    .on('meta[property="og:title"]', setContent(route.title))
    .on('meta[property="og:description"]', setContent(route.description))
    .on('meta[property="og:url"]', setContent(route.canonical))
    .on('meta[property="og:type"]', setContent(route.type))
    .on('meta[property="og:image"]', setContent(route.image))
    .on('meta[property="og:image:alt"]', setContent(route.imageAlt))
    .on('meta[property="og:image:width"]', dimension(route, 'width'))
    .on('meta[property="og:image:height"]', dimension(route, 'height'))
    .on('meta[name="twitter:title"]', setContent(route.title))
    .on('meta[name="twitter:description"]', setContent(route.description))
    .on('meta[name="twitter:image"]', setContent(route.image))
    .on('head', {
      element(element) {
        for (const block of route.jsonLd) {
          element.append(
            `<script type="application/ld+json" data-seo-jsonld="true">${block}</script>`,
            { html: true },
          )
        }
      },
    })
}

export async function onRequest(context) {
  const response = await context.next()

  // Only touch SPA-shell HTML. Static assets (JS, CSS, images, robots.txt,
  // sitemap.xml) and redirects/errors already carry the right status and body.
  const contentType = response.headers.get('content-type') || ''
  if (response.status !== 200 || !contentType.includes('text/html')) {
    return response
  }

  const { pathname } = new URL(context.request.url)
  const { route, status } = resolveRoute(pathname)

  const shell = new Response(response.body, {
    status,
    statusText: status === 404 ? 'Not Found' : response.statusText,
    headers: response.headers,
  })

  return seoRewriter(route).transform(shell)
}
