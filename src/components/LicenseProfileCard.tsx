import { Mail, KeyRound, CalendarClock, ShieldCheck } from "lucide-react";
import type { UserLicense } from "@/lib/license-service";

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

export function LicenseProfileCard({
  email,
  license,
  loading = false,
}: LicenseProfileCardProps) {
  const expiryIso = license?.expires_at ?? null;
  const isExpired = expiryIso ? new Date(expiryIso).getTime() <= Date.now() : false;

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
      <h2 className="font-display text-2xl mt-2">My profile</h2>
      <p className="text-sm text-muted-foreground mt-1">
        Your account and desktop activation details from Supabase.
      </p>

      <dl className="mt-6 grid gap-4 sm:grid-cols-1">
        <ProfileRow
          icon={Mail}
          label="User email"
          value={loading ? "…" : email}
        />
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
          value={
            loading
              ? "…"
              : expiryIso
                ? formatDate(expiryIso)
                : "—"
          }
          hint={
            license && !loading
              ? isExpired
                ? "This key has expired."
                : `Valid for 7 days from issue (${formatDate(license.created_at)})`
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
