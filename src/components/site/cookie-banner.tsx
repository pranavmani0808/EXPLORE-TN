import { useState, useEffect } from "react";
import { Cookie, ShieldCheck, Check, Settings2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";

export interface CookieSettings {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const COOKIE_CONSENT_KEY = "explorertn_cookie_preferences";

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [settings, setSettings] = useState<CookieSettings>({
    essential: true,
    analytics: true,
    marketing: false,
    preferences: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!saved) {
      setShowBanner(true);
    } else {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        setShowBanner(true);
      }
    }
  }, []);

  const savePreferences = (newSettings: CookieSettings) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(newSettings));
    setSettings(newSettings);
    setShowBanner(false);
    setShowModal(false);
  };

  const handleAcceptAll = () => {
    savePreferences({
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true,
    });
  };

  const handleRejectNonEssential = () => {
    savePreferences({
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false,
    });
  };

  if (!showBanner && !showModal) return null;

  return (
    <>
      {/* Cookie Banner */}
      {showBanner && (
        <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-lg z-50 p-5 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl text-slate-100 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <Cookie className="size-5" />
            </div>
            <div className="space-y-1.5 flex-1 text-sm">
              <h4 className="font-semibold text-white flex items-center gap-2">
                We value your privacy
              </h4>
              <p className="text-slate-300 text-xs leading-relaxed">
                ExploreTN uses cookies to enhance map caching, personalize trip routes, and analyze traffic. Under GDPR & CCPA, you can customize your preferences anytime.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => setShowModal(true)}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium underline flex items-center gap-1"
            >
              <Settings2 className="size-3.5" /> Customize
            </button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectNonEssential}
                className="text-xs h-8 border-slate-700 hover:bg-slate-800 text-slate-300"
              >
                Reject Non-Essential
              </Button>
              <Button
                size="sm"
                onClick={handleAcceptAll}
                className="text-xs h-8 bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <ShieldCheck className="size-5 text-emerald-400" />
              Cookie Preferences & GDPR Control
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Manage your consent choices for tracking and data storage on ExploreTN. Read our{" "}
              <Link to="/legal/privacy" className="text-emerald-400 underline">Privacy Policy</Link> and{" "}
              <Link to="/legal/cookies" className="text-emerald-400 underline">Cookie Policy</Link>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Essential */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-white flex items-center gap-2">
                  Essential Cookies <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Always Active</span>
                </Label>
                <p className="text-xs text-slate-400">Required for authentication, session saving, and map tiles.</p>
              </div>
              <Switch checked disabled />
            </div>

            {/* Analytics */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-white">Performance & Analytics</Label>
                <p className="text-xs text-slate-400">Helps us optimize map loading speeds and route calculations.</p>
              </div>
              <Switch
                checked={settings.analytics}
                onCheckedChange={(checked) => setSettings((s) => ({ ...s, analytics: checked }))}
              />
            </div>

            {/* Preferences */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-white">Saved Preferences</Label>
                <p className="text-xs text-slate-400">Remembers your map view settings, default district, and offline routes.</p>
              </div>
              <Switch
                checked={settings.preferences}
                onCheckedChange={(checked) => setSettings((s) => ({ ...s, preferences: checked }))}
              />
            </div>

            {/* Marketing */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-white">Marketing & Partner Offers</Label>
                <p className="text-xs text-slate-400">Used for recommended eco-resorts and local homestays.</p>
              </div>
              <Switch
                checked={settings.marketing}
                onCheckedChange={(checked) => setSettings((s) => ({ ...s, marketing: checked }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowModal(false)}
              className="text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => savePreferences(settings)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Save Preferences
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
