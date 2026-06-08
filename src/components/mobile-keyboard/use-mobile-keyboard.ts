import { useCallback, useMemo, useRef, useState } from "react";
import type { MobileKeyboardLayer, MobileKeyboardMode } from "./types";
import { HINTS_LOWER, HINTS_UPPER } from "./hints";

export function useMobileKeyboard(
  initialMode: MobileKeyboardMode = "unicode",
  transmissionEnabled = true,
) {
  const [mode, setMode] = useState<MobileKeyboardMode>(initialMode);
  const [buffer, setBuffer] = useState("");
  const [layer, setLayer] = useState<MobileKeyboardLayer>("letters");
  const [shift, setShift] = useState(0);
  const lastShiftTap = useRef(0);

  const previewHtml = useMemo(() => {
    if (!transmissionEnabled) return { kind: "off" as const };
    if (!buffer) return { kind: "placeholder" as const };
    return {
      kind: "html" as const,
      html: escapeHtml(buffer) + '<span class="mk-cursor">|</span>',
    };
  }, [buffer, mode, transmissionEnabled]);

  const hintFor = useCallback(
    (ch: string) => {
      const map = shift > 0 ? HINTS_UPPER : HINTS_LOWER;
      return map[ch.toLowerCase()] ?? "";
    },
    [shift],
  );

  const applyChar = useCallback((ch: string) => {
    setShift((s) => {
      let out = ch;
      if (s > 0 && /[a-z]/.test(out)) out = out.toUpperCase();
      setBuffer((prev) => prev + out);
      return s === 1 ? 0 : s;
    });
  }, []);

  const backspaceOnce = useCallback(() => {
    setBuffer((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
  }, []);

  const clearBuffer = useCallback(() => {
    setBuffer("");
  }, []);

  const changeMode = useCallback((next: MobileKeyboardMode) => {
    setMode(next);
    setBuffer("");
  }, []);

  const toggleShift = useCallback(() => {
    const now = Date.now();
    if (now - lastShiftTap.current < 300) {
      setShift(2);
    } else {
      setShift((s) => (s === 0 ? 1 : 0));
    }
    lastShiftTap.current = now;
  }, []);

  const appendVoice = useCallback((text: string) => {
    const chunk = text.trim();
    if (!chunk) return;
    setBuffer((prev) => (prev + (prev ? " " : "") + chunk).trim());
  }, []);

  return {
    mode,
    buffer,
    layer,
    shift,
    previewHtml,
    setLayer,
    hintFor,
    applyChar,
    backspaceOnce,
    clearBuffer,
    changeMode,
    toggleShift,
    appendVoice,
    setBuffer,
  };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    const m: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return m[c] ?? c;
  });
}
