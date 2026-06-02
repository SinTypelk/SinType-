import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPageLayout, LegalSection } from "@/components/layout/LegalPageLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageHead } from "@/lib/site-seo";

export const Route = createFileRoute("/privacy")({
  head: () =>
    pageHead({
      title: "Privacy Policy · SinType.lk",
      description:
        "How SinType.lk and the SinType Windows app collect, store, and use your data — typing, licenses, mobile sync, and support.",
      path: "/privacy",
    }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Privacy Policy", path: "/privacy" },
        ])}
      />
      <LegalPageLayout
        title="Privacy Policy"
        breadcrumbLabel="Privacy Policy"
        subtitle="This policy explains how SinType works, what data we process, where it is stored, and what choices you have. SinType is designed so that everyday typing stays on your device."
      >
      <LegalSection title="1. Who we are">
        <p>
          SinType.lk (&quot;SinType&quot;, &quot;we&quot;, &quot;us&quot;) provides a free web Singlish →
          Sinhala converter and a Windows desktop app for system-wide typing. Our website and apps
          are operated from Sri Lanka and served globally via Cloudflare and Supabase.
        </p>
        <p>
          Questions about this policy: use the{" "}
          <Link to="/contact" className="text-[var(--neon-cyan)] hover:underline">
            Contact
          </Link>{" "}
          page or send feedback at{" "}
          <Link to="/feedback" className="text-[var(--neon-cyan)] hover:underline">
            /feedback
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. How the SinType system works">
        <p>
          <strong className="text-foreground">Web converter.</strong> When you type on
          sintype.lk, conversion runs in your browser (JavaScript/WASM-style engine). We do not
          upload your draft text to our servers for normal conversion. History (recent entries) and
          UI preferences are saved in your browser&apos;s <code>localStorage</code> only.
        </p>
        <p>
          <strong className="text-foreground">Windows desktop app.</strong> The desktop app
          intercepts keystrokes locally, converts Singlish to Sinhala on your PC, and injects the
          result into the active application. Conversion does not require an internet connection.
          Settings (mode, hotkeys, beep, autostart, etc.) are stored under your Windows user profile
          (typically <code>%AppData%\SinType</code>).
        </p>
        <p>
          <strong className="text-foreground">Account &amp; license backend.</strong> Sign-in,
          activation keys, notifications, feedback, release metadata, and optional mobile sync use
          Supabase (hosted PostgreSQL + Auth + Realtime). Only the data described below is sent to
          Supabase when you use those features.
        </p>
        <p>
          <strong className="text-foreground">Mobile sync (optional).</strong> If you sign in and
          pair a phone via QR, Latin/Sinhala text can be exchanged through a private session row in
          the <code>mobile_sync_state</code> table so your phone and desktop stay in sync. You
          choose when to use this; the main converter works without it.
        </p>
      </LegalSection>

      <LegalSection title="3. Data we collect and why">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-foreground border-b border-white/10">
              <th className="py-2 pr-3">Data</th>
              <th className="py-2 pr-3">Where</th>
              <th className="py-2">Purpose</th>
            </tr>
          </thead>
          <tbody className="align-top">
            <tr className="border-b border-white/5">
              <td className="py-3 pr-3">Text you type (web)</td>
              <td className="py-3 pr-3">Your browser only</td>
              <td className="py-3">Conversion &amp; local history — not sent for normal use</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-3 pr-3">Text you type (desktop)</td>
              <td className="py-3 pr-3">Your PC only</td>
              <td className="py-3">Real-time conversion — not logged on our servers</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-3 pr-3">Email, user ID</td>
              <td className="py-3 pr-3">Supabase Auth</td>
              <td className="py-3">Sign-in, license account, personal notifications</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-3 pr-3">License key, expiry, status</td>
              <td className="py-3 pr-3">Supabase <code>licenses</code> / <code>profiles</code></td>
              <td className="py-3">Activation and entitlement for desktop features</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-3 pr-3">Machine ID</td>
              <td className="py-3 pr-3">Device + Supabase (when activated)</td>
              <td className="py-3">
                Binds a license to one computer; generated locally (hardware-derived hash on
                desktop, random UUID in browser for anonymous feedback)
              </td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-3 pr-3">Mobile sync payload</td>
              <td className="py-3 pr-3">Supabase <code>mobile_sync_state</code></td>
              <td className="py-3">Sync text between phone and signed-in desktop session only</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-3 pr-3">Feedback message, type, optional email</td>
              <td className="py-3 pr-3">Supabase <code>user_feedback</code></td>
              <td className="py-3">Support and product improvement</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-3 pr-3">Notifications</td>
              <td className="py-3 pr-3">Supabase notifications table</td>
              <td className="py-3">
                Product updates; some messages are broadcast, some are per-user
              </td>
            </tr>
            <tr>
              <td className="py-3 pr-3">Reviews (if submitted)</td>
              <td className="py-3 pr-3">Supabase <code>reviews</code></td>
              <td className="py-3">Public or moderated testimonials on the site</td>
            </tr>
          </tbody>
        </table>
      </LegalSection>

      <LegalSection title="4. How we obtain data">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-foreground">Directly from you</strong> — when you sign up,
            request a license key, submit feedback, post a review, or type into mobile sync.
          </li>
          <li>
            <strong className="text-foreground">Automatically on device</strong> — machine ID for
            license binding; anonymous browser ID (<code>sintype.feedback.machine_id</code> in{" "}
            <code>localStorage</code>) when you send web feedback without signing in.
          </li>
          <li>
            <strong className="text-foreground">From your browser</strong> — theme, converter
            history, and session preferences via <code>localStorage</code> / session storage.
          </li>
          <li>
            <strong className="text-foreground">Third-party services</strong> — e.g. Google sign-in
            if enabled, GitHub for app update downloads, and advertising/analytics providers (see
            below).
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. What we do not do">
        <ul className="list-disc pl-5 space-y-2">
          <li>We do not sell your personal data.</li>
          <li>We do not store the content of your everyday desktop typing on our servers.</li>
          <li>We do not require an account to use the basic web converter.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Cookies, ads, and analytics">
        <p>
          We may use privacy-respecting analytics and Google AdSense (or similar) to fund the free
          web service. Those providers may set their own cookies and collect usage data under their
          policies. You can use browser controls and ad blockers to limit this. The desktop app does
          not show website ads.
        </p>
      </LegalSection>

      <LegalSection title="7. Sharing and processors">
        <p>We use trusted processors to run the service, including:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Supabase — database, authentication, realtime sync</li>
          <li>Cloudflare — hosting and CDN for the website</li>
          <li>GitHub — hosting release binaries linked from the download page</li>
        </ul>
        <p>We may disclose information if required by law or to protect our users and service.</p>
      </LegalSection>

      <LegalSection title="8. Retention">
        <p>
          Local browser and AppData files remain until you clear them or uninstall. Server records
          (licenses, feedback, notifications) are kept as long as needed to operate the service and
          comply with legal obligations, then deleted or anonymized where practical.
        </p>
      </LegalSection>

      <LegalSection title="9. Security">
        <p>
          Traffic to our site uses HTTPS. Supabase row-level security limits access to your data.
          License keys should be treated like passwords — do not share them publicly.
        </p>
      </LegalSection>

      <LegalSection title="10. Your rights">
        <p>
          Depending on your location, you may have rights to access, correct, or delete personal data
          we hold about you. Contact us via{" "}
          <Link to="/contact" className="text-[var(--neon-cyan)] hover:underline">
            /contact
          </Link>{" "}
          with the email tied to your account. We will verify ownership before making changes.
        </p>
      </LegalSection>

      <LegalSection title="11. Children">
        <p>
          SinType is a general-purpose typing tool. We do not knowingly collect personal data from
          children under 13. If you believe a child provided us data, contact us to remove it.
        </p>
      </LegalSection>

      <LegalSection title="12. Changes">
        <p>
          We may update this policy. The &quot;Last updated&quot; date at the top will change. Continued
          use after changes means you accept the revised policy.
        </p>
      </LegalSection>
    </LegalPageLayout>
    </>
  );
}
