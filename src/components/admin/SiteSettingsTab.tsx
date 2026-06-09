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
import { toast } from "sonner";
import type { SiteSetting } from "@/lib/admin-content-db-service";
import { adminFetchSettings, adminUpsertSettings } from "@/lib/admin-content-db-service";

export function SiteSettingsTab() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetchSettings();
      const settingsMap: Record<string, string> = {};
      data.forEach((setting) => {
        settingsMap[setting.key] = setting.value;
      });
      setSettings(settingsMap);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const entries = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
      }));
      await adminUpsertSettings(entries);
      toast.success("Settings saved successfully");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading settings…
      </div>
    );
  }

  return (
    <Card className="border-border/60 bg-card/60">
      <CardHeader>
        <CardTitle>Site Settings</CardTitle>
        <CardDescription>
          Manage global site configuration, contact information, and social links.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 max-w-2xl">
          {/* Business Email */}
          <div className="space-y-2">
            <Label htmlFor="business_email">Business Email *</Label>
            <Input
              id="business_email"
              type="email"
              value={settings.business_email || ""}
              onChange={(e) => handleChange("business_email", e.target.value)}
              placeholder="contact@sintype.lk"
              required
            />
            <p className="text-xs text-muted-foreground">
              Primary contact email for business inquiries
            </p>
          </div>

          {/* Support Email */}
          <div className="space-y-2">
            <Label htmlFor="support_email">Support Email *</Label>
            <Input
              id="support_email"
              type="email"
              value={settings.support_email || ""}
              onChange={(e) => handleChange("support_email", e.target.value)}
              placeholder="support@sintype.lk"
              required
            />
            <p className="text-xs text-muted-foreground">
              Email address for customer support requests
            </p>
          </div>

          {/* App Version */}
          <div className="space-y-2">
            <Label htmlFor="app_version">Current App Version</Label>
            <Input
              id="app_version"
              value={settings.app_version || ""}
              onChange={(e) => handleChange("app_version", e.target.value)}
              placeholder="2.0.0"
            />
            <p className="text-xs text-muted-foreground">
              Displayed version number (e.g., 2.0.0)
            </p>
          </div>

          {/* GitHub Link */}
          <div className="space-y-2">
            <Label htmlFor="github_link">GitHub Repository Link</Label>
            <Input
              id="github_link"
              type="url"
              value={settings.github_link || ""}
              onChange={(e) => handleChange("github_link", e.target.value)}
              placeholder="https://github.com/SinTypelk/SinType"
            />
            <p className="text-xs text-muted-foreground">
              GitHub repository URL
            </p>
          </div>

          {/* Facebook Link */}
          <div className="space-y-2">
            <Label htmlFor="facebook_link">Facebook Page Link</Label>
            <Input
              id="facebook_link"
              type="url"
              value={settings.facebook_link || ""}
              onChange={(e) => handleChange("facebook_link", e.target.value)}
              placeholder="https://facebook.com/sintype.lk"
            />
            <p className="text-xs text-muted-foreground">
              Facebook page URL (optional)
            </p>
          </div>

          {/* YouTube Link */}
          <div className="space-y-2">
            <Label htmlFor="youtube_link">YouTube Channel Link</Label>
            <Input
              id="youtube_link"
              type="url"
              value={settings.youtube_link || ""}
              onChange={(e) => handleChange("youtube_link", e.target.value)}
              placeholder="https://youtube.com/@sintype.lk"
            />
            <p className="text-xs text-muted-foreground">
              YouTube channel URL (optional)
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[image:var(--gradient-primary)] text-primary-foreground hover:opacity-95"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
