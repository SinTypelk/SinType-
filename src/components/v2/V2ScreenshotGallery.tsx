import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { V2_SCREENSHOTS } from "@/lib/v2-showcase";

function ScreenshotCard({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <figure className="overflow-hidden rounded-2xl border border-white/10 bg-card/40">
      <div className="relative aspect-[16/10] w-full bg-background/50">
        {!failed ? (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            width={640}
            height={400}
            className="h-full w-full object-cover object-top"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
            <ImageIcon className="h-8 w-8 opacity-50" aria-hidden />
            <p className="text-xs">{caption}</p>
          </div>
        )}
      </div>
      <figcaption className="border-t border-white/10 px-4 py-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
        {caption}
      </figcaption>
    </figure>
  );
}

export function V2ScreenshotGallery({ className = "" }: { className?: string }) {
  return (
    <section className={className} aria-labelledby="v2-screenshots-heading">
      <h2 id="v2-screenshots-heading" className="font-display text-xl sm:text-2xl font-bold mb-2">
        See it in action
      </h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
        SinType 2.0 connects your phone and PC over your local network — no external servers for
        keystrokes or file transfers.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {V2_SCREENSHOTS.map((shot) => (
          <ScreenshotCard key={shot.src} {...shot} />
        ))}
      </div>
    </section>
  );
}
