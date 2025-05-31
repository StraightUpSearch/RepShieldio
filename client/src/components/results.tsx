import { Laptop, ShoppingCart } from "lucide-react";

export default function Results() {
  const metrics = [
    { value: "95%+", label: "Removal Success Rate", color: "text-navy-deep" },
    { value: "24hr", label: "Average Response Time", color: "text-reddit-orange" },
    { value: "1,650+", label: "Posts Successfully Removed", color: "text-success-green" },
    { value: "$3.2M", label: "Revenue Protected", color: "text-purple-600" }
  ];

  const caseStudies = [
    {
      icon: <Laptop className="w-8 h-8 text-blue-600" />,
      type: "SaaS Startup",
      title: "Project Management Tool",
      problem: "A competitor posted false claims about security vulnerabilities across 8 subreddits, causing a 40% drop in trial signups within 72 hours.",
      solution: [
        "Documented false security claims",
        "Filed violation reports with evidence",
        "Escalated to Reddit legal team",
        "Monitored for additional posts"
      ],
      results: [
        { metric: "8/8", label: "Posts Removed" },
        { metric: "36hrs", label: "Complete Removal" },
        { metric: "+65%", label: "Signups Recovered" }
      ],
      bgColor: "bg-blue-100"
    },
    {
      icon: <ShoppingCart className="w-8 h-8 text-orange-600" />,
      type: "E-commerce Brand",
      title: "Premium Electronics",
      problem: "Fake reviews claiming products were counterfeit spread across Reddit communities, ranking #3 in Google searches for their brand name.",
      solution: [
        "Identified sockpuppet account patterns",
        "Provided authenticity documentation",
        "Coordinated with subreddit moderators",
        "Implemented ongoing monitoring"
      ],
      results: [
        { metric: "24", label: "Fake Reviews Removed" },
        { metric: "5 days", label: "Full Resolution" },
        { metric: "+180%", label: "Sales Recovery" }
      ],
      bgColor: "bg-orange-100"
    }
  ];

  return (
    <section id="results" className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Proven Results That Protect Your Revenue
          </h2>
          <p className="text-xl text-gray-600">
            Real case studies from businesses we've helped reclaim their Reddit reputation
          </p>
        </div>
        
        {/* Success Metrics */}
        <div className="grid md:grid-cols-4 gap-8 mb-16">
          {metrics.map((metric, index) => (
            <div key={index} className="text-center bg-white p-6 rounded-xl shadow-lg">
              <div className={`text-4xl font-bold ${metric.color} mb-2`}>{metric.value}</div>
              <div className="text-gray-600">{metric.label}</div>
            </div>
          ))}
        </div>
        
        {/* Case Studies */}
        <div className="grid lg:grid-cols-2 gap-8">
          {caseStudies.map((study, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="flex items-center mb-6">
                <div className={`w-16 h-16 ${study.bgColor} rounded-full flex items-center justify-center mr-4`}>
                  {study.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{study.type}</h3>
                  <p className="text-gray-600">{study.title}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">The Problem:</h4>
                <p className="text-gray-600 text-sm">
                  {study.problem}
                </p>
              </div>
              
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Our Solution:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {study.solution.map((item, itemIndex) => (
                    <li key={itemIndex}>• {item}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-success-green/10 p-4 rounded-lg">
                <h4 className="font-semibold text-success-green mb-2">Results:</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {study.results.map((result, resultIndex) => (
                    <div key={resultIndex}>
                      <div className="text-2xl font-bold text-success-green">{result.metric}</div>
                      <div className="text-xs text-gray-600">{result.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
