import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/legal/community-guidelines")({
  component: CommunityGuidelinesPage,
});

function CommunityGuidelinesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-emerald-400">
            <Users className="size-6 text-emerald-400" />
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
            Acceptable Use & Code of Conduct
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Community Guidelines & Acceptable Use</h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm">
            Fostering respectful travel sharing, eco-friendly tourism, and authentic trail reviews across Tamil Nadu.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-slate-300 text-sm leading-relaxed">
          <section className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">1. Leave No Trace & Eco-Responsibility</h2>
            <p>We mandate eco-friendly tourism. Users must not post or encourage trespassing into restricted forest reserves, littering near water bodies, or disturbing wildlife in Western Ghats biosphere reserves.</p>
          </section>

          <section className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">2. Authentic Reviews & Safety Hazards</h2>
            <p>Reviews must reflect genuine travel experiences. Misleading safety ratings, fake reviews, or hiding road hazards will result in immediate account restriction.</p>
          </section>

          <section className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">3. Acceptable Use Policy</h2>
            <p>Scraping map tiles, automated bot attacks, or abusing AI travel planning endpoints is strictly prohibited and subject to IP banning.</p>
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
