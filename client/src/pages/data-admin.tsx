import { useState } from "react";
import { AdminRoute } from "@/components/admin-route";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  Users, 
  FileText, 
  Plus, 
  Edit,
  Save,
  Trash2,
  Search,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface UserRecord {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  accountBalance: string;
  creditsRemaining: number;
  createdAt: string;
}

interface OrderRecord {
  id: number;
  userId: string;
  type: string;
  status: string;
  title: string;
  redditUrl?: string;
  amount?: string;
  progress: number;
  assignedTo?: string;
  createdAt: string;
}

export default function DataAdmin() {
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [newUser, setNewUser] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "user",
    accountBalance: "0.00",
    creditsRemaining: 0
  });
  const [newOrder, setNewOrder] = useState({
    userId: "",
    type: "removal",
    status: "pending",
    title: "",
    redditUrl: "",
    amount: "",
    progress: 0
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all users with direct database access
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['/api/data-admin/users'],
  });

  // Fetch all orders with direct database access
  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['/api/data-admin/orders'],
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUser) => {
      return apiRequest('POST', '/api/data-admin/users', userData);
    },
    onSuccess: () => {
      toast({ title: "User Created", description: "User has been created successfully." });
      setNewUser({ email: "", firstName: "", lastName: "", role: "user", accountBalance: "0.00", creditsRemaining: 0 });
      refetchUsers();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create user.", variant: "destructive" });
    }
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: typeof newOrder) => {
      return apiRequest('POST', '/api/data-admin/orders', orderData);
    },
    onSuccess: () => {
      toast({ title: "Order Created", description: "Order has been created successfully." });
      setNewOrder({ userId: "", type: "removal", status: "pending", title: "", redditUrl: "", amount: "", progress: 0 });
      refetchOrders();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create order.", variant: "destructive" });
    }
  });

  const users: UserRecord[] = usersData?.data || [];
  const orders: OrderRecord[] = ordersData?.data || [];

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(order => 
    order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.redditUrl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.userId.includes(searchTerm)
  );

  return (
    <AdminRoute>
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Database className="w-8 h-8" />
            Data Administration
          </h1>
          <p className="text-gray-600 mt-2">Direct database access for user and order management</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create New
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>User Management</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button onClick={() => refetchUsers()} variant="outline" size="icon">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-xs text-gray-400">ID: {user.id}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">Balance: ${user.accountBalance}</p>
                            <p className="text-sm">Credits: {user.creditsRemaining}</p>
                            <p className="text-xs text-gray-500">Role: {user.role}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">
                          Created: {new Date(user.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Order Management</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button onClick={() => refetchOrders()} variant="outline" size="icon">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{order.title}</h3>
                            <p className="text-sm text-gray-600">Order #{order.id}</p>
                            <p className="text-xs text-gray-400">User: {order.userId}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${order.amount}</p>
                            <p className="text-sm">Status: {order.status}</p>
                            <p className="text-xs">Progress: {order.progress}%</p>
                          </div>
                        </div>
                        {order.redditUrl && (
                          <p className="text-xs text-blue-600 break-all">{order.redditUrl}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          Created: {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create New Tab */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create User */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Create New User
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>First Name</Label>
                      <Input
                        value={newUser.firstName}
                        onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input
                        value={newUser.lastName}
                        onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Account Balance</Label>
                      <Input
                        value={newUser.accountBalance}
                        onChange={(e) => setNewUser({...newUser, accountBalance: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label>Credits</Label>
                      <Input
                        type="number"
                        value={newUser.creditsRemaining}
                        onChange={(e) => setNewUser({...newUser, creditsRemaining: parseInt(e.target.value) || 0})}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={() => createUserMutation.mutate(newUser)}
                    disabled={createUserMutation.isPending || !newUser.email}
                    className="w-full"
                  >
                    {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                  </Button>
                </CardContent>
              </Card>

              {/* Create Order */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Create New Order
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>User ID</Label>
                    <Input
                      value={newOrder.userId}
                      onChange={(e) => setNewOrder({...newOrder, userId: e.target.value})}
                      placeholder="User ID"
                    />
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={newOrder.title}
                      onChange={(e) => setNewOrder({...newOrder, title: e.target.value})}
                      placeholder="Reddit Post Removal"
                    />
                  </div>
                  <div>
                    <Label>Reddit URL</Label>
                    <Input
                      value={newOrder.redditUrl}
                      onChange={(e) => setNewOrder({...newOrder, redditUrl: e.target.value})}
                      placeholder="https://reddit.com/r/..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Type</Label>
                      <Select value={newOrder.type} onValueChange={(value) => setNewOrder({...newOrder, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="removal">Removal</SelectItem>
                          <SelectItem value="scan">Scan</SelectItem>
                          <SelectItem value="audit">Audit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select value={newOrder.status} onValueChange={(value) => setNewOrder({...newOrder, status: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Amount</Label>
                      <Input
                        value={newOrder.amount}
                        onChange={(e) => setNewOrder({...newOrder, amount: e.target.value})}
                        placeholder="199.00"
                      />
                    </div>
                    <div>
                      <Label>Progress (%)</Label>
                      <Input
                        type="number"
                        value={newOrder.progress}
                        onChange={(e) => setNewOrder({...newOrder, progress: parseInt(e.target.value) || 0})}
                        placeholder="0"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={() => createOrderMutation.mutate(newOrder)}
                    disabled={createOrderMutation.isPending || !newOrder.userId || !newOrder.title}
                    className="w-full"
                  >
                    {createOrderMutation.isPending ? 'Creating...' : 'Create Order'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </AdminRoute>
  );
}