import { useEffect } from 'react';

interface StructuredDataProps {
  type: 'Service' | 'Organization' | 'Product';
  data: any;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    
    let structuredData;
    
    switch (type) {
      case 'Service':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "RepShield - Reddit Reputation Management",
          "description": "Professional AI-powered Reddit reputation management platform providing confidential and ethical content monitoring solutions for businesses",
          "provider": {
            "@type": "Organization",
            "name": "RepShield",
            "url": "https://repshield.replit.app"
          },
          "serviceType": "Reputation Management",
          "areaServed": "Worldwide",
          "availableChannel": {
            "@type": "ServiceChannel",
            "serviceUrl": "https://repshield.replit.app",
            "serviceType": "Online"
          },
          "offers": [
            {
              "@type": "Offer",
              "name": "Basic Monitoring",
              "price": "49",
              "priceCurrency": "USD",
              "description": "Weekly Reddit monitoring with email alerts"
            },
            {
              "@type": "Offer", 
              "name": "Professional Monitoring",
              "price": "99",
              "priceCurrency": "USD",
              "description": "Daily monitoring across multiple platforms with instant alerts"
            },
            {
              "@type": "Offer",
              "name": "Enterprise Monitoring", 
              "price": "199",
              "priceCurrency": "USD",
              "description": "Real-time monitoring with dedicated account manager"
            }
          ]
        };
        break;
        
      case 'Organization':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "RepShield",
          "url": "https://repshield.replit.app",
          "logo": "https://repshield.replit.app/logo.png",
          "description": "AI-powered Reddit reputation management platform for businesses",
          "sameAs": [
            "https://twitter.com/repshield",
            "https://linkedin.com/company/repshield"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Service",
            "email": "support@repshield.com",
            "availableLanguage": "English"
          }
        };
        break;
        
      case 'Product':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "RepShield Brand Scanner",
          "description": "Comprehensive brand reputation scanner that monitors Reddit, review platforms, social media, and news sources",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "description": "Free brand reputation scan"
          },
          "featureList": [
            "Reddit mention monitoring",
            "Review platform scanning", 
            "Social media monitoring",
            "News article tracking",
            "Sentiment analysis",
            "Risk assessment"
          ]
        };
        break;
    }
    
    script.innerHTML = JSON.stringify(structuredData);
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, [type, data]);
  
  return null;
}

export function SEOMetaTags({ 
  title, 
  description, 
  keywords,
  ogImage = "/og-image.png",
  canonicalUrl 
}: {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
}) {
  useEffect(() => {
    // Set title
    document.title = title;
    
    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]') || document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    metaDescription.setAttribute('content', description);
    if (!document.querySelector('meta[name="description"]')) {
      document.head.appendChild(metaDescription);
    }
    
    // Set keywords
    if (keywords) {
      const metaKeywords = document.querySelector('meta[name="keywords"]') || document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      metaKeywords.setAttribute('content', keywords);
      if (!document.querySelector('meta[name="keywords"]')) {
        document.head.appendChild(metaKeywords);
      }
    }
    
    // Open Graph tags
    const ogTags = [
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: ogImage },
      { property: 'og:type', content: 'website' },
      { property: 'twitter:card', content: 'summary_large_image' },
      { property: 'twitter:title', content: title },
      { property: 'twitter:description', content: description },
      { property: 'twitter:image', content: ogImage }
    ];
    
    ogTags.forEach(tag => {
      const existingTag = document.querySelector(`meta[property="${tag.property}"]`) || document.createElement('meta');
      existingTag.setAttribute('property', tag.property);
      existingTag.setAttribute('content', tag.content);
      if (!document.querySelector(`meta[property="${tag.property}"]`)) {
        document.head.appendChild(existingTag);
      }
    });
    
    // Canonical URL
    if (canonicalUrl) {
      const canonicalLink = document.querySelector('link[rel="canonical"]') || document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', canonicalUrl);
      if (!document.querySelector('link[rel="canonical"]')) {
        document.head.appendChild(canonicalLink);
      }
    }
  }, [title, description, keywords, ogImage, canonicalUrl]);
  
  return null;
}