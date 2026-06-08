import { useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  countUnread,
  fetchNotificationsForUser,
  markNotificationsSeen,
  type AppNotification,
} from "@/lib/notifications-service";

export function SupportMessagesPanel() {
  const { user } = useAuth();
  const [rows, setRows] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotificationsForUser(user?.id ?? null);
      setRows(data);
    } catch (e: unknown) {
      setError((e as Error).message ?? "Could not load messages.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [user?.id]);

  useEffect(() => {
    if (rows[0]?.id) {
      markNotificationsSeen(rows[0].id);
    }
  }, [rows]);

  const unread = countUnread(rows);

  return (
    <div>
      {unread > 0 && (
        <p className="mb-4 text-sm text-[var(--neon-cyan)]">
          {unread} new message{unread === 1 ? "" : "s"} from SinType
        </p>
      )}

      {loading && (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading messages…
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!loading && !error && rows.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          <Bell className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium text-foreground">No messages yet</p>
          <p className="text-sm mt-1">
            Product updates and announcements from the SinType team will appear here.
          </p>
        </div>
      )}

      <ul className="space-y-4">
        {rows.map((row) => (
          <li
            key={row.id}
            className="rounded-2xl border border-white/10 bg-muted/40 p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-[var(--neon-cyan)]">{row.title}</h3>
              {row.user_id && (
                <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground border border-border rounded-full px-2 py-0.5">
                  Personal
                </span>
              )}
            </div>
            <p className="mt-3 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {row.message}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              {new Date(row.created_at).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
