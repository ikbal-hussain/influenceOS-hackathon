import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  formatFollowers,
  cleanSnippet,
  parseFollowerCountFromText,
  sortInfluencersByFollowersDesc,
  getInfluencerRouteId,
} from '../lib/discoveryApi.js'
import { readDiscoverySnapshotFromStorage } from '../lib/discoverySnapshot.js'
import { btnPrimary, btnSecondary, cardSurface, headingDisplay } from '../lib/uiClasses.js'

function buildQuerySummary(query) {
  if (!query) return null
  const niche = query.niche || '—'
  const location = query.location || 'any location'
  const audience = query.audienceType || 'any audience'
  return `${niche} · ${location} · ${audience}`
}

function formatRelativeTime(ts) {
  if (ts == null || !Number.isFinite(ts)) return null
  const sec = Math.floor((Date.now() - ts) / 1000)
  if (sec < 45) return 'Just now'
  if (sec < 3600) {
    const m = Math.max(1, Math.floor(sec / 60))
    return `${m} min ago`
  }
  if (sec < 86400) {
    const h = Math.floor(sec / 3600)
    return `${h} hr ago`
  }
  const d = Math.floor(sec / 86400)
  return `${d} day${d === 1 ? '' : 's'} ago`
}

function initialsFromName(name) {
  if (!name || typeof name !== 'string') return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function Chip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-800 ring-1 ring-rose-100">
      {children}
    </span>
  )
}

export default function DashboardPage() {
  const location = useLocation()
  const snapshot = useMemo(() => {
    if (location.state != null) return location.state
    return readDiscoverySnapshotFromStorage()
  }, [location.state])

  const data = snapshot?.data
  const query = snapshot?.query
  const fetchedAt = snapshot?.fetchedAt
  const influencers = useMemo(() => {
    const rows = data?.influencers ?? []
    const mapped = rows.map((r) => {
      const cleaned = cleanSnippet(r.snippet)
      const followerCount =
        r.followerCount ?? parseFollowerCountFromText(r.snippet) ?? null
      return { ...r, snippet: cleaned, followerCount }
    })
    return sortInfluencersByFollowersDesc(mapped)
  }, [data])
  const summary = buildQuerySummary(query)
  const resultCount = data?.count ?? influencers.length
  const relativeUpdated = formatRelativeTime(fetchedAt)

  if (!snapshot) {
    return (
      <section className="mt-4 text-center" aria-labelledby="dashboard-empty-heading">
        <div className={`mx-auto max-w-lg px-8 py-14 ${cardSurface}`}>
          <p className="mb-2 text-sm font-medium text-rose-600">Your shortlist</p>
          <h1
            id="dashboard-empty-heading"
            className="mb-3 font-serif text-2xl font-medium text-stone-900"
          >
            No search yet
          </h1>
          <p className="mb-8 text-sm leading-relaxed text-stone-600">
            Run a discovery search from the home page—your ranked creators will appear here.
          </p>
          <Link to="/" className={btnPrimary}>
            Start discovering
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby="dashboard-heading">
      <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-rose-100 via-orange-50 to-amber-50 p-6 ring-1 ring-rose-100 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-rose-700">
              {String(query?.platform || 'instagram').toLowerCase() === 'youtube'
                ? 'YouTube shortlist'
                : 'Instagram shortlist'}
            </p>
            <h1 id="dashboard-heading" className={`mt-2 ${headingDisplay}`}>
              Creators for your brief
            </h1>
            {summary ? (
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{summary}</p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2">
              {query?.niche ? <Chip>{query.niche}</Chip> : null}
              {query?.location ? <Chip>{query.location}</Chip> : null}
              {query?.audienceType ? <Chip>{query.audienceType}</Chip> : null}
            </div>

            {relativeUpdated ? (
              <p className="mt-4 text-xs text-stone-500">Updated {relativeUpdated}</p>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-col items-stretch gap-3 sm:items-end">
            <span className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-bold tabular-nums text-rose-700 shadow-md ring-1 ring-rose-100">
              {resultCount} match{resultCount === 1 ? '' : 'es'}
            </span>
            <Link to="/" className={btnSecondary}>
              New search
            </Link>
          </div>
        </div>
      </div>

      {influencers.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-stone-200 bg-white/60 px-6 py-14 text-center">
          <p className="mb-2 text-base font-medium text-stone-900">No creators this time</p>
          <p className="mx-auto mb-8 max-w-md text-sm text-stone-600">
            Try a broader niche, another city, or a different audience—then search again.
          </p>
          <Link to="/" className={btnPrimary}>
            New search
          </Link>
        </div>
      ) : (
        <ol className="grid list-none gap-5 p-0">
          {influencers.map((it, index) => (
            <li
              key={it.id || it.profileUrl || `${it.handle}-${it.name}-${index}`}
              className="group overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-md shadow-stone-200/50 transition hover:border-rose-200 hover:shadow-lg hover:shadow-rose-100/50"
            >
              <div className="flex flex-col sm:flex-row">
                <Link
                  to={`/influencer/${encodeURIComponent(getInfluencerRouteId(it, index))}`}
                  state={snapshot}
                  className="flex min-h-[4.5rem] flex-1 flex-col gap-4 p-5 outline-none transition hover:bg-rose-50/40 focus-visible:ring-2 focus-visible:ring-rose-300 sm:flex-row sm:gap-5"
                >
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-100 to-orange-100 text-sm font-bold text-rose-800 ring-2 ring-white shadow-sm"
                    aria-hidden
                  >
                    {initialsFromName(it.name)}
                  </div>

                  <div className="min-w-0 flex-1 pt-0.5">
                    <h2 className="truncate text-lg font-semibold text-stone-900">
                      {it.name}
                    </h2>
                    {it.handle ? (
                      <p className="mt-0.5 text-sm font-medium text-rose-600">@{it.handle}</p>
                    ) : null}
                    {it.snippet ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-600">
                        {it.snippet}
                      </p>
                    ) : null}
                    <p className="mt-3 text-xs font-medium text-rose-600">
                      View profile details →
                    </p>
                  </div>
                </Link>

                <div className="flex shrink-0 flex-col gap-3 border-t border-stone-100 p-4 sm:w-44 sm:border-l sm:border-t-0 sm:items-end">
                  <div className="rounded-2xl bg-stone-50 px-4 py-3 text-center ring-1 ring-stone-100">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-stone-500">
                      {it.platform === 'youtube' ? 'Subscribers' : 'Followers'}
                    </p>
                    <p className="mt-0.5 text-xl font-bold tabular-nums text-stone-900">
                      {formatFollowers(it.followerCount)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    {it.profileUrl ? (
                      <a
                        href={it.profileUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={btnPrimary}
                      >
                        {it.platform === 'youtube' ? 'YouTube' : 'Instagram'}
                      </a>
                    ) : null}
                    {it.sourceUrl && it.sourceUrl !== it.profileUrl ? (
                      <a
                        href={it.sourceUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex rounded-full border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                      >
                        Source
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}

      <p className="mt-8 text-center text-xs leading-relaxed text-stone-500 sm:text-left">
        Results come from public web signals. Follower counts are estimates when available.
      </p>
    </section>
  )
}
