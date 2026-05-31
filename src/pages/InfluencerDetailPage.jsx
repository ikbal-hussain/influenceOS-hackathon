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
import { btnPrimary, btnSecondary, cardSurface, linkAccent } from '../lib/uiClasses.js'

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
    <div className="min-w-0 rounded-2xl bg-stone-50 p-3 ring-1 ring-stone-100">
      <dt className="text-xs font-medium text-stone-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-stone-900">
        {href ? (
          <a href={href} target="_blank" rel="noreferrer noopener" className={linkAccent}>
            {formatted}
          </a>
        ) : (
          formatted
        )}
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
  const loadingRing = loading ? 'ring-2 ring-rose-300 animate-pulse' : ''
  if (src) {
    return (
      <div className={`shrink-0 rounded-3xl ${loadingRing}`}>
        <img
          src={src}
          alt={profile?.fullName || row.name || 'Creator profile'}
          className="h-28 w-28 shrink-0 rounded-3xl object-cover ring-2 ring-white shadow-lg"
          referrerPolicy="no-referrer"
          onError={() => setImageState({ key: candidatesKey, index: index + 1 })}
        />
      </div>
    )
  }

  return (
    <div
      className={`flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-100 to-orange-100 text-2xl font-bold text-rose-800 shadow-md ${loading ? 'animate-pulse ring-2 ring-rose-300' : ''}`}
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
      className="mt-4 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 p-5 ring-1 ring-rose-100"
    >
      <p className="text-sm font-medium text-stone-800">Loading live profile…</p>
      <p className="mt-1 text-xs text-stone-500">Stats and bio will appear shortly.</p>
      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        <div className="h-12 animate-pulse rounded-xl bg-stone-200/80" />
        <div className="h-12 animate-pulse rounded-xl bg-stone-200/80" />
        <div className="h-12 animate-pulse rounded-xl bg-stone-200/80" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-2.5 w-full max-w-md animate-pulse rounded bg-stone-200" />
        <div className="h-2.5 w-2/3 max-w-sm animate-pulse rounded bg-stone-200" />
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
    <article className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
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
      <div className="p-3">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500">
          {post.type ? <span>{post.type}</span> : null}
          {post.timestamp ? <span>{formatDateTime(post.timestamp)}</span> : null}
          {post.likesCount != null ? <span>{post.likesCount.toLocaleString()} likes</span> : null}
          {post.commentsCount != null ? (
            <span>{post.commentsCount.toLocaleString()} comments</span>
          ) : null}
        </div>
        {post.caption ? (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-stone-700">
            {post.caption}
          </p>
        ) : null}
        {post.url ? (
          <a href={post.url} target="_blank" rel="noreferrer noopener" className={`mt-2 inline-flex text-xs ${linkAccent}`}>
            Open post
          </a>
        ) : null}
      </div>
    </article>
  )
}

