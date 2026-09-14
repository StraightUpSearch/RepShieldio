import { useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SiReddit } from 'react-icons/si';
import { Mail, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

export default function Contact() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [redditUrl, setRedditUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [email, setEmail] = useState('');
  const [showEmailStep, setShowEmailStep] = useState(false);
  const [showGeneralForm, setShowGeneralForm] = useState(false);
  const [generalForm, setGeneralForm] = useState({ name: '', email: '', message: '' });
  const [generalSent, setGeneralSent] = useState(false);
  const [generalSubmitting, setGeneralSubmitting] = useState(false);

  const submitQuote = useMutation({
    mutationFn: async (data: { redditUrl: string; email: string }) =>
      await apiRequest('POST', '/api/quote-request', data),
    onSuccess: () => {
      setLocation(`/ticket-status?email=${encodeURIComponent(email)}&submitted=1`);
    },
    onError: () => {
      toast({ title: 'Submission failed', description: 'Please try again or email us directly.', variant: 'destructive' });
    },
  });

  const handleUrlBlur = () => {
    if (redditUrl && !redditUrl.includes('reddit.com')) {
      setUrlError('Please enter a valid reddit.com URL');
    } else {
      setUrlError('');
    }
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!redditUrl.trim() || !redditUrl.includes('reddit.com')) {
      setUrlError('Please enter a valid reddit.com URL');
      return;
    }
    if (!showEmailStep) { setShowEmailStep(true); return; }
    if (!email.trim()) {
      toast({ title: 'Email required', description: 'We need an email to send your quote.', variant: 'destructive' });
      return;
    }
    submitQuote.mutate({ redditUrl, email });
  };

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralSubmitting(true);
    try {
      await fetch('/api/audit-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: generalForm.name,
          email: generalForm.email,
          company: 'Not provided',
          message: generalForm.message,
        }),
      });
      setGeneralSent(true);
    } catch {
      toast({ title: 'Error', description: 'Failed to send. Please email us directly.', variant: 'destructive' });
    } finally {
      setGeneralSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="relative pt-28 pb-20 bg-white overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" aria-hidden="true" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h1 className="font-satoshi text-5xl lg:text-6xl font-black text-gray-950 tracking-[-0.04em] leading-[1.04] mb-5">
              Get a removal<br />quote — free.
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed">
              Paste the Reddit URL below. A case manager reviews eligibility and sends
              a quote within 4 hours. No upfront payment.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_360px] gap-12 items-start">
            {/* Quote form */}
            <div>
              <form onSubmit={handleQuoteSubmit} className="space-y-3 max-w-[540px]">
                {!showEmailStep ? (
                  <>
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <SiReddit className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500 pointer-events-none" />
                        <Input
                          type="url"
                          placeholder="https://reddit.com/r/..."
                          value={redditUrl}
                          onChange={(e) => { setRedditUrl(e.target.value); if (urlError) setUrlError(''); }}
                          onBlur={handleUrlBlur}
                          className={`pl-12 h-14 text-base border hover:border-gray-300 focus:ring-1 rounded-xl shadow-sm ${urlError ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-orange-400 focus:ring-orange-200'}`}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="h-14 px-7 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors whitespace-nowrap shadow-sm"
                      >
                        Get quote
                      </Button>
                    </div>
                    {urlError && (
                      <p className="text-sm text-red-500 -mt-1">{urlError}</p>
                    )}
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                      <span className="text-xs text-gray-400 mr-2">URL:</span>
                      <span className="text-sm text-gray-700 break-all">{redditUrl}</span>
                    </div>
                    <div className="flex gap-3">
                      <Input
                        type="email"
                        placeholder="Your email for the quote"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 h-14 border border-gray-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-200 rounded-xl shadow-sm"
                        required
                      />
                      <Button
                        type="submit"
                        disabled={submitQuote.isPending}
                        className="h-14 px-7 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl whitespace-nowrap"
                      >
                        {submitQuote.isPending ? 'Sending…' : 'Send quote'}
                      </Button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEmailStep(false)}
                      className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Change URL
                    </button>
                  </div>
                )}
                <p className="text-sm text-gray-400">
                  Step 1: Paste URL · Step 2: We send a quote · Step 3: We remove it
                </p>
              </form>

              {/* Trust row */}
              <div className="flex flex-wrap items-center gap-5 mt-8 text-sm text-gray-400">
                <span>No upfront payment</span>
                <span className="w-px h-3 bg-gray-200 inline-block" aria-hidden="true" />
                <span>95% success rate</span>
                <span className="w-px h-3 bg-gray-200 inline-block" aria-hidden="true" />
                <span>Legal and confidential</span>
              </div>
            </div>

            {/* Info panel */}
            <div className="space-y-0 border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="font-satoshi text-sm font-black text-gray-950 uppercase tracking-wider mb-0.5">
                  What happens next
                </h2>
              </div>
              {[
                { step: '1', text: 'We review the content and assess removal grounds', time: 'Within 4 hrs' },
                { step: '2', text: 'You receive a fixed-price removal quote by email', time: 'Same day' },
                { step: '3', text: 'Our legal team files the removal via official Reddit channels', time: 'On approval' },
                { step: '4', text: 'You pay only once the content has been removed', time: 'On success' },
              ].map((item) => (
                <div key={item.step} className="px-6 py-4 border-b border-gray-50 flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-gray-950 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-white">{item.step}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">{item.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
              <div className="px-6 py-5 flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-500">
                  Questions? <a href="mailto:contact@removefromreddit.com" className="text-gray-900 font-medium hover:underline">contact@removefromreddit.com</a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* General enquiry */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <h2 className="font-satoshi text-2xl font-black text-gray-950 tracking-[-0.03em] mb-2">
              Something else on your mind?
            </h2>
            <p className="text-gray-500 mb-6">
              Not every situation is a Reddit URL. Drop us a message and we'll reply within 24 hours.
            </p>

            {!showGeneralForm && !generalSent && (
              <button
                onClick={() => setShowGeneralForm(true)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-950 hover:text-orange-500 transition-colors"
              >
                Send a general message <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {showGeneralForm && !generalSent && (
              <form onSubmit={handleGeneralSubmit} className="space-y-4 max-w-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gen-name" className="text-sm font-medium text-gray-700">Name</Label>
                    <Input
                      id="gen-name"
                      className="mt-1 h-11"
                      value={generalForm.name}
                      onChange={(e) => setGeneralForm({ ...generalForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="gen-email" className="text-sm font-medium text-gray-700">Email</Label>
                    <Input
                      id="gen-email"
                      type="email"
                      className="mt-1 h-11"
                      value={generalForm.email}
                      onChange={(e) => setGeneralForm({ ...generalForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="gen-message" className="text-sm font-medium text-gray-700">Message</Label>
                  <Textarea
                    id="gen-message"
                    className="mt-1"
                    rows={5}
                    value={generalForm.message}
                    onChange={(e) => setGeneralForm({ ...generalForm, message: e.target.value })}
                    placeholder="Describe what you need help with…"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={generalSubmitting}
                  className="h-11 px-7 bg-gray-950 hover:bg-gray-800 text-white font-semibold rounded-lg"
                >
                  {generalSubmitting ? 'Sending…' : 'Send message'}
                </Button>
              </form>
            )}

            {generalSent && (
              <div className="flex items-center gap-3 text-green-700 bg-green-50 border border-green-100 rounded-xl px-5 py-4 max-w-lg">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">Message received — we'll reply within 24 hours.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
