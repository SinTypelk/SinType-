import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

// Standard TanStack Start + Vite config (Netlify-friendly).
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    // TanStack Start SSR/client build (includes TanStack Router integration)
    tanstackStart({
      server: { entry: "server" },
      client: { entry: "client" },
      // Netlify static hosting needs an actual dist/client/index.html.
      // Prerender at least the shell route (/) so deep links can fall back to index.html.
      prerender: {
        enabled: true,
        crawlLinks: false,
        failOnError: false,
      },
    }),
    // Required for /@react-refresh in dev (TanStack Start expects it)
    react(),
    // Tailwind v4 (required for global styling)
    tailwindcss(),
  ],
});
