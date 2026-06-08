import { createFileRoute, Link } from "@tanstack/react-router";
import { BlogPageLayout } from "@/components/blog/BlogPageLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { fetchPublishedBlogPosts } from "@/lib/content-service";
import { mergeBlogPosts } from "@/lib/blog-merge";
import { breadcrumbJsonLd, pageHead, SITE_URL } from "@/lib/site-seo";

export const Route = createFileRoute("/blog/")({
  loader: async () => {
    const dbPosts = await fetchPublishedBlogPosts().catch(() => []);
    return mergeBlogPosts(dbPosts);
  },
  head: () =>
    pageHead({
      title: "Blog | Sinhala Unicode, Legacy Fonts & SEO — SinType.lk",
      description:
        "Technical articles on Sinhala Unicode, FM Abhaya legacy fonts, Singlish typing, " +
        "Google Search Console, and real-time conversion for Sri Lankan publishers.",
      path: "/blog",
      keywords:
        "sinhala unicode blog, fm abhaya guide, sinhala seo, legacy font converter, " +
        "sintype blog, singlish unicode sri lanka",
    }),
  component: BlogIndexPage,
});

function BlogIndexPage() {
  const posts = Route.useLoaderData();

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "SinType.lk Blog",
            url: `${SITE_URL}/blog`,
            description:
              "Guides on Sinhala Unicode, legacy fonts, and search-friendly typing for Sri Lanka.",
            publisher: {
              "@type": "Organization",
              name: "SinType.lk",
              url: SITE_URL,
            },
            blogPost: posts.map((p) => ({
              "@type": "BlogPosting",
              headline: p.title,
              url: `${SITE_URL}/blog/${p.slug}`,
              datePublished: p.publishedAt,
              dateModified: p.updatedAt,
            })),
          },
        ]}
      />
      <BlogPageLayout>
        <ul className="space-y-6 list-none p-0 m-0">
          {posts.map((post) => (
            <li key={post.slug}>
              <article className="rounded-2xl border border-white/10 p-5 sm:p-6 bg-card/30 hover:border-[var(--neon-cyan)]/30 transition-colors">
                {post.imageUrl ? (
                  <img
                    src={post.imageUrl}
                    alt=""
                    className="mb-4 h-40 w-full rounded-xl object-cover"
                    loading="lazy"
                  />
                ) : null}
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                  {post.publishedAt} · {post.readMinutes} min read
                </p>
                <h2 className="font-display text-xl sm:text-2xl text-foreground">
                  <Link
                    to="/blog/$slug"
                    params={{ slug: post.slug }}
                    className="hover:text-[var(--neon-cyan)] transition-colors"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-2 text-sm sm:text-base">{post.excerpt}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="inline-block mt-4 text-sm font-semibold text-[var(--neon-cyan)] hover:underline"
                >
                  Read article →
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </BlogPageLayout>
    </>
  );
}
