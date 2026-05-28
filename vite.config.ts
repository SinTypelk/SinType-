import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tanstackRouter from "@tanstack/router-plugin/vite";

// Standard TanStack Start + Vite config (Netlify-friendly).
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tanstackRouter(),
    // Tailwind v4 (required for global styling)
    tailwindcss(),
    // TanStack Start SSR/client build
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
  ],
});
