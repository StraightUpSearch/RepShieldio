import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { SiReddit } from "react-icons/si";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function FinalServiceCTA() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [redditUrl, setRedditUrl] = useState("");

  const submitQuoteRequest = useMutation({
    mutationFn: async (data: { redditUrl: string }) => {
      return await apiRequest("POST", "/api/quote-request", data);
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted!",
        description: "We'll send you a quote within 24 hours.",
        variant: "default",
      });
      setRedditUrl("");
      setLocation("/ticket-status");
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

    submitQuoteRequest.mutate({ redditUrl });
  };

  return (
    <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
      {/* Accent Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-orange-500"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Main Message */}
        <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
          We've resolved 1,650+ Reddit<br/>
          defamation cases.
        </h2>
        
        {/* Service Promise */}
        <p className="text-xl text-gray-300 mb-4 max-w-3xl mx-auto">
          No Zoom calls, no fluff — just results.
        </p>
        
        <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
          Paste your Reddit link to get a removal quote within 24 hours.
        </p>
        
        {/* URL Input Form */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <SiReddit className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-500" />
              <Input
                type="url"
                placeholder="https://reddit.com/r/..."
                value={redditUrl}
                onChange={(e) => setRedditUrl(e.target.value)}
                className="pl-12 h-14 text-lg bg-gray-800 border-2 border-gray-700 focus:border-orange-500 text-white placeholder:text-gray-400 rounded-xl"
                required
              />
            </div>
            <Button 
              type="submit" 
              size="lg"
              disabled={submitQuoteRequest.isPending}
              className="h-14 px-8 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg whitespace-nowrap rounded-xl"
            >
              {submitQuoteRequest.isPending ? "Processing..." : "Start Case Review"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </form>
        </div>
        
        {/* Service Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mx-auto mb-3"></div>
            <p className="text-sm text-gray-300 font-medium">No upfront payment</p>
            <p className="text-xs text-gray-500">Pay only after successful removal</p>
          </div>
          <div className="text-center">
            <div className="w-2 h-2 bg-blue-400 rounded-full mx-auto mb-3"></div>
            <p className="text-sm text-gray-300 font-medium">24-48 hour turnaround</p>
            <p className="text-xs text-gray-500">Most cases resolved within 2 days</p>
          </div>
          <div className="text-center">
            <div className="w-2 h-2 bg-purple-400 rounded-full mx-auto mb-3"></div>
            <p className="text-sm text-gray-300 font-medium">Legal & confidential</p>
            <p className="text-xs text-gray-500">Professional, ethical approach</p>
          </div>
        </div>
        
        {/* Trust Indicators */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex justify-center items-center space-x-8 text-sm text-gray-400">
            <div>95% success rate</div>
            <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
            <div>1,650+ cases resolved</div>
            <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
            <div>Legal team on standby</div>
          </div>
        </div>
      </div>
    </section>
  );
} 