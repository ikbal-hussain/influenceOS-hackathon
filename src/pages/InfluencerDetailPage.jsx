import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  formatFollowers,
  cleanSnippet,
  parseFollowerCountFromText,
  buildInstagramProfileImageUrl,
  fetchInstagramProfileEnrichment,
  sortInfluencersByFollowersDesc,
  getInfluencerRouteId,
  isValidInstagramHandle,
  cleanInstagramHandle,
} from '../lib/discoveryApi.js'
import { readDiscoverySnapshotFromStorage } from '../lib/discoverySnapshot.js'

function useDiscoverySnapshot() {
  const location = useLocation()
  return useMemo(() => {
    if (location.state != null) return location.state
    return readDiscoverySnapshotFromStorage()
  }, [location.state])
}

const DETAIL_LABELS = {
  accountType: 'Account type',
  blockedByViewer: 'Blocked by viewer',
  businessCategoryName: 'Business category',
  businessEmail: 'Business email',
  businessPhoneNumber: 'Business phone',
  categoryName: 'Category',
  connectedFbPage: 'Connected Facebook page',
  countryBlock: 'Country blocked',
  hasChannel: 'Has broadcast channel',
  highlightReelCount: 'Highlights',
  inputUrl: 'Input URL',
  joinedRecently: 'Joined recently',
  latestPosts: 'Latest posts',
  restrictedByViewer: 'Restricted by viewer',
}

function formatBool(value) {
  if (value === true) return 'Yes'
  if (value === false) return 'No'
  return null
}

function formatDateTime(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString()
}

function formatDetailValue(value) {
  if (value == null || value === '') return null
  if (typeof value === 'boolean') return formatBool(value)
  if (typeof value === 'number') return value.toLocaleString()
  if (Array.isArray(value)) return value.length ? `${value.length} item${value.length === 1 ? '' : 's'}` : null
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function labelForKey(key) {
  return DETAIL_LABELS[key] || String(key).replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())
}

function DetailItem({ label, value, href }) {
  const formatted = formatDetailValue(value)
  if (!formatted) return null
  return (
    <div className="min-w-0 rounded-xl border border-zinc-200 bg-white/75 p-3 dark:border-zinc-700 dark:bg-zinc-900/55">
      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {href ? (
          <a href={href} target="_blank" rel="noreferrer noopener" className="text-teal-700 underline dark:text-teal-400">
            {formatted}
          </a>
        ) : formatted}
      </dd>
    </div>
  )
}

function buildImageCandidates(profile) {
  const direct = [
    ...(profile?.profilePicUrls ?? []),
    profile?.profilePicUrlHd,
    profile?.profilePicUrl,
  ].filter(Boolean)
  const uniqueDirect = [...new Set(direct)]
  return [
    ...uniqueDirect.map(buildInstagramProfileImageUrl).filter(Boolean),
    ...uniqueDirect,
  ]
}

function ProfileImage({ profile, row, loading }) {
  const candidates = useMemo(() => buildImageCandidates(profile), [profile])
  const candidatesKey = candidates.join('|')
  const [imageState, setImageState] = useState({ key: '', index: 0 })

  const index = imageState.key === candidatesKey ? imageState.index : 0
  const src = candidates[index]
  const loadingRing = loading ? 'ring-2 ring-teal-400/55 animate-pulse' : ''
  if (src) {
    return (
      <div className={`shrink-0 rounded-2xl ${loadingRing}`}>
        <img
          src={src}
          alt={profile?.fullName || row.name || 'Creator profile'}
          className="h-28 w-28 shrink-0 rounded-2xl object-cover ring-2 ring-teal-500/30"
          referrerPolicy="no-referrer"
          onError={() => setImageState({ key: candidatesKey, index: index + 1 })}
        />
      </div>
    )
  }

  return (
    <div
      className={`flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 text-2xl font-bold text-teal-800 dark:from-zinc-800 dark:to-zinc-900 dark:text-teal-300 ${loading ? 'animate-pulse ring-2 ring-teal-400/55' : ''}`}
      aria-hidden
    >
      {(row.name || '?').slice(0, 2).toUpperCase()}
    </div>
  )
}

function DetailGrid({ children }) {
  return <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</dl>
}

