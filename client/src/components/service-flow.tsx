import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const steps = [
  {
    step: 1,
    title: "Paste the URL",
    description:
      "Submit the Reddit post, thread or comment link. We review it for removal eligibility within 4 hours and send a quote. The sooner you act, the fewer people see it — most Reddit posts hit their peak visibility in the first 72 hours.",
    action: "Start a case",
    href: "/contact",
  },
  {
    step: 2,
    title: "Track your case",
    description:
      "Monitor progress in real time through your dashboard. We update you at every stage, from filing through to confirmation.",
    action: "View dashboard",
    href: "/dashboard",
  },
  {
    step: 3,
    title: "Content removed",
    description:
      "Our legal team removes the content through official Reddit channels and sends written confirmation. You pay only on success.",
    action: "Check case status",
    href: "/ticket-status",
  },
];

export default function ServiceFlow() {
  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 max-w-xl">
          <h2 className="font-satoshi text-4xl font-black text-gray-950 tracking-[-0.03em] mb-4">
            Three steps, start to finish
          </h2>
          <p className="text-lg text-gray-500">
            Most cases are closed before the week is out.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid lg:grid-cols-3 gap-10">
          {/* Horizontal connector — desktop only */}
          <div
            className="hidden lg:block absolute top-5 left-[calc(33.33%+28px)] right-[calc(33.33%+28px)] h-px bg-gray-200"
            aria-hidden="true"
          />

          {steps.map((step) => (
            <div key={step.step}>
              {/* Step number circle */}
              <div className="w-10 h-10 rounded-full bg-gray-950 flex items-center justify-center mb-7 relative z-10 shadow-sm">
                <span className="text-sm font-bold text-white">{step.step}</span>
              </div>

              <h3 className="font-satoshi text-xl font-black text-gray-950 tracking-[-0.02em] mb-3">
                {step.title}
              </h3>
              <p className="text-gray-500 leading-relaxed mb-6 text-base">
                {step.description}
              </p>
              <Link
                href={step.href}
                className="text-sm font-semibold text-gray-900 hover:text-orange-500 transition-colors inline-flex items-center gap-1"
              >
                {step.action}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <div className="mt-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-10 border-t border-gray-100">
          <p className="text-gray-600 text-lg">
            No contracts. No upfront fees. Pay only when it works.
          </p>
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 h-12 rounded-xl shadow-sm transition-colors whitespace-nowrap"
            asChild
          >
            <Link href="/contact">Get a free quote</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
