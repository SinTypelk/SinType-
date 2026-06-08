import { BLOG_POSTS, type BlogPostMeta } from "@/lib/blog-posts";
import type { BlogPost } from "@/lib/content-types";

export type MergedBlogPost = BlogPostMeta & {
  source: "static" | "database";
  body?: string;
  imageUrl?: string | null;
};

function dbToMeta(post: BlogPost): MergedBlogPost {
  const date = post.publishedAt.split("T")[0];
  return {
    slug: post.slug,
    title: post.title,
    subtitle: post.excerpt,
    excerpt: post.excerpt,
    publishedAt: date,
    updatedAt: post.updatedAt.split("T")[0],
    readMinutes: Math.max(1, Math.ceil(post.body.replace(/<[^>]+>/g, " ").split(/\s+/).length / 200)),
    tags: post.tags,
    keywords: post.tags.join(", "),
    source: "database",
    body: post.body,
    imageUrl: post.imageUrl,
  };
}

/** Database posts override static posts with the same slug. */
export function mergeBlogPosts(dbPosts: BlogPost[]): MergedBlogPost[] {
  const dbSlugs = new Set(dbPosts.map((p) => p.slug));
  const staticOnly = BLOG_POSTS.filter((p) => !dbSlugs.has(p.slug)).map((p) => ({
    ...p,
    source: "static" as const,
  }));
  const fromDb = dbPosts.map(dbToMeta);
  return [...fromDb, ...staticOnly].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
}

export function findMergedPost(
  slug: string,
  dbPost: BlogPost | null,
): MergedBlogPost | undefined {
  if (dbPost) return dbToMeta(dbPost);
  const staticPost = BLOG_POSTS.find((p) => p.slug === slug);
  return staticPost ? { ...staticPost, source: "static" } : undefined;
}
