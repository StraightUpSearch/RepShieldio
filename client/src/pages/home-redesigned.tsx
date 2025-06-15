import Header from "@/components/header";
import Footer from "@/components/footer";
import HeroRedesigned from "@/components/hero-redesigned";
import CoreFeatures from "@/components/core-features";
import TestimonialsRedesigned from "@/components/testimonials-redesigned";
import PrimaryCTA from "@/components/primary-cta";

export default function HomeRedesigned() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroRedesigned />
      <CoreFeatures />
      <TestimonialsRedesigned />
      <PrimaryCTA />
      <Footer />
    </div>
  );
} 