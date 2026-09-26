import { createFileRoute, Link } from "@tanstack/react-router";
import { Info, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/legal/disclaimer")({
  component: DisclaimerPage,
});

function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-emerald-400">
            <Info className="size-6 text-emerald-400" />
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
            WCAG 2.1 AA & Travel Disclaimer
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Disclaimer & Accessibility Statement</h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm">
            Important notices regarding map routing accuracy, weather conditions, and digital accessibility standards.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-slate-300 text-sm leading-relaxed">
          <section className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">1. Navigation & Route Accuracy Disclaimer</h2>
            <p>Maps, trail elevations, and estimated travel times are provided for informational purposes. Monsoon road conditions, hair-pin turn restrictions, and forest checkpost timings across Tamil Nadu may change without notice.</p>
          </section>

          <section className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">2. Digital Accessibility Statement (WCAG 2.1 AA)</h2>
            <p>ExploreTN is committed to digital accessibility for travelers of all abilities. We strive to adhere to Web Content Accessibility Guidelines (WCAG 2.1 AA) including keyboard navigation, high contrast map modes, and screen reader compatibility.</p>
            <p className="mt-2">If you experience accessibility barriers on ExploreTN, email our accessibility coordinator at <a href="mailto:accessibility@explorertn.com" className="text-emerald-400 underline">accessibility@explorertn.com</a>.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <Link to="/legal/privacy" className="hover:text-emerald-400">Privacy Policy</Link>
            <Link to="/legal/terms" className="hover:text-emerald-400">Terms of Service</Link>
          </div>
          <p>© 2026 ExploreTN. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}
