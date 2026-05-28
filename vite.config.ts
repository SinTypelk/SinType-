import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tanstackRouter from "@tanstack/router-plugin/vite";

// Standard TanStack Start + Vite config (Netlify-friendly).
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tanstackRouter(),
    // TanStack Start SSR/client build
    tanstackStart({
      server: { entry: "server" },
      client: { entry: "client" },
    }),
  ],
});
