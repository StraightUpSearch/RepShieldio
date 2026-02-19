import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Calendar, Clock, ArrowRight, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import SEOHead from "@/components/seo-head";
import Header from "@/components/header";
import Footer from "@/components/footer";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  readingTime: number;
  featuredImage?: string;
  publishedAt: string;
}

export default function Blog() {
  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog/posts'],
  });

  const { data: categories } = useQuery<{name: string, slug: string, description: string}[]>({
    queryKey: ['/api/blog/categories'],
  });

  const featuredPosts = posts?.filter(post => post.category === 'featured').slice(0, 2) || [];
  const recentPosts = posts?.filter(post => post.category !== 'featured').slice(0, 6) || [];

  const blogStructuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "RepShield Blog - Reddit Reputation Management Insights",
    "description": "Expert insights on Reddit reputation management, content removal strategies, and brand protection tips.",
    "url": "https://repshield.io/blog",
    "publisher": {
      "@type": "Organization",
      "name": "RepShield",
      "url": "https://repshield.io"
    },
    "blogPost": posts?.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "url": `https://repshield.io/blog/${post.slug}`,
      "datePublished": post.publishedAt,
      "author": {
        "@type": "Person",
        "name": post.author
      },
      "description": post.excerpt
    })) || []
  };

  return (
    <>
      <SEOHead
        title="RepShield Blog - Reddit Reputation Management Tips & Insights"
        description="Expert advice on Reddit content removal, reputation management strategies, and brand protection. Learn how to protect your online reputation with professional insights."
        keywords="reddit reputation management, content removal tips, brand protection, online reputation, reddit removal guide"
        structuredData={blogStructuredData}
      />
      
      <div className="min-h-screen bg-white">
        <Header />
        
        <main className="pt-20">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
                  Reputation Management
                  <span className="text-blue-600"> Insights</span>
                </h1>
                <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
                  Expert strategies, case studies, and actionable tips for protecting your brand reputation across Reddit and social platforms.
                </p>
              </div>
            </div>
          </section>

          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <section className="py-16 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Articles</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  {featuredPosts.map((post) => (
                    <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      {post.featuredImage && (
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          loading="lazy"
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(post.publishedAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {post.readingTime} min read
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-2">
                            {post.tags?.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <Link href={`/blog/${post.slug}`} className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                            Read More <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Categories */}
          {categories && categories.length > 0 && (
            <section className="py-12 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categories.map((category) => (
                    <Link 
                      key={category.slug} 
                      href={`/blog/category/${category.slug}`}
                      className="bg-white p-4 rounded-lg border hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Recent Posts */}
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest Articles</h2>
              
              {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : recentPosts.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {recentPosts.map((post) => (
                    <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      {post.featuredImage && (
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          loading="lazy"
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(post.publishedAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {post.readingTime} min read
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {post.category}
                          </Badge>
                          <Link href={`/blog/${post.slug}`} className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                            Read More <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles yet</h3>
                  <p className="text-gray-600">Check back soon for expert insights on reputation management.</p>
                </div>
              )}
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 bg-blue-600">
            <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Need Immediate Reddit Content Removal?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Don't wait for negative content to damage your reputation. Get professional removal services with 95%+ success rate.
              </p>
              <Link 
                href="/#scanner" 
                className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Start Free Brand Scan <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}