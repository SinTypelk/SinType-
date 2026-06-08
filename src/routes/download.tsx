import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
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
  HelpCircle,
  HardDrive,
  Wifi,
  Lock,
  Loader2,
  Smartphone,
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
import {
  fetchActiveBanners,
  fetchAppVersions,
  fetchDownloadPageConfig,
  fetchFeatures,
  type SiteBanner,
  type AppVersion,
  type KeyFeature,
  type DownloadPageConfig,
} from "@/lib/app-content-service";

const SITE_CURRENT_VERSION = "2.0.0";

function BannerNotice({ banner }: { banner: SiteBanner }) {
  const colorClasses: Record<SiteBanner["color_scheme"], string> = {
    warning: "border-orange-500/50 bg-orange-500/10 text-orange-400",
    info: "border-blue-500/50 bg-blue-500/10 text-blue-400",
    success: "border-green-500/50 bg-green-500/10 text-green-400",
    danger: "border-red-500/50 bg-red-500/10 text-red-400",
  };

  return (
    <div className={`mb-6 rounded-lg border p-4 ${colorClasses[banner.color_scheme]}`}>
      <p className="font-semibold">{banner.title}</p>
      {banner.message && <p className="text-sm mt-1 opacity-90">{banner.message}</p>}
    </div>
  );
}

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
  const [banners, setBanners] = useState<SiteBanner[]>([]);
  const [config, setConfig] = useState<DownloadPageConfig[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoadingBanners(true);
        const [bannersData, configData] = await Promise.all([
          fetchActiveBanners("download"),
          fetchDownloadPageConfig(),
        ]);
        setBanners(bannersData);
        setConfig(configData);
      } catch (err) {
        console.error("Failed to load download page content:", err);
      } finally {
        setLoadingBanners(false);
      }
    };
    loadContent();
  }, []);

  const heroTitle = config.find((c) => c.field_key === "hero_title")?.field_value || "Download SinType — typing ecosystem for Windows";
  const heroSubtitle = config.find((c) => c.field_key === "hero_subtitle")?.field_value || `${V2_TAGLINE} Plus system-wide Singlish to Sinhala Unicode and Legacy FM Abhaya — type in Photoshop, Word, WhatsApp, and any app with global hotkeys.`;

  return (
    <section className="max-w-6xl mx-auto px-6 pt-16 pb-24">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Download", path: "/download" },
        ])}
      />
      <BreadcrumbNav items={[{ label: "Download desktop app" }]} />

      {banners.map((banner) => (
        <BannerNotice key={banner.id} banner={banner} />
      ))}

      <BetaDisclaimerBanner />
      <AppUpdateBanner currentVersion={SITE_CURRENT_VERSION} />

      <div className="mb-10">
        <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--neon-cyan)]">
          SinType Desktop 2.0 Beta
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2">
          {heroTitle}
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl leading-relaxed">
          {heroSubtitle}
        </p>
      </div>

      <DownloadCard />

      <DownloadInfoSection config={config} />
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

interface KeyFeature {
  emoji: string;
  title: string;
  description: string;
}

const KEY_FEATURES: KeyFeature[] = [
  {
    emoji: "🌐",
    title: "Type Sinhala Anywhere",
    description: "Works in Word, Photoshop, WhatsApp, Discord, browsers",
  },
  {
    emoji: "⚡",
    title: "Two Typing Modes",
    description: "Unicode Sinhala or Legacy FM Abhaya fonts",
  },
  {
    emoji: "🖥️",
    title: "Control Right From Your Phone",
    description: "Remote touchpad & keyboard via QR",
  },
  {
    emoji: "📁",
    title: "Send Files Mobile to PC",
    description: "Drag & drop over local network, no cloud",
  },
  {
    emoji: "✏️",
    title: "Make Your Own Typing Rules",
    description: "Custom Singlish shortcuts & personal dictionary",
  },
  {
    emoji: "🔒",
    title: "Everything Stays Private",
    description: "No internet connection, no cloud storage",
  },
];

