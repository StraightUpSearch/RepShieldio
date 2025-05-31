import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Shield, Clock, DollarSign } from "lucide-react";

export default function Pricing() {
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const plans = [
    {
      name: "Essential",
      price: "$297",
      period: "per incident",
      description: "Perfect for small businesses",
      features: [
        "Up to 5 posts/comments removed",
        "48-72 hour response time",
        "Basic violation documentation",
        "Email progress updates",
        "30-day monitoring included"
      ],
      buttonText: "Get Started",
      buttonStyle: "bg-gray-100 text-gray-700 hover:bg-gray-200",
      isPopular: false
    },
    {
      name: "Professional",
      price: "$897",
      period: "per month",
      description: "For growing businesses",
      features: [
        "Unlimited post/comment removal",
        "24-hour response guarantee",
        "Advanced legal documentation",
        "24/7 monitoring & alerts",
        "Weekly reputation reports",
        "Dedicated account manager"
      ],
      buttonText: "Start Free Trial",
      buttonStyle: "bg-reddit-orange text-white hover:bg-red-600",
      isPopular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For established brands",
      features: [
        "Everything in Professional",
        "Multi-brand management",
        "Custom SLA agreements",
        "Priority escalation channels",
        "API access & integrations",
        "Legal team consultation"
      ],
      buttonText: "Contact Sales",
      buttonStyle: "bg-navy-deep text-white hover:bg-navy-light",
      isPopular: false
    }
  ];

  return (
    <section id="pricing" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Transparent Pricing for Every Business
          </h2>
          <p className="text-xl text-gray-600">
            Choose the protection level that fits your needs. No hidden fees, no long-term contracts.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`bg-white border-2 rounded-2xl p-8 hover:border-navy-light transition-colors relative ${
                plan.isPopular ? 'border-reddit-orange scale-105' : 'border-gray-200'
              }`}
            >
              {plan.isPopular && (
                <Badge className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-reddit-orange text-white border-none">
                  Most Popular
                </Badge>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className={`text-4xl font-bold mb-2 ${plan.isPopular ? 'text-reddit-orange' : 'text-navy-deep'}`}>
                  {plan.price}
                </div>
                <div className="text-gray-500">{plan.period}</div>
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="w-5 h-5 text-success-green mt-1 mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                onClick={scrollToContact}
                className={`w-full py-3 font-semibold transition-colors ${plan.buttonStyle}`}
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">All plans include our money-back guarantee if we can't remove the content</p>
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <span className="flex items-center">
              <Shield className="w-4 h-4 mr-1" />
              100% Legal & Ethical
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              No Long-term Contracts
            </span>
            <span className="flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              Transparent Pricing
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
