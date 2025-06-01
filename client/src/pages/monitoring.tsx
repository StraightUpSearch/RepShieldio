import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Bell, TrendingUp, AlertTriangle, CheckCircle, Clock, Globe, CreditCard } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MonitoringPlan {
  id: string;
  name: string;
  price: number;
  cryptoPrice: string;
  interval: string;
  features: string[];
  scanFrequency: string;
  alertTypes: string[];
}

const monitoringPlans: MonitoringPlan[] = [
  {
    id: 'basic',
    name: 'Basic Monitoring',
    price: 49,
    cryptoPrice: '0.0012 BTC',
    interval: 'monthly',
    scanFrequency: 'Weekly scans',
    features: [
      'Weekly Reddit monitoring',
      'Email alerts for negative mentions',
      'Basic sentiment analysis',
      'Up to 3 brand keywords'
    ],
    alertTypes: ['Email']
  },
  {
    id: 'pro',
    name: 'Professional Monitoring',
    price: 99,
    cryptoPrice: '0.0025 BTC',
    interval: 'monthly',
    scanFrequency: 'Daily scans',
    features: [
      'Daily Reddit + web monitoring',
      'Instant SMS + email alerts',
      'Advanced sentiment analysis',
      'Unlimited brand keywords',
      'Priority support'
    ],
    alertTypes: ['Email', 'SMS', 'Telegram']
  },
  {
    id: 'enterprise',
    name: 'Enterprise Monitoring',
    price: 199,
    cryptoPrice: '0.005 BTC',
    interval: 'monthly',
    scanFrequency: 'Real-time monitoring',
    features: [
      'Real-time monitoring across all platforms',
      'Dedicated account manager',
      'Custom removal strategies',
      'White-label reporting',
      'API access'
    ],
    alertTypes: ['Email', 'SMS', 'Telegram', 'Slack']
  }
];

export default function MonitoringSetup() {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<MonitoringPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'card'>('crypto');
  const [monitoringEnabled, setMonitoringEnabled] = useState(false);

  const subscribeToMonitoring = useMutation({
    mutationFn: async (planData: any) => {
      return await apiRequest("POST", "/api/monitoring/subscribe", planData);
    },
    onSuccess: () => {
      toast({
        title: "Monitoring Activated!",
        description: "Your brand monitoring service is now active. You'll receive alerts when new mentions are detected.",
      });
      setMonitoringEnabled(true);
    },
    onError: () => {
      toast({
        title: "Setup Failed",
        description: "Unable to activate monitoring. Please try again or contact support.",
        variant: "destructive",
      });
    }
  });

  const handleSubscribe = (plan: MonitoringPlan) => {
    subscribeToMonitoring.mutate({
      planId: plan.id,
      paymentMethod,
      price: paymentMethod === 'crypto' ? plan.cryptoPrice : plan.price
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Brand Monitoring</h1>
              <p className="text-gray-600">Stay ahead of reputation issues with automated monitoring</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-700">
                  {monitoringEnabled ? 'Monitoring Active' : 'Setup Required'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Status */}
        {monitoringEnabled && (
          <Card className="p-6 mb-8 bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-green-900">Monitoring Active</h3>
                  <p className="text-green-700">Your brand is being monitored 24/7 for mentions and reputation issues.</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={monitoringEnabled} onCheckedChange={setMonitoringEnabled} />
                <Button variant="outline" size="sm">
                  View Dashboard
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Payment Method Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
          <div className="flex space-x-4">
            <Button
              variant={paymentMethod === 'crypto' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('crypto')}
              className="flex items-center space-x-2"
            >
              <span>₿</span>
              <span>Cryptocurrency</span>
            </Button>
            <Button
              variant={paymentMethod === 'card' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('card')}
              className="flex items-center space-x-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Credit Card</span>
            </Button>
          </div>
        </div>

        {/* Monitoring Plans */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose Your Monitoring Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {monitoringPlans.map((plan) => (
              <Card key={plan.id} className={`p-6 relative ${selectedPlan?.id === plan.id ? 'ring-2 ring-orange-500' : ''}`}>
                {plan.id === 'pro' && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white">
                    Most Popular
                  </Badge>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {paymentMethod === 'crypto' ? plan.cryptoPrice : `$${plan.price}`}
                  </div>
                  <p className="text-gray-600">per {plan.interval}</p>
                  <p className="text-sm text-orange-600 font-medium mt-2">{plan.scanFrequency}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">Alert Methods:</p>
                  <div className="flex flex-wrap gap-1">
                    {plan.alertTypes.map((type) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setSelectedPlan(plan);
                    handleSubscribe(plan);
                  }}
                  disabled={subscribeToMonitoring.isPending}
                  className={`w-full ${plan.id === 'pro' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                >
                  {subscribeToMonitoring.isPending ? 'Setting up...' : 'Start Monitoring'}
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Why Choose Monitoring */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Choose Automated Monitoring?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <Bell className="w-6 h-6 text-orange-500 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">Instant Alerts</h4>
                <p className="text-sm text-gray-600">Get notified immediately when negative mentions appear, allowing for rapid response.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <TrendingUp className="w-6 h-6 text-green-500 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">Trend Analysis</h4>
                <p className="text-sm text-gray-600">Track sentiment trends over time and measure the impact of your reputation management efforts.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-blue-500 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">Proactive Protection</h4>
                <p className="text-sm text-gray-600">Prevent reputation damage by catching issues early, before they spread and cause lasting harm.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}