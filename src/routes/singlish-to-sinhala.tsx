import { createFileRoute } from "@tanstack/react-router";
import { Converter } from "@/components/Converter";
import { AccountPanel } from "@/components/AccountPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoLandingIntro } from "@/components/seo/SeoLandingIntro";
import { KEYWORDS_SINGLISH_LANDING } from "@/lib/seo-keywords";
import { breadcrumbJsonLd, pageHead, SITE_URL, webApplicationJsonLd } from "@/lib/site-seo";

export const Route = createFileRoute("/singlish-to-sinhala")({
  head: () =>
    pageHead({
      title: "Singlish to Sinhala | Free Unicode & FM Typing — SinType.lk",
      description:
        "Type Singlish and get Sinhala Unicode or Legacy FM Abhaya instantly. " +
        "Free online Singlish to Sinhala converter for students, creators, and professionals in Sri Lanka.",
      path: "/singlish-to-sinhala",
      keywords: KEYWORDS_SINGLISH_LANDING,
    }),
  component: SinglishLandingPage,
});

function SinglishLandingPage() {
  const app = webApplicationJsonLd();
  return (
    <>
      <JsonLd
        data={[
          { ...app, url: `${SITE_URL}/singlish-to-sinhala`, name: "Singlish to Sinhala — SinType" },
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Singlish to Sinhala", path: "/singlish-to-sinhala" },
          ]),
        ]}
      />
      <SeoLandingIntro
        eyebrow="Singlish to Sinhala"
        title="Singlish to Sinhala — phonetic typing made simple"
        description="Write the way you speak: Latin letters map to Sinhala sounds in real time. Copy Unicode for Facebook, YouTube, and Google Docs, or switch to Legacy FM Abhaya for print and design workflows."
      />
      <div className="max-w-7xl mx-auto px-4 pb-2">
        <AccountPanel compact />
      </div>
      <Converter />
    </>
  );
}
