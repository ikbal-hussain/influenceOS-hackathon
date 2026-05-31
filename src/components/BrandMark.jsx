const sizeClass = {
  md: 'h-9 w-9 text-sm',
  sm: 'h-8 w-8 text-xs',
}

export default function BrandMark({ size = 'md', className = '' }) {
  const dim = sizeClass[size] || sizeClass.md
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-400 font-bold text-white shadow-md shadow-rose-400/35 ${dim} ${className}`.trim()}
    >
      IO
    </span>
  )
}
