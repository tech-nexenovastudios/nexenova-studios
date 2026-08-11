// Per-route SEO definitions — the single source of truth for every title,
// description, canonical path, and JSON-LD block on the site.
//
// The React app imports these builders (via src/app/utils/seo.ts) and applies
// them on navigation; scripts/generate-seo.mjs runs the same builders at build
// time to produce sitemap.xml and the edge route table that
// functions/_middleware.js injects into the raw HTML. One implementation, so
// what a crawler reads before JS runs matches what the app renders after.

import {
  SITE_NAME,
  breadcrumbLd,
  blogPostingLd,
  clip,
  jobPostingLd,
  organizationLd,
  videoGameLd,
  websiteLd,
} from './schema.mjs'

export const HOME_TITLE = 'Nexenova Studios — AI-Powered Indie Mobile Game Studio'
export const HOME_DESCRIPTION =
  'Nexenova Studios is an indie mobile game studio in India using AI and rapid prototyping to build and ship puzzle, casual, arcade, and action games worldwide.'

// ---------------------------------------------------------------------------
// Static routes
// ---------------------------------------------------------------------------

export function homeSeo() {
  return {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    path: '/',
    jsonLd: [organizationLd(), websiteLd()],
  }
}

export function devlogIndexSeo() {
  return {
    title: `Devlog — Behind Our Mobile Games | ${SITE_NAME}`,
    description:
      'Development updates, design deep-dives, and behind-the-scenes notes from the Nexenova Studios game team.',
    path: '/devlog',
    jsonLd: breadcrumbLd([{ name: 'Devlog', path: '/devlog' }]),
  }
}

export function careersIndexSeo() {
  return {
    title: `Careers — Build Mobile Games With Us | ${SITE_NAME}`,
    description:
      'Open roles at Nexenova Studios. Join an independent mobile game studio shipping puzzle, casual, and arcade titles worldwide.',
    path: '/careers',
    jsonLd: breadcrumbLd([{ name: 'Careers', path: '/careers' }]),
  }
}

export function privacySeo() {
  return {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: 'How Nexenova Studios collects, uses, and protects your data.',
    path: '/privacy',
  }
}

export function termsSeo() {
  return {
    title: `Terms of Service | ${SITE_NAME}`,
    description: 'The terms governing use of the Nexenova Studios website and games.',
    path: '/terms',
  }
}

export function cookiesSeo() {
  return {
    title: `Cookie Policy | ${SITE_NAME}`,
    description: 'How Nexenova Studios uses cookies and similar technologies.',
    path: '/cookies',
  }
}

export function deleteAccountSeo() {
  return {
    title: `Delete Your Account | ${SITE_NAME}`,
    description:
      'Request permanent deletion of your Nexenova Studios game account and associated data. No app install required.',
    path: '/delete-account',
    robots: 'noindex,follow',
  }
}

export function notFoundSeo(path = '/404') {
  return {
    title: `Page Not Found | ${SITE_NAME}`,
    description: HOME_DESCRIPTION,
    path,
    robots: 'noindex,follow',
  }
}

// ---------------------------------------------------------------------------
// Detail routes
// ---------------------------------------------------------------------------

export function gameSeo(game) {
  return {
    title: `${game.title} — ${game.genre} Mobile Game | ${SITE_NAME}`,
    description: clip(game.description),
    path: `/game/${game.id}`,
    image: game.image,
    jsonLd: [
      videoGameLd(game),
      breadcrumbLd([
        { name: 'Games', path: '/#portfolio' },
        { name: game.title, path: `/game/${game.id}` },
      ]),
    ],
  }
}

export function gameNotFoundSeo(id) {
  return {
    title: `Game Not Found | ${SITE_NAME}`,
    description: HOME_DESCRIPTION,
    path: `/game/${id}`,
    robots: 'noindex,follow',
  }
}

