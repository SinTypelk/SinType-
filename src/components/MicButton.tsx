import { Mic } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type SRResult = {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }>;
};
type SRInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives?: number;
  onresult: (e: SRResult) => void;
  onend: () => void;
  onerror: (e: unknown) => void;
  onstart?: () => void;
  start: () => void;
  stop: () => void;
  abort?: () => void;
};
type SRCtor = { new (): SRInstance };

export type MicTranscriptOptions = {
  final: boolean;
};

function getSR(): SRCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const isIOS =
  typeof navigator !== "undefined" &&
  (/iP(hone|ad|od)/.test(navigator.userAgent) ||
    (/Mac/.test(navigator.platform) &&
      (navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints! > 1));

export function MicButton({
  onTranscript,
  onListenStart,
  lang = "si-LK",
}: {
  onTranscript: (text: string, options: MicTranscriptOptions) => void;
  onListenStart?: () => void;
  lang?: string;
}) {
  const [active, setActive] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const recRef = useRef<SRInstance | null>(null);
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

  useEffect(() => {
    setAvailable(!!getSR());
  }, []);

  const attachHandlers = (rec: SRInstance) => {
    rec.onresult = (e) => {
      let interim = "";
      let finalChunk = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const transcript = res[0]?.transcript ?? "";
        if ((res as { isFinal?: boolean }).isFinal) {
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
      const name = (err as { error?: string })?.error;
      if (name === "no-speech" || name === "aborted") return;
      wantActiveRef.current = false;
      setActive(false);
    };
  };

  const buildRec = (): SRInstance | null => {
    const SR = getSR();
    if (!SR) return null;
    const rec = new SR();
    rec.lang = lang;
    rec.continuous = !isIOS;
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

  const startFromClick = () => {
    const rec = buildRec();
    if (!rec) return;
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
      return;
    }
    void navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then((stream) => stream.getTracks().forEach((t) => t.stop()))
      .catch(() => {});
  };

  const toggle = () => {
    if (active) {
      stop();
      return;
    }
    startFromClick();
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

  if (available === false) {
    return (
      <button
        type="button"
        disabled
        title="Voice typing not supported in this browser"
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
      }`}
    >
      <Mic className={`w-5 h-5 ${active ? "text-[var(--neon-pink)]" : ""}`} />
    </button>
  );
}
