import { Link } from "@tanstack/react-router";
import { BlogSection, BlogTable } from "@/components/blog/BlogPageLayout";

export function SinhalaUnicodeLegacySeoArticle() {
  return (
    <>
      <p className="text-base sm:text-lg text-foreground/90">
        The transition of the Sinhala script from ancient writing mediums to digital screens
        highlights a unique history of cultural preservation and technological adaptation. For
        web developers, graphic designers, and computational linguists in Sri Lanka, managing
        digital Sinhala text means navigating a persistent divide:{" "}
        <strong className="text-foreground">Unicode</strong> (search-friendly, universal) versus{" "}
        <strong className="text-foreground">legacy ASCII-mapped fonts</strong> (FM Abhaya, DL
        Manel, and related families) still dominant in print and DTP.
      </p>
      <p>
        <Link to="/" className="text-[var(--neon-cyan)] hover:underline font-medium">
          SinType.lk
        </Link>{" "}
        bridges that gap with a real-time{" "}
        <Link
          to="/sinhala-unicode-converter"
          className="text-[var(--neon-cyan)] hover:underline"
        >
          Sinhala Unicode converter
        </Link>{" "}
        and{" "}
        <Link to="/singlish-to-sinhala" className="text-[var(--neon-cyan)] hover:underline">
          Singlish to Sinhala
        </Link>{" "}
        engine — publish in Unicode for Google, export legacy text for Adobe and newsroom
        workflows.
      </p>

      <BlogSection title="Historical evolution of Sinhala letterforms">
        <p>
          Sinhala is an abugida derived from Brahmi and South Indian Grantha influences. Early
          forms used angular strokes on stone; talipot palm leaves required rounded, continuous
          strokes so the stylus would not split the leaf along its grain — the flowing anatomy
          familiar today.
        </p>
        <p>
          Letterpress (18th–19th century) and N. J. Cooray&apos;s modulated metal type standardized
          print aesthetics. In <strong className="text-foreground">1964</strong>, the Wijesekera
          mechanical keyboard layout balanced typing speed with physical type-basket constraints —
          later mirrored in software keyboards.
        </p>
        <BlogTable
          caption="Sinhala script milestones"
          headers={["Era", "Medium", "Characteristics"]}
          rows={[
            [
              "Ancient",
              "Stone, metal plates",
              "Angular geometry; early Brahmi influence",
            ],
            [
              "Medieval–pre-colonial",
              "Ola (talipot) leaves",
              "Rounded, fluid letterforms",
            ],
            ["Late 1800s", "Letterpress", "Modulated thick/thin strokes (Cooray)"],
            ["1964", "Wijesekera typewriter", "Standardized key layout"],
            [
              "Late 1980s–90s",
              "Early PCs",
              "ASCII-override legacy fonts (no native OS Sinhala)",
            ],
            [
              "1996+",
              "Desktop publishing",
              "FM Abhaya (Pushpananda Ekanayake) and DL series",
            ],
            [
              "2004–present",
              "Unicode / SLS 1134",
              "Universal code points U+0D80–U+0DFF",
            ],
          ]}
        />
        <p>
          Early PC-era milestones include Colombo&apos;s <em>WadanTharuwa</em> (1989), Jayantha de
          Silva&apos;s Lihil fonts, the KANDY / aKandyNew lineage, FM Abhaya (1996), the DL family
          (Anurada, Manel, Malathi, Kidiru, Lihini), Kaputadotcom, and creative sets like Keko —
          all shaping what Sri Lankan users still call &quot;FM fonts&quot; in daily work.
        </p>
      </BlogSection>

      <BlogSection title="Unicode standard: SLS 1134 and the BMP block">
        <p>
          Legacy fonts display Sinhala by occupying English ASCII slots. Typing{" "}
          <strong className="text-foreground">අම්මා</strong> might require the ASCII string{" "}
          <code className="text-[var(--neon-cyan)]">wïud</code> with FM Abhaya installed. Without
          that font, recipients see gibberish — and computers cannot sort, search, or index the
          text as Sinhala.
        </p>
        <p>
          ICTA, SLSI, and the Unicode Consortium defined{" "}
          <strong className="text-foreground">SLS 1134:2004</strong> (revised 2011). Sinhala
          occupies Unicode block <strong className="text-foreground">U+0D80–U+0DFF</strong> (91
          assigned code points): 18 vowels, 41 consonants, 2 semi-consonants, piḷi, prenasalized
          forms (ඟ, ඬ, ඳ), and extensions for historical numerals (Lith Illakkam, Illakkam in
          SMP U+111E0–U+111FF).
        </p>
        <p>
          ICTA fonts like Bhashitha and Mooniak&apos;s Google-funded{" "}
          <strong className="text-foreground">Abhaya Libre</strong> (925 glyphs, five weights)
          helped designers move to Unicode while preserving FM Abhaya&apos;s visual heritage.
        </p>
      </BlogSection>

      <BlogSection title="Why legacy FM/DL fonts still dominate print & design">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-foreground">Expressive stroke modulation</strong> — many
            Unicode faces look uniform; FM/DL retain calligraphic warmth for posters and packaging.
          </li>
          <li>
            <strong className="text-foreground">Glyph economy</strong> — full Unicode Sinhala can
            need hundreds of ligature shapes; legacy maps ~81–167 visual shapes to keys for
            predictable DTP.
          </li>
          <li>
            <strong className="text-foreground">Archive inertia</strong> — newsrooms and publishers
            built decades of templates in FM Abhaya; migration cost is high.
          </li>
          <li>
            <strong className="text-foreground">Signage layout</strong> — designers manually kern
            legacy text when Tamil or English translations consume sign space.
          </li>
        </ul>
      </BlogSection>

      <BlogSection title="Unicode shaping: ZWJ, Adobe, and macOS quirks">
        <p>
          Sinhala is not linear Latin: vowel signs stack above, below, before, or after consonants.
          OpenType engines use the <strong className="text-foreground">Zero-Width Joiner (ZWJ,
          U+200D)</strong> to build ligatures — e.g. ක + ් + ZWJ + ර + ි → ක්‍රි. Missing ZWJ
          handling yields broken stacks like ක්රි.
        </p>
        <BlogTable
          caption="Non-printing characters in Sinhala layout"
          headers={["Character", "Code", "Role in Sinhala"]}
          rows={[
            ["ZWJ", "U+200D", "Join consonants into ligatures (e.g. ක්‍ර)"],
            ["ZWNJ", "U+200C", "Prevent unwanted ligatures"],
            ["Word Joiner", "U+2060", "Keep compounds on one line"],
            ["ZWSP", "U+200B", "Soft wrap points without visible space"],
          ]}
        />
        <p>
          <strong className="text-foreground">Adobe InDesign / Photoshop / Illustrator</strong>{" "}
          often need World-Ready Paragraph Composer and East Asian features enabled.{" "}
          <strong className="text-foreground">Microsoft Word for Mac</strong> has had combining-mark
          bugs (dotted circles under piḷi). NLP tokenizers that strip ZWJ corrupt text round-trips.
        </p>
        <p>
          SinType&apos;s{" "}
          <Link to="/download" className="text-[var(--neon-cyan)] hover:underline">
            Windows desktop app
          </Link>{" "}
          outputs Unicode or Legacy FM in real time so designers can paste legacy strings into
          Creative Suite without fighting paste-time Unicode glitches.
        </p>
      </BlogSection>

      <BlogSection title="SEO: how Googlebot reads Sinhala on the web">
        <p>
          Crawlers index <strong className="text-foreground">raw Unicode</strong> in HTML — not the
          pretty FM-shaped pixels on screen. If your page stores Latin ASCII placeholders, Google
          sees nonsense and cannot match Sinhala queries.
        </p>
        <pre className="text-xs sm:text-sm p-4 rounded-xl bg-black/30 border border-white/10 overflow-x-auto text-[var(--neon-cyan)]">
{`Search query (Unicode):  අ + ම් + මා
Legacy page source:     w + ï + u + d
Result:                 NO MATCH / poor ranking`}
        </pre>
        <p>
          Legacy-only sites risk <em>Crawled – currently not indexed</em>, thin-content flags, lost
          crawl budget, and high mobile bounce when fonts fail to load.
        </p>
        <BlogTable
          caption="Google Search Console issues with legacy Sinhala"
          headers={["GSC symptom", "Cause", "Fix"]}
          rows={[
            [
              "Thin / not indexed",
              "ASCII gibberish in HTML",
              "Publish Unicode; add internal links",
            ],
            [
              "Discovered, not crawled",
              "Unreadable legacy structure sitewide",
              "Prioritize Unicode on key URLs",
            ],
            [
              "Mobile bounce",
              "Legacy font missing on phone",
              "Use web fonts (e.g. Abhaya Libre) + Unicode",
            ],
            [
              "Broken Unicode URLs",
              "Percent-encoded Sinhala paths",
              "Use English slugs (/sinhala-unicode-converter)",
            ],
          ]}
        />
        <p>
          Best practice: draft articles in Unicode on{" "}
          <Link to="/" className="text-[var(--neon-cyan)] hover:underline">
            sintype.lk
          </Link>
          , then convert a copy to legacy only for print assets — never ship legacy ASCII as your
          primary HTML text.
        </p>
      </BlogSection>

      <BlogSection title="SinType workflows: SEO-first web + design-ready legacy">
        <pre className="text-[10px] sm:text-xs p-4 rounded-xl bg-black/30 border border-white/10 overflow-x-auto leading-relaxed">
{`┌──────────────────────────────┐
│   Sinhala Unicode input      │  ← Googlebot / web SEO
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│   Legacy ASCII output        │  ← FM Abhaya / DL for Adobe DTP
│   (FM Abhaya / DL Manel)     │
└──────────────────────────────┘`}
        </pre>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-foreground">Web publishing</strong> — store Singlish drafts as
            Unicode; rank for local Sinhala searches.
          </li>
          <li>
            <strong className="text-foreground">Graphic design</strong> — copy Unicode from the
            site, convert to legacy in one click, paste into Photoshop with FM Abhaya.
          </li>
          <li>
            <strong className="text-foreground">Archive migration</strong> — paste old FM files into
            the converter to produce searchable Unicode for the open web.
          </li>
        </ul>
        <BlogTable
          caption="Example Unicode vs legacy mappings"
          headers={["Sinhala", "Unicode", "FM Abhaya (approx.)"]}
          rows={[
            ["අ", "U+0D85", "w"],
            ["ම්", "U+0DBB + U+0DCA", "ïï"],
            ["මා", "U+0DBB + U+0DDF", "ud"],
            ["අම්මා", "U+0D85…U+0DDF", "wïud"],
          ]}
        />
      </BlogSection>

      <BlogSection title="Try SinType.lk today">
        <p>
          Use the free browser{" "}
          <Link to="/" className="text-[var(--neon-cyan)] hover:underline">
            Sinhala Unicode converter
          </Link>{" "}
          with Singlish input, Legacy FM mode, and optional voice typing. Install the{" "}
          <Link to="/download" className="text-[var(--neon-cyan)] hover:underline">
            Windows desktop app
          </Link>{" "}
          for system-wide typing with hotkeys and mobile LAN sync.
        </p>
        <p className="text-xs text-muted-foreground/80">
          Related:{" "}
          <Link to="/faq" className="text-[var(--neon-cyan)] hover:underline">
            FAQ
          </Link>
          {" · "}
          <Link to="/about" className="text-[var(--neon-cyan)] hover:underline">
            About SinType
          </Link>
        </p>
      </BlogSection>
    </>
  );
}
