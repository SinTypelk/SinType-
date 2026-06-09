import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Edit2, Eye, Star, Download } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import type { BlogPost } from "@/lib/admin-content-db-service";
import {
  adminFetchBlogPosts,
  adminCreateBlogPost,
  adminUpdateBlogPost,
  adminDeleteBlogPost,
  adminToggleBlogPostPublished,
  adminToggleBlogPostFeatured,
  generateBlogSitemap,
} from "@/lib/admin-content-db-service";

// Helper: Generate URL-friendly slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function BlogPostsTab() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [generatingSitemap, setGeneratingSitemap] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    date: new Date().toISOString().split("T")[0],
    read_time: 5,
    tags: "",
    short_description: "",
    html_content: "",
    is_published: false,
    is_featured: false,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetchBlogPosts();
      setPosts(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      date: new Date().toISOString().split("T")[0],
      read_time: 5,
      tags: "",
      short_description: "",
      html_content: "",
      is_published: false,
      is_featured: false,
    });
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (post: BlogPost) => {
    setFormData({
      title: post.title,
      slug: post.slug,
      date: post.date,
      read_time: post.read_time,
      tags: Array.isArray(post.tags) ? post.tags.join(", ") : post.tags || "",
      short_description: post.short_description,
      html_content: post.html_content,
      is_published: post.is_published,
      is_featured: post.is_featured,
    });
    setEditingId(post.id);
    setModalOpen(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleSave = async () => {
    if (
      !formData.title.trim() ||
      !formData.slug.trim() ||
      !formData.short_description.trim() ||
      !formData.html_content.trim()
    ) {
      toast.error("Title, slug, description, and HTML content are required");
      return;
    }

    setSubmitting(true);
    try {
      const tagsArray = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);

      const postData = {
        title: formData.title,
        slug: formData.slug,
        date: formData.date,
        read_time: formData.read_time,
        tags: tagsArray,
        short_description: formData.short_description,
        html_content: formData.html_content,
        is_published: formData.is_published,
        is_featured: formData.is_featured,
      };

      if (editingId) {
        await adminUpdateBlogPost(editingId, postData);
        toast.success("Blog post updated");
      } else {
        await adminCreateBlogPost(postData);
        toast.success("Blog post created");
      }

      await load();
      setModalOpen(false);
      resetForm();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save blog post");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this blog post? This cannot be undone.")) return;

    setDeleting(id);
    try {
      await adminDeleteBlogPost(id);
      toast.success("Blog post deleted");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete blog post");
    } finally {
      setDeleting(null);
    }
  };

  const togglePublished = async (post: BlogPost, nextState: boolean) => {
    setToggling(post.id);
    try {
      await adminToggleBlogPostPublished(post.id, nextState);
      toast.success(nextState ? "Post published" : "Post unpublished");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update post");
    } finally {
      setToggling(null);
    }
  };

  const toggleFeatured = async (post: BlogPost, nextState: boolean) => {
    setToggling(post.id);
    try {
      await adminToggleBlogPostFeatured(post.id, nextState);
      toast.success(nextState ? "Post featured" : "Post unfeatured");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update post");
    } finally {
      setToggling(null);
    }
  };

  const handleGenerateSitemap = async () => {
    setGeneratingSitemap(true);
    try {
      const xml = await generateBlogSitemap();
      const blob = new Blob([xml], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "blog-sitemap.xml";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Sitemap downloaded successfully");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate sitemap");
    } finally {
      setGeneratingSitemap(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading blog posts…
      </div>
    );
  }

  return (
    <Card className="border-border/60 bg-card/60">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Blog Posts</CardTitle>
            <CardDescription>
              Manage your blog articles and content
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerateSitemap}
              disabled={generatingSitemap}
            >
              {generatingSitemap ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" /> Sitemap XML
                </>
              )}
            </Button>
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddModal} size="sm">
                  <Plus className="h-4 w-4 mr-2" /> New Post
                </Button>
              </DialogTrigger>
              <DialogContent className="border-border/60 bg-background max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? "Edit Post" : "Create New Post"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingId ? "Update post details" : "Write a new blog post"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={handleTitleChange}
                      placeholder="Post title"
                    />
                  </div>

                  <div>
                    <Label>Slug *</Label>
                    <Input
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      placeholder="auto-generated from title"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Auto-generated, but you can edit it
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date *</Label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Read Time (minutes) *</Label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.read_time}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            read_time: parseInt(e.target.value) || 5,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Tags</Label>
                    <Input
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                      placeholder="Separate with commas: React, JavaScript, Web"
                    />
                  </div>

                  <div>
                    <Label>Short Description *</Label>
                    <Textarea
                      value={formData.short_description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          short_description: e.target.value,
                        })
                      }
                      placeholder="Brief summary for previews"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>HTML Content *</Label>
                    <Textarea
                      value={formData.html_content}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          html_content: e.target.value,
                        })
                      }
                      placeholder="HTML markup for the post"
                      rows={8}
                      className="font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      HTML will be rendered as-is. Use semantic HTML tags.
                    </p>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                    <Label htmlFor="post-published">Publish</Label>
                    <Switch
                      id="post-published"
                      checked={formData.is_published}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          is_published: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                    <Label htmlFor="post-featured">Featured</Label>
                    <Switch
                      id="post-featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          is_featured: checked,
                        })
                      }
                    />
                  </div>

                  <Button
                    onClick={handleSave}
                    disabled={submitting}
                    className="w-full"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Saving…
                      </>
                    ) : (
                      "Save Post"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No blog posts yet. Create your first post!
          </p>
        ) : (
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Featured</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium max-w-[180px] truncate">
                      {post.title}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(post.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={post.is_published}
                          disabled={toggling === post.id}
                          onCheckedChange={(checked) =>
                            togglePublished(post, checked)
                          }
                          aria-label={`Publish ${post.title}`}
                        />
                        <span className="text-xs text-muted-foreground">
                          {post.is_published ? "Published" : "Draft"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {post.is_featured ? (
                        <button
                          onClick={() => toggleFeatured(post, false)}
                          className="text-yellow-500 hover:text-yellow-400"
                          title="Remove from featured"
                          disabled={toggling === post.id}
                        >
                          <Star className="h-4 w-4 fill-current" />
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleFeatured(post, true)}
                          className="text-muted-foreground hover:text-yellow-500"
                          title="Mark as featured"
                          disabled={toggling === post.id}
                        >
                          <Star className="h-4 w-4" />
                        </button>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[120px]">
                      <div className="flex gap-1 flex-wrap">
                        {Array.isArray(post.tags) && post.tags.length > 0
                          ? post.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-muted px-2 py-1 rounded"
                              >
                                {tag}
                              </span>
                            ))
                          : null}
                        {Array.isArray(post.tags) && post.tags.length > 2 ? (
                          <span className="text-xs text-muted-foreground px-2 py-1">
                            +{post.tags.length - 2}
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(post)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(post.id)}
                          disabled={deleting === post.id}
                          className="text-destructive"
                        >
                          {deleting === post.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
