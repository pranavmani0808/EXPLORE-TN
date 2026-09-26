import { createFileRoute, Link } from "@tanstack/react-router";
import { ServerCrash, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/500")({
  component: ServerError500Page,
});

function ServerError500Page() {
  return (
    <AppShell>
      <div className="flex min-h-[80vh] items-center justify-center px-4 font-sans text-center">
        <div className="max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="inline-flex p-4 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <ServerCrash className="size-12 text-amber-400" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">HTTP 500 Internal Server Error</span>
            <h1 className="text-3xl font-black text-white">Something Went Wrong</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our servers encountered an unexpected issue while processing map tiles or OSRM route curves. Our engineering team has been notified.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={() => window.location.reload()} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-2">
              <RefreshCw className="size-4" /> Reload Page
            </Button>
            <Link to="/" className="flex-1">
              <Button variant="outline" className="w-full border-slate-700 text-slate-300 text-xs py-3 rounded-xl">
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
