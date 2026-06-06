const SCRIPT_RE = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const EVENT_HANDLER_RE = /\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const JS_URL_RE = /javascript:/gi;
const IFRAME_RE = /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi;

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "a",
  "code",
  "pre",
  "blockquote",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "img",
  "hr",
  "span",
  "div",
]);

/** Strip dangerous markup while keeping basic formatting tags. */
export function sanitizeHtml(input: string, maxLen = 100_000): string {
  let out = input
    .replace(SCRIPT_RE, "")
    .replace(IFRAME_RE, "")
    .replace(EVENT_HANDLER_RE, "")
    .replace(JS_URL_RE, "")
    .trim()
    .slice(0, maxLen);

  out = out.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (tag, name: string) => {
    const lower = name.toLowerCase();
    if (!ALLOWED_TAGS.has(lower)) return "";
    if (lower === "a") {
      return tag.replace(
        /\shref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i,
        (_m, d1, d2, d3) => {
          const href = (d1 ?? d2 ?? d3 ?? "").trim();
          if (!isSafeUrl(href)) return "";
          return ` href="${href.replace(/"/g, "&quot;")}"`;
        },
      );
    }
    if (lower === "img") {
      const srcMatch = tag.match(/\ssrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const src = (srcMatch?.[1] ?? srcMatch?.[2] ?? srcMatch?.[3] ?? "").trim();
      if (!isSafeUrl(src)) return "";
      return `<img src="${src.replace(/"/g, "&quot;")}" alt="" />`;
    }
    return tag.replace(EVENT_HANDLER_RE, "");
  });

  return out;
}

export function sanitizePlainText(input: string, maxLen = 10_000): string {
  return input
    .replace(/[<>]/g, "")
    .replace(SCRIPT_RE, "")
    .trim()
    .slice(0, maxLen);
}

export function sanitizeTags(tags: string[]): string[] {
  return tags
    .map((t) => sanitizePlainText(t, 64))
    .filter(Boolean)
    .slice(0, 20);
}

export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function isSafeUrl(url: string): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function sanitizeUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  return isSafeUrl(trimmed) ? trimmed : null;
}
