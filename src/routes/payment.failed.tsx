import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, RefreshCw, LifeBuoy } from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/payment/failed")({
  component: PaymentFailedPage,
});

function PaymentFailedPage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("pending_checkout_token");
      sessionStorage.removeItem("active_payment_intent");
    }
  }, []);
  return (
    <AppShell>
      <div className="max-w-md mx-auto px-4 pt-32 pb-20 font-sans text-center">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="inline-flex p-4 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400">
            <AlertTriangle className="size-12 text-rose-400" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest">Transaction Unsuccessful</span>
            <h1 className="text-2xl font-extrabold text-white">Payment Failed</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your payment could not be completed (e.g. card authentication declined or bank timeout). No funds were charged to your account.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Link to="/billing">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-2">
                <RefreshCw className="size-4" /> Retry Payment
              </Button>
            </Link>
            <Link to="/support">
              <Button variant="outline" className="w-full border-slate-700 text-slate-300 text-xs">
                Contact Billing Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
