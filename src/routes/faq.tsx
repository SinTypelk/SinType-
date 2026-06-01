import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  ALL_FAQ_SCHEMA_ENTRIES,
  DESKTOP_FAQ_ENTRIES,
  WEBSITE_FAQ_ENTRIES,
  type FaqEntry,
} from "@/lib/faq-content";
import { faqPageJsonLd, pageHead } from "@/lib/site-seo";

export const Route = createFileRoute("/faq")({
  head: () =>
    pageHead({
      title: "FAQ | Sinhala Unicode, Singlish & Desktop — SinType.lk",
      description:
        "Answers about Singlish to Sinhala typing, FM Abhaya legacy fonts, Adobe InDesign Unicode shaping, and the SinType Windows app.",
      path: "/faq",
      keywords:
        "sinhala unicode faq, singlish typing, fm abhaya, adobe sinhala typing, sintype desktop",
    }),
  component: FaqPage,
});

function renderAnswer(text: string) {
  return <p>{text}</p>;
}

function FaqAccordion({ items }: { items: FaqEntry[] }) {
  return (
    <Accordion type="single" collapsible className="neon-border p-2 sm:p-4">
      {items.map((f, i) => (
        <AccordionItem key={f.q} value={`item-${i}`} className="border-border">
          <AccordionTrigger className="text-left px-3 hover:no-underline">{f.q}</AccordionTrigger>
          <AccordionContent className="px-3 text-muted-foreground text-sm leading-relaxed">
            {renderAnswer(f.a)}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function FaqPage() {
  const [tab, setTab] = useState<"web" | "desktop">("web");
  const items = tab === "web" ? WEBSITE_FAQ_ENTRIES : DESKTOP_FAQ_ENTRIES;

  return (
    <section className="max-w-3xl mx-auto px-4 py-12 pb-24">
      <JsonLd
        data={faqPageJsonLd(
          ALL_FAQ_SCHEMA_ENTRIES.map((e) => ({ question: e.q, answer: e.a })),
        )}
      />
      <header className="text-center mb-10">
        <h1 className="font-display text-3xl sm:text-5xl font-bold neon-text">
          Sinhala typing FAQ
        </h1>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
          Singlish to Sinhala Unicode, FM Abhaya legacy fonts, Adobe workflows, and SinType Desktop.
        </p>
      </header>

      <div className="flex justify-center gap-2 mb-6">
        {(
          [
            ["web", "Web converter"],
            ["desktop", "Desktop app"],
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

      <FaqAccordion items={items} />
    </section>
  );
}
