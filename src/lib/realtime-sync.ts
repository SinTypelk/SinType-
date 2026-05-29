import { SUPABASE_CONFIGURED, supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type SyncConnectionStatus = "connecting" | "live" | "error" | "unconfigured";

/** Session id = Supabase auth user id (UUID from QR /m/:sessionId). */
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

const MAX_SUBSCRIBE_ATTEMPTS = 4;
const TABLE = "mobile_sync_state";

type SyncRow = {
  session_id: string;
  text_content: string;
  updated_at: string;
};

function applyRow(handlers: MobileSyncHandlers, row: Partial<SyncRow> | null) {
  if (!row || typeof row.text_content !== "string") return;
  handlers.onSet?.(row.text_content);
}

/** Listen for phone typing via Postgres Realtime (works with standard RLS). */
export function subscribeMobileSync(
  sessionId: string,
  handlers: MobileSyncHandlers,
): Promise<SyncSubscription | null> {
  if (!SUPABASE_CONFIGURED) {
    handlers.onStatus?.("unconfigured");
    return Promise.resolve(null);
  }

  const sid = syncSessionId(sessionId);
  if (!/^[0-9a-f-]{36}$/i.test(sid)) {
    handlers.onStatus?.("error");
    return Promise.resolve(null);
  }

  handlers.onStatus?.("connecting");

  void supabase
    .from(TABLE)
    .select("text_content")
    .eq("session_id", sid)
    .maybeSingle()
    .then(({ data }) => {
      if (data?.text_content) handlers.onSet?.(data.text_content);
    });

  const subscribeOnce = (attempt: number): Promise<SyncSubscription | null> =>
    new Promise((resolve) => {
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
          },
        );

      ch.subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          handlers.onStatus?.("live");
          resolve({
            channel: ch,
            unsubscribe: () => {
              void ch.unsubscribe();
            },
          });
          return;
        }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.warn("[sync] postgres subscribe failed:", status, err);
          if (attempt < MAX_SUBSCRIBE_ATTEMPTS) {
            void ch.unsubscribe();
            window.setTimeout(() => {
              void subscribeOnce(attempt + 1).then(resolve);
            }, 500 * attempt);
            return;
          }
          handlers.onStatus?.("error");
          resolve(null);
        }
      });
    });

  return subscribeOnce(1);
}

/** Push Singlish draft from phone → DB (desktop receives via postgres_changes). */
export async function pushSyncText(sessionId: string, text: string): Promise<void> {
  if (!SUPABASE_CONFIGURED) return;
  const sid = syncSessionId(sessionId);
  if (!/^[0-9a-f-]{36}$/i.test(sid)) return;

  const { error } = await supabase.from(TABLE).upsert(
    {
      session_id: sid,
      text_content: text,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "session_id" },
  );

  if (error) {
    console.warn("[sync] upsert failed:", error.message, error.code);
  }
}
