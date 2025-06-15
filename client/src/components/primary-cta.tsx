import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Phone } from "lucide-react";

export default function PrimaryCTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-slate-900 to-slate-800 text-white relative overflow-hidden">
      {/* Subtle Background Element */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-400"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Main Headline */}
        <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
          Ready to Protect Your 
          <span className="text-orange-400"> Online Reputation?</span>
        </h2>
        
        {/* Supporting Text */}
        <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
          Join 500+ businesses that trust RepShield to maintain their professional image. 
          Start with a free consultation today.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
          <Button 
            size="lg" 
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold min-w-[200px]"
          >
            <Calendar className="mr-2 w-5 h-5" />
            Book Free Demo
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="border-2 border-slate-400 text-slate-300 hover:bg-slate-700 hover:border-slate-300 px-8 py-4 text-lg min-w-[200px]"
          >
            <Phone className="mr-2 w-5 h-5" />
            Call (555) 123-4567
          </Button>
        </div>
        
        {/* Trust Indicators */}
        <div className="flex justify-center items-center space-x-8 mt-12 text-sm text-slate-400">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            99% Success Rate
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
            Legal & Ethical
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
            Confidential Process
          </div>
        </div>
      </div>
    </section>
  );
} 