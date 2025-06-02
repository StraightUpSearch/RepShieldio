interface ScrapingBeeResponse {
  url: string;
  body: string;
  status: number;
}

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  url: string;
  subreddit: string;
  author: string;
  created_utc: number;
  score: number;
  num_comments: number;
  permalink: string;
}

interface RedditComment {
  id: string;
  body: string;
  author: string;
  subreddit: string;
  created_utc: number;
  score: number;
  permalink: string;
  link_title: string;
}

interface RedditSearchResult {
  posts: RedditPost[];
  comments: RedditComment[];
  totalFound: number;
  riskScore: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

class ScrapingBeeAPI {
  private apiKey: string | null = null;

  constructor() {
    this.apiKey = process.env.SCRAPINGBEE_API_KEY || null;
    if (!this.apiKey) {
      console.warn("SCRAPINGBEE_API_KEY not found. Reddit scanning will not work.");
    }
  }

  private async makeRequest(url: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("ScrapingBee API key not configured");
    }

    const scrapingBeeUrl = `https://app.scrapingbee.com/api/v1/?api_key=${this.apiKey}&url=${encodeURIComponent(url)}&render_js=false&premium_proxy=true`;
    
    const response = await fetch(scrapingBeeUrl);
    
    if (!response.ok) {
      throw new Error(`ScrapingBee API error: ${response.status} ${response.statusText}`);
    }

    const data: ScrapingBeeResponse = {
      url: url,
      body: await response.text(),
      status: response.status
    };

    return data.body;
  }

  async searchBrand(brandName: string): Promise<RedditSearchResult> {
    if (!this.apiKey) {
      throw new Error("ScrapingBee API key required for Reddit scanning");
    }

    try {
      console.log(`Searching Reddit for brand: ${brandName}`);
      
      // Search Reddit for posts mentioning the brand
      const searchUrl = `https://www.reddit.com/search.json?q="${brandName}"&sort=new&limit=50`;
      const searchResults = await this.makeRequest(searchUrl);
      
      let posts: RedditPost[] = [];
      let comments: RedditComment[] = [];
      
      try {
        const redditData = JSON.parse(searchResults);
        
        if (redditData.data && redditData.data.children) {
          posts = redditData.data.children.map((child: any) => {
            const post = child.data;
            return {
              id: post.id,
              title: post.title || '',
              selftext: post.selftext || '',
              url: post.url || '',
              subreddit: post.subreddit || '',
              author: post.author || '',
              created_utc: post.created_utc || 0,
              score: post.score || 0,
              num_comments: post.num_comments || 0,
              permalink: post.permalink || ''
            };
          }).filter((post: RedditPost) => 
            post.title.toLowerCase().includes(brandName.toLowerCase()) ||
            post.selftext.toLowerCase().includes(brandName.toLowerCase())
          );
        }
      } catch (parseError) {
        console.error("Error parsing Reddit search results:", parseError);
      }

      // Also search for comments mentioning the brand
      try {
        const commentSearchUrl = `https://www.reddit.com/r/all/comments.json?limit=50`;
        const commentResults = await this.makeRequest(commentSearchUrl);
        const commentData = JSON.parse(commentResults);
        
        if (commentData.data && commentData.data.children) {
          comments = commentData.data.children.map((child: any) => {
            const comment = child.data;
            return {
              id: comment.id,
              body: comment.body || '',
              author: comment.author || '',
              subreddit: comment.subreddit || '',
              created_utc: comment.created_utc || 0,
              score: comment.score || 0,
              permalink: comment.permalink || '',
              link_title: comment.link_title || ''
            };
          }).filter((comment: RedditComment) => 
            comment.body.toLowerCase().includes(brandName.toLowerCase())
          );
        }
      } catch (commentError) {
        console.error("Error fetching comments:", commentError);
      }

      const allContent = [
        ...posts.map(p => p.title + ' ' + p.selftext),
        ...comments.map(c => c.body)
      ];

      const riskScore = this.calculateRiskScore(allContent);
      const sentiment = this.calculateSentiment(allContent);
      const totalFound = posts.length + comments.length;

      console.log(`Found ${totalFound} mentions for ${brandName}`);

      return {
        posts,
        comments,
        totalFound,
        riskScore,
        sentiment
      };
    } catch (error) {
      console.error("Error searching Reddit:", error);
      throw error;
    }
  }

  private calculateRiskScore(content: string[]): number {
    if (content.length === 0) return 0;

    const negativeKeywords = [
      'scam', 'fraud', 'terrible', 'awful', 'worst', 'horrible', 'avoid',
      'warning', 'dangerous', 'illegal', 'stolen', 'fake', 'lies',
      'disappointed', 'angry', 'furious', 'disgusted', 'outraged'
    ];

    let negativeCount = 0;
    let totalWords = 0;

    content.forEach(text => {
      const words = text.toLowerCase().split(/\s+/);
      totalWords += words.length;
      
      words.forEach(word => {
        if (negativeKeywords.some(keyword => word.includes(keyword))) {
          negativeCount++;
        }
      });
    });

    if (totalWords === 0) return 0;
    
    const riskPercentage = (negativeCount / totalWords) * 100;
    return Math.min(Math.round(riskPercentage * 10), 100); // Scale to 0-100
  }

  private calculateSentiment(content: string[]): 'positive' | 'negative' | 'neutral' {
    if (content.length === 0) return 'neutral';

    const positiveKeywords = [
      'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love',
      'recommend', 'perfect', 'outstanding', 'brilliant', 'awesome'
    ];

    const negativeKeywords = [
      'terrible', 'awful', 'horrible', 'hate', 'worst', 'bad',
      'disappointing', 'frustrated', 'angry', 'scam', 'avoid'
    ];

    let positiveScore = 0;
    let negativeScore = 0;

    content.forEach(text => {
      const words = text.toLowerCase().split(/\s+/);
      
      words.forEach(word => {
        if (positiveKeywords.some(keyword => word.includes(keyword))) {
          positiveScore++;
        }
        if (negativeKeywords.some(keyword => word.includes(keyword))) {
          negativeScore++;
        }
      });
    });

    if (positiveScore > negativeScore * 1.5) return 'positive';
    if (negativeScore > positiveScore * 1.5) return 'negative';
    return 'neutral';
  }
}

export const scrapingBeeAPI = new ScrapingBeeAPI();