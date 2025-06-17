import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Phone, MessageCircle, Clock, CheckCircle, Shield } from 'lucide-react';

interface CheckoutProps {
  caseId: number;
  amount: string;
  description: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function Checkout({ caseId, amount, description, onSuccess, onCancel }: CheckoutProps) {
  const handleContactUs = () => {
    // For MVP, just close the modal and show success message
    onSuccess();
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle className="text-xl">Ready to Remove Your Content?</CardTitle>
        <p className="text-gray-600">{description}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Estimated Cost</span>
            <span className="text-2xl font-bold text-blue-600">{amount}</span>
          </div>
          <div className="text-sm text-gray-600">
            Final pricing determined after case review
          </div>
        </div>

        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription>
            <strong>MVP Notice:</strong> Payment processing coming soon. For now, our team will contact you directly to discuss your case and pricing.
          </AlertDescription>
        </Alert>

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

        <div className="flex gap-3">
          <Button 
            onClick={handleContactUs}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Submit Case & Get Quote
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Our team will review your case and contact you within 24 hours with a personalized quote and timeline.
        </p>
      </CardContent>
    </Card>
  );
}