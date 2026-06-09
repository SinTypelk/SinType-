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
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { fetchVisibleFeatures, type KeyFeature } from "@/lib/app-content-service";
import { V2_FEATURES } from "@/lib/v2-showcase";

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
  const [homeFeatures, setHomeFeatures] = useState<KeyFeature[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState(true);

  useEffect(() => {
    const loadFeatures = async () => {
      try {
        setLoadingFeatures(true);
        const features = await fetchVisibleFeatures("home");
        setHomeFeatures(features);
      } catch (err) {
        console.error("Failed to load home features:", err);
      } finally {
        setLoadingFeatures(false);
      }
    };
    loadFeatures();
  }, []);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }])} />
      <HeroDownloadCta />
      <div className="max-w-6xl mx-auto px-4 py-10">
        {loadingFeatures ? (
          <div className="flex items-center gap-2 text-muted-foreground py-8">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading features…
          </div>
        ) : (
          <V2FeaturesGrid
            title="SinType 2.0 — mobile meets desktop"
            subtitle="The new local web server turns your phone into a wireless remote for your PC. Typing, touchpad control, and file transfer — without leaving your home network."
            features={homeFeatures.length > 0 ? homeFeatures : undefined}
          />
        )}
      </div>
      <div className="max-w-7xl mx-auto px-4 pb-2">
        <AccountPanel compact />
      </div>
      <Converter />
      <HomeSeoSection />
      {/* Internal Navigation Link 1: Learn About SinType */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-12 text-center">
        <p className="text-muted-foreground mb-4">Want to know more about SinType?</p>
        <a
          href="/about"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-cyan-400/30 text-cyan-400 hover:border-cyan-400/60 hover:bg-cyan-400/5 transition-all duration-300 font-medium text-sm"
        >
          Learn About SinType
          <span className="text-lg">→</span>
        </a>
      </div>
    </>
  );
}
