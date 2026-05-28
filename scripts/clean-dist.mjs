import { rm } from "node:fs/promises";

async function safeRm(path) {
  try {
    await rm(path, { force: true });
  } catch {
    // ignore
  }
}

// Cloudflare Pages sometimes gets confused if a wrangler config is present
// inside the build output. Keep wrangler config only at repo root.
await safeRm("dist/client/wrangler.json");
await safeRm("dist/client/wrangler.jsonc");
await safeRm("dist/wrangler.json");
await safeRm("dist/wrangler.jsonc");

