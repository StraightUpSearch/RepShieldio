import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Phone, MessageCircle, Clock, CheckCircle, Shield, CreditCard, Loader2 } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface CheckoutProps {
  caseId: number;
  amount: string;
  description: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function Checkout({ caseId, amount, description, onSuccess, onCancel }: CheckoutProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if Stripe is available
  const { data: paymentStatus } = useQuery({
    queryKey: ['/api/payments/status'],
  });

  const stripeConfigured = paymentStatus?.stripeConfigured || false;

  const createCheckout = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/payments/create-checkout', { ticketId: caseId });
      return response.data;
    },
    onSuccess: (data: any) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      setIsProcessing(false);
    },
  });

  const handlePayment = () => {
    if (stripeConfigured) {
      setIsProcessing(true);
      createCheckout.mutate();
    } else {
      onSuccess();
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {stripeConfigured ? (
            <CreditCard className="w-8 h-8 text-blue-600" />
          ) : (
            <MessageCircle className="w-8 h-8 text-blue-600" />
          )}
        </div>
        <CardTitle className="text-xl">
          {stripeConfigured ? 'Complete Your Payment' : 'Ready to Remove Your Content?'}
        </CardTitle>
        <p className="text-gray-600">{description}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Total</span>
            <span className="text-2xl font-bold text-blue-600">{amount}</span>
          </div>
          {!stripeConfigured && (
            <div className="text-sm text-gray-600">
              Final pricing determined after case review
            </div>
          )}
        </div>

        {!stripeConfigured && (
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Our team will contact you directly to finalize payment and start removal.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>95%+ success rate guaranteed</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>24-48 hour response time</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Shield className="w-4 h-4 text-purple-500" />
            <span>Legal and ethical methods only</span>
          </div>
        </div>

        {!stripeConfigured && (
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <h4 className="font-medium text-blue-900">Contact Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>support@repshield.io</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : stripeConfigured ? (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Pay {amount}
              </>
            ) : (
              'Submit Case & Get Quote'
            )}
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
            Cancel
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          {stripeConfigured
            ? 'Secure payment powered by Stripe. Your card details are never stored on our servers.'
            : 'Our team will review your case and contact you within 24 hours with a personalized quote.'}
        </p>
      </CardContent>
    </Card>
  );
}
