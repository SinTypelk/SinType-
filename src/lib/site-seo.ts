/** Shared SEO constants for SinType.lk (meta, Open Graph, JSON-LD). */

import {
  KEYWORDS_HOME,
  SINHALA_KEYWORD_PHRASES,
  TYPO_ALTERNATE_NAMES,
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
  "Free Sinhala Unicode converter and Singlish to Sinhala typing online. " +
  "Convert to Unicode or Legacy FM Abhaya in real time. " +
  "Offline Windows desktop app for system-wide Sinhala typing in any app.";

export const DEFAULT_KEYWORDS = KEYWORDS_HOME;

/** Google Search Console — https://search.google.com/search-console */
export const GOOGLE_SITE_VERIFICATION =
  "4rVw_BDYRnCZ3pcw3docYkAHyOBFzjFKdE3zpopuR70";

export type SitemapEntry = {
  path: (typeof SITEMAP_PATHS)[number];
  changefreq: "daily" | "weekly" | "monthly";
  priority: number;
};

/** Public marketing routes for sitemap.xml (no /admin, /m/, noindex pages). */
export const SITEMAP_ENTRIES: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: 1.0 },
  { path: "/singlish-to-sinhala", changefreq: "weekly", priority: 0.95 },
  { path: "/sinhala-unicode-converter", changefreq: "weekly", priority: 0.95 },
  { path: "/download", changefreq: "weekly", priority: 0.9 },
  { path: "/faq", changefreq: "weekly", priority: 0.85 },
  { path: "/about", changefreq: "monthly", priority: 0.75 },
  { path: "/license", changefreq: "weekly", priority: 0.7 },
  { path: "/contact", changefreq: "monthly", priority: 0.65 },
  { path: "/privacy", changefreq: "monthly", priority: 0.5 },
  { path: "/terms", changefreq: "monthly", priority: 0.5 },
];

export const SITEMAP_PATHS = SITEMAP_ENTRIES.map((e) => e.path);

/** Social preview — place a 1200×630 PNG at website/public/og-image.png */
export const OG_IMAGE_PATH = "/og-image.png";
export const OG_IMAGE_URL = `${SITE_URL}${OG_IMAGE_PATH}`;
export const OG_IMAGE_ALT =
  "SinType — Singlish to Sinhala Unicode converter and Windows desktop app";

export function pageHead(options: {
  title: string;
  description: string;
  path: string;
  keywords?: string;
  noindex?: boolean;
}) {
  const robots = options.noindex ? "noindex, follow" : "index, follow";
  return {
    meta: [
      { title: options.title },
      { name: "description", content: options.description },
      ...(options.keywords ? [{ name: "keywords", content: options.keywords }] : []),
      { name: "robots", content: robots },
      ...openGraphMeta({
        title: options.title,
        description: options.description,
        path: options.path,
      }),
    ],
    links: [canonicalLink(options.path)],
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_BRAND,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
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
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function webApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_BRAND,
    alternateName: [
      ...TYPO_ALTERNATE_NAMES,
      ...SINHALA_KEYWORD_PHRASES,
      "Singlish to Sinhala Unicode Converter",
      "FM Abhaya Legacy Font Converter",
      "Sinhala Unicode Converter",
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
      "Legacy FM Abhaya font output mode",
      "Real-time phonetic typing",
      "Unicode to FM Abhaya conversion",
      "Mobile sync with desktop",
      "Offline Windows system-wide typing",
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
      ...TYPO_ALTERNATE_NAMES.slice(0, 6),
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
}) {
  const url = options.path ? `${SITE_URL}${options.path}` : SITE_URL;
  return [
    { property: "og:site_name", content: SITE_BRAND },
    { property: "og:title", content: options.title },
    { property: "og:description", content: options.description },
    { property: "og:type", content: options.type ?? "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: OG_IMAGE_URL },
    { property: "og:image:alt", content: OG_IMAGE_ALT },
    { property: "og:locale", content: "en_LK" },
    { property: "og:locale:alternate", content: "si_LK" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: options.title },
    { name: "twitter:description", content: options.description },
    { name: "twitter:image", content: OG_IMAGE_URL },
    { name: "twitter:image:alt", content: OG_IMAGE_ALT },
  ];
}

export function canonicalLink(path: string) {
  return { rel: "canonical" as const, href: path === "/" ? SITE_URL : `${SITE_URL}${path}` };
}
