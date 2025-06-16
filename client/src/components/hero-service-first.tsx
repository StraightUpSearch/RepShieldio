import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Shield, Clock, CheckCircle } from "lucide-react";
import { SiReddit } from "react-icons/si";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function HeroServiceFirst() {
  const { toast } = useToast();
  const [redditUrl, setRedditUrl] = useState("");
  const [email, setEmail] = useState("");
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitQuoteRequest = useMutation({
    mutationFn: async (data: { redditUrl: string; email: string }) => {
      return await apiRequest("POST", "/api/quote-request", data);
    },
    onSuccess: () => {
      setIsSubmitted(true);
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!redditUrl.trim() || !redditUrl.includes('reddit.com')) {
      toast({
        title: "Valid Reddit URL Required",
        description: "Please enter a valid Reddit URL for removal.",
        variant: "destructive",
      });
      return;
    }

    if (!showEmailCapture) {
      setShowEmailCapture(true);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      toast({
        title: "Valid Email Required",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    submitQuoteRequest.mutate({ redditUrl, email });
  };

  if (isSubmitted) {
    return (
      <section className="pt-24 pb-20 bg-gray-50 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your Removal Request Has Been Received
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              A case manager will reach out within 24 hours with your removal quote and timeline.
            </p>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-sm font-medium text-gray-800 mb-2">CASE REFERENCE</p>
              <p className="text-lg font-mono text-gray-600">RS-{Date.now().toString().slice(-6)}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-24 pb-20 bg-gray-50 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {/* Trust Badges */}
          <div className="flex justify-center items-center space-x-4 mb-8">
            <Badge variant="secondary" className="bg-white text-green-700 border-green-200 px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              99% Success Rate
            </Badge>
            <Badge variant="secondary" className="bg-white text-blue-700 border-blue-200 px-4 py-2">
              <Clock className="w-4 h-4 mr-2" />
              24-48 Hours
            </Badge>
            <Badge variant="secondary" className="bg-white text-gray-700 border-gray-200 px-4 py-2">
              Legal & Ethical
            </Badge>
          </div>
          
          {/* Main Headline */}
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Get Reddit Posts, Threads &<br/>
            Comments Removed – Fast
          </h1>
          
          {/* Subheadline with Trust Points */}
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Professional content removal service. Legal, ethical, confidential.
            We've resolved 1,650+ Reddit defamation cases.
          </p>
          
          {/* URL Input Form */}
          <div className="max-w-2xl mx-auto mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!showEmailCapture ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <SiReddit className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-500" />
                    <Input
                      type="url"
                      placeholder="Paste Reddit URL here..."
                      value={redditUrl}
                      onChange={(e) => setRedditUrl(e.target.value)}
                      className="pl-12 h-14 text-lg bg-white border-2 border-gray-200 focus:border-orange-500 rounded-xl"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitQuoteRequest.isPending}
                    className="h-14 px-8 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg whitespace-nowrap rounded-xl"
                  >
                    {submitQuoteRequest.isPending ? "Processing..." : "Get My Free Quote"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-left">
                    <p className="text-sm text-gray-500 mb-2">Analyzing URL:</p>
                    <p className="bg-gray-200 p-3 rounded-lg text-sm break-all">{redditUrl}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Input
                      type="email"
                      placeholder="Enter your email to receive the quote"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="flex-1 h-14 text-lg bg-white border-2 border-gray-200 focus:border-orange-500 rounded-xl"
                    />
                    <Button
                      type="submit"
                      size="lg"
                      disabled={submitQuoteRequest.isPending}
                      className="h-14 px-8 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg whitespace-nowrap rounded-xl"
                    >
                      {submitQuoteRequest.isPending ? "Processing..." : "Get Quote"}
                    </Button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEmailCapture(false)}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    ← Change URL
                  </button>
                </div>
              )}
            </form>
            
            {/* Service Steps Subcopy */}
            <p className="text-sm text-gray-500 mt-4 leading-relaxed">
              <span className="font-medium">Step 1:</span> Paste URL.
              <span className="font-medium"> Step 2:</span> Enter your email for a quote.
              <span className="font-medium"> Step 3:</span> We remove it.
            </p>
          </div>
          
          {/* Social Proof Bar */}
          <div className="flex justify-center items-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              1,650+ Cases Resolved
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              No Upfront Payment
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Confidential Process
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 