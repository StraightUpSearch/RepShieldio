import { Star, User } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Chen",
      title: "CEO, TechFlow SaaS",
      content: "RedditShield saved our company. A competitor's false claims were destroying our reputation. They removed all 12 defamatory posts within 48 hours.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      title: "Founder, EcoLiving Store", 
      content: "Professional, ethical, and incredibly effective. They understand Reddit's culture and work within the rules to get results. Our sales recovered completely.",
      rating: 5
    },
    {
      name: "Jennifer Walsh",
      title: "CMO, CloudSync Solutions",
      content: "The monitoring service is incredible. They caught and removed a fake review thread before it could damage our brand. Proactive protection at its best.",
      rating: 5
    }
  ];

  return (
    <section className="py-16 gradient-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Trusted by Leading Businesses
          </h2>
          <p className="text-xl text-blue-100">
            See what our clients say about protecting their reputation
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                  <User className="text-white w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-blue-200 text-sm">{testimonial.title}</p>
                </div>
              </div>
              <p className="text-blue-100 mb-4">
                "{testimonial.content}"
              </p>
              <div className="flex text-yellow-400">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
