import { Link, NavLink } from 'react-router-dom'
import BrandMark from './BrandMark.jsx'

export default function SiteFooter() {
  const year = new Date().getFullYear()
  const footerNavLinkClass = ({ isActive }) =>
    `transition-colors ${isActive ? 'text-white' : 'text-zinc-300 hover:text-white'}`

  return (
    <footer
      className="mt-auto border-t-2 border-zinc-300 bg-zinc-950 px-5 py-6 text-zinc-200 dark:border-zinc-800"
      aria-label="Site"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="text-left">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[-0.045em] text-zinc-50"
          >
            <BrandMark size="sm" />
            InfluenceOS
          </Link>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-300/90">
            Find creators that fit your niche, place, and audience without drowning in
            tabs.
          </p>
        </div>
        <nav
          className="flex flex-col gap-3 text-sm font-medium md:items-end"
          aria-label="Footer"
        >
          <NavLink to="/" end className={footerNavLinkClass}>
            Discovery
          </NavLink>
          <NavLink to="/dashboard" className={footerNavLinkClass}>
            Dashboard
          </NavLink>
        </nav>
      </div>

      <div className="mx-auto mt-6 w-full max-w-5xl border-t border-white/10 pt-4">
        <p className="m-0 font-mono text-[11px] text-zinc-400">
          © {year} InfluenceOS · Creator discovery prototype. Data-informed outreach, less
          manual search.
        </p>
      </div>
    </footer>
  )
}
