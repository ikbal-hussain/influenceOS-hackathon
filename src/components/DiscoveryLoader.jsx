import { useEffect, useState } from 'react'
import { cardSurface } from '../lib/uiClasses.js'

const STAGES = [
  'Scanning the web for creators in your niche…',
  'Ranking profiles by relevance and engagement…',
  'Pulling context from articles and bios…',
  'Almost ready—building your shortlist…',
]

const ROTATE_MS = 2800

export default function DiscoveryLoader({ summary = null }) {
  const [stageIndex, setStageIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const startedAt = Date.now()
    const stageTimer = setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, STAGES.length - 1))
    }, ROTATE_MS)
    const tickTimer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000))
    }, 1000)
    return () => {
      clearInterval(stageTimer)
      clearInterval(tickTimer)
    }
  }, [])

  return (
    <section
      role="status"
      aria-live="polite"
      aria-label="Finding creators"
      className={`mb-12 ${cardSurface} p-8 sm:p-10`}
    >
      <div className="flex flex-col items-center gap-6 text-center">
        <div
          aria-hidden
          className="h-14 w-14 animate-spin rounded-full border-4 border-rose-100 border-t-rose-500"
        />

        <div>
          <p className="mb-2 text-sm font-medium text-rose-600">{elapsed}s elapsed</p>
          <h2 className="font-serif text-2xl font-medium text-stone-900">
            Building your creator shortlist
          </h2>
          {summary ? (
            <p className="mt-2 text-sm text-stone-600">{summary}</p>
          ) : null}
        </div>

        <div className="h-2 w-full max-w-md overflow-hidden rounded-full bg-stone-100">
          <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-rose-400 to-orange-400 animate-shimmer-bar" />
        </div>

        <ol className="grid w-full max-w-lg list-none gap-2 p-0 text-left">
          {STAGES.map((line, idx) => {
            const status =
              idx < stageIndex ? 'done' : idx === stageIndex ? 'active' : 'pending'
            return (
              <li
                key={line}
                className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-sm transition-colors ${
                  status === 'active'
                    ? 'bg-rose-50 ring-1 ring-rose-200'
                    : status === 'done'
                      ? 'bg-stone-50 text-stone-500'
                      : 'text-stone-400'
                }`}
              >
                <span
                  aria-hidden
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    status === 'done'
                      ? 'bg-stone-300 text-stone-700'
                      : status === 'active'
                        ? 'animate-pulse bg-gradient-to-br from-rose-500 to-orange-400 text-white'
                        : 'border border-stone-300'
                  }`}
                >
                  {status === 'done' ? '✓' : ''}
                </span>
                <p className="m-0 font-medium leading-snug text-stone-800">{line}</p>
              </li>
            )
          })}
        </ol>

        <p className="text-xs text-stone-500">
          YouTube searches can take up to 90s while Wire enriches channels. Thanks for waiting.
        </p>
      </div>
    </section>
  )
}
