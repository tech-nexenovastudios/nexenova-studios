// Framework-free SEO primitives and JSON-LD builders.
//
// This module is the single source of truth for every meta value and every
// structured-data block on the site. It is imported by three very different
// consumers, so it must stay free of DOM, React, and Node APIs:
//
//   1. src/app/utils/seo.ts  — applies the values client-side on navigation.
//   2. scripts/generate-seo.mjs — bakes them into sitemap.xml and the edge
//      route table at build time.
//   3. functions/_middleware.js (via generated/seo-routes.js) — injects them
//      into the raw HTML so crawlers that never execute JS see them.
//
// Keeping one implementation means the client and the edge can never drift.

export const SITE_URL = 'https://nexenovastudios.com'
export const SITE_NAME = 'Nexenova Studios'

/**
 * Default social share card: a 1200x630 raster (SVG is not rendered by social
 * crawlers). JPEG rather than PNG — the PNG of the same card was 750 kB, and
 * some scrapers give up on images that large.
 */
export const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`
export const DEFAULT_IMAGE_ALT = 'Nexenova Studios — AI-powered indie mobile game studio'

/**
 * Google's logo guidelines expect a raster image; SVG support is inconsistent,
 * so Organization/publisher logos point at the 512px PNG.
 */
export const LOGO_URL = `${SITE_URL}/icon-512.png`

/**
 * Social profiles — used for Organization.sameAs (the strongest entity
 * disambiguation signal available). Keep in sync with the links in Footer.tsx.
 */
export const SOCIAL_PROFILES = [
  'https://twitter.com/nexenovastudios',
  'https://linkedin.com/company/nexenovastudios',
  'https://github.com/tech-nexenovastudios',
  'https://youtube.com/@nexenovastudios',
]

/** Twitter/X handle used for twitter:site and twitter:creator. */
export const TWITTER_HANDLE = '@nexenovastudios'

/** Clip text to a clean, snippet-friendly length on a word boundary. */
export function clip(text, max = 160) {
  const t = String(text || '').replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…'
}

export function absoluteUrl(pathOrUrl) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  return SITE_URL + (pathOrUrl.startsWith('/') ? '' : '/') + pathOrUrl
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
    logo: LOGO_URL,
    sameAs: SOCIAL_PROFILES,
    slogan: 'An AI-powered indie mobile game studio built for rapid prototyping.',
    description:
      'Nexenova Studios is an indie mobile game studio in India that uses AI and rapid prototyping to build and ship puzzle, casual, arcade, and action games worldwide.',
    email: 'support@nexenovastudios.com',
    foundingLocation: { '@type': 'Place', name: 'India' },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '6th Floor, ALTF Coworking Space, Sector 142',
      addressLocality: 'Noida',
      addressRegion: 'Uttar Pradesh',
      addressCountry: 'IN',
    },
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

/**
 * BreadcrumbList for a detail page. `trail` is an ordered list of
 * `{ name, path }` starting below the home page, which is added automatically.
 */
export function breadcrumbLd(trail) {
  const items = [{ name: 'Home', path: '/' }, ...trail]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function videoGameLd(game) {
  const ld = {
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
  // NOTE: no aggregateRating. Review markup requires reviews that are visible
  // on the page; emitting a synthetic rating (as an earlier revision did, with
  // a hardcoded ratingCount of 1) violates Google's structured-data policy and
  // risks a manual action. Re-add only when real, on-page store ratings exist.
  return ld
}

export function blogPostingLd(post) {
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
      logo: { '@type': 'ImageObject', url: LOGO_URL },
    },
  }
}

export function jobPostingLd(role) {
  const remote = /remote/i.test(role.location || '')
  const ld = {
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
      logo: LOGO_URL,
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
