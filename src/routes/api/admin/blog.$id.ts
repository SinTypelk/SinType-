import { createFileRoute } from "@tanstack/react-router";
import { jsonResponse, requireAdmin } from "@/lib/admin-auth.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  sanitizeHtml,
  sanitizePlainText,
  sanitizeSlug,
  sanitizeTags,
  sanitizeUrl,
} from "@/lib/sanitize";
import type { BlogPost } from "@/lib/content-types";

function mapRow(row: {
  id: string;
  slug: string;
  title: string;
  body: string;
  excerpt: string;
  image_url: string | null;
  tags: string[] | null;
  is_published: boolean;
  published_at: string;
  updated_at: string;
}): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    body: row.body,
    excerpt: row.excerpt,
    imageUrl: row.image_url,
    tags: row.tags ?? [],
    isPublished: row.is_published,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  };
}

export const Route = createFileRoute("/api/admin/blog/$id")({
  server: {
    handlers: {
      PATCH: async ({ request, params }) => {
        const auth = await requireAdmin(request);
        if (!auth.authorized) return auth.response;

        try {
          const body = (await request.json()) as Record<string, unknown>;
          const patch: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
          };

          if (body.title !== undefined) {
            const title = sanitizePlainText(String(body.title), 300);
            if (!title) return jsonResponse({ error: "Title cannot be empty." }, 400);
            patch.title = title;
          }
          if (body.body !== undefined) {
            const postBody = sanitizeHtml(String(body.body));
            if (!postBody) return jsonResponse({ error: "Body cannot be empty." }, 400);
            patch.body = postBody;
          }
          if (body.excerpt !== undefined) {
            patch.excerpt = sanitizePlainText(String(body.excerpt), 500);
          }
          if (body.slug !== undefined) {
            const slug = sanitizeSlug(String(body.slug));
            if (!slug) return jsonResponse({ error: "Invalid slug." }, 400);
            patch.slug = slug;
          }
          if (body.imageUrl !== undefined) {
            patch.image_url =
              body.imageUrl === null || body.imageUrl === ""
                ? null
                : sanitizeUrl(String(body.imageUrl));
          }
          if (body.tags !== undefined) {
            patch.tags = Array.isArray(body.tags)
              ? sanitizeTags(body.tags.map(String))
              : [];
          }
          if (body.isPublished !== undefined) {
            patch.is_published = Boolean(body.isPublished);
          }

          const { data, error } = await supabaseAdmin
            .from("blog_posts")
            .update(patch)
            .eq("id", params.id)
            .select(
              "id, slug, title, body, excerpt, image_url, tags, is_published, published_at, updated_at",
            )
            .single();

          if (error) return jsonResponse({ error: error.message }, 500);
          return jsonResponse({ post: mapRow(data) });
        } catch (err) {
          return jsonResponse(
            { error: err instanceof Error ? err.message : "Update failed" },
            500,
          );
        }
      },

      DELETE: async ({ request, params }) => {
        const auth = await requireAdmin(request);
        if (!auth.authorized) return auth.response;

        const { error } = await supabaseAdmin.from("blog_posts").delete().eq("id", params.id);
        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ ok: true });
      },
    },
  },
});
