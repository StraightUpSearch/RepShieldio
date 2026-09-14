import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiReddit, SiTelegram } from "react-icons/si";
import { CheckCircle2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const allCases = [
  { type: "Reddit post, 2.4k upvotes", sector: "SaaS startup", time: "2 hrs ago" },
  { type: "Thread + 17 comments", sector: "E-commerce brand", time: "5 hrs ago" },
  { type: "Cross-posted defamation", sector: "Law firm", time: "8 hrs ago" },
  { type: "Competitor attack thread", sector: "B2B software", time: "11 hrs ago" },
  { type: "False review campaign", sector: "Medical practice", time: "14 hrs ago" },
  { type: "Doxxing attempt thread", sector: "Tech founder", time: "16 hrs ago" },
  { type: "1.1k upvote smear post", sector: "Financial services", time: "19 hrs ago" },
];

export default function HeroServiceFirst() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [redditUrl, setRedditUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [email, setEmail] = useState("");
  const [showEmailStep, setShowEmailStep] = useState(false);
  const [caseOffset, setCaseOffset] = useState(0);
  const visibleCases = allCases.slice(caseOffset, caseOffset + 5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCaseOffset((prev) => (prev + 1) % (allCases.length - 4));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const submitQuoteRequest = useMutation({
    mutationFn: async (data: { redditUrl: string; email: string }) => {
      return await apiRequest("POST", "/api/quote-request", data);
    },
    onSuccess: () => {
      setLocation(`/ticket-status?email=${encodeURIComponent(email)}&submitted=1`);
    },
    onError: () => {
      toast({
        title: "Submission failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  const handleUrlBlur = () => {
    if (redditUrl && !redditUrl.includes("reddit.com")) {
      setUrlError("Please enter a valid reddit.com URL");
    } else {
      setUrlError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!redditUrl.trim() || !redditUrl.includes("reddit.com")) {
      setUrlError("Please enter a valid reddit.com URL");
      return;
    }

    if (!showEmailStep) {
      setShowEmailStep(true);
      return;
    }

    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email to receive the quote.",
        variant: "destructive",
      });
      return;
    }

    submitQuoteRequest.mutate({ redditUrl, email });
  };

  return (
    <section className="relative pt-24 pb-16 lg:pt-28 lg:pb-24 bg-white overflow-hidden">
      {/* Dot-grid background */}
      <div className="absolute inset-0 bg-dot-grid opacity-50 pointer-events-none" aria-hidden="true" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_380px] gap-16 items-start">

          {/* Left: headline + form */}
          <div>
            <h1 className="font-satoshi text-5xl lg:text-6xl xl:text-[4.25rem] leading-[1.04] tracking-[-0.04em] text-gray-950 font-black mb-6">
              Get Reddit posts,<br />
              threads and comments<br />
              removed. Fast.
            </h1>

            <p className="text-xl text-gray-500 mb-6 lg:mb-10 max-w-[500px] leading-relaxed">
              Paste the URL below. Our legal team opens your case within 4 hours.
              Pay only after the content is gone.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-w-[540px] space-y-3 mb-8">
              {!showEmailStep ? (
                <>
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <SiReddit className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500 pointer-events-none" />
                      <Input
                        type="url"
                        placeholder="https://reddit.com/r/..."
                        value={redditUrl}
                        onChange={(e) => { setRedditUrl(e.target.value); if (urlError) setUrlError(""); }}
                        onBlur={handleUrlBlur}
                        className={`pl-12 h-14 text-base bg-white border hover:border-gray-300 focus:ring-1 rounded-xl shadow-sm transition-colors ${urlError ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-orange-400 focus:ring-orange-200'}`}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="h-14 px-7 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold text-base rounded-xl transition-colors whitespace-nowrap shadow-sm"
                    >
                      Get quote
                    </Button>
                  </div>
                  {urlError && (
                    <p className="text-sm text-red-500 -mt-1">{urlError}</p>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                    <span className="text-xs text-gray-400 mr-2">URL:</span>
                    <span className="text-sm text-gray-700 break-all">{redditUrl}</span>
                  </div>
                  <div className="flex gap-3">
                    <Input
                      type="email"
                      placeholder="Your email for the quote"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 h-14 bg-white border border-gray-200 hover:border-gray-300 focus:border-orange-400 focus:ring-1 focus:ring-orange-200 rounded-xl shadow-sm"
                      required
                    />
                    <Button
                      type="submit"
                      disabled={submitQuoteRequest.isPending}
                      className="h-14 px-7 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl whitespace-nowrap shadow-sm"
                    >
                      {submitQuoteRequest.isPending ? "Sending..." : "Send quote"}
                    </Button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEmailStep(false)}
                    className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Change URL
                  </button>
                </div>
              )}

              {/* Step indicator */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${!showEmailStep ? 'bg-gray-950 text-white' : 'bg-green-500 text-white'}`}>
                    {!showEmailStep ? '1' : '✓'}
                  </span>
                  <span className={`text-xs font-medium transition-colors ${!showEmailStep ? 'text-gray-900' : 'text-gray-400'}`}>Paste URL</span>
                </div>
                <div className="w-6 h-px bg-gray-200" />
                <div className="flex items-center gap-1.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${showEmailStep ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    2
                  </span>
                  <span className={`text-xs font-medium transition-colors ${showEmailStep ? 'text-gray-900' : 'text-gray-400'}`}>Enter email</span>
                </div>
                <div className="w-6 h-px bg-gray-200" />
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-gray-100 text-gray-400">3</span>
                  <span className="text-xs font-medium text-gray-400">Get quote</span>
                </div>
              </div>
            </form>

            {/* Trust bar */}
            <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500 mb-4">
              {[
                "No upfront payment",
                "95% success rate",
                "Legal and confidential",
              ].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {item}
                </span>
              ))}
            </div>

            {/* Telegram quick CTA */}
            <a
              href="https://t.me/repshield"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0088CC] transition-colors"
            >
              <SiTelegram className="w-4 h-4 text-[#0088CC]" />
              Prefer to chat first? Message us on Telegram for a free assessment.
            </a>
          </div>

          {/* Right: live case feed */}
          <div className="hidden lg:block">
            <div className="border border-gray-100 rounded-2xl bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Recent removals
                </span>
                <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                  Live
                </span>
              </div>

              <div className="divide-y divide-gray-50">
                {visibleCases.map((c, i) => (
                  <div key={`${caseOffset}-${i}`} className="px-5 py-4 flex items-center justify-between gap-4 transition-opacity duration-500">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{c.type}</div>
                      <div className="text-xs text-gray-400">{c.sector} · {c.time}</div>
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full flex-shrink-0">
                      Removed
                    </span>
                  </div>
                ))}
              </div>

              <div className="px-5 py-4 border-t border-gray-100 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-satoshi font-black text-gray-950 tracking-[-0.03em]">1,650+</div>
                  <div className="text-xs text-gray-400 mt-0.5">Cases resolved</div>
                </div>
                <div>
                  <div className="text-2xl font-satoshi font-black text-gray-950 tracking-[-0.03em]">95%</div>
                  <div className="text-xs text-gray-400 mt-0.5">Success rate</div>
                </div>
                <div>
                  <div className="text-2xl font-satoshi font-black text-gray-950 tracking-[-0.03em]">36hrs</div>
                  <div className="text-xs text-gray-400 mt-0.5">Avg resolution</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Mobile stats — only visible below lg */}
        <div className="lg:hidden flex items-center gap-6 mt-8 pt-8 border-t border-gray-100 text-sm text-gray-500">
          <span><strong className="text-gray-950 font-black">1,650+</strong> cases</span>
          <span><strong className="text-gray-950 font-black">95%</strong> success</span>
          <span><strong className="text-gray-950 font-black">36hrs</strong> avg</span>
        </div>
      </div>
    </section>
  );
}
