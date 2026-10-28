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
import { SeoStructuredData } from "../components/site/seo-structured-data";

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
      { title: "ExploreTN — Discover Tamil Nadu Trails, Temples & Ghats" },
      {
        name: "description",
        content:
          "ExploreTN helps you discover verified heritage temples, Western Ghats waterfalls, coastal road routes, and custom itineraries across all 38 districts.",
      },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1, ai-content" },
      { property: "og:site_name", content: "ExploreTN" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://explore-tn-ochre.vercel.app/" },
      { property: "og:title", content: "ExploreTN — Discover Tamil Nadu Trails, Temples & Ghats" },
      {
        property: "og:description",
        content:
          "ExploreTN helps you discover verified heritage temples, Western Ghats waterfalls, coastal road routes, and custom itineraries across all 38 districts.",
      },
      { property: "og:image", content: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&h=630&q=85" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@ExploreTN" },
      { name: "twitter:creator", content: "@ExploreTN" },
      { name: "twitter:title", content: "ExploreTN — Discover Tamil Nadu Trails, Temples & Ghats" },
      {
        name: "twitter:description",
        content:
          "ExploreTN helps you discover verified heritage temples, Western Ghats waterfalls, coastal road routes, and custom itineraries across all 38 districts.",
      },
      { name: "twitter:image", content: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&h=630&q=85" },
    ],
    links: [
      { rel: "canonical", href: "https://explore-tn-ochre.vercel.app/" },
      { rel: "alternate", type: "application/rss+xml", href: "/feed.xml" },
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
      <SeoStructuredData />
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
