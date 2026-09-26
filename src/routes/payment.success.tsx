import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Sparkles, MapPin, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/payment/success")({
  component: PaymentSuccessPage,
});

function PaymentSuccessPage() {
  return (
    <AppShell>
      <div className="max-w-md mx-auto px-4 pt-32 pb-20 font-sans text-center">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="inline-flex p-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
            <CheckCircle2 className="size-12 animate-pulse text-emerald-400" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Payment Confirmed</span>
            <h1 className="text-2xl font-extrabold text-white">Welcome to Pro Adventurer!</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your payment was processed successfully. All premium OSRM route calculations, offline maps, and weather alerts are now unlocked.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-left space-y-1">
            <div className="flex justify-between text-slate-400"><span>Plan:</span><span className="text-white">Pro Adventurer</span></div>
            <div className="flex justify-between text-slate-400"><span>Amount:</span><span className="text-white">₹499.00</span></div>
            <div className="flex justify-between text-slate-400"><span>Transaction ID:</span><span className="text-emerald-400">#TXN-TN920381</span></div>
          </div>

          <div className="space-y-2 pt-2">
            <Link to="/ai-plan">
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs py-3 rounded-xl">
                Open AI Travel Planner →
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="ghost" className="w-full text-slate-400 hover:text-white text-xs">
                View Profile & Invoices
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
