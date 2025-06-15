import Header from '@/components/header';
import Footer from '@/components/footer';

export default function LegalCompliance() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Legal Compliance</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                <strong>Last Updated:</strong> January 1, 2025
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Our Commitment to Legal Standards</h2>
              <p className="text-gray-700 mb-6">
                RepShield operates with the highest standards of legal and ethical compliance. We are committed to conducting our reputation management services within the boundaries of all applicable laws and platform policies.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Ethical Content Removal Practices</h2>
              <p className="text-gray-700 mb-4">
                Our content removal services strictly adhere to ethical guidelines:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>We only target genuinely false, defamatory, or harmful content</li>
                <li>All removal requests comply with platform terms of service</li>
                <li>We respect freedom of speech and legitimate criticism</li>
                <li>We do not engage in manipulation or deceptive practices</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Data Protection Compliance</h2>
              <p className="text-gray-700 mb-4">
                We maintain compliance with major data protection regulations:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li><strong>GDPR:</strong> European General Data Protection Regulation</li>
                <li><strong>CCPA:</strong> California Consumer Privacy Act</li>
                <li><strong>PIPEDA:</strong> Personal Information Protection and Electronic Documents Act</li>
                <li><strong>SOX:</strong> Sarbanes-Oxley Act compliance for applicable clients</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Industry Standards and Certifications</h2>
              <p className="text-gray-700 mb-4">
                RepShield maintains adherence to industry best practices:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>ISO 27001 information security management standards</li>
                <li>Professional Reputation Management Association guidelines</li>
                <li>Digital marketing ethics standards</li>
                <li>Anti-spam and anti-fraud compliance</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Legal Documentation and Transparency</h2>
              <p className="text-gray-700 mb-4">
                We maintain comprehensive legal documentation:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>Detailed records of all content removal activities</li>
                <li>Client consent and authorization documentation</li>
                <li>Platform communication and response tracking</li>
                <li>Compliance audit trails and reporting</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Dispute Resolution Process</h2>
              <p className="text-gray-700 mb-6">
                In the event of disputes or compliance concerns, we follow a structured resolution process including internal review, mediation options, and escalation procedures as outlined in our Terms of Service.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Regulatory Cooperation</h2>
              <p className="text-gray-700 mb-6">
                RepShield cooperates fully with relevant regulatory authorities and legal proceedings. We respond promptly to valid legal requests and maintain transparent communication with regulatory bodies.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Platform Policy Adherence</h2>
              <p className="text-gray-700 mb-4">
                We strictly follow the terms of service and community guidelines of all platforms where we operate:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>Reddit Terms of Service and Content Policy</li>
                <li>Google Privacy Policy and Terms of Service</li>
                <li>Social media platform guidelines</li>
                <li>Review platform terms and conditions</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Continuous Compliance Monitoring</h2>
              <p className="text-gray-700 mb-6">
                We maintain ongoing compliance through regular legal reviews, staff training, policy updates, and third-party compliance audits to ensure our practices remain current with evolving regulations.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Reporting Compliance Concerns</h2>
              <p className="text-gray-700 mb-6">
                If you have concerns about our compliance practices or wish to report potential violations, please contact us immediately:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>RepShield Compliance Team</strong><br />
                  Email: compliance@repshield.io<br />
                  Subject: Compliance Inquiry<br />
                  <em>All reports are treated confidentially and investigated promptly.</em>
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