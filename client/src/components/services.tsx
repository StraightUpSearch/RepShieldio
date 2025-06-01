import { Trash2, Search, DollarSign, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Services() {
  const services = [
    {
      icon: <Trash2 className="w-6 h-6" />,
      title: "Reddit Removal Services",
      subtitle: "Professional Content Removal",
      color: "bg-reddit-orange/10 text-reddit-orange",
      pricing: "Custom Quote",
      features: [
        "Comments - Remove harmful comments targeting your brand",
        "Posts - Full post removal from subreddits", 
        "Other Content - Profile attacks, image posts, video content",
        "Legal compliance and documentation included",
        "Human specialist assigned to each case"
      ],
      cta: "Get Quote"
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Brand Live Scanner",
      subtitle: "Freemium Monitoring Service",
      color: "bg-navy-deep/10 text-navy-deep", 
      pricing: "Free • Premium Available",
      features: [
        "Real-time monitoring across all subreddits",
        "Instant alerts for new brand mentions",
        "Sentiment analysis and threat assessment",
        "Premium: Advanced filtering and priority alerts",
        "Premium: Historical data and trend analysis"
      ],
      cta: "Start Free Scan"
    }
  ];

  return (
    <section id="services" className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Comprehensive Reddit Reputation Protection
          </h2>
          <p className="text-xl text-gray-600">
            We specialize exclusively in Reddit, understanding its unique culture, moderation systems, and removal processes
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 ${service.color} rounded-lg flex items-center justify-center mr-4`}>
                  {service.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{service.title}</h3>
                  <p className="text-gray-600 text-sm">{service.subtitle}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <span className="text-lg font-semibold text-gray-900">{service.pricing}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="w-5 h-5 text-success-green mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  if (index === 0) {
                    // Redirect to quote request
                    window.location.href = '/#pricing';
                  } else {
                    // Redirect to brand scanner
                    window.location.href = '/scan';
                  }
                }}
              >
                {service.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
