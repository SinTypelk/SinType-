import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

// Standard TanStack Start + Vite config (Netlify-friendly).
export default defineConfig({
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
    tsconfigPaths(),
    // TanStack Start SSR/client build (includes TanStack Router integration)
    tanstackStart({
      server: { entry: "server" },
      client: { entry: "client" },
      // Netlify static hosting needs an actual dist/client/index.html.
      // Prerender at least the shell route (/) so deep links can fall back to index.html.
      prerender: {
        enabled: true,
        crawlLinks: true,
        failOnError: false,
      },
    }),
    // Required for /@react-refresh in dev (TanStack Start expects it)
    react(),
    // Tailwind v4 (required for global styling)
    tailwindcss(),
  ],
});
