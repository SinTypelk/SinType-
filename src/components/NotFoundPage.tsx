import { Link } from "@tanstack/react-router";

/** Shared 404 UI — used by root notFoundComponent and optional splat fallback. */
export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold neon-text font-display">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist. Try the{" "}
          <Link to="/site-map" className="text-[var(--neon-cyan)] hover:underline">
            site map
          </Link>{" "}
          or the Sinhala Unicode converter.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Go home
          </Link>
          <Link
            to="/sinhala-unicode-converter"
            className="inline-flex rounded-md border border-input px-4 py-2 text-sm"
          >
            Unicode converter
          </Link>
        </div>
      </div>
    </div>
  );
}
