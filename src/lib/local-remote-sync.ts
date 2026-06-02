/**
 * LAN mobile remote — sync via desktop app's local HTTP server (no Supabase).
 * Mobile converts Singlish → Sinhala in the browser; PC only injects output.
 */

import type { SyncConnectionStatus, SyncSubscription } from "@/lib/realtime-sync";

export type LocalSyncPayload = {
  latin_draft: string;
  sinhala_output: string;
  mode: "unicode" | "legacy";
};

const POLL_MS = 200;

export function isLocalRemotePath(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.pathname.includes("/m/local/");
}

export async function pushLocalSyncText(
  sessionId: string,
  payload: LocalSyncPayload,
): Promise<void> {
  const sid = sessionId.trim();
  if (!sid) return;
  try {
    const res = await fetch(`/api/local-sync/${encodeURIComponent(sid)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        updated_at: new Date().toISOString(),
      }),
    });
    if (!res.ok) {
      console.warn("[local-sync] push failed:", res.status);
    }
  } catch (e) {
    console.warn("[local-sync] push error:", e);
  }
}

export function subscribeLocalMobileSync(
  sessionId: string,
  handlers: {
    onStatus?: (status: SyncConnectionStatus) => void;
    onPayload?: (payload: LocalSyncPayload) => void;
  },
): SyncSubscription {
  const sid = sessionId.trim();
  let stopped = false;
  let lastJson = "";

  const poll = async () => {
    if (stopped || !sid) return;
    try {
      const res = await fetch(`/api/local-sync/${encodeURIComponent(sid)}`);
      if (!res.ok) {
        handlers.onStatus?.("error");
        return;
      }
      const data = (await res.json()) as LocalSyncPayload;
      handlers.onStatus?.("live");
      const json = JSON.stringify(data);
      if (json !== lastJson) {
        lastJson = json;
        handlers.onPayload?.(data);
      }
    } catch {
      handlers.onStatus?.("error");
    }
  };

  handlers.onStatus?.("connecting");
  void poll();
  const timer = setInterval(() => void poll(), POLL_MS);

  return {
    channel: null,
    unsubscribe: () => {
      stopped = true;
      clearInterval(timer);
    },
  };
}
