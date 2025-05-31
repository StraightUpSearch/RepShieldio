import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { SiReddit } from "react-icons/si";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 gradient-navy rounded-lg flex items-center justify-center">
              <SiReddit className="text-white text-xl" />
            </div>
            <span className="text-2xl font-bold text-navy-deep">RedditShield</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('services')}
              className="text-gray-700 hover:text-navy-deep transition-colors"
            >
              Services
            </button>
            <button 
              onClick={() => scrollToSection('process')}
              className="text-gray-700 hover:text-navy-deep transition-colors"
            >
              Process
            </button>
            <button 
              onClick={() => scrollToSection('results')}
              className="text-gray-700 hover:text-navy-deep transition-colors"
            >
              Results
            </button>
            <button 
              onClick={() => scrollToSection('pricing')}
              className="text-gray-700 hover:text-navy-deep transition-colors"
            >
              Pricing
            </button>
            <Button 
              onClick={() => scrollToSection('contact')}
              className="bg-reddit-orange text-white hover:bg-red-600 transition-colors font-medium"
            >
              Free Audit
            </Button>
          </nav>
          
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-100 shadow-lg">
            <nav className="flex flex-col space-y-4 p-4">
              <button 
                onClick={() => scrollToSection('services')}
                className="text-gray-700 hover:text-navy-deep transition-colors text-left"
              >
                Services
              </button>
              <button 
                onClick={() => scrollToSection('process')}
                className="text-gray-700 hover:text-navy-deep transition-colors text-left"
              >
                Process
              </button>
              <button 
                onClick={() => scrollToSection('results')}
                className="text-gray-700 hover:text-navy-deep transition-colors text-left"
              >
                Results
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-gray-700 hover:text-navy-deep transition-colors text-left"
              >
                Pricing
              </button>
              <Button 
                onClick={() => scrollToSection('contact')}
                className="bg-reddit-orange text-white hover:bg-red-600 transition-colors font-medium w-full"
              >
                Free Audit
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
