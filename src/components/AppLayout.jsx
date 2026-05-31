import { Link, NavLink, Outlet } from 'react-router-dom'
import BrandMark from './BrandMark.jsx'
import SiteFooter from './SiteFooter.jsx'

const navLinkClass = ({ isActive }) =>
  `transition-colors ${
    isActive
      ? 'text-zinc-900 dark:text-zinc-50'
      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
  }`

export default function AppLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-zinc-50 text-zinc-700 antialiased dark:bg-zinc-950 dark:text-zinc-400">
      <header className="flex items-center justify-between gap-4 border-b-2 border-zinc-300 bg-zinc-50 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <Link
          to="/"
          className="flex items-center gap-2 text-base font-extrabold uppercase tracking-[-0.045em] text-zinc-900 dark:text-zinc-50"
        >
          <BrandMark size="md" />
          InfluenceOS
        </Link>
        <nav className="flex gap-5 text-sm font-medium" aria-label="Primary">
          <NavLink to="/" end className={navLinkClass}>
            Discovery
          </NavLink>
          <NavLink to="/dashboard" className={navLinkClass}>
            Dashboard
          </NavLink>
          <span className="text-zinc-500">Campaigns</span>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  )
}
