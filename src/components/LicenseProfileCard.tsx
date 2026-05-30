import { useEffect, useState } from "react";
import { Mail, KeyRound, CalendarClock, ShieldCheck } from "lucide-react";
import {
  daysRemainingForLicense,
  LICENSE_DAYS,
  type UserLicense,
} from "@/lib/license-service";

type LicenseProfileCardProps = {
  email: string;
  license: UserLicense | null;
  loading?: boolean;
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}


function DaysRing({
  daysLeft,
  loading,
  isExpired,
}: {
  daysLeft: number;
  loading: boolean;
  isExpired: boolean;
}) {
  const size = 100;
  const r = 38;
  const c = 2 * Math.PI * r;
  const progress =
    !loading && !isExpired ? Math.min(1, daysLeft / LICENSE_DAYS) : 0;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90 block"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--border)"
          strokeWidth="6"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--neon-cyan)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - progress)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="font-display text-2xl leading-none tabular-nums">
          {loading ? "…" : daysLeft}
        </span>
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">
          days left
        </span>
      </div>
    </div>
  );
}

export function LicenseProfileCard({
  email,
  license,
  loading = false,
}: LicenseProfileCardProps) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const expiryIso = license?.expires_at ?? null;
  const isExpired = expiryIso ? new Date(expiryIso).getTime() <= Date.now() : false;
  const daysLeft = daysRemainingForLicense(license);

  return (
    <div
      className="rounded-3xl border border-white/10 p-6 sm:p-8"
      style={{
        background: "color-mix(in oklab, var(--card) 88%, transparent)",
        backdropFilter: "blur(18px)",
      }}
    >
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        <ShieldCheck className="w-3.5 h-3.5 text-[var(--neon-cyan)]" />
        License info
      </div>

      <div className="mt-5 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <DaysRing daysLeft={daysLeft} loading={loading} isExpired={isExpired} />
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h2 className="font-display text-2xl">My profile</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Valid days load automatically when you open this page.
          </p>
        </div>
      </div>

      <dl className="mt-6 grid gap-4">
        <ProfileRow icon={Mail} label="User email" value={loading ? "…" : email} />
        <ProfileRow
          icon={KeyRound}
          label="Active license key"
          value={
            loading
              ? "…"
              : license?.license_key ?? "No active key — generate one below"
          }
          mono={!!license?.license_key}
        />
        <ProfileRow
          icon={CalendarClock}
          label="Expiry date"
          value={loading ? "…" : expiryIso ? formatDate(expiryIso) : "—"}
          hint={
            license && !loading
              ? isExpired
                ? "This key has expired."
                : `${daysLeft} day(s) remaining · ${LICENSE_DAYS}-day license`
              : undefined
          }
        />
      </dl>

      {license && !loading && (
        <p
          className={`mt-4 text-xs inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
            isExpired
              ? "border-destructive/40 text-destructive"
              : "border-[var(--neon-cyan)]/30 text-[var(--neon-cyan)]"
          }`}
        >
          Status: {isExpired ? "Expired" : license.status || "active"}
        </p>
      )}
    </div>
  );
}

function ProfileRow({
  icon: Icon,
  label,
  value,
  mono = false,
  hint,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  mono?: boolean;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-background/30 px-4 py-3">
      <dt className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        <Icon className="w-3 h-3" />
        {label}
      </dt>
      <dd
        className={`mt-1.5 text-sm sm:text-base text-foreground break-all ${
          mono ? "font-mono tracking-wide" : ""
        }`}
      >
        {value}
      </dd>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
