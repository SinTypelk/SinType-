export type FaqEntry = { q: string; a: string };

export type PrivacySection = { title: string; body: string };

export type PrivacyContent = {
  subtitle: string;
  sections: PrivacySection[];
};

export type AboutContent = {
  paragraphs: string[];
  fontRows: [string, string, string][];
};

export type FaqContent = {
  web: FaqEntry[];
  desktop: FaqEntry[];
};

export type SiteContentKey = "privacy_policy" | "about" | "faq";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  body: string;
  excerpt: string;
  imageUrl: string | null;
  tags: string[];
  isPublished: boolean;
  publishedAt: string;
  updatedAt: string;
};

export type BlogPostInput = {
  title: string;
  body: string;
  excerpt?: string;
  imageUrl?: string | null;
  tags?: string[];
  slug?: string;
  isPublished?: boolean;
};
