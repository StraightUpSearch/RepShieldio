import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogType?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

const defaultSEO = {
  title: "RepShield - Professional Reddit Reputation Management",
  description: "Professional Reddit reputation management for SMBs, SaaS companies, and eCommerce brands. We ethically remove false, defamatory content that damages your business reputation.",
  keywords: "reddit reputation management, online reputation, content removal, business reputation, defamatory content removal, SMB reputation, SaaS reputation, ecommerce reputation",
  ogType: "website",
  ogImage: "https://repshield.io/og-image.svg"
};

const pageSEO: Record<string, SEOProps> = {
  '/': {
    title: "RepShield - Professional Reddit Reputation Management Services",
    description: "Protect your business reputation on Reddit with professional content monitoring and removal services. Specialized support for SMBs, SaaS companies, and eCommerce brands.",
    keywords: "reddit reputation management, online reputation services, business reputation protection, content removal, defamatory content, reddit monitoring",
    ogType: "website"
  },
  '/scan': {
    title: "Brand Reputation Scanner - Check Your Reddit Presence | RepShield",
    description: "Scan your brand's Reddit presence instantly. Identify potentially harmful content, track mentions, and assess reputation risks with our professional monitoring tools.",
    keywords: "brand scanner, reddit monitoring, reputation scan, brand mentions, online reputation check, reddit brand analysis",
    ogType: "website"
  },
  '/dashboard': {
    title: "Client Dashboard - Manage Your Reputation Cases | RepShield",
    description: "Access your reputation management dashboard. Track case progress, view removal requests, and monitor your brand's Reddit presence with real-time updates.",
    keywords: "reputation dashboard, case management, reddit removal tracking, client portal, reputation monitoring",
    ogType: "website"
  },
  '/about': {
    title: "About RepShield - Professional Reddit Reputation Experts",
    description: "Learn about RepShield's mission to protect business reputations on Reddit. Professional, ethical content removal services with proven results for growing businesses.",
    keywords: "about repshield, reputation management company, reddit experts, professional content removal, business reputation services",
    ogType: "website"
  },
  '/auth': {
    title: "Sign In - Access Your RepShield Account",
    description: "Sign in to your RepShield account to manage your reputation cases, track progress, and access professional Reddit content removal services.",
    keywords: "repshield login, sign in, client access, reputation account, case management login",
    ogType: "website"
  },
  '/login': {
    title: "Sign In - Access Your RepShield Account",
    description: "Sign in to your RepShield account to manage your reputation cases and track removal progress.",
    keywords: "repshield login, sign in, client portal",
    ogType: "website"
  },
  '/contact': {
    title: "Contact RepShield - Get Expert Reputation Help",
    description: "Contact our reputation management specialists for a free consultation. We help businesses remove harmful Reddit content quickly and ethically.",
    keywords: "contact repshield, reputation help, free consultation, reddit removal quote",
    ogType: "website"
  },
  '/blog': {
    title: "Reputation Management Blog - Tips & Insights | RepShield",
    description: "Expert insights on online reputation management, Reddit content removal strategies, and brand protection tips for businesses.",
    keywords: "reputation management blog, online reputation tips, reddit content strategy, brand protection",
    ogType: "website"
  },
  '/monitoring': {
    title: "Reddit Brand Monitoring - Real-Time Alerts | RepShield",
    description: "Monitor your brand mentions on Reddit in real-time. Get instant alerts for new posts and comments mentioning your business.",
    keywords: "reddit monitoring, brand mentions, real-time alerts, reputation monitoring, brand tracking",
    ogType: "website"
  },
  '/privacy-policy': {
    title: "Privacy Policy | RepShield",
    description: "RepShield's privacy policy. Learn how we collect, use, and protect your personal information.",
    ogType: "website"
  },
  '/terms-of-service': {
    title: "Terms of Service | RepShield",
    description: "RepShield's terms of service. Read our terms and conditions for using our reputation management platform.",
    ogType: "website"
  }
};

export default function SEOHead({ 
  title,
  description,
  keywords,
  ogType,
  ogImage,
  canonicalUrl
}: SEOProps) {
  const [location] = useLocation();
  
  useEffect(() => {
    const currentPageSEO = pageSEO[location] || {};
    const seoData = {
      title: title || currentPageSEO.title || defaultSEO.title,
      description: description || currentPageSEO.description || defaultSEO.description,
      keywords: keywords || currentPageSEO.keywords || defaultSEO.keywords,
      ogType: ogType || currentPageSEO.ogType || defaultSEO.ogType,
      ogImage: ogImage || currentPageSEO.ogImage || defaultSEO.ogImage,
      canonicalUrl: canonicalUrl || `https://repshield.io${location}`
    };

    // Update document title
    document.title = seoData.title;

    // Function to update or create meta tag
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Update meta tags
    updateMetaTag('description', seoData.description);
    updateMetaTag('keywords', seoData.keywords);
    updateMetaTag('author', 'RepShield Professional Services');
    updateMetaTag('robots', 'index, follow, max-snippet:-1, max-image-preview:large');
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    
    // Open Graph tags
    updateMetaTag('og:title', seoData.title, true);
    updateMetaTag('og:description', seoData.description, true);
    updateMetaTag('og:type', seoData.ogType, true);
    updateMetaTag('og:url', seoData.canonicalUrl, true);
    updateMetaTag('og:image', seoData.ogImage, true);
    updateMetaTag('og:site_name', 'RepShield', true);
    updateMetaTag('og:locale', 'en_US', true);
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', seoData.title);
    updateMetaTag('twitter:description', seoData.description);
    updateMetaTag('twitter:image', seoData.ogImage);
    
    // Additional SEO tags
    updateMetaTag('theme-color', '#3B82F6');
    updateMetaTag('msapplication-TileColor', '#3B82F6');
    
    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = seoData.canonicalUrl;

    // Add favicon if not present
    if (!document.querySelector('link[rel="icon"]')) {
      const favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.type = 'image/svg+xml';
      favicon.href = '/favicon.svg';
      document.head.appendChild(favicon);
    }

    // Add apple touch icon
    if (!document.querySelector('link[rel="apple-touch-icon"]')) {
      const appleTouchIcon = document.createElement('link');
      appleTouchIcon.rel = 'apple-touch-icon';
      appleTouchIcon.setAttribute('sizes', '180x180');
      appleTouchIcon.href = '/apple-touch-icon.png';
      document.head.appendChild(appleTouchIcon);
    }

  }, [location, title, description, keywords, ogType, ogImage, canonicalUrl]);

  return null;
}