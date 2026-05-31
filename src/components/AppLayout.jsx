import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import BrandMark from './BrandMark.jsx'
import SiteFooter from './SiteFooter.jsx'

const navLinkClass = ({ isActive }) =>
  `rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-rose-100 text-rose-800'
      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
  }`

const anchorClass =
  'hidden rounded-full px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 sm:inline'

export default function AppLayout() {
  const { pathname } = useLocation()
  const onHome = pathname === '/'

  return (
    <div className="flex min-h-svh flex-col text-stone-700">
      <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-white/75 px-5 py-3 shadow-sm shadow-stone-200/30 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-serif text-lg font-medium tracking-tight text-stone-900"
          >
            <BrandMark size="md" />
            InfluenceOS
          </Link>
          <nav className="flex items-center gap-1" aria-label="Primary">
            {onHome ? (
              <>
                <a href="#how-it-works" className={anchorClass}>
                  How it works
                </a>
                <a href="#faq" className={anchorClass}>
                  FAQ
                </a>
              </>
            ) : null}
            <NavLink to="/" end className={navLinkClass}>
              Discover
            </NavLink>
            <NavLink to="/dashboard" className={navLinkClass}>
              Shortlist
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  )
}
