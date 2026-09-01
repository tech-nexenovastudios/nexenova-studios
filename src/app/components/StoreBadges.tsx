/**
 * Store links for a game card.
 *
 * These are simple glyph + label buttons, not Google's and Apple's official
 * badge artwork. Both companies publish badges under brand guidelines that
 * require their exact files (wordmark, clear space, minimum size), so for a
 * public store listing you should drop the official assets into public/ and
 * swap them in here. This keeps the card working in the meantime.
 *
 * A game with no URL yet renders a disabled control rather than a dead link,
 * so an unreleased title still reads as "not out yet" instead of broken.
 */

function GooglePlayGlyph({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M3.6 1.9 13.4 11.7l-2.3 2.3L3.1 22a1.3 1.3 0 0 1-.6-1.1V3a1.3 1.3 0 0 1 .5-1.1Z" opacity=".95" />
      <path d="M16.9 8.4 5.6 1.9a1.4 1.4 0 0 0-1.3-.1l9.7 9.7Z" opacity=".72" />
      <path d="M16.9 15.6 5.6 22.1a1.4 1.4 0 0 1-1.3.1l9.7-9.7Z" opacity=".72" />
      <path d="m17.6 8.8 3 1.8c1 .6 1 1.9 0 2.5l-3 1.8-2.9-3Z" opacity=".55" />
    </svg>
  )
}

function AppleGlyph({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M16.4 12.6c0-2.6 2.1-3.9 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.8 1.3 10.3.9 1.3 1.9 2.7 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5.7-1 1-2 1-2.1 0 0-2.4-1-2.4-3.9Z" />
      <path d="M14 4.9c.7-.9 1.2-2.1 1-3.3-1 0-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.2 1.2.1 2.4-.6 3.1-1.5Z" />
    </svg>
  )
}

interface StoreBadgesProps {
  playStoreUrl?: string
  appStoreUrl?: string
  title: string
}

const base =
  'flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors'

export function StoreBadges({ playStoreUrl, appStoreUrl, title }: StoreBadgesProps) {
  const stores = [
    { name: 'Google Play', url: playStoreUrl, Glyph: GooglePlayGlyph },
    { name: 'App Store', url: appStoreUrl, Glyph: AppleGlyph },
  ]

  return (
    <div className="flex flex-col gap-2 lg:flex-row">
      {stores.map(({ name, url, Glyph }) =>
        url ? (
          <a
            key={name}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            // The card behind this is clickable; don't let it swallow the tap.
            onClick={e => e.stopPropagation()}
            className={`${base} bg-white text-black hover:bg-white/85`}
            aria-label={`Get ${title} on ${name}`}
          >
            <Glyph className="h-4 w-4 shrink-0" />
            {name}
          </a>
        ) : (
          <span
            key={name}
            aria-disabled="true"
            title={`${title} is not on ${name} yet`}
            className={`${base} cursor-not-allowed border border-white/15 bg-white/5 text-white/40`}
          >
            <Glyph className="h-4 w-4 shrink-0" />
            {name}
          </span>
        ),
      )}
    </div>
  )
}
