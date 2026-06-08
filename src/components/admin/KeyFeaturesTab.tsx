import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Edit2, GripVertical } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { KeyFeature } from "@/lib/admin-content-db-service";
import {
  adminFetchFeatures,
  adminCreateFeature,
  adminUpdateFeature,
  adminDeleteFeature,
  adminReorderFeatures,
} from "@/lib/admin-content-db-service";

type Page = "home" | "download";

interface FormData {
  icon: string;
  title: string;
  description: string;
  page: Page;
  is_visible: boolean;
}

export function KeyFeaturesTab() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [features, setFeatures] = useState<Record<Page, KeyFeature[]>>({
    home: [],
    download: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<KeyFeature | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    icon: "",
    title: "",
    description: "",
    page: "home",
    is_visible: true,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const homeFeatures = await adminFetchFeatures("home");
      const downloadFeatures = await adminFetchFeatures("download");
      setFeatures({
        home: homeFeatures.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)),
        download: downloadFeatures.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)),
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load features");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setForm({
      icon: "",
      title: "",
      description: "",
      page: currentPage,
      is_visible: true,
    });
    setEditingFeature(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (feature: KeyFeature) => {
    setEditingFeature(feature);
    setForm({
      icon: feature.icon,
      title: feature.title,
      description: feature.description,
      page: feature.page,
      is_visible: feature.is_visible,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.icon.trim() || !form.title.trim() || !form.description.trim()) {
      toast.error("All fields are required");
      return;
    }

    setSaving(true);
    try {
      if (editingFeature) {
        await adminUpdateFeature(editingFeature.id, {
          icon: form.icon,
          title: form.title,
          description: form.description,
          page: form.page,
          is_visible: form.is_visible,
        });
        toast.success("Feature updated");
      } else {
        await adminCreateFeature({
          icon: form.icon,
          title: form.title,
          description: form.description,
          page: form.page,
          is_visible: form.is_visible,
        });
        toast.success("Feature added");
      }

      setIsModalOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this feature?")) return;

    try {
      await adminDeleteFeature(id);
      toast.success("Feature deleted");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  const handleToggleVisibility = async (feature: KeyFeature) => {
    try {
      await adminUpdateFeature(feature.id, {
        ...feature,
        is_visible: !feature.is_visible,
      });
      toast.success("Feature visibility updated");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  };

  const handleDragStart = (e: React.DragEvent, featureId: string) => {
    setDraggedItem(featureId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const currentFeatures = features[currentPage];
    const draggedIndex = currentFeatures.findIndex((f) => f.id === draggedItem);
    const targetIndex = currentFeatures.findIndex((f) => f.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newFeatures = [...currentFeatures];
    [newFeatures[draggedIndex], newFeatures[targetIndex]] = [
      newFeatures[targetIndex],
      newFeatures[draggedIndex],
    ];

    setDraggedItem(null);
    setFeatures({
      ...features,
      [currentPage]: newFeatures,
    });

    try {
      const updates = newFeatures.map((f, idx) => ({
        id: f.id,
        display_order: idx,
      }));
      await adminReorderFeatures(updates);
      toast.success("Features reordered");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to reorder");
      await load();
    }
  };

  const currentFeatures = features[currentPage];

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading features…
      </div>
    );
  }

  return (
    <Card className="border-border/60 bg-card/60">
      <CardHeader>
        <CardTitle>Key Features</CardTitle>
        <CardDescription>Manage features for home and download pages</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={currentPage}
          onValueChange={(v) => setCurrentPage(v as Page)}
          className="w-full"
        >
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="home">Home Page</TabsTrigger>
              <TabsTrigger value="download">Download Page</TabsTrigger>
            </TabsList>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddModal}>
                  <Plus className="h-4 w-4 mr-2" /> Add Feature
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingFeature ? "Edit Feature" : "Add Feature"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingFeature
                      ? "Update the feature details"
                      : `Add a new feature to the ${currentPage} page`}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label>Icon (emoji or text)</Label>
                    <Input
                      value={form.icon}
                      onChange={(e) => setForm({ ...form, icon: e.target.value })}
                      placeholder="🌐"
                      maxLength={10}
                    />
                  </div>

                  <div>
                    <Label>Title</Label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="Feature title"
                    />
                  </div>

                  <div>
                    <Label>Description *</Label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Feature description"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Page</Label>
                    <Select
                      value={form.page}
                      onValueChange={(v) => setForm({ ...form, page: v as Page })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">Home Page</SelectItem>
                        <SelectItem value="download">Download Page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                    <Label htmlFor="feature-visible">Visible</Label>
                    <Switch
                      id="feature-visible"
                      checked={form.is_visible}
                      onCheckedChange={(checked) => setForm({ ...form, is_visible: checked })}
                    />
                  </div>

                  <Button onClick={handleSave} disabled={saving} className="w-full">
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                      </>
                    ) : editingFeature ? (
                      "Update"
                    ) : (
                      "Add"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <TabsContent value="home" className="space-y-2">
            {currentFeatures.length === 0 ? (
              <p className="text-sm text-muted-foreground">No features yet</p>
            ) : (
              currentFeatures.map((feature, idx) => (
                <div
                  key={feature.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, feature.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, feature.id)}
                  className={`flex items-start gap-3 p-3 border border-border/60 rounded-lg hover:bg-accent/50 cursor-move transition ${
                    draggedItem === feature.id ? "opacity-50" : ""
                  }`}
                >
                  <GripVertical className="h-5 w-5 mt-1 text-muted-foreground flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <div className="font-medium">
                      {feature.icon} {feature.title}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {feature.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Switch
                      checked={feature.is_visible}
                      onCheckedChange={() => handleToggleVisibility(feature)}
                      aria-label={`Toggle visibility for ${feature.title}`}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(feature)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(feature.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="download" className="space-y-2">
            {currentFeatures.length === 0 ? (
              <p className="text-sm text-muted-foreground">No features yet</p>
            ) : (
              currentFeatures.map((feature) => (
                <div
                  key={feature.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, feature.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, feature.id)}
                  className={`flex items-start gap-3 p-3 border border-border/60 rounded-lg hover:bg-accent/50 cursor-move transition ${
                    draggedItem === feature.id ? "opacity-50" : ""
                  }`}
                >
                  <GripVertical className="h-5 w-5 mt-1 text-muted-foreground flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <div className="font-medium">
                      {feature.icon} {feature.title}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {feature.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Switch
                      checked={feature.is_visible}
                      onCheckedChange={() => handleToggleVisibility(feature)}
                      aria-label={`Toggle visibility for ${feature.title}`}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(feature)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(feature.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
