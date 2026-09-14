import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiReddit } from "react-icons/si";
import { Search, Loader2, AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";

interface PreviewMention {
  subreddit: string;
  timeAgo: string;
  sentiment: string;
  previewText: string;
  url: string;
  score: number;
  platform: string;
}

interface ScanResults {
  totalFound: number;
  postsCount: number;
  commentsCount: number;
  riskScore: number;
  riskLevel: string;
  sentiment: string;
  previewMentions: PreviewMention[];
}

export default function Scan() {
  const [brandName, setBrandName] = useState("");
  const [results, setResults] = useState<ScanResults | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const scanMutation = useMutation({
    mutationFn: async (brand: string) => {
      const response = await apiRequest("POST", "/api/live-scan", {
        brandName: brand,
        platforms: ["reddit"],
      });
      return await response.json();
    },
    onSuccess: (res: any) => {
      const d = res.data ?? res;
      setResults({
        totalFound: d.totalMentions ?? 0,
        postsCount: d.posts ?? 0,
        commentsCount: d.comments ?? 0,
        riskScore: d.riskScore ?? 0,
        riskLevel: d.riskLevel ?? "low",
        sentiment: d.sentiment ?? "neutral",
        previewMentions: d.previewMentions ?? [],
      });
      toast({
        title: "Scan complete",
        description: `Found ${d.totalMentions ?? 0} mentions — Risk: ${(d.riskLevel ?? "low").toUpperCase()}`,
      });
    },
    onError: () => {
      toast({
        title: "Scan unavailable",
        description: "Live scanning is temporarily unavailable. Please try again shortly.",
        variant: "destructive",
      });
    },
  });

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;
    scanMutation.mutate(brandName.trim());
  };

  const riskTextColor = (score: number) => {
    if (score >= 70) return "text-red-600";
    if (score >= 40) return "text-amber-600";
    return "text-green-600";
  };

  return (
    <>
      <Header />
      <div className="relative min-h-screen bg-white overflow-hidden">
        <div
          className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">

          {/* Page header */}
          <div className="mb-12 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-full px-3 py-1 text-xs font-semibold text-orange-600 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse inline-block" />
              Live Reddit Scanner
            </div>
            <h1 className="font-satoshi text-4xl lg:text-5xl font-black text-gray-950 tracking-[-0.03em] leading-[1.06] mb-4">
              See what Reddit is saying<br />about your brand
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed">
              Enter your brand name to scan Reddit for recent mentions, negative posts, and reputation risks.
            </p>
          </div>

          {/* Scan form */}
          <form onSubmit={handleScan} className="mb-12">
            <div className="flex gap-3 max-w-xl">
              <div className="flex-1 relative">
                <SiReddit className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500 pointer-events-none" />
                <Input
                  placeholder="Brand name, company, or keyword"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="pl-12 h-14 text-base bg-white border border-gray-200 hover:border-gray-300 focus:border-orange-400 focus:ring-1 focus:ring-orange-200 rounded-xl shadow-sm transition-colors"
                  disabled={scanMutation.isPending}
                />
              </div>
              <Button
                type="submit"
                disabled={scanMutation.isPending || !brandName.trim()}
                className="h-14 px-7 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold rounded-xl whitespace-nowrap shadow-sm transition-colors"
              >
                {scanMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Scan Reddit
                  </>
                )}
              </Button>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Free scan · No account required · Results in under 30 seconds
            </p>
          </form>

          {/* Results */}
          {results && (
            <div className="space-y-6">

              {/* Stats row */}
              <div className="rounded-2xl overflow-hidden border border-gray-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-100">
                  {[
                    { label: "Total mentions", value: String(results.totalFound) },
                    { label: "Posts found", value: String(results.postsCount) },
                    { label: "Comments found", value: String(results.commentsCount) },
                    { label: "Risk score", value: `${results.riskScore}%`, colored: true },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white px-6 py-5">
                      <div
                        className={`font-satoshi text-3xl font-black tracking-[-0.03em] ${
                          stat.colored ? riskTextColor(results.riskScore) : "text-gray-950"
                        }`}
                      >
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk alert */}
              {results.riskLevel !== "low" && (
                <div
                  className={`rounded-2xl border p-5 flex items-start gap-3 ${
                    results.riskLevel === "high"
                      ? "bg-red-50 border-red-200"
                      : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <AlertTriangle
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      results.riskLevel === "high" ? "text-red-500" : "text-amber-500"
                    }`}
                  />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {results.riskLevel === "high"
                        ? "High reputation risk detected"
                        : "Moderate reputation activity detected"}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Our specialists can review this content and provide removal options.
                    </div>
                  </div>
                </div>
              )}

              {/* Mentions preview */}
              {results.previewMentions.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-satoshi text-xl font-black text-gray-950 tracking-[-0.02em]">
                      Recent mentions on Reddit
                    </h2>
                    <span className="text-xs text-gray-400">
                      {results.totalFound} total found
                    </span>
                  </div>

                  <div className="relative">
                    <div className="space-y-3">
                      {results.previewMentions.map((mention, i) => (
                        <div
                          key={i}
                          className={`border border-gray-100 rounded-2xl p-5 bg-white ${
                            i >= 1 ? "blur-sm select-none pointer-events-none" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                              r/{mention.subreddit}
                            </span>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              <span>{mention.timeAgo}</span>
                              <span>{mention.score} pts</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                            {mention.previewText}
                          </p>
                          {i === 0 && (
                            <a
                              href={mention.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View on Reddit
                            </a>
                          )}
                        </div>
                      ))}
                    </div>

                    {results.previewMentions.length > 1 && (
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent flex items-end justify-center pb-4 pt-32">
                        <div className="text-center max-w-sm w-full px-4">
                          <div className="border border-gray-100 rounded-2xl p-6 bg-white shadow-sm">
                            <div className="font-satoshi text-lg font-black text-gray-950 tracking-[-0.02em] mb-2">
                              {Math.max(results.totalFound - 1, results.previewMentions.length - 1)} more mention
                              {results.totalFound - 1 !== 1 ? "s" : ""} hidden
                            </div>
                            <p className="text-sm text-gray-500 mb-4">
                              Get a full report with all mentions, risk analysis, and removal options.
                            </p>
                            <Button
                              className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
                              onClick={() => setLocation("/contact")}
                            >
                              Get specialist analysis
                            </Button>
                            <p className="text-xs text-gray-400 mt-3">
                              No upfront payment · Free assessment
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-gray-100 p-10 text-center bg-white">
                  <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
                  <div className="font-satoshi text-lg font-black text-gray-950 mb-2">
                    No mentions found
                  </div>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto">
                    We didn't find any recent Reddit mentions for "{brandName}". Your brand looks
                    clean on this scan.
                  </p>
                </div>
              )}

              {/* Bottom CTA */}
              <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-gray-900 text-sm">
                    Need something removed?
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    Our legal team opens cases within 4 hours. Pay only on success.
                  </div>
                </div>
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 h-11 rounded-xl shrink-0 transition-colors"
                  onClick={() => setLocation("/contact")}
                >
                  Get a free quote →
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
