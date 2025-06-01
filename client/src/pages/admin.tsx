import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Download, Eye, Users, FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Ticket {
  id: number;
  type: string;
  status: string;
  priority: string;
  title: string;
  description: string;
  assignedTo: string | null;
  notes: string | null;
  requestData: any;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["/api/admin/tickets"],
    retry: false,
  });

  const updateTicket = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      return await apiRequest("PATCH", `/api/admin/tickets/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] });
      toast({
        title: "Ticket Updated",
        description: "Changes saved successfully.",
      });
    },
  });

  const exportToSpreadsheet = (ticketIds: number[]) => {
    const selectedTickets = tickets?.filter((t: Ticket) => ticketIds.includes(t.id)) || [];
    
    const csvData = selectedTickets.map((ticket: Ticket) => ({
      ID: ticket.id,
      Type: ticket.type,
      Priority: ticket.priority,
      Title: ticket.title,
      Description: ticket.description,
      CustomerName: ticket.requestData?.name || '',
      CustomerEmail: ticket.requestData?.email || '',
      Company: ticket.requestData?.company || '',
      BrandName: ticket.requestData?.brandName || '',
      Created: new Date(ticket.createdAt).toLocaleDateString(),
      Status: ticket.status
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repshield-leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Exported ${csvData.length} tickets for contractor review.`,
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-blue-100 text-blue-800",
      in_progress: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-gray-100 text-gray-800"
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'approved': return <FileText className="w-4 h-4" />;
      case 'cancelled': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredTickets = tickets?.filter((ticket: Ticket) => 
    statusFilter === "all" || ticket.status === statusFilter
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600">Manage leads and contractor workflow</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => exportToSpreadsheet(filteredTickets.map((t: Ticket) => t.id))}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Export for Contractor
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{tickets?.length || 0}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tickets?.filter((t: Ticket) => t.status === 'pending').length || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tickets?.filter((t: Ticket) => t.status === 'in_progress').length || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tickets?.filter((t: Ticket) => t.status === 'completed').length || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tickets</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tickets Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map((ticket: Ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(ticket.status)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {ticket.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            #{ticket.id} • {new Date(ticket.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{ticket.requestData?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{ticket.requestData?.email || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{ticket.requestData?.company || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusBadge(ticket.status)}>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={ticket.priority === 'premium' ? 'default' : 'secondary'}>
                        {ticket.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ticket.assignedTo || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Manage
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Manage Ticket #{ticket.id}</DialogTitle>
                          </DialogHeader>
                          <TicketManagement 
                            ticket={ticket} 
                            onUpdate={(updates) => updateTicket.mutate({ id: ticket.id, updates })}
                          />
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function TicketManagement({ ticket, onUpdate }: { ticket: Ticket; onUpdate: (updates: any) => void }) {
  const [status, setStatus] = useState(ticket.status);
  const [assignedTo, setAssignedTo] = useState(ticket.assignedTo || '');
  const [notes, setNotes] = useState(ticket.notes || '');

  const handleSave = () => {
    onUpdate({
      status: status !== ticket.status ? status : undefined,
      assignedTo: assignedTo !== ticket.assignedTo ? assignedTo : undefined,
      notes: notes !== ticket.notes ? notes : undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Customer Details */}
      <div>
        <h3 className="text-lg font-medium mb-3">Customer Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="font-medium">Name:</Label>
            <p>{ticket.requestData?.name || 'N/A'}</p>
          </div>
          <div>
            <Label className="font-medium">Email:</Label>
            <p>{ticket.requestData?.email || 'N/A'}</p>
          </div>
          <div>
            <Label className="font-medium">Company:</Label>
            <p>{ticket.requestData?.company || 'N/A'}</p>
          </div>
          <div>
            <Label className="font-medium">Brand:</Label>
            <p>{ticket.requestData?.brandName || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Management Controls */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="approved">Approved for Contractor</SelectItem>
              <SelectItem value="in_progress">Work in Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="assigned">Assigned To</Label>
          <Input
            id="assigned"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            placeholder="Contractor name"
          />
        </div>

        <div>
          <Label htmlFor="notes">Internal Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this ticket..."
            rows={4}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 text-white">
          Save Changes
        </Button>
      </div>
    </div>
  );
}