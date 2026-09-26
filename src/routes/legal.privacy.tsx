import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/legal/privacy")({
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-emerald-400">
            <Shield className="size-6 text-emerald-400" />
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-4 text-center mb-12">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            GDPR & CCPA Compliant
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Privacy Policy</h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm">
            How ExploreTN collects, uses, and safeguards your location data, trip preferences, and personal information when exploring Tamil Nadu.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-slate-300 text-sm leading-relaxed">
          <section className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Lock className="size-5 text-emerald-400" /> 1. Information We Collect
            </h2>
            <p>We collect minimal required information to deliver personalized trip itineraries and maps across Tamil Nadu:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2 text-slate-400">
              <li><strong className="font-medium text-slate-200">Account Data:</strong> Name, email address, profile picture (via Supabase Auth).</li>
              <li><strong className="font-medium text-slate-200">Location & Route Data:</strong> Precise GPS location when using live navigation (only with explicit permission).</li>
              <li><strong className="font-medium text-slate-200">Local Storage & Drafts:</strong> Unsaved trip drafts stored on your device via cookies and localStorage.</li>
            </ul>
          </section>

          <section className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Data</h2>
            <p>Your data is used solely to generate custom OSRM/Google Maps travel routes, save bookmarked places, and optimize app performance. We never sell your personal or location data to third-party advertisers.</p>
          </section>

          <section className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">3. Your Data Protection Rights (GDPR / CCPA)</h2>
            <p>You have full ownership of your data on ExploreTN. You can request data export, modification, or complete deletion of your account and saved trips at any time by contacting support or using Account Settings.</p>
          </section>

          <section className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">4. Contact Privacy Officer</h2>
            <p>For privacy inquiries or data requests, contact our Data Protection Officer at <a href="mailto:privacy@explorertn.com" className="text-emerald-400 underline">privacy@explorertn.com</a>.</p>
          </section>
        </div>

        {/* Navigation Footer */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <Link to="/legal/terms" className="hover:text-emerald-400">Terms of Service</Link>
            <Link to="/legal/cookies" className="hover:text-emerald-400">Cookie Policy</Link>
            <Link to="/legal/security" className="hover:text-emerald-400">Security & DPA</Link>
          </div>
          <p>© 2026 ExploreTN. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}
