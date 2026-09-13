import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  ArrowRight,
  Search,
  UserPlus,
  FileText,
  DollarSign,
  CheckCircle,
} from "lucide-react";

const FUNNEL_STEPS = [
  { key: 'scan_started', label: 'Scans Started', icon: Search, color: 'text-blue-600 bg-blue-100' },
  { key: 'scan_completed', label: 'Scans Completed', icon: Search, color: 'text-indigo-600 bg-indigo-100' },
  { key: 'lead_form_submitted', label: 'Leads Captured', icon: UserPlus, color: 'text-purple-600 bg-purple-100' },
  { key: 'ticket_created', label: 'Tickets Created', icon: FileText, color: 'text-orange-600 bg-orange-100' },
  { key: 'quote_sent', label: 'Quotes Sent', icon: DollarSign, color: 'text-yellow-600 bg-yellow-100' },
  { key: 'quote_accepted', label: 'Quotes Accepted', icon: DollarSign, color: 'text-emerald-600 bg-emerald-100' },
  { key: 'payment_completed', label: 'Payments', icon: DollarSign, color: 'text-green-600 bg-green-100' },
  { key: 'removal_completed', label: 'Removals Done', icon: CheckCircle, color: 'text-green-700 bg-green-200' },
];

export default function FunnelAnalytics() {
  const { data: analyticsResponse, isLoading } = useQuery<any>({
    queryKey: ['/api/admin/analytics'],
  });

  const stats = analyticsResponse?.data || { totalEvents: 0, eventCounts: {}, conversionRates: {} };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.totalEvents}</div>
            <p className="text-sm text-gray-500">Total Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-purple-600">
              {stats.conversionRates?.scanToLead || 'N/A'}
            </div>
            <p className="text-sm text-gray-500">Scan → Lead</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-orange-600">
              {stats.conversionRates?.leadToTicket || 'N/A'}
            </div>
            <p className="text-sm text-gray-500">Lead → Ticket</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-green-600">
              {stats.conversionRates?.quoteToPayment || 'N/A'}
            </div>
            <p className="text-sm text-gray-500">Quote → Payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Conversion Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {FUNNEL_STEPS.map((step, index) => {
              const count = stats.eventCounts?.[step.key] || 0;
              const maxCount = Math.max(...FUNNEL_STEPS.map(s => stats.eventCounts?.[s.key] || 0), 1);
              const widthPercent = Math.max((count / maxCount) * 100, 8);
              const prevCount = index > 0 ? (stats.eventCounts?.[FUNNEL_STEPS[index - 1].key] || 0) : 0;
              const dropoff = index > 0 && prevCount > 0
                ? ((1 - count / prevCount) * 100).toFixed(0) + '% drop'
                : '';

              return (
                <div key={step.key} className="flex items-center gap-4">
                  <div className="w-40 flex items-center gap-2 shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.color}`}>
                      <step.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium truncate">{step.label}</span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-full h-8 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full flex items-center justify-end pr-3 transition-all"
                        style={{ width: `${widthPercent}%`, minWidth: '40px' }}
                      >
                        <span className="text-white text-sm font-bold">{count}</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-24 text-right shrink-0">
                    {dropoff && (
                      <Badge variant="outline" className="text-xs text-red-500 border-red-200">
                        {dropoff}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5" />
              Revenue Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Credit Purchases</span>
                <span className="font-semibold">{stats.eventCounts?.credit_purchased || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subscriptions Created</span>
                <span className="font-semibold">{stats.eventCounts?.subscription_created || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payments Completed</span>
                <span className="font-semibold">{stats.eventCounts?.payment_completed || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5" />
              All Event Counts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {Object.entries(stats.eventCounts || {})
                .sort(([, a]: any, [, b]: any) => b - a)
                .map(([key, count]: [string, any]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-600">{key.replace(/_/g, ' ')}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
