import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit2, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BannerModal } from "@/components/admin/BannerModal";
import { FeatureModal } from "@/components/admin/FeatureModal";
import {
  fetchBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  fetchAppVersions,
  updateOrCreateAppVersion,
  fetchFeatures,
  createFeature,
  updateFeature,
  deleteFeature,
  reorderFeatures,
  fetchDownloadPageConfig,
  upsertDownloadPageConfig,
  type SiteBanner,
  type AppVersion,
  type KeyFeature,
  type DownloadPageConfig,
} from "@/lib/app-content-service";

export const Route = createFileRoute("/admin/dashboard/content")({
  component: AppContentPage,
});

function AppContentPage() {
  const [activeTab, setActiveTab] = useState("banners");

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Management
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          App <span className="text-gradient">Content</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage banners, versions, features, and page configuration.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card/60 border border-border/60">
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
        </TabsList>

        <TabsContent value="banners" className="space-y-4">
          <BannersTab />
        </TabsContent>

        <TabsContent value="versions" className="space-y-4">
          <VersionsTab />
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <FeaturesTab />
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <ConfigTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============ BANNERS TAB ============
function BannersTab() {
  const [banners, setBanners] = useState<SiteBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<SiteBanner | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const data = await fetchBanners();
      setBanners(data);
    } catch (err) {
      toast.error("Failed to load banners");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingBanner(null);
    setModalOpen(true);
  };

  const handleEditClick = (banner: SiteBanner) => {
    setEditingBanner(banner);
    setModalOpen(true);
  };

  const handleSubmit = async (formData: Partial<SiteBanner>) => {
    setSubmitLoading(true);
    try {
      if (editingBanner) {
        await updateBanner(editingBanner.id, formData);
        toast.success("Banner updated");
      } else {
        await createBanner(formData as SiteBanner);
        toast.success("Banner created");
      }
      setModalOpen(false);
      await loadBanners();
    } catch (err) {
      toast.error(editingBanner ? "Failed to update banner" : "Failed to create banner");
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    try {
      await deleteBanner(id);
      toast.success("Banner deleted");
      await loadBanners();
    } catch (err) {
      toast.error("Failed to delete banner");
      console.error(err);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Banners & Notices</h2>
        <Button onClick={handleAddClick} size="sm" className="bg-[image:var(--gradient-primary)]">
          <Plus className="h-4 w-4 mr-2" />
          Add Banner
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : banners.length === 0 ? (
        <Card className="border-border/60 bg-card/60">
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">No banners yet. Create one to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60 bg-card/60">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60">
                    <TableHead>Title</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Show On</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.map((banner) => (
                    <TableRow key={banner.id} className="border-border/60">
                      <TableCell className="font-medium">{banner.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {banner.message}
                      </TableCell>
                      <TableCell className="text-sm capitalize">{banner.show_on}</TableCell>
                      <TableCell className="text-sm capitalize">{banner.color_scheme}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={banner.is_active}
                            onCheckedChange={async (checked) => {
                              try {
                                await updateBanner(banner.id, { is_active: checked });
                                toast.success("Banner updated");
                                await loadBanners();
                              } catch (err) {
                                toast.error("Failed to update banner");
                              }
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(banner)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(banner.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <BannerModal
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleSubmit}
        initialData={editingBanner || undefined}
        isLoading={submitLoading}
      />
    </>
  );
}

// ============ VERSIONS TAB ============
function VersionsTab() {
  const [versions, setVersions] = useState<AppVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const data = await fetchAppVersions();
      setVersions(data);
    } catch (err) {
      toast.error("Failed to load versions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (channel: "stable" | "beta", updates: Partial<AppVersion>) => {
    setSaving(channel);
    try {
      await updateOrCreateAppVersion(channel, updates);
      toast.success(`${channel} version updated`);
      await loadVersions();
    } catch (err) {
      toast.error(`Failed to update ${channel} version`);
      console.error(err);
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const stable = versions.find((v) => v.channel === "stable");
  const beta = versions.find((v) => v.channel === "beta");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <VersionCard version={stable} channel="stable" onSave={handleSave} isSaving={saving === "stable"} />
      <VersionCard version={beta} channel="beta" onSave={handleSave} isSaving={saving === "beta"} />
    </div>
  );
}

function VersionCard({
  version,
  channel,
  onSave,
  isSaving,
}: {
  version: AppVersion | undefined;
  channel: "stable" | "beta";
  onSave: (channel: "stable" | "beta", updates: Partial<AppVersion>) => Promise<void>;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState<Partial<AppVersion>>(
    version || {
      version_string: "",
      download_url: "",
      release_date: "",
      is_active: false,
      show_beta_warning: false,
    }
  );

  const handleChange = (field: keyof AppVersion, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveClick = async () => {
    if (!formData.version_string?.trim() || !formData.download_url?.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    await onSave(channel, formData);
  };

  return (
    <Card className="border-border/60 bg-card/60">
      <CardHeader>
        <CardTitle className="capitalize">{channel} Version</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor={`${channel}-version`} className="text-xs uppercase">
            Version String
          </Label>
          <Input
            id={`${channel}-version`}
            value={formData.version_string || ""}
            onChange={(e) => handleChange("version_string", e.target.value)}
            placeholder="e.g. 2.1.0"
            className="bg-card/60 border-border/60 mt-1"
          />
        </div>

        <div>
          <Label htmlFor={`${channel}-url`} className="text-xs uppercase">
            Download URL
          </Label>
          <Input
            id={`${channel}-url`}
            value={formData.download_url || ""}
            onChange={(e) => handleChange("download_url", e.target.value)}
            placeholder="https://..."
            className="bg-card/60 border-border/60 mt-1"
          />
        </div>

        <div>
          <Label htmlFor={`${channel}-date`} className="text-xs uppercase">
            Release Date
          </Label>
          <Input
            id={`${channel}-date`}
            type="date"
            value={formData.release_date || ""}
            onChange={(e) => handleChange("release_date", e.target.value)}
            className="bg-card/60 border-border/60 mt-1"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor={`${channel}-active`} className="text-xs uppercase">
            Active
          </Label>
          <Switch
            id={`${channel}-active`}
            checked={formData.is_active || false}
            onCheckedChange={(checked) => handleChange("is_active", checked)}
          />
        </div>

        {channel === "beta" && (
          <div className="flex items-center justify-between">
            <Label htmlFor={`${channel}-warning`} className="text-xs uppercase">
              Show Beta Warning
            </Label>
            <Switch
              id={`${channel}-warning`}
              checked={formData.show_beta_warning || false}
              onCheckedChange={(checked) => handleChange("show_beta_warning", checked)}
            />
          </div>
        )}

        <Button
          onClick={handleSaveClick}
          disabled={isSaving}
          className="w-full bg-[image:var(--gradient-primary)]"
        >
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save {channel} Version
        </Button>
      </CardContent>
    </Card>
  );
}

// ============ FEATURES TAB ============
function FeaturesTab() {
  const [features, setFeatures] = useState<KeyFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [featureTab, setFeatureTab] = useState<"home" | "download">("home");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<KeyFeature | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    setLoading(true);
    try {
      const data = await fetchFeatures();
      setFeatures(data);
    } catch (err) {
      toast.error("Failed to load features");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentFeatures = features.filter((f) => f.page === featureTab).sort((a, b) => a.display_order - b.display_order);

  const handleAddClick = () => {
    setEditingFeature(null);
    setModalOpen(true);
  };

  const handleEditClick = (feature: KeyFeature) => {
    setEditingFeature(feature);
    setModalOpen(true);
  };

  const handleSubmit = async (formData: Partial<KeyFeature>) => {
    setSubmitLoading(true);
    try {
      if (editingFeature) {
        await updateFeature(editingFeature.id, formData);
        toast.success("Feature updated");
      } else {
        await createFeature({ ...formData, page: featureTab } as KeyFeature);
        toast.success("Feature created");
      }
      setModalOpen(false);
      await loadFeatures();
    } catch (err) {
      toast.error(editingFeature ? "Failed to update feature" : "Failed to create feature");
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this feature?")) return;
    try {
      await deleteFeature(id);
      toast.success("Feature deleted");
      await loadFeatures();
    } catch (err) {
      toast.error("Failed to delete feature");
      console.error(err);
    }
  };

  const handleReorder = async (featureId: string, newOrder: number) => {
    try {
      await reorderFeatures(featureId, newOrder);
      await loadFeatures();
    } catch (err) {
      toast.error("Failed to reorder features");
      console.error(err);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Key Features</h2>
          <Button onClick={handleAddClick} size="sm" className="bg-[image:var(--gradient-primary)]">
            <Plus className="h-4 w-4 mr-2" />
            Add Feature
          </Button>
        </div>

        <Tabs value={featureTab} onValueChange={(v) => setFeatureTab(v as "home" | "download")} className="w-full">
          <TabsList className="bg-card/60 border border-border/60">
            <TabsTrigger value="home">Home Page</TabsTrigger>
            <TabsTrigger value="download">Download Page</TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-4">
            <FeaturesListContent features={currentFeatures} onEdit={handleEditClick} onDelete={handleDelete} onReorder={handleReorder} />
          </TabsContent>

          <TabsContent value="download" className="space-y-4">
            <FeaturesListContent features={currentFeatures} onEdit={handleEditClick} onDelete={handleDelete} onReorder={handleReorder} />
          </TabsContent>
        </Tabs>
      </div>

      <FeatureModal
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleSubmit}
        initialData={editingFeature || undefined}
        isLoading={submitLoading}
      />
    </>
  );
}

function FeaturesListContent({
  features,
  onEdit,
  onDelete,
  onReorder,
}: {
  features: KeyFeature[];
  onEdit: (f: KeyFeature) => void;
  onDelete: (id: string) => void;
  onReorder: (id: string, order: number) => void;
}) {
  if (features.length === 0) {
    return (
      <Card className="border-border/60 bg-card/60">
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">No features yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card/60">
      <CardContent className="pt-6 space-y-4">
        {features.map((feature, idx) => (
          <div key={feature.id} className="flex items-start gap-4 p-4 border border-border/60 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <p className="font-semibold">{feature.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{feature.description}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={feature.is_visible} />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(feature)}
                className="h-8 w-8 p-0"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(feature.id)}
                className="h-8 w-8 p-0 text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ============ CONFIG TAB ============
function ConfigTab() {
  const [config, setConfig] = useState<DownloadPageConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fieldKeys = ["hero_title", "hero_subtitle", "stable_label", "beta_label", "report_bug_url", "contact_support_url"];

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const data = await fetchDownloadPageConfig();
      setConfig(data);
    } catch (err) {
      toast.error("Failed to load config");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = fieldKeys.map((key) => ({
        field_key: key,
        field_value: (document.querySelector(`#${key}`) as HTMLInputElement)?.value || "",
      }));
      await upsertDownloadPageConfig(updates);
      toast.success("Configuration saved");
      await loadConfig();
    } catch (err) {
      toast.error("Failed to save configuration");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getValue = (key: string) => {
    return config.find((c) => c.field_key === key)?.field_value || "";
  };

  return (
    <Card className="border-border/60 bg-card/60">
      <CardHeader>
        <CardTitle>Download Page Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="hero_title" className="text-xs uppercase">
            Hero Title
          </Label>
          <Input
            id="hero_title"
            defaultValue={getValue("hero_title")}
            placeholder="Main hero title"
            className="bg-card/60 border-border/60 mt-1"
          />
        </div>

        <div>
          <Label htmlFor="hero_subtitle" className="text-xs uppercase">
            Hero Subtitle
          </Label>
          <Textarea
            id="hero_subtitle"
            defaultValue={getValue("hero_subtitle")}
            placeholder="Hero subtitle"
            className="bg-card/60 border-border/60 mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="stable_label" className="text-xs uppercase">
              Stable Label
            </Label>
            <Input
              id="stable_label"
              defaultValue={getValue("stable_label")}
              placeholder="e.g. Stable Release"
              className="bg-card/60 border-border/60 mt-1"
            />
          </div>
          <div>
            <Label htmlFor="beta_label" className="text-xs uppercase">
              Beta Label
            </Label>
            <Input
              id="beta_label"
              defaultValue={getValue("beta_label")}
              placeholder="e.g. Beta Release"
              className="bg-card/60 border-border/60 mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="report_bug_url" className="text-xs uppercase">
            Report Bug URL
          </Label>
          <Input
            id="report_bug_url"
            defaultValue={getValue("report_bug_url")}
            placeholder="https://..."
            className="bg-card/60 border-border/60 mt-1"
          />
        </div>

        <div>
          <Label htmlFor="contact_support_url" className="text-xs uppercase">
            Contact Support URL
          </Label>
          <Input
            id="contact_support_url"
            defaultValue={getValue("contact_support_url")}
            placeholder="https://..."
            className="bg-card/60 border-border/60 mt-1"
          />
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full bg-[image:var(--gradient-primary)]">
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save All
        </Button>
      </CardContent>
    </Card>
  );
}
