import { createFileRoute, Link } from "@tanstack/react-router";
import { JsonLd } from "@/components/seo/JsonLd";
import { BreadcrumbNav } from "@/components/seo/BreadcrumbNav";
import { fetchAboutContent } from "@/lib/content-service";
import { breadcrumbJsonLd, pageHead } from "@/lib/site-seo";

const DEFAULT_PARAGRAPHS = [
  {
    heading: "Our Mission",
    text: "SinType exists for one reason: to make Sinhala typing effortless for every Sri Lankan on Windows. Whether you're writing an email, designing a poster, creating content for social media, or building software — SinType should work everywhere. In Word, Photoshop, WhatsApp, Discord, your browser, or any application on your PC. We built SinType especially for Sri Lankan designers, developers, and content creators who deserve local software that actually works.",
  },
  {
    heading: "Free Forever",
    text: "SinType will always remain completely free to use. There is no paid tier, no premium version planned, and no features locked behind a paywall. Every user gets every feature equally. This is a promise, not a marketing claim. Your access to Sinhala typing will never depend on your wallet.",
  },
  {
    heading: "How We Keep It Free",
    text: "We believe in transparency. Small, non-intrusive ads will be introduced in the future — solely to cover server costs and continued development. This is not about profit. It's about keeping the lights on so we can keep improving SinType for you. If you see ads, they're there so we can afford to build and maintain this tool without selling your data or limiting what you can do.",
  },
  {
    heading: "About That License Key",
    text: "Your license key isn't a restriction tool. It's a simple way for us to notify you about updates, new versions, and improvements — and to ensure you always have the latest, most stable experience. Keys are free to generate and renew monthly. They just help us know who's using SinType so we can keep you informed about what's new.",
  },
  {
    heading: "Built by Sri Lankans, for Sri Lankans",
    text: "SinType was built by an 18-year-old Sri Lankan A/L student who believes we deserve better local software. What started as a passionate side project has grown into a real tool used by hundreds of Sinhala-speaking users. We're not a big company. We're a small team driven by the belief that technology should serve our community, not the other way around.",
  },
  {
    heading: "Join Our Community",
    text: "SinType is still young, and we're still learning. Your feedback, suggestions, and support make a real difference. Whether you're a designer, developer, student, or just someone who wants to type Sinhala effortlessly — you're part of what makes this possible. Visit sintype.lk to download, share, and contribute to building the future of Sinhala typing on Windows.",
  },
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
        Built by Sri Lankans, for Sri Lankans
      </p>
      <div
        className="space-y-8 text-muted-foreground leading-relaxed rounded-3xl border border-white/10 p-6 sm:p-8"
        style={{
          background: "color-mix(in oklab, var(--card) 85%, transparent)",
          backdropFilter: "blur(18px)",
        }}
      >
        {paragraphs.map((para, i) => (
          <div key={i}>
            {typeof para === "string" ? (
              <p>{para}</p>
            ) : (
              <>
                <h2 className="font-display text-xl text-foreground mb-3">
                  {para.heading}
                </h2>
                <p>{para.text}</p>
              </>
            )}
          </div>
        ))}
        {!stored?.paragraphs?.length ? (
          <div className="pt-4 border-t border-white/10 mt-8">
            <p>
              Get started with our free{" "}
              <Link to="/sinhala-unicode-converter" className="text-[var(--neon-cyan)] hover:underline">
                Sinhala Unicode converter
              </Link>{" "}
              in the browser, or install{" "}
              <Link to="/download" className="text-[var(--neon-cyan)] hover:underline">
                SinType Desktop
              </Link>{" "}
              for system-wide typing in Adobe Creative Cloud, Office, browsers, and chat apps.
            </p>
          </div>
        ) : null}

        <h2 className="font-display text-xl text-foreground pt-4 border-t border-white/10 mt-8">
          Sinhala Fonts in Sri Lankan Design
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
