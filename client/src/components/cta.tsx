import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Lock, Clock, ShieldX, Gift } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ContactForm {
  name: string;
  email: string;
  company: string;
  website: string;
  message: string;
}

export default function CTA() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ContactForm>({
    name: "",
    email: "",
    company: "",
    website: "",
    message: ""
  });

  const submitAudit = useMutation({
    mutationFn: async (data: ContactForm) => {
      return await apiRequest("POST", "/api/audit-request", data);
    },
    onSuccess: () => {
      toast({
        title: "Audit Request Submitted!",
        description: "We'll send your free Reddit audit within 24 hours.",
      });
      setFormData({
        name: "",
        email: "",
        company: "",
        website: "",
        message: ""
      });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.company) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    submitAudit.mutate(formData);
  };

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section id="contact" className="py-16 gradient-reddit text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold mb-4">
          Don't Let False Claims Destroy Your Business
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Get your free Reddit reputation audit and see exactly what's being said about your brand
        </p>
        
        <div className="bg-white rounded-2xl p-8 text-gray-900 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold mb-6">Get Your Free Audit Today</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                type="text"
                placeholder="Your Name *"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className="focus:ring-2 focus:ring-reddit-orange focus:border-reddit-orange"
              />
              <Input
                type="email"
                placeholder="Business Email *"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                className="focus:ring-2 focus:ring-reddit-orange focus:border-reddit-orange"
              />
            </div>
            
            <Input
              type="text"
              placeholder="Company Name *"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              required
              className="focus:ring-2 focus:ring-reddit-orange focus:border-reddit-orange"
            />
            
            <Input
              type="url"
              placeholder="Website URL"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="focus:ring-2 focus:ring-reddit-orange focus:border-reddit-orange"
            />
            
            <Textarea
              placeholder="Describe your reputation concerns (optional)"
              rows={4}
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              className="focus:ring-2 focus:ring-reddit-orange focus:border-reddit-orange"
            />
            
            <Button
              type="submit"
              disabled={submitAudit.isPending}
              className="w-full bg-reddit-orange text-white py-4 hover:bg-red-600 transition-colors font-semibold text-lg"
            >
              {submitAudit.isPending ? "Submitting..." : "Get My Free Reddit Audit"}
            </Button>
          </form>
          
          <div className="mt-6 text-sm text-gray-600 flex items-center justify-center">
            <Lock className="w-4 h-4 mr-2" />
            Your information is completely confidential and secure
          </div>
        </div>
        
        <div className="mt-12 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <Clock className="w-8 h-8 mb-2 opacity-80 mx-auto" />
            <h4 className="font-semibold">Fast Response</h4>
            <p className="text-sm opacity-80">Audit results within 24 hours</p>
          </div>
          <div>
            <ShieldX className="w-8 h-8 mb-2 opacity-80 mx-auto" />
            <h4 className="font-semibold">Expert Analysis</h4>
            <p className="text-sm opacity-80">Professional reputation assessment</p>
          </div>
          <div>
            <Gift className="w-8 h-8 mb-2 opacity-80 mx-auto" />
            <h4 className="font-semibold">No Obligation</h4>
            <p className="text-sm opacity-80">Free audit with no strings attached</p>
          </div>
        </div>
      </div>
    </section>
  );
}
