const sizeClass = {
  md: 'h-8 w-8',
  sm: 'h-7 w-7',
}

/**
 * Favicon as brand mark; decorative when used next to the wordmark inside the same link.
 */
export default function BrandMark({ size = 'md', className = '' }) {
  const dim = sizeClass[size] || sizeClass.md
  return (
    <img
      src="/favicon.svg"
      alt=""
      aria-hidden="true"
      className={`shrink-0 rounded-sm ${dim} ${className}`.trim()}
    />
  )
}
