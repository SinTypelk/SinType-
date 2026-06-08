import { createFileRoute } from "@tanstack/react-router";
import { Converter } from "@/components/Converter";
import { HeroDownloadCta } from "@/components/HeroDownloadCta";
import { V2FeaturesGrid } from "@/components/v2/V2FeaturesGrid";
import { AccountPanel } from "@/components/AccountPanel";
import { HomeSeoSection } from "@/components/seo/HomeSeoSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { KEYWORDS_HOME } from "@/lib/seo-keywords";
import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  breadcrumbJsonLd,
  canonicalLink,
  openGraphMeta,
} from "@/lib/site-seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: HOME_TITLE },
      { name: "description", content: HOME_DESCRIPTION },
      { name: "keywords", content: KEYWORDS_HOME },
      ...openGraphMeta({
        title: HOME_TITLE,
        description: HOME_DESCRIPTION,
        path: "/",
      }),
    ],
    links: [canonicalLink("/")],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }])} />
      <HeroDownloadCta />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <V2FeaturesGrid
          title="SinType 2.0 Beta — mobile meets desktop"
          subtitle="The new local web server turns your phone into a wireless remote for your PC. Typing, touchpad control, and file transfer — without leaving your home network."
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 pb-2">
        <AccountPanel compact />
      </div>
      <Converter />
      <HomeSeoSection />
    </>
  );
}
