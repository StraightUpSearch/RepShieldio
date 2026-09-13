import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiReddit } from "react-icons/si";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function FinalServiceCTA() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [redditUrl, setRedditUrl] = useState("");
  const [email, setEmail] = useState("");
  const [showEmailStep, setShowEmailStep] = useState(false);

  const submitQuoteRequest = useMutation({
    mutationFn: async (data: { redditUrl: string; email: string }) => {
      return await apiRequest("POST", "/api/quote-request", data);
    },
    onSuccess: () => {
      setLocation(`/ticket-status?email=${encodeURIComponent(email)}`);
    },
    onError: () => {
      toast({
        title: "Submission failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!redditUrl.trim() || !redditUrl.includes("reddit.com")) {
      toast({
        title: "Valid Reddit URL required",
        description: "Please enter a valid Reddit URL for removal.",
        variant: "destructive",
      });
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
    <section className="py-24 bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-10">
          <h2 className="font-satoshi text-4xl lg:text-5xl font-black tracking-[-0.03em] leading-[1.05] mb-5">
            1,650+ Reddit cases resolved.<br />
            Yours could be next.
          </h2>
          <p className="text-lg text-gray-400 max-w-xl">
            Paste your link. A case manager reviews eligibility and sends a quote within 4 hours.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-xl space-y-3 mb-12">
          {!showEmailStep ? (
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <SiReddit className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500 pointer-events-none" />
                <Input
                  type="url"
                  placeholder="https://reddit.com/r/..."
                  value={redditUrl}
                  onChange={(e) => setRedditUrl(e.target.value)}
                  className="pl-12 h-14 text-base bg-white/10 border border-white/20 hover:border-white/30 focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30 text-white placeholder:text-gray-500 rounded-xl"
                  required
                />
              </div>
              <Button
                type="submit"
                className="h-14 px-7 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold rounded-xl whitespace-nowrap transition-colors"
              >
                Get quote
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="border border-white/10 rounded-xl p-4 bg-white/5">
                <span className="text-xs text-gray-500 mr-2">URL:</span>
                <span className="text-sm text-gray-300 break-all">{redditUrl}</span>
              </div>
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="Your email for the quote"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-14 bg-white/10 border border-white/20 focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30 text-white placeholder:text-gray-500 rounded-xl"
                  required
                />
                <Button
                  type="submit"
                  disabled={submitQuoteRequest.isPending}
                  className="h-14 px-7 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl whitespace-nowrap"
                >
                  {submitQuoteRequest.isPending ? "Sending..." : "Send quote"}
                </Button>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailStep(false)}
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Change URL
              </button>
            </div>
          )}
        </form>

        {/* Trust strip */}
        <div className="border-t border-white/10 pt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-gray-400">
          <span>No upfront payment</span>
          <span>Pay only on success</span>
          <span>Legal and confidential</span>
          <span>4-hour response</span>
        </div>

      </div>
    </section>
  );
}
