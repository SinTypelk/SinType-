import { useCallback, useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
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
import { toast } from "sonner";
import { adminFetchDownloadConfig, adminUpsertDownloadConfig } from "@/lib/admin-content-db-service";

interface Config {
  hero_title: string;
  hero_subtitle: string;
  stable_label: string;
  beta_label: string;
  report_bug_url: string;
  contact_support_url: string;
}

export function DownloadConfigTab() {
  const [config, setConfig] = useState<Config>({
    hero_title: "",
    hero_subtitle: "",
    stable_label: "",
    beta_label: "",
    report_bug_url: "",
    contact_support_url: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetchDownloadConfig();
      const newConfig: Config = {
        hero_title: "",
        hero_subtitle: "",
        stable_label: "",
        beta_label: "",
        report_bug_url: "",
        contact_support_url: "",
      };

      data.forEach((item) => {
        const key = item.field_key as keyof Config;
        if (key in newConfig) {
          newConfig[key] = item.field_value;
        }
      });

      setConfig(newConfig);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load config");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    // Validate required fields
    const required = ["hero_title", "stable_label"] as const;
    for (const field of required) {
      if (!config[field]?.trim()) {
        toast.error(`${field} is required`);
        return;
      }
    }

    setSaving(true);
    try {
      const entries = Object.entries(config).map(([key, value]) => ({
        field_key: key,
        field_value: value,
      }));

      await adminUpsertDownloadConfig(entries);
      toast.success("Download config saved");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save config");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading config…
      </div>
    );
  }

  return (
    <Card className="border-border/60 bg-card/60">
      <CardHeader>
        <CardTitle>Download Page Configuration</CardTitle>
        <CardDescription>Configure text and links for the download page</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="hero_title">Hero Title *</Label>
            <Input
              id="hero_title"
              value={config.hero_title}
              onChange={(e) => setConfig({ ...config, hero_title: e.target.value })}
              placeholder="e.g. Download SinType"
            />
          </div>

          <div>
            <Label htmlFor="stable_label">Stable Label *</Label>
            <Input
              id="stable_label"
              value={config.stable_label}
              onChange={(e) => setConfig({ ...config, stable_label: e.target.value })}
              placeholder="e.g. Download Latest"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
            <Textarea
              id="hero_subtitle"
              value={config.hero_subtitle}
              onChange={(e) => setConfig({ ...config, hero_subtitle: e.target.value })}
              placeholder="Brief description"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="beta_label">Beta Label</Label>
            <Input
              id="beta_label"
              value={config.beta_label}
              onChange={(e) => setConfig({ ...config, beta_label: e.target.value })}
              placeholder="e.g. Try Beta"
            />
          </div>

          <div>
            <Label htmlFor="report_bug_url">Report Bug URL</Label>
            <Input
              id="report_bug_url"
              type="url"
              value={config.report_bug_url}
              onChange={(e) => setConfig({ ...config, report_bug_url: e.target.value })}
              placeholder="https://github.com/..."
            />
          </div>

          <div>
            <Label htmlFor="contact_support_url">Contact Support URL</Label>
            <Input
              id="contact_support_url"
              type="url"
              value={config.contact_support_url}
              onChange={(e) => setConfig({ ...config, contact_support_url: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="mt-6 w-full md:w-auto">
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving…" : "Save All"}
        </Button>
      </CardContent>
    </Card>
  );
}
