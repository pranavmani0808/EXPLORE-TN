import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/403")({
  component: Forbidden403Page,
});

function Forbidden403Page() {
  return (
    <AppShell>
      <div className="flex min-h-[80vh] items-center justify-center px-4 font-sans text-center">
        <div className="max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="inline-flex p-4 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400">
            <Lock className="size-12 text-rose-400" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest">HTTP 403 Forbidden</span>
            <h1 className="text-3xl font-black text-white">Access Restricted</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              You don't have authorization to view this admin management console or system resource. Super Admin privileges are required.
            </p>
          </div>

          <div className="pt-2">
            <Link to="/">
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-2">
                <ArrowLeft className="size-4" /> Return to ExploreTN Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
