import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Search, Shield } from "lucide-react";
import { SiReddit } from "react-icons/si";

export default function Hero() {
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
    <section className="pt-24 pb-16 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Badge variant="secondary" className="bg-success-green/10 text-success-green border-success-green/20">
                <Check className="w-3 h-3 mr-1" />
                Ethical & Legal Compliance
              </Badge>
              <Badge variant="secondary" className="bg-navy-deep/10 text-navy-deep border-navy-deep/20">
                Reddit Specialists
              </Badge>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Protect Your Brand from{" "}
              <span className="text-reddit-orange">Reddit</span>{" "}
              <span className="bg-gradient-to-r from-navy-deep to-navy-light bg-clip-text text-transparent">
                Defamation
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Professional Reddit reputation management for SMBs, SaaS companies, and eCommerce brands. 
              We ethically remove false, defamatory content that damages your business reputation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button 
                onClick={scrollToContact}
                size="lg"
                className="bg-reddit-orange text-white hover:bg-red-600 transition-colors font-semibold text-lg px-8 py-4"
              >
                <Search className="w-5 h-5 mr-2" />
                Get Free Reddit Audit
              </Button>
              <Button 
                onClick={scrollToResults}
                variant="outline"
                size="lg"
                className="border-2 border-navy-deep text-navy-deep hover:bg-navy-deep hover:text-white transition-colors font-semibold text-lg px-8 py-4"
              >
                View Case Studies
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-navy-deep">98%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-navy-deep">2,400+</div>
                <div className="text-sm text-gray-600">Posts Removed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-navy-deep">72hrs</div>
                <div className="text-sm text-gray-600">Avg Response</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            {/* Reddit mockup interface showing before/after */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 relative">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="ml-4 bg-gray-100 rounded-full px-3 py-1 text-sm">reddit.com</div>
              </div>
              
              {/* Before state (crossed out) */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-red-500/20 rounded-lg"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold rotate-12">
                  REMOVED
                </div>
                <div className="bg-gray-50 p-4 rounded-lg opacity-50">
                  <div className="flex items-center space-x-2 mb-2">
                    <SiReddit className="text-reddit-orange" />
                    <span className="text-sm font-medium">u/anonymous_user</span>
                    <span className="text-xs text-gray-500">2h ago</span>
                  </div>
                  <p className="text-sm text-gray-700 line-through">
                    "Terrible experience with [Your Company]. Complete scam, don't trust them..."
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>↑ 45</span>
                    <span>💬 12</span>
                  </div>
                </div>
              </div>
              
              {/* After state */}
              <div className="bg-green-50 p-4 rounded-lg border border-success-green/20">
                <div className="text-center">
                  <Shield className="w-8 h-8 text-success-green mx-auto mb-2" />
                  <h3 className="font-semibold text-success-green">Content Successfully Removed</h3>
                  <p className="text-sm text-gray-600 mt-1">Defamatory post removed within 48 hours</p>
                </div>
              </div>
            </div>
            
            {/* Floating success badge */}
            <div className="absolute -top-4 -right-4 bg-success-green text-white p-3 rounded-full shadow-lg">
              <Check className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
