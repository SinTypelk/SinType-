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

/** Subscribe to the mobile ↔ desktop broadcast channel. */
export async function subscribeMobileSync(
  sessionId: string,
  handlers: MobileSyncHandlers,
  accessToken?: string | null,
): Promise<RealtimeChannel | null> {
  if (!SUPABASE_CONFIGURED) {
    handlers.onStatus?.("unconfigured");
    return null;
  }
  if (!sessionId.trim()) {
    handlers.onStatus?.("error");
    return null;
  }

  handlers.onStatus?.("connecting");

  try {
    if (accessToken) {
      await supabase.realtime.setAuth(accessToken);
    } else {
      await supabase.realtime.setAuth(null);
    }
  } catch (err) {
    console.warn("[sync] setAuth failed:", err);
  }

  const ch = supabase.channel(syncChannelName(sessionId), {
    config: { broadcast: { ack: true, self: false } },
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
      return;
    }
    if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
      if (err) console.warn("[sync] channel error:", err);
      handlers.onStatus?.("error");
    }
  });

  return ch;
}

export function broadcastSet(channel: RealtimeChannel | null, text: string): void {
  if (!channel) return;
  void channel.send({
    type: "broadcast",
    event: "set",
    payload: { text },
  });
}
