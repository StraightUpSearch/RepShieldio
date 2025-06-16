import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/header";
import Footer from "@/components/footer";
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
  Download,
  RefreshCw
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

export default function MyAccount() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Get tickets from user data (if available)
  const tickets = user?.tickets || [];

  // Fetch real user stats
  const { data: statsResponse, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/user/stats'],
    enabled: !!user,
  });

  const stats: AccountStats = statsResponse?.data || {
    totalOrders: tickets.length,
    successfulRemovals: tickets.filter(t => t.status === 'completed').length,
    accountBalance: 0,
    creditsRemaining: 0
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600 mt-2">Manage your Reddit removal orders and account settings</p>
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
                            <p className="text-sm text-gray-600">Client Email: {ticket.clientEmail}</p>
                            <p className="text-sm text-gray-600">Created: {ticket.timestamp}</p>
                          </div>
                          <div className="text-right">
                            <Button variant="outline" size="sm" className="mt-2">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Reddit URL:</p>
                          <p className="text-sm text-blue-600 break-all">{ticket.redditUrl}</p>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Specialist Reply:</p>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm">{ticket.specialistReply}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Balance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold text-green-600">
                    ${stats.accountBalance}
                  </div>
                  <p className="text-gray-600">Available for new orders</p>
                  <Button className="w-full">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Add Funds
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Credits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.creditsRemaining}
                  </div>
                  <p className="text-gray-600">Credits remaining</p>
                  <Button variant="outline" className="w-full">
                    Purchase Credits
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Order Payment - ORD-2024-001</p>
                      <p className="text-sm text-gray-500">June 1, 2024</p>
                    </div>
                    <span className="text-red-600 font-semibold">-$899.00</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Wallet Top-up</p>
                      <p className="text-sm text-gray-500">May 28, 2024</p>
                    </div>
                    <span className="text-green-600 font-semibold">+$1,000.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                    <label className="text-sm font-medium">Member Since</label>
                    <p className="text-gray-600">January 2024</p>
                  </div>
                </div>
                <Button variant="outline">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive updates about your orders</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-gray-600">Get instant updates via text</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Setup
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Two-Factor Authentication
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Download Account Data
                  <Download className="w-4 h-4 ml-2" />
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