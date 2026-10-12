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
        <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-lg z-50 p-5 rounded-2xl bg-white/95 border border-sky-100 shadow-2xl backdrop-blur-xl text-slate-800 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-200 shrink-0">
              <Cookie className="size-5 text-sky-600" />
            </div>
            <div className="space-y-1.5 flex-1 text-sm">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                We value your privacy
              </h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                ExploreTN uses cookies to enhance map caching, personalize trip routes, and analyze traffic. Under GDPR & CCPA, you can customize your preferences anytime.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => setShowModal(true)}
              className="text-xs text-sky-600 hover:text-sky-700 font-bold underline flex items-center gap-1 cursor-pointer"
            >
              <Settings2 className="size-3.5" /> Customize
            </button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectNonEssential}
                className="text-xs h-8 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl"
              >
                Reject Non-Essential
              </Button>
              <Button
                size="sm"
                onClick={handleAcceptAll}
                className="text-xs h-8 bg-sky-600 hover:bg-sky-500 text-white font-extrabold rounded-xl shadow-sm shadow-sky-600/20"
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md bg-white border-sky-100 text-slate-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 font-bold">
              <ShieldCheck className="size-5 text-sky-600" />
              Cookie Preferences & GDPR Control
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-xs">
              Manage your consent choices for tracking and data storage on ExploreTN. Read our{" "}
              <Link to="/legal/privacy" className="text-sky-600 font-semibold underline">Privacy Policy</Link> and{" "}
              <Link to="/legal/cookies" className="text-sky-600 font-semibold underline">Cookie Policy</Link>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            {/* Essential */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  Essential Cookies <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200 font-mono font-bold">Always Active</span>
                </Label>
                <p className="text-xs text-slate-500">Required for authentication, session saving, and map tiles.</p>
              </div>
              <Switch checked disabled />
            </div>

            {/* Analytics */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-slate-900">Performance & Analytics</Label>
                <p className="text-xs text-slate-500">Helps us optimize map loading speeds and route calculations.</p>
              </div>
              <Switch
                checked={settings.analytics}
                onCheckedChange={(checked) => setSettings((s) => ({ ...s, analytics: checked }))}
              />
            </div>

            {/* Preferences */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-slate-900">Saved Preferences</Label>
                <p className="text-xs text-slate-500">Remembers your map view settings, default district, and offline routes.</p>
              </div>
              <Switch
                checked={settings.preferences}
                onCheckedChange={(checked) => setSettings((s) => ({ ...s, preferences: checked }))}
              />
            </div>

            {/* Marketing */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-slate-900">Marketing & Partner Offers</Label>
                <p className="text-xs text-slate-500">Used for recommended eco-resorts and local homestays.</p>
              </div>
              <Switch
                checked={settings.marketing}
                onCheckedChange={(checked) => setSettings((s) => ({ ...s, marketing: checked }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowModal(false)}
              className="text-slate-600 hover:text-slate-900 border-slate-200 font-bold rounded-xl"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => savePreferences(settings)}
              className="bg-sky-600 hover:bg-sky-500 text-white font-extrabold rounded-xl shadow-sm shadow-sky-600/20"
            >
              Save Preferences
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
