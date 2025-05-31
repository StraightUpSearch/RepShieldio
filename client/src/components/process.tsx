import { Clock, Shield, CheckCircle, Eye, Zap } from "lucide-react";

export default function Process() {
  const steps = [
    {
      number: 1,
      title: "Comprehensive Audit",
      description: "We scan all of Reddit to identify existing mentions, assess their impact, and document evidence of policy violations.",
      features: [
        "Cross-platform mention detection",
        "Violation assessment and documentation",
        "Priority ranking based on impact"
      ],
      color: "bg-navy-deep",
      bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50"
    },
    {
      number: 2,
      title: "Legal Verification",
      description: "Our legal team verifies that content violates Reddit's terms of service and qualifies for removal under applicable laws.",
      features: [
        "Terms of service violation confirmation",
        "Legal grounds assessment",
        "Ethical compliance verification"
      ],
      color: "bg-reddit-orange",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50"
    },
    {
      number: 3,
      title: "Strategic Removal",
      description: "We execute removal requests through proper channels, working with moderators and Reddit administrators.",
      features: [
        "Formal violation reports",
        "Moderator communication",
        "Administrative escalation when needed"
      ],
      color: "bg-success-green",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50"
    },
    {
      number: 4,
      title: "Monitoring & Follow-up",
      description: "We track removal progress, escalate when necessary, and ensure content stays removed.",
      features: [
        "Real-time removal tracking",
        "Escalation management",
        "Prevention of re-posting"
      ],
      color: "bg-purple-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50"
    },
    {
      number: 5,
      title: "Ongoing Protection",
      description: "Continuous monitoring ensures new threats are detected and addressed immediately.",
      features: [
        "24/7 automated monitoring",
        "Instant threat alerts",
        "Proactive protection strategies"
      ],
      color: "bg-warning-amber",
      bgColor: "bg-gradient-to-br from-yellow-50 to-orange-50"
    }
  ];

  return (
    <section id="process" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Our Proven 5-Step Process
          </h2>
          <p className="text-xl text-gray-600">
            Transparent, ethical, and effective Reddit reputation management
          </p>
        </div>
        
        <div className="relative">
          {/* Process Timeline */}
          <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-200"></div>
          
          <div className="space-y-16">
            {steps.map((step, index) => (
              <div key={index} className="relative flex items-center lg:justify-center">
                <div className={`lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-12' : 'lg:pl-12 lg:ml-auto'}`}>
                  <div className={`${step.bgColor} p-8 rounded-2xl`}>
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 ${step.color} text-white rounded-full flex items-center justify-center font-bold text-xl mr-4`}>
                        {step.number}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      {step.description}
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {step.features.map((feature, featureIndex) => (
                        <li key={featureIndex}>• {feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className={`hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-6 h-6 ${step.color} rounded-full border-4 border-white`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
