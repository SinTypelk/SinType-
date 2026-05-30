import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL, SITEMAP_PATHS } from "@/lib/site-seo";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...SITEMAP_PATHS.map((p) => {
            const loc = p === "/" ? SITE_URL : `${SITE_URL}${p}`;
            return `  <url><loc>${loc}</loc><changefreq>weekly</changefreq></url>`;
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
