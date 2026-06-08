import { createFileRoute, Link } from "@tanstack/react-router";
import { Github, Mail, MessageSquare } from "lucide-react";
import { BreadcrumbNav } from "@/components/seo/BreadcrumbNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { WhatsAppContactButton } from "@/components/WhatsAppContactButton";
import { breadcrumbJsonLd, pageHead } from "@/lib/site-seo";

export const Route = createFileRoute("/contact")({
  head: () =>
    pageHead({
      title: "Contact SinType.lk | Support & Partnerships",
      description:
        "Contact the SinType team for Sinhala typing support, v2.0 Beta bug reports, partnerships, or media inquiries. WhatsApp, email, and feedback.",
      path: "/contact",
      keywords: "contact sintype, sinhala typing support, sintype.lk help, whatsapp support",
    }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12 pb-24">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <BreadcrumbNav items={[{ label: "Contact" }]} />
      <h1 className="font-display text-4xl neon-text mb-2">Contact Support</h1>
      <p className="text-muted-foreground mb-8 max-w-xl leading-relaxed">
        Found a bug in the v2.0 Beta, need help with mobile remote setup, or want to suggest a
        feature? Reach out — we read every message.
      </p>

      <section aria-labelledby="contact-channels" className="space-y-4">
        <h2 id="contact-channels" className="sr-only">
          Contact channels
        </h2>

        <WhatsAppContactButton variant="card" />

        <div className="grid gap-4 sm:grid-cols-2">
          <a
            href="mailto:hello@sintype.lk"
            className="neon-border p-5 flex items-center gap-3 hover:border-[var(--neon-cyan)]/40 transition-colors"
          >
            <Mail className="w-5 h-5 text-[var(--neon-cyan)] shrink-0" />
            <div>
              <p className="font-semibold">Email</p>
              <p className="text-sm text-muted-foreground">hello@sintype.lk</p>
            </div>
          </a>
          <Link
            to="/feedback"
            className="neon-border p-5 flex items-center gap-3 hover:border-[var(--neon-purple)]/40 transition-colors"
          >
            <MessageSquare className="w-5 h-5 text-[var(--neon-purple)] shrink-0" />
            <div>
              <p className="font-semibold">Feedback &amp; bugs</p>
              <p className="text-sm text-muted-foreground">In-app or web form</p>
            </div>
          </Link>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="neon-border p-5 flex items-center gap-3 sm:col-span-2 hover:border-white/20 transition-colors"
          >
            <Github className="w-5 h-5 text-foreground shrink-0" />
            <div>
              <p className="font-semibold">GitHub</p>
              <p className="text-sm text-muted-foreground">
                Open issues for bugs and feature requests (v2.0 Beta welcome)
              </p>
            </div>
          </a>
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-white/10 bg-card/30 p-6">
        <h2 className="font-display text-lg text-foreground mb-2">Beta support tips</h2>
        <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
          <li>Include your SinType version (e.g. v2.0.0 Beta) and Windows version.</li>
          <li>For mobile remote issues, note whether PC and phone are on the same Wi-Fi.</li>
          <li>Screenshots or screen recordings help us reproduce crashes faster.</li>
        </ul>
      </section>
    </article>
  );
}
