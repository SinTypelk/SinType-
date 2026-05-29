import { SUPABASE_CONFIGURED, supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type SyncConnectionStatus = "connecting" | "live" | "error" | "unconfigured";

export function syncChannelName(sessionId: string): string {
  return `sintype:${sessionId}`;
}

export type MobileSyncHandlers = {
  onSet?: (text: string) => void;
  onAppend?: (text: string) => void;
  onStatus?: (status: SyncConnectionStatus) => void;
};

const MAX_SUBSCRIBE_ATTEMPTS = 4;

function isChannelReady(ch: RealtimeChannel | null): boolean {
  return ch?.state === "joined";
}

/** Subscribe to the mobile ↔ desktop broadcast channel. */
export function subscribeMobileSync(
  sessionId: string,
  handlers: MobileSyncHandlers,
): Promise<RealtimeChannel | null> {
  if (!SUPABASE_CONFIGURED) {
    handlers.onStatus?.("unconfigured");
    return Promise.resolve(null);
  }
  if (!sessionId.trim()) {
    handlers.onStatus?.("error");
    return Promise.resolve(null);
  }

  handlers.onStatus?.("connecting");

  const subscribeOnce = (attempt: number): Promise<RealtimeChannel | null> =>
    new Promise((resolve) => {
      const ch = supabase.channel(syncChannelName(sessionId), {
        config: { broadcast: { self: false } },
      });

      if (handlers.onSet) {
        ch.on("broadcast", { event: "set" }, (payload) => {
          const text = (payload.payload as { text?: string })?.text ?? "";
          handlers.onSet!(text);
        });
      }
      if (handlers.onAppend) {
        ch.on("broadcast", { event: "append" }, (payload) => {
          const text = (payload.payload as { text?: string })?.text ?? "";
          handlers.onAppend!(text);
        });
      }

      ch.subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          handlers.onStatus?.("live");
          resolve(ch);
          return;
        }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.warn("[sync] subscribe failed:", status, err);
          if (attempt < MAX_SUBSCRIBE_ATTEMPTS) {
            void ch.unsubscribe();
            window.setTimeout(() => {
              void subscribeOnce(attempt + 1).then(resolve);
            }, 400 * attempt);
            return;
          }
          handlers.onStatus?.("error");
          resolve(null);
        }
      });
    });

  return subscribeOnce(1);
}

export function broadcastSet(channel: RealtimeChannel | null, text: string): void {
  if (!channel || !isChannelReady(channel)) return;
  void channel.send({
    type: "broadcast",
    event: "set",
    payload: { text },
  });
}
