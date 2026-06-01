import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Download, KeyRound } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";

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
      <p className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-[var(--neon-cyan)] font-semibold mb-3">
        SinType.lk
      </p>
      <h1 className="font-display text-3xl sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight leading-tight text-foreground min-h-[5.5rem] sm:min-h-[7rem] lg:min-h-[7.5rem]">
        Professional Sinhala Typing.{" "}
        <span className="neon-text">Sinhala Unicode &amp; FM Abhaya Converter.</span>
      </h1>
      <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-sm sm:text-base leading-relaxed">
        Lightning-fast Singlish transliteration with a professional, glassmorphic design.
        Convert to Sinhala Unicode or Legacy FM fonts online — or install the offline
        Windows desktop app for system-wide typing in any program.
      </p>
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
          <span
            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{
              boxShadow:
                "0 0 32px color-mix(in oklab, var(--neon-cyan) 70%, transparent), 0 0 20px color-mix(in oklab, var(--neon-purple) 50%, transparent)",
            }}
          />
          <Download className="relative w-5 h-5" strokeWidth={2.5} />
          <span className="relative">Go to Download</span>
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
        Free Windows desktop app · sign-in required for activation keys
      </p>
    </section>
  );
}