function KeyFeaturesSection() {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-10 rounded-2xl border border-white/10 p-8"
      style={{
        background: "color-mix(in oklab, var(--card) 75%, transparent)",
        backdropFilter: "blur(14px)",
      }}
    >
      <h2 className="font-display text-2xl sm:text-3xl mb-8 text-center">Key Features</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        {KEY_FEATURES.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{
              duration: 0.4,
              delay: inView ? index * 0.1 : 0,
            }}
            className="group relative rounded-xl border border-white/10 p-4 transition-all duration-300 hover:border-[var(--neon-cyan)]/50 hover:shadow-lg"
            style={{
              background: "color-mix(in oklab, var(--card) 60%, transparent)",
              transitionProperty: "all",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "translateY(-4px)";
              el.style.boxShadow = "0 8px 32px rgba(0, 217, 255, 0.2)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "translateY(0)";
              el.style.boxShadow = "none";
            }}
          >
            <div className="text-3xl mb-2">{feature.emoji}</div>
            <h3 className="font-display font-semibold text-base mb-1.5">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

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

        {/* Usage & Reviews Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch w-full">
          <LiveStats />
          <ReviewsSection />
        </div>

        <KeyFeaturesSection />

        <div className="mt-7 relative">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Release notes — v{releaseVersion}
          </p>
          <div className="space-y-3">
            {releaseBullets.map((line, index) => (
              <motion.div
                key={line}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="relative rounded-lg border border-white/15 p-3.5"
                style={{
                  background: "linear-gradient(135deg, color-mix(in oklab, var(--neon-cyan) 5%, var(--card)), color-mix(in oklab, var(--neon-purple) 3%, var(--card)))",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--neon-cyan)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground/90 leading-relaxed">{line}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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
      className="rounded-xl border border-white/10 p-3 flex flex-col w-full"
      style={{
        background: "color-mix(in oklab, var(--card) 80%, transparent)",
        WebkitBackdropFilter: "blur(20px)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="flex items-center gap-2 text-[8px] uppercase tracking-[0.25em] text-muted-foreground">
        <Activity className="w-2 h-2 text-[var(--neon-cyan)] animate-pulse" /> Live
      </div>
      <h3 className="font-display text-sm mt-1">Usage right now</h3>

      <div className="mt-2 space-y-1.5">
        <CompactStat
          label="Desktop pings (24h)"
          value={loading ? "…" : total.toLocaleString()}
        />
        <CompactStat
          label="Active sessions (5 min)"
          value={loading ? "…" : active.toLocaleString()}
        />
        <CompactStat
          label="Unique sessions (24h)"
          value={loading ? "…" : sessions.toLocaleString()}
        />
      </div>

      <div className="mt-2 pt-0.5 text-[9px] text-muted-foreground">
        Pulled from Supabase <code className="text-[8px]">app_usage</code>
      </div>
    </motion.div>
  );
}

function CompactStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
      <motion.p
        key={value}
        initial={{ opacity: 0.4, y: -2 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-xl mt-0.25"
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

/* ========== NEW DOWNLOAD INFO SECTION ========== */

function DownloadInfoSection({ config }: { config: DownloadPageConfig[] }) {
  return (
    <div className="mt-16 space-y-12">
      {/* What is SinType */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl border border-white/10 p-6 sm:p-8"
        style={{
          background: "color-mix(in oklab, var(--card) 75%, transparent)",
          backdropFilter: "blur(14px)",
        }}
      >
        <h2 className="font-display text-2xl sm:text-3xl mb-4">What is SinType?</h2>
        <p className="text-base sm:text-lg text-foreground/90 leading-relaxed">
          SinType is a smart typing app for Windows that instantly converts the way you type English letters into beautiful Sinhala script, working everywhere on your computer.
        </p>
      </motion.section>

      {/* Features */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="font-display text-2xl sm:text-3xl mb-6">Key Features</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Feature
            title="Type Sinhala Anywhere"
            description="Works in Word, Photoshop, WhatsApp, Discord, browsers—any app on your PC. Just press F10 to turn Sinhala typing on or off."
            icon={Globe}
          />
          <Feature
            title="Two Typing Modes"
            description="Switch between two styles: Modern Unicode Sinhala or Legacy FM Abhaya fonts for design work."
            icon={Zap}
          />
          <Feature
            title="Control Right From Your Phone"
            description="Use your mobile phone as a remote touchpad and keyboard. Connect via a simple QR code scan on your home network."
            icon={Smartphone}
          />
          <Feature
            title="Send Files From Mobile to PC"
            description="Drag and drop files from your phone directly to your computer over your private home network—no cloud needed."
            icon={HardDrive}
          />
          <Feature
            title="Make Your Own Typing Rules"
            description="Customize how Singlish shortcuts map to Sinhala letters. Save your personal typing dictionary."
            icon={Sparkles}
          />
          <Feature
            title="Everything Stays Private"
            description="Your typing stays on your computer. Nothing is sent to the internet or stored in the cloud."
            icon={Lock}
          />
        </div>
      </motion.section>

      {/* System Requirements */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-2xl border border-white/10 p-6 sm:p-8"
        style={{
          background: "color-mix(in oklab, var(--card) 75%, transparent)",
          backdropFilter: "blur(14px)",
        }}
      >
        <h2 className="font-display text-2xl sm:text-3xl mb-6">System Requirements</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <RequirementItem label="Operating System" value="Windows 10 or Windows 11" />
          <RequirementItem label="Memory (RAM)" value="At least 4 GB (8 GB recommended)" />
          <RequirementItem label="Disk Space" value="About 200 MB for installation" />
          <RequirementItem label="Internet" value="Required for license activation only" />
        </div>
      </motion.section>

      {/* Installation */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="font-display text-2xl sm:text-3xl mb-6">How to Install</h2>
        <div className="space-y-4">
          <InstallStep
            step={1}
            title="Download the Installer"
            description="Click the download button above. Your browser will save the SinType installer file."
          />
          <InstallStep
            step={2}
            title="Run the Installer"
            description="Open the downloaded file and follow the setup wizard. The app will be installed to your Programs folder."
          />
          <InstallStep
            step={3}
            title="Launch SinType"
            description="After installation, find SinType in your Windows Start menu or desktop shortcut. Click to open the app."
          />
          <InstallStep
            step={4}
            title="Activate Your License"
            description="Open the License tab inside the app, enter your email and activation key (from sintype.lk/license), and click Activate."
          />
        </div>
      </motion.section>

      {/* License Activation */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="rounded-2xl border border-white/10 p-6 sm:p-8"
        style={{
          background: "color-mix(in oklab, var(--card) 75%, transparent)",
          backdropFilter: "blur(14px)",
        }}
      >
        <h2 className="font-display text-2xl sm:text-3xl mb-4">How to Activate Your License</h2>
        <p className="text-muted-foreground mb-6">
          Every PC gets its own license key tied to that computer's hardware fingerprint. Here's how to activate:
        </p>
        <div className="space-y-4">
          <ActivationStep
            step={1}
            title="Get Your Activation Key"
            description="Go to sintype.lk/license, sign in with your email, and copy your 30-day free key."
          />
          <ActivationStep
            step={2}
            title="Open the License Tab"
            description="In the SinType app, click the License tab. Paste your email address and the activation key you just copied."
          />
          <ActivationStep
            step={3}
            title="Click Activate"
            description="The app connects to our server to verify and activate your license. You'll see a confirmation message once it's active."
          />
        </div>
        <div
          className="mt-6 p-4 rounded-lg border-l-4"
          style={{
            background: "color-mix(in oklab, var(--neon-cyan) 10%, var(--card))",
            borderColor: "var(--neon-cyan)",
          }}
        >
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Note:</span> Your license is linked to this specific computer using its hardware fingerprint. If you use SinType on another PC, you'll need a separate key.
          </p>
        </div>
      </motion.section>

      {/* FAQ */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h2 className="font-display text-2xl sm:text-3xl mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <FAQItem
            question="Do I need the internet to use SinType?"
            answer="Internet is only needed to activate your license and check for app updates. Once activated, you can type Sinhala offline without any internet. The typing conversion happens entirely on your computer."
          />
          <FAQItem
            question="Can I use SinType on multiple computers?"
            answer="Each PC needs its own license key because each computer has a unique hardware fingerprint. You can request a new key for another computer on the same email account at sintype.lk/license. This protects your license and keeps the app secure."
          />
          <FAQItem
            question="How do I uninstall SinType?"
            answer="Open Windows Settings → Apps → Installed Apps, search for 'SinType', and click Uninstall. Or you can use the uninstall button in the SinType app's Settings tab—it will remove the app cleanly. Your settings and custom typing rules are kept in your user folder just in case you want to reinstall later."
          />
        </div>
      </motion.section>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: typeof Sparkles;
}) {
  return (
    <div
      className="rounded-2xl border border-white/10 p-5 sm:p-6"
      style={{
        background: "color-mix(in oklab, var(--card) 80%, transparent)",
        backdropFilter: "blur(12px)",
      }}
    >
      <Icon className="w-6 h-6 text-[var(--neon-cyan)]" />
      <h3 className="font-display text-base sm:text-lg mt-3 mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function RequirementItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground font-semibold">
        {label}
      </p>
      <p className="text-base sm:text-lg text-foreground mt-1">{value}</p>
    </div>
  );
}

function InstallStep({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div
      className="rounded-2xl border border-white/10 p-5 sm:p-6 flex gap-4"
      style={{
        background: "color-mix(in oklab, var(--card) 80%, transparent)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-primary-foreground"
        style={{
          background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))",
        }}
      >
        {step}
      </div>
      <div>
        <h3 className="font-display font-semibold text-base sm:text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function ActivationStep({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div
      className="rounded-xl border border-white/5 p-4 flex gap-3"
      style={{
        background: "color-mix(in oklab, var(--card) 60%, transparent)",
      }}
    >
      <div
        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs text-primary-foreground"
        style={{
          background: "var(--neon-cyan)",
        }}
      >
        {step}
      </div>
      <div>
        <p className="font-semibold text-foreground text-sm sm:text-base">{title}</p>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-2xl border border-white/10 p-5 sm:p-6 cursor-pointer transition-all"
      style={{
        background: "color-mix(in oklab, var(--card) 80%, transparent)",
        backdropFilter: "blur(12px)",
      }}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-display font-semibold text-base sm:text-lg text-foreground flex-1">
          {question}
        </h3>
        <HelpCircle
          className="w-5 h-5 text-[var(--neon-cyan)] shrink-0 mt-0.5 transition-transform"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </div>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{answer}</p>
        </motion.div>
      )}
    </div>
  );
}

// Icon for smartphone (using existing icons as fallback)
const Smartphone = Monitor; // Using Monitor as fallback icon
