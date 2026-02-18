import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowRight, Shield, Clock } from "lucide-react";

export default function HeroRedesigned() {
  const [email, setEmail] = useState("");

  const handleDemoRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await fetch('/api/audit-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Website Visitor',
          email,
          company: 'Not provided',
          message: 'Free consultation request from homepage hero',
        }),
      });
      setEmail("");
    } catch {}
  };

  return (
    <section className="pt-24 pb-20 bg-gradient-to-br from-slate-50 via-white to-gray-50 relative overflow-hidden">
      {/* Simplified Background - Single Subtle Element */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full blur-3xl opacity-40"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center">
          {/* Simplified Badges - Max 2 */}
          <div className="flex justify-center items-center space-x-3 mb-8">
            <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              99% Success Rate
            </Badge>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-2">
              <Clock className="w-4 h-4 mr-2" />
              24-48 Hours
            </Badge>
          </div>
          
          {/* Clear, Bold Headline */}
          <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Clean Up Your Online
            <span className="text-orange-500"> Reputation</span>
          </h1>
          
          {/* Simplified Subheading */}
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Remove unwanted Reddit posts and comments with our proven legal process. 
            Professional, confidential, and 99% effective.
          </p>
          
          {/* Single, Prominent CTA */}
          <div className="max-w-md mx-auto">
            <form onSubmit={handleDemoRequest} className="flex flex-col sm:flex-row gap-4">
              <Input
                type="email"
                placeholder="Enter your email for free consultation"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-14 text-lg border-2 border-gray-200 focus:border-orange-500"
              />
              <Button 
                type="submit" 
                size="lg"
                className="h-14 px-8 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg whitespace-nowrap"
              >
                Book Free Demo
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </form>
            <p className="text-sm text-slate-500 mt-3">
              No spam. Free 15-minute consultation call.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 