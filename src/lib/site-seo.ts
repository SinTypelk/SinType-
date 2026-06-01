/** Shared SEO constants for SinType.lk (meta, Open Graph, JSON-LD). */

export const SITE_NAME = "SinType";
export const SITE_URL =
  (import.meta as ImportMeta & { env?: { VITE_SITE_URL?: string } }).env
    ?.VITE_SITE_URL ?? "https://sintype.lk";

export const HOME_TITLE =
  "SinType | Ultimate Singlish to Sinhala Unicode & Legacy Converter";

export const HOME_DESCRIPTION =
  "Convert Singlish to flawless Sinhala Unicode and Legacy FM fonts in real time. " +
  "Lightning-fast, professionally designed, with an offline Windows desktop app " +
  "for system-wide typing anywhere on your PC.";

export const DEFAULT_KEYWORDS =
  "Singlish to Sinhala, Sinhala Unicode, FM Abhaya converter, professional Sinhala typing, " +
  "Sinhala transliteration, Legacy FM font, SinType desktop, Windows Sinhala typing";

/** Google Search Console — https://search.google.com/search-console */
export const GOOGLE_SITE_VERIFICATION =
  "4rVw_BDYRnCZ3pcw3docYkAHyOBFzjFKdE3zpopuR70";

/** Public marketing routes for sitemap.xml (no /admin, /m/). */
export const SITEMAP_PATHS = [
  "/",
  "/download",
  "/faq",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/messages",
  "/feedback",
  "/license",
  "/login",
] as const;

/** Social preview — place a 1200×630 PNG at website/public/og-image.png */
export const OG_IMAGE_PATH = "/og-image.png";
export const OG_IMAGE_URL = `${SITE_URL}${OG_IMAGE_PATH}`;
export const OG_IMAGE_ALT =
  "SinType — Singlish to Sinhala Unicode converter and Windows desktop app preview";

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SinType Desktop",
    alternateName: "SinType for Windows",
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
      priceCurrency: "USD",
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

export function openGraphMeta(options: {
  title: string;
  description: string;
  path?: string;
  type?: string;
}) {
  const url = options.path ? `${SITE_URL}${options.path}` : SITE_URL;
  return [
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: options.title },
    { property: "og:description", content: options.description },
    { property: "og:type", content: options.type ?? "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: OG_IMAGE_URL },
    { property: "og:image:alt", content: OG_IMAGE_ALT },
    { property: "og:locale", content: "en_LK" },
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
