import { useEffect } from 'react'
import {
  DEFAULT_IMAGE,
  DEFAULT_IMAGE_ALT,
  SITE_NAME,
  SITE_URL,
  TWITTER_HANDLE,
  absoluteUrl,
} from '../../../shared/seo/schema.mjs'

// The values themselves — titles, descriptions, JSON-LD — live in
// shared/seo/*.mjs so the build step and the Cloudflare middleware can bake the
// exact same head into the raw HTML (see functions/_middleware.js). This module
// is only the browser half: it applies a SeoConfig to the live document.
export {
  SITE_URL,
  SITE_NAME,
  clip,
  absoluteUrl,
  organizationLd,
  websiteLd,
  breadcrumbLd,
  videoGameLd,
  blogPostingLd,
  jobPostingLd,
} from '../../../shared/seo/schema.mjs'

export {
  homeSeo,
  devlogIndexSeo,
  careersIndexSeo,
  privacySeo,
  termsSeo,
  cookiesSeo,
  deleteAccountSeo,
  notFoundSeo,
  gameSeo,
  gameNotFoundSeo,
  devlogPostSeo,
  devlogPostNotFoundSeo,
  careerSeo,
  careerNotFoundSeo,
} from '../../../shared/seo/routes.mjs'

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
  // Removes both the blocks a previous route injected and the ones the
  // Cloudflare middleware baked into the shell (it tags them with the same
  // attribute), so the document never carries two copies of a schema.
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
  const imageAlt = cfg.image ? cfg.title : DEFAULT_IMAGE_ALT

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
  upsertMeta('property', 'og:image:alt', imageAlt)
  // Dimensions describe the default branded card only — page artwork has
  // arbitrary size, so publishing 1200x630 for it would be a lie.
  if (cfg.image) {
    document.head
      .querySelectorAll('meta[property="og:image:width"], meta[property="og:image:height"]')
      .forEach((n) => n.remove())
  } else {
    upsertMeta('property', 'og:image:width', '1200')
    upsertMeta('property', 'og:image:height', '630')
  }

  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:site', TWITTER_HANDLE)
  upsertMeta('name', 'twitter:creator', TWITTER_HANDLE)
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
