import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Eye, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  featuredImage?: string;
  author: string;
  status: 'draft' | 'published' | 'archived';
  category: string;
  tags: string[];
  readingTime: number;
  publishedAt?: string;
  createdAt: string;
}

export default function BlogAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/admin/blog/posts'],
  });

  const createPost = useMutation({
    mutationFn: async (data: Partial<BlogPost>) => {
      return await apiRequest("POST", "/api/admin/blog/posts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/posts'] });
      setShowCreateForm(false);
      toast({ title: "Success", description: "Blog post created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create blog post", variant: "destructive" });
    }
  });

  const updatePost = useMutation({
    mutationFn: async (data: Partial<BlogPost>) => {
      return await apiRequest("PATCH", `/api/admin/blog/posts/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/posts'] });
      setIsEditing(false);
      setSelectedPost(null);
      toast({ title: "Success", description: "Blog post updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update blog post", variant: "destructive" });
    }
  });

  const deletePost = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/blog/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/posts'] });
      toast({ title: "Success", description: "Blog post deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete blog post", variant: "destructive" });
    }
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const estimateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const PostForm = ({ post, onSave, onCancel }: { 
    post?: Partial<BlogPost>, 
    onSave: (data: Partial<BlogPost>) => void, 
    onCancel: () => void 
  }) => {
    const [formData, setFormData] = useState({
      title: post?.title || '',
      slug: post?.slug || '',
      excerpt: post?.excerpt || '',
      content: post?.content || '',
      metaTitle: post?.metaTitle || '',
      metaDescription: post?.metaDescription || '',
      keywords: post?.keywords || '',
      featuredImage: post?.featuredImage || '',
      author: post?.author || 'RepShield Team',
      status: post?.status || 'draft',
      category: post?.category || '',
      tags: post?.tags?.join(', ') || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const processedData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.title),
        readingTime: estimateReadingTime(formData.content),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        publishedAt: formData.status === 'published' ? new Date().toISOString() : undefined,
        ...(post?.id && { id: post.id })
      };

      onSave(processedData);
    };

    return (
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    title: e.target.value,
                    slug: generateSlug(e.target.value)
                  }));
                }}
                placeholder="Enter blog post title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Slug</label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="url-friendly-slug"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write your blog post content here..."
              rows={10}
              required
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select value={formData.status} onValueChange={(value: string) => setFormData(prev => ({ ...prev, status: value as 'draft' | 'published' | 'archived' }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Reputation Management"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Author</label>
              <Input
                value={formData.author}
                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                placeholder="Author name"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={createPost.isPending || updatePost.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {post?.id ? 'Update Post' : 'Create Post'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Blog Management</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {showCreateForm && (
        <PostForm
          onSave={(data) => createPost.mutate(data)}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {isEditing && selectedPost && (
        <PostForm
          post={selectedPost}
          onSave={(data) => updatePost.mutate(data)}
          onCancel={() => {
            setIsEditing(false);
            setSelectedPost(null);
          }}
        />
      )}

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8">Loading posts...</div>
        ) : posts && posts.length > 0 ? (
          posts.map((post) => (
            <Card key={post.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{post.title}</h3>
                    <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                      {post.status}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-2">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>By {post.author}</span>
                    <span>•</span>
                    <span>{post.category}</span>
                    <span>•</span>
                    <span>{post.readingTime} min read</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedPost(post);
                      setIsEditing(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this post?')) {
                        deletePost.mutate(post.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No blog posts yet</h3>
            <p className="text-gray-600 mb-4">Create your first blog post to start building your content strategy.</p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Post
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}