import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/legal/refunds")({
  component: RefundPolicyPage,
});

function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-emerald-400">
            <CreditCard className="size-6 text-emerald-400" />
            <span>ExploreTN Legal</span>
          </Link>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>Last Updated: September 2026</span>
            <Link to="/">
              <Button size="sm" variant="outline" className="border-slate-700 text-xs">
                Back to Site
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-4 text-center mb-12">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Customer Protection Policy
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Refund & Cancellation Policy</h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm">
            Clear guidelines on ExploreTN Pro subscriptions, guided trail passes, cancellation rules, and refund processing.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-slate-300 text-sm leading-relaxed">
          <section className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">1. 14-Day Money-Back Guarantee</h2>
            <p>We offer a hassle-free 14-day full refund guarantee for all ExploreTN Pro Adventurer subscriptions. If you are not completely satisfied with our AI travel planner and offline maps, you can request a 100% refund with no questions asked.</p>
          </section>

          <section className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">2. Guided Trek & Permit Cancellations</h2>
            <ul className="list-disc pl-5 space-y-2 mt-2 text-slate-400">
              <li><strong className="font-medium text-slate-200">More than 48 Hours Before Trip:</strong> Full 100% refund to original payment method.</li>
              <li><strong className="font-medium text-slate-200">24 to 48 Hours Before Trip:</strong> 50% refund or 100% credit towards a future trail booking.</li>
              <li><strong className="font-medium text-slate-200">Less than 24 Hours / Severe Weather:</strong> Full refund if cancelled due to Tamil Nadu Forest Department red alerts or landslides.</li>
            </ul>
          </section>

          <section className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">3. How to Request a Refund</h2>
            <p>Go to <Link to="/billing" className="text-emerald-400 underline">Billing Settings</Link> or send an email to <a href="mailto:billing@explorertn.com" className="text-emerald-400 underline">billing@explorertn.com</a> with your booking ID. Refunds are credited within 5 to 7 business days.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <Link to="/billing" className="hover:text-emerald-400">Billing & Subscriptions</Link>
            <Link to="/legal/terms" className="hover:text-emerald-400">Terms of Service</Link>
          </div>
          <p>© 2026 ExploreTN. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}
