import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Download,
  Monitor,
  Shield,
  Sparkles,
  CheckCircle2,
  Activity,
  KeyRound,
  Keyboard,
  Zap,
  Globe,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { fetchLiveUsageStats, type LiveUsageStats } from "@/lib/usage-stats";
import { LoginModal } from "@/components/LoginModal";
import { AppUpdateBanner } from "@/components/AppUpdateBanner";
import { ReviewsSection } from "@/components/ReviewsSection";
import {
  fetchRecentAppUpdates,
  parseReleaseNotes,
  type AppUpdateRow,
} from "@/lib/app-updates-service";
import { KEYWORDS_DOWNLOAD } from "@/lib/seo-keywords";
import { BreadcrumbNav } from "@/components/seo/BreadcrumbNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageHead } from "@/lib/site-seo";
import { BetaDisclaimerBanner } from "@/components/v2/BetaDisclaimerBanner";
import { V2FeaturesGrid } from "@/components/v2/V2FeaturesGrid";
import { V2ScreenshotGallery } from "@/components/v2/V2ScreenshotGallery";
import { V2_TAGLINE } from "@/lib/v2-showcase";

const SITE_CURRENT_VERSION = "2.0.0";

export const Route = createFileRoute("/download")({
  head: () =>
    pageHead({
      title: "Download SinType 2.0 Beta | Windows Sinhala Typing + Mobile Remote — SinType.lk",
      description:
        "Download SinType 2.0 Beta for Windows 10/11. Local web server, mobile touchpad & keyboard, LAN file sync, QR activation, and system-wide Singlish to Sinhala typing.",
      path: "/download",
      keywords: KEYWORDS_DOWNLOAD,
    }),
  component: DownloadPage,
});

function DownloadPage() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-16 pb-24">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Download", path: "/download" },
        ])}
      />
      <BreadcrumbNav items={[{ label: "Download desktop app" }]} />
      <BetaDisclaimerBanner />
      <AppUpdateBanner currentVersion={SITE_CURRENT_VERSION} />

      <div className="mb-10">
        <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--neon-cyan)]">
          SinType Desktop 2.0 Beta
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2">
          Download SinType — typing ecosystem for Windows
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl leading-relaxed">
          {V2_TAGLINE} Plus system-wide Singlish to Sinhala Unicode and Legacy FM Abhaya — type in
          Photoshop, Word, WhatsApp, and any app with global hotkeys.
        </p>
      </div>

      <DownloadCard />

      <V2FeaturesGrid className="mt-12" />
      <V2ScreenshotGallery className="mt-12" />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch w-full">
        <LiveStats />
        <ReviewsSection />
      </div>

      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        <Feature
          icon={Sparkles}
          title="Smart engine"
          body="Greedy-match converter with custom dictionary, Unicode + Legacy FM."
        />
        <Feature
          icon={Shield}
          title="Private & offline"
          body="Conversion runs locally. No keystrokes leave your machine."
        />
        <Feature
          icon={Monitor}
          title="System-wide"
          body="Works in any window — use F10 (default) to toggle Singlish mode."
        />
      </div>
    </section>
  );
}

const FALLBACK_RELEASE_NOTES = [
  "Built-in Local Web Server for mobile remote control",
  "Wireless touchpad & keyboard — Spacebar to swap modes",
  "Mobile-to-PC file sync over your private LAN",
  "Mobile-QR license activation",
  "Easy mapping editor for custom Singlish rules",
  "System-wide Unicode + Legacy FM typing (F10 toggle)",
];

