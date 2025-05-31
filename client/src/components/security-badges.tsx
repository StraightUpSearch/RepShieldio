import { Shield, Lock, CheckCircle, Award } from "lucide-react";

export default function SecurityBadges() {
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Your Privacy & Security is Our Priority
          </h3>
          <p className="text-gray-600">
            All client information and payment processing secured with industry-leading encryption
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center">
          {/* SSL Security */}
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <Lock className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="font-semibold text-sm text-gray-900 mb-1">SSL Secured</h4>
            <p className="text-xs text-gray-600">256-bit encryption</p>
          </div>

          {/* Data Protection */}
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="font-semibold text-sm text-gray-900 mb-1">Data Protected</h4>
            <p className="text-xs text-gray-600">GDPR compliant</p>
          </div>

          {/* Secure Payments */}
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
            <h4 className="font-semibold text-sm text-gray-900 mb-1">Secure Payments</h4>
            <p className="text-xs text-gray-600">Stripe verified</p>
          </div>

          {/* Confidential Service */}
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Award className="h-8 w-8 text-gray-600" />
            </div>
            <h4 className="font-semibold text-sm text-gray-900 mb-1">Confidential</h4>
            <p className="text-xs text-gray-600">Client anonymity</p>
          </div>
        </div>

        {/* Security Features */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-6 text-sm text-gray-600">
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              PCI DSS Compliant
            </span>
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Zero Data Retention
            </span>
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Encrypted Communications
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}