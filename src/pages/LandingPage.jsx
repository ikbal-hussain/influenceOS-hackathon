import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchPanel from '../components/SearchPanel.jsx'
import DiscoveryLoader from '../components/DiscoveryLoader.jsx'
import { searchInstagramCreators } from '../lib/discoveryApi.js'
import { LAST_SEARCH_KEY } from '../lib/discoverySnapshot.js'

function buildLoaderSummary(query) {
  if (!query) return null
  const niche = query.niche || 'creators'
  const where = query.location ? ` in ${query.location}` : ''
  const who = query.audienceType ? ` for ${query.audienceType}` : ''
  return `${niche}${where}${who}`.trim()
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeQuery, setActiveQuery] = useState(null)

  async function handleSearch(payload) {
    setError(null)
    setIsLoading(true)
    setActiveQuery(payload)
    try {
      const data = await searchInstagramCreators({
        niche: payload.niche,
        location: payload.location,
        audienceType: payload.audienceType,
        platform: payload.platform || 'Instagram',
      })
      const snapshot = { data, query: payload, fetchedAt: Date.now() }
      try {
        sessionStorage.setItem(LAST_SEARCH_KEY, JSON.stringify(snapshot))
      } catch {
        // sessionStorage may be unavailable; navigation state is the primary path
      }
      navigate('/dashboard', { state: snapshot })
    } catch (err) {
      setError(err.message || 'Something went wrong while searching')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <section className="mb-10 text-left">
        <p className="mb-3.5 font-mono text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
          Creator match · prototype
        </p>
        <h1 className="mb-3.5 text-[clamp(1.65rem,4vw,2.35rem)] font-bold leading-snug tracking-[-0.04em] text-zinc-900 dark:text-zinc-50">
          Find micro-influencers that actually fit your brand
        </h1>
        <p className="mb-6 max-w-xl text-base leading-relaxed">
          InfluenceOS analyzes creator profiles, engagement, niche fit, audience
          relevance, and web signals to surface smart match scores, campaign
          insights, and outreach you can send with confidence.
        </p>
      </section>

      <SearchPanel
        onSearch={handleSearch}
        isLoading={isLoading}
        error={error}
      />

      {isLoading ? (
        <DiscoveryLoader summary={buildLoaderSummary(activeQuery)} />
      ) : null}

      <section aria-labelledby="pillars-heading">
        <h2 id="pillars-heading" className="sr-only">
          Product pillars
        </h2>
        <ul className="grid list-none gap-5 border-t-2 border-zinc-300 p-0 pt-7 dark:border-zinc-800 md:grid-cols-3 md:gap-4">
          <li>
            <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-zinc-900 dark:text-zinc-50">
              Discovery
            </h3>
            <p className="text-sm leading-relaxed">
              Search and rank creators by niche, geography, and audience overlap
              with your ideal customer.
            </p>
          </li>
          <li>
            <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-zinc-900 dark:text-zinc-50">
              Match intelligence
            </h3>
            <p className="text-sm leading-relaxed">
              Composite scores from engagement quality, content themes, and
              third-party context—not follower count alone.
            </p>
          </li>
          <li>
            <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-zinc-900 dark:text-zinc-50">
              Outreach
            </h3>
            <p className="text-sm leading-relaxed">
              Draft personalized first messages aligned to each creator&apos;s
              voice and your campaign brief.
            </p>
          </li>
        </ul>
      </section>
    </>
  )
}
