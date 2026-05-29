import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ · Sintype.lk" },
      {
        name: "description",
        content:
          "Common questions about the SinType website converter, voice typing, and the Windows desktop app.",
      },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
  }),
  component: FaqPage,
});

type FaqItem = { q: string; a: React.ReactNode };

const WEBSITE_FAQS: FaqItem[] = [
  {
    q: "Do I need to install anything to use the website?",
    a: (
      <p>
        No. The web converter is entirely browser-based — open sintype.lk, type Singlish in the
        input box, and copy Unicode or Legacy FM output. Install the Windows desktop app only if
        you want system-wide typing outside the browser.
      </p>
    ),
  },
  {
    q: "Why does the mic stop working?",
    a: (
      <div className="space-y-2">
        <p>
          Voice typing uses your browser&apos;s Web Speech API. If the mic icon greys out or
          stops responding:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Allow microphone permission when prompted (and in site settings).</li>
          <li>Use HTTPS — microphones are blocked on insecure pages.</li>
          <li>
            On iPhone/iPad, use <strong>Safari</strong> and enable mic access under Settings →
            Safari → Microphone.
          </li>
          <li>Refresh once, then tap the mic again inside the input area.</li>
        </ul>
      </div>
    ),
  },
  {
    q: "How do I type in Singlish?",
    a: (
      <div className="space-y-2">
        <p>Type the way you would write Sinhala in English. Examples:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <code>ammaa</code> → අම්මා
          </li>
          <li>
            <code>mama gedara yanavaa</code> → මම ගෙදර යනවා
          </li>
        </ul>
      </div>
    ),
  },
  {
    q: "How does mobile sync work?",
    a: (
      <p>
        Sign in on the website, scan the QR code on the home page with your phone, and text you
        type or speak on your phone streams into the desktop converter in real time.
      </p>
    ),
  },
];

const DESKTOP_HOTKEYS = [
  { action: "Toggle Singlish on/off", keys: "F10 (default)" },
  { action: "Unicode output mode", keys: "F9" },
  { action: "Legacy FM output mode", keys: "F11" },
  { action: "Show / hide floating toolbar", keys: "F12" },
] as const;

const DESKTOP_FAQS: FaqItem[] = [
  {
    q: "What are the default desktop hotkeys?",
    a: (
      <div className="space-y-3">
        <p>
          SinType uses global function keys by default (you can change them in{" "}
          <strong>Settings → Hotkeys</strong> on the desktop app):
        </p>
        <ul className="rounded-lg border border-border/60 overflow-hidden text-sm">
          {DESKTOP_HOTKEYS.map((row) => (
            <li
              key={row.action}
              className="flex justify-between gap-4 px-3 py-2 border-b border-border/40 last:border-0 bg-background/20"
            >
              <span>{row.action}</span>
              <kbd className="font-mono text-[var(--neon-cyan)] shrink-0">{row.keys}</kbd>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          Alternatives in Settings include Ctrl+Shift+S (toggle), Ctrl+Shift+U (Unicode),
          Ctrl+Shift+L (Legacy), and Ctrl+Shift+T (toolbar).
        </p>
      </div>
    ),
  },
  {
    q: "Does it work in Adobe software?",
    a: (
      <p>
        Yes. SinType Desktop works system-wide in any application — including Adobe Photoshop,
        Illustrator, Premiere Pro, Word, browsers, and chat apps. Press{" "}
        <strong>F10</strong> (default) to toggle Singlish and type naturally.
      </p>
    ),
  },
  {
    q: "Do I need an internet connection?",
    a: (
      <p>
        Internet is only required for the initial license activation and optional sync features.
        Day-to-day Singlish conversion runs <strong>offline</strong> on your PC — keystrokes are
        not sent to the cloud while you type.
      </p>
    ),
  },
  {
    q: "How do I get an activation key?",
    a: (
      <p>
        Sign in at sintype.lk/license to generate a free 30-day key, then paste it into the
        Desktop app&apos;s License tab with the same email address.
      </p>
    ),
  },
];

function FaqPage() {
  const [tab, setTab] = useState<"web" | "desktop">("web");
  const items = tab === "web" ? WEBSITE_FAQS : DESKTOP_FAQS;

  return (
    <section className="max-w-3xl mx-auto px-4 py-12">
      <header className="text-center mb-10">
        <h1 className="font-display text-3xl sm:text-5xl font-bold neon-text">FAQ</h1>
        <p className="mt-3 text-muted-foreground">Website and desktop app — quick answers.</p>
      </header>

      <div className="flex justify-center gap-2 mb-6">
        {(
          [
            ["web", "Website Usage"],
            ["desktop", "Desktop App Usage"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
              tab === id
                ? "border-[var(--neon-cyan)]/50 bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)]"
                : "border-border text-muted-foreground hover:bg-accent/20"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <Accordion type="single" collapsible className="neon-border p-2 sm:p-4">
        {items.map((f, i) => (
          <AccordionItem key={f.q} value={`item-${i}`} className="border-border">
            <AccordionTrigger className="text-left px-3 hover:no-underline">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="px-3 text-muted-foreground text-sm leading-relaxed">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
