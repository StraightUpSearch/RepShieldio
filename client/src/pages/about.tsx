import { SiReddit } from "react-icons/si";
import { Shield, Users, Clock, Award } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function About() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-navy-deep to-blue-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center items-center mb-6">
                <div className="w-16 h-16 gradient-navy rounded-lg flex items-center justify-center">
                  <SiReddit className="text-white text-3xl" />
                </div>
              </div>
              <h1 className="text-5xl font-bold mb-6">About RepShield</h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Your trusted partner in professional Reddit reputation management, 
                providing ethical and confidential content monitoring solutions.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-navy-deep mb-6">Our Mission</h2>
                <p className="text-gray-600 text-lg mb-6">
                  We help businesses protect their online reputation by ethically removing false, 
                  defamatory, or harmful content from Reddit that damages brand perception and 
                  customer trust.
                </p>
                <p className="text-gray-600 text-lg">
                  Our team of specialists understands Reddit's community guidelines and works 
                  within platform rules to ensure legitimate content removal while maintaining 
                  transparency and ethical standards.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-navy-deep">Protected</h3>
                    <p className="text-2xl font-bold text-blue-600">500+</p>
                    <p className="text-sm text-gray-500">Brands</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-navy-deep">Removed</h3>
                    <p className="text-2xl font-bold text-green-600">10K+</p>
                    <p className="text-sm text-gray-500">Posts & Comments</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-navy-deep">Average</h3>
                    <p className="text-2xl font-bold text-orange-600">48h</p>
                    <p className="text-sm text-gray-500">Response Time</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Award className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-navy-deep">Success</h3>
                    <p className="text-2xl font-bold text-purple-600">95%</p>
                    <p className="text-sm text-gray-500">Removal Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-deep mb-4">Our Core Values</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We operate with the highest standards of ethics and transparency in everything we do.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-navy-deep mb-3">Ethical Practices</h3>
                <p className="text-gray-600">
                  We only remove content that violates platform guidelines or is genuinely harmful, 
                  never legitimate criticism or feedback.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-navy-deep mb-3">Confidentiality</h3>
                <p className="text-gray-600">
                  Your business information and reputation management activities remain strictly 
                  confidential and secure.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-navy-deep mb-3">Transparency</h3>
                <p className="text-gray-600">
                  We provide detailed reports on all activities and maintain open communication 
                  throughout the process.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-deep mb-4">Expert Team</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our specialists combine deep platform knowledge with legal expertise to deliver 
                effective reputation management solutions.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl font-bold">RM</span>
                </div>
                <h3 className="text-xl font-semibold text-navy-deep mb-2">Reddit Moderators</h3>
                <p className="text-gray-600">
                  Former Reddit moderators who understand community guidelines and platform dynamics.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl font-bold">LE</span>
                </div>
                <h3 className="text-xl font-semibold text-navy-deep mb-2">Legal Experts</h3>
                <p className="text-gray-600">
                  Legal professionals specializing in online defamation and content removal law.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl font-bold">DA</span>
                </div>
                <h3 className="text-xl font-semibold text-navy-deep mb-2">Data Analysts</h3>
                <p className="text-gray-600">
                  AI and data specialists who monitor and analyze reputation threats in real-time.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}