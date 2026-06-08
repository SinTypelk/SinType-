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
import type { AppVersion } from "@/lib/admin-content-db-service";
import { adminFetchVersions, adminUpsertVersion } from "@/lib/admin-content-db-service";

export function VersionManagerTab() {
  const [versions, setVersions] = useState<Record<"stable" | "beta", AppVersion | null>>({
    stable: null,
    beta: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const [stableForm, setStableForm] = useState({
    version_string: "",
    download_url: "",
    release_date: "",
    is_active: false,
  });

  const [betaForm, setBetaForm] = useState({
    version_string: "",
    download_url: "",
    release_date: "",
    is_active: false,
    show_beta_warning: false,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetchVersions();
      const byChannel: Record<"stable" | "beta", AppVersion | null> = {
        stable: null,
        beta: null,
      };

      data.forEach((v) => {
        if (v.channel === "stable") byChannel.stable = v;
        if (v.channel === "beta") byChannel.beta = v;
      });

      setVersions(byChannel);

      if (byChannel.stable) {
        setStableForm({
          version_string: byChannel.stable.version_string,
          download_url: byChannel.stable.download_url,
          release_date: byChannel.stable.release_date || "",
          is_active: byChannel.stable.is_active,
        });
      }

      if (byChannel.beta) {
        setBetaForm({
          version_string: byChannel.beta.version_string,
          download_url: byChannel.beta.download_url,
          release_date: byChannel.beta.release_date || "",
          is_active: byChannel.beta.is_active,
          show_beta_warning: byChannel.beta.show_beta_warning,
        });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load versions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaveStable = async () => {
    if (!stableForm.version_string.trim() || !stableForm.download_url.trim()) {
      toast.error("Version and URL are required");
      return;
    }

    setSaving("stable");
    try {
      await adminUpsertVersion("stable", stableForm);
      toast.success("Stable version updated");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(null);
    }
  };

  const handleSaveBeta = async () => {
    if (!betaForm.version_string.trim() || !betaForm.download_url.trim()) {
      toast.error("Version and URL are required");
      return;
    }

    setSaving("beta");
    try {
      await adminUpsertVersion("beta", {
        version_string: betaForm.version_string,
        download_url: betaForm.download_url,
        release_date: betaForm.release_date,
        is_active: betaForm.is_active,
        show_beta_warning: betaForm.show_beta_warning,
      });
      toast.success("Beta version updated");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading versions…
      </div>
    );
  }

  return (
    <Card className="border-border/60 bg-card/60">
      <CardHeader>
        <CardTitle>Version Manager</CardTitle>
        <CardDescription>Manage stable and beta release versions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stable Version */}
          <div className="border border-border/60 rounded-lg p-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Stable Release
              </h3>
            </div>

            <div>
              <Label>Version String</Label>
              <Input
                value={stableForm.version_string}
                onChange={(e) => setStableForm({ ...stableForm, version_string: e.target.value })}
                placeholder="e.g. 2.0.0"
              />
            </div>

            <div>
              <Label>Download URL</Label>
              <Input
                value={stableForm.download_url}
                onChange={(e) => setStableForm({ ...stableForm, download_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label>Release Date</Label>
              <Input
                type="date"
                value={stableForm.release_date}
                onChange={(e) => setStableForm({ ...stableForm, release_date: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="stable-active"
                checked={stableForm.is_active}
                onChange={(e) => setStableForm({ ...stableForm, is_active: e.target.checked })}
              />
              <Label htmlFor="stable-active">Active</Label>
            </div>

            <Button onClick={handleSaveStable} disabled={saving === "stable"} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {saving === "stable" ? "Saving…" : "Save Stable"}
            </Button>
          </div>

          {/* Beta Version */}
          <div className="border border-border/60 rounded-lg p-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Beta Release
              </h3>
            </div>

            <div>
              <Label>Version String</Label>
              <Input
                value={betaForm.version_string}
                onChange={(e) => setBetaForm({ ...betaForm, version_string: e.target.value })}
                placeholder="e.g. 2.0.0-beta.1"
              />
            </div>

            <div>
              <Label>Download URL</Label>
              <Input
                value={betaForm.download_url}
                onChange={(e) => setBetaForm({ ...betaForm, download_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label>Release Date</Label>
              <Input
                type="date"
                value={betaForm.release_date}
                onChange={(e) => setBetaForm({ ...betaForm, release_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="beta-active"
                  checked={betaForm.is_active}
                  onChange={(e) => setBetaForm({ ...betaForm, is_active: e.target.checked })}
                />
                <Label htmlFor="beta-active">Active</Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="beta-warning"
                  checked={betaForm.show_beta_warning}
                  onChange={(e) => setBetaForm({ ...betaForm, show_beta_warning: e.target.checked })}
                />
                <Label htmlFor="beta-warning">Show Beta Warning</Label>
              </div>
            </div>

            <Button onClick={handleSaveBeta} disabled={saving === "beta"} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {saving === "beta" ? "Saving…" : "Save Beta"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
