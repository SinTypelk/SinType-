/** Shared SinType mark from /public/icon.png */
export function BrandLogo({
  className = "w-8 h-8",
  alt = "SinType logo — Singlish to Sinhala Unicode and FM Abhaya converter",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <img
      src="/icon.png"
      alt={alt}
      className={`${className} object-contain logo-glow`}
      width={32}
      height={32}
      decoding="async"
      loading="lazy"
    />
  );
}
