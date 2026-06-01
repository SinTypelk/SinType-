import { createFileRoute, Link } from "@tanstack/react-router";
import { SupportMessagesPanel } from "@/components/SupportMessagesPanel";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Messages & Updates · SinType.lk" },
      {
        name: "description",
        content:
          "Official announcements, product updates, and personal messages from the SinType team.",
      },
    ],
    links: [{ rel: "canonical", href: "/messages" }],
  }),
  component: MessagesPage,
});

function MessagesPage() {
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
        <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--neon-cyan)] font-semibold">
          Support
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2">Messages &amp; updates</h1>
        <p className="mt-3 text-muted-foreground text-base max-w-2xl leading-relaxed">
          Product news, release notes, and account-specific notices from SinType.lk. This is the
          same inbox that was previously easy to miss at the bottom of every page — now in one
          dedicated place.
        </p>
      </header>

      <div
        className="rounded-3xl border border-white/10 p-6 sm:p-8"
        style={{
          background: "color-mix(in oklab, var(--card) 88%, transparent)",
          backdropFilter: "blur(16px)",
        }}
      >
        <SupportMessagesPanel />
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        Have a bug or idea?{" "}
        <Link to="/feedback" className="text-[var(--neon-cyan)] hover:underline">
          Send feedback
        </Link>
        .
      </p>
    </section>
  );
}
