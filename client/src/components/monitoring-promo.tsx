import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Bell, TrendingDown, Clock, CheckCircle2, ArrowRight } from "lucide-react";

const features = [
  { icon: <Bell className="w-4 h-4 text-orange-500" />, text: "Instant alerts when your brand is mentioned" },
  { icon: <TrendingDown className="w-4 h-4 text-red-500" />, text: "Sentiment scoring on every new post" },
  { icon: <Clock className="w-4 h-4 text-gray-500" />, text: "Weekly and daily scan options" },
  { icon: <CheckCircle2 className="w-4 h-4 text-green-500" />, text: "One-click case creation for flagged content" },
];

export default function MonitoringPromo() {
  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_400px] gap-14 items-center">

          {/* Left */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Brand protection</p>
            <h2 className="font-satoshi text-4xl font-black text-gray-950 tracking-[-0.03em] leading-[1.06] mb-5">
              Stop fires before<br />they start.
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg">
              Get alerted the moment your brand appears on Reddit. Our monitoring catches damaging content before it goes viral — so you can act in hours, not weeks.
            </p>

            <ul className="space-y-3 mb-8">
              {features.map((f) => (
                <li key={f.text} className="flex items-center gap-3 text-sm text-gray-700">
                  <span className="flex-shrink-0">{f.icon}</span>
                  {f.text}
                </li>
              ))}
            </ul>

            <Button asChild className="bg-gray-950 hover:bg-gray-800 text-white font-semibold h-12 px-7 rounded-xl">
              <Link href="/monitoring">
                Start monitoring
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Right: mock alert card */}
          <div className="hidden lg:block">
            <div className="bg-gray-950 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Live monitor — AcmeCorp</span>
                <span className="flex items-center gap-1.5 text-xs text-green-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                  Active
                </span>
              </div>

              {[
                { subreddit: "r/entrepreneur", risk: "high", snippet: "Anyone else had issues with AcmeCorp's billing?" },
                { subreddit: "r/smallbusiness", risk: "medium", snippet: "AcmeCorp has been pretty solid for us tbh" },
                { subreddit: "r/scams", risk: "high", snippet: "Warning: AcmeCorp charged me twice and ignored..." },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-400 font-medium">{item.subreddit}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      item.risk === "high"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {item.risk} risk
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 leading-snug truncate">{item.snippet}</p>
                </div>
              ))}

              <div className="pt-2 text-center">
                <span className="text-xs text-gray-500">3 new mentions in the last 6 hours</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
