import { createFileRoute } from "@tanstack/react-router";
import { jsonResponse, requireAdmin } from "@/lib/admin-auth.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sanitizePlainText } from "@/lib/sanitize";
import type {
  AboutContent,
  FaqContent,
  FaqEntry,
  PrivacyContent,
  SiteContentKey,
} from "@/lib/content-types";

const ALLOWED_KEYS = new Set<SiteContentKey>(["privacy_policy", "about", "faq"]);

function sanitizeFaqEntries(entries: unknown): FaqEntry[] {
  if (!Array.isArray(entries)) return [];
  return entries
    .map((e) => {
      const row = e as { q?: unknown; a?: unknown };
      return {
        q: sanitizePlainText(String(row.q ?? ""), 500),
        a: sanitizePlainText(String(row.a ?? ""), 4000),
      };
    })
    .filter((e) => e.q && e.a)
    .slice(0, 50);
}

function sanitizePrivacyContent(raw: unknown): PrivacyContent {
  const obj = (raw ?? {}) as { subtitle?: unknown; sections?: unknown };
  const sections = Array.isArray(obj.sections)
    ? obj.sections
        .map((s) => {
          const row = s as { title?: unknown; body?: unknown };
          return {
            title: sanitizePlainText(String(row.title ?? ""), 200),
            body: sanitizePlainText(String(row.body ?? ""), 20_000),
          };
        })
        .filter((s) => s.title && s.body)
        .slice(0, 30)
    : [];
  return {
    subtitle: sanitizePlainText(String(obj.subtitle ?? ""), 1000),
    sections,
  };
}

function sanitizeAboutContent(raw: unknown): AboutContent {
  const obj = (raw ?? {}) as { paragraphs?: unknown; fontRows?: unknown };
  const paragraphs = Array.isArray(obj.paragraphs)
    ? obj.paragraphs
        .map((p) => sanitizePlainText(String(p), 4000))
        .filter(Boolean)
        .slice(0, 10)
    : [];
  const fontRows = Array.isArray(obj.fontRows)
    ? obj.fontRows
        .map((row) => {
          if (!Array.isArray(row) || row.length < 3) return null;
          return [
            sanitizePlainText(String(row[0]), 120),
            sanitizePlainText(String(row[1]), 120),
            sanitizePlainText(String(row[2]), 200),
          ] as [string, string, string];
        })
        .filter((r): r is [string, string, string] => Boolean(r))
        .slice(0, 20)
    : [];
  return { paragraphs, fontRows };
}

function sanitizeByKey(key: SiteContentKey, raw: unknown): unknown {
  if (key === "faq") {
    const obj = (raw ?? {}) as FaqContent;
    return {
      web: sanitizeFaqEntries(obj.web),
      desktop: sanitizeFaqEntries(obj.desktop),
    } satisfies FaqContent;
  }
  if (key === "about") return sanitizeAboutContent(raw);
  return sanitizePrivacyContent(raw);
}

export const Route = createFileRoute("/api/admin/content")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await requireAdmin(request);
        if (!auth.authorized) return auth.response;

        const { data, error } = await supabaseAdmin
          .from("site_content")
          .select("key, content");

        if (error) return jsonResponse({ error: error.message }, 500);

        const content: Partial<Record<SiteContentKey, unknown>> = {};
        for (const row of data ?? []) {
          if (ALLOWED_KEYS.has(row.key as SiteContentKey)) {
            content[row.key as SiteContentKey] = row.content;
          }
        }
        return jsonResponse({ content });
      },

      PUT: async ({ request }) => {
        const auth = await requireAdmin(request);
        if (!auth.authorized) return auth.response;

        try {
          const body = (await request.json()) as { key?: unknown; content?: unknown };
          const key = String(body.key ?? "") as SiteContentKey;
          if (!ALLOWED_KEYS.has(key)) {
            return jsonResponse({ error: "Invalid content key." }, 400);
          }

          const sanitized = sanitizeByKey(key, body.content);
          const { error } = await supabaseAdmin.from("site_content").upsert(
            {
              key,
              content: sanitized,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "key" },
          );

          if (error) return jsonResponse({ error: error.message }, 500);
          return jsonResponse({ ok: true, key, content: sanitized });
        } catch (err) {
          return jsonResponse(
            { error: err instanceof Error ? err.message : "Save failed" },
            500,
          );
        }
      },
    },
  },
});
