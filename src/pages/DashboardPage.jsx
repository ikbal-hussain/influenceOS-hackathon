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

function buildQuerySummary(query) {
  if (!query) return null
  const niche = query.niche || '—'
  const location = query.location || 'any location'
  const audience = query.audienceType || 'any audience'
  return `${niche} creators in ${location} for ${audience}`
}

function formatRelativeTime(ts) {
  if (ts == null || !Number.isFinite(ts)) return null
  const sec = Math.floor((Date.now() - ts) / 1000)
  if (sec < 45) return 'Updated moments ago'
  if (sec < 3600) {
    const m = Math.max(1, Math.floor(sec / 60))
    return `Updated ${m} min ago`
  }
  if (sec < 86400) {
    const h = Math.floor(sec / 3600)
    return `Updated ${h} hr ago`
  }
  const d = Math.floor(sec / 86400)
  return `Updated ${d} day${d === 1 ? '' : 's'} ago`
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
    <span className="inline-flex items-center rounded-full border border-zinc-200/90 bg-white/80 px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-200">
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
      <section className="mt-2 text-center" aria-labelledby="dashboard-empty-heading">
        <div className="mx-auto max-w-lg rounded-2xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50 px-8 py-12 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
          <div className="mx-auto mb-6 h-px w-16 bg-gradient-to-r from-transparent via-teal-500/60 to-transparent dark:via-teal-400/50" />
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-400">
            Dashboard
          </p>
          <h1
            id="dashboard-empty-heading"
            className="mb-3 text-2xl font-bold tracking-[-0.03em] text-zinc-900 dark:text-zinc-50"
          >
            No search yet
          </h1>
          <p className="mb-8 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Run discovery from the home page—your ranked creator shortlist will land here.
          </p>
          <Link
            to="/"
            className="inline-flex rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-teal-700 hover:shadow-lg dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400"
          >
            Run a search
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby="dashboard-heading">
      <div className="mb-8 rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-50/95 via-white to-zinc-50 p-6 shadow-sm dark:border-teal-500/15 dark:from-teal-950/35 dark:via-zinc-900 dark:to-zinc-950 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-800 dark:text-teal-300">
              Your shortlist · Instagram
            </p>
            <h1
              id="dashboard-heading"
              className="mt-2 text-[clamp(1.45rem,3.2vw,1.95rem)] font-bold tracking-[-0.035em] text-zinc-900 dark:text-zinc-50"
            >
              Creators picked for your brief
            </h1>
            {summary ? (
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {summary}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2">
              {query?.niche ? <Chip>Niche · {query.niche}</Chip> : null}
              {query?.location ? <Chip>Location · {query.location}</Chip> : null}
              {query?.audienceType ? <Chip>Audience · {query.audienceType}</Chip> : null}
            </div>

            {relativeUpdated ? (
              <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">{relativeUpdated}</p>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-col items-stretch gap-3 sm:items-end">
            <span className="inline-flex items-center justify-center rounded-full bg-teal-600 px-4 py-2 text-sm font-bold tabular-nums text-white shadow-md dark:bg-teal-500 dark:text-zinc-950">
              {resultCount} creator{resultCount === 1 ? '' : 's'}
            </span>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl border-2 border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:border-zinc-500 dark:hover:bg-zinc-700/80"
            >
              New search
            </Link>
          </div>
        </div>
      </div>

      {influencers.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50/80 px-6 py-14 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
          <p className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
            No creators this time
          </p>
          <p className="mx-auto mb-8 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
            Try a broader niche, another city, or a different audience—then run search again.
          </p>
          <Link
            to="/"
            className="inline-flex rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-teal-700 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400"
          >
            New search
          </Link>
        </div>
      ) : (
        <ol className="grid list-none gap-4 p-0">
          {influencers.map((it, index) => (
            <li
              key={it.id || it.profileUrl || `${it.handle}-${it.name}-${index}`}
              className="group relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm transition-all duration-200 hover:border-teal-400/45 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900/85 dark:hover:border-teal-500/35"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(20,184,166,0.07)_0%,transparent_48%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:bg-[linear-gradient(135deg,rgba(20,184,166,0.1)_0%,transparent_48%)]"
              />
              <div className="relative flex flex-col sm:flex-row">
                <Link
                  to={`/influencer/${encodeURIComponent(getInfluencerRouteId(it, index))}`}
                  state={snapshot}
                  className="flex min-h-[4.5rem] flex-1 flex-col gap-4 p-4 outline-none ring-teal-500/0 ring-offset-2 transition hover:bg-teal-50/40 focus-visible:ring-2 dark:hover:bg-teal-950/25 dark:ring-offset-zinc-900 sm:flex-row sm:gap-5 sm:p-5"
                >
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 text-[15px] font-bold tracking-tight text-teal-800 shadow-inner ring-2 ring-teal-500/35 dark:from-zinc-800 dark:to-zinc-900 dark:text-teal-300 dark:ring-teal-400/45"
                    aria-hidden
                  >
                    {initialsFromName(it.name)}
                  </div>

                  <div className="min-w-0 flex-1 pt-1">
                    <h2 className="truncate text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                      {it.name}
                    </h2>
                    {it.handle ? (
                      <p className="mt-0.5 text-sm text-teal-700 dark:text-teal-400">
                        @{it.handle}
                      </p>
                    ) : null}
                    {it.snippet ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                        {it.snippet}
                      </p>
                    ) : null}
                    <p className="mt-3 text-xs font-medium text-teal-700 dark:text-teal-400">
                      View full details →
                    </p>
                  </div>
                </Link>

                <div className="flex shrink-0 flex-col gap-3 border-t border-zinc-100 p-4 dark:border-zinc-700/80 sm:w-44 sm:border-l sm:border-t-0 sm:items-end">
                  <div className="rounded-xl bg-zinc-100 px-4 py-3 text-center dark:bg-zinc-800/90">
                    <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
                      Followers
                    </p>
                    <p className="mt-0.5 text-xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                      {formatFollowers(it.followerCount)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    {it.profileUrl ? (
                      <a
                        href={it.profileUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400"
                      >
                        Open profile
                      </a>
                    ) : null}
                    {it.sourceUrl && it.sourceUrl !== it.profileUrl ? (
                      <a
                        href={it.sourceUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center justify-center rounded-xl border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
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

      <p className="mt-8 text-center text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-500 sm:text-left">
        Creators come from public web results. Follower numbers are estimates when
        available—stronger signals surface higher on the list.
      </p>
    </section>
  )
}
