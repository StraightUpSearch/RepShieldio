import { useState } from "react";
import { SiReddit, SiTelegram } from "react-icons/si";
import { AlertTriangle, Mail, RefreshCcw, Home, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ErrorFallbackProps {
  error?: Error | null;
  errorInfo?: string;
  context?: string;
}

export function ErrorFallback({ error, context }: ErrorFallbackProps) {
  const [form, setForm] = useState({ name: "", email: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/emergency-ticket", {
        ...form,
        errorDetails: {
          message: error?.message,
          stack: error?.stack,
          context,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        },
      });
      setSubmitted(true);
    } catch {
      toast({
        title: "Couldn't submit",
        description: "Please email us directly at contact@removefromreddit.com",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-7 h-7 text-green-600" />
        </div>
        <h1 className="font-satoshi text-2xl font-black text-gray-950 tracking-[-0.03em] mb-2">
          We've got it
        </h1>
        <p className="text-gray-500 text-center max-w-sm mb-8">
          Our team has been notified and will follow up shortly.
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="h-11 px-8 bg-gray-950 hover:bg-gray-800 text-white font-semibold rounded-xl"
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Minimal header */}
      <div className="border-b border-gray-100 px-6 py-4 flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-950 rounded-lg flex items-center justify-center flex-shrink-0">
          <SiReddit className="text-orange-500 text-base" />
        </div>
        <span className="font-satoshi text-lg font-black tracking-[-0.03em] text-gray-950">RepShield</span>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">

          {/* Error icon + headline */}
          <div className="mb-10 text-center">
            <div className="inline-flex w-14 h-14 rounded-full bg-orange-50 items-center justify-center mb-5">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </div>
            <h1 className="font-satoshi text-3xl font-black text-gray-950 tracking-[-0.03em] mb-3">
              Something went wrong
            </h1>
            <p className="text-gray-500 leading-relaxed">
              The error has been logged automatically. Try refreshing — if it keeps happening, use the form below.
            </p>
          </div>

          {/* Primary action row */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            <Button
              onClick={() => window.location.reload()}
              className="h-11 px-6 bg-gray-950 hover:bg-gray-800 text-white font-semibold rounded-xl gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Try again
            </Button>
            <Button
              onClick={() => (window.location.href = "/")}
              variant="outline"
              className="h-11 px-6 rounded-xl gap-2 border-gray-200"
            >
              <Home className="w-4 h-4" />
              Go home
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-xs text-gray-400 uppercase tracking-widest">
                or get help directly
              </span>
            </div>
          </div>

          {/* Contact options */}
          <div className="grid grid-cols-2 gap-3 mb-10">
            <a
              href="mailto:contact@removefromreddit.com"
              className="flex items-center gap-2.5 h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-300 hover:text-gray-900 transition-colors"
            >
              <Mail className="w-4 h-4 flex-shrink-0 text-gray-400" />
              <span className="truncate">Email support</span>
            </a>
            <a
              href="https://t.me/repshield"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-300 hover:text-gray-900 transition-colors"
            >
              <SiTelegram className="w-4 h-4 flex-shrink-0 text-[#0088CC]" />
              Telegram (fast)
            </a>
          </div>

          {/* Support form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-10 rounded-lg border-gray-200 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-10 rounded-lg border-gray-200 text-sm"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">What were you doing?</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of what happened…"
                className="rounded-lg border-gray-200 text-sm resize-none"
                rows={3}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl gap-2"
            >
              {isSubmitting ? "Sending…" : <>Send report <ArrowRight className="w-4 h-4" /></>}
            </Button>
          </form>

          {/* Dev error details */}
          {process.env.NODE_ENV === "development" && error && (
            <details className="mt-10 text-xs text-gray-400">
              <summary className="cursor-pointer font-semibold text-gray-500 mb-2">Dev: error details</summary>
              <pre className="whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-xl p-4 overflow-auto text-[11px] leading-relaxed">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
