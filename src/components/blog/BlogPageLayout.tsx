import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { BlogPostMeta } from "@/lib/blog-posts";

type BlogPageLayoutProps = {
  post?: BlogPostMeta;
  children: ReactNode;
};

export function BlogPageLayout({ post, children }: BlogPageLayoutProps) {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 pb-28">
      <nav className="text-xs text-muted-foreground mb-6 flex flex-wrap gap-x-3 gap-y-1">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <span aria-hidden>·</span>
        <Link to="/blog" className="hover:text-foreground">
          Blog
        </Link>
        {post && (
          <>
            <span aria-hidden>·</span>
            <span className="text-foreground/80 line-clamp-1">{post.title}</span>
          </>
        )}
      </nav>

      {post ? (
        <header className="mb-10">
          <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--neon-cyan)] font-semibold">
            SinType.lk Blog
          </p>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.5rem] font-bold mt-2 leading-tight text-foreground">
            {post.title}
          </h1>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed">
            {post.subtitle}
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <time dateTime={post.publishedAt}>
              Published {post.publishedAt}
            </time>
            <span aria-hidden>·</span>
            <span>{post.readMinutes} min read</span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full border border-white/10 bg-card/40 text-[10px] uppercase tracking-wide"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>
      ) : (
        <header className="mb-10">
          <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--neon-cyan)] font-semibold">
            SinType.lk Blog
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2 neon-text">
            Sinhala typing &amp; Unicode guides
          </h1>
          <p className="mt-3 text-muted-foreground text-base sm:text-lg max-w-2xl">
            In-depth articles for developers, designers, and publishers in Sri Lanka —
            optimized for search engines and human readers.
          </p>
        </header>
      )}

      <div
        className="blog-prose rounded-3xl border border-white/10 p-6 sm:p-10 space-y-8 text-muted-foreground leading-relaxed"
        style={{
          background: "color-mix(in oklab, var(--card) 88%, transparent)",
          backdropFilter: "blur(16px)",
        }}
      >
        {children}
      </div>

      <footer className="mt-10 flex flex-wrap gap-4 text-sm">
        <Link to="/" className="text-[var(--neon-cyan)] hover:underline">
          Try the converter
        </Link>
        <Link to="/download" className="text-[var(--neon-cyan)] hover:underline">
          Download desktop app
        </Link>
        <Link to="/blog" className="text-[var(--neon-cyan)] hover:underline">
          All articles
        </Link>
      </footer>
    </article>
  );
}

export function BlogSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-xl sm:text-2xl text-foreground mb-3">{title}</h2>
      <div className="space-y-3 text-sm sm:text-base">{children}</div>
    </section>
  );
}

export function BlogTable({
  caption,
  headers,
  rows,
}: {
  caption?: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <figure className="overflow-x-auto my-4">
      <table className="w-full text-left text-xs sm:text-sm border-collapse">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-white/15">
            {headers.map((h) => (
              <th key={h} className="py-2 pr-3 font-semibold text-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-white/5">
              {row.map((cell, j) => (
                <td key={j} className="py-2 pr-3 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
