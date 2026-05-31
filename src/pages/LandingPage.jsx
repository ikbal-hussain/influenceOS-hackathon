import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchPanel from '../components/SearchPanel.jsx'
import DiscoveryLoader from '../components/DiscoveryLoader.jsx'
import { searchInstagramCreators } from '../lib/discoveryApi.js'
import { LAST_SEARCH_KEY } from '../lib/discoverySnapshot.js'
import { eyebrow, headingDisplay } from '../lib/uiClasses.js'

function buildLoaderSummary(query) {
  if (!query) return null
  const niche = query.niche || 'creators'
  const where = query.location ? ` in ${query.location}` : ''
  const who = query.audienceType ? ` for ${query.audienceType}` : ''
  return `${niche}${where}${who}`.trim()
}

const pillars = [
  {
    title: 'Smart discovery',
    body: 'Search by niche, geography, and who you want to reach—then get a ranked shortlist in minutes.',
  },
  {
    title: 'Fit scoring',
    body: 'Engagement quality, content themes, and context from the open web—not vanity metrics.',
  },
  {
    title: 'Ready to reach out',
    body: 'Open profiles, compare creators side by side, and draft outreach with real context.',
  },
]

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
        // sessionStorage may be unavailable
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
      <section className="mb-12 text-center md:text-left">
        <p className={`mb-4 ${eyebrow}`}>Creator discovery for brands</p>
        <h1 className={`mb-4 ${headingDisplay}`}>
          The right creators for your next campaign
        </h1>
        <p className="mx-auto mb-2 max-w-2xl text-base leading-relaxed text-stone-600 md:mx-0">
          InfluenceOS surfaces Instagram creators who match your niche, market, and audience—
          with scores and context you can act on today.
        </p>
      </section>

      <SearchPanel onSearch={handleSearch} isLoading={isLoading} error={error} />

      {isLoading ? (
        <DiscoveryLoader summary={buildLoaderSummary(activeQuery)} />
      ) : null}

      <section aria-labelledby="pillars-heading" className="mt-14">
        <h2 id="pillars-heading" className="sr-only">
          How it helps
        </h2>
        <ul className="grid list-none gap-6 p-0 md:grid-cols-3">
          {pillars.map((item) => (
            <li
              key={item.title}
              className="rounded-3xl border border-stone-200/80 bg-white/80 p-6 shadow-md shadow-stone-200/40"
            >
              <h3 className="mb-2 font-serif text-lg font-medium text-stone-900">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-stone-600">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
