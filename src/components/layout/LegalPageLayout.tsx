import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

type LegalPageLayoutProps = {
  title: string;
  subtitle: string;
  lastUpdated?: string;
  children: ReactNode;
};

export function LegalPageLayout({
  title,
  subtitle,
  lastUpdated = "June 2026",
  children,
}: LegalPageLayoutProps) {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 pb-28">
      <nav className="text-xs text-muted-foreground mb-6 flex flex-wrap gap-x-3 gap-y-1">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <span aria-hidden>·</span>
        <span className="text-foreground/80">Legal</span>
      </nav>

      <header className="mb-10">
        <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--neon-cyan)] font-semibold">
          SinType.lk
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2 neon-text">{title}</h1>
        <p className="mt-3 text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed">
          {subtitle}
        </p>
        <p className="mt-4 text-xs text-muted-foreground">Last updated: {lastUpdated}</p>
      </header>

      <div
        className="rounded-3xl border border-white/10 p-6 sm:p-10 space-y-8 text-muted-foreground leading-relaxed"
        style={{
          background: "color-mix(in oklab, var(--card) 88%, transparent)",
          backdropFilter: "blur(16px)",
        }}
      >
        {children}
      </div>

      <footer className="mt-10 flex flex-wrap gap-4 text-sm">
        <Link to="/privacy" className="text-[var(--neon-cyan)] hover:underline">
          Privacy Policy
        </Link>
        <Link to="/terms" className="text-[var(--neon-cyan)] hover:underline">
          Terms of Service
        </Link>
        <Link to="/contact" className="text-[var(--neon-cyan)] hover:underline">
          Contact
        </Link>
      </footer>
    </article>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-xl sm:text-2xl text-foreground mb-3">{title}</h2>
      <div className="space-y-3 text-sm sm:text-base">{children}</div>
    </section>
  );
}
