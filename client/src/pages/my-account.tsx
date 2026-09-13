import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useLocation, useSearch } from "wouter";
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
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

interface Order {
  id: number;
  ticketId: string;
  redditUrl: string;
  clientEmail: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'approved';
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

  // Mark as read whenever messages load
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`rs_last_read_${ticketId}`, new Date().toISOString());
    }
  }, [ticketId, messages.length]);

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
        Messages
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
                  <p className="text-[10px] mt-1 text-gray-400">
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
          placeholder="Reply to our team…"
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
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [readVersion, setReadVersion] = useState(0);
  const searchString = useSearch();
  const paymentParam = new URLSearchParams(searchString).get("payment");

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

  const handleSelectTicket = useCallback((id: number) => {
    setSelectedTicketId(id);
    setShowMobileDetail(true);
    localStorage.setItem(`rs_last_read_${id}`, new Date().toISOString());
    setReadVersion(v => v + 1);
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    if (tab === 'orders' && selectedTicketId) {
      localStorage.setItem(`rs_last_read_${selectedTicketId}`, new Date().toISOString());
      setReadVersion(v => v + 1);
    }
  }, [selectedTicketId]);

  // Fetch real user stats — must be called before any conditional returns (React hooks rules)
  const { data: statsResponse } = useQuery<any>({
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

  // Get tickets from user data
  const tickets: Order[] = (user as any)?.tickets || [];

  const stats: AccountStats = statsResponse?.data || {
    totalOrders: tickets.length,
    successfulRemovals: tickets.filter((t) => t.status === 'completed').length,
    accountBalance: 0,
    creditsRemaining: 0
  };

  // Parallel message fetches for all tickets (for unread badge computation)
  const ticketIds = useMemo(() => tickets.map((t) => t.id), [tickets]);

  const messageQueries = useQueries({
    queries: ticketIds.map((id) => ({
      queryKey: [`/api/tickets/${id}/messages`],
      enabled: !!user && ticketIds.length > 0,
      refetchInterval: 20000,
    })),
  });

  // Compute which tickets have unread admin messages
  const unreadTicketIds = useMemo(() => {
    const set = new Set<number>();
    ticketIds.forEach((id, i) => {
      // Don't count the currently-viewed ticket as unread
      if (id === selectedTicketId && activeTab === 'orders') return;
      const messages = (messageQueries[i]?.data as TicketMessage[]) ?? [];
      const lastRead = localStorage.getItem(`rs_last_read_${id}`);
      const adminMessages = messages.filter((m) => m.senderRole === 'admin' && !m.isInternal);
      if (adminMessages.length === 0) return;
      const hasNew = lastRead
        ? adminMessages.some((m) => new Date(m.createdAt) > new Date(lastRead))
        : true;
      if (hasNew) set.add(id);
    });
    return set;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageQueries, ticketIds, selectedTicketId, activeTab, readVersion]);

  const unreadCount = unreadTicketIds.size;

  // Auto-select first ticket when tickets load
  useEffect(() => {
    if (tickets.length > 0 && selectedTicketId === null) {
      setSelectedTicketId(tickets[0].id);
    }
  }, [tickets, selectedTicketId]);

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

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) ?? null;

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

          {/* Payment result banners */}
          {paymentParam === 'success' && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <p className="font-semibold text-green-800 text-sm">Payment confirmed — your case is now active.</p>
                <p className="text-sm text-green-700">We'll update the progress here as work proceeds.</p>
              </div>
            </div>
          )}
          {paymentParam === 'cancelled' && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0" />
              <div>
                <p className="font-semibold text-yellow-800 text-sm">Payment not completed.</p>
                <p className="text-sm text-yellow-700">Your quote is still available — use Pay Now on your ticket when ready.</p>
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2 relative">
                <FileText className="w-4 h-4" />
                My Tickets
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {unreadCount}
                  </span>
                )}
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

              {/* Recent Tickets */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  {tickets.length === 0 ? (
                    <div className="text-center py-10 space-y-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                        <FileText className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">No cases yet</p>
                        <p className="text-sm text-gray-500 mt-1">Submit a quote request and we'll review your Reddit content for removal.</p>
                      </div>
                      <Button
                        onClick={() => setLocation('/get-quote')}
                        className="bg-gray-950 hover:bg-gray-800 text-white"
                      >
                        Get a Free Quote
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tickets.slice(0, 3).map((ticket) => (
                        <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3 min-w-0">
                            {getStatusIcon(ticket.status)}
                            <div className="min-w-0">
                              <p className="font-medium truncate">Ticket {ticket.ticketId}</p>
                              <p className="text-sm text-gray-500">{ticket.timestamp}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-3">
                            <Badge className={getStatusColor(ticket.status)}>
                              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                            </Badge>
                            {ticket.status === 'approved' && ticket.amount && (
                              <Button
                                size="sm"
                                className="bg-gray-950 hover:bg-gray-800 text-white"
                                onClick={() => handleTicketPayment(ticket.id)}
                                disabled={payingTicket === ticket.id}
                              >
                                {payingTicket === ticket.id ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <><CreditCard className="w-3 h-3 mr-1" />Pay ${ticket.amount}</>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => handleTabChange("orders")}
                        className="w-full mt-2"
                      >
                        View All Tickets
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* My Tickets Tab — two-panel layout */}
            <TabsContent value="orders" className="space-y-0">
              {tickets.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-16 space-y-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <FileText className="w-7 h-7 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-lg">No tickets yet</p>
                      <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                        Once you submit a quote request, your cases will appear here so you can track progress and communicate with our team.
                      </p>
                    </div>
                    <Button
                      onClick={() => setLocation('/get-quote')}
                      className="bg-gray-950 hover:bg-gray-800 text-white"
                    >
                      Get a Free Quote
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex flex-col md:flex-row border rounded-xl overflow-hidden bg-white" style={{ minHeight: '560px' }}>
                  {/* Left panel: ticket list */}
                  <div className={`md:w-72 border-b md:border-b-0 md:border-r flex flex-col shrink-0 ${showMobileDetail ? 'hidden md:flex' : 'flex'}`}>
                    <div className="px-4 py-3 border-b bg-gray-50">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {tickets.length} Case{tickets.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {tickets.map((ticket) => {
                        const isSelected = ticket.id === selectedTicketId;
                        const hasUnread = unreadTicketIds.has(ticket.id);
                        return (
                          <button
                            key={ticket.id}
                            onClick={() => handleSelectTicket(ticket.id)}
                            className={`w-full text-left px-4 py-3.5 border-b flex items-center gap-3 transition-colors last:border-b-0 ${
                              isSelected
                                ? 'bg-gray-50 border-l-2 border-l-gray-900'
                                : 'hover:bg-gray-50 border-l-2 border-l-transparent'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900 truncate">
                                  Ticket {ticket.ticketId}
                                </span>
                                {hasUnread && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" title="New message" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={`text-[10px] px-1.5 py-0 leading-4 ${getStatusColor(ticket.status)}`}>
                                  {ticket.status}
                                </Badge>
                                <span className="text-xs text-gray-400 truncate">{ticket.timestamp}</span>
                              </div>
                            </div>
                            <ChevronRight className={`w-4 h-4 shrink-0 transition-colors ${isSelected ? 'text-gray-700' : 'text-gray-300'}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right panel: ticket detail */}
                  <div className={`flex-1 overflow-y-auto ${showMobileDetail || !selectedTicket ? 'block' : 'hidden md:block'}`}>
                    {/* Mobile back button */}
                    <button
                      className="md:hidden flex items-center gap-1.5 text-sm text-gray-500 px-4 py-3 border-b w-full hover:bg-gray-50"
                      onClick={() => setShowMobileDetail(false)}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to list
                    </button>

                    {selectedTicket ? (
                      <div className="p-6 space-y-6">
                        {/* Ticket header */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 flex-wrap">
                              {getStatusIcon(selectedTicket.status)}
                              <h2 className="font-semibold text-lg text-gray-900">
                                Ticket {selectedTicket.ticketId}
                              </h2>
                              <Badge className={getStatusColor(selectedTicket.status)}>
                                {selectedTicket.status.charAt(0).toUpperCase() + selectedTicket.status.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Submitted {selectedTicket.timestamp}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {selectedTicket.redditUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(selectedTicket.redditUrl, '_blank')}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View on Reddit
                              </Button>
                            )}
                            {selectedTicket.status === 'approved' && selectedTicket.amount && (
                              <Button
                                size="sm"
                                className="bg-gray-950 hover:bg-gray-800 text-white"
                                onClick={() => handleTicketPayment(selectedTicket.id)}
                                disabled={payingTicket === selectedTicket.id}
                              >
                                {payingTicket === selectedTicket.id ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Pay ${selectedTicket.amount}
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Pay Now callout when approved */}
                        {selectedTicket.status === 'approved' && selectedTicket.amount && (
                          <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-4 flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-indigo-600 shrink-0" />
                            <div className="flex-1">
                              <p className="font-semibold text-indigo-800 text-sm">Your quote is ready — payment activates your case</p>
                              <p className="text-sm text-indigo-700">Our team has reviewed your request and quoted ${selectedTicket.amount}.</p>
                            </div>
                          </div>
                        )}

                        {/* Content URL */}
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Content URL</p>
                          {selectedTicket.redditUrl ? (
                            <a
                              href={selectedTicket.redditUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline break-all"
                            >
                              {selectedTicket.redditUrl}
                            </a>
                          ) : (
                            <p className="text-sm text-gray-400">—</p>
                          )}
                        </div>

                        {/* Progress bar */}
                        {typeof selectedTicket.progress === 'number' && selectedTicket.progress > 0 && (
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="font-medium text-gray-700">Case Progress</span>
                              <span className="text-gray-500">{selectedTicket.progress}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gray-900 rounded-full transition-all duration-500"
                                style={{ width: `${selectedTicket.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Message thread */}
                        <TicketThread ticketId={selectedTicket.id} />
                      </div>
                    ) : (
                      <div className="hidden md:flex items-center justify-center h-full text-gray-400 text-sm">
                        Select a ticket to view details
                      </div>
                    )}
                  </div>
                </div>
              )}
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
