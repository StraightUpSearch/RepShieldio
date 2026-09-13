import { useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import HeroServiceFirst from "@/components/hero-service-first";
import ServiceFlow from "@/components/service-flow";
import TestimonialsServiceProof from "@/components/testimonials-service-proof";
import FinalServiceCTA from "@/components/final-service-cta";

const homepageStructuredData = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "RepShield",
  "description": "Professional Reddit content removal service. We ethically remove false, defamatory, and harmful Reddit posts and comments that damage your business reputation.",
  "url": "https://repshield.io",
  "priceRange": "$$",
  "areaServed": "Worldwide",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "bestRating": "5",
    "worstRating": "1",
    "ratingCount": "153"
  },
  "offers": [
    {
      "@type": "Offer",
      "name": "Reddit Post Removal",
      "description": "Professional removal of defamatory or false Reddit posts that damage your business reputation",
      "price": "899",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": "https://repshield.io"
    },
    {
      "@type": "Offer",
      "name": "Reddit Comment Removal",
      "description": "Professional removal of harmful or false Reddit comments targeting your brand",
      "price": "199",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": "https://repshield.io"
    }
  ]
};

export default function HomeServiceFirst() {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', 'homepage-service');
    script.textContent = JSON.stringify(homepageStructuredData);

    // Remove existing if present (e.g. from hot reload)
    const existing = document.querySelector('script[data-schema="homepage-service"]');
    if (existing) existing.remove();

    document.head.appendChild(script);

    return () => {
      const el = document.querySelector('script[data-schema="homepage-service"]');
      if (el) el.remove();
    };
  }, []);

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