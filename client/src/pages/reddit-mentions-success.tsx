import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SEOHead from "@/components/seo-head";

const PACKAGE_LABELS: Record<string, string> = {
  Starter: "Starter — 10 mentions, no links",
  Growth: "Growth — 10 mentions with links",
  Authority: "Authority — 5 premium threads + 10 comments",
};

const steps = [
  { n: "01", title: "We review your order", body: "Within 1 business day we confirm the order details and assign your campaign." },
  { n: "02", title: "We collect your brand details", body: "We'll email you to gather your brand name, competitors, target keywords, and niche." },
  { n: "03", title: "Work begins", body: "Within 48 hours of receiving your info, our team starts identifying and placing in ranking threads." },
  { n: "04", title: "You get the report", body: "A full spreadsheet with live URLs to every mention, subreddit, thread metrics, and rankings." },
];

export default function RedditMentionsSuccess() {
  const [location] = useLocation();
  const sessionId = new URLSearchParams(window.location.search).get("session_id") || "";

  const { data: order } = useQuery({
    queryKey: ["/api/reddit-mentions/order", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/reddit-mentions/order?session_id=${sessionId}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!sessionId,
    staleTime: Infinity,
  });

  const packageLabel = order?.package ? (PACKAGE_LABELS[order.package] || order.package) : null;

  return (
    <>
      <SEOHead
        title="Order Confirmed | Reddit Mentions | RepShield"
        description="Your Reddit brand mention order is confirmed. Here's what happens next."
      />
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-28 pb-20">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

            {/* Success icon */}
            <div className="inline-flex w-16 h-16 rounded-full bg-green-50 items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>

            <h1 className="font-satoshi text-3xl sm:text-4xl font-black text-gray-950 tracking-[-0.03em] mb-3">
              Your order is confirmed
            </h1>

            {packageLabel && (
              <div className="inline-block bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 mb-5">
                <span className="text-sm font-semibold text-gray-700">{packageLabel}</span>
              </div>
            )}

            <p className="text-gray-500 mb-12 leading-relaxed">
              A confirmation email is on its way. Here's what happens next:
            </p>

            {/* Steps */}
            <div className="text-left space-y-6 mb-12">
              {steps.map((s) => (
                <div key={s.n} className="flex gap-5 items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-950 flex items-center justify-center">
                    <span className="font-satoshi text-xs font-black text-white">{s.n}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-950 mb-1">{s.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Question */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-8 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-gray-900">Questions?</span>
              </div>
              <p className="text-sm text-gray-500">
                Reply to your confirmation email or reach us at{" "}
                <a href="mailto:contact@removefromreddit.com" className="text-orange-500 hover:text-orange-600 font-medium">
                  contact@removefromreddit.com
                </a>
              </p>
            </div>

            <Button asChild className="h-12 px-8 bg-gray-950 hover:bg-gray-800 text-white font-semibold rounded-xl">
              <Link href="/">
                Back to home <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
