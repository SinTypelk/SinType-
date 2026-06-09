/**
 * Admin service for managing banners, versions, features, and download config
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

/* ========== BANNERS ========== */

export interface SiteBanner {
  id: string;
  type?: string;
  title: string;
  message: string;
  is_active: boolean;
  color_scheme: "warning" | "info" | "success" | "danger";
  show_on: "download" | "home" | "all";
  created_at?: string;
  updated_at?: string;
}

export async function adminFetchBanners(): Promise<SiteBanner[]> {
  const { data, error } = await supabase.from("site_banners").select("*");
  if (error) throw new Error(`Failed to fetch banners: ${error.message}`);
  return data || [];
}

export async function adminCreateBanner(
  banner: Omit<SiteBanner, "id" | "created_at" | "updated_at">,
): Promise<SiteBanner> {
  const { data, error } = await supabase
    .from("site_banners")
    .insert([banner])
    .select()
    .single();
  if (error) throw new Error(`Failed to create banner: ${error.message}`);
  return data;
}

export async function adminUpdateBanner(id: string, updates: Partial<SiteBanner>): Promise<SiteBanner> {
  const { data, error } = await supabase
    .from("site_banners")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`Failed to update banner: ${error.message}`);
  return data;
}

export async function adminDeleteBanner(id: string): Promise<void> {
  const { error } = await supabase.from("site_banners").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete banner: ${error.message}`);
}

/* ========== APP VERSIONS ========== */

export interface AppVersion {
  id: string;
  channel: "stable" | "beta";
  version_string: string;
  download_url: string;
  release_date?: string;
  is_active: boolean;
  show_beta_warning: boolean;
  created_at?: string;
}

export async function adminFetchVersions(): Promise<AppVersion[]> {
  const { data, error } = await supabase.from("app_versions").select("*");
  if (error) throw new Error(`Failed to fetch versions: ${error.message}`);
  return data || [];
}

export async function adminUpsertVersion(
  channel: "stable" | "beta",
  version: Omit<AppVersion, "id" | "created_at" | "channel">,
): Promise<AppVersion> {
  // First fetch existing
  const { data: existing } = await supabase
    .from("app_versions")
    .select("*")
    .eq("channel", channel)
    .maybeSingle();

  if (existing) {
    // Update
    const { data, error } = await supabase
      .from("app_versions")
      .update(version)
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw new Error(`Failed to update version: ${error.message}`);
    return data;
  } else {
    // Create
    const { data, error } = await supabase
      .from("app_versions")
      .insert([{ ...version, channel }])
      .select()
      .single();
    if (error) throw new Error(`Failed to create version: ${error.message}`);
    return data;
  }
}

/* ========== KEY FEATURES ========== */

export interface KeyFeature {
  id: string;
  page: "home" | "download";
  icon: string;
  title: string;
  description: string;
  display_order: number;
  is_visible: boolean;
  created_at?: string;
}

export async function adminFetchFeatures(page?: "home" | "download"): Promise<KeyFeature[]> {
  let query = supabase.from("key_features").select("*");
  if (page) query = query.eq("page", page);
  const { data, error } = await query.order("display_order", { ascending: true });
  if (error) throw new Error(`Failed to fetch features: ${error.message}`);
  return data || [];
}

export async function adminCreateFeature(
  feature: Omit<KeyFeature, "id" | "created_at" | "display_order"> & {
    display_order?: number;
  },
): Promise<KeyFeature> {
  let displayOrder = feature.display_order;
  if (displayOrder === undefined) {
    const existing = await adminFetchFeatures(feature.page);
    displayOrder =
      existing.length > 0
        ? Math.max(...existing.map((f) => f.display_order ?? 0)) + 1
        : 0;
  }

  const { data, error } = await supabase
    .from("key_features")
    .insert([{ ...feature, display_order: displayOrder }])
    .select()
    .single();
  if (error) throw new Error(`Failed to create feature: ${error.message}`);
  return data;
}

export async function adminUpdateFeature(id: string, updates: Partial<KeyFeature>): Promise<KeyFeature> {
  const { data, error } = await supabase
    .from("key_features")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`Failed to update feature: ${error.message}`);
  return data;
}

export async function adminDeleteFeature(id: string): Promise<void> {
  const { error } = await supabase.from("key_features").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete feature: ${error.message}`);
}

export async function adminDeleteTestFeatures(): Promise<void> {
  const { error } = await supabase
    .from("key_features")
    .delete()
    .or('title.eq.Test,description.eq.Developer check');
  if (error) throw new Error(`Failed to delete test features: ${error.message}`);
}

export async function adminReorderFeatures(updates: Array<{ id: string; display_order: number }>): Promise<void> {
  const { error } = await supabase
    .from("key_features")
    .upsert(updates, { onConflict: "id" });
  if (error) throw new Error(`Failed to reorder features: ${error.message}`);
}

/* ========== DOWNLOAD PAGE CONFIG ========== */

export interface DownloadPageConfigEntry {
  id: string;
  field_key: string;
  field_value: string;
  updated_at?: string;
}

export async function adminFetchDownloadConfig(): Promise<DownloadPageConfigEntry[]> {
  const { data, error } = await supabase.from("download_page_config").select("*");
  if (error) throw new Error(`Failed to fetch config: ${error.message}`);
  return data || [];
}

export async function adminUpsertDownloadConfig(
  entries: Array<{ field_key: string; field_value: string }>,
): Promise<void> {
  const { error } = await supabase
    .from("download_page_config")
    .upsert(entries, { onConflict: "field_key" });
  if (error) throw new Error(`Failed to save config: ${error.message}`);
}

