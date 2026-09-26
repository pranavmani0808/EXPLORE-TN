import { createFileRoute } from "@tanstack/react-router";
import { Wrench, Clock, Compass } from "lucide-react";
import { AppShell } from "@/components/site/app-shell";

export const Route = createFileRoute("/maintenance")({
  component: MaintenancePage,
});

function MaintenancePage() {
  return (
    <AppShell>
      <div className="flex min-h-[80vh] items-center justify-center px-4 font-sans text-center">
        <div className="max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="inline-flex p-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
            <Wrench className="size-12 animate-pulse text-emerald-400" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1">
              <Clock className="size-3" /> Scheduled Map Infrastructure Maintenance
            </span>
            <h1 className="text-3xl font-black text-white">We'll Be Right Back!</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              ExploreTN map servers are undergoing routine updates for monsoon road telemetry and new OSRM overtaking polylines. Systems will resume shortly.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
            <div className="flex justify-between"><span>Status:</span><span className="text-emerald-400 font-bold">Database Upgrade</span></div>
            <div className="flex justify-between"><span>Expected Duration:</span><span className="text-white">15 minutes</span></div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
