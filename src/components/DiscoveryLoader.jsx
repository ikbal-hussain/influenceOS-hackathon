import { useEffect, useState } from 'react'

/** Mood-only lines—feel busy, not a literal checklist of backend steps. */
const STAGES = [
  'Digging through the pile so you don’t have to…',
  'Finding the standouts that actually fit what you asked for…',
  'Separating the memorable from the meh—this takes a beat…',
  'Almost there - polishing what we’ll show you…',
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
      className="mb-10 rounded-[3px] border-2 border-teal-500/70 bg-white/95 p-7 shadow-[0_0_0_1px_rgba(20,184,166,0.18)] dark:border-teal-400/60 dark:bg-zinc-900/70 sm:p-9"
    >
      <div className="flex flex-col items-center gap-5 text-center sm:gap-6">
        <div
          aria-hidden
          className="h-14 w-14 animate-spin rounded-full border-[5px] border-zinc-200 border-t-teal-600 dark:border-zinc-800 dark:border-t-teal-400"
        />

        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">
            Working · {elapsed}s
          </p>
          <h2 className="text-xl font-bold tracking-[-0.03em] text-zinc-900 dark:text-zinc-50 sm:text-2xl">
            Finding the best fits for you
          </h2>
          {summary ? (
            <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
              {summary}
            </p>
          ) : null}
        </div>

        <div className="w-full max-w-md">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div className="h-full w-1/3 animate-[loader-slide_1.4s_ease-in-out_infinite] rounded-full bg-teal-600 dark:bg-teal-400" />
          </div>
        </div>

        <ol className="grid w-full max-w-md list-none gap-2 p-0 text-left">
          {STAGES.map((line, idx) => {
            const status =
              idx < stageIndex ? 'done' : idx === stageIndex ? 'active' : 'pending'
            return (
              <li
                key={line}
                className={`flex items-start gap-3 rounded-[3px] border px-3 py-2 text-sm transition-colors ${
                  status === 'active'
                    ? 'border-teal-500 bg-teal-50 dark:border-teal-400/70 dark:bg-teal-400/10'
                    : status === 'done'
                      ? 'border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-500'
                      : 'border-dashed border-zinc-200 bg-transparent text-zinc-400 dark:border-zinc-800 dark:text-zinc-600'
                }`}
              >
                <span
                  aria-hidden
                  className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    status === 'done'
                      ? 'bg-zinc-300 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200'
                      : status === 'active'
                        ? 'animate-pulse bg-teal-600 text-white dark:bg-teal-400 dark:text-zinc-950'
                        : 'border border-zinc-300 dark:border-zinc-700'
                  }`}
                >
                  {status === 'done' ? '✓' : ''}
                </span>
                <div className="min-w-0">
                  <p className="m-0 font-medium leading-snug text-zinc-900 dark:text-zinc-100">
                    {line}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>

        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Good matches take a little theatre - thanks for waiting.
        </p>
      </div>

      <style>{`
        @keyframes loader-slide {
          0%   { transform: translateX(-110%); }
          50%  { transform: translateX(140%); }
          100% { transform: translateX(360%); }
        }
      `}</style>
    </section>
  )
}
