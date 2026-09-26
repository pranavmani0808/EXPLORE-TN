import { createFileRoute, Link } from "@tanstack/react-router";
import { Cookie, Settings2, ShieldCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/legal/cookies")({
  component: CookiePolicyPage,
});

export interface CookieSettings {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const COOKIE_CONSENT_KEY = "explorertn_cookie_preferences";

function CookiePolicyPage() {
  const [settings, setSettings] = useState<CookieSettings>({
    essential: true,
    analytics: true,
    marketing: false,
    preferences: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(settings));
    toast.success("Cookie preferences saved successfully!");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-emerald-400">
            <Cookie className="size-6 text-emerald-400" />
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
            Cookie Policy vs. Cookie Preferences
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Cookie Policy & Preferences</h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm">
            GDPR-compliant cookie transparency and user control center. Control what data ExploreTN stores on your device.
          </p>
        </div>

        {/* Preferences Control Panel */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 mb-12 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings2 className="size-5 text-emerald-400" /> Live Cookie Preferences Control
              </h2>
              <p className="text-xs text-slate-400">Toggle tracking permissions in real time.</p>
            </div>
            <Button size="sm" onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs">
              Save Settings
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div>
                <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                  Essential & Security Cookies <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Mandatory</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1">Used for user authentication, guest session drafts, map tile caching, and CSRF protection.</p>
              </div>
              <Switch checked disabled />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div>
                <h4 className="font-semibold text-white text-sm">Analytics & Route Performance</h4>
                <p className="text-xs text-slate-400 mt-1">Anonymized telemetry to help us speed up map route calculations and fix app errors.</p>
              </div>
              <Switch
                checked={settings.analytics}
                onCheckedChange={(checked) => setSettings((s) => ({ ...s, analytics: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div>
                <h4 className="font-semibold text-white text-sm">Personalization & Offline Maps</h4>
                <p className="text-xs text-slate-400 mt-1">Remembers your favorite districts, offline map boundaries, and customized travel filters.</p>
              </div>
              <Switch
                checked={settings.preferences}
                onCheckedChange={(checked) => setSettings((s) => ({ ...s, preferences: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div>
                <h4 className="font-semibold text-white text-sm">Partner Homestays & Marketing</h4>
                <p className="text-xs text-slate-400 mt-1">Used to showcase verified local homestays and eco-resort discounts based on your destination.</p>
              </div>
              <Switch
                checked={settings.marketing}
                onCheckedChange={(checked) => setSettings((s) => ({ ...s, marketing: checked }))}
              />
            </div>
          </div>
        </div>

        {/* Detailed Explanation */}
        <div className="prose prose-invert max-w-none space-y-8 text-slate-300 text-sm leading-relaxed">
          <section className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">1. What are Cookies?</h2>
            <p>Cookies are small text files placed on your browser or device when you visit ExploreTN. They allow us to store guest trip drafts for up to 30 days without forcing immediate account creation.</p>
          </section>

          <section className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">2. How to Clear Cookies</h2>
            <p>You can clear cookies directly through your browser settings or click "Save Settings" above with non-essential cookies disabled to erase analytics cookies immediately.</p>
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
