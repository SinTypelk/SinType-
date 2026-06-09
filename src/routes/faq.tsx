import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { BreadcrumbNav } from "@/components/seo/BreadcrumbNav";
import { breadcrumbJsonLd, faqPageJsonLd, pageHead } from "@/lib/site-seo";

export const Route = createFileRoute("/faq")({
  head: () =>
    pageHead({
      title: "FAQ | SinType Desktop App — Singlish to Sinhala Typing — SinType.lk",
      description:
        "Frequently asked questions about SinType: Singlish to Sinhala typing, real-time mode, mobile remote, license activation, and Windows support.",
      path: "/faq",
      keywords:
        "sintype faq, singlish typing, sinhala unicode, real-time mode, license, mobile sync, windows app",
    }),
  component: FaqPage,
});

interface FaqQuestion {
  id: number;
  question: string;
  answer: string;
}

interface FaqGroup {
  title: string;
  items: FaqQuestion[];
}

const FAQ_DATA: FaqGroup[] = [
  {
    title: "Getting Started",
    items: [
      {
        id: 1,
        question: "What is SinType and how does it work?",
        answer:
          "SinType is a free Windows desktop application that converts Singlish (phonetic Sinhala typed in English letters) into Sinhala Unicode in real time. It uses low-level keyboard hooks at the Windows level to intercept your input and automatically convert it to Sinhala before injection — so it works in any app with no copy-paste needed. The app features a floating toolbar for easy access and system tray integration.",
      },
      {
        id: 2,
        question: 'What is "Singlish" — do I need to learn a new system?',
        answer:
          'Singlish here means typing Sinhala sounds using English letters the way you naturally speak — for example "api" becomes "අපි". You do not need to memorise a strict scheme; SinType uses a phonetic mapping that feels natural for most Sinhala speakers.',
      },
      {
        id: 3,
        question: "Which Windows versions does SinType support?",
        answer:
          "SinType supports Windows 10 and Windows 11 (64-bit). It does not currently support macOS or Linux.",
      },
      {
        id: 4,
        question: "Do I need to install anything else alongside SinType?",
        answer:
          "No. SinType is a self-contained installer. Just download, run the setup, and it is ready to use.",
      },
    ],
  },
  {
    title: "Typing and Conversion",
    items: [
      {
        id: 5,
        question:
          "What is the difference between Real-time mode and Word mode?",
        answer:
          "Real-time mode automatically converts each word as you finish typing it — the moment you press Space, punctuation, or other word boundaries, the word turns into Sinhala with composing support and prefix extension. Word mode waits for you to trigger the conversion manually using a hotkey, giving you full control over when conversion happens. Choose based on your preference: Real-time is faster for continuous typing, Word mode is better for precision.",
      },
      {
        id: 6,
        question:
          "Does SinType work inside Google Chrome, Edge, and Firefox?",
        answer:
          "Yes. SinType works at the Windows keyboard-hook level, so it converts text in any browser text field — Chrome, Edge, Firefox, and others.",
      },
      {
        id: 7,
        question:
          "Does it work in Microsoft Word, Excel, and other Office apps?",
        answer:
          "Yes. Microsoft Word, Excel, Outlook, and other Office apps are all supported. SinType injects text using Windows-native methods that work across Office versions.",
      },
      {
        id: 8,
        question:
          "Does it work in Notepad, VS Code, and chat apps like WhatsApp Web?",
        answer:
          "Yes. SinType works in Notepad, VS Code, WhatsApp Web, Facebook, Messenger, and most other text inputs. It uses fast backspace/type injection with Win32 Unicode support and intelligently falls back to clipboard-paste when direct injection is restricted by an application.",
      },
      {
        id: 9,
        question:
          "Can I customize the Singlish-to-Sinhala mappings to my preference?",
        answer:
          "Yes. You can add or override Singlish-to-Sinhala mappings using a custom mappings JSON file stored in your user settings folder (%APPDATA%\\SinType.lk). Open SinType settings and look for the Custom Mappings option to edit your personal mapping rules. Your custom mappings are always preserved during app updates and reinstalls.",
      },
      {
        id: 10,
        question: "The conversion stopped working — what should I do?",
        answer:
          "First, check that SinType is running — look for the icon in the system tray. Make sure the conversion toggle in the floating toolbar is turned ON. If the issue persists, try restarting the app from the tray icon.",
      },
    ],
  },
  {
    title: "License and Activation",
    items: [
      {
        id: 11,
        question: "How do I get a license key?",
        answer:
          "SinType is completely free. Visit sintype.lk/download and click the 'Generate 30-day key' button to get your free license key instantly. No payment or account required. Your key is valid for 30 days and can be renewed for free at any time.",
      },
      {
        id: 12,
        question: "Why does SinType use a license key if it is free?",
        answer:
          "The license key system allows us to notify you about important updates and new versions, and to ensure you are always running a stable, supported build. It is not a payment mechanism — SinType is and will remain free to use.",
      },
      {
        id: 13,
        question: "My license key expired — how do I renew it?",
        answer:
          "Simply visit sintype.lk/download and click 'Generate 30-day key' again to get a fresh free key. Open SinType, go to the License tab, and enter your email and the new key to reactivate. Renewal is always free.",
      },
      {
        id: 14,
        question: "My license is not activating — what do I check?",
        answer:
          "Make sure you are using the same email address you used when generating the key and that the license key is entered correctly. An internet connection is required for the activation step. Check that your firewall is not blocking SinType. If the issue continues, generate a new key from sintype.lk/download or use the Reset Request option in the License tab.",
      },
      {
        id: 15,
        question: "Can I use SinType on more than one PC?",
        answer:
          "Each license key is bound to one device at a time. If you need to use SinType on another PC, simply visit sintype.lk/download and generate a new free key for that device. There is no limit on how many free keys you can generate.",
      },
      {
        id: 16,
        question:
          "I got a new PC or reinstalled Windows — how do I re-activate?",
        answer:
          "Open SinType on your new PC, go to the License tab, and generate a new free key from sintype.lk/download. Enter your email and the new key to activate. If your old device binding is blocking activation, use the Reset Request option inside the License tab to describe your situation. Once approved, the old binding will be released and you can activate on your new machine.",
      },
      {
        id: 17,
        question: "How do I request a license reset?",
        answer:
          "Open SinType, go to the License tab, and find the Reset Request option. Describe your situation and submit. We will review and release your device binding so you can activate on your new machine.",
      },
    ],
  },
  {
    title: "Mobile Remote and File Sharing",
    items: [
      {
        id: 18,
        question: "How does the mobile remote keyboard work?",
        answer:
          "Open SinType on your PC, go to the Mobile Sync tab, and scan the QR code displayed using your phone camera. Your phone and PC must be on the same local Wi-Fi network. A local server runs on your PC to serve the mobile interface and handle real-time text injection. Once connected, type on your phone and the converted Sinhala text appears on your PC in real-time.",
      },
      {
        id: 19,
        question: "Do I need to install an app on my phone?",
        answer:
          "No app install is needed on your phone. The mobile interface is served directly from SinType over your local Wi-Fi — just open the link from the QR scan in your phone browser.",
      },
      {
        id: 20,
        question: "What if the QR code does not connect?",
        answer:
          "Make sure both your phone and PC are connected to the same Wi-Fi network. Mobile hotspots or separate networks will not work. Also check that your firewall is not blocking SinType on the local network.",
      },
      {
        id: 21,
        question:
          "How do I transfer files from my phone to my PC using SinType?",
        answer:
          "In the Mobile Sync tab, use the File Share feature. Select the file on your phone and it will transfer to your PC over your local Wi-Fi with a live progress indicator. No internet connection, cloud storage, or USB cable required.",
      },
    ],
  },
  {
    title: "Settings and General",
    items: [
      {
        id: 22,
        question: "How do I make SinType start automatically with Windows?",
        answer:
          'Open SinType settings and turn on "Start with Windows". This adds SinType to your Windows startup so it is always ready when you log in.',
      },
      {
        id: 23,
        question: "How do I hide or show the floating toolbar?",
        answer:
          "Right-click the SinType tray icon to show or hide the floating toolbar. You can also drag the toolbar to reposition it anywhere on your screen.",
      },
      {
        id: 24,
        question: "Where does SinType store my settings and data?",
        answer:
          "SinType stores your settings, preferences, encrypted license, and bound email at %APPDATA%\\SinType.lk on your PC. This folder is preserved during standard uninstall, so your preferences are retained if you reinstall.",
      },
      {
        id: 25,
        question: "How do I update SinType to the latest version?",
        answer:
          "SinType will notify you when an update is available. You can also check for updates from inside the Settings panel. Updates are always free.",
      },
      {
        id: 26,
        question: "How do I uninstall SinType completely?",
        answer:
          "Go to Windows Settings → Apps, find SinType in the list, and click Uninstall. This runs the Windows uninstaller cleanly. Note: Your user settings folder (%APPDATA%\\SinType.lk) is preserved by default so your preferences survive uninstall/reinstall. To remove all data, manually delete that folder after uninstalling.",
      },
      {
        id: 27,
        question:
          "Does SinType send my keystrokes or typing data to the internet?",
        answer:
          "No. SinType processes all keystrokes and conversion locally on your PC. Your typing data is never sent to the internet. The only network activity is voluntary license activation, optional feedback submission, and mobile remote requests over your local Wi-Fi network — all optional and under your control.",
      },
    ],
  },
];

