import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  CreditCard,
  FileText,
  Settings,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  RefreshCw,
  Search,
  Loader2,
  ShoppingCart,
  MessageCircle,
  Send,
} from "lucide-react";

interface Order {
  id: string;
  ticketId: string;
  redditUrl: string;
  clientEmail: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  specialistReply: string;
  timestamp: string;
  type?: string;
  amount?: number;
  progress?: number;
  specialist?: string;
  createdAt?: string;
}

interface AccountStats {
  totalOrders: number;
  successfulRemovals: number;
  accountBalance: number;
  creditsRemaining: number;
}

interface TicketMessage {
  id: number;
  ticketId: number;
  senderId: string | null;
  senderRole: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
}

function TicketThread({ ticketId }: { ticketId: number }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useQuery<TicketMessage[]>({
    queryKey: [`/api/tickets/${ticketId}/messages`],
    refetchInterval: 15000,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const sendMessage = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/tickets/${ticketId}/messages`, {
        message: replyText.trim(),
      });
    },
    onSuccess: () => {
      setReplyText("");
      queryClient.invalidateQueries({ queryKey: [`/api/tickets/${ticketId}/messages`] });
    },
    onError: () => {
      toast({ title: "Failed to send", description: "Please try again.", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-3 pt-2">
      <p className="text-sm font-medium flex items-center gap-2 text-gray-700">
        <MessageCircle className="w-4 h-4" />
        Messages from our team
        {messages.length > 0 && (
          <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">{messages.length}</span>
        )}
      </p>

      {messages.length === 0 ? (
        <p className="text-sm text-gray-400 italic bg-gray-50 rounded-lg p-3">
          No messages yet — our team will be in touch soon.
        </p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {messages.map((msg) => {
            const isAdmin = msg.senderRole === "admin";
            return (
              <div key={msg.id} className={`flex ${isAdmin ? "" : "justify-end"}`}>
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  isAdmin ? "bg-gray-100 text-gray-800" : "bg-gray-900 text-white"
                }`}>
                  {isAdmin && (
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">RepShield Team</p>
                  )}
                  <p className="leading-relaxed">{msg.message}</p>
                  <p className={`text-[10px] mt-1 ${isAdmin ? "text-gray-400" : "text-gray-400"}`}>
                    {new Date(msg.createdAt).toLocaleString("en-GB", {
                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="flex gap-2">
        <Textarea
          placeholder="Reply to our team..."
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          rows={2}
          className="resize-none text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && replyText.trim()) {
              sendMessage.mutate();
            }
          }}
        />
        <Button
          onClick={() => sendMessage.mutate()}
          disabled={!replyText.trim() || sendMessage.isPending}
          className="shrink-0 self-end bg-gray-900 hover:bg-gray-800"
          size="sm"
        >
          {sendMessage.isPending ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

function WalletTab({ stats }: { stats: AccountStats }) {
  const { data: paymentStatus } = useQuery<any>({ queryKey: ['/api/payments/status'] });
  const { data: txnResponse } = useQuery<any>({ queryKey: ['/api/user/transactions'] });
  const { data: scanHistory } = useQuery<any>({ queryKey: ['/api/user/scan-history'] });

  const transactions = txnResponse?.data || [];
  const creditPackages = paymentStatus?.creditPackages || [];
  const stripeConfigured = paymentStatus?.stripeConfigured || false;

  const purchaseCredits = useMutation({
    mutationFn: async (packageId: string) => {
      const res = await apiRequest('POST', '/api/payments/create-credit-purchase', { packageId });
      return await res.json();
    },
    onSuccess: (data: any) => {
      if (data.url) window.location.href = data.url;
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Balance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-green-600">${stats.accountBalance}</div>
            <p className="text-gray-600">Available for new orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scan Credits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-blue-600">{stats.creditsRemaining}</div>
            <p className="text-gray-600">Credits remaining</p>
          </CardContent>
        </Card>
      </div>

      {/* Credit Packages */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Scan Credits</CardTitle>
          <p className="text-sm text-gray-600">Credits are used for self-serve brand scans. They never expire.</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(creditPackages.length > 0 ? creditPackages : [
              { id: 'credits_10', credits: 10, price: 4900, label: '10 Scan Credits', description: 'Best for occasional monitoring' },
              { id: 'credits_25', credits: 25, price: 9900, label: '25 Scan Credits', description: 'Most popular — save 20%' },
              { id: 'credits_100', credits: 100, price: 29900, label: '100 Scan Credits', description: 'Best value — save 40%' },
            ]).map((pkg: any) => (
              <div key={pkg.id} className={`border rounded-xl p-5 text-center space-y-2 transition-colors ${pkg.id === 'credits_25' ? 'border-gray-950 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <p className="font-satoshi font-black text-gray-950 tracking-[-0.02em]">{pkg.label}</p>
                <p className="font-satoshi text-2xl font-black text-gray-950 tracking-[-0.03em]">${(pkg.price / 100).toFixed(0)}</p>
                <p className="text-xs text-gray-500">{pkg.description}</p>
                <Button
                  onClick={() => purchaseCredits.mutate(pkg.id)}
                  disabled={!stripeConfigured || purchaseCredits.isPending}
                  className={`w-full ${pkg.id === 'credits_25' ? 'bg-gray-950 hover:bg-gray-800 text-white' : ''}`}
                  variant={pkg.id === 'credits_25' ? 'default' : 'outline'}
                >
                  {purchaseCredits.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-4 h-4 mr-2" />
                  )}
                  {stripeConfigured ? 'Purchase' : 'Coming Soon'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scan History */}
      {(scanHistory?.data?.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Recent Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scanHistory.data.slice(0, 10).map((scan: any) => (
                <div key={scan.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{scan.brandName}</p>
                    <p className="text-sm text-gray-500">
                      {scan.scanType} scan &middot; {new Date(scan.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={
                      scan.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                      scan.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }>
                      {scan.riskLevel || 'N/A'}
                    </Badge>
                    <p className="text-sm text-gray-500">{scan.totalMentions} mentions</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No transactions yet.</p>
            ) : (
              transactions.map((txn: any) => (
                <div key={txn.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{txn.description || txn.type}</p>
                    <p className="text-sm text-gray-500">{new Date(txn.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={parseFloat(txn.amount) >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {parseFloat(txn.amount) >= 0 ? '+' : ''}{txn.amount}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MyAccount() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [, setLocation] = useLocation();
  const [payingTicket, setPayingTicket] = useState<number | null>(null);

  const handleTicketPayment = async (ticketId: number) => {
    if (!user?.email) return;
    setPayingTicket(ticketId);
    try {
      const res = await fetch('/api/payments/checkout-guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, email: user.email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({ title: 'Payment unavailable', description: data.message ?? 'Please contact support.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Could not start payment. Try again.', variant: 'destructive' });
    } finally {
      setPayingTicket(null);
    }
  };

  // Fetch real user stats — must be called before any conditional returns (React hooks rules)
  const { data: statsResponse, isLoading: statsLoading } = useQuery<any>({
    queryKey: ['/api/user/stats'],
    enabled: !!user,
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/user/stats");
        return await res.json();
      } catch {
        return null;
      }
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  // Get tickets from user data (if available)
  const tickets = (user as any)?.tickets || [];

  const stats: AccountStats = statsResponse?.data || {
    totalOrders: tickets.length,
    successfulRemovals: tickets.filter((t: any) => t.status === 'completed').length,
    accountBalance: 0,
    creditsRemaining: 0
  };

  // Show loading while checking authentication
  if (isLoading || (!isAuthenticated && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'approved': return <CreditCard className="w-4 h-4 text-indigo-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-indigo-100 text-indigo-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-satoshi text-3xl font-black text-gray-950 tracking-[-0.03em]">
            {user?.firstName ? `Welcome back, ${user.firstName}` : 'My Account'}
          </h1>
          <p className="text-gray-500 mt-1">Manage your Reddit removal cases and account settings</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              My Tickets
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">All time orders</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Successful Removals</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.successfulRemovals}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalOrders > 0 ? Math.round((stats.successfulRemovals / stats.totalOrders) * 100) : 0}% success rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.accountBalance}</div>
                  <p className="text-xs text-muted-foreground">Available funds</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Credits</CardTitle>
                  <CreditCard className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.creditsRemaining}</div>
                  <p className="text-xs text-muted-foreground">Credits remaining</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tickets.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No tickets yet. Submit a quote request to get started.</p>
                    </div>
                  ) : (
                    tickets.slice(0, 3).map((ticket) => (
                      <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(ticket.status)}
                          <div>
                            <p className="font-medium">Ticket {ticket.ticketId}</p>
                            <p className="text-sm text-gray-500">{ticket.timestamp}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {tickets.length > 0 && (
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab("orders")}
                      className="w-full"
                    >
                      View All Tickets
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Tickets</CardTitle>
                <p className="text-sm text-gray-600">Track all your Reddit removal requests</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tickets.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No tickets found. Submit a quote request to get started.</p>
                    </div>
                  ) : (
                    tickets.map((ticket) => (
                      <div key={ticket.id} className="border rounded-lg p-6 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(ticket.status)}
                              <h3 className="font-semibold">Ticket {ticket.ticketId}</h3>
                              <Badge className={getStatusColor(ticket.status)}>
                                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">Submitted {ticket.timestamp}</p>
                          </div>
                          <div className="text-right space-y-2">
                            {ticket.redditUrl && (
                              <Button variant="outline" size="sm" className="mt-2" onClick={() => window.open(ticket.redditUrl, '_blank')}>
                                <Eye className="w-4 h-4 mr-2" />
                                View on Reddit
                              </Button>
                            )}
                            {ticket.status === 'approved' && (ticket as any).amount && (
                              <Button
                                size="sm"
                                className="bg-gray-950 hover:bg-gray-800 text-white w-full mt-2"
                                onClick={() => handleTicketPayment(ticket.id)}
                                disabled={payingTicket === ticket.id}
                              >
                                {payingTicket === ticket.id ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Pay ${(ticket as any).amount}
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Reddit URL:</p>
                          <p className="text-sm text-blue-600 break-all">{ticket.redditUrl}</p>
                        </div>

                        <TicketThread ticketId={ticket.id} />
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <WalletTab stats={stats} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-gray-600">{user?.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <p className="text-gray-600">{user?.firstName ? `${user.firstName} ${user?.lastName || ''}`.trim() : 'Not set'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-600">You'll receive email updates for all ticket status changes</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full justify-start" onClick={() => setLocation('/reset-password')}>
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
      <Footer />
    </>
  );
}