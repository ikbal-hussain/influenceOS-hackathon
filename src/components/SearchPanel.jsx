import { useMemo, useState } from 'react'

const PLATFORM_OPTIONS = [
  { value: 'Instagram', label: 'Instagram', disabled: false },
  { value: 'YouTube', label: 'YouTube — coming soon', disabled: true },
  { value: 'TikTok', label: 'TikTok — coming soon', disabled: true },
  { value: 'LinkedIn', label: 'LinkedIn — coming soon', disabled: true },
  { value: 'X', label: 'X (Twitter) — coming soon', disabled: true },
]

const inputClass =
  'w-full rounded-[3px] border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-[border-color,box-shadow] placeholder:text-zinc-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/25 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/20'

const labelClass =
  'mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500'

function buildPreview({ niche, platform, location, audienceType }) {
  const n = niche.trim()
  const p = platform.trim()
  const l = location.trim()
  const a = audienceType.trim()

  const head = n ? `${n} creators` : 'Creators'
  const plat = p ? `on ${p}` : 'on …'
  const geo = l ? `in ${l}` : 'in …'
  const aud = a ? `for ${a}` : 'for …'

  return `${head} ${plat} ${geo} ${aud}`
}

const initialForm = {
  niche: '',
  platform: 'Instagram',
  location: '',
  audienceType: '',
}

export default function SearchPanel({ onSearch, isLoading = false, error = null }) {
  const [form, setForm] = useState(initialForm)

  const preview = useMemo(() => buildPreview(form), [form])
  const canSubmit = form.niche.trim().length > 0 && !isLoading

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleClear() {
    setForm(initialForm)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    onSearch?.({
      niche: form.niche.trim(),
      platform: form.platform.trim(),
      location: form.location.trim(),
      audienceType: form.audienceType.trim(),
    })
  }

  return (
    <section className="mb-10" aria-labelledby="search-panel-heading">
      <div className="rounded-[3px] border-2 border-zinc-300 bg-white/90 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
        <p className="mb-2 font-mono text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
          Discovery search
        </p>
        <h2
          id="search-panel-heading"
          className="mb-5 text-lg font-bold tracking-[-0.03em] text-zinc-900 dark:text-zinc-50"
        >
          Search creators
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="search-niche" className={labelClass}>
                Niche
              </label>
              <input
                id="search-niche"
                name="niche"
                type="text"
                autoComplete="off"
                placeholder="e.g. Fitness"
                value={form.niche}
                onChange={(e) => updateField('niche', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="search-platform" className={labelClass}>
                Platform
              </label>
              <select
                id="search-platform"
                name="platform"
                value={form.platform}
                onChange={(e) => updateField('platform', e.target.value)}
                className={`${inputClass} cursor-pointer appearance-none bg-[length:1rem] bg-[right_0.65rem_center] bg-no-repeat pr-9 dark:bg-zinc-950`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2371717a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                }}
              >
                {PLATFORM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-zinc-500">
                Only Instagram is supported right now. Other platforms are on the roadmap.
              </p>
            </div>
            <div>
              <label htmlFor="search-location" className={labelClass}>
                Location
              </label>
              <input
                id="search-location"
                name="location"
                type="text"
                autoComplete="off"
                placeholder="e.g. Bangalore"
                value={form.location}
                onChange={(e) => updateField('location', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="search-audience" className={labelClass}>
                Audience type
              </label>
              <input
                id="search-audience"
                name="audienceType"
                type="text"
                autoComplete="off"
                placeholder="e.g. Gen Z snack brand"
                value={form.audienceType}
                onChange={(e) => updateField('audienceType', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="rounded-[3px] border border-zinc-200 bg-zinc-50 px-3.5 py-3 dark:border-zinc-800 dark:bg-zinc-950/80">
            <p className="mb-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
              Preview
            </p>
            <p className="m-0 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
              {preview}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-[3px] border border-teal-600 bg-teal-600 px-3.5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-55 dark:border-teal-400 dark:bg-teal-400 dark:text-zinc-950"
            >
              {isLoading ? 'Searching…' : 'Search creators'}
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className="rounded-[3px] border border-zinc-300 bg-zinc-100 px-3.5 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200/80 disabled:cursor-not-allowed disabled:opacity-55 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
            >
              Clear
            </button>
            {!form.niche.trim() ? (
              <span className="text-xs text-zinc-500">Niche is required.</span>
            ) : null}
          </div>
        </form>

        {error ? (
          <p
            role="alert"
            className="mt-4 mb-0 border-t border-zinc-200 pt-4 text-sm text-rose-600 dark:border-zinc-800 dark:text-rose-400"
          >
            {error}
          </p>
        ) : null}
      </div>
    </section>
  )
}
