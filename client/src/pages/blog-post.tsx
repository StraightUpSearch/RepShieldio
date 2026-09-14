import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { Calendar, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SEOHead from "@/components/seo-head";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  readingTime: number;
  publishedAt: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
}

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug;

  const { data: post, isLoading, isError } = useQuery<BlogPost>({
    queryKey: [`/api/blog/posts/${slug}`],
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-20 max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="space-y-3 pt-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-20 max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article not found</h1>
          <p className="text-gray-500 mb-8">This article may have been removed or the URL is incorrect.</p>
          <Link href="/blog" className="text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1 justify-center">
            <ArrowLeft className="w-4 h-4" /> Back to blog
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={post.metaTitle || post.title}
        description={post.metaDescription || post.excerpt}
        keywords={post.keywords}
      />
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-20">
          {/* Article header */}
          <div className="bg-gray-950 text-white py-16">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <Link href="/blog" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Blog
              </Link>
              <div className="flex items-center gap-3 text-sm text-gray-400 mb-5">
                <span className="bg-orange-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">{post.category}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readingTime} min read
                </span>
              </div>
              <h1 className="font-satoshi text-3xl sm:text-4xl font-black tracking-[-0.03em] leading-tight">
                {post.title}
              </h1>
              <p className="mt-4 text-gray-400 text-lg leading-relaxed">{post.excerpt}</p>
              <p className="mt-5 text-sm text-gray-500">By {post.author}</p>
            </div>
          </div>

          {/* Article body */}
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="prose prose-gray prose-lg max-w-none
              prose-headings:font-satoshi prose-headings:font-black prose-headings:tracking-tight prose-headings:text-gray-950
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-p:text-gray-600 prose-p:leading-relaxed
              prose-strong:text-gray-900 prose-strong:font-semibold
              prose-li:text-gray-600
              prose-a:text-orange-500 prose-a:font-medium prose-a:no-underline hover:prose-a:text-orange-600
              prose-blockquote:border-orange-400 prose-blockquote:text-gray-600
            ">
              <ReactMarkdown
                components={{
                  a: ({ href, children }) => {
                    // Internal links — use regular <a> (wouter handles SPA routing)
                    if (href?.startsWith("/")) {
                      return <Link href={href}>{children}</Link>;
                    }
                    return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
                  },
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* CTA box */}
            <div className="mt-14 bg-gray-950 rounded-2xl p-8 text-white text-center">
              <h2 className="font-satoshi text-2xl font-black tracking-tight mb-3">
                Ready to remove that post?
              </h2>
              <p className="text-gray-400 mb-6">
                Get a free eligibility review — no charge if we can't remove it.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
                >
                  Get a free quote <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link
                  href="/scan"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors"
                >
                  Free brand scan
                </Link>
              </div>
            </div>

            {/* Back to blog */}
            <div className="mt-10 pt-8 border-t border-gray-100">
              <Link href="/blog" className="inline-flex items-center gap-1.5 text-orange-500 hover:text-orange-600 font-medium transition-colors">
                <ArrowLeft className="w-4 h-4" /> More articles
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
