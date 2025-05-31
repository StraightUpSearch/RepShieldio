import { Button } from "@/components/ui/button";
import { TrendingDown, Search, Users } from "lucide-react";

export default function ProblemSection() {
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            One False Reddit Post Can Destroy Years of Hard Work
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Reddit's massive reach and high search rankings mean negative content spreads fast and ranks high in Google results.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 rounded-xl bg-red-50 border border-red-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingDown className="text-red-600 w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Revenue Loss</h3>
            <p className="text-gray-600">Studies show a single negative review can cost businesses up to 30% of potential customers</p>
          </div>
          
          <div className="text-center p-6 rounded-xl bg-orange-50 border border-orange-100">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-orange-600 w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">SEO Damage</h3>
            <p className="text-gray-600">Reddit posts rank high in Google searches, making false claims highly visible to prospects</p>
          </div>
          
          <div className="text-center p-6 rounded-xl bg-purple-50 border border-purple-100">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-purple-600 w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Trust Erosion</h3>
            <p className="text-gray-600">False allegations spread across communities, damaging relationships with customers and partners</p>
          </div>
        </div>
        
        <div className="gradient-reddit rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">
            Don't Let False Claims Define Your Brand
          </h3>
          <p className="text-lg mb-6 opacity-90">
            Every day you wait, more potential customers see defamatory content about your business
          </p>
          <Button 
            onClick={scrollToContact}
            className="bg-white text-red-500 hover:bg-gray-100 transition-colors font-semibold"
          >
            Protect My Reputation Now
          </Button>
        </div>
      </div>
    </section>
  );
}
