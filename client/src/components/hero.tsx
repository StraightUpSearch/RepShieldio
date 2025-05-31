import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, Search, ArrowRight } from "lucide-react";
import { SiReddit } from "react-icons/si";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface QuoteRequest {
  redditUrl: string;
  email?: string;
}

export default function Hero() {
  const { toast } = useToast();
  const [redditUrl, setRedditUrl] = useState("");
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [email, setEmail] = useState("");

  const submitQuote = useMutation({
    mutationFn: async (data: QuoteRequest) => {
      return await apiRequest("POST", "/api/quote-request", data);
    },
    onSuccess: () => {
      toast({
        title: "Quote Request Submitted!",
        description: "We'll analyze the content and get back to you within 24 hours.",
      });
      setRedditUrl("");
      setEmail("");
      setShowEmailCapture(false);
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    }
  });

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!redditUrl.trim()) {
      toast({
        title: "Reddit URL Required",
        description: "Please enter the Reddit URL you'd like us to analyze.",
        variant: "destructive",
      });
      return;
    }

    if (!redditUrl.includes('reddit.com')) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Reddit URL.",
        variant: "destructive",
      });
      return;
    }

    if (!showEmailCapture) {
      setShowEmailCapture(true);
      return;
    }

    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email to receive the quote.",
        variant: "destructive",
      });
      return;
    }

    submitQuote.mutate({ redditUrl, email });
  };

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToResults = () => {
    const element = document.getElementById('results');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="pt-24 pb-16 bg-gradient-to-br from-slate-900 via-navy-deep to-slate-800 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center items-center space-x-2 mb-6">
            <Badge variant="secondary" className="bg-success-green/20 text-success-green border-success-green/30">
              <Check className="w-3 h-3 mr-1" />
              99% Success Rate
            </Badge>
            <Badge variant="secondary" className="bg-reddit-orange/20 text-reddit-orange border-reddit-orange/30">
              Legal & Ethical
            </Badge>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            Get Reddit Posts, Threads &{" "}
            <br className="hidden lg:block" />
            Comments Removed – Fast
          </h1>
          
          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Clean up your online presence with our proven 99% success rate. Legal. Ethical. Confidential.
          </p>
          
          {/* Lead Capture Form */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto border border-slate-700">
            <form onSubmit={handleQuoteSubmit} className="space-y-4">
              {!showEmailCapture ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    type="url"
                    placeholder="Enter Reddit URL (post, comment, or thread)"
                    value={redditUrl}
                    onChange={(e) => setRedditUrl(e.target.value)}
                    className="flex-1 h-14 text-lg bg-white text-gray-900 border-0 focus:ring-2 focus:ring-reddit-orange"
                  />
                  <Button 
                    type="submit"
                    size="lg"
                    className="bg-reddit-orange text-white hover:bg-red-600 transition-colors font-semibold text-lg px-8 h-14"
                  >
                    Get My Free Quote
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-left">
                    <p className="text-sm text-slate-400 mb-2">Analyzing URL:</p>
                    <p className="text-white bg-slate-700 p-3 rounded-lg text-sm break-all">{redditUrl}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Input
                      type="email"
                      placeholder="Enter your email to receive the quote"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 h-14 text-lg bg-white text-gray-900 border-0 focus:ring-2 focus:ring-reddit-orange"
                    />
                    <Button 
                      type="submit"
                      disabled={submitQuote.isPending}
                      size="lg"
                      className="bg-reddit-orange text-white hover:bg-red-600 transition-colors font-semibold text-lg px-8 h-14"
                    >
                      {submitQuote.isPending ? "Analyzing..." : "Get Quote"}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEmailCapture(false)}
                    className="text-slate-400 hover:text-white text-sm"
                  >
                    ← Change URL
                  </button>
                </div>
              )}
            </form>
            
            <p className="text-slate-400 text-sm mt-4">
              We'll get back to you with a tailored quote within 24 hours
            </p>
          </div>
          
          {/* Secondary CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button 
              onClick={scrollToContact}
              variant="outline"
              size="lg"
              className="border-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors font-semibold"
            >
              <Search className="w-5 h-5 mr-2" />
              Full Brand Audit
            </Button>
            <Button 
              onClick={scrollToResults}
              variant="ghost"
              size="lg"
              className="text-slate-300 hover:bg-slate-700 hover:text-white transition-colors font-semibold"
            >
              View Case Studies
            </Button>
          </div>
        </div>
        
        {/* Trust Indicators */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 pt-8 md:pt-12 border-t border-slate-700 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-reddit-orange">95%+</div>
            <div className="text-xs md:text-sm text-slate-400">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-reddit-orange">1,650+</div>
            <div className="text-xs md:text-sm text-slate-400">Removals Done</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-reddit-orange">24hrs</div>
            <div className="text-xs md:text-sm text-slate-400">Response Time</div>
          </div>
        </div>
      </div>
      
      {/* Visual elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-32 h-32 bg-reddit-orange/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
}