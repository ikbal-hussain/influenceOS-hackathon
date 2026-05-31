/** Session key shared by Landing (write), Dashboard & Influencer detail (read). */
export const LAST_SEARCH_KEY = 'influenceos:last-discovery'

export function readDiscoverySnapshotFromStorage() {
  try {
    const raw = sessionStorage.getItem(LAST_SEARCH_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
