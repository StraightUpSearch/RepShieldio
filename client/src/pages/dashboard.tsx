import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Clock, CheckCircle, AlertCircle, FileText, Calendar, DollarSign, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SEOHead from "@/components/seo-head";
import Checkout from "@/components/checkout";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cases, isLoading } = useQuery<RemovalCase[]>({
    queryKey: ['/api/user/cases'],
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

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
              
              {cases && cases.length > 0 ? (
                <div className="grid gap-4">
                  {cases.map((case_) => (
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

                        <div className="flex justify-end mt-4">
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
                    <Button onClick={() => window.location.href = '/#analyzer'}>
                      Analyze Reddit URL
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}