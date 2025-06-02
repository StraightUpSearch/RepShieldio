import { useEffect } from 'react';
import { useLocation } from 'wouter';

// JSON-LD structured data for different page types
const generateArticleSchema = (title: string, description: string, url: string) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": title,
  "description": description,
  "url": url,
  "author": {
    "@type": "Organization",
    "name": "RepShield Professional Services"
  },
  "publisher": {
    "@type": "Organization",
    "name": "RepShield",
    "logo": {
      "@type": "ImageObject",
      "url": "https://repshield.io/favicon.svg"
    }
  },
  "datePublished": new Date().toISOString(),
  "dateModified": new Date().toISOString()
});

const generateFAQSchema = () => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Reddit reputation management?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Reddit reputation management involves monitoring, analyzing, and addressing content on Reddit that affects your business reputation. This includes identifying harmful posts, managing brand mentions, and ethically removing false or defamatory content."
      }
    },
    {
      "@type": "Question", 
      "name": "How quickly can defamatory content be removed from Reddit?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Removal timeframes vary depending on the content type and subreddit policies. Our team typically achieves results within 5-14 business days for qualifying content that violates Reddit's terms of service."
      }
    },
    {
      "@type": "Question",
      "name": "Is Reddit content removal ethical and legal?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, our services focus exclusively on content that violates Reddit's terms of service or contains false, defamatory information. We use ethical approaches and work within platform guidelines to protect legitimate business interests."
      }
    }
  ]
});

const generateServiceSchema = () => ({
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Reddit Reputation Management",
  "serviceType": "Online Reputation Management",
  "provider": {
    "@type": "Organization",
    "name": "RepShield"
  },
  "areaServed": "Global",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Reputation Management Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Reddit Content Monitoring",
          "description": "Continuous monitoring of Reddit for brand mentions and reputation threats"
        }
      },
      {
        "@type": "Offer", 
        "itemOffered": {
          "@type": "Service",
          "name": "Content Removal Service",
          "description": "Professional removal of false, defamatory, or harmful content from Reddit"
        }
      }
    ]
  }
});

export default function AdvancedSEO() {
  const [location] = useLocation();

  useEffect(() => {
    // Add robots meta tag
    const robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
    if (robots) {
      robots.content = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
    }

    // Add geo meta tags
    const addGeoTag = (name: string, content: string) => {
      let geo = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!geo) {
        geo = document.createElement('meta');
        geo.name = name;
        document.head.appendChild(geo);
      }
      geo.content = content;
    };

    addGeoTag('geo.region', 'US');
    addGeoTag('geo.placename', 'United States');
    addGeoTag('ICBM', '39.8283, -98.5795'); // Geographic center of US

    // Add language alternatives (hreflang)
    const addHreflang = (lang: string, href: string) => {
      let hreflang = document.querySelector(`link[hreflang="${lang}"]`) as HTMLLinkElement;
      if (!hreflang) {
        hreflang = document.createElement('link');
        hreflang.rel = 'alternate';
        hreflang.setAttribute('hreflang', lang);
        document.head.appendChild(hreflang);
      }
      hreflang.href = href;
    };

    addHreflang('en', `https://repshield.io${location}`);
    addHreflang('x-default', `https://repshield.io${location}`);

    // Add page-specific structured data
    const removeExistingSchema = (type: string) => {
      const existing = document.querySelector(`script[data-schema="${type}"]`);
      if (existing) {
        existing.remove();
      }
    };

    const addStructuredData = (schema: any, type: string) => {
      removeExistingSchema(type);
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-schema', type);
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    };

    // Add page-specific schemas
    const currentUrl = `https://repshield.io${location}`;
    
    switch (location) {
      case '/':
        addStructuredData(generateFAQSchema(), 'faq');
        addStructuredData(generateServiceSchema(), 'service');
        break;
      case '/about':
        addStructuredData(generateArticleSchema(
          'About RepShield - Professional Reddit Reputation Experts',
          'Learn about RepShield\'s mission to protect business reputations on Reddit with ethical, professional content removal services.',
          currentUrl
        ), 'article');
        break;
      case '/scan':
        addStructuredData(generateArticleSchema(
          'Brand Reputation Scanner - Check Your Reddit Presence',
          'Instantly scan your brand\'s Reddit presence to identify potential reputation risks and harmful content.',
          currentUrl
        ), 'article');
        break;
    }

    // Performance and security headers simulation
    const addMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Security and performance meta tags
    addMetaTag('referrer', 'strict-origin-when-cross-origin');
    addMetaTag('format-detection', 'telephone=no');
    addMetaTag('mobile-web-app-capable', 'yes');
    addMetaTag('apple-mobile-web-app-capable', 'yes');
    addMetaTag('apple-mobile-web-app-status-bar-style', 'black-translucent');
    addMetaTag('apple-mobile-web-app-title', 'RepShield');
    addMetaTag('application-name', 'RepShield');
    addMetaTag('msapplication-tooltip', 'Professional Reddit Reputation Management');

  }, [location]);

  return null;
}