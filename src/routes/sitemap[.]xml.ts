import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL, SITEMAP_ENTRIES } from "@/lib/site-seo";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const lastmod = new Date().toISOString().split("T")[0];
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...SITEMAP_ENTRIES.map((entry) => {
            const loc = entry.path === "/" ? SITE_URL : `${SITE_URL}${entry.path}`;
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
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
