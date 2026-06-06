import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BlogPageLayout } from "@/components/blog/BlogPageLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { BLOG_ARTICLE_COMPONENTS } from "@/content/blog/article-registry";
import { fetchBlogPostBySlug } from "@/lib/content-service";
import { findMergedPost } from "@/lib/blog-merge";
import { breadcrumbJsonLd, pageHead, SITE_URL } from "@/lib/site-seo";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const dbPost = await fetchBlogPostBySlug(params.slug).catch(() => null);
    const post = findMergedPost(params.slug, dbPost);
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData }) => {
    const post = loaderData;
    return pageHead({
      title: `${post.title} — SinType.lk Blog`,
      description: post.excerpt,
      path: `/blog/${post.slug}`,
      keywords: post.keywords,
      ogType: "article",
    });
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const post = Route.useLoaderData();
  const Article = post.source === "static" ? BLOG_ARTICLE_COMPONENTS[post.slug] : null;
  const url = `${SITE_URL}/blog/${post.slug}`;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            author: {
              "@type": "Organization",
              name: "SinType.lk",
              url: SITE_URL,
            },
            publisher: {
              "@type": "Organization",
              name: "SinType.lk",
              url: SITE_URL,
            },
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            url,
            inLanguage: ["en-LK", "si"],
            keywords: post.tags.join(", "),
          },
        ]}
      />
      <BlogPageLayout post={post}>
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt=""
            className="mb-6 w-full max-h-80 rounded-2xl object-cover"
          />
        ) : null}
        {post.source === "database" && post.body ? (
          <div
            className="prose prose-invert max-w-none space-y-4 text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
        ) : Article ? (
          <Article />
        ) : (
          <>
            <p>Article content is not available.</p>
            <Link to="/blog" className="text-[var(--neon-cyan)] hover:underline">
              ← Back to blog
            </Link>
          </>
        )}
      </BlogPageLayout>
    </>
  );
}
