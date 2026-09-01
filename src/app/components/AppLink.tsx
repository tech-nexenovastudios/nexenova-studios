import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react'

interface AppLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> {
  /** Real, absolute-from-root URL — e.g. "/game/bird-hunter". */
  href: string
  /** Client-side navigation to run instead of a full page load. */
  onNavigate?: () => void
  children: ReactNode
}

/**
 * Internal navigation as a real <a href>.
 *
 * The app routes with history.pushState, but crawlers do not click buttons and
 * keyboard users cannot tab to a <div onClick>. Every internal destination
 * therefore ships a genuine anchor: Googlebot follows the href, middle-click
 * and ⌘-click open a tab, and the SPA still handles a plain left click.
 *
 * Modified clicks (⌘/Ctrl/Shift/Alt), non-primary buttons, and already-default-
 * prevented events fall through to the browser on purpose.
 */
/**
 * True when the browser should handle the click itself: new tab/window, save,
 * or a non-primary mouse button.
 */
export function isModifiedClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
}

/**
 * onClick handler for anchors that AppLink can't wrap — e.g. `motion.a`, where
 * the animation props have to live on the element itself. Same contract:
 * intercept a plain left click, defer everything else to the browser.
 */
export function handleNavClick(onNavigate?: () => void) {
  return (event: MouseEvent<HTMLAnchorElement>) => {
    if (!onNavigate || isModifiedClick(event)) return
    event.preventDefault()
    onNavigate()
  }
}

export function AppLink({ href, onNavigate, children, ...rest }: AppLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!onNavigate || isModifiedClick(event)) return
    event.preventDefault()
    onNavigate()
  }

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}

/**
 * Same-page section link ("/#about"). On the home page it smooth-scrolls; from
 * any other route the browser follows the href and lands on the section.
 */
export function SectionLink({
  hash,
  children,
  ...rest
}: { hash: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  const id = hash.replace(/^#/, '')

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (isModifiedClick(event)) return
    const target = document.getElementById(id)
    if (!target) return // not on this page — let the browser navigate to /#id
    event.preventDefault()
    target.scrollIntoView({ behavior: 'smooth' })
    // Keep the URL shareable without pushing a history entry per scroll.
    window.history.replaceState({}, '', `/#${id}`)
  }

  return (
    <a href={`/#${id}`} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}
