import { Link, NavLink, useLocation } from 'react-router-dom'
import BrandMark from './BrandMark.jsx'

const FRONTEND_REPO = 'https://github.com/ikbal-hussain/influenceOS-hackathon'
const BACKEND_REPO = 'https://github.com/ikbal-hussain/influenceOS-hackathon-backend'

function footerAnchor(href, children) {
  return (
    <a
      href={href}
      className="text-sm text-stone-400 transition hover:text-rose-200"
    >
      {children}
    </a>
  )
}

function footerExternal(href, children) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="text-sm text-stone-400 transition hover:text-rose-200"
    >
      {children}
    </a>
  )
}

export default function SiteFooter() {
  const year = new Date().getFullYear()
  const { pathname } = useLocation()
  const onHome = pathname === '/'

  const discoverHref = onHome ? '#discover' : '/#discover'
  const howHref = onHome ? '#how-it-works' : '/#how-it-works'
  const useCasesHref = onHome ? '#use-cases' : '/#use-cases'
  const faqHref = onHome ? '#faq' : '/#faq'

  const footerNavLinkClass = ({ isActive }) =>
    `text-sm transition ${isActive ? 'text-rose-200' : 'text-stone-400 hover:text-rose-200'}`

  return (
    <footer
      className="mt-auto border-t border-white/10 bg-gradient-to-br from-stone-900 via-stone-900 to-rose-950 text-stone-300"
      aria-label="Site"
    >
      <div className="mx-auto w-full max-w-5xl px-5 py-12 md:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              to="/"
              className="flex items-center gap-2 font-serif text-lg font-medium text-white"
            >
              <BrandMark size="sm" />
              CreatorBrief
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-stone-400">
              CreatorBrief matches brands to creators by niche, place, and audience—not follower
              counts alone. Hackathon build powered by Anakin Wire.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Product
            </h3>
            <nav className="mt-4 flex flex-col gap-2.5" aria-label="Footer product">
              {footerAnchor(discoverHref, 'Discover')}
              {footerAnchor(howHref, 'How it works')}
              {footerAnchor(useCasesHref, 'Use cases')}
              {footerAnchor(faqHref, 'FAQ')}
              <NavLink to="/dashboard" className={footerNavLinkClass}>
                Shortlist
              </NavLink>
            </nav>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Resources
            </h3>
            <nav className="mt-4 flex flex-col gap-2.5" aria-label="Footer resources">
              {footerExternal(FRONTEND_REPO, 'Frontend on GitHub')}
              {footerExternal(BACKEND_REPO, 'Backend on GitHub')}
            </nav>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Connect
            </h3>
            <div className="mt-4 flex flex-col gap-2.5 text-sm text-stone-400">
              <p>Hackathon demo · {year}</p>
              <p className="leading-relaxed">
                Questions? Open an issue on the frontend repo.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0 text-xs text-stone-500">
            © {year} CreatorBrief. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 text-xs">
            <a
              href="#"
              className="text-stone-500 transition hover:text-stone-300"
              onClick={(e) => e.preventDefault()}
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-stone-500 transition hover:text-stone-300"
              onClick={(e) => e.preventDefault()}
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
