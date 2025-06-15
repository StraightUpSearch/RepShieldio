import { Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TestimonialsRedesigned() {
  const testimonials = [
    {
      quote: "RepShield removed 47 defamatory posts targeting our SaaS platform within 72 hours. Our conversion rate recovered immediately.",
      name: "Sarah Chen",
      title: "CEO",
      company: "TechFlow",
      metric: "+40% conversions",
      logo: "TF", // Placeholder for actual logo
      industry: "SaaS"
    },
    {
      quote: "Professional, ethical, and incredibly effective. They understand Reddit's culture and work within the rules to get results.",
      name: "Marcus Rodriguez", 
      title: "Founder",
      company: "EcoLiving",
      metric: "100% success rate",
      logo: "EL",
      industry: "E-commerce"
    },
    {
      quote: "The monitoring service caught a coordinated attack before it could damage our IPO. Proactive protection saved our valuation.",
      name: "Jennifer Walsh",
      title: "CMO", 
      company: "CloudSync",
      metric: "$2M protected",
      logo: "CS",
      industry: "Enterprise"
    },
    {
      quote: "After a competitor's smear campaign, RepShield restored our reputation. Our Google reviews improved from 2.1 to 4.8 stars.",
      name: "David Park",
      title: "Owner",
      company: "Park Dental",
      metric: "+2.7 star rating",
      logo: "PD", 
      industry: "Healthcare"
    }
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Trusted by Leading Businesses
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            See the real impact RepShield has made for companies across industries
          </p>
        </div>
        
        {/* Testimonials Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              {/* Quote */}
              <p className="text-lg text-slate-700 mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>
              
              {/* Bottom Section */}
              <div className="flex items-center justify-between">
                {/* Author Info */}
                <div className="flex items-center space-x-4">
                  {/* Company Logo Placeholder */}
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-600">{testimonial.logo}</span>
                  </div>
                  
                  <div>
                    <div className="font-semibold text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-slate-500">
                      {testimonial.title}, {testimonial.company}
                    </div>
                    <div className="text-xs text-slate-400">{testimonial.industry}</div>
                  </div>
                </div>
                
                {/* Metric Badge */}
                <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {testimonial.metric}
                </div>
              </div>
              
              {/* Star Rating */}
              <div className="flex text-yellow-400 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Stats Section */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-1">500+</div>
              <div className="text-slate-600">Cases Resolved</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-1">99%</div>
              <div className="text-slate-600">Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-1">48hrs</div>
              <div className="text-slate-600">Average Resolution</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-1">$50M+</div>
              <div className="text-slate-600">Revenue Protected</div>
            </div>
          </div>
        </div>
        
        {/* CTA */}
        <div className="text-center mt-12">
          <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4">
            Learn from Our Customers
          </Button>
        </div>
      </div>
    </section>
  );
} 