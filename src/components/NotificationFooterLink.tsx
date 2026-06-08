import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  countUnread,
  fetchNotificationsForUser,
} from "@/lib/notifications-service";

/** Footer link to /messages with unread badge. */
export function NotificationFooterLink() {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetchNotificationsForUser(user?.id ?? null)
        .then((rows) => {
          if (!cancelled) setUnread(countUnread(rows));
        })
        .catch(() => {
          if (!cancelled) setUnread(0);
        });
    };
    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(load, { timeout: 3000 });
      return () => {
        cancelled = true;
        cancelIdleCallback(id);
      };
    }
    const t = window.setTimeout(load, 1200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [user?.id]);

  return (
    <Link
      to="/messages"
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <span className="relative">
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] px-0.5 rounded-full bg-[var(--neon-cyan)] text-[9px] font-bold text-black flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </span>
      Messages &amp; updates
    </Link>
  );
}
