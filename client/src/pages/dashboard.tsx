import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Clock, CheckCircle, AlertCircle, FileText, Calendar, DollarSign, CreditCard, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SEOHead from "@/components/seo-head";
import Checkout from "@/components/checkout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

interface RemovalCase {
  id: number;
  redditUrl: string;
  status: 'analyzing' | 'quoted' | 'approved' | 'in_progress' | 'completed' | 'failed';
  estimatedPrice: string;
  description: string;
  createdAt: string;
  completedAt?: string;
  progress: number;
  updates: CaseUpdate[];
  specialist?: {
    name: string;
    title: string;
    avatar: string;
    experience: string;
    specialties: string[];
    successRate: string;
    bio: string;
  };
}

interface CaseUpdate {
  id: number;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export default function Dashboard() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const caseId = urlParams.get('case');
  const [checkoutCase, setCheckoutCase] = useState<RemovalCase | null>(null);
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [redditUrl, setRedditUrl] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: cases, isLoading } = useQuery<RemovalCase[]>({
    queryKey: ['/api/user/cases'],
  });

  const analyzeUrlMutation = useMutation({
    mutationFn: async ({ redditUrl, email }: { redditUrl: string; email: string }) => {
      const response = await apiRequest('POST', '/api/analyze-and-create-account', {
        redditUrl,
        email
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "URL Analyzed Successfully",
        description: `Case #${data.caseId} created. Estimated cost: ${data.analysis.estimatedPrice}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/cases'] });
      setShowUrlDialog(false);
      setRedditUrl('');
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { data: activeCase } = useQuery<RemovalCase>({
    queryKey: ['/api/user/cases', caseId],
    enabled: !!caseId,
  });

  const handlePaymentSuccess = () => {
    setCheckoutCase(null);
    queryClient.invalidateQueries({ queryKey: ['/api/user/cases'] });
    toast({
      title: "Payment Successful",
      description: "Your removal case has been approved and will begin processing immediately.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      case 'analyzing': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!redditUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a Reddit URL to analyze.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.email) {
      toast({
        title: "Authentication Required",
        description: "Please log in to analyze URLs.",
        variant: "destructive",
      });
      return;
    }

    analyzeUrlMutation.mutate({
      redditUrl: redditUrl.trim(),
      email: user.email
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Fallback to empty array if cases is undefined
  const safeCases = cases || [];

  return (
    <>
      <SEOHead
        title="Dashboard - Track Your Reddit Removal Cases | RepShield"
        description="Monitor the progress of your Reddit content removal cases with real-time updates and detailed tracking."
        keywords="reddit removal dashboard, case tracking, content removal progress"
      />
      
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Removal Dashboard</h1>
              <p className="text-gray-600 mt-2">Track your Reddit content removal cases and progress</p>
            </div>

            {/* Active Case Highlight */}
            {activeCase && (
              <Card className="mb-8 border-blue-200 bg-blue-50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Case #{activeCase.id} - Active
                    </CardTitle>
                    <Badge className={`${getStatusColor(activeCase.status)} flex items-center gap-1`}>
                      {getStatusIcon(activeCase.status)}
                      {formatStatus(activeCase.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Target URL:</p>
                      <p className="font-medium break-all">{activeCase.redditUrl}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Description:</p>
                      <p>{activeCase.description}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Estimated Cost</p>
                        <p className="text-lg font-semibold text-green-600">{activeCase.estimatedPrice}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Progress</p>
                        <div className="flex items-center gap-2">
                          <Progress value={activeCase.progress} className="flex-1" />
                          <span className="text-sm font-medium">{activeCase.progress}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Created</p>
                        <p className="font-medium">{new Date(activeCase.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {activeCase.status === 'quoted' && (
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-semibold mb-2">Ready to Approve</h4>
                        <p className="text-gray-600 mb-4">Your removal strategy is ready. Approve to begin the removal process.</p>
                        <div className="flex gap-3">
                          <Button 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => setCheckoutCase(activeCase)}
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay {activeCase.estimatedPrice} & Start Removal
                          </Button>
                          <Button variant="outline">View Details</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Cases */}
            <div className="grid gap-6">
              <h2 className="text-xl font-semibold">All Cases</h2>
              
              {safeCases && safeCases.length > 0 ? (
                <div className="grid gap-4">
                  {safeCases.map((case_) => (
                    <Card key={case_.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">Case #{case_.id}</h3>
                              <Badge className={`${getStatusColor(case_.status)} flex items-center gap-1`}>
                                {getStatusIcon(case_.status)}
                                {formatStatus(case_.status)}
                              </Badge>
                            </div>
                            <p className="text-gray-600 break-all text-sm">{case_.redditUrl}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">{case_.estimatedPrice}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(case_.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-gray-600">Progress</span>
                              <span className="text-sm font-medium">{case_.progress}%</span>
                            </div>
                            <Progress value={case_.progress} className="h-2" />
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4">{case_.description}</p>

                        {/* Assigned Specialist */}
                        {case_.specialist && (
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                            <div className="flex items-start gap-3">
                              <img 
                                src={case_.specialist.avatar} 
                                alt={case_.specialist.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-blue-300"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-blue-900 text-sm">{case_.specialist.name}</h4>
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                    {case_.specialist.successRate} Success
                                  </Badge>
                                </div>
                                <p className="text-blue-700 font-medium text-xs mb-1">{case_.specialist.title}</p>
                                <p className="text-blue-600 text-xs">{case_.specialist.experience}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {case_.updates && case_.updates.length > 0 && (
                          <div className="border-t pt-4">
                            <h4 className="font-medium mb-2">Latest Update</h4>
                            <div className="flex items-start gap-2">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                case_.updates[0].type === 'success' ? 'bg-green-500' :
                                case_.updates[0].type === 'warning' ? 'bg-yellow-500' :
                                case_.updates[0].type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                              }`}></div>
                              <div className="flex-1">
                                <p className="text-sm">{case_.updates[0].message}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(case_.updates[0].timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end gap-2 mt-4">
                          {case_.status === 'quoted' && (
                            <Button 
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => setCheckoutCase(case_)}
                            >
                              <CreditCard className="w-4 h-4 mr-2" />
                              Pay {case_.estimatedPrice}
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No cases yet</h3>
                    <p className="text-gray-600 mb-6">Submit a Reddit URL for analysis to get started</p>
                    <Button onClick={() => setShowUrlDialog(true)}>
                      Analyze Reddit URL
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>

        <Footer />

        {/* URL Analysis Dialog */}
        <Dialog open={showUrlDialog} onOpenChange={setShowUrlDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Analyze Reddit URL
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reddit-url">Reddit URL</Label>
                <Input
                  id="reddit-url"
                  type="url"
                  placeholder="https://reddit.com/r/..."
                  value={redditUrl}
                  onChange={(e) => setRedditUrl(e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500">
                  Enter the full URL of the Reddit post, comment, or thread you want analyzed
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowUrlDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={analyzeUrlMutation.isPending}
                  className="flex-1"
                >
                  {analyzeUrlMutation.isPending ? "Analyzing..." : "Analyze URL"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Checkout Dialog */}
        <Dialog open={!!checkoutCase} onOpenChange={() => setCheckoutCase(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Complete Payment</DialogTitle>
            </DialogHeader>
            {checkoutCase && (
              <Checkout
                caseId={checkoutCase.id}
                amount={checkoutCase.estimatedPrice}
                description={checkoutCase.description}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setCheckoutCase(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}