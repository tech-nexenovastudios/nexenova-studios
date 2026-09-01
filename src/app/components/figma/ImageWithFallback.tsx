import React, { useState } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

// Intrinsic size hint for the common case (16:9-ish game art). Setting width and
// height — even when CSS resizes the image — lets the browser reserve space from
// the aspect ratio instead of reflowing on load, which is what CLS measures.
const DEFAULT_WIDTH = 1200
const DEFAULT_HEIGHT = 800

/**
 * <img> with a graceful fallback and layout/loading defaults.
 *
 * Every image is lazy and async-decoded unless a caller opts out (pass
 * loading="eager" fetchPriority="high" on an LCP image), and always carries
 * width/height so it can't shift the page as it loads.
 */
export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const {
    src,
    alt,
    style,
    className,
    loading = 'lazy',
    decoding = 'async',
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT,
    ...rest
  } = props

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        {/* Keep the caller's alt text: the description of what the image should
            have shown is still the useful thing for a screen reader, not the
            fact that a request failed. */}
        <img
          src={ERROR_IMG_SRC}
          alt={alt ?? ''}
          loading={loading}
          decoding={decoding}
          {...rest}
          data-original-url={src}
        />
      </div>
    </div>
  ) : (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      decoding={decoding}
      width={width}
      height={height}
      {...rest}
      onError={handleError}
    />
  )
}
