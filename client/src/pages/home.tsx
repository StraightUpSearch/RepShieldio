import Header from "@/components/header";
import Hero from "@/components/hero";
import ProblemSection from "@/components/problem-section";
import Services from "@/components/services";
import Process from "@/components/process";
import Results from "@/components/results";
import Pricing from "@/components/pricing";
import Testimonials from "@/components/testimonials";
import FAQ from "@/components/faq";
import CTA from "@/components/cta";
import Footer from "@/components/footer";
import Chatbot from "@/components/chatbot";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <ProblemSection />
      <Services />
      <Process />
      <Results />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
      <Chatbot />
    </div>
  );
}
