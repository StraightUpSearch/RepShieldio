import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Search, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Ticket {
  id: number;
  type: string;
  title: string;
  status: string;
  priority: string;
  progress: number;
  amount: string | null;
  redditUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export const TicketStatus: React.FC = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/check-ticket-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setTickets(data.data);
        setHasSearched(true);
        
        if (data.data.length === 0) {
          toast({
            title: "No tickets found",
            description: "No tickets found for this email address",
          });
        } else {
          toast({
            title: "Tickets found",
            description: `Found ${data.data.length} ticket(s) for your email`,
          });
        }
      } else {
        toast({
          title: "Error",
          description: data.message || 'Failed to check ticket status',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error checking ticket status:', error);
      toast({
        title: "Error",
        description: 'Unable to check ticket status. Please try again.',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Check Your Ticket Status
          </CardTitle>
          <CardDescription>
            Enter your email address to view the status of your requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCheckStatus} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter the email you used for your request"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Check Status
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {hasSearched && (
        <div className="space-y-4">
          {tickets.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No tickets found</p>
                  <p className="text-sm">No requests were found for this email address</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            tickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Ticket #{ticket.id} - {ticket.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {formatTicketType(ticket.type)} • Created {formatDate(ticket.createdAt)}
                      </CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(ticket.status)} flex items-center gap-1`}>
                      {getStatusIcon(ticket.status)}
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ticket.progress > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{ticket.progress}%</span>
                      </div>
                      <Progress value={ticket.progress} className="h-2" />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {ticket.redditUrl && (
                      <div>
                        <Label className="text-xs text-gray-500">Reddit URL</Label>
                        <p className="text-sm break-all">
                          <a
                            href={ticket.redditUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {ticket.redditUrl}
                          </a>
                        </p>
                      </div>
                    )}
                    
                    {ticket.amount && (
                      <div>
                        <Label className="text-xs text-gray-500">Estimated Price</Label>
                        <p className="text-sm font-medium">${ticket.amount}</p>
                      </div>
                    )}
                    
                    <div>
                      <Label className="text-xs text-gray-500">Priority</Label>
                      <p className="text-sm capitalize">{ticket.priority}</p>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-gray-500">Last Updated</Label>
                      <p className="text-sm">{formatDate(ticket.updatedAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}; 