import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, AlertTriangle, Shield, TrendingDown } from "lucide-react";
import { useLocation } from "wouter";

export default function BrandScanPromo() {
  const [brand, setBrand] = useState("");
  const [, setLocation] = useLocation();

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim()) return;
    setLocation(`/scan?brand=${encodeURIComponent(brand.trim())}`);
  };

  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* Left: copy */}
          <div>
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">Free tool</p>
            <h2 className="font-satoshi text-4xl font-black text-gray-950 tracking-[-0.03em] leading-[1.06] mb-5">
              Free Reddit brand scan —<br />instant results.
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed mb-8">
              Enter your brand name and see every Reddit mention, risk score, and post that could be damaging your reputation right now.
            </p>

            <form onSubmit={handleScan} className="flex gap-3 max-w-md mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Your brand or company name"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="pl-11 h-12 border-gray-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-200 rounded-xl"
                />
              </div>
              <Button
                type="submit"
                className="h-12 px-6 bg-gray-950 hover:bg-gray-800 text-white font-semibold rounded-xl whitespace-nowrap"
              >
                Scan now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <p className="text-sm text-gray-400">No account required. Results in under 30 seconds.</p>
          </div>

          {/* Right: feature tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
            {[
              {
                icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
                title: "Risk score",
                desc: "Instant assessment of how damaging current Reddit mentions could be.",
              },
              {
                icon: <TrendingDown className="w-5 h-5 text-red-500" />,
                title: "Negative post detection",
                desc: "Every post and comment mentioning your brand, flagged by sentiment.",
              },
              {
                icon: <Shield className="w-5 h-5 text-green-500" />,
                title: "Removal eligibility",
                desc: "We identify which posts meet criteria for official Reddit removal.",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-0.5">{item.title}</p>
                  <p className="text-sm text-gray-500 leading-snug">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
