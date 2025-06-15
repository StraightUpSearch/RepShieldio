import { Search, BarChart3, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CoreFeatures() {
  const features = [
    {
      icon: Search,
      title: "Scan Your Brand",
      description: "Advanced AI scans Reddit for mentions of your brand, products, or personal name.",
      action: "Start Free Scan"
    },
    {
      icon: BarChart3,
      title: "Track Cases", 
      description: "Monitor removal progress in real-time with detailed case tracking and updates.",
      action: "View Dashboard"
    },
    {
      icon: Calendar,
      title: "Book a Demo",
      description: "Schedule a free consultation to discuss your specific reputation protection needs.",
      action: "Book Now"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            How RepShield Works
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Three simple steps to protect and restore your online reputation
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              {/* Icon */}
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-100 transition-colors">
                <feature.icon className="w-8 h-8 text-orange-500" strokeWidth={1.5} />
              </div>
              
              {/* Content */}
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                {feature.description}
              </p>
              
              {/* CTA Button */}
              <Button 
                variant="outline" 
                className="border-2 border-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all"
              >
                {feature.action}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 