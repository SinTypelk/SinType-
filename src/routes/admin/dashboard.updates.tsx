import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Rocket, AlertTriangle, Plus, Trash2, Download, Sparkles, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { parseReleaseNotes } from "@/lib/app-updates-service";
import {
  fetchRecentAppUpdates,
  publishAppUpdate,
  type AppUpdateRecord,
} from "@/lib/admin-service";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/dashboard/updates")({
  component: UpdatesPage,
});

interface NoteItem {
  id: string;
  value: string;
}

const uid = () => `n_${Math.random().toString(36).slice(2, 9)}`;

function UpdatesPage() {
  const [version, setVersion] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState<NoteItem[]>([{ id: uid(), value: "" }]);
  const [critical, setCritical] = useState(false);
  const [releases, setReleases] = useState<AppUpdateRecord[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [loadingReleases, setLoadingReleases] = useState(true);

  const loadReleases = useCallback(async () => {
    setLoadingReleases(true);
    try {
      setReleases(await fetchRecentAppUpdates(10));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load releases");
    } finally {
      setLoadingReleases(false);
    }
  }, []);

  useEffect(() => {
    loadReleases();
  }, [loadReleases]);

  const addNote = () => setNotes((list) => [...list, { id: uid(), value: "" }]);
  const updateNote = (id: string, value: string) =>
    setNotes((list) => list.map((n) => (n.id === id ? { ...n, value } : n)));
  const removeNote = (id: string) =>
    setNotes((list) => (list.length === 1 ? list : list.filter((n) => n.id !== id)));

  const cleanedNotes = notes.map((n) => n.value.trim()).filter(Boolean);

  const onPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cleanedNotes.length === 0) {
      toast.error("Add at least one release note.");
      return;
    }
    setPublishing(true);
    try {
      await publishAppUpdate({
        version,
        downloadUrl: url,
        notes: cleanedNotes,
        critical,
      });
      toast.success(`Version ${version} published${critical ? " (critical)" : ""}`);
      setVersion("");
      setUrl("");
      setNotes([{ id: uid(), value: "" }]);
      setCritical(false);
      await loadReleases();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Release manager
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">App Updates</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Publishes to Supabase <code className="text-xs">app_updates</code> — shown on{" "}
          <code className="text-xs">/download</code>.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <Card className="border-border/60 bg-card/60 backdrop-blur">
          <CardHeader>
            <CardTitle>Publish new desktop release</CardTitle>
            <CardDescription>Release notes are stored as a JSON bullet list.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onPublish} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="version">Version Number</Label>
                  <Input
                    id="version"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="1.1.0"
                    required
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">Download URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://…"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Release Notes</Label>
                    <p className="text-xs text-muted-foreground">
                      Each bullet appears on the public download page.
                    </p>
                  </div>
                  <span className="rounded-full border border-border/60 bg-card/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {cleanedNotes.length} item{cleanedNotes.length === 1 ? "" : "s"}
                  </span>
                </div>

                <ul className="space-y-2">
                  {notes.map((n, i) => (
                    <li key={n.id} className="flex items-center gap-2">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border/60 bg-card/40 font-mono text-xs text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <Input
                        value={n.value}
                        onChange={(e) => updateNote(n.id, e.target.value)}
                        placeholder="e.g. Improved license sync reliability"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeNote(n.id)}
                        disabled={notes.length === 1}
                        aria-label="Remove note"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>

                <Button type="button" variant="outline" onClick={addNote} className="w-full border-dashed">
                  <Plus className="mr-2 h-4 w-4" /> Add New Note
                </Button>
              </div>

              <label
                htmlFor="critical"
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/60 bg-card/60 p-3 hover:bg-accent/5"
              >
                <Checkbox
                  id="critical"
                  checked={critical}
                  onCheckedChange={(v) => setCritical(!!v)}
                />
                <div>
                  <p className="text-sm font-medium">Mark as Critical Update</p>
                  <p className="text-xs text-muted-foreground">
                    Highlights the update banner on the download page.
                  </p>
                </div>
              </label>

              <Button
                type="submit"
                disabled={publishing}
                className="bg-[image:var(--gradient-primary)] text-primary-foreground hover:opacity-95"
              >
                <Rocket className="mr-2 h-4 w-4" />
                {publishing ? "Publishing…" : "Publish Update"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Website Preview
          </div>

          <div className="relative rounded-2xl p-[1px] bg-[image:var(--gradient-primary)] shadow-[var(--shadow-glow)]">
            <div className="rounded-2xl bg-background/95 p-6 backdrop-blur">
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Latest Release
                </span>
                {critical && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-destructive">
                    <AlertTriangle className="h-3 w-3" /> Critical
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-baseline gap-3">
                <h2 className="font-mono text-3xl font-bold tracking-tight">
                  v{version || "0.0.0"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {new Date().toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>

              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Release Notes
              </p>

              {cleanedNotes.length > 0 ? (
                <ul className="mt-3 space-y-2.5">
                  {cleanedNotes.map((note, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-foreground/90">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm italic text-muted-foreground">
                  Start adding notes to see them here…
                </p>
              )}

              <Button
                type="button"
                disabled
                className="mt-6 w-full bg-[image:var(--gradient-primary)] text-primary-foreground opacity-90"
              >
                <Download className="mr-2 h-4 w-4" />
                Download {version ? `v${version}` : ""}
              </Button>
            </div>
          </div>

          <Card className="border-border/60 bg-card/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent releases</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingReleases ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : releases.length === 0 ? (
                <p className="text-sm text-muted-foreground">No releases published yet.</p>
              ) : (
                <ol className="relative space-y-4 border-l border-border/60 pl-5">
                  {releases.slice(0, 5).map((r) => {
                    const bullets = parseReleaseNotes(r.release_notes);
                    return (
                      <li key={r.id} className="relative">
                        <span className="absolute -left-[26px] mt-1.5 flex h-3 w-3 rounded-full bg-primary shadow-[var(--shadow-glow)]" />
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm font-semibold">v{r.version_number}</p>
                          {r.is_critical && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-destructive">
                              <AlertTriangle className="h-3 w-3" /> Critical
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          · {bullets.length} note{bullets.length === 1 ? "" : "s"}
                        </p>
                      </li>
                    );
                  })}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
