/**
 * Keyword taxonomy from SinType SEO research (developer/SEO RESEACH.txt).
 * Used in meta tags, on-page copy, and JSON-LD alternateName fields.
 */

/** Primary high-volume English queries (relative index 65–100). */
export const PRIMARY_KEYWORDS = [
  "sinhala unicode converter",
  "singlish to sinhala",
  "sinhala unicode",
  "sinhala type",
  "singlish to sinhala unicode",
  "fm abhaya converter",
  "unicode to fm abhaya",
  "legacy sinhala font converter",
  "sinhala transliteration",
  "sinhala typing online",
  "wijesekera keyboard",
  "sinhala desktop typing",
  "sintype",
  "sintype.lk",
] as const;

/** Common phonetic / keyboard typo variants (research § Typo Classification). */
export const TYPO_ALTERNATE_NAMES = [
  "shinhala unicode",
  "sinhal unicode",
  "sinhla uncode",
  "sinhala uncode converter",
  "easy sinhala unicode",
  "singlish sinhala",
  "singlish unicode",
  "sinhala converter",
  "sinhala unicode convert",
  "fm abhaya unicode",
  "unicode fm abhaya",
  "legacy sinhala to unicode",
  "sinhala legacy font",
  "helakuru alternative",
  "online sinhala typing",
] as const;

/** Sinhala script phrases for alternateName / content (medium volume). */
export const SINHALA_KEYWORD_PHRASES = [
  "සිංහල යුනිකෝඩ් පරිවර්තකය",
  "සිංහල ටයිප් කිරීම",
  "සිංහල පරිවර්තකය",
] as const;

export const KEYWORDS_HOME = [
  ...PRIMARY_KEYWORDS,
  ...TYPO_ALTERNATE_NAMES.slice(0, 8),
].join(", ");

export const KEYWORDS_DOWNLOAD =
  "SinType desktop, Windows Sinhala typing, offline Singlish converter, system-wide Sinhala Unicode, FM Abhaya legacy, Sinhala input method";

export const KEYWORDS_SINGLISH_LANDING =
  "singlish to sinhala, singlish to sinhala unicode, sinhala typing, phonetic sinhala input, sinhala unicode converter";

export const KEYWORDS_UNICODE_LANDING =
  "sinhala unicode converter, sinhala unicode, unicode to fm abhaya, fm abhaya converter, legacy sinhala font";
