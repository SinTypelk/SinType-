import { useRef, type ReactNode } from "react";

type KeyButtonProps = {
  className?: string;
  children: ReactNode;
  hint?: string;
  onPress: () => void;
  onRelease?: () => void;
};

export function KeyButton({ className = "", children, hint, onPress, onRelease }: KeyButtonProps) {
  const pressed = useRef(false);

  const start = (e: React.PointerEvent) => {
    e.preventDefault();
    if (pressed.current) return;
    pressed.current = true;
    (e.currentTarget as HTMLElement).classList.add("mk-pressed");
    onPress();
  };

  const end = (e: React.PointerEvent) => {
    e.preventDefault();
    if (!pressed.current) return;
    pressed.current = false;
    (e.currentTarget as HTMLElement).classList.remove("mk-pressed");
    onRelease?.();
  };

  return (
    <button
      type="button"
      className={`mk-key ${className}`.trim()}
      onPointerDown={start}
      onPointerUp={end}
      onPointerCancel={end}
      onPointerLeave={end}
    >
      {children}
      {hint ? <span className="mk-hint">{hint}</span> : null}
    </button>
  );
}
