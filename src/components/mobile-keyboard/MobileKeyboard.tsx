import { useEffect, useRef } from "react";
import { ClientOnly } from "@/components/ClientOnly";
import { MicButton } from "@/components/MicButton";
import { KeyButton } from "./KeyButton";
import { useKeyboardSound } from "./use-keyboard-sound";
import { useMobileKeyboard } from "./use-mobile-keyboard";
import type { MobileKeyboardProps } from "./types";
import "./mobile-keyboard.css";

const ROW1 = "qwertyuiop".split("");
const ROW2 = "asdfghjkl".split("");
const ROW3 = "zxcvbnm".split("");

const NUM_ROW1 = "1234567890".split("");
const NUM_ROW2 = ["-", "\\", ":", ";", "(", ")", "$", "&", "@", '"'];
const NUM_ROW3 = [".", ",", "?", "!", "'"];

const SYM_ROW1 = ["[", "]", "{", "}", "#", "%", "\\", "*", "+", "="];
const SYM_ROW2 = ["_", "/", "|", "~", "<", ">", "€", "£", "¥", "•"];

export function MobileKeyboard({
  connectionStatus,
  enabled,
  onEnabledChange,
  onSync,
  onClear,
  connectionHint,
  onBackspaceRemote,
}: MobileKeyboardProps) {
  const kb = useMobileKeyboard("unicode", enabled);
  const { buffer, mode } = kb;
  const { playClick } = useKeyboardSound();
  const voiceBaseRef = useRef("");

  const backTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backRepeat = useRef<ReturnType<typeof setInterval> | null>(null);
  const backLong = useRef(false);

  const spaceHoldTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spaceCursor = useRef(false);
  const spaceLastX = useRef(0);
  const spaceAccum = useRef(0);
  const spacePressed = useRef(false);

  const isOnline = connectionStatus === "live";
  const showOverlay = connectionStatus === "error" || connectionStatus === "unconfigured";

  useEffect(() => {
    if (!enabled || !isOnline) return;
    const id = window.setTimeout(() => {
      onSync({ latin: buffer, mode });
    }, 60);
    return () => window.clearTimeout(id);
  }, [buffer, mode, enabled, isOnline, onSync]);

  const pressChar = (ch: string) => {
    playClick();
    kb.applyChar(ch);
  };

  const doSpace = () => {
    playClick(220, 0.02);
    kb.setBuffer((prev) => prev + " ");
  };

  const doReturn = () => {
    playClick(260, 0.02);
    kb.setBuffer((prev) => prev + "\n");
  };

  const backStart = () => {
    backLong.current = false;
    playClick();
    backTimer.current = window.setTimeout(() => {
      backLong.current = true;
      backRepeat.current = window.setInterval(() => {
        if (kb.buffer.length > 0) kb.backspaceOnce();
        else onBackspaceRemote?.(1);
      }, 70);
      window.setTimeout(() => {
        kb.clearBuffer();
        onClear?.();
      }, 900);
    }, 320);
  };

  const backEnd = () => {
    if (backTimer.current) window.clearTimeout(backTimer.current);
    if (backRepeat.current) {
      window.clearInterval(backRepeat.current);
      backRepeat.current = null;
    }
    if (backLong.current) return;
    if (kb.buffer.length > 0) kb.backspaceOnce();
    else onBackspaceRemote?.(1);
  };

  const statusText =
    connectionStatus === "live"
      ? "online"
      : connectionStatus === "connecting"
        ? "connecting…"
        : "offline";

  const previewContent = () => {
    if (kb.previewHtml.kind === "off") return "SinType OFF";
    if (kb.previewHtml.kind === "placeholder") return "type karanna…";
    return <span dangerouslySetInnerHTML={{ __html: kb.previewHtml.html }} />;
  };

  const renderLetterRow = (keys: string[], indent = false) => (
    <div className={`mk-row${indent ? " mk-indent" : ""}`}>
      {keys.map((c) => (
        <KeyButton key={c} hint={kb.mode !== "english" ? kb.hintFor(c) : ""} onPress={() => pressChar(c)}>
          {c}
        </KeyButton>
      ))}
    </div>
  );

  return (
    <div
      className={`mk-root mk-mode-${kb.mode}`}
      data-mode={kb.mode}
    >
      <div className="mk-topbar">
        <div className="mk-brand">
          Sin<span className="mk-accent">Type</span>
        </div>
        <div className={`mk-status${isOnline ? " mk-online" : ""}`}>
          <span className="mk-dot" />
          <span>{statusText}</span>
        </div>
      </div>

      <div className="mk-output">
        <div
          className={`mk-preview${!enabled ? " mk-off" : ""}${kb.previewHtml.kind === "placeholder" ? " mk-placeholder" : ""}`}
        >
          <div className={`mk-preview-text${kb.mode === "english" ? " mk-english" : ""}`}>{previewContent()}</div>
        </div>
      </div>

      <div className="mk-kb-wrap">
        <div className="mk-modebar">
          {(["unicode", "legacy", "english"] as const).map((m) => (
            <button
              key={m}
              type="button"
              data-mode={m}
              className={`mk-mb-tab${kb.mode === m ? " mk-active" : ""}`}
              onClick={() => {
                if (kb.mode === m) return;
                kb.changeMode(m);
                if (enabled && isOnline) onClear?.();
              }}
            >
              {m === "unicode" ? "Uni" : m === "legacy" ? "Leg" : "EN"}
            </button>
          ))}
        </div>

        <div className="mk-kb">
          <div className={`mk-layer${kb.layer === "letters" ? " mk-show" : ""}`}>
            {renderLetterRow(ROW1)}
            {renderLetterRow(ROW2, true)}
            <div className="mk-row">
              <KeyButton
                className={`mk-special mk-wide${kb.shift > 0 ? " mk-active" : ""}`}
                onPress={() => {
                  playClick();
                  kb.toggleShift();
                }}
              >
                {kb.shift === 2 ? "⇧⇧" : "⇧"}
              </KeyButton>
              {ROW3.map((c) => (
                <KeyButton key={c} hint={kb.mode !== "english" ? kb.hintFor(c) : ""} onPress={() => pressChar(c)}>
                  {c}
                </KeyButton>
              ))}
              <KeyButton className="mk-special mk-wide" onPress={backStart} onRelease={backEnd}>
                ⌫
              </KeyButton>
            </div>
            <div className="mk-row">
              <KeyButton className="mk-special mk-wide" onPress={() => kb.setLayer("numbers")}>
                123
              </KeyButton>
              <KeyButton onPress={() => pressChar(".")}>.</KeyButton>
              <SpaceKey
                onSpace={doSpace}
                onSpecial={onBackspaceRemote}
                playClick={playClick}
                spaceHoldTimer={spaceHoldTimer}
                spaceCursor={spaceCursor}
                spaceLastX={spaceLastX}
                spaceAccum={spaceAccum}
                spacePressed={spacePressed}
              />
              <KeyButton className="mk-special mk-wide" onPress={doReturn}>
                return
              </KeyButton>
            </div>
          </div>

          <div className={`mk-layer${kb.layer === "numbers" ? " mk-show" : ""}`}>
            {renderLetterRow(NUM_ROW1)}
            <div className="mk-row">
              {NUM_ROW2.map((c) => (
                <KeyButton key={c} onPress={() => pressChar(c)}>
                  {c === "\\" ? "\\" : c}
                </KeyButton>
              ))}
            </div>
            <div className="mk-row">
              <KeyButton className="mk-special mk-wide" onPress={() => kb.setLayer("symbols")}>
                #+=
              </KeyButton>
              {NUM_ROW3.map((c) => (
                <KeyButton key={c} onPress={() => pressChar(c)}>
                  {c}
                </KeyButton>
              ))}
              <KeyButton className="mk-special mk-wide" onPress={backStart} onRelease={backEnd}>
                ⌫
              </KeyButton>
            </div>
            <div className="mk-row">
              <KeyButton className="mk-special mk-wide" onPress={() => kb.setLayer("letters")}>
                ABC
              </KeyButton>
              <KeyButton className="mk-space" onPress={doSpace}>
                space
              </KeyButton>
              <KeyButton className="mk-special mk-wide" onPress={doReturn}>
                return
              </KeyButton>
            </div>
          </div>

          <div className={`mk-layer${kb.layer === "symbols" ? " mk-show" : ""}`}>
            <div className="mk-row">
              {SYM_ROW1.map((c) => (
                <KeyButton key={c} onPress={() => pressChar(c)}>
                  {c}
                </KeyButton>
              ))}
            </div>
            <div className="mk-row">
              {SYM_ROW2.map((c) => (
                <KeyButton key={c} onPress={() => pressChar(c)}>
                  {c}
                </KeyButton>
              ))}
            </div>
            <div className="mk-row">
              <KeyButton className="mk-special mk-wide" onPress={() => kb.setLayer("numbers")}>
                123
              </KeyButton>
              {NUM_ROW3.map((c) => (
                <KeyButton key={c} onPress={() => pressChar(c)}>
                  {c}
                </KeyButton>
              ))}
              <KeyButton className="mk-special mk-wide" onPress={backStart} onRelease={backEnd}>
                ⌫
              </KeyButton>
            </div>
            <div className="mk-row">
              <KeyButton className="mk-special mk-wide" onPress={() => kb.setLayer("letters")}>
                ABC
              </KeyButton>
              <KeyButton className="mk-space" onPress={doSpace}>
                space
              </KeyButton>
              <KeyButton className="mk-special mk-wide" onPress={doReturn}>
                return
              </KeyButton>
            </div>
          </div>
        </div>

        <div className="mk-bottombar">
          <button
            type="button"
            className={`mk-bb-btn mk-power${enabled ? "" : " mk-off"}`}
            aria-label="Power"
            onClick={() => onEnabledChange(!enabled)}
          >
            ⏻
          </button>
          <div className="mk-mic-slot">
            <ClientOnly fallback={<span className="mk-bb-btn mk-mic" style={{ opacity: 0.4 }} />}>
              <MicButton
                className="mk-bb-btn mk-mic"
                onListenStart={() => {
                  voiceBaseRef.current = kb.buffer;
                }}
                onTranscript={(raw, { final }) => {
                  const chunk = raw.trim();
                  if (!chunk) return;
                  kb.appendVoice(chunk);
                  if (final) voiceBaseRef.current = kb.buffer;
                }}
              />
            </ClientOnly>
          </div>
        </div>
      </div>

      <div className={`mk-overlay${showOverlay ? " mk-show" : ""}`}>
        <h2>Connection unavailable</h2>
        <p>{connectionHint ?? "Check your connection and try again."}</p>
        <span className="mk-dots">
          <span />
          <span />
          <span />
        </span>
      </div>
    </div>
  );
}

