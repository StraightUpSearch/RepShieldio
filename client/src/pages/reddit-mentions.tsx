import { useEffect, useState } from "react";
import { Link } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SEOHead from "@/components/seo-head";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { SiLinkedin } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";

const JAMIE_PHOTO =
  "https://media.licdn.com/dms/image/v2/D4E03AQHHmyaMTgwJSg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1667558672803?e=1790812800&v=beta&t=mIUDgECtD9tYPTdNiNmryyjCvQqdl9ZnFDAs1v5wLRU";

const plans = [
  {
    name: "Starter",
    price: "$650",
    highlight: false,
    badge: null,
    description: "Brand visibility in relevant subreddits — no links, pure mention authority.",
    features: [
      "10 natural mentions in relevant subreddits",
      "No links (safer, more natural tone)",
      "Aged Reddit accounts",
      "14-day delivery",
      "Report with live URLs to every mention",
    ],
    cta: "Get started",
  },
  {
    name: "Growth",
    price: "$1,040",
    highlight: false,
    badge: null,
    description: "Mentions with links, targeting threads that already rank on Google.",
    features: [
      "10 mentions WITH contextual links",
      "Priority: threads ranking on Google",
      "Aged Reddit accounts",
      "14-day delivery",
      "Full placement report + metrics",
    ],
    cta: "Get started",
  },
  {
    name: "Authority",
    price: "$1,950",
    highlight: true,
    badge: "Most popular",
    description: "Premium placements in buyer-intent threads. The full Reddit SEO treatment.",
    features: [
      "5 premium threads + 10 supporting comments",
      "Hand-selected threads ranking for buyer-intent keywords",
      "Aged, high-karma account placement",
      "30-day delivery",
      "Full report + strategy call with Jamie",
    ],
    cta: "Get started",
  },
];

const whyCards = [
  {
    title: "Reddit ranks everywhere",
    body: "Google surfaces Reddit threads for nearly every niche keyword. A mention in a ranking thread is visibility your paid ads simply can't buy.",
  },
  {
    title: "AI answers cite Reddit",
    body: "ChatGPT, Gemini, and Perplexity pull from Reddit heavily. Brand mentions shape what AI says about you when prospects ask.",
  },
  {
    title: "Authentic, not spammy",
    body: "Every mention is written to add genuine value. Comments that earn upvotes and stick — not promotional spam that gets removed in hours.",
  },
];

const steps = [
  {
    n: "01",
    title: "Share your brand brief",
    body: "Tell us your brand, niche, competitors, and target keywords. Five minutes of input, that's all we need.",
  },
  {
    n: "02",
    title: "We find ranking threads",
    body: "We identify threads already ranking on Google in your niche. You review and approve the shortlist before anything goes live.",
  },
  {
    n: "03",
    title: "We write and place",
    body: "Natural, helpful comments with seamless brand integration — posted from aged Reddit accounts that carry real credibility.",
  },
  {
    n: "04",
    title: "You receive the report",
    body: "A full report with direct URLs to every live mention, the subreddit, thread metrics, and ranking position where applicable.",
  },
];

const audiences = [
  "SaaS and software companies building organic brand awareness",
  "E-commerce brands wanting discovery in product recommendation threads",
  "Local businesses aiming to appear in 'best X in [city]' Reddit discussions",
  "Anyone trying to influence what AI says about their brand",
];

const faqs = [
  {
    q: "Do you target threads that rank on Google?",
    a: "Yes — that's our first filter on every campaign. There's no point placing in a thread nobody finds. We only select threads with measurable Google visibility.",
  },
  {
    q: "Can mentions include links?",
    a: "Yes on Growth and Authority tiers. Starter is linkless — which is often safer and reads more naturally. Many clients run Starter first to establish credibility, then upgrade.",
  },
  {
    q: "How long do mentions last?",
    a: "We guarantee 3 months. In practice, most stay permanently because they're genuinely helpful and attract upvotes — which signals to Reddit that they belong.",
  },
  {
    q: "Is this against Reddit's rules?",
    a: "We write authentic, value-adding comments. We don't spam, astroturf, or violate subreddit rules. Our approach is sustainable — the comments look and read like real community contributions, because the standard we hold them to is exactly that.",
  },
  {
    q: "What niches do you work in?",
    a: "Most niches. Ask us if you're unsure. We don't work with adult content, gambling, or anything illegal.",
  },
  {
    q: "What's in the report?",
    a: "A spreadsheet with clickable URLs to every live comment, the subreddit, thread title, post date, karma at time of placement, and Google ranking position where we have it.",
  },
];

