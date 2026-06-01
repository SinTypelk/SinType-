/** FAQ copy shared by the FAQ page and FAQPage JSON-LD. */

export type FaqEntry = { q: string; a: string };

export const WEBSITE_FAQ_ENTRIES: FaqEntry[] = [
  {
    q: "What is a Sinhala Unicode converter?",
    a: "A Sinhala Unicode converter turns phonetic Singlish (Latin letters) or legacy ASCII-mapped text into standard Sinhala Unicode characters (U+0D80 to U+0DFF) for web, apps, and modern software.",
  },
  {
    q: "How is Singlish to Sinhala typing different from the Wijesekera keyboard?",
    a: "Singlish transliteration maps sounds to letters you already know on QWERTY (for example ammaa). The Wijesekera layout assigns each Sinhala letter to a specific English key and is the national hardware standard.",
  },
  {
    q: "Can I convert Unicode to FM Abhaya (legacy) with SinType?",
    a: "Yes. On the web converter, switch to Legacy mode to output FM Abhaya-style text for print and graphic design workflows that still use legacy fonts.",
  },
  {
    q: "Do I need to install anything to use the website?",
    a: "No. Open sintype.lk, type Singlish, and copy Unicode or Legacy output. Install the Windows desktop app only for system-wide typing outside the browser.",
  },
  {
    q: "How does mobile sync work?",
    a: "Sign in, scan the QR code on the home page, and text you type on your phone streams into the desktop converter in real time.",
  },
];

export const DESKTOP_FAQ_ENTRIES: FaqEntry[] = [
  {
    q: "Does SinType work in Adobe Photoshop, Illustrator, and InDesign?",
    a: "Yes. SinType Desktop works system-wide. For Yansaya and Rakaransaya ligatures in Adobe apps, enable the World-Ready or Middle Eastern and South Asian composer in the paragraph/type settings.",
  },
  {
    q: "How do I fix Yansaya (්‍ය) breaking in Adobe InDesign?",
    a: "Open the Paragraph style or Control panel and switch the composer to World-Ready Paragraph Composer or World-Ready Single-line Composer so the Indic shaping engine forms ligatures correctly.",
  },
  {
    q: "Does it work offline?",
    a: "Day-to-day Singlish conversion runs offline on your PC. Internet is only needed for license activation and optional sync.",
  },
  {
    q: "How do I get an activation key?",
    a: "Sign in at sintype.lk/license to generate a free 30-day key, then paste it into the Desktop app License tab with the same email.",
  },
];

export const ALL_FAQ_SCHEMA_ENTRIES = [...WEBSITE_FAQ_ENTRIES, ...DESKTOP_FAQ_ENTRIES];
