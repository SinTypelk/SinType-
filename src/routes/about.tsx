import { createFileRoute, Link } from "@tanstack/react-router";
import { JsonLd } from "@/components/seo/JsonLd";
import { BreadcrumbNav } from "@/components/seo/BreadcrumbNav";
import { fetchAboutContent } from "@/lib/content-service";
import { breadcrumbJsonLd, pageHead } from "@/lib/site-seo";

const DEFAULT_PARAGRAPHS = [
  "SinType began as a Singlish typing tool — a free web converter and a Windows app for system-wide Sinhala input. With version 2.0, we are evolving into a full typing ecosystem that connects your phone and PC over your own local network.",
  "The SinType Desktop app now runs a built-in Local Web Server on your PC. Pair your smartphone via QR code to use it as a wireless touchpad, keyboard, and file-transfer remote. Keystrokes, cursor movement, and file sync stay on your private LAN (Wi-Fi) — not on external cloud servers.",
  "At the core is still the same trusted Singlish engine: Unicode for modern apps and Legacy FM Abhaya for print and design workflows. Use the web converter in your browser, or install SinType Desktop for Adobe Creative Cloud, Office, browsers, chat apps, and mobile remote control.",
];

const DEFAULT_FONT_ROWS = [
  ["Legacy display", "FM Abhaya", "Newspapers, books, government print"],
  ["Legacy headline", "FM Gemunu", "Banners, TV chyrons, posters"],
  ["Unicode standard", "Noto Sans Sinhala", "Web UI, mobile apps"],
  ["Unicode editorial", "Abhaya Libre", "Digital books, responsive web"],
] as const;

export const Route = createFileRoute("/about")({
  loader: async () => fetchAboutContent().catch(() => null),
  head: () =>
    pageHead({
      title: "About SinType | Sinhala Unicode & Legacy FM Typing — SinType.lk",
      description:
        "SinType is a Sinhala typing ecosystem — web converter, Windows desktop app, and local web server for mobile-to-PC sync. Built for Sri Lankan creators, DTP, and everyday typing.",
      path: "/about",
      keywords:
        "about sintype, sinhala unicode legacy, fm abhaya, sinhala typing sri lanka, wijesekera singlish",
    }),
  component: AboutPage,
});

function AboutPage() {
  const stored = Route.useLoaderData();
  const paragraphs =
    stored?.paragraphs?.length ? stored.paragraphs : [...DEFAULT_PARAGRAPHS];
  const fontRows =
    stored?.fontRows?.length ? stored.fontRows : [...DEFAULT_FONT_ROWS];

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 pb-24">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <BreadcrumbNav items={[{ label: "About" }]} />
      <h1 className="font-display text-4xl neon-text mb-2">About SinType</h1>
      <p className="text-sm text-[var(--neon-cyan)] font-medium mb-6 uppercase tracking-[0.2em]">
        From typing tool to ecosystem
      </p>
      <div
        className="space-y-4 text-muted-foreground leading-relaxed rounded-3xl border border-white/10 p-6 sm:p-8"
        style={{
          background: "color-mix(in oklab, var(--card) 85%, transparent)",
          backdropFilter: "blur(18px)",
        }}
      >
        {paragraphs.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
        {!stored?.paragraphs?.length ? (
          <p>
            Use our free{" "}
            <Link to="/sinhala-unicode-converter" className="text-[var(--neon-cyan)] hover:underline">
              Sinhala Unicode converter
            </Link>{" "}
            in the browser, or install{" "}
            <Link to="/download" className="text-[var(--neon-cyan)] hover:underline">
              SinType Desktop
            </Link>{" "}
            for system-wide typing in Adobe Creative Cloud, Office, browsers, and chat apps.
          </p>
        ) : null}

        <h2 className="font-display text-xl text-foreground pt-4">
          Sinhala fonts in Sri Lankan design
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-foreground border-b border-white/10">
                <th className="py-2 pr-3">Category</th>
                <th className="py-2 pr-3">Font</th>
                <th className="py-2">Typical use</th>
              </tr>
            </thead>
            <tbody>
              {fontRows.map((row) => (
                <tr key={row[1]} className="border-b border-white/5">
                  <td className="py-2 pr-3">{row[0]}</td>
                  <td className="py-2 pr-3 font-medium text-foreground">{row[1]}</td>
                  <td className="py-2">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </article>
  );
}