export function devlogPostSeo(post) {
  return {
    title: `${post.title} — Devlog | ${SITE_NAME}`,
    description: clip(post.excerpt || post.body || ''),
    path: `/devlog/${post.slug}`,
    image: post.cover_image,
    type: 'article',
    jsonLd: [
      blogPostingLd(post),
      breadcrumbLd([
        { name: 'Devlog', path: '/devlog' },
        { name: post.title, path: `/devlog/${post.slug}` },
      ]),
    ],
  }
}

export function devlogPostNotFoundSeo(slug) {
  return {
    title: `Post Not Found — Devlog | ${SITE_NAME}`,
    description: 'This devlog post could not be found.',
    path: `/devlog/${slug}`,
    robots: 'noindex,follow',
  }
}

export function careerSeo(role) {
  const meta = [role.employment_type, role.location].filter(Boolean).join(' · ')
  return {
    title: `${role.title} — Careers | ${SITE_NAME}`,
    description: clip(
      role.short_summary ||
        `${role.title}${meta ? ` (${meta})` : ''} at ${SITE_NAME}. ${role.description}`,
    ),
    path: `/careers/${role.slug}`,
    jsonLd: [
      jobPostingLd(role),
      breadcrumbLd([
        { name: 'Careers', path: '/careers' },
        { name: role.title, path: `/careers/${role.slug}` },
      ]),
    ],
  }
}

export function careerNotFoundSeo(slug) {
  return {
    title: `Role Not Found — Careers | ${SITE_NAME}`,
    description: 'This role could not be found.',
    path: `/careers/${slug}`,
    robots: 'noindex,follow',
  }
}

// ---------------------------------------------------------------------------
// Build-time route table
// ---------------------------------------------------------------------------

/**
 * Every URL the site serves, with its SEO config and sitemap metadata.
 * `sitemap: null` means the URL is intentionally excluded from sitemap.xml.
 *
 * @param {object} data
 * @param {any[]} data.games   games.seed.json contents
 * @param {any[]} [data.posts] published devlog posts (Supabase)
 * @param {any[]} [data.roles] open career roles (Supabase)
 */
export function buildRouteTable({ games = [], posts = [], roles = [] }) {
  const today = new Date().toISOString().slice(0, 10)
  const day = (value) => (value || '').slice(0, 10) || undefined

  /** @type {{seo: object, sitemap: object|null}[]} */
  const entries = [
    { seo: homeSeo(), sitemap: { changefreq: 'weekly', priority: 1.0, lastmod: today } },
    { seo: devlogIndexSeo(), sitemap: { changefreq: 'weekly', priority: 0.7, lastmod: today } },
    { seo: careersIndexSeo(), sitemap: { changefreq: 'weekly', priority: 0.7, lastmod: today } },
    { seo: privacySeo(), sitemap: { changefreq: 'yearly', priority: 0.2, lastmod: today } },
    { seo: termsSeo(), sitemap: { changefreq: 'yearly', priority: 0.2, lastmod: today } },
    { seo: cookiesSeo(), sitemap: { changefreq: 'yearly', priority: 0.2, lastmod: today } },
    // Utility page: reachable and linked, but noindex — never in the sitemap.
    { seo: deleteAccountSeo(), sitemap: null },
  ]

  for (const game of games) {
    entries.push({
      seo: gameSeo(game),
      sitemap: {
        changefreq: 'monthly',
        priority: 0.8,
        lastmod: day(game.updatedAt || game.createdAt),
      },
    })
  }

  for (const post of posts) {
    entries.push({
      seo: devlogPostSeo(post),
      sitemap: {
        changefreq: 'monthly',
        priority: 0.6,
        lastmod: day(post.updated_at || post.published_at),
      },
    })
  }

  for (const role of roles) {
    entries.push({
      seo: careerSeo(role),
      sitemap: { changefreq: 'weekly', priority: 0.6, lastmod: day(role.updated_at) },
    })
  }

  return entries
}
