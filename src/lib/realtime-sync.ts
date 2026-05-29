import { SUPABASE_CONFIGURED, supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type SyncConnectionStatus = "connecting" | "live" | "error" | "unconfigured";

export function syncSessionId(sessionId: string): string {
  return sessionId.trim();
}

export type MobileSyncHandlers = {
  onSet?: (text: string) => void;
  onAppend?: (text: string) => void;
  onStatus?: (status: SyncConnectionStatus) => void;
};

export type SyncSubscription = {
  channel: RealtimeChannel | null;
  unsubscribe: () => void;
};

const TABLE = "mobile_sync_state";
const POLL_MS = 450;

type SyncRow = {
  session_id: string;
  text_content: string;
  updated_at: string;
};

function isValidSessionId(sid: string): boolean {
  return /^[0-9a-f-]{36}$/i.test(sid);
}

function applyRow(handlers: MobileSyncHandlers, row: Partial<SyncRow> | null) {
  if (!row || typeof row.text_content !== "string") return;
  handlers.onSet?.(row.text_content);
}

async function fetchSyncText(sessionId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("text_content")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (error) {
    console.warn("[sync] fetch failed:", error.message, error.code);
    return null;
  }
  return data?.text_content ?? "";
}

/**
 * Desktop listens via HTTP poll + optional Postgres Realtime.
 * Polling works even when Realtime websocket auth fails.
 */
export function subscribeMobileSync(
  sessionId: string,
  handlers: MobileSyncHandlers,
): Promise<SyncSubscription | null> {
  if (!SUPABASE_CONFIGURED) {
    handlers.onStatus?.("unconfigured");
    return Promise.resolve(null);
  }

  const sid = syncSessionId(sessionId);
  if (!isValidSessionId(sid)) {
    handlers.onStatus?.("error");
    return Promise.resolve(null);
  }

  handlers.onStatus?.("connecting");

  let lastText = "__unset__";
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let realtimeChannel: RealtimeChannel | null = null;
  let stopped = false;

  const poll = async () => {
    if (stopped) return;
    const text = await fetchSyncText(sid);
    if (text === null) {
      handlers.onStatus?.("error");
      return;
    }
    handlers.onStatus?.("live");
    if (text !== lastText) {
      lastText = text;
      handlers.onSet?.(text);
    }
  };

  void poll();
  pollTimer = setInterval(() => void poll(), POLL_MS);

  const ch = supabase
    .channel(`mobile-sync:${sid}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: TABLE,
        filter: `session_id=eq.${sid}`,
      },
      (payload) => {
        applyRow(handlers, payload.new as SyncRow);
        lastText = (payload.new as SyncRow).text_content ?? lastText;
        handlers.onStatus?.("live");
      },
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: TABLE,
        filter: `session_id=eq.${sid}`,
      },
      (payload) => {
        applyRow(handlers, payload.new as SyncRow);
        lastText = (payload.new as SyncRow).text_content ?? lastText;
        handlers.onStatus?.("live");
      },
    );

  ch.subscribe((status, err) => {
    if (status === "SUBSCRIBED") {
      handlers.onStatus?.("live");
      return;
    }
    if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
      console.warn("[sync] realtime optional:", status, err);
    }
  });
  realtimeChannel = ch;

  return Promise.resolve({
    channel: realtimeChannel,
    unsubscribe: () => {
      stopped = true;
      if (pollTimer) clearInterval(pollTimer);
      void realtimeChannel?.unsubscribe();
    },
  });
}

/** Phone → DB (desktop picks up via poll / realtime). */
export async function pushSyncText(sessionId: string, text: string): Promise<void> {
  if (!SUPABASE_CONFIGURED) return;
  const sid = syncSessionId(sessionId);
  if (!isValidSessionId(sid)) return;

  const { error } = await supabase.from(TABLE).upsert(
    {
      session_id: sid,
      text_content: text,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "session_id" },
  );

  if (error) {
    console.warn("[sync] upsert failed:", error.message, error.code, error.details);
  }
}
