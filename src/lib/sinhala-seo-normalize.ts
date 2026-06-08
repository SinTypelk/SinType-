/**
 * Query normalization for typo-tolerant internal matching (SEO research § Algorithmic Query Normalization).
 * Exposed for future search/redirect features; JSON-LD alternateName covers crawler discovery.
 */

const CANONICAL_TARGETS = [
  "sinhala unicode converter",
  "singlish to sinhala",
  "sinhala unicode",
  "fm abhaya",
  "unicode to fm abhaya",
] as const;

/** Levenshtein distance between two strings. */
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function normalizeQuery(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0D80-\u0DFF]/g, " ")
    .replace(/\s+/g, " ");
}

/**
 * Map a user search query to the closest canonical SEO target, if within max distance.
 */
export function matchCanonicalSearchQuery(
  raw: string,
  maxDistance = 3,
): (typeof CANONICAL_TARGETS)[number] | null {
  const q = normalizeQuery(raw);
  if (!q) return null;
  let best: (typeof CANONICAL_TARGETS)[number] | null = null;
  let bestDist = Infinity;
  for (const target of CANONICAL_TARGETS) {
    const d = levenshtein(q, target);
    if (d < bestDist) {
      bestDist = d;
      best = target;
    }
  }
  return bestDist <= maxDistance ? best : null;
}

/** Suggested landing path for a canonical target (for future router use). */
export function canonicalTargetToPath(target: string): string {
  if (target.includes("singlish")) return "/singlish-to-sinhala";
  if (target.includes("unicode") || target.includes("fm")) return "/sinhala-unicode-converter";
  return "/";
}
