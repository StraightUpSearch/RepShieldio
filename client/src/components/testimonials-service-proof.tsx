const testimonials = [
  {
    quote: "RepShield removed a defamatory thread with 847 upvotes that was destroying our reputation. Professional and discreet.",
    name: "Sarah C.",
    role: "Founder & CEO, SaaS Company",
    initials: "SC",
    avatarBg: "bg-violet-100",
    avatarText: "text-violet-700",
    metric: "36 hrs",
    metricLabel: "to removal",
  },
  {
    quote: "A competitor's coordinated attack on Reddit was neutralized quickly. Our sales pipeline recovered within a week.",
    name: "Marcus R.",
    role: "VP Marketing, Cloud Software",
    initials: "MR",
    avatarBg: "bg-blue-100",
    avatarText: "text-blue-700",
    metric: "48 hrs",
    metricLabel: "to removal",
  },
  {
    quote: "They removed 12 posts targeting our medical practice. Patients stopped mentioning the false reviews soon after.",
    name: "Jennifer W.",
    role: "Practice Owner, Medical Group",
    initials: "JW",
    avatarBg: "bg-emerald-100",
    avatarText: "text-emerald-700",
    metric: "12",
    metricLabel: "posts removed",
  },
  {
    quote: "Professional handling of a sensitive situation. The content was removed with zero drama or escalation.",
    name: "David P.",
    role: "Legal Counsel, Law Firm",
    initials: "DP",
    avatarBg: "bg-orange-100",
    avatarText: "text-orange-700",
    metric: "18 hrs",
    metricLabel: "to removal",
  },
];

const stats = [
  { value: "1,650+", label: "Cases resolved" },
  { value: "95%", label: "Success rate" },
  { value: "36 hrs", label: "Avg resolution" },
  { value: "24/7", label: "Case monitoring" },
];

export default function TestimonialsServiceProof() {
  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-14 max-w-xl">
          <h2 className="font-satoshi text-4xl font-black text-gray-950 tracking-[-0.03em] mb-4">
            What clients say
          </h2>
          <p className="text-lg text-gray-500">
            Cases across SaaS, healthcare, legal, and e-commerce.
          </p>
        </div>

        {/* Testimonial grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col gap-5"
            >
              {/* Stat + stars row */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-satoshi text-3xl font-black text-gray-950 tracking-[-0.03em]">
                    {t.metric}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 uppercase tracking-wider font-medium">
                    {t.metricLabel}
                  </div>
                </div>
                <div className="flex gap-0.5 mt-1" aria-label="5 stars">
                  {[...Array(5)].map((_, s) => (
                    <svg key={s} className="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
              </div>

              {/* Quote */}
              <p className="text-gray-700 leading-relaxed flex-1 relative">
                <span className="text-3xl text-gray-200 font-serif leading-none absolute -top-1 -left-1 select-none" aria-hidden="true">"</span>
                <span className="relative pl-4">{t.quote}</span>
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                <div className={`w-9 h-9 rounded-full ${t.avatarBg} flex items-center justify-center flex-shrink-0`}>
                  <span className={`text-xs font-bold ${t.avatarText}`}>{t.initials}</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats strip — gap-px bg-gray-100 trick for 1px dividers */}
        <div className="rounded-2xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-100">
            {stats.map((s) => (
              <div key={s.label} className="bg-white px-8 py-7">
                <div className="font-satoshi text-3xl font-black text-gray-950 tracking-[-0.03em]">
                  {s.value}
                </div>
                <div className="text-sm text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
