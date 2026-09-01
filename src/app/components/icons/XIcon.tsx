/**
 * The X (formerly Twitter) mark.
 *
 * Drawn here rather than imported: lucide dropped brand icons, and its `X`
 * export is a close/dismiss cross — using that as a social link would read as
 * a dismiss button. Sized and coloured by `className`, like a lucide icon.
 */
export function XIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
    </svg>
  )
}
