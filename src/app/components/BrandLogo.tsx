import { useState } from 'react'

/**
 * The Nexenova mark.
 *
 *   public/logo-mark.png    the star, on its own (square)
 *   public/logo-lockup.png  star + "NEXENOVA STUDIOS" wordmark (horizontal)
 *
 * On screen we pair the star with LIVE TEXT rather than using the horizontal
 * artwork. The artwork's wordmark is brand purple, drawn for a white ground —
 * on this theme's near-black it measures 2.9:1, well under the 4.5:1 floor,
 * and "STUDIOS" stops being readable around navbar size. Live text is set in
 * the site's own display face, inherits the theme, scales, and is selectable.
 *
 * The horizontal artwork is still the canonical logo and is used where it is
 * rendered large on its own ground: the social card and structured data.
 * If a knockout (light) version of the lockup ever lands, `variant="lockup"`
 * can take over here.
 */
interface BrandLogoProps {
  variant?: 'lockup' | 'mark'
  className?: string
  /** Height utility for the star, e.g. 'h-9'. */
  size?: string
  /** Tailwind text size for the wordmark. */
  textSize?: string
}

export function BrandLogo({
  variant = 'mark',
  className = '',
  size = 'h-9',
  textSize = 'text-xl',
}: BrandLogoProps) {
  const [lockupFailed, setLockupFailed] = useState(false)

  if (variant === 'lockup' && !lockupFailed) {
    return (
      <img
        src="/logo-lockup.png"
        alt="Nexenova Studios"
        className={`${size} w-auto shrink-0 ${className}`}
        onError={() => setLockupFailed(true)}
      />
    )
  }

  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/logo-mark.png"
        alt=""
        aria-hidden="true"
        className={`${size} w-auto shrink-0`}
      />
      <span className="flex items-baseline gap-1.5">
        <span className={`font-display ${textSize} font-extrabold tracking-tight text-foreground`}>
          Nexenova
        </span>
        <span className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-[var(--brand-cyan)]">
          Studios
        </span>
      </span>
    </span>
  )
}
