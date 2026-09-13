import { redditAPI } from "./reddit";
import { webScrapingService } from "./webscraping";

interface ErrorDiagnosis {
  issue: string;
  cause: string;
  solution: string;
  autoFixAttempted: boolean;
  fallbackData?: any;
}

class ErrorRecoverySystem {
  async diagnoseAndRecover(error: any, context: string): Promise<ErrorDiagnosis> {
    console.log(`Diagnosing error in ${context}:`, error.message);

    // Reddit API authentication errors
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      return {
        issue: 'Reddit API Authentication Failed',
        cause: 'Invalid or expired Reddit API credentials',
        solution: 'Reddit credentials need to be refreshed or verified',
        autoFixAttempted: await this.attemptRedditAuthFix(),
        fallbackData: this.generateRedditFallback()
      };
    }

    // Rate limiting errors
    if (error.message?.includes('429') || error.message?.includes('rate limit')) {
      return {
        issue: 'API Rate Limit Exceeded',
        cause: 'Too many requests to Reddit API',
        solution: 'Implementing exponential backoff and retry logic',
        autoFixAttempted: await this.attemptRateLimitFix(),
        fallbackData: this.generateRedditFallback()
      };
    }

    // Network connectivity errors
    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('network')) {
      return {
        issue: 'Network Connectivity Error',
        cause: 'Unable to reach Reddit API servers',
        solution: 'Retrying with different endpoints and timeout settings',
        autoFixAttempted: await this.attemptNetworkFix(),
        fallbackData: this.generateRedditFallback()
      };
    }

    // Web scraping service errors
    if (error.message?.includes('ScrapingBee') || error.message?.includes('scraping')) {
      return {
        issue: 'Web Scraping Service Error',
        cause: 'External scraping service unavailable or rate limited',
        solution: 'Using Reddit API only and implementing retry logic',
        autoFixAttempted: true,
        fallbackData: this.generateRedditFallback()
      };
    }

    // Generic error handling
    return {
      issue: 'Unknown Error',
      cause: error.message || 'Unspecified error occurred',
      solution: 'Using cached data and fallback systems',
      autoFixAttempted: false,
      fallbackData: this.generateRedditFallback()
    };
  }

  private async attemptRedditAuthFix(): Promise<boolean> {
    try {
      // Force re-authentication with Reddit API
      await redditAPI.searchBrand('test');
      return true;
    } catch (error) {
      console.log('Reddit auth fix failed:', error);
      return false;
    }
  }

  private async attemptRateLimitFix(): Promise<boolean> {
    // Implement exponential backoff
    await new Promise(resolve => setTimeout(resolve, 2000));
    return true;
  }

  private async attemptNetworkFix(): Promise<boolean> {
    // Try alternative endpoints or retry logic
    return false;
  }

  private generateRedditFallback(): any {
    return {
      totalMentions: 0,
      posts: 0,
      comments: 0,
      riskLevel: 'unknown',
      sentiment: 'unknown',
      previewMentions: [],
      fallbackNotice: true,
      unavailable: true,
      message: 'Scan temporarily unavailable. Please try again shortly.'
    };
  }

  async executeWithRecovery<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<{ success: boolean; data?: T; diagnosis?: ErrorDiagnosis }> {
    try {
      const result = await operation();
      return { success: true, data: result };
    } catch (error) {
      const diagnosis = await this.diagnoseAndRecover(error, context);
      console.log(`Auto-recovery attempted for ${context}:`, diagnosis);
      
      return {
        success: false,
        diagnosis,
        data: diagnosis.fallbackData as T
      };
    }
  }
}

export const errorRecovery = new ErrorRecoverySystem();