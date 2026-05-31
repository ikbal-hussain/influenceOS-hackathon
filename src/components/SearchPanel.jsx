import { useMemo, useState } from 'react'
import {
  btnPrimary,
  btnSecondary,
  cardSurface,
  inputClass,
  labelClass,
} from '../lib/uiClasses.js'

const PLATFORM_OPTIONS = [
  { value: 'Instagram', label: 'Instagram (Wire + Groq)', disabled: false },
  { value: 'YouTube', label: 'YouTube (Wire)', disabled: false },
  { value: 'TikTok', label: 'TikTok — coming soon', disabled: true },
  { value: 'LinkedIn', label: 'LinkedIn — coming soon', disabled: true },
  { value: 'X', label: 'X (Twitter) — coming soon', disabled: true },
]

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
    <section className="mb-12" aria-labelledby="search-panel-heading">
      <div className={`${cardSurface} p-6 sm:p-8`}>
        <p className="mb-1 text-sm font-medium text-rose-600">Start here</p>
        <h2
          id="search-panel-heading"
          className="mb-6 font-serif text-2xl font-medium text-stone-900"
        >
          Describe who you&apos;re looking for
        </h2>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="search-niche" className={labelClass}>
                Niche or category
              </label>
              <input
                id="search-niche"
                name="niche"
                type="text"
                autoComplete="off"
                placeholder="e.g. sustainable fashion"
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
                className={`${inputClass} cursor-pointer appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2378716c'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                }}
              >
                {PLATFORM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-stone-500">
                Discovery runs on Anakin Wire (Holocron). YouTube uses Wire directly; Instagram uses
                Wire + Groq to extract handles.
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
                placeholder="e.g. Mumbai"
                value={form.location}
                onChange={(e) => updateField('location', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="search-audience" className={labelClass}>
                Target audience
              </label>
              <input
                id="search-audience"
                name="audienceType"
                type="text"
                autoComplete="off"
                placeholder="e.g. Gen Z skincare buyers"
                value={form.audienceType}
                onChange={(e) => updateField('audienceType', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50 px-4 py-3.5 ring-1 ring-rose-100">
            <p className="mb-1 text-xs font-medium text-rose-700">Your search preview</p>
            <p className="m-0 text-sm leading-relaxed text-stone-800">{preview}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button type="submit" disabled={!canSubmit} className={btnPrimary}>
              {isLoading ? 'Searching…' : 'Find creators'}
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className={btnSecondary}
            >
              Reset
            </button>
            {!form.niche.trim() ? (
              <span className="text-xs text-stone-500">Niche is required.</span>
            ) : null}
          </div>
        </form>

        {error ? (
          <p
            role="alert"
            className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-100"
          >
            {error}
          </p>
        ) : null}
      </div>
    </section>
  )
}