function DownloadCard() {
  const { user } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [releases, setReleases] = useState<AppUpdateRow[]>([]);

  useEffect(() => {
    fetchRecentAppUpdates(24)
      .then(setReleases)
      .catch(() => setReleases([]));
  }, []);

  const latestUpdate = releases[0] ?? null;
  const olderReleases = releases.slice(1);
  const releaseVersion = latestUpdate?.version_number ?? SITE_CURRENT_VERSION;
  const releaseBullets = latestUpdate
    ? parseReleaseNotes(latestUpdate.release_notes)
    : FALLBACK_RELEASE_NOTES;
  const downloadHref = latestUpdate?.download_url ?? "/download";

  const onGetKey = () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    window.location.href = "/license";
  };

  return (
    <>
      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        redirectTo="/license"
        title="Sign in to get your key"
        description="A free 30-day activation key is linked to your account. Sign in with email or Google."
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 p-7"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--card) 92%, transparent), color-mix(in oklab, var(--neon-purple) 8%, var(--card)))",
          backdropFilter: "blur(20px)",
        }}
      >
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-40"
          style={{
            background: "radial-gradient(circle, var(--neon-cyan), transparent 60%)",
          }}
        />
        <div className="flex items-start justify-between gap-4 relative">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] px-2.5 py-1 rounded-full border border-white/10 text-muted-foreground">
              <Monitor className="w-3 h-3" /> Windows 10 / 11
            </div>
            <h2 className="font-display text-3xl mt-3">SinType Desktop</h2>
            <p className="text-sm text-muted-foreground mt-1">
              v{releaseVersion} ·{" "}
              {releaseVersion.startsWith("2.0") ? (
                <span className="text-amber-400 font-medium">Beta channel</span>
              ) : (
                "Stable channel"
              )}
            </p>
          </div>
        </div>

        <div className="relative mt-6 flex flex-col sm:flex-row flex-wrap gap-3">
          <motion.a
            href={downloadHref}
            target={downloadHref.startsWith("http") ? "_blank" : undefined}
            rel={downloadHref.startsWith("http") ? "noopener noreferrer" : undefined}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl text-primary-foreground font-semibold shadow-xl"
            style={{
              background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))",
            }}
          >
            <Download className="w-5 h-5" />
            Download for Windows
          </motion.a>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onGetKey}
            className="inline-flex items-center gap-2 px-5 py-4 rounded-2xl font-semibold border border-[var(--neon-cyan)] text-[var(--neon-cyan)] hover:bg-accent/20"
          >
            <KeyRound className="w-5 h-5" />
            Generate 30-day key
          </motion.button>
        </div>

        <div
          className="mt-8 relative rounded-2xl border border-white/10 p-5 sm:p-6"
          style={{
            background: "color-mix(in oklab, var(--card) 75%, transparent)",
            backdropFilter: "blur(14px)",
          }}
        >
          <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-2">
            SinType Desktop
          </p>
          <h3 className="font-display text-xl sm:text-2xl">
            System-wide Singlish — type Sinhala everywhere
          </h3>
          <p className="mt-3 text-base sm:text-lg text-foreground/90 leading-relaxed max-w-2xl">
            SinType Desktop is a native Windows input engine that converts Singlish to flawless
            Sinhala in any application. No browser tab required — activate once, then type in Word,
            Photoshop, browsers, chat apps, and more.
          </p>
          <ul className="mt-5 grid sm:grid-cols-2 gap-3 text-sm">
            <HotFeature
              icon={Keyboard}
              title="Toggle Singlish (default F10)"
              body="Turn the engine on/off system-wide. Change hotkeys in Desktop → Settings."
            />
            <HotFeature
              icon={Sparkles}
              title="Unicode & Legacy (FM) fonts"
              body="Switch output for modern apps or FM Abhaya-style design workflows."
            />
            <HotFeature
              icon={Globe}
              title="Works in any app"
              body="Photoshop, Premiere, Word, Excel, Discord, browsers — everywhere."
            />
            <HotFeature
              icon={Zap}
              title="Ultra-fast offline processing"
              body="Conversion runs on your PC. No keystrokes sent to the cloud while typing."
            />
          </ul>
        </div>

        <div className="mt-7 relative">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
            Release notes — v{releaseVersion}
          </p>
          <ul className="space-y-2 text-sm">
            {releaseBullets.map((line) => (
              <li key={line} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-[var(--neon-cyan)]" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        {olderReleases.length > 0 && (
          <PreviousReleases releases={olderReleases} />
        )}
      </motion.div>
    </>
  );
}

function PreviousReleases({ releases }: { releases: AppUpdateRow[] }) {
  return (
    <div
      className="mt-8 pt-6 border-t border-white/10"
      aria-label="Previous desktop releases"
    >
      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-1">
        Previous releases
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        Older builds stay available if you need a specific version.
      </p>
      <ul className="flex flex-wrap gap-2">
        {releases.map((r) => (
          <li key={r.id}>
            <a
              href={r.download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-background/40 px-3.5 py-2 text-xs font-semibold text-foreground/90 transition-colors hover:border-[var(--neon-cyan)]/50 hover:bg-[var(--neon-cyan)]/10"
              title={r.download_url}
            >
              <Download className="w-3.5 h-3.5 text-[var(--neon-cyan)]" />
              <span className="font-mono">v{r.version_number}</span>
              <span className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground">
                Download
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LiveStats() {
  const [stats, setStats] = useState<LiveUsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const data = await fetchLiveUsageStats();
      if (!cancelled) {
        setStats(data);
        setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const total = stats?.pingsLast24h ?? 0;
  const active = stats?.activeSessions5m ?? 0;
  const sessions = stats?.totalSessions ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-3xl border border-white/10 p-5 flex flex-col w-full h-full min-h-[22rem]"
      style={{
        background: "color-mix(in oklab, var(--card) 80%, transparent)",
        WebkitBackdropFilter: "blur(20px)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        <Activity className="w-3 h-3 text-[var(--neon-cyan)] animate-pulse" /> Live
      </div>
      <h3 className="font-display text-lg mt-2">Usage right now</h3>

      <div className="mt-4 space-y-4">
        <Stat
          label="Desktop pings (24h)"
          value={loading ? "…" : total.toLocaleString()}
        />
        <Stat
          label="Active sessions (5 min)"
          value={loading ? "…" : active.toLocaleString()}
        />
        <Stat
          label="Unique sessions (24h)"
          value={loading ? "…" : sessions.toLocaleString()}
        />
      </div>

      <div className="mt-4 pt-2 text-xs text-muted-foreground">
        Pulled from Supabase <code className="text-[10px]">app_usage</code> telemetry.
        {!loading && total === 0 && (
          <span className="block mt-1">Stats appear after desktop app launches.</span>
        )}
      </div>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
      <motion.p
        key={value}
        initial={{ opacity: 0.4, y: -2 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-2xl mt-1"
      >
        {value}
      </motion.p>
    </div>
  );
}

function HotFeature({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Sparkles;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-3 rounded-xl border border-white/5 bg-background/30 p-3">
      <Icon className="w-5 h-5 shrink-0 text-[var(--neon-cyan)] mt-0.5" />
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{body}</p>
      </div>
    </li>
  );
}

function Feature({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Sparkles;
  title: string;
  body: string;
}) {
  return (
    <div
      className="rounded-2xl border border-white/10 p-5"
      style={{
        background: "color-mix(in oklab, var(--card) 70%, transparent)",
        backdropFilter: "blur(12px)",
      }}
    >
      <Icon className="w-5 h-5 text-[var(--neon-cyan)]" />
      <h4 className="font-display mt-3">{title}</h4>
      <p className="text-sm text-muted-foreground mt-1">{body}</p>
    </div>
  );
}
