import { SiReddit, SiLinkedin, SiTwitter } from "react-icons/si";
import { Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 gradient-navy rounded-lg flex items-center justify-center">
                <SiReddit className="text-white text-xl" />
              </div>
              <span className="text-2xl font-bold">RedditShield</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Professional Reddit reputation management for businesses. We ethically remove false, 
              defamatory content that damages your brand reputation.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <SiLinkedin className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <SiTwitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Content Removal</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Reputation Monitoring</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Legal Compliance</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Crisis Management</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Legal & Ethics</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 RedditShield. All rights reserved. Professional reputation management services.
          </p>
          <div className="flex space-x-6 text-sm text-gray-400 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Legal Compliance</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
