import { createFileRoute } from "@tanstack/react-router";
import { NotFoundPage } from "@/components/NotFoundPage";
import { notFoundPageHead } from "@/lib/site-seo";

/** Catch-all for unknown URLs — noindex head + helpful internal links. */
export const Route = createFileRoute("/$")({
  head: () => notFoundPageHead(),
  component: NotFoundPage,
});
