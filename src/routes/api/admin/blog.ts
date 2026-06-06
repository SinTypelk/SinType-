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

function slugFromTitle(title: string, explicit?: string): string {
  const base = sanitizeSlug(explicit?.trim() || title);
  return base || `post-${Date.now()}`;
}

export const Route = createFileRoute("/api/admin/blog")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await requireAdmin(request);
        if (!auth.authorized) return auth.response;

        const { data, error } = await supabaseAdmin
          .from("blog_posts")
          .select(
            "id, slug, title, body, excerpt, image_url, tags, is_published, published_at, updated_at",
          )
          .order("published_at", { ascending: false });

        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ posts: (data ?? []).map(mapRow) });
      },

      POST: async ({ request }) => {
        const auth = await requireAdmin(request);
        if (!auth.authorized) return auth.response;

        try {
          const body = (await request.json()) as {
            title?: unknown;
            body?: unknown;
            excerpt?: unknown;
            imageUrl?: unknown;
            tags?: unknown;
            slug?: unknown;
            isPublished?: unknown;
          };

          const title = sanitizePlainText(String(body.title ?? ""), 300);
          const postBody = sanitizeHtml(String(body.body ?? ""));
          if (!title) return jsonResponse({ error: "Title is required." }, 400);
          if (!postBody) return jsonResponse({ error: "Body is required." }, 400);

          const slug = slugFromTitle(title, typeof body.slug === "string" ? body.slug : undefined);
          const excerpt = sanitizePlainText(String(body.excerpt ?? postBody.replace(/<[^>]+>/g, " ")), 500);
          const imageUrl =
            typeof body.imageUrl === "string" ? sanitizeUrl(body.imageUrl) : null;
          const tags = Array.isArray(body.tags)
            ? sanitizeTags(body.tags.map(String))
            : [];
          const isPublished = body.isPublished !== false;

          const { data, error } = await supabaseAdmin
            .from("blog_posts")
            .insert({
              slug,
              title,
              body: postBody,
              excerpt,
              image_url: imageUrl,
              tags,
              is_published: isPublished,
              updated_at: new Date().toISOString(),
            })
            .select(
              "id, slug, title, body, excerpt, image_url, tags, is_published, published_at, updated_at",
            )
            .single();

          if (error) return jsonResponse({ error: error.message }, 500);
          return jsonResponse({ post: mapRow(data) }, 201);
        } catch (err) {
          return jsonResponse(
            { error: err instanceof Error ? err.message : "Create failed" },
            500,
          );
        }
      },
    },
  },
});
