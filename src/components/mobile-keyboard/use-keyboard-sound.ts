import { useCallback, useRef } from "react";

export function useKeyboardSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playClick = useCallback((freq = 180, durSec = 0.012) => {
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") void ctx.resume();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = freq;
      o.type = "square";
      g.gain.value = 0.045;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      window.setTimeout(() => {
        try {
          o.stop();
        } catch {
          /* ignore */
        }
      }, Math.max(8, durSec * 1000));
    } catch {
      /* ignore */
    }
  }, []);

  return { playClick };
}
