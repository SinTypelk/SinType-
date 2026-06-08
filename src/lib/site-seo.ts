/** Shared SEO constants for SinType.lk (meta, Open Graph, JSON-LD). */

import {
  ALL_ALTERNATE_NAMES,
  KEYWORDS_HOME,
  SINHALA_KEYWORD_PHRASES,
} from "@/lib/seo-keywords";

export const SITE_NAME = "SinType";
export const SITE_BRAND = "SinType.lk";
export const SITE_URL =
  (import.meta as ImportMeta & { env?: { VITE_SITE_URL?: string } }).env
    ?.VITE_SITE_URL ?? "https://sintype.lk";

/** Primary SERP title — targets “sinhala unicode converter” + brand. */
export const HOME_TITLE =
  "Sinhala Unicode Converter | Singlish to Sinhala — SinType.lk";

export const HOME_DESCRIPTION =
  "Free Sinhala Unicode converter — Singlish to Unicode, easy Unicode converter, " +
  "FM Abhaya & legacy font mode, Unicode to legacy font. " +
  "Sri Lanka Unicode converter for web + Windows desktop app with Sinhala voice typing. " +
  "SinType.lk — singlish converter & sintype unicode converter online.";

export const DEFAULT_KEYWORDS = KEYWORDS_HOME;

/** Google Search Console — https://search.google.com/search-console */
export const GOOGLE_SITE_VERIFICATION =
  "4rVw_BDYRnCZ3pcw3docYkAHyOBFzjFKdE3zpopuR70";

export type { SitemapEntry } from "./sitemap-entries";
export { SITEMAP_ENTRIES, SITEMAP_PATHS } from "./sitemap-entries";

/**
 * Social preview image. Add website/public/og-image.png (1200×630) when available;
 * until then crawlers use icon.png (must be absolute URL).
 */
export const OG_IMAGE_PATH = "/og-image.png";
export const OG_IMAGE_FALLBACK_PATH = "/icon.png";
export const OG_IMAGE_URL = `${SITE_URL}${OG_IMAGE_PATH}`;
export const OG_IMAGE_FALLBACK_URL = `${SITE_URL}${OG_IMAGE_FALLBACK_PATH}`;
export const OG_IMAGE_ALT =
  "SinType — Singlish to Sinhala Unicode converter and Windows desktop app";

/** Resolved OG image URL for meta tags (use icon until og-image.png is deployed). */
export function socialImageUrl(): string {
  return OG_IMAGE_FALLBACK_URL;
}

/** Human-readable HTML site map sections (internal linking + discovery). */
export const HTML_SITEMAP_SECTIONS = [
  {
    title: "Converter & typing tools",
    links: [
      {
        path: "/",
        label: "Sinhala Unicode converter (home)",
        description: "Free Singlish to Sinhala online — Unicode & Legacy FM",
      },
      {
        path: "/singlish-to-sinhala",
        label: "Singlish to Sinhala",
        description: "Phonetic Sinhala typing landing page",
      },
      {
        path: "/sinhala-unicode-converter",
        label: "Sinhala Unicode converter",
        description: "Unicode & FM Abhaya conversion",
      },
    ],
  },
  {
    title: "Desktop app & license",
    links: [
      {
        path: "/download",
        label: "Download SinType for Windows",
        description: "Windows 10/11 desktop app",
      },
      {
        path: "/license",
        label: "Get activation key",
        description: "Free 30-day license for desktop",
      },
    ],
  },
  {
    title: "Help & company",
    links: [
      { path: "/faq", label: "FAQ", description: "Sinhala typing questions answered" },
      { path: "/blog", label: "Blog", description: "Unicode, legacy fonts & SEO guides" },
      { path: "/about", label: "About SinType", description: "Mission and font modes" },
      { path: "/contact", label: "Contact", description: "Support and partnerships" },
    ],
  },
  {
    title: "Legal",
    links: [
      { path: "/privacy", label: "Privacy Policy" },
      { path: "/terms", label: "Terms of Service" },
    ],
  },
] as const;

export function pageHead(options: {
  title: string;
  description: string;
  path: string;
  keywords?: string;
  noindex?: boolean;
  ogType?: string;
}) {
  const robots = options.noindex
    ? "noindex, follow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
  const image = socialImageUrl();
  return {
    meta: [
      { title: options.title },
      { name: "description", content: options.description },
      ...(options.keywords ? [{ name: "keywords", content: options.keywords }] : []),
      { name: "robots", content: robots },
      { name: "googlebot", content: robots },
      { name: "theme-color", content: "#06080c" },
      ...openGraphMeta({
        title: options.title,
        description: options.description,
        path: options.path,
        type: options.ogType,
        image,
      }),
    ],
    links: [canonicalLink(options.path)],
  };
}

