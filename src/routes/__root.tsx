import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { AppProvider } from "@/lib/app-context";
import { AuthProvider } from "@/lib/auth-context";
import { EdgeBar, EdgeDock } from "@/components/EdgeBar";
import { SiteFooter } from "@/components/SiteFooter";
import { GOOGLE_FONTS_CSS } from "@/lib/google-fonts";
import { NotFoundPage } from "@/components/NotFoundPage";
import {
  DEFAULT_KEYWORDS,
  GOOGLE_SITE_VERIFICATION,
  HOME_DESCRIPTION,
  HOME_TITLE,
  canonicalLink,
  openGraphMeta,
  socialImageUrl,
  SITE_URL,
  rootJsonLdGraph,
} from "@/lib/site-seo";

function NotFoundComponent() {
  return <NotFoundPage />;
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong on our end.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Try again</button>
          <a href="/" className="rounded-md border border-input px-4 py-2 text-sm">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: HOME_TITLE },
      { name: "description", content: HOME_DESCRIPTION },
      { name: "author", content: "SinType.lk" },
      { name: "keywords", content: DEFAULT_KEYWORDS },
      {
        name: "robots",
        content:
          "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { name: "google-site-verification", content: GOOGLE_SITE_VERIFICATION },
      { name: "theme-color", content: "#06080c" },
      ...openGraphMeta({
        title: HOME_TITLE,
        description: HOME_DESCRIPTION,
        path: "/",
        image: socialImageUrl(),
      }),
    ],
    links: [
      canonicalLink("/"),
      { rel: "icon", href: "/icon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/icon.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "preload", href: GOOGLE_FONTS_CSS, as: "style" },
      { rel: "sitemap", type: "application/xml", title: "Sitemap", href: `${SITE_URL}/sitemap.xml` },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  notFoundMode: "root",
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  const jsonLd = rootJsonLdGraph();
  return (
    <html lang="en-LK" className="dark">
      <head>
        <HeadContent />
        <link
          rel="stylesheet"
          href={GOOGLE_FONTS_CSS}
          media="print"
          // Non-blocking font CSS (PageSpeed render-blocking fix)
          onLoad={(e) => {
            (e.currentTarget as HTMLLinkElement).media = "all";
          }}
        />
        <noscript>
          <link rel="stylesheet" href={GOOGLE_FONTS_CSS} />
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isMobile = path.startsWith("/m/");
  const isAdmin = path.startsWith("/admin");
  if (isAdmin) {
    return <div className="min-h-screen">{children}</div>;
  }
  return (
    <div className="min-h-screen flex flex-col">
      {!isMobile && <EdgeBar />}
      {!isMobile && <EdgeDock />}
      <main className={`flex-1 ${!isMobile ? "sm:pl-20" : ""}`}>{children}</main>
      {!isMobile && <SiteFooter />}
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <Layout>
            <Outlet />
          </Layout>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
