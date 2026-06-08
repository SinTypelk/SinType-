import { adminFetch } from "@/lib/admin-api";
import type {
  AboutContent,
  BlogPost,
  BlogPostInput,
  FaqContent,
  PrivacyContent,
  SiteContentKey,
} from "@/lib/content-types";

export async function adminFetchAllBlogPosts(): Promise<BlogPost[]> {
  const res = await adminFetch<{ posts: BlogPost[] }>("/api/admin/blog");
  return res.posts;
}

export async function adminCreateBlogPost(input: BlogPostInput): Promise<BlogPost> {
  const res = await adminFetch<{ post: BlogPost }>("/api/admin/blog", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.post;
}

export async function adminUpdateBlogPost(
  id: string,
  input: Partial<BlogPostInput>,
): Promise<BlogPost> {
  const res = await adminFetch<{ post: BlogPost }>(`/api/admin/blog/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return res.post;
}

export async function adminDeleteBlogPost(id: string): Promise<void> {
  await adminFetch<{ ok: true }>(`/api/admin/blog/${id}`, { method: "DELETE" });
}

export async function adminFetchSiteContent(): Promise<
  Partial<Record<SiteContentKey, unknown>>
> {
  const res = await adminFetch<{ content: Partial<Record<SiteContentKey, unknown>> }>(
    "/api/admin/content",
  );
  return res.content;
}

export async function adminSavePrivacyContent(content: PrivacyContent): Promise<void> {
  await adminFetch("/api/admin/content", {
    method: "PUT",
    body: JSON.stringify({ key: "privacy_policy", content }),
  });
}

export async function adminSaveAboutContent(content: AboutContent): Promise<void> {
  await adminFetch("/api/admin/content", {
    method: "PUT",
    body: JSON.stringify({ key: "about", content }),
  });
}

export async function adminSaveFaqContent(content: FaqContent): Promise<void> {
  await adminFetch("/api/admin/content", {
    method: "PUT",
    body: JSON.stringify({ key: "faq", content }),
  });
}

export async function adminFetchEnhancedStats(): Promise<{
  totalUsers: number;
  activeLicenses: number;
  pendingFeedback: number;
  pendingLicenseResets: number;
  totalAppSessions: number;
  latestDownloadUrl: string | null;
  latestVersion: string | null;
}> {
  return adminFetch("/api/admin/stats");
}
