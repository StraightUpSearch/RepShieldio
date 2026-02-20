import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, AlertTriangle, CheckCircle, Clock, User, ArrowRight, Shield, Eye, Phone, Mail, ExternalLink } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SmartRecaptcha, useSpamDetection } from "./smart-recaptcha";
import { SEOMetaTags, StructuredData } from "./structured-data";

interface ScanStep {
  step: 'input' | 'scanning' | 'results' | 'ticket' | 'confirmed';
}

interface TicketForm {
  name: string;
  email: string;
  phone?: string;
  company: string;
  brandName: string;
  leadType: 'premium' | 'standard';
}

interface MentionPreview {
  subreddit: string;
  timeAgo: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  previewText: string;
  url: string;
  score: number;
  platform?: string;
}

export default function BrandScanner() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<ScanStep['step']>('input');
  const [brandName, setBrandName] = useState("");
  const [scanResults, setScanResults] = useState<any>(null);
  const [createdTicket, setCreatedTicket] = useState<any>(null); // Store actual ticket response
  const [ticketForm, setTicketForm] = useState<TicketForm>({
    name: "",
    email: "",
    phone: "",
    company: "",
    brandName: "",
    leadType: 'premium'
  });
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [mouseMovements, setMouseMovements] = useState(0);
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');
  const [recentSubmissions, setRecentSubmissions] = useState(0);
  
  const { isSpammy, reason, checkForSpam } = useSpamDetection();

  useEffect(() => {
    // Track mouse movements for spam detection
    const handleMouseMove = () => setMouseMovements(prev => prev + 1);
    document.addEventListener('mousemove', handleMouseMove);
    
    // Track form start time
    setStartTime(Date.now());
    
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scanBrand = useMutation({
    mutationFn: async (brandName: string) => {
      // Check for spam before scanning
      const spamCheck = checkForSpam(
        { brandName, email: '', company: '' },
        {
          submissionTime: Date.now() - startTime,
          recentSubmissions,
          mouseMovements
        }
      );

      if (spamCheck.isSpammy && !recaptchaToken) {
        throw new Error('SPAM_DETECTED');
      }

      // Use optimized live scanner for quick initial scan
      const response = await apiRequest("POST", "/api/live-scan", {
        brandName,
        platforms: ['reddit'],
        recaptchaToken: recaptchaToken || null
      });

      return await response.json();
    },
    onSuccess: (response: any) => {
      setScanResults({
        totalMentions: response.totalMentions,
        posts: response.platforms.reddit.posts,
        comments: response.platforms.reddit.comments,
        riskLevel: response.riskLevel,
        nextSteps: response.nextSteps,
        scanId: response.scanId,
        previewMentions: response.previewMentions || []
      });
      setCurrentStep('results');
      setRecentSubmissions(prev => prev + 1);
      
      // Show scan insights
      toast({
        title: `🔍 Scan Complete`,
        description: `Risk Level: ${response.riskLevel.toUpperCase()} • Processing time: ${response.processingTime}ms`,
      });
    },
    onError: (error: any) => {
      if (error.message === 'SPAM_DETECTED') {
        toast({
          title: "Security Check Required",
          description: "Please complete the verification to continue.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Scan Failed",
          description: "Unable to complete live scan. Please try again.",
          variant: "destructive",
        });
      }
      setCurrentStep('input');
    }
  });

  const submitTicket = useMutation({
    mutationFn: async (data: TicketForm) => {
      // Check for spam before submitting
      const spamCheck = checkForSpam(
        data,
        {
          submissionTime: Date.now() - startTime,
          recentSubmissions,
          mouseMovements
        }
      );

      if (spamCheck.isSpammy && !recaptchaToken) {
        throw new Error('SPAM_DETECTED');
      }

      return await apiRequest("POST", "/api/brand-scan-ticket", {
        ...data,
        scanResults: scanResults,
        recaptchaToken: recaptchaToken || null
      });
    },
    onSuccess: async (response) => {
      const responseData = await response.json();
      setCreatedTicket(responseData); // Store the actual ticket response
      setCurrentStep('confirmed');
      toast({
        title: "Account Created Successfully!",
        description: "Welcome to RepShield! Jamie will contact you within 2 hours with your detailed analysis.",
      });
    },
    onError: (error: any) => {
      if (error.message === 'SPAM_DETECTED') {
        toast({
          title: "Security Check Required",
          description: "Please complete the verification to continue.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account Creation Failed",
          description: "Please try again or contact us directly.",
          variant: "destructive",
        });
      }
    }
  });

  const handleInitialScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) {
      toast({
        title: "Brand Name Required",
        description: "Please enter your brand or company name.",
        variant: "destructive",
      });
      return;
    }

    // Check daily scan limit for non-authenticated users
    const today = new Date().toDateString();
    const lastScan = localStorage.getItem('lastScanDate');
    const scanCount = parseInt(localStorage.getItem('dailyScanCount') || '0');

    if (lastScan === today && scanCount >= 1) {
      toast({
        title: "Daily Limit Reached",
        description: "Create a free account to unlock unlimited scans and detailed reports.",
        variant: "destructive",
      });
      setCurrentStep('ticket'); // Direct to account creation
      return;
    }

    setCurrentStep('scanning');

    // Update scan tracking
    localStorage.setItem('lastScanDate', today);
    localStorage.setItem('dailyScanCount', lastScan === today ? (scanCount + 1).toString() : '1');

    // Use real live scan API — no fake data
    setTicketForm(prev => ({ ...prev, brandName }));
    scanBrand.mutate(brandName);
  };

  const handleComprehensiveScan = async () => {
    if (!brandName) {
      toast({
        title: "Brand Name Required",
        description: "Please enter a brand name first.",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentStep('ticket');
    setTicketForm(prev => ({ ...prev, leadType: 'premium', brandName }));
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.name || !ticketForm.email || !ticketForm.company) {
      toast({
        title: "All Fields Required",
        description: "Please complete all fields to create your analysis ticket.",
        variant: "destructive",
      });
      return;
    }
    
    // For premium leads, trigger comprehensive scan
    if (ticketForm.leadType === 'premium') {
      comprehensiveScan.mutate({
        brandName: ticketForm.brandName,
        userEmail: ticketForm.email,
        userName: ticketForm.name,
        company: ticketForm.company
      });
    } else {
      submitTicket.mutate(ticketForm);
    }
  };

  const comprehensiveScan = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/comprehensive-scan", {
        brandName: data.brandName,
        userEmail: data.userEmail,
        platforms: ['reddit', 'web']
      });
      const scanData = await response.json();

      // Also submit the ticket with comprehensive scan results
      const ticketResponse = await apiRequest("POST", "/api/brand-scan-ticket", {
        brandName: data.brandName,
        userEmail: data.userEmail,
        userName: data.userName,
        company: data.company,
        scanResults: JSON.stringify(scanData),
        leadType: 'premium'
      });
      const ticketData = await ticketResponse.json();

      return { scan: scanData, ticket: ticketData };
    },
    onSuccess: (data) => {
      setCurrentStep('confirmed');
      toast({
        title: "🚀 Comprehensive Analysis Started",
        description: `Specialist ticket #${data.ticket.id} created. Full analysis will be delivered within 2 hours.`,
      });
    },
    onError: () => {
      toast({
        title: "Analysis Requested",
        description: "Your comprehensive analysis request has been received. A specialist will contact you shortly.",
      });
      setCurrentStep('confirmed');
    }
  });

  const renderInputStep = () => (
    <div className="text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-reddit-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="h-8 w-8 text-reddit-orange" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Free Brand Mention Scan</h3>
        <p className="text-gray-600">
          See what people are saying about your brand on Reddit right now
        </p>
      </div>
      
      <form onSubmit={handleInitialScan} className="space-y-4">
        <label htmlFor="brand-scan-input" className="sr-only">Brand or company name</label>
        <Input
          id="brand-scan-input"
          type="text"
          placeholder="Enter your brand or company name"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          className="text-lg h-14 focus:ring-2 focus:ring-reddit-orange focus:border-reddit-orange"
        />
        <Button 
          type="submit"
          size="lg"
          className="bg-reddit-orange text-white hover:bg-red-600 w-full h-14 text-lg font-semibold"
        >
          <Search className="w-5 h-5 mr-2" />
          Start Free Scan
        </Button>
      </form>
      
      <p className="text-sm text-gray-500 mt-4">
        ✓ Instant results • ✓ No signup required • ✓ 100% confidential
      </p>
    </div>
  );

  const renderScanningStep = () => (
    <div className="text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-reddit-orange/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Search className="h-8 w-8 text-reddit-orange animate-spin" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Scanning Multiple Platforms for "{brandName}"</h3>
        <p className="text-gray-600 mb-4">
          Analyzing Reddit, review sites, social media, and news sources...
        </p>
      </div>
      
      <div className="space-y-3 text-left max-w-md mx-auto">
        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800">Scanning subreddits... Complete</span>
        </div>
        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800">Analyzing sentiment... Complete</span>
        </div>
        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg animate-pulse">
          <Clock className="h-5 w-5 text-blue-600 animate-spin" />
          <span className="text-blue-800">Identifying issues... In Progress</span>
        </div>
      </div>
    </div>
  );

  const renderResultsStep = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center px-3 py-1 sm:px-4 sm:py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
          <CheckCircle className="h-4 w-4 mr-2" />
          Scan Complete
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
          Found {scanResults?.totalMentions} Brand Mentions
        </h3>
        <p className="text-slate-600 text-sm sm:text-base px-4">
          {scanResults?.riskLevel === 'high' ? 
            'Critical issues detected that require immediate attention' :
            scanResults?.riskLevel === 'medium' ? 
            'Some concerning mentions found that should be addressed' :
            'Your brand has visibility on Reddit - see what people are saying'
          }
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card className="p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-3xl font-bold text-blue-600">{scanResults?.posts}</div>
          <div className="text-xs sm:text-sm text-slate-600">Posts</div>
        </Card>
        <Card className="p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-3xl font-bold text-purple-600">{scanResults?.comments}</div>
          <div className="text-xs sm:text-sm text-slate-600">Comments</div>
        </Card>
        <Card className="p-3 sm:p-4 text-center">
          <div className={`text-xl sm:text-3xl font-bold ${
            scanResults?.riskLevel === 'high' ? 'text-red-600' : 
            scanResults?.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {scanResults?.riskLevel === 'high' ? 'HIGH' : 
             scanResults?.riskLevel === 'medium' ? 'MED' : 'LOW'}
          </div>
          <div className="text-xs sm:text-sm text-slate-600">Risk</div>
        </Card>
      </div>

      {/* Preview mentions with strategic blurring */}
      <div className="bg-slate-50 rounded-lg p-4 sm:p-6">
        <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2 text-sm sm:text-base">
          <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
          Recent Mentions Preview
        </h4>
        <div className="space-y-3">
          {scanResults?.previewMentions?.map((mention: MentionPreview, index: number) => (
            <div key={index} className="bg-white rounded-lg p-3 sm:p-4 border relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                  <span className="font-medium">r/{mention.subreddit}</span>
                  <span>•</span>
                  <span>{mention.timeAgo}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    {mention.score > 0 ? '↑' : '↓'} {Math.abs(mention.score)}
                  </span>
                </div>
                <Badge 
                  variant={mention.sentiment === 'negative' ? 'destructive' : 'secondary'}
                  className="text-xs w-fit"
                >
                  {mention.sentiment}
                </Badge>
              </div>
              <div className="relative">
                <p className="text-xs sm:text-sm text-slate-700 line-clamp-2 leading-relaxed">
                  {mention.previewText}...
                </p>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-white backdrop-blur-[2px] flex items-center justify-center">
                  <span className="text-xs font-medium text-slate-600 bg-white/90 px-2 py-1 rounded-full border shadow-sm">
                    🔒 Full details in report
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-xs text-gray-500">
                  {mention.platform === 'Reddit' 
                    ? `https://reddit.com/r/${mention.subreddit}/comments/*****/******`
                    : `${mention.platform?.toLowerCase()}.com/*****/******`
                  }
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-4">
          <p className="text-xs sm:text-sm text-slate-600 mb-2 leading-relaxed">
            This is just a preview - full detailed analysis includes sentiment scoring, 
            user influence metrics, and removal recommendations.
          </p>
        </div>
      </div>

      {/* Multiple lead capture options */}
      <div className="space-y-3">
        <Button 
          onClick={() => handleComprehensiveScan()}
          size="lg"
          className="bg-reddit-orange text-white hover:bg-red-600 w-full h-12 sm:h-14 text-sm sm:text-lg font-semibold"
        >
          <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Get Full Professional Analysis
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
        </Button>
        
        <Button 
          onClick={() => { setTicketForm(prev => ({ ...prev, leadType: 'standard' })); setCurrentStep('ticket'); }}
          variant="outline"
          size="lg"
          className="w-full h-10 sm:h-12 text-sm sm:text-base border-2 hover:bg-slate-50"
        >
          <Phone className="w-4 h-4 mr-2" />
          Quick Phone Consultation
        </Button>
        
        <p className="text-xs sm:text-sm text-gray-500 text-center px-4">
          Professional analysis delivered within 2 hours • 100% confidential
        </p>
      </div>
    </div>
  );

  const renderTicketStep = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold mb-2">Almost Done! Creating Your Specialist Ticket</h3>
        <p className="text-gray-600 text-sm sm:text-base px-4">
          {ticketForm.leadType === 'premium' 
            ? 'A qualified reputation specialist will analyze your full results and provide a detailed removal strategy'
            : 'Connect with a specialist for a quick consultation about your brand mentions'
          }
        </p>
      </div>

      <form onSubmit={handleTicketSubmit} className="space-y-4">
        {ticketForm.leadType === 'premium' ? (
          // Premium lead form (business email required)
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ticket-name" className="sr-only">Your full name</label>
                <Input
                  id="ticket-name"
                  type="text"
                  placeholder="Your Full Name *"
                  value={ticketForm.name}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="focus:ring-2 focus:ring-reddit-orange focus:border-reddit-orange h-12"
                />
              </div>
              <div>
                <label htmlFor="ticket-email" className="sr-only">Business email</label>
                <Input
                  id="ticket-email"
                  type="email"
                  placeholder="Business Email *"
                  value={ticketForm.email}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="focus:ring-2 focus:ring-reddit-orange focus:border-reddit-orange h-12"
                />
              </div>
            </div>

            <div>
              <label htmlFor="ticket-company" className="sr-only">Company name</label>
              <Input
                id="ticket-company"
                type="text"
                placeholder="Company Name *"
                value={ticketForm.company}
                onChange={(e) => setTicketForm(prev => ({ ...prev, company: e.target.value }))}
                required
                className="focus:ring-2 focus:ring-reddit-orange focus:border-reddit-orange h-12"
              />
            </div>
          </>
        ) : (
          // Standard lead form (phone or email, more flexible)
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ticket-name-std" className="sr-only">Your name</label>
                <Input
                  id="ticket-name-std"
                  type="text"
                  placeholder="Your Name *"
                  value={ticketForm.name}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="focus:ring-2 focus:ring-reddit-orange focus:border-reddit-orange h-12"
                />
              </div>
              <div>
                <label htmlFor="ticket-phone" className="sr-only">Phone number</label>
                <Input
                  id="ticket-phone"
                  type="tel"
                  placeholder="Phone Number *"
                  value={ticketForm.phone || ''}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, phone: e.target.value }))}
                  required
                  className="focus:ring-2 focus:ring-reddit-orange focus:border-reddit-orange h-12"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ticket-email-std" className="sr-only">Email (optional)</label>
                <Input
                  id="ticket-email-std"
                  type="email"
                  placeholder="Email (optional)"
                  value={ticketForm.email}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, email: e.target.value }))}
                  className="focus:ring-2 focus:ring-reddit-orange focus:border-reddit-orange h-12"
                />
              </div>
              <div>
                <label htmlFor="ticket-company-std" className="sr-only">Company or brand name</label>
                <Input
                  id="ticket-company-std"
                  type="text"
                  placeholder="Company/Brand Name"
                  value={ticketForm.company}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, company: e.target.value }))}
                  className="focus:ring-2 focus:ring-reddit-orange focus:border-reddit-orange h-12"
                />
              </div>
            </div>
          </>
        )}
        
        <Button 
          type="submit"
          disabled={submitTicket.isPending}
          size="lg"
          className="bg-reddit-orange text-white hover:bg-red-600 w-full h-12 sm:h-14 text-sm sm:text-lg font-semibold"
        >
          {submitTicket.isPending ? "Creating Ticket..." : 
           ticketForm.leadType === 'premium' ? "Create My Specialist Ticket" : "Request Quick Consultation"}
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
        </Button>
      </form>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5" />
          <div className="text-xs sm:text-sm text-blue-800">
            <strong>What happens next:</strong><br />
            {ticketForm.leadType === 'premium' ? (
              <>
                • Specialist assigned within 15 minutes<br />
                • Full detailed analysis delivered in 2 hours<br />
                • Custom removal strategy + exact pricing<br />
                • 100% confidential consultation
              </>
            ) : (
              <>
                • Quick phone consultation within 1 hour<br />
                • Overview of your reputation status<br />
                • Recommendations for next steps<br />
                • No obligation discussion
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderConfirmedStep = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-2xl font-bold mb-2">✅ Specialist Ticket Created!</h3>
        <p className="text-gray-600 mb-4">
          Your brand analysis is now being processed by our reputation specialists
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="space-y-3 text-left">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800">
              Ticket #{createdTicket?.id ? `RM-${createdTicket.id}` : 'RM-PENDING'} created
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800">Specialist assigned: Senior Analyst</span>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="text-blue-800">Full analysis: Within 2 hours</span>
          </div>
        </div>
      </div>

      <div className="bg-reddit-orange/10 rounded-lg p-4">
        <p className="text-reddit-orange font-semibold">
          📧 Check your email ({ticketForm.email}) for your specialist's direct contact details
        </p>
      </div>

      {/* Enhanced User Flow - Account Creation & Next Steps */}
      <div className="space-y-4">
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-900 mb-3">🚀 What's Next?</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a 
              href="/my-account" 
              className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div>
                <p className="font-medium text-blue-900">My Account</p>
                <p className="text-sm text-blue-700">Track your ticket progress</p>
              </div>
              <ExternalLink className="h-4 w-4 text-blue-600" />
            </a>
            
            <a 
              href="/ticket-status" 
              className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div>
                <p className="font-medium text-green-900">Ticket Status</p>
                <p className="text-sm text-green-700">Check progress anytime</p>
              </div>
              <ExternalLink className="h-4 w-4 text-green-600" />
            </a>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">💡 Pro Tip:</p>
              <p>Create a free RepShield account to unlock unlimited brand monitoring, real-time alerts, and priority support.</p>
            </div>
          </div>
        </div>

        <Button 
          onClick={() => window.location.href = '/auth-page'} 
          variant="outline" 
          size="lg" 
          className="w-full border-2 border-reddit-orange text-reddit-orange hover:bg-reddit-orange hover:text-white"
        >
          <User className="w-4 h-4 mr-2" />
          Create Free RepShield Account
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  return (
    <section id="brand-scanner" className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {currentStep === 'input' && renderInputStep()}
          {currentStep === 'scanning' && renderScanningStep()}
          {currentStep === 'results' && renderResultsStep()}
          {currentStep === 'ticket' && renderTicketStep()}
          {currentStep === 'confirmed' && renderConfirmedStep()}
        </div>
      </div>
    </section>
  );
}