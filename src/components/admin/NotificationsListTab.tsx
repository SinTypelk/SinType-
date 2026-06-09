import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Edit2, Toggle2 } from "lucide-react";
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
import type { Notification } from "@/lib/admin-content-db-service";
import {
  adminFetchNotifications,
  adminCreateNotification,
  adminUpdateNotification,
  adminDeleteNotification,
  adminToggleNotificationActive,
} from "@/lib/admin-content-db-service";

export function NotificationsListTab() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    link: "",
    is_active: true,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetchNotifications();
      setNotifications(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load notifications");
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
      link: "",
      is_active: true,
    });
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (notification: Notification) => {
    setFormData({
      title: notification.title,
      message: notification.message,
      link: notification.link || "",
      is_active: notification.is_active,
    });
    setEditingId(notification.id);
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
        await adminUpdateNotification(editingId, {
          title: formData.title,
          message: formData.message,
          link: formData.link || null,
          is_active: formData.is_active,
        });
        toast.success("Notification updated");
      } else {
        await adminCreateNotification({
          title: formData.title,
          message: formData.message,
          link: formData.link || null,
          is_active: formData.is_active,
        });
        toast.success("Notification created");
      }
      await load();
      setModalOpen(false);
      resetForm();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save notification");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this notification?")) return;

    setDeleting(id);
    try {
      await adminDeleteNotification(id);
      toast.success("Notification deleted");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete notification");
    } finally {
      setDeleting(null);
    }
  };

  const toggleActive = async (notification: Notification, next: boolean) => {
    setToggling(notification.id);
    try {
      await adminToggleNotificationActive(notification.id, next);
      toast.success(next ? "Notification activated" : "Notification deactivated");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update notification");
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading notifications…
      </div>
    );
  }

  return (
    <Card className="border-border/60 bg-card/60">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Manage Notifications</CardTitle>
            <CardDescription>View, edit, and delete existing notifications</CardDescription>
          </div>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddModal} size="sm">
                <Plus className="h-4 w-4 mr-2" /> Add Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="border-border/60 bg-background">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Notification" : "Add Notification"}</DialogTitle>
                <DialogDescription>
                  {editingId
                    ? "Update the notification details"
                    : "Create a new notification that will appear in the navbar bell and messages page"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Feature announcement"
                  />
                </div>
                <div>
                  <Label>Message *</Label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Notification message"
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Link (optional)</Label>
                  <Input
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="https://example.com or /page"
                    type="url"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Optional URL to link from the notification
                  </p>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                  <Label htmlFor="notification-active">Active</Label>
                  <Switch
                    id="notification-active"
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
                    "Save Notification"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notifications yet. Add one to get started.</p>
        ) : (
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className="font-medium max-w-[120px] truncate">
                      {notification.title}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {notification.message}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate text-xs">
                      {notification.link ? (
                        <code className="text-[var(--neon-cyan)]">{notification.link}</code>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={notification.is_active}
                        disabled={toggling === notification.id}
                        onCheckedChange={(checked) => toggleActive(notification, checked)}
                        aria-label={`Toggle ${notification.title}`}
                      />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {notification.created_at
                        ? new Date(notification.created_at).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(notification)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(notification.id)}
                          disabled={deleting === notification.id}
                          className="text-destructive"
                        >
                          {deleting === notification.id ? (
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
