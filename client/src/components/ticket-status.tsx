import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Search, Clock, CheckCircle, AlertCircle, RefreshCw, CreditCard, ArrowRight, ExternalLink, X, Send,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSearch } from 'wouter';

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

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:    { label: 'Pending review', color: 'bg-yellow-50 text-yellow-700 border-yellow-200',  icon: <Clock className="w-3.5 h-3.5" /> },
  approved:   { label: 'Quote ready',   color: 'bg-orange-50 text-orange-700 border-orange-200',   icon: <CreditCard className="w-3.5 h-3.5" /> },
  processing: { label: 'In progress',   color: 'bg-orange-50 text-orange-700 border-orange-200',   icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" /> },
  completed:  { label: 'Removed',       color: 'bg-green-50 text-green-700 border-green-200',      icon: <CheckCircle className="w-3.5 h-3.5" /> },
  failed:     { label: 'Failed',        color: 'bg-red-50 text-red-700 border-red-200',            icon: <AlertCircle className="w-3.5 h-3.5" /> },
};

function getStatus(status: string) {
  return STATUS_CONFIG[status.toLowerCase()] ?? {
    label: status,
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: <Clock className="w-3.5 h-3.5" />,
  };
}

function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

function TicketCard({ ticket, email }: { ticket: Ticket; email: string }) {
  const { toast } = useToast();
  const [paying, setPaying] = useState(false);
  const s = getStatus(ticket.status);
  const canPay = ticket.status === 'approved' && ticket.amount;

  const handlePay = async () => {
    setPaying(true);
    try {
      const res = await fetch('/api/payments/checkout-guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: ticket.id, email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: 'Payment unavailable',
          description: data.message ?? 'Please contact us to arrange payment.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({ title: 'Error', description: 'Could not start payment. Try again.', variant: 'destructive' });
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-400">#{ticket.id}</span>
            <Badge className={`${s.color} flex items-center gap-1 border text-xs font-medium px-2 py-0.5`}>
              {s.icon}
              {s.label}
            </Badge>
          </div>
          <h3 className="font-semibold text-gray-900 text-base">{ticket.title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">Submitted {formatDate(ticket.createdAt)}</p>
        </div>

        {ticket.amount && (
          <div className="text-right flex-shrink-0">
            <div className="text-xs text-gray-400 mb-0.5">Quoted price</div>
            <div className="font-satoshi text-xl font-black text-gray-950 tracking-[-0.03em]">
              ${ticket.amount}
            </div>
          </div>
        )}
      </div>

      {ticket.progress > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Case progress</span>
            <span>{ticket.progress}%</span>
          </div>
          <Progress value={ticket.progress} className="h-1.5" />
        </div>
      )}

      {ticket.redditUrl && (
        <a
          href={ticket.redditUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{ticket.redditUrl}</span>
        </a>
      )}

      {canPay && (
        <div className="pt-3 border-t border-gray-50 space-y-3">
          <p className="text-sm text-gray-500">
            Your quote is ready. Pay to activate — you're only charged after the content is removed.
          </p>
          <Button
            onClick={handlePay}
            disabled={paying}
            className="h-11 px-6 bg-gray-950 hover:bg-gray-800 text-white font-semibold rounded-xl"
          >
            {paying ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Pay ${ticket.amount} to activate
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export const TicketStatus: React.FC = () => {
  const { toast } = useToast();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const emailParam = params.get('email') || '';
  const paymentParam = params.get('payment');
  const submittedParam = params.get('submitted');

  const [email, setEmail] = useState(emailParam);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showSubmittedBanner, setShowSubmittedBanner] = useState(submittedParam === '1');
  const [paymentBanner, setPaymentBanner] = useState<'success' | 'cancelled' | null>(
    paymentParam === 'success' ? 'success' : paymentParam === 'cancelled' ? 'cancelled' : null
  );

  // Auto-search if email comes in via URL param
  useEffect(() => {
    if (emailParam) {
      doSearch(emailParam);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const doSearch = async (searchEmail: string) => {
    if (!searchEmail.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/check-ticket-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: searchEmail.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setTickets(data.data);
        setSubmittedEmail(searchEmail.trim());
        setHasSearched(true);
      } else {
        toast({ title: 'Error', description: data.message || 'Failed to check status', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Unable to check status. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(email);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 space-y-5">
      {/* Submission confirmed banner */}
      {showSubmittedBanner && (
        <div className="bg-gray-950 text-white rounded-2xl px-6 py-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white text-base mb-1">Request received — ref #{emailParam.split('@')[0].slice(-6).toUpperCase()}</p>
              <p className="text-sm text-white/60 leading-relaxed">A case manager will review your Reddit URL and send a fixed-price quote to <span className="text-white/90 font-medium">{emailParam}</span> within 4 hours.</p>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-white/50">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-400" /> No upfront payment</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-400" /> Pay only on removal</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-400" /> 4-hour response</span>
              </div>
            </div>
          </div>
          <button onClick={() => setShowSubmittedBanner(false)} className="text-white/40 hover:text-white/80 flex-shrink-0 mt-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Payment result banners */}
      {paymentBanner === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-800 text-sm">Payment confirmed</p>
              <p className="text-sm text-green-700">Your case is now active. We'll be in touch within 24 hours.</p>
            </div>
          </div>
          <button onClick={() => setPaymentBanner(null)} className="text-green-500 hover:text-green-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {paymentBanner === 'cancelled' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-yellow-800 text-sm">Payment not completed</p>
              <p className="text-sm text-yellow-700">Your quote is still available — use the Pay button below when ready.</p>
            </div>
          </div>
          <button onClick={() => setPaymentBanner(null)} className="text-yellow-500 hover:text-yellow-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search form */}
      <div className="bg-white border border-gray-100 rounded-2xl p-8">
        <h1 className="font-satoshi text-2xl font-black text-gray-950 tracking-[-0.03em] mb-1">
          Track your case
        </h1>
        <p className="text-gray-500 text-sm mb-6">Enter the email you used when you submitted your request.</p>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="status-email" className="sr-only">Email address</Label>
            <Input
              id="status-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="h-11"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="h-11 px-6 bg-gray-950 hover:bg-gray-800 text-white font-semibold shrink-0"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>Check <ArrowRight className="ml-2 w-4 h-4" /></>
            )}
          </Button>
        </form>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-4">
          {tickets.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
              <Search className="w-10 h-10 text-gray-200 mx-auto mb-4" />
              <p className="font-semibold text-gray-900 mb-1">No cases found</p>
              <p className="text-sm text-gray-400">No requests were found for {submittedEmail}</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-400">
                {tickets.length} case{tickets.length !== 1 ? 's' : ''} found for {submittedEmail}
              </p>
              {tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} email={submittedEmail} />
              ))}
            </>
          )}

          {/* Account CTA */}
          <div className="bg-gray-950 text-white rounded-2xl p-6 space-y-4">
            <div>
              <p className="font-semibold text-white mb-1">Get real-time updates</p>
              <p className="text-sm text-white/50">Create a free account to receive notifications and manage all your cases in one place.</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <a href="/login?register=1" className="flex-shrink-0">
                <Button className="h-10 px-5 bg-white text-gray-950 hover:bg-gray-100 font-semibold text-sm">
                  Create account
                </Button>
              </a>
              <a href="/login" className="text-sm text-white/60 hover:text-white transition-colors">
                Already have an account? Log in →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
