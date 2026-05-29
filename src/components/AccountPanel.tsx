import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import QRCode from "qrcode";
import { Copy, Check, LogIn, Smartphone, ExternalLink } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { SUPABASE_CONFIGURED } from "@/integrations/supabase/client";

type AccountPanelProps = {
  compact?: boolean;
};

export function AccountPanel({ compact = false }: AccountPanelProps) {
  const { user, profile, profileLoading, loading } = useAuth();
  const [origin, setOrigin] = useState("");
  const [copiedKey, setCopiedKey] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const mobileUrl = user && origin ? `${origin}/m/${user.id}` : "";
  const qrSize = compact ? 128 : 168;

  useEffect(() => {
    if (!canvasRef.current || !mobileUrl) return;
    QRCode.toCanvas(canvasRef.current, mobileUrl, {
      width: qrSize,
      margin: 2,
      color: { dark: "#22d3ee", light: "#0a0d1200" },
    }).catch(() => {});
  }, [mobileUrl, qrSize]);

  if (loading) return null;

  const shell = compact
    ? "rounded-lg border border-border/70 bg-card/35 backdrop-blur-sm p-3 sm:p-4"
    : "neon-border p-5";

  if (!user) {
    return (
      <div
        className={`${shell} flex flex-wrap items-center justify-between gap-2 sm:gap-3`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Smartphone
            className={`shrink-0 text-[var(--neon-cyan)] ${compact ? "w-4 h-4" : "w-5 h-5"}`}
          />
          <div className="min-w-0">
            <p
              className={`font-display uppercase text-muted-foreground ${
                compact ? "text-[9px] tracking-[0.22em]" : "text-sm tracking-widest"
              }`}
            >
              Mobile Sync
            </p>
            <p className={compact ? "text-[11px] text-muted-foreground" : "text-sm"}>
              Sign in to pair your phone as a remote keyboard.
            </p>
          </div>
        </div>
        <Link
          to="/login"
          className={`inline-flex items-center gap-1.5 shrink-0 rounded-md font-semibold text-primary-foreground ${
            compact ? "px-3 py-1.5 text-[11px]" : "px-4 py-2 text-sm"
          }`}
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklab, var(--neon-cyan) 85%, transparent), color-mix(in oklab, var(--neon-purple) 85%, transparent))",
          }}
        >
          <LogIn className={compact ? "w-3 h-3" : "w-4 h-4"} /> Sign in
        </Link>
      </div>
    );
  }

  const copyKey = async () => {
    if (!profile?.license_key) return;
    await navigator.clipboard.writeText(profile.license_key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 1500);
  };

  return (
    <div className={shell}>
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <a
          href={mobileUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open mobile keyboard page"
          className="group shrink-0 rounded-xl border border-border/60 bg-background/80 p-2 transition hover:border-[var(--neon-cyan)]/50 hover:shadow-[0_0_24px_color-mix(in_oklab,var(--neon-cyan)_25%,transparent)]"
        >
          <canvas ref={canvasRef} className="block rounded-lg" />
          <span className="mt-1 flex items-center justify-center gap-1 text-[10px] text-muted-foreground group-hover:text-[var(--neon-cyan)]">
            <ExternalLink className="w-3 h-3" /> Tap to open on phone
          </span>
        </a>

        <div className="flex-1 min-w-0 text-center sm:text-left space-y-2">
          <p className="font-display text-sm tracking-widest uppercase text-muted-foreground">
            Mobile Sync
          </p>
          <p className="text-sm text-foreground/90 truncate">{user.email}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Scan this QR code with your phone to use it as a remote keyboard. Type or speak
            Singlish on your phone — text streams live into the converter below.
          </p>
          {!SUPABASE_CONFIGURED && (
            <p className="text-xs text-destructive">
              Mobile sync is disabled: set <code className="font-mono">VITE_SUPABASE_URL</code> and{" "}
              <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> on your host (e.g. Cloudflare
              build env).
            </p>
          )}
          {profile?.license_key && !profileLoading && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <code className="text-xs font-mono px-2 py-1 rounded-md bg-secondary/80 truncate max-w-[14rem]">
                {profile.license_key}
              </code>
              <button
                type="button"
                onClick={copyKey}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-border hover:bg-accent/20"
                title="Copy activation key for desktop app"
              >
                {copiedKey ? (
                  <Check className="w-3.5 h-3.5 text-[var(--neon-cyan)]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                Copy activation key
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
