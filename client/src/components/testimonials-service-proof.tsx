const testimonials = [
  {
    quote: "RepShield removed a defamatory thread with 847 upvotes that was destroying our reputation. Professional and discreet.",
    name: "Sarah C.",
    role: "Founder & CEO, SaaS Company",
    initials: "SC",
    metric: "36 hrs",
    metricLabel: "to removal",
  },
  {
    quote: "A competitor's coordinated attack on Reddit was neutralized quickly. Our sales pipeline recovered within a week.",
    name: "Marcus R.",
    role: "VP Marketing, Cloud Software",
    initials: "MR",
    metric: "48 hrs",
    metricLabel: "to removal",
  },
  {
    quote: "They removed 12 posts targeting our medical practice. Patients stopped mentioning the false reviews soon after.",
    name: "Jennifer W.",
    role: "Practice Owner, Medical Group",
    initials: "JW",
    metric: "12",
    metricLabel: "posts removed",
  },
  {
    quote: "Professional handling of a sensitive situation. The content was removed with zero drama or escalation.",
    name: "David P.",
    role: "Legal Counsel, Law Firm",
    initials: "DP",
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
              className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col gap-6"
            >
              {/* Stat at top */}
              <div>
                <div className="font-satoshi text-3xl font-black text-gray-950 tracking-[-0.03em]">
                  {t.metric}
                </div>
                <div className="text-xs text-gray-400 mt-0.5 uppercase tracking-wider font-medium">
                  {t.metricLabel}
                </div>
              </div>

              {/* Quote */}
              <p className="text-gray-700 leading-relaxed flex-1">
                "{t.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-gray-500">{t.initials}</span>
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
