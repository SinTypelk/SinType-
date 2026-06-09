import { supabase } from "@/integrations/supabase/client";

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  user_id: string | null;
  created_at: string;
  is_active?: boolean;
  link?: string | null;
};

const SEEN_KEY = "sintype.notifications.last_seen_id";

/**
 * Fetch active notifications (is_active = true) for display in navbar and messages.
 * This is the UNIFIED data source for all notification displays.
 */
export async function fetchActiveNotifications(limit = 10): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("id, title, message, user_id, created_at, is_active, link")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data ?? []) as AppNotification[];
}

/**
 * Legacy function for backward compatibility.
 * Now uses the unified active notifications query.
 */
export async function fetchNotificationsForUser(
  userId?: string | null,
  limit = 30,
): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("id, title, message, user_id, created_at, is_active, link")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as AppNotification[];
  if (!userId) {
    return rows.filter((r) => r.user_id == null);
  }
  return rows.filter((r) => r.user_id == null || r.user_id === userId);
}

export function getLastSeenNotificationId(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(SEEN_KEY) ?? "";
}

export function markNotificationsSeen(latestId: string): void {
  if (typeof window === "undefined" || !latestId) return;
  localStorage.setItem(SEEN_KEY, latestId);
}

export function countUnread(rows: AppNotification[]): number {
  const last = getLastSeenNotificationId();
  if (!last) return rows.length;
  const idx = rows.findIndex((r) => r.id === last);
  if (idx < 0) return rows.length;
  return idx;
}
