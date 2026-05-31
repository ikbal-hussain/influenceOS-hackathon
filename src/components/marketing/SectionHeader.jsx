import { eyebrow } from '../../lib/uiClasses.js'

export default function SectionHeader({ label, title, subtitle, className = '', id }) {
  return (
    <header className={`mb-8 text-center md:mb-10 md:text-left ${className}`.trim()}>
      {label ? <p className={`mb-2 ${eyebrow}`}>{label}</p> : null}
      <h2
        id={id}
        className="font-serif text-[clamp(1.5rem,3vw,2rem)] font-medium tracking-tight text-stone-900"
      >
        {title}
      </h2>
      {subtitle ? (
        <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-stone-600 md:mx-0">
          {subtitle}
        </p>
      ) : null}
    </header>
  )
}
