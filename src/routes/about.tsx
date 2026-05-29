import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About · Sintype.lk" },
      {
        name: "description",
        content:
          "SinType bridges Unicode and Legacy Sinhala typing with a system-wide Singlish engine for web and Windows.",
      },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-display text-4xl neon-text mb-6">About SinType</h1>
      <div className="space-y-4 text-muted-foreground leading-relaxed rounded-3xl border border-white/10 p-6 sm:p-8"
        style={{
          background: "color-mix(in oklab, var(--card) 85%, transparent)",
          backdropFilter: "blur(18px)",
        }}
      >
        <p>
          Typing in Sinhala has historically been a fragmented and frustrating experience. Users are
          constantly forced to choose between Unicode (the modern standard for web and digital
          communication) and Legacy Singlish formats like FM Abhaya (the industry standard for
          graphic design, print, and professional media). This divide creates a massive bottleneck
          for creators and professionals in Sri Lanka, requiring tedious conversions and workflow
          disruptions.
        </p>
        <p>
          SinType was engineered to bridge this gap completely. By offering a robust, system-wide
          Singlish input engine, SinType allows users to type naturally on their keyboard while
          dynamically outputting flawless Sinhala text in both Unicode and Legacy formats. Whether
          you are drafting a document, chatting on social media, or designing in professional
          tools like Adobe Photoshop and Premiere Pro, SinType provides a seamless, ultra-fast,
          and elegant typing solution for the modern era.
        </p>
      </div>
    </article>
  );
}
