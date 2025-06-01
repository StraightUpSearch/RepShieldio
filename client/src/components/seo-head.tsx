import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  structuredData?: any;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
}

export default function SEOHead({
  title = "RepShield - Professional Reddit Reputation Management & Content Removal",
  description = "Expert Reddit content removal service with 95%+ success rate. Remove negative posts, comments, and protect your brand reputation. Fast 24-48hr turnaround, legal methods only.",
  keywords = "reddit removal, reputation management, content removal, brand protection, online reputation, reddit post removal, reddit comment removal",
  canonical,
  ogType = "website",
  ogImage = "/og-image.png",
  structuredData,
  article
}: SEOHeadProps) {
  
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    
    // Open Graph tags
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:type', ogType, 'property');
    updateMetaTag('og:image', `https://repshield.io${ogImage}`, 'property');
    updateMetaTag('og:url', canonical || window.location.href, 'property');
    updateMetaTag('og:site_name', 'RepShield', 'property');
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', `https://repshield.io${ogImage}`);
    
    // Article-specific tags
    if (article) {
      updateMetaTag('article:published_time', article.publishedTime, 'property');
      updateMetaTag('article:modified_time', article.modifiedTime, 'property');
      updateMetaTag('article:author', article.author, 'property');
      updateMetaTag('article:section', article.section, 'property');
      article.tags?.forEach(tag => {
        updateMetaTag('article:tag', tag, 'property');
      });
    }
    
    // Canonical URL
    updateCanonical(canonical || window.location.href);
    
    // Structured Data JSON-LD
    if (structuredData || !document.querySelector('[data-schema="default"]')) {
      updateStructuredData(structuredData || getDefaultStructuredData());
    }
    
  }, [title, description, keywords, canonical, ogType, ogImage, structuredData, article]);

  return null;
}

function updateMetaTag(name: string, content: string, attribute: string = 'name') {
  let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}

function updateCanonical(url: string) {
  let element = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  
  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }
  
  element.href = url;
}

function updateStructuredData(data: any) {
  // Remove existing structured data
  const existing = document.querySelector('[data-schema]');
  if (existing) {
    existing.remove();
  }
  
  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-schema', 'default');
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

function getDefaultStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://repshield.io/#organization",
        "name": "RepShield",
        "url": "https://repshield.io",
        "logo": {
          "@type": "ImageObject",
          "url": "https://repshield.io/logo.png",
          "width": 400,
          "height": 100
        },
        "description": "Professional Reddit reputation management and content removal service with 95%+ success rate.",
        "foundingDate": "2024",
        "areaServed": "Worldwide",
        "serviceType": [
          "Reputation Management",
          "Content Removal",
          "Brand Protection"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+1-555-REPSHIELD",
          "contactType": "Customer Service",
          "availableLanguage": "English"
        },
        "sameAs": [
          "https://twitter.com/repshield",
          "https://linkedin.com/company/repshield"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://repshield.io/#website",
        "url": "https://repshield.io",
        "name": "RepShield - Reddit Reputation Management",
        "description": "Expert Reddit content removal service with 95%+ success rate. Fast, legal, and confidential brand protection.",
        "publisher": {
          "@id": "https://repshield.io/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://repshield.io/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Service",
        "@id": "https://repshield.io/#service",
        "name": "Reddit Content Removal Service",
        "description": "Professional Reddit post and comment removal with 95%+ success rate, 24-48 hour turnaround time.",
        "provider": {
          "@id": "https://repshield.io/#organization"
        },
        "areaServed": "Worldwide",
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Reddit Removal Services",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Reddit Post Removal"
              },
              "price": "899",
              "priceCurrency": "USD"
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Reddit Comment Removal"
              },
              "price": "199",
              "priceCurrency": "USD"
            }
          ]
        }
      },
      {
        "@type": "FAQPage",
        "@id": "https://repshield.io/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How fast can you remove Reddit content?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We typically remove Reddit posts within 24-48 hours and comments within 24 hours, with a 95%+ success rate using only legal and ethical methods."
            }
          },
          {
            "@type": "Question",
            "name": "What is your success rate for Reddit removals?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We maintain a 95%+ success rate for Reddit content removal, backed by our guarantee and over 1,650 successful removals completed."
            }
          },
          {
            "@type": "Question",
            "name": "How much does Reddit content removal cost?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Reddit post removal costs $899 per post, and comment removal costs $199 per comment. We offer volume discounts for multiple items."
            }
          }
        ]
      }
    ]
  };
}