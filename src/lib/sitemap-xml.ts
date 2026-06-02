import { SITEMAP_ENTRIES, sitemapSiteUrl } from "./sitemap-entries";

/** Build sitemap.xml body (shared by server route and static deploy output). */
export function buildSitemapXml(lastmod = new Date().toISOString().split("T")[0]): string {
  const siteUrl = sitemapSiteUrl();
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...SITEMAP_ENTRIES.map((entry) => {
      const loc = entry.path === "/" ? siteUrl : `${siteUrl}${entry.path}`;
      return [
        "  <url>",
        `    <loc>${loc}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>${entry.changefreq}</changefreq>`,
        `    <priority>${entry.priority.toFixed(2)}</priority>`,
        "  </url>",
      ].join("\n");
    }),
    `</urlset>`,
  ].join("\n");
}
