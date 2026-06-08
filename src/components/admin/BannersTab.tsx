import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Edit2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { SiteBanner } from "@/lib/admin-content-db-service";
import {
  adminFetchBanners,
  adminCreateBanner,
  adminUpdateBanner,
  adminDeleteBanner,
} from "@/lib/admin-content-db-service";

export function BannersTab() {
  const [banners, setBanners] = useState<SiteBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    show_on: "download" as const,
    color_scheme: "info" as const,
    is_active: false,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetchBanners();
      setBanners(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load banners");
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
      message: "",
      show_on: "download",
      color_scheme: "info",
      is_active: false,
    });
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (banner: SiteBanner) => {
    setFormData({
      title: banner.title,
      message: banner.message,
      show_on: banner.show_on,
      color_scheme: banner.color_scheme,
      is_active: banner.is_active,
    });
    setEditingId(banner.id);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error("Title and message are required");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await adminUpdateBanner(editingId, formData);
        toast.success("Banner updated");
      } else {
        await adminCreateBanner(formData);
        toast.success("Banner created");
      }
      await load();
      setModalOpen(false);
      resetForm();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save banner");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this banner?")) return;

    setDeleting(id);
    try {
      await adminDeleteBanner(id);
      toast.success("Banner deleted");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete banner");
    } finally {
      setDeleting(null);
    }
  };

  const toggleActive = async (banner: SiteBanner) => {
    try {
      await adminUpdateBanner(banner.id, { is_active: !banner.is_active });
      toast.success(banner.is_active ? "Banner hidden" : "Banner shown");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update banner");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading banners…
      </div>
    );
  }

  return (
    <Card className="border-border/60 bg-card/60">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Banners & Notices</CardTitle>
            <CardDescription>Manage site-wide notification banners</CardDescription>
          </div>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddModal} size="sm">
                <Plus className="h-4 w-4 mr-2" /> Add Banner
              </Button>
            </DialogTrigger>
            <DialogContent className="border-border/60 bg-background">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Banner" : "Add Banner"}</DialogTitle>
                <DialogDescription>
                  Create or edit a site banner that appears on selected pages.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Banner title"
                  />
                </div>
                <div>
                  <Label>Message *</Label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Banner message"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Show On</Label>
                    <Select value={formData.show_on} onValueChange={(v) =>
                      setFormData({ ...formData, show_on: v as "download" | "home" | "all" })
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="download">Download Page</SelectItem>
                        <SelectItem value="home">Home Page</SelectItem>
                        <SelectItem value="all">All Pages</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Color Scheme</Label>
                    <Select value={formData.color_scheme} onValueChange={(v) =>
                      setFormData({ ...formData, color_scheme: v as any })
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="warning">Warning (Orange)</SelectItem>
                        <SelectItem value="info">Info (Blue)</SelectItem>
                        <SelectItem value="success">Success (Green)</SelectItem>
                        <SelectItem value="danger">Danger (Red)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
                <Button onClick={handleSave} disabled={submitting} className="w-full">
                  {submitting ? "Saving…" : "Save Banner"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {banners.length === 0 ? (
          <p className="text-sm text-muted-foreground">No banners yet</p>
        ) : (
          <div className="space-y-2">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-border/60 p-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{banner.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{banner.message}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-background/60">
                      {banner.show_on}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-background/60">
                      {banner.color_scheme}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(banner)}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      banner.is_active
                        ? "bg-[var(--success)]/20 text-[var(--success)]"
                        : "bg-background/40 text-muted-foreground"
                    }`}
                  >
                    {banner.is_active ? "Active" : "Inactive"}
                  </button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditModal(banner)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(banner.id)}
                    disabled={deleting === banner.id}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
