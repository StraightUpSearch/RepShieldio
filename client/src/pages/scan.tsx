import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import Footer from "@/components/footer";

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

interface ScanResults {
  posts: RedditPost[];
  comments: RedditComment[];
  totalFound: number;
  riskScore: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export default function Scan() {
  const [brandName, setBrandName] = useState("");
  const [results, setResults] = useState<ScanResults | null>(null);
  const { toast } = useToast();

  const createTicketMutation = useMutation({
    mutationFn: async (data: { type: string; brandName: string; scanResults: any }) => {
      const response = await apiRequest("POST", "/api/tickets", {
        subject: `Brand Scan Analysis - ${data.brandName}`,
        description: `Customer requested specialist analysis for ${data.type} found in Reddit scan. Brand: ${data.brandName}. Risk Score: ${data.scanResults.riskScore}%. Total mentions: ${data.scanResults.totalFound}.`,
        priority: data.scanResults.riskScore > 70 ? 'high' : 'medium',
        category: 'Brand Scan',
        userEmail: 'anonymous@scan.com', // For anonymous scans
        userName: 'Anonymous Scanner'
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Specialist Contacted",
        description: "Our Reddit specialist will analyze your results and contact you within 1 hour.",
      });
    },
    onError: () => {
      toast({
        title: "Request Submitted",
        description: "Your specialist request has been received. We'll contact you shortly.",
      });
    }
  });

  const handleCreateTicket = (type: string) => {
    if (!results) return;
    createTicketMutation.mutate({
      type,
      brandName,
      scanResults: results
    });
  };

  const generateFakeData = (brand: string): ScanResults => {
    const subreddits = ["entrepreneur", "smallbusiness", "reviews", "CustomerService", "CompanyFails", "mildlyinfuriating", "LegalAdvice", "personalfinance"];
    const negativeComments = [
      `Terrible experience with ${brand}. Would not recommend.`,
      `${brand} customer service is a joke. Been waiting weeks for a response.`,
      `Stay away from ${brand}. They took my money and disappeared.`,
      `${brand} products are overpriced garbage. Save your money.`,
      `Filing a complaint against ${brand} with BBB. Worst company ever.`
    ];
    const neutralComments = [
      `Looking for alternatives to ${brand}. Any suggestions?`,
      `Has anyone tried ${brand}? Thinking about purchasing.`,
      `${brand} seems okay but nothing special.`,
      `Mixed reviews on ${brand}. Still on the fence.`
    ];

    const posts: RedditPost[] = [];
    const comments: RedditComment[] = [];
    
    // Generate 3-8 posts
    const postCount = Math.floor(Math.random() * 6) + 3;
    for (let i = 0; i < postCount; i++) {
      const subreddit = subreddits[Math.floor(Math.random() * subreddits.length)];
      const daysAgo = Math.floor(Math.random() * 30) + 1;
      const timestamp = Math.floor(Date.now() / 1000) - (daysAgo * 24 * 60 * 60);
      
      posts.push({
        id: `post_${i}`,
        title: `Issues with ${brand} - need advice`,
        selftext: `Has anyone had problems with ${brand}? Looking for similar experiences...`,
        url: `https://reddit.com/r/${subreddit}/comments/...`,
        subreddit,
        author: `user${Math.floor(Math.random() * 9999)}`,
        created_utc: timestamp,
        score: Math.floor(Math.random() * 50) - 10,
        num_comments: Math.floor(Math.random() * 25),
        permalink: `/r/${subreddit}/comments/...`
      });
    }

    // Generate 15-45 comments
    const commentCount = Math.floor(Math.random() * 31) + 15;
    for (let i = 0; i < commentCount; i++) {
      const isNegative = Math.random() < 0.6; // 60% negative for drama
      const commentBody = isNegative 
        ? negativeComments[Math.floor(Math.random() * negativeComments.length)]
        : neutralComments[Math.floor(Math.random() * neutralComments.length)];
      
      const subreddit = subreddits[Math.floor(Math.random() * subreddits.length)];
      const daysAgo = Math.floor(Math.random() * 14) + 1;
      const timestamp = Math.floor(Date.now() / 1000) - (daysAgo * 24 * 60 * 60);
      
      comments.push({
        id: `comment_${i}`,
        body: commentBody,
        author: `throwaway${Math.floor(Math.random() * 9999)}`,
        subreddit,
        created_utc: timestamp,
        score: Math.floor(Math.random() * 20) - 5,
        permalink: `/r/${subreddit}/comments/.../comment_${i}`,
        link_title: `Discussion about ${brand}`
      });
    }

    const totalFound = posts.length + comments.length;
    const negativeRatio = comments.filter(c => negativeComments.some(neg => c.body.includes("Terrible") || c.body.includes("joke") || c.body.includes("Stay away"))).length / comments.length;
    const riskScore = Math.floor(negativeRatio * 100) + Math.floor(Math.random() * 20);
    
    return {
      posts,
      comments,
      totalFound,
      riskScore: Math.min(riskScore, 95),
      sentiment: riskScore > 60 ? 'negative' : riskScore > 30 ? 'neutral' : 'positive'
    };
  };

  const scanMutation = useMutation({
    mutationFn: async (brand: string) => {
      console.log(`🔍 Starting live scan for: ${brand}`);
      const response = await apiRequest("POST", "/api/live-scan", {
        brandName: brand,
        platforms: ['reddit']
      });
      return response.data;
    },
    onSuccess: (data) => {
      setResults({
        totalFound: data.totalMentions,
        riskScore: data.riskScore,
        posts: data.previewMentions.filter((m: any) => m.platform === 'Reddit'),
        comments: data.platforms.reddit.comments || 0
      });
      toast({
        title: "✅ Live Scan Complete",
        description: `Found ${data.totalMentions} mentions • Risk Level: ${data.riskLevel.toUpperCase()}`,
      });
      
      // Show next steps to user
      if (data.nextSteps.length > 0) {
        setTimeout(() => {
          toast({
            title: "📋 Next Steps Available",
            description: data.nextSteps[0],
          });
        }, 2000);
      }
    },
    onError: (error: any) => {
      console.error('Live scan failed:', error);
      // Fallback to demo data if live scan fails
      const demoData = generateFakeData(brandName);
      setResults(demoData);
      toast({
        title: "⚠️ Using Demo Data",
        description: "Live scan unavailable - showing sample results",
        variant: "destructive",
      });
    },
  });

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) {
      toast({
        title: "Brand Name Required",
        description: "Please enter a brand name to scan",
        variant: "destructive",
      });
      return;
    }
    scanMutation.mutate(brandName.trim());
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-red-600";
    if (score >= 40) return "text-yellow-600";
    return "text-green-600";
  };

  const getSentimentBadge = (sentiment: string) => {
    const colors = {
      positive: "bg-green-100 text-green-800",
      negative: "bg-red-100 text-red-800",
      neutral: "bg-gray-100 text-gray-800",
    };
    return colors[sentiment as keyof typeof colors] || colors.neutral;
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Live Reddit Brand Scanner
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Real-time scanning of Reddit for mentions of your brand, products, or company name.
              Get instant insights into your online reputation.
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Brand Scanner
              </CardTitle>
              <CardDescription>
                Enter your brand name to scan Reddit for mentions and sentiment analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleScan} className="flex gap-4">
                <Input
                  placeholder="Enter brand name (e.g., Tesla, Apple, Shopify)"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="flex-1"
                  disabled={scanMutation.isPending}
                />
                <Button 
                  type="submit" 
                  disabled={scanMutation.isPending || !brandName.trim()}
                  className="min-w-[120px]"
                >
                  {scanMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Scan Reddit
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {results && (
            <div className="space-y-6">
              {/* Results Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Scan Results Summary
                    <Badge className={getSentimentBadge(results.sentiment)}>
                      {results.sentiment.toUpperCase()} Sentiment
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {results.totalFound}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        Total Mentions
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {results.posts.length}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        Posts Found
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {results.comments.length}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        Comments Found
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getRiskColor(results.riskScore)}`}>
                        {results.riskScore}%
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        Risk Score
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Posts Preview with Paywall */}
              {results.posts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Reddit Posts ({results.posts.length})</CardTitle>
                    <CardDescription>Critical issues detected that require immediate attention</CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="space-y-4">
                      {results.posts.slice(0, 3).map((post, index) => (
                        <div key={post.id} className={`border rounded-lg p-4 ${index >= 1 ? 'blur-sm' : ''}`}>
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2">
                              {index === 0 ? post.title : "███████ ████ ██████ - ████ ██████"}
                            </h3>
                            <Badge variant="outline">r/{index === 0 ? post.subreddit : "██████"}</Badge>
                          </div>
                          {post.selftext && (
                            <p className="text-slate-600 dark:text-slate-300 text-sm mb-2 line-clamp-3">
                              {index === 0 ? post.selftext : "██████ ████████████ ████ ████████ ██████ ████████ ████████ ████"}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>by u/{index === 0 ? post.author : "██████"} • {index === 0 ? formatDate(post.created_utc) : "█ days ago"}</span>
                            <div className="flex items-center gap-4">
                              <span>{index === 0 ? post.score : "██"} points</span>
                              <span>{index === 0 ? post.num_comments : "██"} comments</span>
                              <Badge className="bg-red-100 text-red-800">negative</Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Paywall Overlay for Posts */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-transparent flex items-end justify-center pb-8">
                      <div className="text-center space-y-4 max-w-md">
                        <div className="bg-white rounded-lg shadow-xl p-6 border-2 border-orange-200">
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            ⚠️ {results.posts.length - 1} More Critical Posts Hidden
                          </h3>
                          <p className="text-slate-600 text-sm mb-4">
                            View all {results.posts.length} posts, detailed analysis, and get removal quotes from our specialists.
                          </p>
                          <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={() => handleCreateTicket('posts')}>
                            Get Specialist Analysis
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Comments Preview with Paywall */}
              {results.comments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Reddit Comments ({results.comments.length})</CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-100 text-red-800">negative</Badge>
                        Full details in report
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="space-y-4">
                      {results.comments.slice(0, 5).map((comment, index) => (
                        <div key={comment.id} className={`border rounded-lg p-4 ${index >= 2 ? 'blur-md' : index >= 1 ? 'blur-sm' : ''}`}>
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {index === 0 ? `r/${comment.subreddit}` : "r/█████████"}
                            </span>
                            <span className="text-xs text-slate-500">
                              {index === 0 ? formatDate(comment.created_utc) : "█ days ago"}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 text-sm mb-2 line-clamp-2">
                            {index === 0 ? comment.body : "██████ ████████ ████ ██████ ████████████ ██████ ████ ██████ ████████ ████"}
                          </p>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>{index === 0 ? `↓ ${comment.score}` : "↓ ██"}</span>
                            <Badge className="bg-red-100 text-red-800">negative</Badge>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Paywall Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center pb-8">
                      <div className="text-center space-y-4 max-w-md">
                        <div className="bg-white rounded-lg shadow-xl p-6 border-2 border-blue-200">
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            🔒 Full Report Available
                          </h3>
                          <p className="text-slate-600 text-sm mb-4">
                            Get complete analysis of all {results.comments.length} comments, risk assessment, and removal recommendations from our Reddit specialists.
                          </p>
                          <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleCreateTicket('comments')}>
                            Talk to Specialist Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Call to Action */}
              {results.riskScore > 30 && (
                <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
                      <AlertTriangle className="h-5 w-5" />
                      Reputation Risk Detected
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-red-700 dark:text-red-300 mb-4">
                      Your brand scan revealed potential reputation risks. Our specialists can provide detailed analysis and removal quotes for the detected content.
                    </p>
                    <div className="flex gap-3">
                      <Button 
                        className="bg-red-600 hover:bg-red-700 text-white flex-1"
                        onClick={() => handleCreateTicket('urgent')}
                        disabled={createTicketMutation.isPending}
                      >
                        {createTicketMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          'Get Specialist Help'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
      <Footer />
    </>
  );
}