const ENRICHMENT_FETCH_TIMEOUT_MS = 90_000

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
  const extraDetails = Object.entries(live?.details ?? {}).filter(
    ([key]) => !hiddenDetailKeys.includes(key),
  )
  const latestPosts = Array.isArray(live?.details?.latestPosts) ? live.details.latestPosts : []

  return (
    <>
      {enrichLoading ? <LiveProfileLoadingBanner /> : null}
      {enrichError ? (
        <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-amber-100">
          {enrichError}
        </p>
      ) : null}
      {live && !enrichLoading ? (
        <>
          <DetailGrid>
            <DetailItem
              label="Followers"
              value={live.followersCount == null ? null : formatFollowers(live.followersCount)}
            />
            <DetailItem label="Followers (exact)" value={live.followersCount} />
            <DetailItem label="Following" value={live.followsCount} />
            <DetailItem label="Posts" value={live.postsCount} />
            <DetailItem label="Highlights" value={live.highlightReelCount} />
          </DetailGrid>

          {live.biography ? (
            <p className="mt-4 text-sm leading-relaxed text-stone-700">{live.biography}</p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {live.isVerified ? (
              <span className="rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-800 ring-1 ring-blue-100">
                Verified
              </span>
            ) : null}
            {live.isPrivate ? (
              <span className="rounded-full bg-red-50 px-2.5 py-1 font-medium text-red-800 ring-1 ring-red-100">
                Private
              </span>
            ) : null}
            {live.isBusiness ? (
              <span className="rounded-full bg-stone-100 px-2.5 py-1 font-medium text-stone-700">
                Business
              </span>
            ) : null}
            {live.externalUrl ? (
              <a
                href={live.externalUrl}
                target="_blank"
                rel="noreferrer noopener"
                className={linkAccent}
              >
                Link in bio
              </a>
            ) : null}
          </div>

          <section className="mt-6" aria-labelledby="account-signals-heading">
            <h3 id="account-signals-heading" className="text-sm font-medium text-stone-600">
              Account & contact
            </h3>
            <DetailGrid>
              <DetailItem label="Account type" value={live.accountType} />
              <DetailItem label="Category" value={live.categoryName} />
              <DetailItem label="Business category" value={live.businessCategoryName} />
              <DetailItem
                label="Business email"
                value={live.businessEmail}
                href={live.businessEmail ? `mailto:${live.businessEmail}` : null}
              />
              <DetailItem
                label="Business phone"
                value={live.businessPhoneNumber}
                href={live.businessPhoneNumber ? `tel:${live.businessPhoneNumber}` : null}
              />
              <DetailItem label="Verified" value={live.isVerified} />
              <DetailItem label="Private" value={live.isPrivate} />
              <DetailItem label="Business account" value={live.isBusiness} />
              <DetailItem label="Joined recently" value={live.joinedRecently} />
              <DetailItem label="External URL" value={live.externalUrl} href={live.externalUrl} />
            </DetailGrid>
          </section>

          {extraDetails.length > 0 ? (
            <section className="mt-6" aria-labelledby="api-details-heading">
              <h3 id="api-details-heading" className="text-sm font-medium text-stone-600">
                More fields
              </h3>
              <DetailGrid>
                {extraDetails.map(([key, value]) => (
                  <DetailItem
                    key={key}
                    label={labelForKey(key)}
                    value={value}
                    href={String(value).startsWith('http') ? String(value) : null}
                  />
                ))}
              </DetailGrid>
            </section>
          ) : null}

          {latestPosts.length > 0 ? (
            <section className="mt-6" aria-labelledby="latest-posts-heading">
              <h3 id="latest-posts-heading" className="text-sm font-medium text-stone-600">
                Recent posts
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {latestPosts.map((post, index) => (
                  <LatestPostCard key={post.id || post.url || index} post={post} index={index} />
                ))}
              </div>
            </section>
          ) : null}

          <p className="mt-4 text-xs text-stone-500">
            Refreshed {live.fetchedAt ? new Date(live.fetchedAt).toLocaleString() : ''}. Live counts
            may differ from your search snapshot.
          </p>
        </>
      ) : null}
      {!enrichLoading && !live && !enrichError ? (
        <p className="mt-3 text-sm text-stone-600">
          We couldn&apos;t load a live profile. Try again or open Instagram directly.
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
        <p className="mb-4 text-sm text-stone-600">No discovery session found. Run a search first.</p>
        <Link to="/" className={btnPrimary}>
          Discover creators
        </Link>
      </section>
    )
  }

  if (!row) {
    return (
      <section className="mt-4">
        <p className="mb-4 text-sm text-stone-600">
          This creator isn&apos;t in your current results—open them from the shortlist after a
          search.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/dashboard" className={btnPrimary}>
            Shortlist
          </Link>
          <Link to="/" className={btnSecondary}>
            New search
          </Link>
        </div>
      </section>
    )
  }

  return <InstaProfileDetailInner row={row} query={query} />
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
    ? `Brief: ${query.niche}${query.location ? ` · ${query.location}` : ''}`
    : null

  return (
    <article className="space-y-8">
      <nav className="text-sm text-stone-500">
        <Link to="/dashboard" className={linkAccent}>
          Shortlist
        </Link>
        <span aria-hidden className="mx-2 text-stone-300">
          /
        </span>
        <span className="text-stone-700">@{row.handle || 'creator'}</span>
      </nav>

      {searchContext ? <p className="text-sm text-stone-500">{searchContext}</p> : null}

      <header
        className={`flex flex-col gap-6 ${cardSurface} p-6 sm:flex-row sm:items-start ${
          liveEnrichLoading ? 'ring-2 ring-rose-200' : ''
        }`}
      >
        <ProfileImage
          profile={liveProfile}
          row={row}
          loading={liveEnrichLoading && Boolean(enrichHandle)}
        />
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-2xl font-medium text-stone-900">
            {liveProfile?.fullName || row.name}
          </h1>
          {row.handle ? (
            <p className="mt-1 text-sm font-medium text-rose-600">@{row.handle}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3">
            {row.profileUrl ? (
              <a
                href={row.profileUrl}
                target="_blank"
                rel="noreferrer noopener"
                className={btnPrimary}
              >
                Open on Instagram
              </a>
            ) : null}
          </div>
        </div>
      </header>

      <section aria-labelledby="discovery-heading" className={`${cardSurface} p-6`}>
        <h2 id="discovery-heading" className="text-sm font-medium text-rose-600">
          From your search
        </h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-stone-500">Followers (discovery)</dt>
            <dd className="font-semibold tabular-nums text-stone-900">
              {formatFollowers(row.followerCount)}
            </dd>
          </div>
          {row.publishedAt ? (
            <div>
              <dt className="text-stone-500">Published</dt>
              <dd className="font-medium text-stone-900">{String(row.publishedAt)}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-stone-500">Platform</dt>
            <dd className="font-medium text-stone-900">{row.platform || 'instagram'}</dd>
          </div>
        </dl>
        {row.snippet ? (
          <p className="mt-4 text-sm leading-relaxed text-stone-700">{row.snippet}</p>
        ) : null}
      </section>

      <section
        aria-labelledby="live-heading"
        className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50/90 via-white to-orange-50/80 p-6 shadow-md shadow-rose-100/40"
      >
        <h2 id="live-heading" className="text-sm font-medium text-rose-700">
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
          <p className="mt-3 text-sm text-stone-600">
            {row.handle
              ? 'This Instagram handle is invalid, so a live profile can\u2019t be loaded.'
              : 'No Instagram handle on this row, so a live profile can\u2019t be loaded.'}
          </p>
        )}
      </section>
    </article>
  )
}
