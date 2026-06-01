import { createFileRoute } from "@tanstack/react-router";
import { Converter } from "@/components/Converter";
import { AccountPanel } from "@/components/AccountPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoLandingIntro } from "@/components/seo/SeoLandingIntro";
import { KEYWORDS_UNICODE_LANDING } from "@/lib/seo-keywords";
import { breadcrumbJsonLd, pageHead, SITE_URL, webApplicationJsonLd } from "@/lib/site-seo";

export const Route = createFileRoute("/sinhala-unicode-converter")({
  head: () =>
    pageHead({
      title: "Sinhala Unicode Converter | FM Abhaya & Legacy — SinType.lk",
      description:
        "Convert Singlish and legacy ASCII Sinhala strings to Sinhala Unicode online. " +
        "FM Abhaya legacy mode, Wijesekera-friendly output, and free Windows desktop typing.",
      path: "/sinhala-unicode-converter",
      keywords: KEYWORDS_UNICODE_LANDING,
    }),
  component: UnicodeLandingPage,
});

function UnicodeLandingPage() {
  const app = webApplicationJsonLd();
  return (
    <>
      <JsonLd
        data={[
          {
            ...app,
            url: `${SITE_URL}/sinhala-unicode-converter`,
            name: "Sinhala Unicode Converter — SinType",
          },
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Sinhala Unicode Converter", path: "/sinhala-unicode-converter" },
          ]),
        ]}
      />
      <SeoLandingIntro
        eyebrow="Sinhala Unicode"
        title="Sinhala Unicode converter for web and design"
        description="Sri Lanka uses both modern Unicode (U+0D80–U+0DFF) and legacy FM fonts. SinType converts phonetic input to Unicode instantly and offers Legacy FM Abhaya output for DTP, newspapers, and Adobe Creative Cloud workflows."
      />
      <div className="max-w-7xl mx-auto px-4 pb-2">
        <AccountPanel compact />
      </div>
      <Converter />
    </>
  );
}
