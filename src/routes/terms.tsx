import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPageLayout, LegalSection } from "@/components/layout/LegalPageLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service · SinType.lk" },
      {
        name: "description",
        content:
          "Terms governing use of SinType.lk web converter, Windows desktop app, licenses, and support services.",
      },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      subtitle="By using SinType.lk or the SinType desktop application, you agree to these terms. Please read them together with our Privacy Policy."
    >
      <LegalSection title="1. Acceptance">
        <p>
          These Terms of Service (&quot;Terms&quot;) apply to sintype.lk, related pages (download,
          license, messages, feedback), and the SinType Windows software. If you do not agree, do not
          use the service.
        </p>
      </LegalSection>

      <LegalSection title="2. Description of service">
        <p>
          SinType provides Singlish-to-Sinhala transliteration for Unicode and Legacy FM fonts. The
          web tool runs in your browser; the desktop app runs locally on Windows. Some features
          (activation keys, mobile sync, announcements) require an account and internet access.
        </p>
      </LegalSection>

      <LegalSection title="3. Accounts and licenses">
        <ul className="list-disc pl-5 space-y-2">
          <li>You are responsible for keeping your sign-in credentials secure.</li>
          <li>
            Activation keys are personal entitlements. Sharing keys to circumvent limits may result
            in revocation.
          </li>
          <li>
            Licenses may expire or be revoked for abuse, fraud, or violation of these Terms. See
            your license page for expiry dates.
          </li>
          <li>
            One machine ID may be bound per active license unless we explicitly allow otherwise.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Use SinType to create or distribute unlawful, harassing, or malicious content.</li>
          <li>Attempt to break, scrape, or overload our infrastructure or Supabase APIs.</li>
          <li>Reverse engineer the service to misrepresent authorship or bypass license checks.</li>
          <li>Resell or redistribute the desktop installer as your own product without permission.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Your content">
        <p>
          You retain ownership of text you type. Converted output is yours to use for personal,
          educational, or commercial purposes, subject to any third-party font or software licenses
          you apply separately (e.g. FM Legacy fonts on your system).
        </p>
        <p>
          By submitting feedback or reviews, you grant us a non-exclusive license to use that
          content to operate and improve SinType (including displaying moderated reviews).
        </p>
      </LegalSection>

      <LegalSection title="6. Disclaimer">
        <p>
          SinType is provided <strong className="text-foreground">&quot;as is&quot;</strong> and{" "}
          <strong className="text-foreground">&quot;as available&quot;</strong> without warranties of
          any kind, express or implied, including accuracy of transliteration, fitness for a
          particular purpose, or uninterrupted operation.
        </p>
        <p>
          Transliteration is algorithmic and may produce errors. Always proofread important documents.
          We are not liable for data loss, mistranscriptions, missed deadlines, or damages arising
          from use or inability to use the service.
        </p>
      </LegalSection>

      <LegalSection title="7. Limitation of liability">
        <p>
          To the maximum extent permitted by law, SinType.lk and its operators shall not be liable
          for indirect, incidental, special, or consequential damages, or for loss of profits or data,
          even if advised of the possibility. Our total liability for any claim relating to the
          service is limited to the amount you paid us in the twelve months before the claim (or zero
          if you used only the free tier).
        </p>
      </LegalSection>

      <LegalSection title="8. Updates and changes">
        <p>
          We may update the website, desktop app, or these Terms at any time. Material changes will
          be reflected on this page. Continued use after changes constitutes acceptance. For app
          updates, see the download page and in-app updater.
        </p>
      </LegalSection>

      <LegalSection title="9. Termination">
        <p>
          We may suspend or terminate access for conduct that violates these Terms or harms other
          users. You may stop using SinType at any time and uninstall the desktop app.
        </p>
      </LegalSection>

      <LegalSection title="10. Privacy">
        <p>
          Our{" "}
          <Link to="/privacy" className="text-[var(--neon-cyan)] hover:underline">
            Privacy Policy
          </Link>{" "}
          explains how we handle data, including typing, licenses, mobile sync, and support messages.
        </p>
      </LegalSection>

      <LegalSection title="11. Contact">
        <p>
          Support:{" "}
          <Link to="/feedback" className="text-[var(--neon-cyan)] hover:underline">
            Feedback
          </Link>
          ,{" "}
          <Link to="/contact" className="text-[var(--neon-cyan)] hover:underline">
            Contact
          </Link>
          , or{" "}
          <Link to="/messages" className="text-[var(--neon-cyan)] hover:underline">
            Messages &amp; updates
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
