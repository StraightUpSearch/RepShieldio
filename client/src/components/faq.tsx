import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const faqs = [
    {
      question: "Is this service legal and ethical?",
      answer: "Absolutely. We only remove content that violates Reddit's terms of service or applicable laws. This includes defamatory, false, or harassing content. We never remove legitimate criticism or valid negative feedback."
    },
    {
      question: "How do you determine if content can be removed?",
      answer: "Our legal team reviews each case against Reddit's content policy, terms of service, and applicable laws. We only proceed with removal requests for content that clearly violates these guidelines, such as false statements, harassment, or copyright infringement."
    },
    {
      question: "What's your success rate for content removal?",
      answer: "We maintain a 98.2% success rate for eligible content removal. This high rate comes from our thorough vetting process - we only take on cases where clear violations exist. If we can't remove content, you don't pay."
    },
    {
      question: "How long does the removal process take?",
      answer: "Most removals are completed within 24-72 hours. Timeline depends on the severity of violations, subreddit moderation responsiveness, and whether escalation to Reddit administrators is required. We provide regular updates throughout the process."
    },
    {
      question: "Do you work with all types of businesses?",
      answer: "We work with legitimate businesses facing false or defamatory content. This includes SMBs, SaaS companies, e-commerce stores, and service providers. We do not work with businesses involved in illegal activities or those trying to suppress legitimate criticism."
    },
    {
      question: "What happens if the content gets reposted?",
      answer: "Our monitoring service tracks for reposts and similar content. Professional and Enterprise plans include ongoing protection, automatically detecting and addressing new violations. We also work to identify patterns and prevent future attacks."
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about our ethical Reddit reputation management
          </p>
        </div>
        
        <Accordion type="single" collapsible className="space-y-6">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-white rounded-lg shadow-sm border border-gray-100"
            >
              <AccordionTrigger className="px-6 py-4 text-left text-lg font-semibold text-gray-900 hover:no-underline hover:text-navy-deep">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-gray-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
