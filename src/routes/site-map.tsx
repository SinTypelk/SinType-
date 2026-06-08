import { createFileRoute, Link } from "@tanstack/react-router";
import { BreadcrumbNav } from "@/components/seo/BreadcrumbNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { BLOG_POSTS } from "@/lib/blog-posts";
import {
  breadcrumbJsonLd,
  HTML_SITEMAP_SECTIONS,
  pageHead,
  SITE_URL,
} from "@/lib/site-seo";

export const Route = createFileRoute("/site-map")({
  head: () =>
    pageHead({
      title: "Site Map | All SinType.lk Pages — Sinhala Unicode Converter",
      description:
        "HTML site map of SinType.lk — converter, Singlish to Sinhala, download, FAQ, blog, " +
        "and legal pages. Helps visitors and search engines discover our content.",
      path: "/site-map",
      keywords:
        "sintype site map, sinhala unicode pages, singlish converter links, sitemap",
    }),
  component: SiteMapPage,
});

function SiteMapPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 pb-24">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Site map", path: "/site-map" },
        ])}
      />
      <BreadcrumbNav items={[{ label: "Site map" }]} />

      <header className="mb-10">
        <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--neon-cyan)] font-semibold">
          SinType.lk
        </p>
        <h1 className="font-display text-4xl font-bold mt-2 text-foreground">Site map</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          All public pages on SinType.lk with descriptive URLs. For crawlers, we also publish{" "}
          <a
            href={`${SITE_URL}/sitemap.xml`}
            className="text-[var(--neon-cyan)] hover:underline"
          >
            sitemap.xml
          </a>
          .
        </p>
      </header>

      <div className="space-y-10">
        {HTML_SITEMAP_SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-lg text-foreground mb-3">{section.title}</h2>
            <ul className="space-y-2 list-none p-0 m-0">
              {section.links.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-[var(--neon-cyan)] hover:underline text-sm sm:text-base"
                  >
                    {link.label}
                  </Link>
                  <span className="text-muted-foreground text-xs ml-2">{link.path}</span>
                  {link.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 ml-0">
                      {link.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section>
          <h2 className="font-display text-lg text-foreground mb-3">Blog articles</h2>
          <ul className="space-y-2 list-none p-0 m-0">
            {BLOG_POSTS.map((post) => (
              <li key={post.slug}>
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="text-[var(--neon-cyan)] hover:underline text-sm sm:text-base"
                >
                  {post.title}
                </Link>
                <span className="text-muted-foreground text-xs ml-2">
                  /blog/{post.slug}
                </span>
              </li>
            ))}
            <li>
              <Link to="/blog" className="text-[var(--neon-cyan)] hover:underline text-sm">
                All blog posts
              </Link>
              <span className="text-muted-foreground text-xs ml-2">/blog</span>
            </li>
          </ul>
        </section>
      </div>
    </article>
  );
}
