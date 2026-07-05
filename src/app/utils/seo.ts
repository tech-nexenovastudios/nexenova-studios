import { useEffect } from 'react'

// Absolute origin of the production site. Used to build canonical/OG URLs and
// the sitemap. Update here if the primary domain ever changes.
export const SITE_URL = 'https://nexenovastudios.com'
export const SITE_NAME = 'Nexenova Studios'

// Default social share image: a 1200×630 PNG (raster — SVG isn't rendered by
// Facebook/LinkedIn/X crawlers). Game and devlog pages override this with their
// own artwork; other routes fall back to this branded card.
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`

export interface SeoConfig {
  /** Full <title> text (also used for og:title / twitter:title). */
  title: string
  /** Meta description, ~150–160 chars. */
  description: string
  /** Canonical path beginning with "/", e.g. "/game/bird-hunter". */
  path: string
  /** Absolute image URL, or a site-relative path. Falls back to DEFAULT_IMAGE. */
  image?: string | null
  /** Open Graph type. "article" for devlog posts. */
  type?: 'website' | 'article'
  /** Robots directive; pass "noindex,follow" for thin/utility pages. */
  robots?: string
  /** JSON-LD structured data object(s) to inject. */
  jsonLd?: object | object[] | null
}

/** Clip text to a clean, snippet-friendly length on a word boundary. */
export function clip(text: string, max = 160): string {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…'
}

function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  return SITE_URL + (pathOrUrl.startsWith('/') ? '' : '/') + pathOrUrl
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function setJsonLd(data: SeoConfig['jsonLd']) {
  // Remove previously-injected blocks so stale schema doesn't linger between routes.
  document.head
    .querySelectorAll('script[data-seo-jsonld]')
    .forEach((n) => n.remove())
  if (!data) return
  const list = Array.isArray(data) ? data : [data]
  for (const item of list) {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.setAttribute('data-seo-jsonld', 'true')
    script.textContent = JSON.stringify(item)
    document.head.appendChild(script)
  }
}

/**
 * Imperatively apply per-route SEO: title, description, canonical, robots,
 * Open Graph, Twitter card, and JSON-LD. Safe to call on every navigation.
 */
export function applySeo(cfg: SeoConfig): void {
  const url = absoluteUrl(cfg.path)
  const image = absoluteUrl(cfg.image || DEFAULT_IMAGE)

  document.title = cfg.title
  upsertMeta('name', 'description', cfg.description)
  upsertMeta('name', 'robots', cfg.robots ?? 'index,follow')
  upsertLink('canonical', url)

  upsertMeta('property', 'og:title', cfg.title)
  upsertMeta('property', 'og:description', cfg.description)
  upsertMeta('property', 'og:url', url)
  upsertMeta('property', 'og:type', cfg.type ?? 'website')
  upsertMeta('property', 'og:site_name', SITE_NAME)
  upsertMeta('property', 'og:image', image)

  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', cfg.title)
  upsertMeta('name', 'twitter:description', cfg.description)
  upsertMeta('name', 'twitter:image', image)

  setJsonLd(cfg.jsonLd)
}

/** React hook: apply SEO for the current route; re-runs when identity changes. */
export function useSeo(cfg: SeoConfig): void {
  useEffect(() => {
    applySeo(cfg)
    // Serialize so callers don't need to memoize the config object.
  }, [cfg.path, cfg.title, cfg.description, cfg.image, cfg.type, cfg.robots, JSON.stringify(cfg.jsonLd)])
}

// ---------------------------------------------------------------------------
// JSON-LD builders
// ---------------------------------------------------------------------------

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    alternateName: 'Nexenova',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    slogan: 'An AI-powered indie mobile game studio built for rapid prototyping.',
    description:
      'Nexenova Studios is an indie mobile game studio in India that uses AI and rapid prototyping to build and ship puzzle, casual, arcade, and action games worldwide.',
    email: 'tech@nexenovastudios.com',
    foundingLocation: { '@type': 'Place', name: 'India' },
    address: { '@type': 'PostalAddress', addressCountry: 'IN' },
    knowsAbout: [
      'Indie mobile game development',
      'AI-assisted game development',
      'Rapid game prototyping',
      'Puzzle games',
      'Casual and hyper-casual games',
      'Arcade games',
    ],
  }
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
  }
}

interface GameLike {
  id: string
  title: string
  description: string
  image?: string
  genre?: string
  platform?: string[]
  rating?: number
  status?: string
}

export function videoGameLd(game: GameLike) {
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: game.title,
    description: clip(game.description, 300),
    url: `${SITE_URL}/game/${game.id}`,
    image: game.image ? absoluteUrl(game.image) : undefined,
    genre: game.genre,
    gamePlatform: game.platform,
    applicationCategory: 'GameApplication',
    operatingSystem: game.platform?.join(', '),
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  }
  if (game.rating && game.rating > 0) {
    ld.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: game.rating,
      bestRating: 5,
      ratingCount: 1,
    }
  }
  return ld
}

interface PostLike {
  slug: string
  title: string
  excerpt: string | null
  cover_image: string | null
  published_at: string
  updated_at?: string
}

export function blogPostingLd(post: PostLike) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.cover_image ? absoluteUrl(post.cover_image) : undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    url: `${SITE_URL}/devlog/${post.slug}`,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.svg` },
    },
  }
}

interface RoleLike {
  slug: string
  title: string
  location: string | null
  employment_type: string | null
  short_summary: string | null
  description: string
  posted_at: string
  closed_at: string | null
}

export function jobPostingLd(role: RoleLike) {
  const remote = /remote/i.test(role.location || '')
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: role.title,
    description: role.description,
    datePosted: role.posted_at,
    validThrough: role.closed_at || undefined,
    employmentType: (role.employment_type || 'FULL_TIME')
      .toUpperCase()
      .replace(/[\s-]+/g, '_'),
    hiringOrganization: {
      '@type': 'Organization',
      name: SITE_NAME,
      sameAs: SITE_URL,
      logo: `${SITE_URL}/logo.svg`,
    },
    directApply: true,
  }
  if (role.location) {
    ld.jobLocation = {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: role.location, addressCountry: 'IN' },
    }
  }
  if (remote) {
    ld.jobLocationType = 'TELECOMMUTE'
    ld.applicantLocationRequirements = { '@type': 'Country', name: 'India' }
  }
  return ld
}
