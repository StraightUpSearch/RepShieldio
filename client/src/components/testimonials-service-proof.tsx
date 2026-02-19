import { Star, Clock, BadgeCheck } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function TestimonialsServiceProof() {
  const sectionRef = useScrollReveal();
  const testimonials = [
    {
      quote: "RepShield removed a defamatory thread with 847 upvotes that was destroying our reputation. Professional and discreet.",
      name: "Sarah C.",
      role: "Founder & CEO",
      company: "SaaS Company",
      initials: "SC",
      avatarBg: "bg-indigo-500",
      metric: "+2.7 star improvement",
      resolvedIn: "36 hours",
      bgColor: "bg-white"
    },
    {
      quote: "A competitor's coordinated attack on Reddit was neutralized within 48 hours. Our sales pipeline recovered immediately.",
      name: "Marcus R.",
      role: "VP of Marketing",
      company: "Cloud Software",
      initials: "MR",
      avatarBg: "bg-emerald-500",
      metric: "+40% lead recovery",
      resolvedIn: "48 hours",
      bgColor: "bg-gray-50"
    },
    {
      quote: "They removed 12 posts targeting our medical practice. Patients stopped mentioning the false reviews within a week.",
      name: "Jennifer W.",
      role: "Practice Owner",
      company: "Medical Practice",
      initials: "JW",
      avatarBg: "bg-sky-500",
      metric: "12 posts removed",
      resolvedIn: "24 hours",
      bgColor: "bg-white"
    },
    {
      quote: "Professional handling of a sensitive situation. The content was removed with zero drama or escalation.",
      name: "David P.",
      role: "Legal Counsel",
      company: "Law Firm",
      initials: "DP",
      avatarBg: "bg-amber-500",
      metric: "100% success rate",
      resolvedIn: "18 hours",
      bgColor: "bg-gray-50"
    }
  ];

  return (
    <section ref={sectionRef} className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Real Results from Real Cases
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See how we've helped businesses and professionals protect their reputation
          </p>
        </div>
        
        {/* Testimonials Staggered Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className={`${testimonial.bgColor} rounded-2xl p-8 shadow-sm border border-gray-100 relative ${
                index % 2 === 1 ? 'lg:mt-8' : ''
              }`}
            >
              {/* Resolved Badge */}
              <div className="absolute -top-3 right-6">
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Resolved in {testimonial.resolvedIn}
                </div>
              </div>
              
              {/* Quote */}
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>
              
              {/* Author Section */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${testimonial.avatarBg} text-white rounded-full flex items-center justify-center`}>
                    <span className="text-sm font-bold">{testimonial.initials}</span>
                  </div>

                  <div>
                    <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                      {testimonial.name}
                      <BadgeCheck className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</div>
                    <div className="text-xs text-green-600 font-medium">Verified Customer</div>
                  </div>
                </div>
                
                {/* Metric Badge */}
                <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold">
                  {testimonial.metric}
                </div>
              </div>
              
              {/* Star Rating */}
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Stats Bar */}
        <div className="mt-16 bg-white rounded-2xl p-8 border border-gray-100">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">1,650+</div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Cases Resolved</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">95%</div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">36hrs</div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Avg Resolution</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">24/7</div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Case Monitoring</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 