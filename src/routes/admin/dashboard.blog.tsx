import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  adminCreateBlogPost,
  adminDeleteBlogPost,
  adminFetchAllBlogPosts,
  adminUpdateBlogPost,
} from "@/lib/admin-content-service";
import type { BlogPost } from "@/lib/content-types";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/dashboard/blog")({
  component: BlogManagerPage,
});

type FormState = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  imageUrl: string;
  tags: string;
  isPublished: boolean;
};

const emptyForm = (): FormState => ({
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  imageUrl: "",
  tags: "",
  isPublished: true,
});

function BlogManagerPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPosts(await adminFetchAllBlogPosts());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      body: post.body,
      imageUrl: post.imageUrl ?? "",
      tags: post.tags.join(", "),
      isPublished: post.isPublished,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug || undefined,
        excerpt: form.excerpt,
        body: form.body,
        imageUrl: form.imageUrl || null,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        isPublished: form.isPublished,
      };
      if (editingId) {
        await adminUpdateBlogPost(editingId, payload);
        toast.success("Post updated");
      } else {
        await adminCreateBlogPost(payload);
        toast.success("Post created");
      }
      closeForm();
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    try {
      await adminDeleteBlogPost(id);
      toast.success("Post deleted");
      if (editingId === id) closeForm();
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Content
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Blog Manager</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create, edit, and publish blog posts. Changes appear on the public blog instantly.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-[image:var(--gradient-primary)] text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" /> New post
        </Button>
      </div>

      {showForm && (
        <Card className="border-border/60 bg-card/60">
          <CardHeader>
            <CardTitle>{editingId ? "Edit post" : "New post"}</CardTitle>
            <CardDescription>
              Body supports basic HTML (paragraphs, lists, links). Scripts are stripped on save.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (optional)</Label>
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    placeholder="auto-generated-from-title"
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Body</Label>
                <Textarea
                  id="body"
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  rows={10}
                  required
                  className="font-mono text-sm"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                    placeholder="https://…"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={form.tags}
                    onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                    placeholder="Sinhala Unicode, SEO"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.isPublished}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, isPublished: !!v }))}
                />
                Published (visible on website)
              </label>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving…" : editingId ? "Update post" : "Create post"}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/60 bg-card/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-4 w-4" /> All posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No database posts yet. Static blog articles still show on the site.</p>
          ) : (
            <ul className="divide-y divide-border/60">
              {posts.map((post) => (
                <li key={post.id} className="flex flex-wrap items-start justify-between gap-3 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{post.title}</p>
                    <p className="text-xs text-muted-foreground font-mono">/blog/{post.slug}</p>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {post.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`mr-2 rounded-full px-2 py-0.5 text-[10px] uppercase ${
                        post.isPublished
                          ? "border border-[var(--success)]/40 text-[var(--success)]"
                          : "border border-border text-muted-foreground"
                      }`}
                    >
                      {post.isPublished ? "Live" : "Draft"}
                    </span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(post)}>
                      <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete post?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Remove “{post.title}” from the database. This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(post.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
