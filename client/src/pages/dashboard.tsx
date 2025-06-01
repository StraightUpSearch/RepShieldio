import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, FileText, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Ticket {
  id: number;
  type: string;
  status: string;
  priority: string;
  title: string;
  description: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your dashboard.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: tickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ["/api/user/tickets"],
    enabled: isAuthenticated,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Session Expired",
          description: "Please log in again.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return false;
      }
      return failureCount < 3;
    },
  });

  if (isLoading || ticketsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800", 
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-gray-100 text-gray-800"
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Manage your reputation protection requests</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-700">{user?.email}</span>
              </div>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/api/logout"}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => window.location.href = "/#brand-scanner"}
              className="bg-orange-500 hover:bg-orange-600 text-white h-12"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              New Brand Scan
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = "/#contact"}
              className="h-12"
            >
              Contact Support
            </Button>
            <Button 
              variant="outline"
              className="h-12"
              disabled
            >
              Monitoring Setup (Coming Soon)
            </Button>
          </div>
        </div>

        {/* Tickets */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Requests</h2>
          
          {tickets && tickets.length > 0 ? (
            <div className="space-y-4">
              {tickets.map((ticket: Ticket) => (
                <Card key={ticket.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(ticket.status)}
                        <h3 className="text-lg font-medium text-gray-900">
                          {ticket.title}
                        </h3>
                        <Badge className={getStatusBadge(ticket.status)}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                        {ticket.priority === 'premium' && (
                          <Badge className="bg-purple-100 text-purple-800">
                            Premium
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3">{ticket.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        <span>Updated: {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                        {ticket.assignedTo && (
                          <span>Assigned to: {ticket.assignedTo}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
              <p className="text-gray-600 mb-4">
                Start by scanning your brand to see what people are saying about you on Reddit.
              </p>
              <Button 
                onClick={() => window.location.href = "/#brand-scanner"}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Start Brand Scan
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}