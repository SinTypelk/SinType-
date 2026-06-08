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
import { Switch } from "@/components/ui/switch";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import type { SiteBanner } from "@/lib/admin-content-db-service";
import {
  adminFetchBanners,
  adminCreateBanner,
  adminUpdateBanner,
  adminDeleteBanner,
} from "@/lib/admin-content-db-service";

const COLOR_LABELS: Record<SiteBanner["color_scheme"], string> = {
  warning: "Warning",
  info: "Info",
  success: "Success",
  danger: "Danger",
};

export function BannersTab() {
  const [banners, setBanners] = useState<SiteBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    show_on: "download" as SiteBanner["show_on"],
    color_scheme: "info" as SiteBanner["color_scheme"],
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

  const toggleActive = async (banner: SiteBanner, next: boolean) => {
    setToggling(banner.id);
    try {
      await adminUpdateBanner(banner.id, { is_active: next });
      toast.success(next ? "Banner activated" : "Banner deactivated");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update banner");
    } finally {
      setToggling(null);
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
        <div className="flex items-center justify-between gap-4">
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
                    <Select
                      value={formData.show_on}
                      onValueChange={(v) =>
                        setFormData({ ...formData, show_on: v as SiteBanner["show_on"] })
                      }
                    >
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
                    <Select
                      value={formData.color_scheme}
                      onValueChange={(v) =>
                        setFormData({ ...formData, color_scheme: v as SiteBanner["color_scheme"] })
                      }
                    >
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
                <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                  <Label htmlFor="banner-active">Active</Label>
                  <Switch
                    id="banner-active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                </div>
                <Button onClick={handleSave} disabled={submitting} className="w-full">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                    </>
                  ) : (
                    "Save Banner"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {banners.length === 0 ? (
          <p className="text-sm text-muted-foreground">No banners yet. Add one to get started.</p>
        ) : (
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Show On</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell className="font-medium max-w-[140px] truncate">
                      {banner.title}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {banner.message}
                    </TableCell>
                    <TableCell className="capitalize">{banner.show_on}</TableCell>
                    <TableCell>{COLOR_LABELS[banner.color_scheme]}</TableCell>
                    <TableCell>
                      <Switch
                        checked={banner.is_active}
                        disabled={toggling === banner.id}
                        onCheckedChange={(checked) => toggleActive(banner, checked)}
                        aria-label={`Toggle ${banner.title}`}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
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
                          {deleting === banner.id ? (
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
