const testimonials = [
  {
    quote: "My post was gone in 28 hours. I can finally Google myself again without my stomach dropping.",
    name: "Sarah C.",
    role: "Founder, SaaS Company",
    initials: "SC",
    avatarBg: "bg-violet-100",
    avatarText: "text-violet-700",
    metric: "28 hrs",
    metricLabel: "to removal",
    date: "Aug 2026",
    stars: 5,
  },
  {
    quote: "A competitor posted lies about our product on three subreddits. RepShield had all of them down before the weekend. Our pipeline recovered within a week.",
    name: "Marcus R.",
    role: "VP Marketing, Cloud Software",
    initials: "MR",
    avatarBg: "bg-blue-100",
    avatarText: "text-blue-700",
    metric: "48 hrs",
    metricLabel: "to removal",
    date: "Jul 2026",
    stars: 5,
  },
  {
    quote: "They removed 12 posts targeting our medical practice. Patients stopped asking about them almost overnight. Worth every penny.",
    name: "Jennifer W.",
    role: "Practice Owner, Medical Group",
    initials: "JW",
    avatarBg: "bg-emerald-100",
    avatarText: "text-emerald-700",
    metric: "12",
    metricLabel: "posts removed",
    date: "Jun 2026",
    stars: 5,
  },
  {
    quote: "I was losing sleep over a thread that doxxed my home address. RepShield handled it with zero drama — the post vanished and I could breathe again.",
    name: "David P.",
    role: "Tech Founder",
    initials: "DP",
    avatarBg: "bg-orange-100",
    avatarText: "text-orange-700",
    metric: "18 hrs",
    metricLabel: "to removal",
    date: "May 2026",
    stars: 5,
  },
  {
    quote: "An ex-employee wrote a fabricated story that was ranking #2 for our company name. RepShield got it removed and Google dropped it within days.",
    name: "Rachel T.",
    role: "HR Director, Logistics Co.",
    initials: "RT",
    avatarBg: "bg-pink-100",
    avatarText: "text-pink-700",
    metric: "36 hrs",
    metricLabel: "to removal",
    date: "Apr 2026",
    stars: 5,
  },
  {
    quote: "I thought there was nothing I could do. Turns out there was — I just needed the right people. Discreet, professional, effective.",
    name: "Alex K.",
    role: "Restaurant Owner",
    initials: "AK",
    avatarBg: "bg-teal-100",
    avatarText: "text-teal-700",
    metric: "24 hrs",
    metricLabel: "to removal",
    date: "Mar 2026",
    stars: 5,
  },
  {
    quote: "Three false accusations in a subreddit with 2M subscribers. All three gone. My kids can search my name now without seeing that garbage.",
    name: "Michael L.",
    role: "Financial Advisor",
    initials: "ML",
    avatarBg: "bg-amber-100",
    avatarText: "text-amber-700",
    metric: "3",
    metricLabel: "posts removed",
    date: "Feb 2026",
    stars: 5,
  },
  {
    quote: "We were about to close a funding round and a hit piece appeared on Reddit. RepShield removed it before our investors saw it. Deal closed.",
    name: "Nina S.",
    role: "CEO, Fintech Startup",
    initials: "NS",
    avatarBg: "bg-indigo-100",
    avatarText: "text-indigo-700",
    metric: "14 hrs",
    metricLabel: "to removal",
    date: "Jan 2026",
    stars: 5,
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
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${t.avatarBg} flex items-center justify-center flex-shrink-0`}>
                    <span className={`text-xs font-bold ${t.avatarText}`}>{t.initials}</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.role}</div>
                  </div>
                </div>
                <span className="text-xs text-gray-300">{t.date}</span>
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

        {/* Read more reviews CTA */}
        <div className="text-center mt-8">
          <a
            href="https://uk.trustpilot.com/review/removefromreddit.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-orange-500 transition-colors"
          >
            Read more reviews on Trustpilot
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>

      </div>
    </section>
  );
}