function SpaceKey({
  onSpace,
  playClick,
  spaceHoldTimer,
  spaceCursor,
  spaceLastX,
  spaceAccum,
  spacePressed,
}: {
  onSpace: () => void;
  onSpecial?: (count?: number) => void;
  playClick: (freq?: number, dur?: number) => void;
  spaceHoldTimer: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
  spaceCursor: React.MutableRefObject<boolean>;
  spaceLastX: React.MutableRefObject<number>;
  spaceAccum: React.MutableRefObject<number>;
  spacePressed: React.MutableRefObject<boolean>;
}) {
  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    spacePressed.current = true;
    spaceCursor.current = false;
    spaceAccum.current = 0;
    spaceLastX.current = e.clientX;
    (e.currentTarget as HTMLElement).classList.add("mk-pressed");
    spaceHoldTimer.current = window.setTimeout(() => {
      spaceCursor.current = true;
    }, 220);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!spacePressed.current || !spaceCursor.current) return;
    const dx = e.clientX - spaceLastX.current;
    spaceLastX.current = e.clientX;
    spaceAccum.current += dx;
    const step = 18;
    while (spaceAccum.current >= step) {
      spaceAccum.current -= step;
      onSpecial?.(1);
    }
    while (spaceAccum.current <= -step) {
      spaceAccum.current += step;
      onSpecial?.(1);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    if (spaceHoldTimer.current) window.clearTimeout(spaceHoldTimer.current);
    (e.currentTarget as HTMLElement).classList.remove("mk-pressed");
    spacePressed.current = false;
    if (spaceCursor.current) {
      spaceCursor.current = false;
      return;
    }
    onSpace();
  };

  return (
    <button
      type="button"
      className="mk-key mk-space"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      space
    </button>
  );
}
