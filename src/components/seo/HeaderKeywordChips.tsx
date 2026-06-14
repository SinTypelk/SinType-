import { HEADER_KEYWORD_CHIPS } from "@/lib/seo-keywords";

/**
 * Hero header keyword chips — crawlable, user-visible search terms (not hidden stuffing).
 */
export function HeaderKeywordChips() {
  return (
    <div
      className="mt-5 max-w-3xl mx-auto"
      aria-label="Popular Sinhala Unicode and Singlish converter search topics"
    >
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground/80 mb-2">
        Popular searches
      </p>
      <ul className="flex flex-wrap justify-center gap-1.5 sm:gap-2 list-none p-0 m-0">
        {HEADER_KEYWORD_CHIPS.map((label, index) => (
          <li
            key={label}
            className="hero-chip-entrance"
            style={{ animationDelay: `${0.45 + index * 0.05}s` }}
          >
            <span className="inline-block px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] text-muted-foreground border border-white/10 bg-card/30 backdrop-blur-sm">
              {label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
