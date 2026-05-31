import { Link, NavLink } from 'react-router-dom'
import BrandMark from './BrandMark.jsx'

export default function SiteFooter() {
  const year = new Date().getFullYear()
  const footerNavLinkClass = ({ isActive }) =>
    `transition-colors ${isActive ? 'text-rose-700' : 'text-stone-600 hover:text-rose-600'}`

  return (
    <footer
      className="mt-auto border-t border-stone-200/90 bg-white/60 px-5 py-8 backdrop-blur-sm"
      aria-label="Site"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="text-left">
          <Link
            to="/"
            className="flex items-center gap-2 font-serif text-base font-medium text-stone-900"
          >
            <BrandMark size="sm" />
            InfluenceOS
          </Link>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-stone-600">
            Match brands with creators using niche, place, and audience signals—not follower
            counts alone.
          </p>
        </div>
        <nav
          className="flex flex-col gap-2 text-sm font-medium md:items-end"
          aria-label="Footer"
        >
          <NavLink to="/" end className={footerNavLinkClass}>
            Discover
          </NavLink>
          <NavLink to="/dashboard" className={footerNavLinkClass}>
            Shortlist
          </NavLink>
        </nav>
      </div>

      <div className="mx-auto mt-6 w-full max-w-5xl border-t border-stone-200 pt-4">
        <p className="m-0 text-xs text-stone-500">
          © {year} InfluenceOS · Built for smarter creator partnerships.
        </p>
      </div>
    </footer>
  )
}
