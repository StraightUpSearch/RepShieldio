import { Trash2, Search, Gavel, BarChart3, Check } from "lucide-react";

export default function Services() {
  const services = [
    {
      icon: <Trash2 className="w-6 h-6" />,
      title: "Content Removal",
      color: "bg-reddit-orange/10 text-reddit-orange",
      features: [
        "Defamatory posts and comments targeting your brand",
        "False review threads damaging your reputation",
        "Malicious subreddit discussions about your company",
        "Competitor-generated negative content"
      ]
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Monitoring & Detection",
      color: "bg-navy-deep/10 text-navy-deep",
      features: [
        "24/7 automated monitoring across all subreddits",
        "Real-time alerts for new mentions",
        "Sentiment analysis and threat assessment",
        "Historical analysis of existing content"
      ]
    },
    {
      icon: <Gavel className="w-6 h-6" />,
      title: "Legal Compliance",
      color: "bg-purple-100 text-purple-600",
      features: [
        "DMCA takedown notices for copyright violations",
        "Terms of service violation reporting",
        "Legal documentation and evidence collection",
        "Ethical guidelines compliance verification"
      ]
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Reporting & Analytics",
      color: "bg-blue-100 text-blue-600",
      features: [
        "Weekly reputation health reports",
        "Removal success tracking and metrics",
        "Brand mention sentiment analysis",
        "Competitive reputation benchmarking"
      ]
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
        
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className={`w-12 h-12 ${service.color} rounded-lg flex items-center justify-center mr-4`}>
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{service.title}</h3>
              </div>
              <ul className="space-y-4">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="w-5 h-5 text-success-green mt-1 mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
