import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Key, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/legal/security")({
  component: SecurityPolicyPage,
});

function SecurityPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-emerald-400">
            <ShieldCheck className="size-6 text-emerald-400" />
            <span>ExploreTN Security Hub</span>
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
            Enterprise Grade Security & Compliance
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Security Policy & Responsible Disclosure</h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm">
            Data processing agreement (DPA), infrastructure security controls, encryption protocols, and vulnerability disclosure program.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-slate-300 text-sm leading-relaxed">
          <section className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">1. Security Architecture & Encryption</h2>
            <p>All data in transit is encrypted using TLS 1.3, and data at rest is secured via AES-256 bit encryption powered by Supabase PostgreSQL infrastructure. We enforce strict Row Level Security (RLS) across all user databases.</p>
          </section>

          <section className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">2. Data Processing Agreement (DPA)</h2>
            <p>For tour operators, travel agencies, and corporate clients using ExploreTN enterprise APIs, our standardized DPA guarantees compliance with GDPR Article 28 data processing guidelines.</p>
          </section>

          <section className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">3. Responsible Disclosure Bug Bounty</h2>
            <p>We welcome security researchers to inspect our platform. If you discover a security vulnerability, please submit your findings to <a href="mailto:security@explorertn.com" className="text-emerald-400 underline">security@explorertn.com</a>. We respond to valid reports within 24 hours.</p>
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
