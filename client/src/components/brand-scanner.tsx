import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, AlertTriangle, CheckCircle, Clock, User, ArrowRight, Shield } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ScanStep {
  step: 'input' | 'scanning' | 'results' | 'ticket' | 'confirmed';
}

interface TicketForm {
  name: string;
  email: string;
  company: string;
  brandName: string;
}

export default function BrandScanner() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<ScanStep['step']>('input');
  const [brandName, setBrandName] = useState("");
  const [scanResults, setScanResults] = useState<any>(null);
  const [ticketForm, setTicketForm] = useState<TicketForm>({
    name: "",
    email: "",
    company: "",
    brandName: ""
  });

  const submitTicket = useMutation({
    mutationFn: async (data: TicketForm) => {
      return await apiRequest("POST", "/api/brand-scan-ticket", data);
    },
    onSuccess: (response) => {
      setCurrentStep('confirmed');
      toast({
        title: "Specialist Assigned!",
        description: "Your brand analysis ticket has been created. We'll contact you within 2 hours.",
      });
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
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

    setCurrentStep('scanning');
    
    // Simulate scanning process
    setTimeout(() => {
      setScanResults({
        totalMentions: Math.floor(Math.random() * 50) + 10,
        negativeMentions: Math.floor(Math.random() * 15) + 3,
        recentThreads: [
          { title: `Issues with ${brandName} customer service`, sentiment: 'negative', comments: 23 },
          { title: `${brandName} product quality concerns`, sentiment: 'negative', comments: 18 },
          { title: `Problems with ${brandName} billing`, sentiment: 'negative', comments: 31 }
        ]
      });
      setCurrentStep('results');
      setTicketForm(prev => ({ ...prev, brandName }));
    }, 3000);
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
    submitTicket.mutate(ticketForm);
  };

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
        <Input
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
        <h3 className="text-2xl font-bold mb-2">Scanning Reddit for "{brandName}"</h3>
        <p className="text-gray-600 mb-4">
          Analyzing thousands of posts and comments across Reddit...
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
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-2xl font-bold mb-2">⚠️ Issues Found for "{brandName}"</h3>
        <p className="text-gray-600">
          We found several mentions that could be damaging your reputation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{scanResults?.totalMentions}</div>
          <div className="text-sm text-gray-600">Total Mentions</div>
        </Card>
        <Card className="p-4 text-center border-red-200 bg-red-50">
          <div className="text-3xl font-bold text-red-600">{scanResults?.negativeMentions}</div>
          <div className="text-sm text-red-600">Negative Posts</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-reddit-orange">$2,697</div>
          <div className="text-sm text-gray-600">Removal Cost</div>
        </Card>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="font-semibold text-red-800 mb-3 flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Recent Problematic Threads (Preview)
        </h4>
        <div className="space-y-2">
          {scanResults?.recentThreads.slice(0, 2).map((thread: any, idx: number) => (
            <div key={idx} className="bg-white p-3 rounded border-l-4 border-red-400">
              <div className="font-medium text-gray-900">{thread.title}</div>
              <div className="text-sm text-gray-600">{thread.comments} comments • High visibility</div>
            </div>
          ))}
          <div className="bg-gray-100 p-3 rounded text-center">
            <span className="text-gray-600">+ {scanResults?.negativeMentions - 2} more issues found</span>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Button 
          onClick={() => setCurrentStep('ticket')}
          size="lg"
          className="bg-reddit-orange text-white hover:bg-red-600 w-full h-14 text-lg font-semibold"
        >
          Get Full Analysis + Removal Quote
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        <p className="text-sm text-gray-500 mt-2">
          Create your specialist ticket • Get detailed report within 2 hours
        </p>
      </div>
    </div>
  );

  const renderTicketStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Almost Done! Creating Your Specialist Ticket</h3>
        <p className="text-gray-600">
          A qualified reputation specialist will analyze your full results and provide a detailed removal strategy
        </p>
      </div>

      <form onSubmit={handleTicketSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            type="text"
            placeholder="Your Full Name *"
            value={ticketForm.name}
            onChange={(e) => setTicketForm(prev => ({ ...prev, name: e.target.value }))}
            required
            className="focus:ring-2 focus:ring-reddit-orange focus:border-reddit-orange"
          />
          <Input
            type="email"
            placeholder="Business Email *"
            value={ticketForm.email}
            onChange={(e) => setTicketForm(prev => ({ ...prev, email: e.target.value }))}
            required
            className="focus:ring-2 focus:ring-reddit-orange focus:border-reddit-orange"
          />
        </div>
        
        <Input
          type="text"
          placeholder="Company Name *"
          value={ticketForm.company}
          onChange={(e) => setTicketForm(prev => ({ ...prev, company: e.target.value }))}
          required
          className="focus:ring-2 focus:ring-reddit-orange focus:border-reddit-orange"
        />
        
        <Button 
          type="submit"
          disabled={submitTicket.isPending}
          size="lg"
          className="bg-reddit-orange text-white hover:bg-red-600 w-full h-14 text-lg font-semibold"
        >
          {submitTicket.isPending ? "Creating Ticket..." : "Create My Specialist Ticket"}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </form>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>What happens next:</strong><br />
            • Specialist assigned within 15 minutes<br />
            • Full detailed analysis delivered in 2 hours<br />
            • Custom removal strategy + exact pricing<br />
            • 100% confidential consultation
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
            <span className="text-green-800">Ticket #RM-{Date.now().toString().slice(-6)} created</span>
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