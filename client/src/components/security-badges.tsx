import { Shield, Lock, CheckCircle, Users, Star, Globe } from "lucide-react";

export default function SecurityBadges() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted by Leading Businesses
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Industry-standard security and proven results
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {/* SSL Security */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
              <Lock className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">SSL Secured</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">256-bit encryption</p>
          </div>

          {/* Professional Service */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Professional</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Licensed service</p>
          </div>

          {/* Satisfaction Guarantee */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-3">
              <CheckCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Guaranteed</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">100% satisfaction</p>
          </div>

          {/* Trusted by Businesses */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3">
              <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">500+ Clients</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">SMBs & enterprises</p>
          </div>

          {/* High Success Rate */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-3">
              <Star className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">98% Success</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Content removal</p>
          </div>

          {/* Global Service */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-3">
              <Globe className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Worldwide</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">24/7 monitoring</p>
          </div>
        </div>

        {/* Trust Statements */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <h4 className="font-bold text-2xl text-orange-600 dark:text-orange-400 mb-2">GDPR Compliant</h4>
              <p className="text-gray-600 dark:text-gray-300">Full data protection compliance</p>
            </div>
            <div>
              <h4 className="font-bold text-2xl text-orange-600 dark:text-orange-400 mb-2">Ethical Standards</h4>
              <p className="text-gray-600 dark:text-gray-300">Professional content review process</p>
            </div>
            <div>
              <h4 className="font-bold text-2xl text-orange-600 dark:text-orange-400 mb-2">Confidential Service</h4>
              <p className="text-gray-600 dark:text-gray-300">Your privacy is our priority</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}