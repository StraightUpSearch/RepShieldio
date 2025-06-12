import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Ticket, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Edit,
  Save,
  X,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminTicket {
  id: number;
  userId: string;
  type: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assignedTo: string | null;
  progress: number;
  amount: string | null;
  redditUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  requestData?: any;
}

interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: string;
  pendingOrders: number;
  completedOrders: number;
  activeUsers: number;
}

export const AdminDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingTicket, setEditingTicket] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    status: '',
    assignedTo: '',
    notes: '',
    progress: 0
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [ticketsResponse, statsResponse] = await Promise.all([
        fetch('/api/data-admin/orders'),
        fetch('/api/admin/stats')
      ]);

      if (ticketsResponse.ok) {
        const ticketsData = await ticketsResponse.json();
        setTickets(ticketsData.data || []);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTicket = (ticket: AdminTicket) => {
    setEditingTicket(ticket.id);
    setEditForm({
      status: ticket.status,
      assignedTo: ticket.assignedTo || '',
      notes: ticket.notes || '',
      progress: ticket.progress || 0
    });
  };

  const handleSaveTicket = async (ticketId: number) => {
    try {
      const response = await fetch(`/api/admin/orders/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        toast.success('Ticket updated successfully');
        setEditingTicket(null);
        fetchAdminData(); // Refresh data
      } else {
        toast.error('Failed to update ticket');
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Failed to update ticket');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTicketType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={fetchAdminData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Total Users</p>
                  <p className="text-lg font-bold">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Ticket className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Total Orders</p>
                  <p className="text-lg font-bold">{stats.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-500">Total Revenue</p>
                  <p className="text-lg font-bold">${stats.totalRevenue}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <div>
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className="text-lg font-bold">{stats.pendingOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Completed</p>
                  <p className="text-lg font-bold">{stats.completedOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <div>
                  <p className="text-xs text-gray-500">Active Users</p>
                  <p className="text-lg font-bold">{stats.activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tickets Management */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Tickets ({tickets.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({tickets.filter(t => t.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="processing">
            Processing ({tickets.filter(t => t.status === 'processing').length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({tickets.filter(t => t.status === 'completed').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Ticket #{ticket.id} - {ticket.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {formatTicketType(ticket.type)} • Created {formatDate(ticket.createdAt)}
                      {ticket.requestData?.email && (
                        <> • Client: {ticket.requestData.email}</>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusColor(ticket.status)} flex items-center gap-1`}>
                      {getStatusIcon(ticket.status)}
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </Badge>
                    {editingTicket === ticket.id ? (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={() => handleSaveTicket(ticket.id)}
                          className="h-8"
                        >
                          <Save className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingTicket(null)}
                          className="h-8"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditTicket(ticket)}
                        className="h-8"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingTicket === ticket.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={editForm.status} onValueChange={(value) => 
                        setEditForm(prev => ({ ...prev, status: value }))
                      }>
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

                    <div>
                      <Label htmlFor="assignedTo">Assigned To</Label>
                      <Input
                        value={editForm.assignedTo}
                        onChange={(e) => setEditForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                        placeholder="Admin username"
                      />
                    </div>

                    <div>
                      <Label htmlFor="progress">Progress (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={editForm.progress}
                        onChange={(e) => setEditForm(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="notes">Internal Notes</Label>
                      <Textarea
                        value={editForm.notes}
                        onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Add internal notes about this ticket..."
                        rows={3}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    {ticket.progress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{ticket.progress}%</span>
                        </div>
                        <Progress value={ticket.progress} className="h-2" />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {ticket.redditUrl && (
                        <div>
                          <Label className="text-xs text-gray-500">Reddit URL</Label>
                          <p className="text-sm break-all">
                            <a
                              href={ticket.redditUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              View Reddit Post
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </p>
                        </div>
                      )}
                      
                      {ticket.amount && (
                        <div>
                          <Label className="text-xs text-gray-500">Amount</Label>
                          <p className="text-sm font-medium">${ticket.amount}</p>
                        </div>
                      )}
                      
                      <div>
                        <Label className="text-xs text-gray-500">Priority</Label>
                        <p className="text-sm capitalize">{ticket.priority}</p>
                      </div>
                      
                      {ticket.assignedTo && (
                        <div>
                          <Label className="text-xs text-gray-500">Assigned To</Label>
                          <p className="text-sm">{ticket.assignedTo}</p>
                        </div>
                      )}
                      
                      <div>
                        <Label className="text-xs text-gray-500">Last Updated</Label>
                        <p className="text-sm">{formatDate(ticket.updatedAt)}</p>
                      </div>
                    </div>

                    {ticket.description && (
                      <div>
                        <Label className="text-xs text-gray-500">Description</Label>
                        <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
                      </div>
                    )}

                    {ticket.notes && (
                      <div>
                        <Label className="text-xs text-gray-500">Internal Notes</Label>
                        <p className="text-sm whitespace-pre-wrap bg-gray-50 p-2 rounded">{ticket.notes}</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {tickets.filter(t => t.status === 'pending').map((ticket) => (
            <Card key={ticket.id}>
              {/* Same ticket content as above */}
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          {tickets.filter(t => t.status === 'processing').map((ticket) => (
            <Card key={ticket.id}>
              {/* Same ticket content as above */}
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {tickets.filter(t => t.status === 'completed').map((ticket) => (
            <Card key={ticket.id}>
              {/* Same ticket content as above */}
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}; 