import { Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { BETA_DISCLAIMER } from "@/lib/v2-showcase";

export function BetaDisclaimerBanner() {
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
            Beta Release · v2.0.0
          </p>
          <p className="mt-1.5 text-sm sm:text-base text-foreground/90 leading-relaxed">
            {BETA_DISCLAIMER}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            <Link to="/feedback" className="text-[var(--neon-cyan)] hover:underline font-medium">
              Report a bug
            </Link>
            {" · "}
            <Link to="/contact" className="text-[var(--neon-cyan)] hover:underline font-medium">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
