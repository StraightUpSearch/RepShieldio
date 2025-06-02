import { useEffect } from 'react';

const schemaData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://repshield.io/#organization",
      "name": "RepShield",
      "alternateName": "RepShield Professional Services",
      "url": "https://repshield.io/",
      "logo": {
        "@type": "ImageObject",
        "url": "https://repshield.io/favicon.svg"
      },
      "description": "RepShield offers professional Reddit reputation management, ethically removing false and defamatory content that damages business reputations. We serve SMBs, SaaS companies, and eCommerce brands.",
      "sameAs": [],
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "contactType": "Customer Support",
          "description": "Contact RepShield for inquiries regarding Reddit reputation management and defamatory content removal services.",
          "areaServed": "Global",
          "availableLanguage": ["en"]
        }
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://repshield.io/#website",
      "url": "https://repshield.io/",
      "name": "RepShield - Professional Reddit Reputation Management",
      "description": "Professional Reddit reputation management for SMBs, SaaS companies, and eCommerce brands. We ethically remove false, defamatory content that damages your business reputation.",
      "publisher": {
        "@id": "https://repshield.io/#organization"
      },
      "author": {
        "@type": "Organization",
        "name": "RepShield Professional Services"
      },
      "inLanguage": "en",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://repshield.io/?s={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Service",
      "@id": "https://repshield.io/#service",
      "name": "Reddit Reputation Management",
      "serviceType": "Online Reputation Management",
      "additionalType": "Content Removal Service",
      "category": "Business Services",
      "description": "Specialized service for managing and improving online reputations on Reddit. This includes the ethical identification and removal of false, misleading, or defamatory content targeting businesses.",
      "provider": {
        "@id": "https://repshield.io/#organization"
      },
      "areaServed": {
        "@type": "AdministrativeArea",
        "name": "Global"
      },
      "audience": [
        {
          "@type": "Audience",
          "audienceType": "Small and Medium-sized Businesses (SMBs)"
        },
        {
          "@type": "Audience",
          "audienceType": "SaaS Companies"
        },
        {
          "@type": "Audience",
          "audienceType": "eCommerce Brands"
        }
      ],
      "serviceOutput": {
        "@type": "Thing",
        "name": "Improved Online Reputation on Reddit",
        "description": "Mitigation of brand damage through removal of negative content and strategic reputation management on the Reddit platform."
      },
      "availableChannel": {
        "@type": "ServiceChannel",
        "serviceUrl": "https://repshield.io/",
        "description": "Services are provided online through consultation and direct engagement."
      },
      "termsOfService": "https://repshield.io/terms-of-service",
      "offers": {
        "@type": "Offer",
        "name": "Initial Consultation for Reddit Reputation Management",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "price": "0",
          "priceCurrency": "USD",
          "valueAddedTaxIncluded": "true",
          "description": "Free initial consultation to assess your Reddit reputation needs."
        }
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://repshield.io/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://repshield.io/"
        }
      ]
    }
  ]
};

export function SchemaOrg() {
  useEffect(() => {
    // Create script element for JSON-LD
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemaData);
    
    // Add to document head
    document.head.appendChild(script);
    
    // Cleanup function to remove script when component unmounts
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null; // This component doesn't render anything
}