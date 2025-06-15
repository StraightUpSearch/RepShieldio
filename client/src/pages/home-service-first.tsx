import Header from "@/components/header";
import Footer from "@/components/footer";
import HeroServiceFirst from "@/components/hero-service-first";
import ServiceFlow from "@/components/service-flow";
import TestimonialsServiceProof from "@/components/testimonials-service-proof";
import FinalServiceCTA from "@/components/final-service-cta";

export default function HomeServiceFirst() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroServiceFirst />
      <ServiceFlow />
      <TestimonialsServiceProof />
      <FinalServiceCTA />
      <Footer />
    </div>
  );
} 