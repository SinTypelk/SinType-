import { Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/BrandLogo";
import { NotificationFooterLink } from "@/components/NotificationFooterLink";

const linkClass =
  "text-sm text-muted-foreground hover:text-foreground transition-colors";

export function SiteFooter() {
  return (
    <footer className="mt-16 pb-24 sm:pb-0 border-t border-white/10 bg-card/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2">
              <BrandLogo className="w-8 h-8" alt="" aria-hidden />
              <span className="font-display font-bold tracking-wide text-foreground">
                SinType.lk
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">
              Professional Singlish → Sinhala typing for the web and Windows. Unicode and
              Legacy FM fonts, offline on desktop.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground mb-4">
              Product
            </h3>
            <nav className="flex flex-col gap-2.5">
              <Link to="/" className={linkClass}>
                Web converter
              </Link>
              <Link to="/download" className={linkClass}>
                Download desktop app
              </Link>
              <Link to="/license" className={linkClass}>
                Activation key
              </Link>
              <Link to="/faq" className={linkClass}>
                FAQ
              </Link>
              <Link to="/about" className={linkClass}>
                About
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground mb-4">
              Support
            </h3>
            <nav className="flex flex-col gap-2.5">
              <NotificationFooterLink />
              <Link to="/feedback" className={linkClass}>
                Send feedback
              </Link>
              <Link to="/contact" className={linkClass}>
                Contact us
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground mb-4">
              Legal
            </h3>
            <nav className="flex flex-col gap-2.5">
              <Link to="/privacy" className={linkClass}>
                Privacy Policy
              </Link>
              <Link to="/terms" className={linkClass}>
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} SinType.lk. All rights reserved.</p>
          <p className="text-center sm:text-right">
            Typing stays on your device · Licenses stored securely via Supabase
          </p>
        </div>
      </div>
    </footer>
  );
}
