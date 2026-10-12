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
import { reportAppError } from "../lib/app-error-reporting";
import { AuthGuardProvider } from "../lib/auth-guard-context";
import { Toaster } from "sonner";
import { CookieBanner } from "../components/site/cookie-banner";
import { UxStateListeners } from "../components/site/ux-state-listeners";
import { GsapGlobalProvider } from "../components/site/gsap-provider";
import { RouteLoadingBar } from "../components/site/route-loading-bar";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-800 font-sans">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-sky-100 shadow-xl text-center space-y-4">
        <div className="size-16 mx-auto rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-sm">
          <span className="text-3xl">🧭</span>
        </div>
        <h1 className="text-6xl font-black text-sky-600 tracking-tight">404</h1>
        <h2 className="text-xl font-extrabold text-slate-900">Destination Off the Map</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          The trail or route page you're looking for doesn't exist or has been relocated in Tamil Nadu.
        </p>
        <div className="pt-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-6 py-3 text-xs font-bold text-white transition-all hover:bg-sky-500 shadow-md shadow-sky-600/20"
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
    reportAppError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-800 font-sans">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-sky-100 shadow-xl text-center space-y-4">
        <div className="size-16 mx-auto rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-sm">
          <span className="text-3xl">🗺️</span>
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Route Loading Interrupted
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          We encountered a temporary hiccup loading this page. You can retry refreshing or return to the main map.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-sky-500 shadow-md shadow-sky-600/20 cursor-pointer"
          >
            Try Again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-5 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
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
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "alternate icon", href: "/favicon.ico" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
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
