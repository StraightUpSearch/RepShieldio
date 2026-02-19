import { Search, BarChart3, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function ServiceFlow() {
  const sectionRef = useScrollReveal();
  const steps = [
    {
      icon: Search,
      number: "01",
      title: "Scan",
      subtitle: "Paste the URL and start your case",
      description: "Submit your Reddit URL and we'll analyze the content for removal eligibility within hours.",
      action: "Start Case Review",
      href: "/contact"
    },
    {
      icon: BarChart3,
      number: "02",
      title: "Track",
      subtitle: "Live status dashboard",
      description: "Monitor your case progress in real-time with detailed updates and timeline estimates.",
      action: "View Dashboard",
      href: "/dashboard",
      optional: true
    },
    {
      icon: CheckCircle,
      number: "03",
      title: "Resolve",
      subtitle: "95%+ success rate within 24-48 hours",
      description: "Our legal team removes the content through official Reddit channels and provides confirmation.",
      action: "See Results",
      href: "/ticket-status"
    }
  ];

  return (
    <section ref={sectionRef} className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Simple, transparent process from submission to resolution
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid lg:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center relative">
              {/* Step Number */}
              <div className="text-6xl font-bold text-gray-100 mb-8">
                {step.number}
              </div>
              
              {/* Icon */}
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6 -mt-6 relative z-10">
                <step.icon className="w-8 h-8 text-orange-500" strokeWidth={1.5} />
              </div>
              
              {/* Content */}
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                {step.subtitle}
                {step.optional && <span className="text-gray-400 normal-case"> (optional)</span>}
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {step.description}
              </p>
              
              {/* CTA Button */}
              <Button
                variant="outline"
                size="sm"
                className="border border-gray-200 text-gray-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all"
                asChild
              >
                <Link href={step.href}>{step.action}</Link>
              </Button>
              
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 right-0 w-12 h-0.5 bg-gray-200 transform translate-x-6"></div>
              )}
            </div>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center mt-16 p-8 bg-gray-50 rounded-2xl">
          <p className="text-lg text-gray-700 mb-4">
            Ready to start your case? No contracts, no upfront fees.
          </p>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3" asChild>
            <Link href="/contact">Get Free Quote Now</Link>
          </Button>
        </div>
      </div>
    </section>
  );
} 