import { supabase } from "@/integrations/supabase/client";

export interface LiveUsageStats {
  totalSessions: number;
  activeSessions5m: number;
  pingsLast24h: number;
}

const EMPTY: LiveUsageStats = {
  totalSessions: 0,
  activeSessions5m: 0,
  pingsLast24h: 0,
};

/** Fetch live metrics from ``app_usage`` (falls back to zeros on error). */
export async function fetchLiveUsageStats(): Promise<LiveUsageStats> {
  try {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [recentRes, dayRes] = await Promise.all([
      supabase
        .from("app_usage")
        .select("session_id")
        .gte("created_at", fiveMinAgo),
      supabase
        .from("app_usage")
        .select("session_id, created_at")
        .gte("created_at", dayAgo),
    ]);

    if (recentRes.error && dayRes.error) {
      return EMPTY;
    }

    const recentRows = recentRes.data ?? [];
    const dayRows = dayRes.data ?? [];

    const activeSessions5m = new Set(
      recentRows.map((r) => r.session_id).filter(Boolean),
    ).size;

    const pingsLast24h = dayRows.length;
    const totalSessions = new Set(
      dayRows.map((r) => r.session_id).filter(Boolean),
    ).size;

    return {
      totalSessions,
      activeSessions5m,
      pingsLast24h,
    };
  } catch {
    return EMPTY;
  }
}
