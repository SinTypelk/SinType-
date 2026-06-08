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
          "SinType is a Windows desktop app that converts Singlish (phonetic Sinhala typed in English letters) into Sinhala Unicode in real time. It hooks into your keyboard at the Windows level so it works in any app — no copy-paste needed.",
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
        question: "What is the difference between Real-time mode and Word mode?",
        answer:
          "Real-time mode converts each word as you finish typing it — the moment you press Space or punctuation, the word turns into Sinhala. Word mode waits for you to trigger the conversion manually, giving you more control.",
      },
      {
        id: 6,
        question: "Does SinType work inside Google Chrome, Edge, and Firefox?",
        answer:
          "Yes. SinType works at the Windows keyboard-hook level, so it converts text in any browser text field — Chrome, Edge, Firefox, and others.",
      },
      {
        id: 7,
        question: "Does it work in Microsoft Word, Excel, and other Office apps?",
        answer:
          "Yes. Microsoft Word, Excel, Outlook, and other Office apps are all supported. SinType injects text using Windows-native methods that work across Office versions.",
      },
      {
        id: 8,
        question: "Does it work in Notepad, VS Code, and chat apps like WhatsApp Web?",
        answer:
          "Yes. SinType works in Notepad, VS Code, WhatsApp Web, Facebook, Messenger, and most other text inputs. For apps where direct injection is restricted, it falls back to clipboard-paste automatically.",
      },
      {
        id: 9,
        question: "Can I customize the Singlish-to-Sinhala mappings to my preference?",
        answer:
          "Yes. You can add or override Singlish-to-Sinhala mappings using the custom mappings file. Open SinType settings and look for the Custom Mappings option to edit your personal mapping rules.",
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
          "Visit sintype.lk/license to purchase a license. After payment, your key will be sent to your email.",
      },
      {
        id: 12,
        question: "Do I need internet to use SinType after activation?",
        answer:
          "Internet is only required during license activation. After that, SinType works fully offline. Your license is encrypted and stored locally on your device.",
      },
      {
        id: 13,
        question: "My license is not activating — what do I check?",
        answer:
          "Make sure you are using the exact email address used during purchase and that the license key is correct. An internet connection is required for the activation step. If the issue continues, use the Contact form to reach us.",
      },
      {
        id: 14,
        question: "What happens if I lose my license key?",
        answer:
          "Your license key is tied to your purchase email. Visit sintype.lk/license and use the key recovery option, or contact support with your purchase details.",
      },
      {
        id: 15,
        question: "Can I use SinType on more than one PC?",
        answer:
          "Your license is bound to one device at a time for security. If you need to use SinType on a second PC, you will need a separate license or a device reset.",
      },
      {
        id: 16,
        question: "I got a new PC or reinstalled Windows — how do I re-activate?",
        answer:
          "Open SinType on your new PC, go to the License tab, and enter your email and license key. If your old device binding is still active, use the Reset License option inside the app to release it first.",
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
          "Open SinType on your PC, go to the Mobile Sync tab, and scan the QR code shown using your phone camera. Your phone and PC must be on the same Wi-Fi network. Once connected, type on your phone and the converted Sinhala text appears on your PC.",
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
          "Make sure both your phone and PC are connected to the same Wi-Fi network. Hotspots or separate networks will not work. Also check that your firewall is not blocking SinType on the local network.",
      },
      {
        id: 21,
        question: "How do I transfer files from my phone to my PC using SinType?",
        answer:
          "In the Mobile Sync tab, use the File Share feature. Select the file on your phone and it will transfer to your PC in chunks with a live progress indicator. No internet or USB cable required.",
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
          "SinType stores your settings, preferences, and encrypted license at %APPDATA%\\SinType.lk on your PC. This folder is not deleted during a standard uninstall, so your preferences are preserved if you reinstall.",
      },
      {
        id: 25,
        question: "How do I update SinType to the latest version?",
        answer:
          "SinType will notify you when an update is available. You can also check for updates from inside the Settings panel.",
      },
      {
        id: 26,
        question: "How do I uninstall SinType completely?",
        answer:
          "Go to Windows Settings → Apps, find SinType in the list, and click Uninstall. Alternatively, use the Uninstall option inside the SinType settings panel. Both methods run the standard Windows uninstaller cleanly.",
      },
      {
        id: 27,
        question: "Does SinType send my keystrokes or typing data to the internet?",
        answer:
          "No. SinType processes all keystrokes locally on your PC. Your typing data is never sent to the internet. The only network activity is license activation and optional feedback submission, both of which you control.",
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
