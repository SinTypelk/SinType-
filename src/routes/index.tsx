import { createFileRoute } from "@tanstack/react-router";
import { Converter } from "@/components/Converter";
import { HeroDownloadCta } from "@/components/HeroDownloadCta";
import { AccountPanel } from "@/components/AccountPanel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sintype.lk — Singlish to Sinhala Converter" },
      {
        name: "description",
        content:
          "Type Singlish and get real-time Sinhala Unicode or Legacy FM font output. Download the desktop app, voice input, history, and mobile sync.",
      },
      { property: "og:title", content: "Sintype.lk — Singlish to Sinhala Converter" },
      {
        property: "og:description",
        content: "Type Singlish. Get Sinhala instantly. Unicode + Legacy FM. Download the desktop app.",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <HeroDownloadCta />
      <div className="max-w-7xl mx-auto px-4 pb-2">
        <AccountPanel compact />
      </div>
      <Converter />
    </>
  );
}
