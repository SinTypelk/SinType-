import { useEffect, useState } from "react";
import { Download, AlertTriangle } from "lucide-react";
import {
  fetchLatestAppUpdate,
  isRemoteVersionNewer,
  parseReleaseNotes,
  type AppUpdateRow,
} from "@/lib/app-updates-service";

/** Shown on download page when a newer desktop build exists in Supabase. */
export function AppUpdateBanner({ currentVersion = "1.0.0" }: { currentVersion?: string }) {
  const [update, setUpdate] = useState<AppUpdateRow | null>(null);

  useEffect(() => {
    fetchLatestAppUpdate()
      .then((row) => {
        if (row && isRemoteVersionNewer(row.version_number, currentVersion)) {
          setUpdate(row);
        }
      })
      .catch(() => setUpdate(null));
  }, [currentVersion]);

  if (!update) return null;

  const bullets = parseReleaseNotes(update.release_notes);

  return (
    <div
      className={`mb-6 rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center gap-3 ${
        update.is_critical
          ? "border-amber-500/40 bg-amber-500/10"
          : "border-[var(--neon-cyan)]/30 bg-[var(--neon-cyan)]/5"
      }`}
    >
      <div className="flex items-start gap-3 flex-1">
        {update.is_critical ? (
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        ) : (
          <Download className="w-5 h-5 text-[var(--neon-cyan)] shrink-0 mt-0.5" />
        )}
        <div>
          <p className="font-display text-sm font-semibold">
            Update available — v{update.version_number}
          </p>
          {bullets.length > 0 && (
            <ul className="text-xs text-muted-foreground mt-1 space-y-0.5 line-clamp-3">
              {bullets.slice(0, 3).map((line) => (
                <li key={line}>• {line}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <a
        href={update.download_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-primary-foreground shrink-0"
        style={{
          background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))",
        }}
      >
        <Download className="w-4 h-4" /> Download update
      </a>
    </div>
  );
}
