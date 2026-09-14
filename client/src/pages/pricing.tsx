import { useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle2, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Comment Removal",
    price: "$300",
    description: "Individual Reddit comments containing false, defamatory, or harmful content.",
    features: [
      "Full eligibility review",
      "Legal filing via official Reddit channels",
      "Progress updates throughout",
      "Written confirmation of removal",
      "No charge if removal is unsuccessful",
    ],
    cta: "Get a free quote",
    href: "/contact",
    highlight: false,
  },
  {
    name: "Post & Thread Removal",
    price: "$1,200",
    description: "Complete Reddit posts, threads, or cross-posted content — including associated comments.",
    features: [
      "Full eligibility review",
      "Legal filing via official Reddit channels",
      "Progress updates throughout",
      "Written confirmation of removal",
      "No charge if removal is unsuccessful",
      "Cross-post sweep included",
      "Priority case handling",
    ],
    cta: "Get a free quote",
    href: "/contact",
    highlight: true,
  },
];

const faqs = [
  {
    q: "Why do these prices include legal filing?",
    a: "Reddit content removal requires formal legal or policy-based submissions to Reddit's trust & safety team. Our legal experts prepare and file the correct documentation, which is why our success rate is 95%+. DIY reports to Reddit rarely work for defamatory content.",
  },
  {
    q: "What if the removal is unsuccessful?",
    a: "You pay nothing. Our model is strictly success-based — if we can't get the content removed, you owe us zero. We only take on cases we believe are eligible, so our acceptance of a case is itself a positive signal.",
  },
  {
    q: "How long does removal take?",
    a: "Most cases are resolved within 24–72 hours once we begin the filing process. Complex posts involving multiple subreddits or high-profile threads may take up to 7 days. We keep you updated at every stage.",
  },
  {
    q: "What content qualifies for removal?",
    a: "Content that is demonstrably false, defamatory, violates Reddit's content policies, or infringes your legal rights. Our case managers assess every submission for eligibility before issuing a quote — if a case doesn't qualify, we'll tell you honestly.",
  },
  {
    q: "Are there bulk pricing options?",
    a: "Yes. If you have multiple posts or comments to remove, contact us via the quote form and mention the volume — we offer discounted rates for 3+ removals.",
  },
];

export default function PricingPage() {
  useEffect(() => {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.a,
        },
      })),
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-schema", "pricing-faq");
    script.textContent = JSON.stringify(faqSchema);
    const existing = document.querySelector('script[data-schema="pricing-faq"]');
    if (existing) existing.remove();
    document.head.appendChild(script);
    return () => {
      const el = document.querySelector('script[data-schema="pricing-faq"]');
      if (el) el.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="relative pt-28 pb-20 bg-white overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" aria-hidden="true" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">Transparent pricing</p>
          <h1 className="font-satoshi text-5xl lg:text-6xl font-black text-gray-950 tracking-[-0.04em] leading-[1.04] mb-5">
            Pay only when it works.
          </h1>
          <p className="text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
            No upfront fees. No subscriptions. A flat rate per removal — charged only after the content is gone.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-8 space-y-6 ${
                  plan.highlight
                    ? "border-gray-950 bg-gray-950 text-white shadow-xl"
                    : "border-gray-200 bg-white shadow-sm"
                }`}
              >
                {plan.highlight && (
                  <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-orange-500 text-white px-3 py-1 rounded-full">
                    Most common
                  </span>
                )}
                <div>
                  <h2 className={`font-satoshi text-xl font-black tracking-[-0.02em] mb-1 ${plan.highlight ? "text-white" : "text-gray-950"}`}>
                    {plan.name}
                  </h2>
                  <p className={`text-sm leading-relaxed ${plan.highlight ? "text-gray-400" : "text-gray-500"}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="flex items-end gap-1">
                  <span className={`font-satoshi text-5xl font-black tracking-[-0.04em] ${plan.highlight ? "text-white" : "text-gray-950"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm mb-2 ${plan.highlight ? "text-gray-400" : "text-gray-400"}`}>per removal</span>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlight ? "text-green-400" : "text-green-500"}`} />
                      <span className={plan.highlight ? "text-gray-300" : "text-gray-700"}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={`w-full h-12 font-semibold rounded-xl ${
                    plan.highlight
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : "bg-gray-950 hover:bg-gray-800 text-white"
                  }`}
                >
                  <Link href={plan.href}>
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>

          {/* No removal no fee callout */}
          <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl px-8 py-6 text-center">
            <p className="text-green-800 font-semibold text-base flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              No removal, no fee — guaranteed. If we can't remove the content, you pay nothing.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-satoshi text-3xl font-black text-gray-950 tracking-[-0.03em] mb-10 text-center">
            Frequently asked questions
          </h2>
          <div className="space-y-0 divide-y divide-gray-200 border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            {faqs.map((faq) => (
              <div key={faq.q} className="px-7 py-6">
                <p className="font-semibold text-gray-950 mb-2">{faq.q}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-gray-950 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-satoshi text-4xl font-black tracking-[-0.03em] mb-4">
            Ready to get it removed?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Paste the Reddit URL and we'll review it for free. A quote arrives within 4 hours.
          </p>
          <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white font-semibold h-14 px-10 rounded-xl text-base shadow-sm">
            <Link href="/contact">Get a free quote</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
