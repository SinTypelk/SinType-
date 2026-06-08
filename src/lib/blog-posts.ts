/** Blog index metadata — article bodies live in @/content/blog/*. */

export type BlogPostMeta = {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  publishedAt: string;
  updatedAt: string;
  readMinutes: number;
  tags: string[];
  keywords: string;
};

export const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: "sinhala-unicode-legacy-seo-guide",
    title:
      "Sinhala Unicode vs Legacy Fonts: History, SEO & Real-Time Conversion",
    subtitle:
      "From palm-leaf inscriptions to Googlebot — why Sri Lankan sites need Unicode, " +
      "why print still loves FM Abhaya, and how SinType bridges both.",
    excerpt:
      "A technical guide to Sinhala typography, SLS 1134 Unicode, FM/DL legacy fonts, " +
      "ZWJ shaping, Adobe InDesign quirks, and search-engine indexing for sintype.lk.",
    publishedAt: "2026-06-02",
    updatedAt: "2026-06-02",
    readMinutes: 18,
    tags: [
      "Sinhala Unicode",
      "Legacy FM Abhaya",
      "SEO",
      "Singlish",
      "Sri Lanka",
    ],
    keywords:
      "sinhala unicode, legacy font converter, fm abhaya, unicode to legacy, " +
      "googlebot sinhala, sinhala seo, sintype converter, singlish to unicode, " +
      "sri lanka unicode, sinhala typography, sls 1134",
  },
];

export function getBlogPost(slug: string): BlogPostMeta | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}
