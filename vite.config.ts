import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { existsSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import type { Plugin } from "vite";
import { buildSitemapXml } from "./src/lib/sitemap-xml";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const fromRoot = (...segments: string[]) => resolve(projectRoot, ...segments);

function emitStaticSitemap(): Plugin {
  return {
    name: "emit-static-sitemap",
    apply: "build",
    // After client build + prerender so Cloudflare/Netlify static deploy serves real XML.
    buildEnd() {
      const outDir = fromRoot("dist/client");
      if (!existsSync(outDir)) return;
      writeFileSync(resolve(outDir, "sitemap.xml"), buildSitemapXml(), "utf8");
    },
  };
}

// Standard TanStack Start + Vite config (Netlify-friendly).
export default defineConfig({
  root: projectRoot,
  envDir: projectRoot,
  publicDir: fromRoot("public"),
  cacheDir: fromRoot("node_modules/.vite"),
  build: {
    sourcemap: "hidden",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("framer-motion")) return "framer-motion";
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("@radix-ui") || id.includes("recharts")) return "ui-vendor";
          if (id.includes("react-dom") || id.includes("react/")) return "react-vendor";
        },
      },
    },
  },
  plugins: [
    tsconfigPaths({
      root: projectRoot,
      projects: [fromRoot("tsconfig.json")],
    }),
    // TanStack Start SSR/client build (includes TanStack Router integration)
    tanstackStart({
      server: { entry: "server" },
      client: { entry: "client" },
      // Netlify static hosting needs an actual dist/client/index.html.
      // Prerender at least the shell route (/) so deep links can fall back to index.html.
      prerender: {
        enabled: false,
        crawlLinks: true,
        failOnError: false,
      },
    }),
    // Required for /@react-refresh in dev (TanStack Start expects it)
    react(),
    // Tailwind v4 (required for global styling)
    tailwindcss(),
    emitStaticSitemap(),
  ],
});
