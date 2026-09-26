import { createFileRoute, Link } from "@tanstack/react-router";
import { Scale, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/legal/terms")({
  component: TermsOfServicePage,
});

function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-emerald-400">
            <Scale className="size-6 text-emerald-400" />
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
            Terms & User Agreement
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Terms of Service</h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm">
            Rules, guidelines, and terms governing your use of ExploreTN trip planning, navigation maps, and community trails.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-slate-300 text-sm leading-relaxed">
          <section className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using ExploreTN, you agree to be bound by these Terms of Service, all applicable laws, and local travel regulations across Tamil Nadu.</p>
          </section>

          <section className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">2. Responsible Travel & Safety Disclaimer</h2>
            <p>ExploreTN provides route suggestions for waterfalls, ghat roads, and trekking trails. Users are responsible for verifying local weather warnings, forest department permits, and road conditions before embarking on trips.</p>
          </section>

          <section className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">3. User Conduct & Community Content</h2>
            <p>Users uploading reviews, trail notes, or photos must adhere to our Community Guidelines. Spam, defamatory content, or unauthorized commercial solicitation is strictly prohibited.</p>
          </section>

          <section className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">4. Intellectual Property</h2>
            <p>All map layouts, custom trail algorithms, illustrations, and branding belong to ExploreTN. User-contributed photos remain the property of their respective creators.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <Link to="/legal/privacy" className="hover:text-emerald-400">Privacy Policy</Link>
            <Link to="/legal/cookies" className="hover:text-emerald-400">Cookie Policy</Link>
            <Link to="/legal/refunds" className="hover:text-emerald-400">Refund Policy</Link>
          </div>
          <p>© 2026 ExploreTN. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}
