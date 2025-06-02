import { useEffect } from 'react';
import { useLocation } from 'wouter';

// High-value keyword combinations for reputation management
const keywordSets = {
  primary: [
    'reddit reputation management',
    'online reputation management', 
    'business reputation protection',
    'content removal services'
  ],
  industry: [
    'SaaS reputation management',
    'ecommerce reputation protection',
    'SMB online reputation',
    'startup reputation management'
  ],
  actionable: [
    'remove reddit posts',
    'delete negative reddit content',
    'reddit defamation removal',
    'reddit brand protection'
  ],
  competitive: [
    'professional reputation management',
    'ethical content removal',
    'reddit reputation experts',
    'reputation management specialists'
  ]
};

const contentAnalysis = {
  '/': {
    focus: 'homepage conversion',
    intent: 'commercial investigation',
    urgency: 'high',
    keywords: [...keywordSets.primary, ...keywordSets.competitive],
    localSEO: true
  },
  '/scan': {
    focus: 'lead generation',
    intent: 'transactional',
    urgency: 'immediate',
    keywords: [...keywordSets.actionable, 'brand reputation scan', 'reddit monitoring'],
    localSEO: false
  },
  '/dashboard': {
    focus: 'user retention',
    intent: 'navigational',
    urgency: 'low',
    keywords: ['reputation dashboard', 'case management', 'progress tracking'],
    localSEO: false
  },
  '/about': {
    focus: 'trust building',
    intent: 'informational',
    urgency: 'medium',
    keywords: [...keywordSets.competitive, 'reputation management company', 'reddit experts'],
    localSEO: true
  }
};

export default function DynamicMeta() {
  const [location] = useLocation();

  useEffect(() => {
    const analysis = contentAnalysis[location as keyof typeof contentAnalysis];
    if (!analysis) return;

    // Add semantic HTML5 tags for better content understanding
    const updateMetaTag = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Enhanced keyword density optimization
    const keywordString = analysis.keywords.join(', ');
    updateMetaTag('keywords', keywordString);

    // Search intent optimization
    const intentMap = {
      commercial: 'We help businesses protect their Reddit reputation with professional content removal services.',
      transactional: 'Get instant Reddit reputation analysis and remove harmful content affecting your business.',
      informational: 'Learn about professional Reddit reputation management and ethical content removal practices.',
      navigational: 'Access your reputation management dashboard to track case progress and content removal status.'
    };

    // Priority and urgency signals for search engines
    updateMetaTag('urgency', analysis.urgency);
    updateMetaTag('content-priority', analysis.focus);
    updateMetaTag('search-intent', analysis.intent);

    // Business schema signals
    updateMetaTag('business-category', 'Online Reputation Management');
    updateMetaTag('service-area', 'Global');
    updateMetaTag('business-type', 'Professional Services');

    // Enhanced Open Graph optimization
    updateMetaTag('og:business:contact_data:website', 'https://repshield.io', true);
    updateMetaTag('og:business:contact_data:email', 'support@repshield.io', true);
    updateMetaTag('og:business:hours:day', 'monday,tuesday,wednesday,thursday,friday', true);
    updateMetaTag('og:business:hours:start', '09:00', true);
    updateMetaTag('og:business:hours:end', '17:00', true);

    // Local SEO optimization where applicable
    if (analysis.localSEO) {
      updateMetaTag('geo.region', 'US');
      updateMetaTag('geo.position', '39.8283;-98.5795');
      updateMetaTag('ICBM', '39.8283, -98.5795');
      updateMetaTag('business.hours', 'Mo-Fr 09:00-17:00');
    }

    // Performance and crawling hints
    updateMetaTag('preconnect', 'https://fonts.googleapis.com');
    updateMetaTag('dns-prefetch', 'https://api.scrapingbee.com');
    
    // Content freshness signals
    updateMetaTag('article:modified_time', new Date().toISOString(), true);
    updateMetaTag('article:published_time', new Date().toISOString(), true);

    // Trust and authority signals
    updateMetaTag('content-language', 'en-US');
    updateMetaTag('distribution', 'global');
    updateMetaTag('rating', 'general');
    updateMetaTag('revisit-after', '7 days');

    // Mobile and accessibility optimization
    updateMetaTag('mobile-web-app-capable', 'yes');
    updateMetaTag('apple-mobile-web-app-capable', 'yes');
    updateMetaTag('apple-mobile-web-app-status-bar-style', 'black-translucent');

    // Security and privacy signals
    updateMetaTag('referrer', 'strict-origin-when-cross-origin');
    updateMetaTag('permissions-policy', 'geolocation=(), microphone=(), camera=()');

  }, [location]);

  return null;
}