/** 404 and error pages — avoid indexing thin error URLs. */
export function notFoundPageHead() {
  return pageHead({
    title: "Page not found — SinType.lk",
    description: "The page you requested is not on SinType.lk. Try the Sinhala Unicode converter or site map.",
    path: "/404",
    noindex: true,
  });
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_BRAND,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    email: "hello@sintype.lk",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "hello@sintype.lk",
      availableLanguage: ["English", "Sinhala"],
    },
    sameAs: [] as string[],
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_BRAND,
    url: SITE_URL,
    inLanguage: ["en-LK", "si"],
    description: HOME_DESCRIPTION,
  };
}

export function webApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_BRAND,
    alternateName: [
      ...ALL_ALTERNATE_NAMES,
      ...SINHALA_KEYWORD_PHRASES,
    ],
    url: SITE_URL,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser, Windows 10, Windows 11",
    browserRequirements: "Requires JavaScript",
    description: HOME_DESCRIPTION,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "LKR",
      availability: "https://schema.org/InStock",
    },
    featureList: [
      "Singlish to Sinhala Unicode transliteration",
      "Singlish to Unicode and easy Unicode converter",
      "Legacy FM Abhaya font output mode",
      "Unicode to legacy font and FM font converter",
      "Real-time phonetic typing",
      "Sinhala voice typing in browser (where supported)",
      "Unicode to FM Abhaya conversion",
      "Mobile sync with desktop",
      "Offline Windows Unicode converter app",
    ],
    screenshot: OG_IMAGE_URL,
  };
}

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SinType Desktop",
    alternateName: [
      "SinType for Windows",
      "Sinhala typing app",
      "Singlish desktop converter",
      "Sinhala Unicode converter app",
      "Windows Unicode converter software",
      "Sri Lanka Unicode converter app Windows",
      ...ALL_ALTERNATE_NAMES.slice(0, 12),
    ],
    applicationCategory: "UtilitiesApplication",
    applicationSubCategory: "InputMethod",
    operatingSystem: "Windows 10, Windows 11",
    description:
      "System-wide Singlish to Sinhala converter for Windows. Outputs Sinhala Unicode " +
      "and Legacy FM (Abhaya) fonts offline in any application.",
    url: `${SITE_URL}/download`,
    downloadUrl: `${SITE_URL}/download`,
    screenshot: OG_IMAGE_URL,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "LKR",
      availability: "https://schema.org/InStock",
    },
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    featureList: [
      "Real-time Singlish to Sinhala Unicode conversion",
      "Legacy FM Abhaya font output mode",
      "Offline system-wide Windows typing",
      "Global hotkey toggle",
    ],
  };
}

export function faqPageJsonLd(
  items: { question: string; answer: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbJsonLd(
  crumbs: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.path === "/" ? SITE_URL : `${SITE_URL}${c.path}`,
    })),
  };
}

/** Root + home structured data bundle. */
export function rootJsonLdGraph() {
  return [organizationJsonLd(), webSiteJsonLd(), webApplicationJsonLd(), softwareApplicationJsonLd()];
}

export function openGraphMeta(options: {
  title: string;
  description: string;
  path?: string;
  type?: string;
  image?: string;
}) {
  const url = options.path ? `${SITE_URL}${options.path}` : SITE_URL;
  const image = options.image ?? OG_IMAGE_FALLBACK_URL;
  return [
    { property: "og:site_name", content: SITE_BRAND },
    { property: "og:title", content: options.title },
    { property: "og:description", content: options.description },
    { property: "og:type", content: options.type ?? "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:image:secure_url", content: image },
    { property: "og:image:alt", content: OG_IMAGE_ALT },
    { property: "og:locale", content: "en_LK" },
    { property: "og:locale:alternate", content: "si_LK" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: options.title },
    { name: "twitter:description", content: options.description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: OG_IMAGE_ALT },
  ];
}

export function canonicalLink(path: string) {
  return { rel: "canonical" as const, href: path === "/" ? SITE_URL : `${SITE_URL}${path}` };
}
