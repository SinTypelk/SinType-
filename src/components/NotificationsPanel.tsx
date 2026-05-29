import { useEffect, useState } from "react";
import { Bell, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import {
  countUnread,
  fetchNotificationsForUser,
  markNotificationsSeen,
  type AppNotification,
} from "@/lib/notifications-service";

export function NotificationsPanel() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unread = countUnread(rows);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotificationsForUser(user?.id ?? null);
      setRows(data);
    } catch (e: unknown) {
      setError((e as Error).message ?? "Could not load notifications.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [user?.id]);

  const openPanel = () => {
    setOpen(true);
    void load();
  };

  const closePanel = () => {
    if (rows[0]?.id) markNotificationsSeen(rows[0].id);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={openPanel}
        className="relative inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
        aria-label="Notifications"
      >
        <Bell className="w-3.5 h-3.5" />
        Messages
        {unread > 0 && (
          <span className="absolute -top-1 -right-2 min-w-[14px] h-[14px] px-0.5 rounded-full bg-[var(--neon-cyan)] text-[9px] font-bold text-black flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] grid place-items-center p-4"
            style={{
              background: "color-mix(in oklab, black 60%, transparent)",
              backdropFilter: "blur(8px)",
            }}
            onClick={closePanel}
          >
            <motion.div
              initial={{ scale: 0.95, y: 8, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[80vh] overflow-hidden rounded-2xl border border-white/10 flex flex-col"
              style={{
                background: "color-mix(in oklab, var(--card) 92%, transparent)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="font-display text-lg">Notifications</h3>
                <button
                  type="button"
                  onClick={closePanel}
                  className="p-1.5 rounded-md hover:bg-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto p-4 space-y-3 flex-1">
                {loading && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                  </p>
                )}
                {error && <p className="text-sm text-destructive">{error}</p>}
                {!loading && !error && rows.length === 0 && (
                  <p className="text-sm text-muted-foreground">No messages yet.</p>
                )}
                {rows.map((row) => (
                  <article
                    key={row.id}
                    className="rounded-xl border border-white/10 bg-background/40 p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-sm text-[var(--neon-cyan)]">
                        {row.title}
                      </h4>
                      {row.user_id && (
                        <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                          Private
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-foreground/90 whitespace-pre-wrap">
                      {row.message}
                    </p>
                    <p className="mt-2 text-[10px] text-muted-foreground">
                      {new Date(row.created_at).toLocaleString()}
                    </p>
                  </article>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
