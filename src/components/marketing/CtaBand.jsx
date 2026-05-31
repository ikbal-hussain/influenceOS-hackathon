export default function CtaBand() {
  function scrollToDiscover(e) {
    e.preventDefault()
    document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="-mx-5 mb-4 px-5 py-12 md:py-14" aria-labelledby="cta-heading">
      <div className="rounded-3xl bg-gradient-to-br from-rose-500 via-rose-500 to-orange-400 px-6 py-10 text-center shadow-xl shadow-rose-400/25 sm:px-10">
        <h2
          id="cta-heading"
          className="font-serif text-[clamp(1.5rem,3vw,2rem)] font-medium text-white"
        >
          Ready to build your shortlist?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-rose-50/95">
          Describe your niche and audience—we will surface creators you can evaluate in minutes.
        </p>
        <a
          href="#discover"
          onClick={scrollToDiscover}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-rose-700 shadow-lg transition hover:bg-rose-50"
        >
          Start discovering
        </a>
      </div>
    </section>
  )
}
