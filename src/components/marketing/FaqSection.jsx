import SectionHeader from './SectionHeader.jsx'

const faqs = [
  {
    q: 'Which platforms are supported?',
    a: 'Instagram discovery and live profile enrichment are live today. Other platforms appear in the search form as roadmap items.',
  },
  {
    q: 'Where does creator data come from?',
    a: 'Discovery combines public web search and article scraping (Anakin), structured extraction (Groq), and optional live Instagram profile data (Apify) when your backend is configured.',
  },
  {
    q: 'Are handles verified or guessed?',
    a: 'Handles must appear in the source material we pass to the model—we do not invent usernames. Each row can include an evidence snippet from the original source.',
  },
  {
    q: 'Do I need API keys?',
    a: 'Local development needs backend keys for Anakin and Groq (see the backend README). Optional client keys and enrichment tokens are documented in .env.example.',
  },
  {
    q: 'Is my search saved?',
    a: 'Your latest shortlist is stored in session storage in this browser tab so you can open the dashboard and detail pages without re-running discovery.',
  },
]

export default function FaqSection() {
  return (
    <section
      id="faq"
      className="scroll-mt-24 -mx-5 bg-white/70 px-5 py-14 md:py-16"
      aria-labelledby="faq-title"
    >
      <SectionHeader
        label="FAQ"
        title="Common questions"
        subtitle="Quick answers before you run your first search."
      />
      <div className="mx-auto max-w-3xl space-y-3">
        {faqs.map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl border border-stone-200/90 bg-white px-5 py-4 shadow-sm open:ring-1 open:ring-rose-100"
          >
            <summary className="cursor-pointer list-none font-medium text-stone-900 marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-4">
                {item.q}
                <span
                  className="shrink-0 text-rose-500 transition group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
