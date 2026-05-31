import SectionHeader from './SectionHeader.jsx'

const steps = [
  {
    num: '01',
    title: 'Describe your brief',
    body: 'Enter niche, location, and target audience. We turn that into a focused discovery query.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    ),
  },
  {
    num: '02',
    title: 'Run Anakin Wire',
    body: 'Holocron executes a pre-built Wire action (e.g. YouTube search) and returns structured JSON—no custom scrapers.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582"
      />
    ),
  },
  {
    num: '03',
    title: 'Extract creators with AI',
    body: 'Anakin Wire (Holocron) returns structured JSON from real sites; Groq extracts creator handles with evidence—no invented usernames.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
      />
    ),
  },
  {
    num: '04',
    title: 'Review and enrich',
    body: 'Open your shortlist, compare creators, and drill into YouTube or Instagram profiles from one place.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3.75 13.5l10.5-10.5L21 10.5M3.75 19.5h16.5"
      />
    ),
  },
]

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 -mx-5 bg-gradient-to-b from-rose-50/60 to-transparent px-5 py-14 md:py-16"
      aria-labelledby="how-it-works-title"
    >
      <SectionHeader
        label="How it works"
        title="From brief to shortlist in four steps"
        subtitle="A transparent pipeline—search, web data, structured extraction, then your ranked list."
      />
      <ol className="grid list-none gap-6 p-0 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => (
          <li
            key={step.num}
            className="relative rounded-3xl border border-stone-200/80 bg-white/90 p-6 shadow-md shadow-stone-200/30"
          >
            <span className="text-xs font-semibold tabular-nums text-rose-500">{step.num}</span>
            <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-100 to-orange-100 text-rose-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-5 w-5"
                aria-hidden
              >
                {step.icon}
              </svg>
            </div>
            <h3 className="mt-4 font-serif text-lg font-medium text-stone-900">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
