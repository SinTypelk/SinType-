import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Copy, Check, KeyRound, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  fetchActiveLicenseForEmail,
  getOrCreateLicense,
  LICENSE_DAYS,
  userLicenseToDisplay,
  type UserLicense,
} from "@/lib/license-service";
import { LoginModal } from "@/components/LoginModal";
import { LicenseProfileCard } from "@/components/LicenseProfileCard";
import { OptionalShareCard } from "@/components/OptionalShareCard";

export const Route = createFileRoute("/license")({
  head: () => ({
    meta: [
      { title: "Get a 30-day Activation Key — SinType.lk" },
      {
        name: "description",
        content:
          "Sign in and get a free 30-day activation key for the SinType Windows desktop app.",
      },
    ],
  }),
  component: LicenseHub,
});

function LicenseHub() {
  const { user, profile, profileLoading: authProfileLoading, loading: authLoading } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [license, setLicense] = useState<UserLicense | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLicense = useCallback(async (email: string) => {
      setProfileLoading(true);
      setError(null);
      try {
        const active = await fetchActiveLicenseForEmail(email);
        setLicense(active);
      } catch (e: unknown) {
        setError((e as Error).message ?? "Could not load your license.");
        setLicense(null);
      } finally {
        setProfileLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (authLoading || authProfileLoading) {
      return;
    }
    if (!user?.email) {
      setLicense(null);
      setProfileLoading(false);
      return;
    }
    loadLicense(user.email);
  }, [user?.email, authLoading, authProfileLoading, loadLicense]);

  useEffect(() => {
    if (!user?.email || authLoading) return;
    const id = setInterval(() => {
      void loadLicense(user.email!);
    }, 30_000);
    return () => clearInterval(id);
  }, [user?.email, authLoading, loadLicense]);

  const generate = async () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    if (!user.email) {
      setError("Your account has no email address. Use Google sign-in or add an email.");
      return;
    }

    setError(null);
    setGenerating(true);

    try {
      const record = await getOrCreateLicense(user.email, user.id);
      setLicense(record);
    } catch (e: unknown) {
      setError((e as Error).message ?? "Could not create your key. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  const hasActiveKey = !!license;
  const display = license ? userLicenseToDisplay(license) : null;

  return (
    <section className="max-w-5xl mx-auto px-6 pt-14 pb-24">
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} redirectTo="/license" />

      <header className="mb-10">
        <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">License</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2">Activation Hub</h1>
        <p className="mt-3 text-muted-foreground max-w-xl">
          Sign in to get a free {LICENSE_DAYS}-day activation key for the Windows desktop app. If you already
          have an active key, we will show it here instead of creating a duplicate.
          {!authLoading && !user && (
            <span className="block mt-2 text-[var(--neon-cyan)]">
              Sign in is required before we can issue your key.
            </span>
          )}
        </p>
        {!user && !authLoading && (
          <Link
            to="/login"
            search={{ redirect: "/license" }}
            className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-[var(--neon-cyan)] hover:underline"
          >
            <LogIn className="w-4 h-4" /> Sign in to continue
          </Link>
        )}
      </header>

      {user?.email && (
        <LicenseProfileCard
          email={user.email}
          license={license}
          loading={profileLoading || authLoading || authProfileLoading}
        />
      )}

      <div className="mt-8 space-y-8">
        {!user && !authLoading && (
          <GuestCard onSignIn={() => setLoginOpen(true)} />
        )}

        {user && !profileLoading && !hasActiveKey && !generating && (
          <GenerateCard
            generating={generating}
            error={error}
            onGenerate={generate}
          />
        )}

        {user && generating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl border border-white/10 p-12 text-center"
            style={{
              background: "color-mix(in oklab, var(--card) 80%, transparent)",
              backdropFilter: "blur(18px)",
            }}
          >
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-[var(--neon-cyan)]" />
            <p className="mt-4 font-display text-xl">Creating your key…</p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {display && hasActiveKey && !generating && (
            <motion.div
              key={display.key}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
            >
              <KeyCard display={display} />
              {hasActiveKey && (
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  This key stays linked to your account until it expires.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {user && hasActiveKey && !generating && <LicenseInstructionsCard />}

        {error && user && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        {user && <OptionalShareCard />}
      </div>
    </section>
  );
}

function LicenseInstructionsCard() {
  return (
    <div
      className="rounded-2xl border border-white/10 p-5 sm:p-6 space-y-3"
      style={{
        background: "color-mix(in oklab, var(--card) 80%, transparent)",
        backdropFilter: "blur(16px)",
      }}
    >
      <h3 className="font-display text-lg">Using your license</h3>
      <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground leading-relaxed">
        <li>
          Your license is valid for <strong className="text-foreground">{LICENSE_DAYS} days</strong>{" "}
          and requires renewal every month.
        </li>
        <li>
          To use SinType Desktop, copy your <strong className="text-foreground">Activation Key</strong>{" "}
          above and paste it into the Desktop app&apos;s License section (use the same email you
          signed in with here).
        </li>
      </ol>
    </div>
  );
}

function GuestCard({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div
      className="rounded-3xl border border-white/10 p-8 text-center"
      style={{
        background: "color-mix(in oklab, var(--card) 85%, transparent)",
        backdropFilter: "blur(18px)",
      }}
    >
      <KeyRound className="w-10 h-10 mx-auto text-[var(--neon-cyan)]" />
      <h2 className="font-display text-2xl mt-4">Sign in to generate your key</h2>
      <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
        Use email/password or Google. No sharing required — one free {LICENSE_DAYS}-day key per account while
        active.
      </p>
      <button
        type="button"
        onClick={onSignIn}
        className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-primary-foreground"
        style={{
          background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))",
        }}
      >
        <LogIn className="w-4 h-4" /> Sign in
      </button>
    </div>
  );
}

function GenerateCard({
  generating,
  error,
  onGenerate,
}: {
  generating: boolean;
  error: string | null;
  onGenerate: () => void;
}) {
  return (
    <div
      className="rounded-3xl border border-white/10 p-8"
      style={{
        background: "color-mix(in oklab, var(--card) 85%, transparent)",
        backdropFilter: "blur(18px)",
      }}
    >
      <h2 className="font-display text-2xl">Generate activation key</h2>
      <p className="text-sm text-muted-foreground mt-2 max-w-lg">
        Your key stays active for {LICENSE_DAYS} days from the moment it is created.
      </p>
      <motion.button
        type="button"
        whileHover={!generating ? { scale: 1.02 } : undefined}
        whileTap={!generating ? { scale: 0.98 } : undefined}
        onClick={onGenerate}
        disabled={generating}
        className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-primary-foreground disabled:opacity-50"
        style={{
          background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))",
        }}
      >
        <KeyRound className="w-5 h-5" />
        {generating ? "Working…" : "Generate key"}
      </motion.button>
      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function KeyCard({
  display,
}: {
  display: ReturnType<typeof userLicenseToDisplay>;
}) {
  const [copied, setCopied] = useState(false);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const expiresMs = display.expires_at;
  const createdMs = display.created_at;
  const leftMs = Math.max(0, expiresMs - Date.now());
  const daysLeft = Math.max(0, Math.ceil(leftMs / (1000 * 60 * 60 * 24)));
  void tick;
  const totalMs = expiresMs - createdMs;
  const progress = totalMs > 0 ? leftMs / totalMs : 0;

  const r = 56;
  const c = 2 * Math.PI * r;
  const dash = c * progress;

  const copy = async () => {
    await navigator.clipboard.writeText(display.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div
      className="rounded-3xl border border-white/10 p-8 grid lg:grid-cols-[auto_1fr] gap-8 items-start lg:items-center"
      style={{
        background: "color-mix(in oklab, var(--card) 85%, transparent)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="relative w-[132px] h-[132px] shrink-0 mx-auto lg:mx-0">
        <svg
          width="132"
          height="132"
          viewBox="0 0 132 132"
          className="-rotate-90 block"
          aria-hidden
        >
          <circle cx="66" cy="66" r={r} stroke="var(--border)" strokeWidth="6" fill="none" />
          <motion.circle
            cx="66"
            cy="66"
            r={r}
            stroke="url(#kg)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c - dash }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="kg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--neon-cyan)" />
              <stop offset="100%" stopColor="var(--neon-purple)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="font-display text-3xl leading-none tabular-nums">{daysLeft}</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
            days left
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          <KeyRound className="w-3 h-3 text-[var(--neon-cyan)]" /> Your activation key
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-background/60 p-1 pl-4">
          <code className="flex-1 font-mono text-base sm:text-lg tracking-[0.18em] truncate">
            {display.key}
          </code>
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={copy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-primary-foreground text-sm font-semibold"
            style={{
              background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))",
            }}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied" : "Copy"}
          </motion.button>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Paste this key inside the <strong className="text-foreground">SinType Desktop App</strong>{" "}
          with the same email you used here.
        </p>
      </div>
    </div>
  );
}
