import { redditAPI } from './reddit.js';
import { scrapingBeeAPI } from './scrapingbee.js';
import { db } from './db.js';
import { notificationManager } from './notification-manager.js';

interface ScanRequest {
  brandName: string;
  userEmail?: string;
  priority: 'quick' | 'comprehensive';
  platforms: string[];
}

interface ScanResult {
  scanId: string;
  brandName: string;
  totalMentions: number;
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  platforms: {
    reddit: {
      posts: number;
      comments: number;
      sentiment: string;
      topMentions: any[];
    };
    web?: {
      mentions: number;
      sources: string[];
    };
  };
  ticketId?: number;
  processingTime: number;
  nextSteps: string[];
}

class LiveScannerService {
  private activeScanSessions = new Map<string, any>();
  
  /**
   * QUICK SCAN - Optimized for immediate results
   * Used for initial brand scanning with fast turnaround
   */
  async quickScan(request: ScanRequest): Promise<ScanResult> {
    const startTime = Date.now();
    const scanId = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🔍 Starting quick scan for: ${request.brandName}`);
    
    try {
      // Reddit-focused quick scan using ScrapingBee for speed
      const redditResults = await scrapingBeeAPI.searchBrand(request.brandName);
      
      // Calculate risk factors
      const riskScore = this.calculateAdvancedRiskScore(redditResults);
      const riskLevel = this.determineRiskLevel(riskScore, redditResults.totalFound);
      
      // Extract top mentions for preview
      const topMentions = this.extractTopMentions(redditResults, 3);
      
      const result: ScanResult = {
        scanId,
        brandName: request.brandName,
        totalMentions: redditResults.totalFound,
        riskLevel,
        riskScore,
        platforms: {
          reddit: {
            posts: redditResults.posts.length,
            comments: redditResults.comments.length,
            sentiment: redditResults.sentiment,
            topMentions
          }
        },
        processingTime: Date.now() - startTime,
        nextSteps: this.generateNextSteps(riskLevel, redditResults.totalFound)
      };
      
      // Store scan session for follow-up
      this.activeScanSessions.set(scanId, {
        ...result,
        fullData: redditResults,
        timestamp: Date.now()
      });
      
      // Auto-create ticket if high risk or user requested
      if (riskLevel === 'high' || request.userEmail) {
        result.ticketId = await this.createSpecialistTicket(result, request);
      }
      
      // Notify admin monitoring
      notificationManager.broadcastBrandScan(request.brandName, result);
      
      console.log(`✅ Quick scan completed in ${result.processingTime}ms`);
      return result;
      
    } catch (error) {
      console.error('Quick scan failed:', error);
      throw new Error(`Scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * COMPREHENSIVE SCAN - Multi-platform deep analysis
   * Used when user requests full professional analysis
   */
  async comprehensiveScan(request: ScanRequest): Promise<ScanResult> {
    const startTime = Date.now();
    const scanId = `comprehensive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🔍 Starting comprehensive scan for: ${request.brandName}`);
    
    try {
      // Parallel scanning of multiple platforms
      const [redditResults, webResults] = await Promise.allSettled([
        redditAPI.searchBrand(request.brandName),
        this.scanWebPlatforms(request.brandName, request.platforms)
      ]);
      
      const reddit = redditResults.status === 'fulfilled' ? redditResults.value : null;
      const web = webResults.status === 'fulfilled' ? webResults.value : null;
      
      if (!reddit) {
        throw new Error('Reddit scan failed');
      }
      
      const totalMentions = reddit.totalFound + (web?.totalMentions || 0);
      const riskScore = this.calculateAdvancedRiskScore(reddit, web);
      const riskLevel = this.determineRiskLevel(riskScore, totalMentions);
      
      const result: ScanResult = {
        scanId,
        brandName: request.brandName,
        totalMentions,
        riskLevel,
        riskScore,
        platforms: {
          reddit: {
            posts: reddit.posts.length,
            comments: reddit.comments.length,
            sentiment: reddit.sentiment,
            topMentions: this.extractTopMentions(reddit, 5)
          },
          web: web ? {
            mentions: web.totalMentions,
            sources: web.sources
          } : undefined
        },
        processingTime: Date.now() - startTime,
        nextSteps: this.generateComprehensiveNextSteps(riskLevel, totalMentions)
      };
      
      // Always create specialist ticket for comprehensive scans
      result.ticketId = await this.createSpecialistTicket(result, request);
      
      console.log(`✅ Comprehensive scan completed in ${result.processingTime}ms`);
      return result;
      
    } catch (error) {
      console.error('Comprehensive scan failed:', error);
      throw new Error(`Comprehensive scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Advanced risk scoring with multiple factors
   */
  private calculateAdvancedRiskScore(reddit: any, web?: any): number {
    let score = 0;
    
    // Reddit factors (weight: 70%)
    if (reddit) {
      // Base negative sentiment
      score += reddit.riskScore * 0.4;
      
      // Volume factor (more mentions = higher visibility risk)
      const volumeMultiplier = Math.min(reddit.totalFound / 20, 2);
      score += volumeMultiplier * 15;
      
      // Recency factor (recent mentions are riskier)
      const recentPosts = reddit.posts.filter((p: any) => 
        (Date.now() / 1000 - p.created_utc) < 86400 * 7
      );
      if (recentPosts.length > 0) {
        score += (recentPosts.length / reddit.posts.length) * 20;
      }
      
      // High-visibility subreddits factor
      const highVisibilitySubreddits = ['entrepreneur', 'business', 'reviews', 'scams'];
      const highVisCount = reddit.posts.filter((p: any) => 
        highVisibilitySubreddits.includes(p.subreddit.toLowerCase())
      ).length;
      score += (highVisCount / reddit.posts.length) * 25;
    }
    
    // Web platform factors (weight: 30%)
    if (web) {
      score += (web.negativeMentions / web.totalMentions) * 30;
    }
    
    return Math.min(Math.round(score), 100);
  }
  
  private determineRiskLevel(score: number, totalMentions: number): 'low' | 'medium' | 'high' {
    if (score >= 70 || totalMentions >= 50) return 'high';
    if (score >= 40 || totalMentions >= 20) return 'medium';
    return 'low';
  }
  
  private extractTopMentions(reddit: any, limit: number) {
    const allMentions = [
      ...reddit.posts.map((p: any) => ({
        type: 'post',
        subreddit: p.subreddit,
        content: p.title + ' ' + p.selftext.substring(0, 150),
        score: p.score,
        url: `https://reddit.com${p.permalink}`,
        created: p.created_utc
      })),
      ...reddit.comments.map((c: any) => ({
        type: 'comment',
        subreddit: c.subreddit,
        content: c.body.substring(0, 150),
        score: c.score,
        url: `https://reddit.com${c.permalink}`,
        created: c.created_utc
      }))
    ];
    
    // Sort by score and recency, prioritize negative content
    return allMentions
      .sort((a, b) => {
        const scoreWeight = Math.abs(b.score) - Math.abs(a.score);
        const timeWeight = (b.created - a.created) * 0.001;
        return scoreWeight + timeWeight;
      })
      .slice(0, limit);
  }
  
  private generateNextSteps(riskLevel: string, mentionCount: number): string[] {
    const steps = [];
    
    if (riskLevel === 'high') {
      steps.push('🚨 Immediate specialist consultation recommended');
      steps.push('📋 Professional content removal assessment');
      steps.push('⚡ 24-hour priority response team assigned');
    } else if (riskLevel === 'medium') {
      steps.push('📊 Detailed sentiment analysis available');
      steps.push('💬 Specialist consultation within 2 hours');
      steps.push('📈 Reputation monitoring setup');
    } else {
      steps.push('✅ Current brand mention status is healthy');
      steps.push('📅 Optional quarterly monitoring available');
      steps.push('📞 Specialist available for consultation');
    }
    
    if (mentionCount > 0) {
      steps.push(`🔍 ${mentionCount} mentions require professional review`);
    }
    
    return steps;
  }
  
  private generateComprehensiveNextSteps(riskLevel: string, mentionCount: number): string[] {
    return [
      ...this.generateNextSteps(riskLevel, mentionCount),
      '📝 Detailed removal strategy report',
      '⚖️ Legal assessment for problematic content',
      '🎯 Brand protection strategy consultation'
    ];
  }
  
  private async scanWebPlatforms(brandName: string, platforms: string[]) {
    // Placeholder for web platform scanning
    // This would integrate with other APIs for comprehensive scanning
    return {
      totalMentions: Math.floor(Math.random() * 10) + 5,
      negativeMentions: Math.floor(Math.random() * 3),
      sources: ['TrustPilot', 'Google Reviews', 'BBB']
    };
  }
  
  private async createSpecialistTicket(result: ScanResult, request: ScanRequest): Promise<number> {
    const storage = await db();
    
    const ticket = await storage.createBrandScanTicket({
      brandName: request.brandName,
      userEmail: request.userEmail || 'anonymous@scanner.com',
      userName: 'Brand Scanner User',
      scanResults: JSON.stringify(result),
      priority: result.riskLevel === 'high' ? 'urgent' : 'normal',
      processed: false
    });
    
    console.log(`🎫 Created specialist ticket #${ticket.id} for ${request.brandName}`);
    return ticket.id;
  }
  
  /**
   * Get scan session data for follow-up processing
   */
  getScanSession(scanId: string) {
    return this.activeScanSessions.get(scanId);
  }
  
  /**
   * Clean up old scan sessions (cleanup every hour)
   */
  cleanup() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    for (const [scanId, session] of this.activeScanSessions.entries()) {
      if (session.timestamp < oneHourAgo) {
        this.activeScanSessions.delete(scanId);
      }
    }
  }
}

export const liveScannerService = new LiveScannerService();

// Cleanup old sessions every hour
setInterval(() => {
  liveScannerService.cleanup();
}, 60 * 60 * 1000); 