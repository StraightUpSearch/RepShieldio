import Header from '@/components/header';
import Footer from '@/components/footer';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                <strong>Effective Date:</strong> January 1, 2025
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-6">
                By accessing or using RepShield's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our services.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Description of Services</h2>
              <p className="text-gray-700 mb-4">
                RepShield provides professional Reddit reputation management services, including:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>Monitoring of Reddit content related to your brand</li>
                <li>Ethical removal of false, defamatory, or harmful content</li>
                <li>Reputation analysis and reporting</li>
                <li>Strategic consultation on reputation management</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. User Responsibilities</h2>
              <p className="text-gray-700 mb-4">
                You agree to:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>Provide accurate and complete information</li>
                <li>Use our services only for lawful purposes</li>
                <li>Not interfere with or disrupt our services</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Respect intellectual property rights</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Service Limitations</h2>
              <p className="text-gray-700 mb-6">
                While we strive to provide effective reputation management services, we cannot guarantee specific outcomes. Results may vary based on factors including content complexity, platform policies, and legal considerations.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Payment Terms</h2>
              <p className="text-gray-700 mb-4">
                Payment terms include:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>Fees are due as specified in your service agreement</li>
                <li>Payments are processed through secure third-party processors</li>
                <li>Refunds are subject to our refund policy</li>
                <li>Late payments may result in service suspension</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Intellectual Property</h2>
              <p className="text-gray-700 mb-6">
                All content, trademarks, and intellectual property related to RepShield remain our exclusive property. You may not use our intellectual property without written permission.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Confidentiality</h2>
              <p className="text-gray-700 mb-6">
                We maintain strict confidentiality regarding your business information and reputation management activities. We will not disclose your information except as required by law or with your explicit consent.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-700 mb-6">
                RepShield's liability is limited to the amount paid for services. We are not liable for indirect, incidental, or consequential damages arising from the use of our services.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Termination</h2>
              <p className="text-gray-700 mb-6">
                Either party may terminate services with written notice. Upon termination, you remain responsible for all fees incurred and must comply with any ongoing confidentiality obligations.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Governing Law</h2>
              <p className="text-gray-700 mb-6">
                These terms are governed by applicable law. Any disputes will be resolved through binding arbitration in accordance with established arbitration rules.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-700 mb-6">
                We may update these terms periodically. Continued use of our services after changes constitutes acceptance of the updated terms.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Contact Information</h2>
              <p className="text-gray-700 mb-6">
                For questions about these Terms of Service, contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>RepShield</strong><br />
                  Email: legal@repshield.io<br />
                  Subject: Terms of Service Inquiry
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 