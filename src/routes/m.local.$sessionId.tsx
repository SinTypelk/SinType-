import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileKeyboard } from "@/components/mobile-keyboard";
import { processConversion } from "@/lib/sinhala";
import {
  isLocalRemotePath,
  pushLocalSyncText,
  subscribeLocalMobileSync,
  type LocalSyncPayload,
} from "@/lib/local-remote-sync";
import type { SyncConnectionStatus } from "@/lib/realtime-sync";
import type { MobileSyncPayload } from "@/components/mobile-keyboard";

export const Route = createFileRoute("/m/local/$sessionId")({
  head: () => ({
    meta: [
      { title: "SinType Remote · Mobile Keyboard" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LocalMobilePage,
});

function LocalMobilePage() {
  const { sessionId } = Route.useParams();
  const [enabled, setEnabled] = useState(true);
  const [status, setStatus] = useState<SyncConnectionStatus>("connecting");

  useEffect(() => {
    if (!isLocalRemotePath()) {
      setStatus("error");
      return;
    }
    const sub = subscribeLocalMobileSync(sessionId, {
      onStatus: setStatus,
    });
    return () => sub.unsubscribe();
  }, [sessionId]);

  const pushPayload = (payload: MobileSyncPayload) => {
    if (!enabled || status !== "live") return;
    const outMode: LocalSyncPayload["mode"] = payload.mode === "legacy" ? "legacy" : "unicode";
    const latin = payload.latin;
    const out =
      payload.mode === "english"
        ? latin
        : processConversion(latin, payload.mode as "unicode" | "legacy");
    void pushLocalSyncText(sessionId, {
      latin_draft: latin,
      sinhala_output: out,
      mode: outMode,
    });
  };

  return (
    <MobileKeyboard
      connectionStatus={status}
      enabled={enabled}
      onEnabledChange={setEnabled}
      connectionHint="Start Remote on desktop (same Wi‑Fi) then refresh this page."
      onSync={pushPayload}
      onClear={() => {
        if (enabled && status === "live") {
          void pushLocalSyncText(sessionId, {
            latin_draft: "",
            sinhala_output: "",
            mode: "unicode",
          });
        }
      }}
    />
  );
}
