import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Download, KeyRound, Smartphone, Wifi } from "lucide-react";
import { HeaderKeywordChips } from "@/components/seo/HeaderKeywordChips";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";
import { V2_TAGLINE } from "@/lib/v2-showcase";

export function HeroDownloadCta() {
  const { user } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  const onGetKey = () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    window.location.href = "/license";
  };

  return (
    <section className="max-w-7xl mx-auto px-4 pt-10 pb-2 text-center">
      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        redirectTo="/license"
        title="Sign in to get your key"
        description="Generate a free 30-day activation key for the Windows app after you sign in."
      />

      <div className="inline-flex items-center gap-2 rounded-full border border-[var(--neon-cyan)]/30 bg-[var(--neon-cyan)]/10 px-3 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[var(--neon-cyan)] mb-4">
        <Wifi className="h-3.5 w-3.5" aria-hidden />
        SinType 2.0 Beta · Local Web Server
      </div>

      <p className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-[var(--neon-cyan)] font-semibold mb-3">
        SinType.lk
      </p>
      <h1 className="font-display text-3xl sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight leading-tight text-foreground">
        Sinhala Unicode Converter —{" "}
        <span className="neon-text">Singlish to Sinhala Online</span>
      </h1>
      <p className="mt-4 max-w-3xl mx-auto text-muted-foreground text-sm sm:text-base leading-relaxed">
        Free <strong className="text-foreground font-medium">Singlish to Unicode</strong> in your
        browser — plus{" "}
        <strong className="text-foreground font-medium">SinType Desktop 2.0</strong> with a
        built-in local web server. {V2_TAGLINE}
      </p>

      <p className="mt-3 inline-flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
        <Smartphone className="h-3.5 w-3.5 text-[var(--neon-purple)]" aria-hidden />
        <span>Touchpad · Keyboard · File transfer — all over your private Wi-Fi</span>
      </p>

      <HeaderKeywordChips />
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/download"
          className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-sm sm:text-base font-bold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))",
            boxShadow:
              "0 0 28px color-mix(in oklab, var(--neon-cyan) 55%, transparent), 0 0 48px color-mix(in oklab, var(--neon-purple) 25%, transparent), inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          <Download className="relative w-5 h-5" strokeWidth={2.5} />
          <span className="relative">Download v2.0 </span>
        </Link>
        <button
          type="button"
          onClick={onGetKey}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm sm:text-base font-semibold border border-[var(--neon-cyan)] text-[var(--neon-cyan)] hover:bg-accent/20 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <KeyRound className="w-5 h-5" />
          Generate 30-day key
        </button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Windows 10/11 · release — see download page for stable/Beta builds
      </p>
    </section>
  );
}
