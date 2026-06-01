import { supabase } from "@/integrations/supabase/client";

export type AppUpdateRow = {
  id: string;
  version_number: string;
  download_url: string;
  release_notes: string;
  is_critical: boolean;
  created_at: string;
};

export async function fetchLatestAppUpdate(): Promise<AppUpdateRow | null> {
  const rows = await fetchRecentAppUpdates(1);
  return rows[0] ?? null;
}

/** All published releases, newest first (for download page + admin). */
export async function fetchRecentAppUpdates(limit = 20): Promise<AppUpdateRow[]> {
  const { data, error } = await supabase
    .from("app_updates")
    .select("id, version_number, download_url, release_notes, is_critical, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data as AppUpdateRow[]) ?? [];
}

export function parseVersionTuple(version: string): number[] {
  const nums = version.match(/\d+/g);
  return nums?.map((n) => parseInt(n, 10)) ?? [0];
}

export function parseReleaseNotes(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  const t = raw.trim();
  if (t.startsWith("[")) {
    try {
      const parsed = JSON.parse(t) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map((x) => String(x).trim()).filter(Boolean);
      }
    } catch {
      // fall through
    }
  }
  return t
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
}

export function serializeReleaseNotes(bullets: string[]): string {
  const cleaned = bullets.map((b) => b.trim()).filter(Boolean);
  return JSON.stringify(cleaned);
}

export function isRemoteVersionNewer(remote: string, current: string): boolean {
  const a = parseVersionTuple(remote);
  const b = parseVersionTuple(current);
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x > y) return true;
    if (x < y) return false;
  }
  return false;
}