function LiveProfileLoadingBanner() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="mt-4 rounded-xl border border-teal-200/90 bg-gradient-to-br from-white/90 to-teal-50/50 p-4 shadow-sm dark:border-teal-800/50 dark:from-zinc-900/60 dark:to-teal-950/20"
    >
      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Pulling the latest profile…</p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Stats and bio will land in a moment.</p>
      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        <div className="h-12 animate-pulse rounded-lg bg-zinc-200/90 dark:bg-zinc-700/80" />
        <div className="h-12 animate-pulse rounded-lg bg-zinc-200/90 dark:bg-zinc-700/80" />
        <div className="h-12 animate-pulse rounded-lg bg-zinc-200/90 dark:bg-zinc-700/80" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-2.5 w-full max-w-md animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-2.5 w-2/3 max-w-sm animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-2.5 w-1/2 max-w-xs animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
    </div>
  )
}

function buildInstagramEmbedUrl(rawUrl) {
  if (!rawUrl) return null
  try {
    const url = new URL(rawUrl)
    if (!['www.instagram.com', 'instagram.com'].includes(url.hostname)) return null
    const parts = url.pathname.split('/').filter(Boolean)
    if (!['p', 'reel', 'tv'].includes(parts[0]) || !parts[1]) return null
    return `https://www.instagram.com/${parts[0]}/${parts[1]}/embed`
  } catch {
    return null
  }
}

function LatestPostCard({ post, index }) {
  const embedUrl = buildInstagramEmbedUrl(post.url)
  return (
    <article className="mx-auto w-full max-w-sm overflow-hidden rounded-lg border border-zinc-200 bg-white/75 dark:border-zinc-700 dark:bg-zinc-900/55">
      {embedUrl ? (
        <div className="max-h-[260px] overflow-hidden">
          <iframe
            title={`Instagram post ${index + 1}`}
            src={embedUrl}
            className="h-[260px] w-full border-0 bg-white"
            loading="lazy"
            allowTransparency="true"
          />
        </div>
      ) : null}
      <div className="p-2">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500">
          {post.type ? <span>{post.type}</span> : null}
          {post.timestamp ? <span>{formatDateTime(post.timestamp)}</span> : null}
          {post.likesCount != null ? <span>{post.likesCount.toLocaleString()} likes</span> : null}
          {post.commentsCount != null ? <span>{post.commentsCount.toLocaleString()} comments</span> : null}
        </div>
        {post.caption ? (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">{post.caption}</p>
        ) : null}
        {post.url ? (
          <a href={post.url} target="_blank" rel="noreferrer noopener" className="mt-1.5 inline-flex text-xs font-semibold text-teal-700 underline dark:text-teal-400">
            Open post
          </a>
        ) : null}
      </div>
    </article>
  )
}

const ENRICHMENT_FETCH_TIMEOUT_MS = 90_000

