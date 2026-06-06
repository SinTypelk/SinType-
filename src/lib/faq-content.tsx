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
    a: "SinType 2.0 runs a local web server on your PC. Scan the QR code from the desktop app to pair your phone — then use it as a wireless keyboard, touchpad, or file-transfer remote over your Wi-Fi.",
  },
  {
    q: "Why does the app need local network access?",
    a: "To facilitate real-time mobile-to-PC syncing. The local web server listens on your LAN so your phone can connect as a remote keyboard, touchpad, and file-transfer client without routing data through the public internet.",
  },
  {
    q: "What if I encounter a bug?",
    a: "Please report it via our feedback page (/feedback), contact form (/contact), WhatsApp support, or GitHub issues. Beta releases may have rough edges — your reports help us improve quickly.",
  },
  {
    q: "Is it safe?",
    a: "Yes. Mobile remote and file sync operate within your local environment (LAN/Wi-Fi). Everyday typing conversion runs offline on your PC. Only license activation, optional cloud notifications, and web sign-in use external servers.",
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
    a: "Day-to-day Singlish conversion runs offline on your PC. Mobile remote and LAN file sync use your local Wi-Fi only — no internet required. Internet is needed for license activation and optional cloud notifications.",
  },
  {
    q: "How do I get an activation key?",
    a: "Sign in at sintype.lk/license to generate a free 30-day key, then paste it into the Desktop app License tab with the same email.",
  },
];

export const ALL_FAQ_SCHEMA_ENTRIES = [...WEBSITE_FAQ_ENTRIES, ...DESKTOP_FAQ_ENTRIES];