export default function RedditMentions() {
  const { toast } = useToast();
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  const handleCheckout = async (planName: string) => {
    const pkgKey = planName.toLowerCase();
    setCheckingOut(pkgKey);
    try {
      const res = await fetch("/api/reddit-mentions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package: pkgKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Checkout failed");
      window.location.href = data.url;
    } catch (err: any) {
      toast({ title: "Checkout failed", description: err.message || "Please try again.", variant: "destructive" });
      setCheckingOut(null);
    }
  };

  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Reddit Brand Mention Placement",
      "description":
        "Strategic Reddit brand placements in real discussions that rank on Google and appear in AI answers.",
      "url": "https://removefromreddit.com/reddit-mentions",
      "provider": {
        "@type": "Person",
        "name": "Jamie Irwin",
        "jobTitle": "The Reddit SEO",
        "url": "https://www.linkedin.com/in/jamieirwin/",
      },
      "offers": plans.map((p) => ({
        "@type": "Offer",
        "name": p.name,
        "price": p.price.replace("$", "").replace(",", ""),
        "priceCurrency": "USD",
      })),
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-schema", "reddit-mentions");
    script.textContent = JSON.stringify(schema);
    const existing = document.querySelector('script[data-schema="reddit-mentions"]');
    if (existing) existing.remove();
    document.head.appendChild(script);
    return () => {
      const el = document.querySelector('script[data-schema="reddit-mentions"]');
      if (el) el.remove();
    };
  }, []);

  return (
    <>
      <SEOHead
        title="Buy Reddit Brand Mentions | The Reddit SEO | RemoveFromReddit.com"
        description="Strategic Reddit brand placements in real discussions that rank on Google and appear in AI answers. Managed by Jamie Irwin — 1,650+ Reddit cases."
      />
      <div className="min-h-screen bg-white">
        <Header />

        {/* ── Hero ── */}
        <section className="relative pt-28 pb-20 bg-white overflow-hidden">
          <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" aria-hidden="true" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">
              Reddit SEO · Brand Mentions
            </p>
            <h1 className="font-satoshi text-4xl lg:text-6xl font-black text-gray-950 tracking-[-0.04em] leading-[1.04] mb-5">
              Get your brand mentioned<br className="hidden sm:block" /> on Reddit — where Google<br className="hidden sm:block" /> and AI are already looking.
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-8">
              Strategic placements in real Reddit discussions, written naturally by Reddit SEO experts.
              We've handled 1,650+ Reddit cases — we know how the platform works.
            </p>

            {/* Trust chip */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-full">
                <img src={JAMIE_PHOTO} alt="Jamie Irwin" className="w-5 h-5 rounded-full object-cover" />
                The Reddit SEO · 1,650+ cases resolved
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                className="h-12 px-7 bg-gray-950 hover:bg-gray-800 text-white font-semibold rounded-xl"
              >
                <a href="#pricing">View packages <ArrowRight className="w-4 h-4 ml-2" /></a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 px-7 rounded-xl border-gray-200"
              >
                <Link href="/contact">Ask a question</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Why Reddit Mentions ── */}
        <section className="py-20 bg-gray-50 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-satoshi text-3xl font-black text-gray-950 tracking-[-0.03em] mb-3">
                Why Reddit mentions matter
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Reddit isn't just a forum — it's a ranking machine and an AI training source.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {whyCards.map((c) => (
                <div key={c.title} className="bg-white rounded-2xl border border-gray-100 p-8">
                  <h3 className="font-satoshi text-lg font-black text-gray-950 tracking-tight mb-3">{c.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="py-20 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-satoshi text-3xl font-black text-gray-950 tracking-[-0.03em] mb-12 text-center">
              How it works
            </h2>
            <div className="space-y-8">
              {steps.map((s) => (
                <div key={s.n} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-950 flex items-center justify-center">
                    <span className="font-satoshi text-sm font-black text-white">{s.n}</span>
                  </div>
                  <div>
                    <h3 className="font-satoshi text-lg font-black text-gray-950 tracking-tight mb-1">{s.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="py-20 bg-gray-50 border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">Transparent pricing</p>
              <h2 className="font-satoshi text-3xl font-black text-gray-950 tracking-[-0.03em] mb-3">
                Choose your package
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto">
                All packages include a placement report with live URLs. No ranking guarantees — but we only place in threads that already have traction.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-2xl border p-8 flex flex-col gap-6 ${
                    plan.highlight
                      ? "border-gray-950 bg-gray-950 text-white shadow-xl"
                      : "border-gray-200 bg-white shadow-sm"
                  }`}
                >
                  {plan.badge && (
                    <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-orange-500 text-white px-3 py-1 rounded-full w-fit">
                      {plan.badge}
                    </span>
                  )}
                  <div>
                    <h3 className={`font-satoshi text-xl font-black tracking-[-0.02em] mb-1 ${plan.highlight ? "text-white" : "text-gray-950"}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-sm leading-relaxed ${plan.highlight ? "text-gray-400" : "text-gray-500"}`}>
                      {plan.description}
                    </p>
                  </div>

                  <div className="flex items-end gap-1">
                    <span className={`font-satoshi text-4xl font-black tracking-[-0.04em] ${plan.highlight ? "text-white" : "text-gray-950"}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm mb-1 ${plan.highlight ? "text-gray-400" : "text-gray-400"}`}>per campaign</span>
                  </div>

                  <ul className="space-y-3 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlight ? "text-green-400" : "text-green-500"}`} />
                        <span className={plan.highlight ? "text-gray-300" : "text-gray-700"}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleCheckout(plan.name)}
                    disabled={checkingOut === plan.name.toLowerCase()}
                    className={`w-full h-12 font-semibold rounded-xl ${
                      plan.highlight
                        ? "bg-orange-500 hover:bg-orange-600 text-white"
                        : "bg-gray-950 hover:bg-gray-800 text-white"
                    }`}
                  >
                    {checkingOut === plan.name.toLowerCase() ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing…</>
                    ) : (
                      <>{plan.cta} <ArrowRight className="w-4 h-4 ml-2" /></>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Who is this for ── */}
        <section className="py-20 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="font-satoshi text-3xl font-black text-gray-950 tracking-[-0.03em] mb-5">
                  Who this is for
                </h2>
                <ul className="space-y-3">
                  {audiences.map((a) => (
                    <li key={a} className="flex items-start gap-3 text-gray-600 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Jamie quote */}
              <div className="bg-gray-950 rounded-2xl p-8 text-white">
                <p className="text-gray-300 leading-relaxed mb-6 text-sm">
                  "I've spent years studying how Reddit's algorithm rewards authenticity. Every mention we
                  place is crafted to survive, earn upvotes, and drive real results — not to be removed
                  in 48 hours because it reads like an ad."
                </p>
                <a
                  href="https://www.linkedin.com/in/jamieirwin/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <img
                    src={JAMIE_PHOTO}
                    alt="Jamie Irwin"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20"
                  />
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors flex items-center gap-1.5">
                      Jamie Irwin
                      <SiLinkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
                    </div>
                    <div className="text-xs text-gray-500">The Reddit SEO</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-20 bg-gray-50 border-t border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-satoshi text-3xl font-black text-gray-950 tracking-[-0.03em] mb-10 text-center">
              Frequently asked questions
            </h2>
            <div className="divide-y divide-gray-200 border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
              {faqs.map((faq) => (
                <div key={faq.q} className="px-7 py-6">
                  <p className="font-semibold text-gray-950 mb-2">{faq.q}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA footer ── */}
        <section className="py-20 bg-gray-950 text-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-satoshi text-4xl font-black tracking-[-0.03em] mb-4">
              Ready to get into the conversations that matter?
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Tell us your brand and niche — we'll send a thread shortlist within 24 hours.
            </p>
            <Button
              asChild
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold h-14 px-10 rounded-xl text-base shadow-sm"
            >
              <Link href="/contact?subject=Reddit+Mentions+Enquiry">
                Get started <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
