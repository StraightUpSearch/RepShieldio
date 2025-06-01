import { useState } from 'react';
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Shield, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  caseId: number;
  amount: string;
  description: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const CheckoutForm = ({ caseId, amount, description, onSuccess, onCancel }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard?case=${caseId}&payment=success`,
          payment_method_data: {
            billing_details: {
              name: 'RepShield Customer',
            },
          },
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Your removal case has been approved and will begin processing immediately.",
        });
        onSuccess();
      }
    } catch (err) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-xl">Approve Removal Case</CardTitle>
        <p className="text-gray-600">{description}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Total Amount</span>
            <span className="text-2xl font-bold text-green-600">{amount}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Shield className="w-4 h-4" />
            <span>Secure payment processed by Stripe</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>95%+ success rate guaranteed</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>24-48 hour completion time</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Shield className="w-4 h-4 text-purple-500" />
            <span>Legal and ethical methods only</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PaymentElement 
            options={{
              layout: 'tabs'
            }}
          />
          
          <div className="flex gap-3">
            <Button 
              type="submit" 
              disabled={!stripe || isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                `Pay ${amount} & Start Removal`
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>
        </form>

        <p className="text-xs text-gray-500 text-center">
          By completing this payment, you agree to our terms of service. 
          If content returns within 3 days, we'll remove it again for free.
        </p>
      </CardContent>
    </Card>
  );
};

interface CheckoutProps {
  caseId: number;
  amount: string;
  description: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function Checkout({ caseId, amount, description, onSuccess, onCancel }: CheckoutProps) {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const createPaymentIntent = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/create-payment-intent", { 
        caseId,
        amount: parseFloat(amount.replace('$', ''))
      });
    },
    onSuccess: (data: any) => {
      setClientSecret(data.clientSecret);
      setIsLoading(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
      onCancel();
    }
  });

  // Initialize payment when component mounts
  useState(() => {
    createPaymentIntent.mutate();
  });

  if (isLoading || !clientSecret) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-600">Preparing secure checkout...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Elements 
      stripe={stripePromise} 
      options={{ 
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#059669',
          }
        }
      }}
    >
      <CheckoutForm 
        caseId={caseId}
        amount={amount}
        description={description}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
}