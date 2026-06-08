import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { BreadcrumbNav, type BreadcrumbCrumb } from "@/components/seo/BreadcrumbNav";

type SeoLandingIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  breadcrumbs?: BreadcrumbCrumb[];
  children?: ReactNode;
};

/** Keyword-rich, crawlable intro block for SEO landing pages. */
export function SeoLandingIntro({
  eyebrow,
  title,
  description,
  breadcrumbs,
  children,
}: SeoLandingIntroProps) {
  return (
    <header className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-4 text-center sm:text-left">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="mb-4 text-left">
          <BreadcrumbNav items={breadcrumbs} />
        </div>
      )}
      <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--neon-cyan)] font-semibold">
        {eyebrow}
      </p>
      <h1 className="font-display text-3xl sm:text-5xl font-bold mt-2 leading-tight text-foreground min-h-[4rem] sm:min-h-[5.5rem]">
        {title}
      </h1>
      <p className="mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed max-w-3xl">
        {description}
      </p>
      {children}
      <nav className="mt-6 flex flex-wrap gap-3 text-sm justify-center sm:justify-start" aria-label="Related pages">
        <Link to="/sinhala-unicode-converter" className="text-[var(--neon-cyan)] hover:underline">
          Sinhala Unicode converter
        </Link>
        <span className="text-muted-foreground" aria-hidden>
          ·
        </span>
        <Link to="/singlish-to-sinhala" className="text-[var(--neon-cyan)] hover:underline">
          Singlish to Sinhala
        </Link>
        <span className="text-muted-foreground" aria-hidden>
          ·
        </span>
        <Link to="/download" className="text-[var(--neon-cyan)] hover:underline">
          Windows desktop app
        </Link>
        <span className="text-muted-foreground" aria-hidden>
          ·
        </span>
        <Link to="/faq" className="text-[var(--neon-cyan)] hover:underline">
          FAQ
        </Link>
      </nav>
    </header>
  );
}
