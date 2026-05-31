import SectionHeader from './SectionHeader.jsx'

const cases = [
  {
    title: 'D2C & lifestyle brands',
    body: 'Launch a product in a new city and find micro-influencers whose audience already cares about your category.',
    tag: 'Brands',
  },
  {
    title: 'Agencies & studios',
    body: 'Pitch faster with a ranked shortlist and source links you can show clients the same day.',
    tag: 'Agencies',
  },
  {
    title: 'Solo marketers',
    body: 'Skip the spreadsheet chaos—search once, save your session, and revisit profiles when you are ready to outreach.',
    tag: 'Marketers',
  },
]

export default function UseCasesSection() {
  return (
    <section
      id="use-cases"
      className="scroll-mt-24 py-14 md:py-16"
      aria-labelledby="use-cases-title"
    >
      <SectionHeader
        label="Who it is for"
        title="Built for teams that need speed and proof"
        subtitle="Whether you run one brand or fifty campaigns, the workflow stays the same."
      />
      <ul className="grid list-none gap-6 p-0 md:grid-cols-3">
        {cases.map((item) => (
          <li
            key={item.title}
            className="flex flex-col rounded-3xl border border-stone-200/80 bg-white/80 p-6 shadow-md shadow-stone-200/40"
          >
            <span className="mb-3 inline-flex w-fit rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-100">
              {item.tag}
            </span>
            <h3 className="font-serif text-lg font-medium text-stone-900">{item.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">{item.body}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
