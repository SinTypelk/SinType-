/**
 * Keyword taxonomy for SinType.lk — meta tags, header chips, JSON-LD alternateName.
 */

/** Primary high-volume English queries. */
export const PRIMARY_KEYWORDS = [
  "sinhala unicode converter",
  "singlish to sinhala",
  "sinhala unicode",
  "singlish to unicode",
  "sinhala type",
  "singlish to sinhala unicode",
  "unicode converter",
  "easy unicode converter",
  "fm abhaya converter",
  "unicode to fm abhaya",
  "unicode to legacy",
  "unicode to legacy font",
  "legacy sinhala font converter",
  "legacy converter",
  "fm font converter",
  "sinhala transliteration",
  "sinhala typing online",
  "sinhala voice typing",
  "wijesekera keyboard",
  "sinhala desktop typing",
  "sintype",
  "sintype.lk",
  "sintype converter",
  "sintype unicode converter",
  "sintype desktop app",
  "singlish converter",
] as const;

/** User-requested & long-tail search phrases (EN + SI). */
export const EXTENDED_SEARCH_KEYWORDS = [
  "sinhala and legacy unicode",
  "sinhala font download",
  "sinhala unicode converter app",
  "windows unicode converter app",
  "windows unicode converter software",
  "sri lankan unicode converter",
  "sri lanka unicode converter app windows",
  "සිංහල unicode converter",
  "සිංහල unicode පරිවර්තන මෘදුකාංග",
  "සිංහල converter app",
  "සිංහල voice typing",
] as const;

/** Common phonetic / keyboard typo variants. */
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
  "sintype dssktop app",
] as const;

/** Sinhala script phrases for alternateName / on-page copy. */
export const SINHALA_KEYWORD_PHRASES = [
  "සිංහල යුනිකෝඩ් පරිවර්තකය",
  "සිංහල ටයිප් කිරීම",
  "සිංහල පරිවර්තකය",
  "සිංහල යුනිකෝඩ් පරිවර්තන මෘදුකාංග",
] as const;

/** Visible chips in the home page hero header (natural labels, not spam). */
export const HEADER_KEYWORD_CHIPS = [
  "Sinhala Unicode",
  "Singlish → Unicode",
  "FM Abhaya / Legacy",
  "Unicode to Legacy Font",
  "Easy Unicode Converter",
  "Windows Desktop App",
  "Sinhala Voice Typing",
  "Sri Lanka Unicode",
  "සිංහල Unicode",
  "SinType Converter",
] as const;

function uniqueKeywords(parts: readonly string[]): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const key = p.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(p.trim());
  }
  return out.join(", ");
}

export const KEYWORDS_HOME = uniqueKeywords([
  ...PRIMARY_KEYWORDS,
  ...EXTENDED_SEARCH_KEYWORDS,
  ...TYPO_ALTERNATE_NAMES,
]);

export const KEYWORDS_DOWNLOAD = uniqueKeywords([
  "SinType desktop",
  "SinType desktop app",
  "sintype unicode converter",
  "Windows Sinhala typing",
  "offline Singlish converter",
  "system-wide Sinhala Unicode",
  "FM Abhaya legacy",
  "Sinhala input method",
  "windows unicode converter app",
  "sinhala unicode converter app",
  "sri lanka unicode converter app windows",
]);

export const KEYWORDS_SINGLISH_LANDING = uniqueKeywords([
  "singlish to sinhala",
  "singlish to sinhala unicode",
  "singlish to unicode",
  "singlish converter",
  "sinhala typing",
  "phonetic sinhala input",
  "sinhala unicode converter",
]);

export const KEYWORDS_UNICODE_LANDING = uniqueKeywords([
  "sinhala unicode converter",
  "sinhala unicode",
  "unicode converter",
  "unicode to fm abhaya",
  "unicode to legacy",
  "unicode to legacy font",
  "fm abhaya converter",
  "fm font converter",
  "legacy sinhala font",
  "legacy converter",
  "sinhala and legacy unicode",
]);

/** All strings for JSON-LD alternateName (deduped). */
export const ALL_ALTERNATE_NAMES: string[] = [
  ...new Set([
    ...PRIMARY_KEYWORDS,
    ...EXTENDED_SEARCH_KEYWORDS,
    ...TYPO_ALTERNATE_NAMES,
    ...SINHALA_KEYWORD_PHRASES,
    "Singlish to Sinhala Unicode Converter",
    "FM Abhaya Legacy Font Converter",
    "Sinhala Unicode Converter App",
    "Windows Unicode Converter Software",
  ]),
];