/** Fetch only runs when mounted; parent uses key={username} to reset on row change. */
function InstaProfileLiveBlock({ username, onLiveProfile, onLoadingChange }) {
  const [enrichment, setEnrichment] = useState(null)
  const [enrichError, setEnrichError] = useState(null)
  const [enrichLoading, setEnrichLoading] = useState(true)

  useEffect(() => {
    onLoadingChange?.(enrichLoading)
    return () => onLoadingChange?.(false)
  }, [enrichLoading, onLoadingChange])

  useEffect(() => {
    let cancelled = false
    let timedOut = false
    const ac = new AbortController()
    const timeoutId = setTimeout(() => {
      timedOut = true
      ac.abort()
    }, ENRICHMENT_FETCH_TIMEOUT_MS)

    fetchInstagramProfileEnrichment(username, { signal: ac.signal })
      .then((body) => {
        if (cancelled) return
        setEnrichment(body)
        onLiveProfile?.(body?.profile ?? null)
      })
      .catch((err) => {
        if (cancelled) return
        if (err.name === 'AbortError' && !timedOut) return
        if (timedOut) {
          setEnrichError('Live profile request timed out. Try again.')
        } else {
          setEnrichError(err.message || 'Could not load live profile')
        }
        onLiveProfile?.(null)
      })
      .finally(() => {
        clearTimeout(timeoutId)
        if (!cancelled) setEnrichLoading(false)
      })

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
      ac.abort()
      onLiveProfile?.(null)
    }
  }, [username, onLiveProfile])

  const live = enrichment?.profile
  const hiddenDetailKeys = ['id', 'igtvVideoCount', 'latestPosts', 'url', 'externalUrlShimmed']
  const extraDetails = Object.entries(live?.details ?? {}).filter(([key]) => !hiddenDetailKeys.includes(key))
  const latestPosts = Array.isArray(live?.details?.latestPosts) ? live.details.latestPosts : []

  return (
    <>
      {enrichLoading ? <LiveProfileLoadingBanner /> : null}
      {enrichError ? (
        <p className="mt-3 text-sm text-amber-800 dark:text-amber-200">{enrichError}</p>
      ) : null}
      {live && !enrichLoading ? (
        <>
          <DetailGrid>
            <DetailItem label="Followers" value={live.followersCount == null ? null : formatFollowers(live.followersCount)} />
            <DetailItem label="Followers exact" value={live.followersCount} />
            <DetailItem label="Following" value={live.followsCount} />
            <DetailItem label="Posts" value={live.postsCount} />
            <DetailItem label="Highlights" value={live.highlightReelCount} />
          </DetailGrid>

          {live.biography ? (
            <p className="mt-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{live.biography}</p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500">
            {live.isVerified ? <span className="rounded-full bg-zinc-200 px-2 py-0.5 dark:bg-zinc-700">Verified</span> : null}
            {live.isPrivate ? <span className="rounded-full bg-red-100 px-2 py-0.5 font-semibold text-red-700 dark:bg-red-950/60 dark:text-red-300">Private</span> : null}
            {live.isBusiness ? <span className="rounded-full bg-zinc-200 px-2 py-0.5 dark:bg-zinc-700">Business</span> : null}
            {live.externalUrl ? (
              <a href={live.externalUrl} target="_blank" rel="noreferrer noopener" className="text-teal-700 underline dark:text-teal-400">
                Link in bio
              </a>
            ) : null}
          </div>

          <section className="mt-6" aria-labelledby="account-signals-heading">
            <h3 id="account-signals-heading" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Account, business, and contact
            </h3>
            <DetailGrid>
              <DetailItem label="Account type" value={live.accountType} />
              <DetailItem label="Category" value={live.categoryName} />
              <DetailItem label="Business category" value={live.businessCategoryName} />
              <DetailItem label="Business email" value={live.businessEmail} href={live.businessEmail ? `mailto:${live.businessEmail}` : null} />
              <DetailItem label="Business phone" value={live.businessPhoneNumber} href={live.businessPhoneNumber ? `tel:${live.businessPhoneNumber}` : null} />
              <DetailItem label="Verified" value={live.isVerified} />
              <DetailItem label="Private" value={live.isPrivate} />
              <DetailItem label="Business account" value={live.isBusiness} />
              <DetailItem label="Joined recently" value={live.joinedRecently} />
              <DetailItem label="External URL" value={live.externalUrl} href={live.externalUrl} />
            </DetailGrid>
          </section>

          {extraDetails.length > 0 ? (
            <section className="mt-6" aria-labelledby="api-details-heading">
              <h3 id="api-details-heading" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Additional API fields
              </h3>
              <DetailGrid>
                {extraDetails.map(([key, value]) => (
                  <DetailItem key={key} label={labelForKey(key)} value={value} href={String(value).startsWith('http') ? String(value) : null} />
                ))}
              </DetailGrid>
            </section>
          ) : null}

          {latestPosts.length > 0 ? (
            <section className="mt-6" aria-labelledby="latest-posts-heading">
              <h3 id="latest-posts-heading" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Latest posts
              </h3>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {latestPosts.map((post, index) => (
                  <LatestPostCard key={post.id || post.url || index} post={post} index={index} />
                ))}
              </div>
            </section>
          ) : null}

          <p className="mt-4 text-[11px] text-zinc-500 dark:text-zinc-500">
            Refreshed {live.fetchedAt ? new Date(live.fetchedAt).toLocaleString() : ''}. Counts are drawn from
            Instagram when available and may not match your search snapshot.
          </p>
        </>
      ) : null}
      {!enrichLoading && !live && !enrichError ? (
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          We couldn&apos;t load a live profile for this account. Try again in a moment, or open Instagram
          directly.
        </p>
      ) : null}
    </>
  )
}

export default function InfluencerDetailPage() {
  const { id } = useParams()
  const snapshot = useDiscoverySnapshot()
  const data = snapshot?.data
  const query = snapshot?.query

  const row = useMemo(() => {
    const rows = sortInfluencersByFollowersDesc(
      (data?.influencers ?? []).map((r) => {
        const cleaned = cleanSnippet(r.snippet)
        const followerCount =
          r.followerCount ?? parseFollowerCountFromText(r.snippet) ?? null
        return { ...r, snippet: cleaned, followerCount }
      }),
    )
    return rows.find((r, i) => getInfluencerRouteId(r, i) === String(id)) ?? null
  }, [data, id])

  if (!snapshot) {
    return (
      <section className="mt-4 text-center">
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          No discovery session found. Run a search first.
        </p>
        <Link
          to="/"
          className="inline-flex rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white dark:bg-teal-500 dark:text-zinc-950"
        >
          Discovery
        </Link>
      </section>
    )
  }

  if (!row) {
    return (
      <section className="mt-4">
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          This creator is not in your current results (open from the dashboard after a search).
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/dashboard"
            className="inline-flex rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white dark:bg-teal-500 dark:text-zinc-950"
          >
            Dashboard
          </Link>
          <Link
            to="/"
            className="inline-flex rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-semibold dark:border-zinc-600"
          >
            New search
          </Link>
        </div>
      </section>
    )
  }

  return (
    <InstaProfileDetailInner row={row} query={query} />
  )
}

function InstaProfileDetailInner({ row, query }) {
  const enrichHandle = isValidInstagramHandle(row.handle)
    ? cleanInstagramHandle(row.handle)
    : null
  const [liveProfile, setLiveProfile] = useState(null)
  const [liveEnrichLoading, setLiveEnrichLoading] = useState(() => Boolean(enrichHandle))
  const handleEnrichLoading = useCallback((loading) => {
    setLiveEnrichLoading(loading)
  }, [])
  const searchContext = query?.niche
    ? `Search context: ${query.niche}${query.location ? ` - ${query.location}` : ''}`
    : null

  return (
    <article className="space-y-8">
      <nav className="text-sm text-zinc-500 dark:text-zinc-400">
        <Link to="/dashboard" className="text-teal-700 hover:underline dark:text-teal-400">
          Dashboard
        </Link>
        <span aria-hidden className="mx-2">
          /
        </span>
        <span className="text-zinc-700 dark:text-zinc-300">@{row.handle || 'creator'}</span>
      </nav>

      {searchContext ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{searchContext}</p>
      ) : null}

      <header
        className={`flex flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow dark:border-zinc-700 dark:bg-zinc-900/80 sm:flex-row sm:items-start ${
          liveEnrichLoading ? 'ring-1 ring-teal-400/35 dark:ring-teal-500/25' : ''
        }`}
      >
        <ProfileImage profile={liveProfile} row={row} loading={liveEnrichLoading && Boolean(enrichHandle)} />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {liveProfile?.fullName || row.name}
          </h1>
          {row.handle ? (
            <p className="mt-1 text-teal-700 dark:text-teal-400">@{row.handle}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3">
            {row.profileUrl ? (
              <a
                href={row.profileUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white dark:bg-teal-500 dark:text-zinc-950"
              >
                Open on Instagram
              </a>
            ) : null}
          </div>
        </div>
      </header>

      <section aria-labelledby="discovery-heading" className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-6 dark:border-zinc-700 dark:bg-zinc-900/40">
        <h2 id="discovery-heading" className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          From your search
        </h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-zinc-500">Followers (discovery)</dt>
            <dd className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
              {formatFollowers(row.followerCount)}
            </dd>
          </div>
          {row.publishedAt ? (
            <div>
              <dt className="text-zinc-500">Published</dt>
              <dd className="font-medium text-zinc-900 dark:text-zinc-100">{String(row.publishedAt)}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-zinc-500">Platform</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-100">{row.platform || 'instagram'}</dd>
          </div>
        </dl>
        {row.snippet ? (
          <p className="mt-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{row.snippet}</p>
        ) : null}
      </section>

      <section aria-labelledby="live-heading" className="rounded-2xl border border-teal-500/25 bg-gradient-to-br from-teal-50/80 to-white p-6 dark:border-teal-500/20 dark:from-teal-950/30 dark:to-zinc-900">
        <h2 id="live-heading" className="text-sm font-semibold uppercase tracking-wide text-teal-800 dark:text-teal-300">
          Live profile
        </h2>
        {enrichHandle ? (
          <InstaProfileLiveBlock
            key={enrichHandle}
            username={enrichHandle}
            onLiveProfile={setLiveProfile}
            onLoadingChange={handleEnrichLoading}
          />
        ) : (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            {row.handle
              ? 'This Instagram handle is invalid, so a live profile can\u2019t be loaded.'
              : 'No Instagram handle on this row, so a live profile can\u2019t be loaded.'}
          </p>
        )}
      </section>
    </article>
  )
}
