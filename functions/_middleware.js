// Cloudflare Pages middleware: give non-existent URLs a real HTTP 404.
//
// The SPA fallback in _redirects rewrites every navigation to /index.html with
// HTTP 200 so the client router can render it. That is correct for real routes
// but turns unknown URLs into "soft 404s" (HTTP 200 on a page that doesn't
// exist), which Google Search flags. This middleware inspects the resolved
// response and, for navigation requests that don't match a known route family,
// re-emits the same app-shell body with a 404 status. The React app then
// renders its in-app 404 page — same look, honest status code.
//
// Keep the route list in sync with the client router (src/app/components/Router.tsx).

const KNOWN_EXACT = new Set(['/', '/devlog', '/careers', '/privacy', '/terms', '/cookies', '/coda-return'])

// A path is known if it's one of the exact routes above, or a detail URL under
// one of these families with a non-empty slug (e.g. /game/bird-hunter). Whether
// that specific slug exists is decided client-side (dynamic content), where a
// missing item renders the in-app 404 with a noindex tag.
const KNOWN_PREFIXES = ['/game/', '/devlog/', '/careers/']

function isKnownRoute(pathname) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  if (KNOWN_EXACT.has(path)) return true
  return KNOWN_PREFIXES.some((p) => path.startsWith(p) && path.length > p.length)
}

export async function onRequest(context) {
  const response = await context.next()

  // Only touch the SPA-shell HTML responses. Real static assets (JS, CSS,
  // images, robots.txt, sitemap.xml) and redirects/errors already carry the
  // right status and are left untouched.
  const contentType = response.headers.get('content-type') || ''
  if (response.status !== 200 || !contentType.includes('text/html')) {
    return response
  }

  const { pathname } = new URL(context.request.url)
  if (isKnownRoute(pathname)) return response

  return new Response(response.body, {
    status: 404,
    statusText: 'Not Found',
    headers: response.headers,
  })
}
