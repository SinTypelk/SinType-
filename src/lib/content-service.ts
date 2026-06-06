import { supabase } from "@/integrations/supabase/client";
import type {
  AboutContent,
  BlogPost,
  FaqContent,
  FaqEntry,
  PrivacyContent,
  SiteContentKey,
} from "@/lib/content-types";
import {
  DESKTOP_FAQ_ENTRIES,
  WEBSITE_FAQ_ENTRIES,
} from "@/lib/faq-content";

function mapBlogRow(row: {
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

export async function fetchPublishedBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id, slug, title, body, excerpt, image_url, tags, is_published, published_at, updated_at",
    )
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") return [];
    throw new Error(error.message);
  }
  return (data ?? []).map(mapBlogRow);
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id, slug, title, body, excerpt, image_url, tags, is_published, published_at, updated_at",
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") return null;
    throw new Error(error.message);
  }
  return data ? mapBlogRow(data) : null;
}

async function fetchSiteContentJson<T>(key: SiteContentKey): Promise<T | null> {
  const { data, error } = await supabase
    .from("site_content")
    .select("content")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") return null;
    throw new Error(error.message);
  }
  if (!data?.content || typeof data.content !== "object") return null;
  return data.content as T;
}

function normalizeFaqEntries(entries: FaqEntry[] | undefined): FaqEntry[] {
  return (entries ?? []).filter((e) => e.q?.trim() && e.a?.trim());
}

export async function fetchFaqContent(): Promise<{
  web: FaqEntry[];
  desktop: FaqEntry[];
}> {
  const stored = await fetchSiteContentJson<FaqContent>("faq");
  if (!stored) {
    return { web: WEBSITE_FAQ_ENTRIES, desktop: DESKTOP_FAQ_ENTRIES };
  }
  const web = normalizeFaqEntries(stored.web);
  const desktop = normalizeFaqEntries(stored.desktop);
  return {
    web: web.length ? web : WEBSITE_FAQ_ENTRIES,
    desktop: desktop.length ? desktop : DESKTOP_FAQ_ENTRIES,
  };
}

export async function fetchAboutContent(): Promise<AboutContent | null> {
  return fetchSiteContentJson<AboutContent>("about");
}

export async function fetchPrivacyContent(): Promise<PrivacyContent | null> {
  return fetchSiteContentJson<PrivacyContent>("privacy_policy");
}
