import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MobileKeyboard } from "@/components/mobile-keyboard";
import {
  encodeMobileSyncText,
  pushSyncText,
  subscribeMobileSync,
  type SyncConnectionStatus,
  type SyncSubscription,
} from "@/lib/realtime-sync";

export const Route = createFileRoute("/m/$sessionId")({
  head: () => ({
    meta: [
      { title: "SinType · Mobile Keyboard" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CloudMobilePage,
});

function CloudMobilePage() {
  const { sessionId } = Route.useParams();
  const [enabled, setEnabled] = useState(true);
  const [status, setStatus] = useState<SyncConnectionStatus>("connecting");
  const syncRef = useRef<SyncSubscription | null>(null);

  useEffect(() => {
    let cancelled = false;
    void subscribeMobileSync(sessionId, {
      onStatus: (s) => {
        if (!cancelled) setStatus(s);
      },
    }).then((sub) => {
      if (!cancelled) syncRef.current = sub;
    });
    return () => {
      cancelled = true;
      syncRef.current?.unsubscribe();
      syncRef.current = null;
    };
  }, [sessionId]);

  const connectionHint =
    status === "unconfigured"
      ? "Supabase sync is not configured on this deployment."
      : "Sign in on desktop, scan QR from Account, and stay on the same session.";

  return (
    <MobileKeyboard
      connectionStatus={status}
      enabled={enabled}
      onEnabledChange={setEnabled}
      connectionHint={connectionHint}
      onSync={({ latin, mode }) => {
        if (!enabled || status !== "live") return;
        const keyboard = mode === "english" ? "english" : "unicode";
        void pushSyncText(sessionId, encodeMobileSyncText(latin, keyboard));
      }}
      onClear={() => {
        if (enabled && status === "live") void pushSyncText(sessionId, "");
      }}
    />
  );
}
