import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, MessageCircle, Phone, Mail, CheckCircle, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ErrorFallbackProps {
  error?: Error;
  errorInfo?: string;
  context?: string;
}

export function ErrorFallback({ error, errorInfo, context }: ErrorFallbackProps) {
  const [ticketForm, setTicketForm] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
    urgency: "medium"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const { toast } = useToast();

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiRequest("POST", "/api/emergency-ticket", {
        ...ticketForm,
        errorDetails: {
          message: error?.message,
          stack: error?.stack,
          context,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }
      });

      setTicketSubmitted(true);
      toast({
        title: "Support ticket created",
        description: "We'll get back to you within 30 minutes during business hours.",
      });
    } catch (err) {
      toast({
        title: "Couldn't submit ticket",
        description: "Please call us directly at the number below.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (ticketSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-green-800">Support Ticket Created</CardTitle>
            <CardDescription>
              We've logged the issue and will contact you within 30 minutes during business hours.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">Ticket ID: #{Date.now()}</p>
              <Button onClick={() => window.location.reload()} className="w-full">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-2xl w-full space-y-6">
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>We're on it!</strong> This error has been automatically logged and our team has been notified. 
            We're working to fix it right now.
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Quick Support Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Need Immediate Help?
              </CardTitle>
              <CardDescription>
                Get instant support through these channels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => window.open('tel:+1-555-REPSHIELD')} 
                variant="outline" 
                className="w-full justify-start"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call: +1 (555) REP-SHIELD
              </Button>
              
              <Button 
                onClick={() => window.open('mailto:support@repshield.com')} 
                variant="outline" 
                className="w-full justify-start"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email: support@repshield.com
              </Button>
              
              <Button 
                onClick={() => window.open('/chat', '_blank')} 
                variant="outline" 
                className="w-full justify-start"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Live Chat Support
              </Button>

              <div className="text-xs text-gray-500 mt-4">
                <p><strong>Business Hours:</strong> Mon-Fri 8AM-8PM EST</p>
                <p><strong>Emergency Support:</strong> 24/7 for critical issues</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Ticket Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Quick Support Ticket
              </CardTitle>
              <CardDescription>
                Tell us what happened and we'll fix it fast
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={ticketForm.name}
                      onChange={(e) => setTicketForm({...ticketForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={ticketForm.email}
                      onChange={(e) => setTicketForm({...ticketForm, email: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={ticketForm.phone}
                    onChange={(e) => setTicketForm({...ticketForm, phone: e.target.value})}
                    placeholder="For faster response"
                  />
                </div>

                <div>
                  <Label htmlFor="description">What were you trying to do?</Label>
                  <Textarea
                    id="description"
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                    placeholder="Brief description of what you were doing when this happened..."
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Ticket..." : "Create Support Ticket"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Additional Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
              <Button onClick={() => window.location.href = '/'} variant="outline">
                Go Home
              </Button>
              <Button onClick={() => window.location.href = '/scan'} variant="outline">
                Brand Scanner
              </Button>
              <Button onClick={() => window.history.back()} variant="outline">
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>

        {process.env.NODE_ENV === 'development' && error && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-800">Developer Info</CardTitle>
            </CardHeader>
            <CardContent>
              <details className="text-sm">
                <summary className="cursor-pointer font-semibold mb-2">Error Details</summary>
                <pre className="whitespace-pre-wrap text-xs bg-gray-100 p-2 rounded">
                  {error.stack}
                </pre>
              </details>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}