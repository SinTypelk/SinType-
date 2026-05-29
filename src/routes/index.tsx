import { createFileRoute } from "@tanstack/react-router";
import { Converter } from "@/components/Converter";
import { HeroDownloadCta } from "@/components/HeroDownloadCta";
import { AccountPanel } from "@/components/AccountPanel";
import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  canonicalLink,
  openGraphMeta,
} from "@/lib/site-seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: HOME_TITLE },
      { name: "description", content: HOME_DESCRIPTION },
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
      <HeroDownloadCta />
      <div className="max-w-7xl mx-auto px-4 pb-2">
        <AccountPanel compact />
      </div>
      <Converter />
    </>
  );
}
