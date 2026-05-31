const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

function enrichmentHeaders() {
  const headers = {}
  const key = import.meta.env.VITE_ENRICHMENT_API_KEY
  if (key && String(key).trim()) {
    headers['X-Enrichment-Key'] = String(key).trim()
  }
  return headers
}

function discoveryHeaders() {
  const headers = { 'Content-Type': 'application/json' }
  const key = import.meta.env.VITE_DISCOVERY_API_KEY
  if (key && String(key).trim()) {
    headers['X-Api-Key'] = String(key).trim()
  }
  return headers
}

export async function searchInstagramCreators(query, { signal } = {}) {
  const url = `${API_BASE}/api/v1/discovery/instagram`
  const res = await fetch(url, {
    method: 'POST',
    headers: discoveryHeaders(),
    body: JSON.stringify(query),
    signal,
  })

  let body = null
  try {
    body = await res.json()
  } catch {
    // ignore JSON parse errors; handled below
  }

  if (!res.ok) {
    const message = body?.error || `Discovery request failed (${res.status})`
    const err = new Error(message)
    err.status = res.status
    err.details = body?.details
    throw err
  }
  return body
}

/** Matches backend `USERNAME_RE` in apifyInstagramProfile.js (after normalize). */
const INSTAGRAM_HANDLE_RE = /^[a-z0-9._]{1,30}$/

/** Strip leading `@`, trim, lowercase — same normalization as the enrichment API. */
export function cleanInstagramHandle(username) {
  return String(username || '')
    .replace(/^@/, '')
    .trim()
    .toLowerCase()
}

export function isValidInstagramHandle(username) {
  const clean = cleanInstagramHandle(username)
  return clean.length > 0 && INSTAGRAM_HANDLE_RE.test(clean)
}

/** Stable id for /influencer/:id routing (matches dashboard links). */
export function getInfluencerRouteId(row, index = 0) {
  const value = row?.id ?? row?.handle ?? row?.profileUrl ?? index
  return String(value)
}

export function formatFollowers(count) {
  if (count == null || Number.isNaN(count)) return '—'
  if (count >= 1_000_000_000) return `${(count / 1_000_000_000).toFixed(1)}B`
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`
  return String(count)
}

const SUFFIX_MULT = { k: 1_000, m: 1_000_000, b: 1_000_000_000 }
const FOLLOWERS_BEFORE = /(?:followers|fans|subscribers|subs)\b[^\d]{0,20}([\d]+(?:[.,]\d+)?)\s*([kKmMbB])?/i
const FOLLOWERS_AFTER = /([\d]+(?:[.,]\d+)?)\s*([kKmMbB])?\s*(?:\+\s*)?(?:followers|fans|subscribers|subs)/i

export function parseFollowerCountFromText(text) {
  if (!text) return null
  const str = String(text)
  const m = str.match(FOLLOWERS_AFTER) || str.match(FOLLOWERS_BEFORE)
  if (!m) return null
  const num = Number(m[1].replace(/,/g, ''))
  if (!Number.isFinite(num)) return null
  const suffix = (m[2] || '').toLowerCase()
  return SUFFIX_MULT[suffix] ? Math.round(num * SUFFIX_MULT[suffix]) : Math.round(num)
}

/** Same ordering as backend `sortByFollowersDesc`: finite follower counts descending; non-finite (NaN, null, etc.) last. */
export function sortInfluencersByFollowersDesc(rows) {
  return [...rows].sort((a, b) => {
    const aHas = Number.isFinite(a.followerCount)
    const bHas = Number.isFinite(b.followerCount)
    if (aHas && bHas) return b.followerCount - a.followerCount
    if (aHas) return -1
    if (bHas) return 1
    return 0
  })
}

export async function fetchInstagramProfileEnrichment(username, { signal } = {}) {
  const clean = cleanInstagramHandle(username)
  if (!isValidInstagramHandle(clean)) {
    const err = new Error('Invalid Instagram username')
    err.code = 'INVALID_USERNAME'
    throw err
  }
  const url = `${API_BASE}/api/v1/enrichment/instagram/${encodeURIComponent(clean)}`
  const res = await fetch(url, { headers: enrichmentHeaders(), signal })
  let body = null
  try {
    body = await res.json()
  } catch {
    // ignore
  }
  if (!res.ok) {
    const err = new Error(body?.error || `Enrichment failed (${res.status})`)
    err.status = res.status
    err.code = body?.code
    throw err
  }
  return body
}

export function buildInstagramProfileImageUrl(url) {
  if (!url) return null
  return `${API_BASE}/api/v1/enrichment/instagram/profile-picture?url=${encodeURIComponent(url)}`
}

export function cleanSnippet(text) {
  if (!text) return ''
  return String(text)
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/(^|\s)\*([^*\s][^*]*?)\*(?=\s|$|[.,!?])/g, '$1$2')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}
