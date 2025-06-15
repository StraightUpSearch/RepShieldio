import { SiReddit, SiLinkedin, SiX } from "react-icons/si";
import { Mail } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 gradient-navy rounded-lg flex items-center justify-center">
                <SiReddit className="text-white text-xl" />
              </div>
              <span className="text-2xl font-bold">RepShield</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Professional Reddit reputation management for businesses. We ethically remove false, 
              defamatory content that damages your brand reputation.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.linkedin.com/company/repshield-io/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <SiLinkedin className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <SiX className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li><button onClick={() => scrollToSection('services')} className="hover:text-white transition-colors text-left">Our Services</button></li>
              <li><button onClick={() => scrollToSection('process')} className="hover:text-white transition-colors text-left">Our Process</button></li>
              <li><button onClick={() => scrollToSection('results')} className="hover:text-white transition-colors text-left">Results</button></li>
              <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors text-left">Pricing</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/my-account" className="hover:text-white transition-colors">My Account</Link></li>
              <li><Link href="/scan" className="hover:text-white transition-colors">Live Scanner</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 RepShield. All rights reserved. Professional reputation management services.
          </p>
          <div className="flex space-x-6 text-sm text-gray-400 mt-4 md:mt-0">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/legal-compliance" className="hover:text-white transition-colors">Legal Compliance</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
