import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import QRCode from "qrcode";
import { Copy, Check, LogIn, LogOut, Smartphone } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

type AccountPanelProps = {
  /** Secondary, smaller layout for use below the download hero */
  compact?: boolean;
};

export function AccountPanel({ compact = false }: AccountPanelProps) {
  const { user, profile, profileLoading, signOut, loading } = useAuth();
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const url = user && origin ? `${origin}/m/${user.id}` : "";
  const qrSize = compact ? 96 : 180;

  useEffect(() => {
    if (!canvasRef.current || !url) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: qrSize,
      margin: 1,
      color: { dark: "#22d3ee", light: "#00000000" },
    }).catch(() => {});
  }, [url, qrSize]);

  if (loading) return null;

  const shell = compact
    ? "rounded-lg border border-border/70 bg-card/35 backdrop-blur-sm p-3 sm:p-3.5"
    : "neon-border p-5";

  if (!user) {
    return (
      <div
        className={`${shell} flex flex-wrap items-center justify-between gap-2 sm:gap-3`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Smartphone
            className={`shrink-0 text-[var(--neon-cyan)] ${compact ? "w-4 h-4 opacity-80" : "w-5 h-5"}`}
          />
          <div className="min-w-0 text-left">
            <p
              className={`font-display uppercase text-muted-foreground ${
                compact
                  ? "text-[9px] tracking-[0.22em]"
                  : "text-sm tracking-widest"
              }`}
            >
              Mobile Sync
            </p>
            <p className={compact ? "text-[11px] text-muted-foreground/90" : "text-sm"}>
              {compact
                ? "Optional — sign in to pair your phone via QR."
                : "Sign in to pair your phone via QR code."}
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

  const copy = async () => {
    await navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const copyKey = async () => {
    if (!profile?.license_key) return;
    await navigator.clipboard.writeText(profile.license_key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 1500);
  };

  if (compact) {
    return (
      <div className={shell}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="p-1.5 rounded-lg bg-background/80 border border-border/60 shrink-0">
            <canvas ref={canvasRef} />
          </div>
          <div className="flex-1 min-w-[12rem]">
            <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
              Mobile Sync · Secondary
            </p>
            <p className="text-xs truncate text-foreground/90">{user.email}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Activation Key:{" "}
              {profileLoading ? (
                <span>Loading…</span>
              ) : profile?.license_key ? (
                <code className="font-mono">{profile.license_key}</code>
              ) : (
                <span>Not ready</span>
              )}
            </p>
            <p className="mt-1.5 text-[10px] text-muted-foreground leading-snug">
              Scan QR — phone input streams into the converter below.
            </p>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={copy}
              className="p-1.5 rounded-md border border-border/70 hover:bg-accent/20"
              title="Copy session ID"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-[var(--neon-cyan)]" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          <button
            onClick={copyKey}
            disabled={!profile?.license_key || profileLoading}
            className="p-1.5 rounded-md border border-border/70 hover:bg-accent/20 disabled:opacity-50"
            title="Copy activation key"
          >
            {copiedKey ? (
              <Check className="w-3.5 h-3.5 text-[var(--neon-cyan)]" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1 text-[10px] px-2 py-1.5 rounded-md border border-border/70 hover:bg-accent/20"
            >
              <LogOut className="w-3 h-3" /> Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={shell}>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
        <div className="p-3 rounded-xl bg-background border border-border shrink-0 mx-auto md:mx-0">
          <canvas ref={canvasRef} />
        </div>
        <div className="flex-1 w-full">
          <p className="font-display text-sm tracking-widest uppercase text-muted-foreground">
            Your account
          </p>
          <p className="text-base mt-0.5 truncate">{user.email}</p>

          <p className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground">
            Activation key
          </p>
          <div className="flex items-center gap-2 mt-1">
            <code className="flex-1 text-xs font-mono px-3 py-2 rounded-md bg-secondary truncate">
              {profileLoading ? "Loading…" : profile?.license_key ?? "Not ready"}
            </code>
            <button
              onClick={copyKey}
              disabled={!profile?.license_key || profileLoading}
              className="p-2 rounded-md border border-border hover:bg-accent/30 disabled:opacity-50"
              title="Copy activation key"
            >
              {copiedKey ? (
                <Check className="w-4 h-4 text-[var(--neon-cyan)]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          <p className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground">
            Unique ID
          </p>
          <div className="flex items-center gap-2 mt-1">
            <code className="flex-1 text-xs font-mono px-3 py-2 rounded-md bg-secondary truncate">
              {user.id}
            </code>
            <button
              onClick={copy}
              className="p-2 rounded-md border border-border hover:bg-accent/30"
              title="Copy ID"
            >
              {copied ? (
                <Check className="w-4 h-4 text-[var(--neon-cyan)]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground flex items-center gap-2">
            <Smartphone className="w-3.5 h-3.5 text-[var(--neon-cyan)]" />
            Scan the QR with your phone — text you type there will stream directly into
            the input box below.
          </p>

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={signOut}
              className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-md border border-border hover:bg-accent/30"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
