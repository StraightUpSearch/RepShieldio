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
    <section className="pt-24 pb-16 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white relative overflow-hidden">
      {/* Modern 2025 Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/10 to-purple-500/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-400/15 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400/15 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-transparent via-cyan-500/3 to-transparent rotate-12"></div>
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
          
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Clean up your online presence with our proven 99% success rate. Legal. Ethical. Confidential.
          </p>
          
          {/* Social Proof - Inspired by Fyli.ai */}
          <div className="flex flex-col items-center mb-12 relative z-10">
            <div className="flex items-center space-x-1 mb-3">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white flex items-center justify-center text-white font-semibold text-sm">J</div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white flex items-center justify-center text-white font-semibold text-sm">M</div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white flex items-center justify-center text-white font-semibold text-sm">A</div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-white flex items-center justify-center text-white font-semibold text-sm">S</div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white flex items-center justify-center text-white font-semibold text-sm">L</div>
              </div>
              <div className="flex items-center ml-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-400">Trusted by founders and marketers</p>
          </div>
          
          {/* Lead Capture Form */}
          <div className="bg-gradient-to-br from-slate-800/60 via-slate-700/40 to-slate-800/60 backdrop-blur-sm rounded-3xl p-8 max-w-2xl mx-auto border border-slate-600/50 shadow-2xl relative z-10">
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
                    className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white hover:from-orange-600 hover:via-red-600 hover:to-orange-700 transition-all duration-300 font-semibold text-lg px-8 h-14 shadow-lg hover:shadow-xl transform hover:scale-105"
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
                      className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white hover:from-orange-600 hover:via-red-600 hover:to-orange-700 transition-all duration-300 font-semibold text-lg px-8 h-14 shadow-lg hover:shadow-xl transform hover:scale-105"
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