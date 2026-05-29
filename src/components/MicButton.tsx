import { Mic } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getSpeechRecognitionCtor,
  isIOSSafari,
  probeSpeechRecognition,
  type SpeechAvailability,
  type SpeechRecognitionInstance,
  type SpeechRecognitionResultEvent,
} from "@/lib/speech-recognition";

export type MicTranscriptOptions = {
  final: boolean;
};

type MicAvailability = SpeechAvailability | "checking";

function unavailableTitle(reason: "insecure" | "unsupported"): string {
  if (reason === "insecure") {
    return "Voice typing needs HTTPS (secure connection)";
  }
  return "Voice typing needs Chrome, Edge, or Safari (Web Speech API)";
}

export function MicButton({
  onTranscript,
  onListenStart,
  lang = "si-LK",
}: {
  onTranscript: (text: string, options: MicTranscriptOptions) => void;
  onListenStart?: () => void;
  lang?: string;
}) {
  const [availability, setAvailability] = useState<MicAvailability>("checking");
  const [active, setActive] = useState(false);
  const recRef = useRef<SpeechRecognitionInstance | null>(null);
  const wantActiveRef = useRef(false);
  const committedRef = useRef("");
  const onTranscriptRef = useRef(onTranscript);
  const onListenStartRef = useRef(onListenStart);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);
  useEffect(() => {
    onListenStartRef.current = onListenStart;
  }, [onListenStart]);

  const refreshAvailability = useCallback(() => {
    if (typeof window === "undefined") return;
    setAvailability(probeSpeechRecognition());
  }, []);

  useEffect(() => {
    refreshAvailability();
    window.addEventListener("load", refreshAvailability);
    document.addEventListener("visibilitychange", refreshAvailability);
    return () => {
      window.removeEventListener("load", refreshAvailability);
      document.removeEventListener("visibilitychange", refreshAvailability);
    };
  }, [refreshAvailability]);

  const attachHandlers = (rec: SpeechRecognitionInstance) => {
    rec.onresult = (e: SpeechRecognitionResultEvent) => {
      let interim = "";
      let finalChunk = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const transcript = res[0]?.transcript ?? "";
        if (res.isFinal) {
          finalChunk += transcript;
        } else {
          interim += transcript;
        }
      }
      finalChunk = finalChunk.trim();
      interim = interim.trim();

      if (finalChunk) {
        committedRef.current = committedRef.current
          ? `${committedRef.current} ${finalChunk}`
          : finalChunk;
        onTranscriptRef.current(committedRef.current, { final: true });
        return;
      }
      if (interim) {
        const live = committedRef.current
          ? `${committedRef.current} ${interim}`
          : interim;
        onTranscriptRef.current(live, { final: false });
      }
    };
    rec.onend = () => {
      if (wantActiveRef.current && recRef.current) {
        try {
          recRef.current.start();
          return;
        } catch {
          // fall through
        }
      }
      setActive(false);
    };
    rec.onerror = (err) => {
      const name = err?.error;
      if (name === "no-speech" || name === "aborted") return;
      wantActiveRef.current = false;
      setActive(false);
    };
  };

  const buildRec = (): SpeechRecognitionInstance | null => {
    const SR = getSpeechRecognitionCtor();
    if (!SR) return null;
    const rec = new SR();
    rec.lang = lang;
    rec.continuous = !isIOSSafari;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    attachHandlers(rec);
    return rec;
  };

  const stop = () => {
    wantActiveRef.current = false;
    try {
      recRef.current?.stop();
    } catch {
      // noop
    }
    setActive(false);
  };

  const startFromClick = async () => {
    refreshAvailability();
    const probe = probeSpeechRecognition();
    setAvailability(probe);
    if (!probe.ok) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      // Permission may be granted on rec.start()
    }

    const rec = buildRec();
    if (!rec) {
      setAvailability({ ok: false, reason: "unsupported" });
      return;
    }
    recRef.current = rec;
    committedRef.current = "";
    wantActiveRef.current = true;
    onListenStartRef.current?.();
    try {
      rec.start();
      setActive(true);
    } catch {
      wantActiveRef.current = false;
      setActive(false);
    }
  };

  const toggle = () => {
    if (active) {
      stop();
      return;
    }
    void startFromClick();
  };

  useEffect(
    () => () => {
      wantActiveRef.current = false;
      try {
        recRef.current?.abort?.();
      } catch {
        // noop
      }
    },
    [],
  );

  if (availability !== "checking" && !availability.ok) {
    return (
      <button
        type="button"
        disabled
        title={unavailableTitle(availability.reason)}
        className="p-3 rounded-full border border-border bg-card opacity-40 cursor-not-allowed"
        aria-label="Voice typing unavailable"
      >
        <Mic className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={active ? "Stop voice typing" : "Start voice typing"}
      aria-pressed={active}
      className={`shrink-0 p-3 rounded-full border border-border bg-card hover:bg-accent/30 transition-colors ${
        active ? "mic-active border-[var(--neon-pink)]/50" : ""
      } ${availability === "checking" ? "opacity-80" : ""}`}
    >
      <Mic className={`w-5 h-5 ${active ? "text-[var(--neon-pink)]" : ""}`} />
    </button>
  );
}
