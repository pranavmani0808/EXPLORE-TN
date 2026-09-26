import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthGuardProvider } from "../lib/auth-guard-context";
import { Toaster } from "sonner";
import { CookieBanner } from "../components/site/cookie-banner";
import { UxStateListeners } from "../components/site/ux-state-listeners";
import { GsapGlobalProvider } from "../components/site/gsap-provider";
import { RouteLoadingBar } from "../components/site/route-loading-bar";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100 font-sans">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-8xl font-black text-emerald-400 tracking-tight">404</h1>
        <h2 className="text-xl font-bold text-white">Destination Off the Map</h2>
        <p className="text-xs text-slate-400">
          The trail or route page you're looking for doesn't exist or has been relocated in Tamil Nadu.
        </p>
        <div className="pt-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-3 text-xs font-black text-black transition-colors hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
          >
            Go Back Home →
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100 font-sans">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-black text-rose-400 tracking-tight">
          System Signal Interrupted (500)
        </h1>
        <p className="text-xs text-slate-400">
          Something went wrong loading this route. You can try refreshing or return to the main map.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-black transition-colors hover:bg-emerald-400"
          >
            Try Again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-xs font-bold text-slate-200 transition-colors hover:bg-slate-800"
          >
            Go Home
          </a>
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
      { title: "ExplorerTN — Discover Tamil Nadu" },
      {
        name: "description",
        content:
          "A map-first explorer for Tamil Nadu: hidden waterfalls, scenic ghat roads, temple trails, food routes and viewpoints.",
      },
      { property: "og:title", content: "ExplorerTN — Discover Tamil Nadu" },
      {
        property: "og:description",
        content: "Hidden places, scenic routes and food trails across Tamil Nadu.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuardProvider>
        <GsapGlobalProvider>
          <RouteLoadingBar />
          <UxStateListeners />
          <Toaster position="top-right" theme="dark" richColors />
          <Outlet />
          <CookieBanner />
        </GsapGlobalProvider>
      </AuthGuardProvider>
    </QueryClientProvider>
  );
}
