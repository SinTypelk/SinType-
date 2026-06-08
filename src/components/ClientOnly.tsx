import { useEffect, useState, type ReactNode } from "react";

/** Renders children only in the browser (avoids SSR marking APIs as unavailable). */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return fallback;
  return children;
}
