import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/payment/pending")({
  component: PaymentPendingPage,
});

function PaymentPendingPage() {
  return (
    <AppShell>
      <div className="max-w-md mx-auto px-4 pt-32 pb-20 font-sans text-center">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="inline-flex p-4 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <Clock className="size-12 animate-spin text-amber-400" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">Awaiting Bank Settlement</span>
            <h1 className="text-2xl font-extrabold text-white">Payment Pending</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              We're waiting for final confirmation from your bank or UPI provider. This usually completes within 2 to 5 minutes.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Button onClick={() => window.location.reload()} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-2">
              <RefreshCw className="size-4" /> Check Status Now
            </Button>
            <Link to="/ai-plan">
              <Button variant="ghost" className="w-full text-slate-400 hover:text-white text-xs">
                Continue Exploring While Waiting
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
