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
      "name": "Is this service legal and ethical?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely. We only remove content that violates Reddit's terms of service or applicable laws. This includes defamatory, false, or harassing content. We never remove legitimate criticism or valid negative feedback."
      }
    },
    {
      "@type": "Question",
      "name": "How do you determine if content can be removed?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our legal team reviews each case against Reddit's content policy, terms of service, and applicable laws. We only proceed with removal requests for content that clearly violates these guidelines, such as false statements, harassment, or copyright infringement."
      }
    },
    {
      "@type": "Question",
      "name": "What's your success rate for content removal?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We maintain a 98.2% success rate for eligible content removal. This high rate comes from our thorough vetting process - we only take on cases where clear violations exist. If we can't remove content, you don't pay."
      }
    },
    {
      "@type": "Question",
      "name": "How long does the removal process take?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most removals are completed within 24-72 hours. Timeline depends on the severity of violations, subreddit moderation responsiveness, and whether escalation to Reddit administrators is required. We provide regular updates throughout the process."
      }
    },
    {
      "@type": "Question",
      "name": "Do you work with all types of businesses?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We work with legitimate businesses facing false or defamatory content. This includes SMBs, SaaS companies, e-commerce stores, and service providers. We do not work with businesses involved in illegal activities or those trying to suppress legitimate criticism."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if the content gets reposted?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our monitoring service tracks for reposts and similar content. Professional and Enterprise plans include ongoing protection, automatically detecting and addressing new violations. We also work to identify patterns and prevent future attacks."
      }
    }
  ]
});

const generateServiceSchema = () => ({
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "RepShield",
  "description": "Professional Reddit content removal service. We ethically remove false, defamatory, and harmful Reddit posts and comments that damage your business reputation.",
  "url": "https://repshield.io",
  "serviceType": "Online Reputation Management",
  "priceRange": "$$",
  "areaServed": "Worldwide",
  "provider": {
    "@type": "Organization",
    "name": "RepShield",
    "url": "https://repshield.io"
  },
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
  ],
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