function FaqPage() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-16 pb-24">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "FAQ", path: "/faq" },
        ])}
      />
      <BreadcrumbNav items={[{ label: "FAQ" }]} />

      <header className="text-center mb-12">
        <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--neon-cyan)]">
          Help & Support
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2">
          Frequently Asked Questions
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Everything you need to know about SinType: typing modes, license activation, mobile
          remote, settings, and troubleshooting.
        </p>
      </header>

      <div className="space-y-12">
        {FAQ_DATA.map((group) => (
          <FaqGroupSection key={group.title} group={group} />
        ))}
      </div>
    </section>
  );
}

function FaqGroupSection({ group }: { group: FaqGroup }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="font-display text-2xl sm:text-3xl mb-6 pb-3 border-b border-white/10">
        <span className="text-[var(--neon-cyan)]">●</span> {group.title}
      </h2>
      <div className="space-y-4">
        {group.items.map((item) => (
          <FAQAccordionItem key={item.id} question={item.question} answer={item.answer} />
        ))}
      </div>
    </motion.section>
  );
}

function FAQAccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-2xl border border-white/10 p-5 sm:p-6 cursor-pointer transition-all"
      style={{
        background: "color-mix(in oklab, var(--card) 80%, transparent)",
        backdropFilter: "blur(12px)",
      }}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-display font-semibold text-base sm:text-lg text-foreground flex-1">
          {question}
        </h3>
        <HelpCircle
          className="w-5 h-5 text-[var(--neon-cyan)] shrink-0 mt-0.5 transition-transform"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </div>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{answer}</p>
        </motion.div>
      )}
    </div>
  );
}
