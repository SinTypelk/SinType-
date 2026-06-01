/** Crawlable, keyword-rich content for the home page (below the converter). */
export function HomeSeoSection() {
  return (
    <section
      className="max-w-4xl mx-auto px-4 sm:px-6 py-12 pb-20 text-muted-foreground text-sm sm:text-base leading-relaxed"
      aria-labelledby="seo-guide-heading"
    >
      <h2 id="seo-guide-heading" className="font-display text-2xl text-foreground mb-4">
        Sinhala Unicode converter &amp; Singlish typing guide
      </h2>
      <div className="space-y-4 rounded-3xl border border-white/10 p-6 sm:p-8 bg-card/40">
        <p>
          <strong className="text-foreground">SinType.lk</strong> is a free{" "}
          <strong className="text-foreground">Sinhala Unicode converter</strong> and{" "}
          <strong className="text-foreground">Singlish to Sinhala</strong> editor for Sri Lanka.
          Type phonetic English (Singlish) — for example <code className="text-[var(--neon-cyan)]">mama gedara yanavaa</code> — and get
          instant Sinhala Unicode output for web, social media, and documents.
        </p>
        <p>
          Graphic designers and print shops can switch to <strong className="text-foreground">Legacy FM Abhaya</strong> mode
          for FM-series fonts used in newspapers, banners, and older DTP workflows. SinType also supports{" "}
          <strong className="text-foreground">Unicode to FM Abhaya</strong> style output without installing legacy
          keyboard drivers in the browser.
        </p>
        <h3 className="font-display text-lg text-foreground pt-2">
          Unicode vs Legacy FM fonts in Sri Lanka
        </h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-foreground">Unicode (Noto Sans Sinhala, Abhaya Libre)</strong> — modern web, apps,
            and cross-platform text.
          </li>
          <li>
            <strong className="text-foreground">Legacy FM Abhaya / FM Gemunu</strong> — print, government layouts, and
            Adobe workflows that still use ASCII-mapped Sinhala fonts.
          </li>
        </ul>
        <p>
          Need system-wide typing in Photoshop, Illustrator, Word, or WhatsApp? Download the{" "}
          <a href="/download" className="text-[var(--neon-cyan)] hover:underline">
            SinType Windows desktop app
          </a>{" "}
          for offline Singlish conversion with hotkeys (F10 toggle by default).
        </p>
        <p className="text-xs text-muted-foreground/80">
          Also known as: සිංහල යුනිකෝඩ් පරිවර්තකය · සිංහල ටයිප් කිරීම · sinhala type · singlish unicode · fm abhaya converter.
        </p>
      </div>
    </section>
  );
}
