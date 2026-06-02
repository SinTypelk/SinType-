import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BlogPageLayout } from "@/components/blog/BlogPageLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { BLOG_ARTICLE_COMPONENTS } from "@/content/blog/article-registry";
import { getBlogPost } from "@/lib/blog-posts";
import { breadcrumbJsonLd, pageHead, SITE_URL } from "@/lib/site-seo";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getBlogPost(params.slug);
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
  const Article = BLOG_ARTICLE_COMPONENTS[post.slug];
  if (!Article) {
    return (
      <BlogPageLayout post={post}>
        <p>Article content is not available.</p>
        <Link to="/blog" className="text-[var(--neon-cyan)] hover:underline">
          ← Back to blog
        </Link>
      </BlogPageLayout>
    );
  }

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
            about: [
              "Sinhala Unicode",
              "Legacy FM Abhaya fonts",
              "Search engine optimization",
              "Singlish transliteration",
            ],
          },
        ]}
      />
      <BlogPageLayout post={post}>
        <Article />
      </BlogPageLayout>
    </>
  );
}
