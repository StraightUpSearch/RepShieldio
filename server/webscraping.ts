interface WebScrapingResult {
  source: string;
  mentions: ScrapedMention[];
  totalFound: number;
  riskScore: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

interface ScrapedMention {
  id: string;
  title: string;
  content: string;
  author: string;
  platform: string;
  url: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  engagement: number;
}

interface WebScrapingProvider {
  name: string;
  baseUrl: string;
  apiKey?: string;
  rateLimitPerMinute: number;
}

class WebScrapingService {
  private providers: WebScrapingProvider[] = [
    {
      name: 'ScrapingBee',
      baseUrl: 'https://app.scrapingbee.com/api/v1',
      rateLimitPerMinute: 100
    },
    {
      name: 'Bright Data',
      baseUrl: 'https://brightdata.com/api/v1',
      rateLimitPerMinute: 200
    },
    {
      name: 'Apify',
      baseUrl: 'https://api.apify.com/v2',
      rateLimitPerMinute: 150
    }
  ];

  constructor() {
    // Initialize with environment variables
    this.providers.forEach(provider => {
      const envKey = `${provider.name.toUpperCase().replace(' ', '_')}_API_KEY`;
      provider.apiKey = process.env[envKey];
    });
    
    // Set ScrapingBee API key directly
    const scrapingBeeProvider = this.providers.find(p => p.name === 'ScrapingBee');
    if (scrapingBeeProvider) {
      scrapingBeeProvider.apiKey = process.env.SCRAPINGBEE_API_KEY || 'PMZK9JAU5MSMYBSWHNL0Y4FI513EGQB96TGVO4649XQIPDKUOSAU8IEMJX66TRGPJIQN8JPPLREG1YGJ';
    }
  }

  async searchBrandMentions(brandName: string): Promise<WebScrapingResult[]> {
    const results: WebScrapingResult[] = [];
    
    // Search across multiple platforms
    const platforms = [
      { name: 'Reddit', scraper: this.scrapeReddit.bind(this) },
      { name: 'Twitter', scraper: this.scrapeTwitter.bind(this) },
      { name: 'Trustpilot', scraper: this.scrapeTrustpilot.bind(this) },
      { name: 'G2', scraper: this.scrapeG2.bind(this) },
      { name: 'Capterra', scraper: this.scrapeCapterra.bind(this) },
      { name: 'News Sites', scraper: this.scrapeNews.bind(this) },
      { name: 'Forums', scraper: this.scrapeForums.bind(this) }
    ];

    for (const platform of platforms) {
      try {
        const result = await platform.scraper(brandName);
        if (result) {
          results.push(result);
        }
      } catch (error) {
        console.error(`Error scraping ${platform.name}:`, error);
      }
    }

    return results;
  }

  private async scrapeReddit(brandName: string): Promise<WebScrapingResult | null> {
    // Use existing Reddit API integration
    return null; // Already handled by redditAPI
  }

  private async scrapeTwitter(brandName: string): Promise<WebScrapingResult | null> {
    const provider = this.getAvailableProvider();
    if (!provider) return null;

    try {
      // Search Twitter mentions using web scraping
      const searchUrl = `https://twitter.com/search?q=${encodeURIComponent(brandName)}&src=typed_query&f=live`;
      const scrapedData = await this.scrapeUrl(provider, searchUrl);
      
      return this.processTwitterData(scrapedData, brandName);
    } catch (error) {
      console.error('Twitter scraping error:', error);
      return null;
    }
  }

  private async scrapeTrustpilot(brandName: string): Promise<WebScrapingResult | null> {
    const provider = this.getAvailableProvider();
    if (!provider) return null;

    try {
      const searchUrl = `https://www.trustpilot.com/search?query=${encodeURIComponent(brandName)}`;
      const scrapedData = await this.scrapeUrl(provider, searchUrl);
      
      return this.processTrustpilotData(scrapedData, brandName);
    } catch (error) {
      console.error('Trustpilot scraping error:', error);
      return null;
    }
  }

  private async scrapeG2(brandName: string): Promise<WebScrapingResult | null> {
    const provider = this.getAvailableProvider();
    if (!provider) return null;

    try {
      const searchUrl = `https://www.g2.com/search?query=${encodeURIComponent(brandName)}`;
      const scrapedData = await this.scrapeUrl(provider, searchUrl);
      
      return this.processG2Data(scrapedData, brandName);
    } catch (error) {
      console.error('G2 scraping error:', error);
      return null;
    }
  }

  private async scrapeCapterra(brandName: string): Promise<WebScrapingResult | null> {
    const provider = this.getAvailableProvider();
    if (!provider) return null;

    try {
      const searchUrl = `https://www.capterra.com/search/?query=${encodeURIComponent(brandName)}`;
      const scrapedData = await this.scrapeUrl(provider, searchUrl);
      
      return this.processCapterraData(scrapedData, brandName);
    } catch (error) {
      console.error('Capterra scraping error:', error);
      return null;
    }
  }

  private async scrapeNews(brandName: string): Promise<WebScrapingResult | null> {
    const provider = this.getAvailableProvider();
    if (!provider) return null;

    try {
      // Search Google News for brand mentions
      const searchUrl = `https://news.google.com/search?q=${encodeURIComponent(brandName)}&hl=en-US&gl=US`;
      const scrapedData = await this.scrapeUrl(provider, searchUrl);
      
      return this.processNewsData(scrapedData, brandName);
    } catch (error) {
      console.error('News scraping error:', error);
      return null;
    }
  }

  private async scrapeForums(brandName: string): Promise<WebScrapingResult | null> {
    const provider = this.getAvailableProvider();
    if (!provider) return null;

    try {
      // Search various forums
      const forums = [
        `https://stackoverflow.com/search?q=${encodeURIComponent(brandName)}`,
        `https://www.quora.com/search?q=${encodeURIComponent(brandName)}`,
        `https://www.reddit.com/search/?q=${encodeURIComponent(brandName)}`
      ];

      const allMentions: ScrapedMention[] = [];
      
      for (const forumUrl of forums) {
        try {
          const scrapedData = await this.scrapeUrl(provider, forumUrl);
          const mentions = this.processForumData(scrapedData, brandName);
          allMentions.push(...mentions);
        } catch (error) {
          console.error(`Forum scraping error for ${forumUrl}:`, error);
        }
      }

      return {
        source: 'Forums',
        mentions: allMentions,
        totalFound: allMentions.length,
        riskScore: this.calculateRiskScore(allMentions),
        sentiment: this.calculateSentiment(allMentions)
      };
    } catch (error) {
      console.error('Forum scraping error:', error);
      return null;
    }
  }

  private async scrapeUrl(provider: WebScrapingProvider, url: string): Promise<any> {
    if (!provider.apiKey) {
      throw new Error(`API key not configured for ${provider.name}`);
    }

    // Implementation depends on the specific provider
    if (provider.name === 'ScrapingBee') {
      return this.scrapeWithScrapingBee(provider, url);
    } else if (provider.name === 'Bright Data') {
      return this.scrapeWithBrightData(provider, url);
    } else if (provider.name === 'Apify') {
      return this.scrapeWithApify(provider, url);
    }
    
    throw new Error(`Unsupported provider: ${provider.name}`);
  }

  private async scrapeWithScrapingBee(provider: WebScrapingProvider, url: string): Promise<any> {
    const response = await fetch(`${provider.baseUrl}/?api_key=${provider.apiKey}&url=${encodeURIComponent(url)}&render_js=true&premium_proxy=true&country_code=us`);
    
    if (!response.ok) {
      throw new Error(`ScrapingBee API error: ${response.statusText}`);
    }

    const html = await response.text();
    return this.parseHTMLContent(html, url);
  }

  private parseHTMLContent(html: string, url: string): any {
    // Parse HTML content and extract structured data
    const data = {
      url,
      content: html,
      timestamp: new Date().toISOString(),
      mentions: this.extractMentionsFromHTML(html)
    };
    
    return data;
  }

  private extractMentionsFromHTML(html: string): any[] {
    // Extract mentions from HTML using basic text parsing
    // This would be enhanced with proper HTML parsing in production
    const mentions = [];
    
    // Look for common patterns in review sites, social media, etc.
    const patterns = [
      /<div[^>]*class="[^"]*review[^"]*"[^>]*>(.*?)<\/div>/gi,
      /<p[^>]*class="[^"]*comment[^"]*"[^>]*>(.*?)<\/p>/gi,
      /<span[^>]*class="[^"]*text[^"]*"[^>]*>(.*?)<\/span>/gi
    ];
    
    patterns.forEach(pattern => {
      const matches = html.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleanText = match.replace(/<[^>]*>/g, '').trim();
          if (cleanText.length > 20) {
            mentions.push({
              content: cleanText,
              extracted: new Date().toISOString()
            });
          }
        });
      }
    });
    
    return mentions.slice(0, 10); // Limit to 10 mentions per source
  }

  private async scrapeWithBrightData(provider: WebScrapingProvider, url: string): Promise<any> {
    // Bright Data implementation
    throw new Error('Bright Data integration requires specific setup');
  }

  private async scrapeWithApify(provider: WebScrapingProvider, url: string): Promise<any> {
    // Apify implementation
    throw new Error('Apify integration requires specific setup');
  }

  private getAvailableProvider(): WebScrapingProvider | null {
    return this.providers.find(provider => provider.apiKey) || null;
  }

  private processTwitterData(html: string, brandName: string): WebScrapingResult {
    // Parse Twitter HTML and extract mentions
    // This is a simplified implementation
    return {
      source: 'Twitter',
      mentions: [],
      totalFound: 0,
      riskScore: 0,
      sentiment: 'neutral'
    };
  }

  private processTrustpilotData(html: string, brandName: string): WebScrapingResult {
    // Parse Trustpilot HTML and extract reviews
    return {
      source: 'Trustpilot',
      mentions: [],
      totalFound: 0,
      riskScore: 0,
      sentiment: 'neutral'
    };
  }

  private processG2Data(html: string, brandName: string): WebScrapingResult {
    // Parse G2 HTML and extract reviews
    return {
      source: 'G2',
      mentions: [],
      totalFound: 0,
      riskScore: 0,
      sentiment: 'neutral'
    };
  }

  private processCapterraData(html: string, brandName: string): WebScrapingResult {
    // Parse Capterra HTML and extract reviews
    return {
      source: 'Capterra',
      mentions: [],
      totalFound: 0,
      riskScore: 0,
      sentiment: 'neutral'
    };
  }

  private processNewsData(html: string, brandName: string): WebScrapingResult {
    // Parse news HTML and extract articles
    return {
      source: 'News',
      mentions: [],
      totalFound: 0,
      riskScore: 0,
      sentiment: 'neutral'
    };
  }

  private processForumData(html: string, brandName: string): ScrapedMention[] {
    // Parse forum HTML and extract discussions
    return [];
  }

  private calculateRiskScore(mentions: ScrapedMention[]): number {
    if (mentions.length === 0) return 0;
    
    const negativeMentions = mentions.filter(m => m.sentiment === 'negative').length;
    const riskScore = (negativeMentions / mentions.length) * 10;
    
    return Math.round(riskScore * 10) / 10;
  }

  private calculateSentiment(mentions: ScrapedMention[]): 'positive' | 'negative' | 'neutral' {
    if (mentions.length === 0) return 'neutral';
    
    const sentimentCounts = mentions.reduce((acc, mention) => {
      acc[mention.sentiment]++;
      return acc;
    }, { positive: 0, negative: 0, neutral: 0 });

    if (sentimentCounts.negative > sentimentCounts.positive) {
      return 'negative';
    } else if (sentimentCounts.positive > sentimentCounts.negative) {
      return 'positive';
    }
    
    return 'neutral';
  }
}

export const webScrapingService = new WebScrapingService();
export type { WebScrapingResult, ScrapedMention };