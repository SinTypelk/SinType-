import { createFileRoute, Link } from "@tanstack/react-router";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageHead } from "@/lib/site-seo";

export const Route = createFileRoute("/about")({
  head: () =>
    pageHead({
      title: "About SinType | Sinhala Unicode & Legacy FM Typing — SinType.lk",
      description:
        "SinType bridges Unicode and Legacy FM Sinhala fonts with a Singlish engine for web and Windows — built for Sri Lankan creators, DTP, and everyday typing.",
      path: "/about",
      keywords:
        "about sintype, sinhala unicode legacy, fm abhaya, sinhala typing sri lanka, wijesekera singlish",
    }),
  component: AboutPage,
});

const FONT_ROWS = [
  ["Legacy display", "FM Abhaya", "Newspapers, books, government print"],
  ["Legacy headline", "FM Gemunu", "Banners, TV chyrons, posters"],
  ["Unicode standard", "Noto Sans Sinhala", "Web UI, mobile apps"],
  ["Unicode editorial", "Abhaya Libre", "Digital books, responsive web"],
] as const;

function AboutPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12 pb-24">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <h1 className="font-display text-4xl neon-text mb-6">About SinType</h1>
      <div
        className="space-y-4 text-muted-foreground leading-relaxed rounded-3xl border border-white/10 p-6 sm:p-8"
        style={{
          background: "color-mix(in oklab, var(--card) 85%, transparent)",
          backdropFilter: "blur(18px)",
        }}
      >
        <p>
          Typing in Sinhala has historically been split between{" "}
          <strong className="text-foreground">Unicode</strong> (modern web and apps) and{" "}
          <strong className="text-foreground">Legacy FM fonts</strong> such as FM Abhaya (print,
          graphic design, and professional media). SinType removes that friction with one{" "}
          <strong className="text-foreground">Singlish to Sinhala</strong> engine for both outputs.
        </p>
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
              {FONT_ROWS.map(([cat, font, use]) => (
                <tr key={font} className="border-b border-white/5">
                  <td className="py-2 pr-3">{cat}</td>
                  <td className="py-2 pr-3 font-medium text-foreground">{font}</td>
                  <td className="py-2">{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </article>
  );
}