/* ========== SITE SETTINGS ========== */

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  updated_at?: string;
}

export async function adminFetchSettings(): Promise<SiteSetting[]> {
  const { data, error } = await supabase.from("site_settings").select("*");
  if (error) throw new Error(`Failed to fetch settings: ${error.message}`);
  return data || [];
}

export async function adminUpsertSettings(
  entries: Array<{ key: string; value: string }>,
): Promise<void> {
  const { error } = await supabase
    .from("site_settings")
    .upsert(entries, { onConflict: "key" });
  if (error) throw new Error(`Failed to save settings: ${error.message}`);
}

export async function adminGetSetting(key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) throw new Error(`Failed to fetch setting: ${error.message}`);
  return data?.value || null;
}

/* ========== NOTIFICATIONS ========== */

export interface Notification {
  id: string;
  title: string;
  message: string;
  link?: string | null;
  is_active: boolean;
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export async function adminFetchNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to fetch notifications: ${error.message}`);
  return data || [];
}

export async function adminCreateNotification(
  notification: Omit<Notification, "id" | "created_at" | "updated_at">,
): Promise<Notification> {
  const { data, error } = await supabase
    .from("notifications")
    .insert([notification])
    .select()
    .single();
  if (error) throw new Error(`Failed to create notification: ${error.message}`);
  return data;
}

export async function adminUpdateNotification(
  id: string,
  updates: Partial<Omit<Notification, "id" | "created_at">>,
): Promise<Notification> {
  const { data, error } = await supabase
    .from("notifications")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`Failed to update notification: ${error.message}`);
  return data;
}

export async function adminDeleteNotification(id: string): Promise<void> {
  const { error } = await supabase.from("notifications").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete notification: ${error.message}`);
}

export async function adminToggleNotificationActive(id: string, isActive: boolean): Promise<Notification> {
  return adminUpdateNotification(id, { is_active: isActive });
}

/* ========== BLOG POSTS ========== */

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  date: string;
  read_time: number;
  tags: string[];
  short_description: string;
  html_content: string;
  is_published: boolean;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function adminFetchBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw new Error(`Failed to fetch blog posts: ${error.message}`);
  return data || [];
}

export async function adminCreateBlogPost(
  post: Omit<BlogPost, "id" | "created_at" | "updated_at">,
): Promise<BlogPost> {
  const { data, error } = await supabase
    .from("blog_posts")
    .insert([post])
    .select()
    .single();
  if (error) throw new Error(`Failed to create blog post: ${error.message}`);
  return data;
}

export async function adminUpdateBlogPost(
  id: string,
  updates: Partial<Omit<BlogPost, "id" | "created_at">>,
): Promise<BlogPost> {
  const { data, error } = await supabase
    .from("blog_posts")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`Failed to update blog post: ${error.message}`);
  return data;
}

export async function adminDeleteBlogPost(id: string): Promise<void> {
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete blog post: ${error.message}`);
}

export async function adminToggleBlogPostPublished(id: string, isPublished: boolean): Promise<BlogPost> {
  return adminUpdateBlogPost(id, { is_published: isPublished });
}

export async function adminToggleBlogPostFeatured(id: string, isFeatured: boolean): Promise<BlogPost> {
  return adminUpdateBlogPost(id, { is_featured: isFeatured });
}

/* ========== SITEMAP GENERATION ========== */

export function generateBlogPostSitemapEntry(post: BlogPost, baseUrl: string = "https://sintype.com"): string {
  const url = `${baseUrl}/blog/${post.slug}`;
  const lastmod = post.updated_at || post.created_at || new Date().toISOString();
  
  return `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${lastmod.split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${post.is_featured ? "0.8" : "0.6"}</priority>
  </url>`;
}

export async function generateBlogSitemap(baseUrl: string = "https://sintype.com"): Promise<string> {
  const posts = await adminFetchBlogPosts();
  const publishedPosts = posts.filter((p) => p.is_published);
  
  const entries = publishedPosts.map((post) => generateBlogPostSitemapEntry(post, baseUrl)).join("\n");
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

export async function downloadBlogSitemap(): Promise<void> {
  const xml = await generateBlogSitemap();
  const blob = new Blob([xml], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "blog-sitemap.xml";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/* ========== PUBLIC FETCH FUNCTIONS (FOR FRONTEND) ========== */

export async function fetchActiveBanners(showOn?: "download" | "home"): Promise<SiteBanner[]> {
  let query = supabase.from("site_banners").select("*").eq("is_active", true);
  if (showOn) {
    query = query.or(`show_on.eq.${showOn},show_on.eq.all`);
  }
  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch banners: ${error.message}`);
  return data || [];
}

export async function fetchActiveVersion(channel: "stable" | "beta"): Promise<AppVersion | null> {
  const { data, error } = await supabase
    .from("app_versions")
    .select("*")
    .eq("channel", channel)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw new Error(`Failed to fetch version: ${error.message}`);
  return data || null;
}

export async function fetchVisibleFeatures(page: "home" | "download"): Promise<KeyFeature[]> {
  const { data, error } = await supabase
    .from("key_features")
    .select("*")
    .eq("page", page)
    .eq("is_visible", true)
    .order("display_order", { ascending: true });
  if (error) throw new Error(`Failed to fetch features: ${error.message}`);
  return data || [];
}

export async function fetchDownloadConfig(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from("download_page_config").select("*");
  if (error) throw new Error(`Failed to fetch config: ${error.message}`);
  const result: Record<string, string> = {};
  (data || []).forEach((row) => {
    result[row.field_key] = row.field_value;
  });
  return result;
}
