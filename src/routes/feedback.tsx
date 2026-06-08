import { createFileRoute, Link } from "@tanstack/react-router";
import { SupportFeedbackForm } from "@/components/SupportFeedbackForm";
import { pageHead } from "@/lib/site-seo";

export const Route = createFileRoute("/feedback")({
  head: () =>
    pageHead({
      title: "Send Feedback · SinType.lk",
      description:
        "Report bugs or request features for SinType web converter and Windows desktop app.",
      path: "/feedback",
      noindex: true,
    }),
  component: FeedbackPage,
});

function FeedbackPage() {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-14 pb-28">
      <nav className="text-xs text-muted-foreground mb-6 flex flex-wrap gap-x-3 gap-y-1">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <span aria-hidden>·</span>
        <span className="text-foreground/80">Support</span>
      </nav>

      <header className="mb-10">
        <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--neon-purple)] font-semibold">
          Support
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2">Send feedback</h1>
        <p className="mt-3 text-muted-foreground text-base max-w-2xl leading-relaxed">
          Help us improve SinType. Bug reports and feature requests go to our team dashboard.
          Sign in optional — we can match your message to your license if you are logged in.
        </p>
      </header>

      <div
        className="rounded-3xl border border-white/10 p-6 sm:p-8"
        style={{
          background: "color-mix(in oklab, var(--card) 88%, transparent)",
          backdropFilter: "blur(16px)",
        }}
      >
        <SupportFeedbackForm />
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        Looking for announcements?{" "}
        <Link to="/messages" className="text-[var(--neon-cyan)] hover:underline">
          Messages &amp; updates
        </Link>
        .
      </p>
    </section>
  );
}
