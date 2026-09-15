import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, TrendingUp, Globe, Sparkles } from "lucide-react";

const points = [
  { icon: <Globe className="w-4 h-4 text-orange-500" />, text: "Threads that already rank on Google" },
  { icon: <Sparkles className="w-4 h-4 text-indigo-400" />, text: "Cited by ChatGPT, Gemini, and Perplexity" },
  { icon: <TrendingUp className="w-4 h-4 text-green-500" />, text: "Natural comments that stick and earn upvotes" },
];

export default function RedditMentionsPromo() {
  return (
    <section className="py-20 bg-gray-950 text-white border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_auto] gap-10 items-center">

          <div>
            <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-4">New service</p>
            <h2 className="font-satoshi text-3xl lg:text-4xl font-black tracking-[-0.03em] leading-[1.05] mb-4">
              Want your brand mentioned<br className="hidden sm:block" /> on Reddit — positively?
            </h2>
            <p className="text-gray-400 leading-relaxed mb-6 max-w-xl">
              Strategic placements in real Reddit discussions that rank on Google and influence what AI says about you.
              Written by the same team that's resolved 1,650+ reputation cases.
            </p>

            <ul className="space-y-2.5 mb-8">
              {points.map((p) => (
                <li key={p.text} className="flex items-center gap-3 text-sm text-gray-300">
                  <span className="flex-shrink-0">{p.icon}</span>
                  {p.text}
                </li>
              ))}
            </ul>

            <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white font-semibold h-12 px-7 rounded-xl">
              <Link href="/reddit-mentions">
                See packages <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Pricing preview */}
          <div className="hidden lg:flex flex-col gap-3 min-w-[220px]">
            {[
              { name: "Starter", price: "$650", note: "10 mentions · no links" },
              { name: "Growth", price: "$1,040", note: "10 mentions · with links" },
              { name: "Authority", price: "$1,950", note: "Premium · strategy call", highlight: true },
            ].map((t) => (
              <div
                key={t.name}
                className={`rounded-xl px-5 py-4 border ${
                  t.highlight
                    ? "border-orange-500/50 bg-orange-500/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className={`text-sm font-semibold ${t.highlight ? "text-orange-300" : "text-white"}`}>{t.name}</div>
                    <div className="text-xs text-gray-500">{t.note}</div>
                  </div>
                  <div className={`font-satoshi text-lg font-black tracking-tight ${t.highlight ? "text-orange-400" : "text-white"}`}>
                    {t.price}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
