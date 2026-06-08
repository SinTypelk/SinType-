export type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

export type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives?: number;
  onresult: (e: SpeechRecognitionResultEvent) => void;
  onend: () => void;
  onerror: (e: { error?: string }) => void;
  onstart?: () => void;
  start: () => void;
  stop: () => void;
  abort?: () => void;
};

export type SpeechRecognitionResultEvent = {
  resultIndex: number;
  results: ArrayLike<
    ArrayLike<{ transcript: string }> & { isFinal?: boolean }
  >;
};

export type SpeechAvailability =
  | { ok: true }
  | { ok: false; reason: "insecure" | "unsupported" };

export function probeSpeechRecognition(): SpeechAvailability {
  if (typeof window === "undefined") {
    return { ok: false, reason: "unsupported" };
  }
  if (!window.isSecureContext) {
    return { ok: false, reason: "insecure" };
  }
  if (!getSpeechRecognitionCtor()) {
    return { ok: false, reason: "unsupported" };
  }
  return { ok: true };
}

export function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export const isIOSSafari =
  typeof navigator !== "undefined" &&
  (/iP(hone|ad|od)/.test(navigator.userAgent) ||
    (/Mac/.test(navigator.platform) &&
      (navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints! > 1));
