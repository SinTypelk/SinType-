# Deployment Log

## Project Name
SinType (TanStack Start)

## Deployment Platform
Netlify

## Cleanup Status
### Cloudflare / Wrangler removal
- Deleted: `wrangler.json`
- Deleted: `wrangler.jsonc`
- Verified absent: `.wrangler/`
- Verified absent: `.dev.vars`

### Lovable cleanup
- Deleted: `src/integrations/lovable/index.ts` (Lovable OAuth wrapper)
- Removed dependency: `@lovable.dev/cloud-auth-js`
- Removed dependency: `@lovable.dev/vite-tanstack-config`

### Other cleanup
- Deleted: `bun.lock`
- Deleted: `bunfig.toml`
- Removed dependency: `@cloudflare/vite-plugin`
- Removed Cloudflare Pages build workaround script: `scripts/clean-dist.mjs`

## Build Configuration
- **Build Command**: `npm run build`
- **Publish Directory**: `dist/client`

## Environment Variables Checklist
- [ ] VITE_SUPABASE_URL
- [ ] VITE_SUPABASE_ANON_KEY

## Notes (How env vars are read)
- **Browser/client code** reads `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`.
- For Netlify deploys, set these in **Netlify → Site configuration → Environment variables**.

## Deployment Progress Log

| Task | Status | Date |
|------|--------|------|
| Remove Wrangler/Cloudflare artifacts | Done | 2026-05-28 |
| Remove Lovable OAuth wrapper + deps | Done | 2026-05-28 |
| Replace Lovable Vite config with standard TanStack Start/Vite config | Done | 2026-05-28 |
| Add Netlify config (`netlify.toml`) | Done | 2026-05-28 |
| Ensure `npm run build` succeeds locally | Done | 2026-05-28 |
| Set Netlify env vars (VITE_SUPABASE_*) | Pending | 2026-05-28 |

