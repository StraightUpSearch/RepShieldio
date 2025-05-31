interface RedditAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
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

class RedditAPI {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private clientId: string;
  private clientSecret: string;
  private userAgent: string;

  constructor() {
    this.clientId = process.env.REDDIT_CLIENT_ID!;
    this.clientSecret = process.env.REDDIT_CLIENT_SECRET!;
    this.userAgent = process.env.REDDIT_USER_AGENT!;

    if (!this.clientId || !this.clientSecret || !this.userAgent) {
      throw new Error('Reddit API credentials not configured');
    }
  }

  private async authenticate(): Promise<void> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return;
    }

    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'User-Agent': this.userAgent,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Reddit auth failed:');
      console.error('Status:', response.status);
      console.error('Response:', errorText);
      console.error('Client ID:', this.clientId);
      console.error('User Agent:', this.userAgent);
      throw new Error(`Reddit auth failed: ${response.statusText} - ${errorText}`);
    }

    const data: RedditAuthResponse = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 minute buffer
  }

  private async makeRequest(endpoint: string): Promise<any> {
    await this.authenticate();

    const response = await fetch(`https://oauth.reddit.com${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'User-Agent': this.userAgent,
      },
    });

    if (!response.ok) {
      throw new Error(`Reddit API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async searchBrand(brandName: string): Promise<RedditSearchResult> {
    try {
      // Search for posts mentioning the brand
      const postsData = await this.makeRequest(
        `/search?q="${brandName}"&type=link&limit=100&sort=new`
      );

      // Search for comments mentioning the brand
      const commentsData = await this.makeRequest(
        `/search?q="${brandName}"&type=comment&limit=100&sort=new`
      );

      const posts: RedditPost[] = postsData.data?.children?.map((child: any) => ({
        id: child.data.id,
        title: child.data.title,
        selftext: child.data.selftext,
        url: child.data.url,
        subreddit: child.data.subreddit,
        author: child.data.author,
        created_utc: child.data.created_utc,
        score: child.data.score,
        num_comments: child.data.num_comments,
        permalink: `https://reddit.com${child.data.permalink}`,
      })) || [];

      const comments: RedditComment[] = commentsData.data?.children?.map((child: any) => ({
        id: child.data.id,
        body: child.data.body,
        author: child.data.author,
        subreddit: child.data.subreddit,
        created_utc: child.data.created_utc,
        score: child.data.score,
        permalink: `https://reddit.com${child.data.permalink}`,
        link_title: child.data.link_title || 'Unknown',
      })) || [];

      // Calculate risk score based on negative sentiment
      const allContent = [
        ...posts.map(p => p.title + ' ' + p.selftext),
        ...comments.map(c => c.body)
      ];

      const riskScore = this.calculateRiskScore(allContent);
      const sentiment = this.calculateSentiment(allContent);

      return {
        posts,
        comments,
        totalFound: posts.length + comments.length,
        riskScore,
        sentiment,
      };
    } catch (error) {
      console.error('Reddit API error:', error);
      throw new Error('Failed to search Reddit');
    }
  }

  private calculateRiskScore(content: string[]): number {
    const negativeWords = [
      'scam', 'fraud', 'terrible', 'awful', 'horrible', 'worst', 'bad', 'hate',
      'disgusting', 'pathetic', 'useless', 'garbage', 'trash', 'fake', 'lie',
      'cheat', 'steal', 'rip off', 'ripoff', 'avoid', 'warning', 'danger'
    ];

    let negativeCount = 0;
    let totalWords = 0;

    content.forEach(text => {
      const words = text.toLowerCase().split(/\s+/);
      totalWords += words.length;
      
      words.forEach(word => {
        if (negativeWords.some(neg => word.includes(neg))) {
          negativeCount++;
        }
      });
    });

    if (totalWords === 0) return 0;
    
    const riskRatio = negativeCount / totalWords;
    return Math.min(100, Math.round(riskRatio * 1000)); // Scale to 0-100
  }

  private calculateSentiment(content: string[]): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['great', 'excellent', 'amazing', 'love', 'good', 'best', 'awesome'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible'];

    let positiveCount = 0;
    let negativeCount = 0;

    content.forEach(text => {
      const words = text.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (positiveWords.some(pos => word.includes(pos))) positiveCount++;
        if (negativeWords.some(neg => word.includes(neg))) negativeCount++;
      });
    });

    if (negativeCount > positiveCount) return 'negative';
    if (positiveCount > negativeCount) return 'positive';
    return 'neutral';
  }
}

export const redditAPI = new RedditAPI();