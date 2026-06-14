import {
  FolderSync,
  MousePointerClick,
  QrCode,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import { type CSSProperties } from "react";
import { V2_FEATURES } from "@/lib/v2-showcase";
import { type KeyFeature } from "@/lib/app-content-service";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

const ICONS: Record<string, LucideIcon> = {
  "mouse-pointer-click": MousePointerClick,
  "folder-sync": FolderSync,
  "qr-code": QrCode,
  "sliders-horizontal": SlidersHorizontal,
};

type V2FeaturesGridProps = {
  title?: string;
  subtitle?: string;
  className?: string;
  features?: KeyFeature[];
};

export function V2FeaturesGrid({
  title = "What's new in SinType 2.0 Beta",
  subtitle = "A local web server on your PC powers mobile remote control, file sync, and faster activation — all on your private network.",
  className = "",
  features,
}: V2FeaturesGridProps) {
  useScrollReveal();
  const displayFeatures = features && features.length > 0 ? features : V2_FEATURES;

  return (
    <section className={className} aria-labelledby="v2-features-heading">
      <div className="mb-8 text-center sm:text-left">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--neon-cyan)] font-semibold">
          SinType Desktop v2.0
        </p>
        <h2 id="v2-features-heading" className="font-display text-2xl sm:text-3xl font-bold mt-2">
          {title}
        </h2>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4 md:gap-6">
        {displayFeatures.map((feature, i) => {
          const featureIcon = "icon" in feature ? feature.icon : "mouse-pointer-click";
          const Icon = ICONS[featureIcon];
          return (
            <article
              key={("id" in feature ? feature.id : feature.id)}
              className="reveal-on-scroll feature-card-hover group relative overflow-hidden rounded-2xl border border-white/10 p-4 sm:p-5 md:p-6"
              style={{
                "--reveal-delay": `${i * 0.1}s`,
                background:
                  "linear-gradient(145deg, color-mix(in oklab, var(--card) 88%, transparent), color-mix(in oklab, var(--neon-purple) 6%, var(--card)))",
                backdropFilter: "blur(16px)",
              } as CSSProperties}
            >
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-30 blur-2xl transition-opacity group-hover:opacity-50"
                style={{
                  background: "radial-gradient(circle, var(--neon-cyan), transparent 70%)",
                }}
              />
              <div className="relative flex flex-col sm:flex-row gap-2 sm:gap-4 md:flex-row">
                <div className="flex h-8 sm:h-12 md:h-11 w-8 sm:w-12 md:w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--neon-cyan)]/25 bg-[var(--neon-cyan)]/10">
                  {Icon ? (
                    <Icon className="h-4 sm:h-6 md:h-5 w-4 sm:w-6 md:w-5 text-[var(--neon-cyan)]" aria-hidden />
                  ) : (
                    <span className="text-lg sm:text-2xl md:text-xl leading-none" aria-hidden>
                      {featureIcon}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-[15px] sm:text-lg md:text-lg font-bold sm:font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-1 sm:mt-1.5 text-[13px] sm:text-base md:text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
