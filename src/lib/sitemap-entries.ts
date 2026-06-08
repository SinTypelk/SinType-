/** Sitemap URL list — no path aliases so Vite build plugins can import this file. */

export type SitemapEntry = {
  path: string;
  changefreq: "daily" | "weekly" | "monthly";
  priority: number;
};

/** Public marketing routes for sitemap.xml (no /admin, /m/, noindex pages). */
export const SITEMAP_ENTRIES: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: 1.0 },
  { path: "/singlish-to-sinhala", changefreq: "weekly", priority: 0.95 },
  { path: "/sinhala-unicode-converter", changefreq: "weekly", priority: 0.95 },
  { path: "/download", changefreq: "weekly", priority: 0.9 },
  { path: "/faq", changefreq: "weekly", priority: 0.85 },
  { path: "/blog", changefreq: "weekly", priority: 0.88 },
  {
    path: "/blog/sinhala-unicode-legacy-seo-guide",
    changefreq: "monthly",
    priority: 0.92,
  },
  { path: "/about", changefreq: "monthly", priority: 0.75 },
  { path: "/license", changefreq: "weekly", priority: 0.7 },
  { path: "/contact", changefreq: "monthly", priority: 0.65 },
  { path: "/privacy", changefreq: "monthly", priority: 0.5 },
  { path: "/terms", changefreq: "monthly", priority: 0.5 },
  { path: "/site-map", changefreq: "monthly", priority: 0.55 },
];

export const SITEMAP_PATHS = SITEMAP_ENTRIES.map((e) => e.path);

export function sitemapSiteUrl(): string {
  return process.env.VITE_SITE_URL ?? "https://sintype.lk";
}
