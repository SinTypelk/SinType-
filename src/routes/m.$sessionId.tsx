import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { processConversion } from "@/lib/sinhala";
import { MicButton } from "@/components/MicButton";
import { BrandLogo } from "@/components/BrandLogo";
import { ClientOnly } from "@/components/ClientOnly";
import {
  pushSyncText,
  subscribeMobileSync,
  type SyncConnectionStatus,
  type SyncSubscription,
} from "@/lib/realtime-sync";

export const Route = createFileRoute("/m/$sessionId")({
  head: () => ({
    meta: [
      { title: "Sintype.lk · Mobile Input" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MobilePage,
});

function MobilePage() {
  const { sessionId } = Route.useParams();
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<SyncConnectionStatus>("connecting");
  const syncRef = useRef<SyncSubscription | null>(null);
  const voiceBaseRef = useRef("");
  const sinhala = processConversion(draft, "unicode");
  const draftRef = useRef(draft);
  draftRef.current = draft;

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

  useEffect(() => {
    if (status !== "live") return;
    const id = setTimeout(() => {
      void pushSyncText(sessionId, draftRef.current);
    }, 80);
    return () => clearTimeout(id);
  }, [draft, status, sessionId]);

  const clearBoth = () => {
    setDraft("");
    voiceBaseRef.current = "";
    void pushSyncText(sessionId, "");
  };

  const statusLabel =
    status === "live"
      ? "Live · streaming to desktop"
      : status === "connecting"
        ? "Connecting…"
        : status === "unconfigured"
          ? "Sync unavailable"
          : "Connection error — re-run SQL + enable table Realtime";

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      <header className="sticky top-0 z-10 px-4 py-3 border-b border-border bg-card/80 backdrop-blur flex items-center gap-3">
        <BrandLogo
          className="w-8 h-8"
          alt="SinType mobile sync logo — stream Singlish to desktop"
        />
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-bold tracking-wider neon-text text-lg">
            Sintype.lk · Mobile
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest truncate">
            {statusLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={clearBoth}
          className="p-2 rounded-md border border-border"
          aria-label="Clear"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
          Live preview (mirrored on desktop)
        </p>
        <div className="min-h-[40vh] p-4 rounded-xl bg-card border border-border text-lg leading-relaxed whitespace-pre-wrap break-words">
          {sinhala || (
            <span className="text-muted-foreground text-sm">
              Start typing or speaking below…
            </span>
          )}
        </div>
      </main>

      <footer className="sticky bottom-0 px-3 py-3 border-t border-border bg-card/90 backdrop-blur">
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type Singlish or Sinhala…"
            rows={2}
            className="flex-1 min-h-[56px] max-h-40 px-3 py-3 rounded-2xl bg-secondary text-base outline-none resize-none"
          />
          <ClientOnly
            fallback={
              <span className="shrink-0 p-3 rounded-full border border-border opacity-50">
                <span className="sr-only">Loading microphone</span>
              </span>
            }
          >
            <MicButton
              onListenStart={() => {
                voiceBaseRef.current = draft;
              }}
              onTranscript={(raw, { final }) => {
                const chunk = raw.trim();
                if (!chunk) return;
                const merged =
                  voiceBaseRef.current +
                  (voiceBaseRef.current ? " " : "") +
                  chunk;
                setDraft(merged);
                if (final) voiceBaseRef.current = merged;
              }}
            />
          </ClientOnly>
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground text-center">
          Each keystroke and voice phrase syncs automatically — no send button needed.
        </p>
      </footer>
    </div>
  );
}
