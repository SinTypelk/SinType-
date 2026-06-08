import { Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { BETA_DISCLAIMER } from "@/lib/v2-showcase";

type BetaDisclaimerBannerProps = {
  show?: boolean;
  version?: string;
  reportBugUrl?: string;
  contactSupportUrl?: string;
};

function toHref(url: string | undefined, fallback: string) {
  const value = url?.trim() || fallback;
  return value.startsWith("http") ? value : value;
}

export function BetaDisclaimerBanner({
  show = true,
  version = "2.0.0",
  reportBugUrl = "/feedback",
  contactSupportUrl = "/contact",
}: BetaDisclaimerBannerProps) {
  if (!show) return null;

  const bugHref = toHref(reportBugUrl, "/feedback");
  const supportHref = toHref(contactSupportUrl, "/contact");
  const bugExternal = bugHref.startsWith("http");
  const supportExternal = supportHref.startsWith("http");

  return (
    <div
      role="status"
      className="mb-8 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-orange-500/10 p-4 sm:p-5 shadow-[0_0_24px_color-mix(in_oklab,var(--warning)_15%,transparent)]"
    >
      <div className="flex gap-3 sm:gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/15">
          <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-400/90">
            Beta Release · v{version}
          </p>
          <p className="mt-1.5 text-sm sm:text-base text-foreground/90 leading-relaxed">
            {BETA_DISCLAIMER}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            {bugExternal ? (
              <a
                href={bugHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--neon-cyan)] hover:underline font-medium"
              >
                Report a bug
              </a>
            ) : (
              <Link to={bugHref} className="text-[var(--neon-cyan)] hover:underline font-medium">
                Report a bug
              </Link>
            )}
            {" · "}
            {supportExternal ? (
              <a
                href={supportHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--neon-cyan)] hover:underline font-medium"
              >
                Contact support
              </a>
            ) : (
              <Link to={supportHref} className="text-[var(--neon-cyan)] hover:underline font-medium">
                Contact support
              </Link>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
