import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard, Check, Sparkles, AlertCircle, ShieldCheck, HeartHandshake, X } from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/billing")({
  component: BillingPage,
});

function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState<"free" | "pro" | "agency">("pro");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelStep, setCancelStep] = useState<"survey" | "retention_offer" | "confirmed">("survey");
  const [hasAppliedDiscount, setHasAppliedDiscount] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  const handlePauseSubscription = () => {
    toast.success("Subscription paused for 30 days! You won't be billed.");
    setShowCancelModal(false);
  };

  const handleAcceptDiscount = () => {
    if (hasAppliedDiscount) {
      toast.info("50% retention discount has already been applied to your account.");
      setShowCancelModal(false);
      return;
    }
    setHasAppliedDiscount(true);
    toast.success("50% discount applied to your next 3 months!");
    setShowCancelModal(false);
  };

  const handleConfirmCancel = () => {
    setCurrentPlan("free");
    setCancelStep("confirmed");
    toast.info("Your subscription will expire at the end of the current billing cycle.");
    setShowCancelModal(false);
  };

  const handlePlanUpgrade = (plan: "free" | "pro" | "agency") => {
    if (!acceptedTerms) {
      toast.error("Please accept the Terms of Service to upgrade your plan.");
      return;
    }
    if (isProcessing) return;
    setIsProcessing(true);
    setCurrentPlan(plan);
    toast.success(`Successfully updated plan to ${plan.toUpperCase()}!`);
    setTimeout(() => setIsProcessing(false), 800);
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 pt-28 pb-20 font-sans text-slate-100">
        {/* Header */}
        <div className="mb-10 text-center space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Account Billing & Subscription Management
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Billing & Membership</h1>
          <p className="text-slate-400 text-xs max-w-xl mx-auto">
            Manage your ExploreTN plan, payment methods, invoices, and premium offline map downloads.
          </p>
        </div>

        {/* Current Active Plan Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Active Subscription</span>
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
              Pro Adventurer Plan <Sparkles className="size-4 text-emerald-400 fill-emerald-400" />
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              ₹499 / month • Renews October 21, 2026 • Includes unlimited OSRM route calculations & offline maps.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCancelStep("survey");
                setShowCancelModal(true);
              }}
              className="border-rose-900/50 text-rose-300 hover:bg-rose-950/50 text-xs"
            >
              Cancel Subscription
            </Button>
          </div>
        </div>

        {/* Available Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Free Plan */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="font-bold text-lg text-white">Free Explorer</h4>
              <p className="text-xs text-slate-400">Essential map navigation and basic place bookmarking.</p>
              <div className="text-2xl font-extrabold text-white">₹0 <span className="text-xs text-slate-400 font-normal">/ forever</span></div>
              <ul className="space-y-2 text-xs text-slate-300 pt-2">
                <li className="flex items-center gap-2"><Check className="size-3.5 text-emerald-400" /> Basic Leaflet / Google Maps</li>
                <li className="flex items-center gap-2"><Check className="size-3.5 text-emerald-400" /> 3 saved itineraries</li>
                <li className="flex items-center gap-2"><Check className="size-3.5 text-emerald-400" /> Guest draft auto-saving</li>
              </ul>
            </div>
            {currentPlan === "free" ? (
              <Button disabled className="w-full mt-6 text-xs bg-slate-800 text-slate-400">Current Plan</Button>
            ) : (
              <Button onClick={() => setCurrentPlan("free")} variant="outline" className="w-full mt-6 text-xs border-slate-700">Downgrade to Free</Button>
            )}
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-b from-emerald-950/40 to-slate-900 border-2 border-emerald-500/80 rounded-2xl p-6 flex flex-col justify-between relative shadow-xl shadow-emerald-500/10">
            <div className="absolute -top-3 right-4 bg-emerald-500 text-black text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              Most Popular
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-lg text-white">Pro Adventurer</h4>
              <p className="text-xs text-slate-400">Full OSRM Overtaking curves, AI itineraries & offline maps.</p>
              <div className="text-2xl font-extrabold text-white">₹499 <span className="text-xs text-slate-400 font-normal">/ month</span></div>
              <ul className="space-y-2 text-xs text-slate-200 pt-2">
                <li className="flex items-center gap-2"><Check className="size-3.5 text-emerald-400" /> Unlimited OSRM route curves</li>
                <li className="flex items-center gap-2"><Check className="size-3.5 text-emerald-400" /> Offline map downloads</li>
                <li className="flex items-center gap-2"><Check className="size-3.5 text-emerald-400" /> Priority AI travel planner</li>
                <li className="flex items-center gap-2"><Check className="size-3.5 text-emerald-400" /> Waterfall & Ghat weather alerts</li>
              </ul>
            </div>
            {currentPlan === "pro" ? (
              <Button disabled className="w-full mt-6 text-xs bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">Active Plan</Button>
            ) : (
              <Button onClick={() => setCurrentPlan("pro")} className="w-full mt-6 text-xs bg-emerald-600 hover:bg-emerald-500 text-white">Upgrade to Pro</Button>
            )}
          </div>

          {/* Enterprise Plan */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="font-bold text-lg text-white">Agency & Enterprise</h4>
              <p className="text-xs text-slate-400">For tour operators, travel agencies, and hotel chains.</p>
              <div className="text-2xl font-extrabold text-white">₹2,499 <span className="text-xs text-slate-400 font-normal">/ month</span></div>
              <ul className="space-y-2 text-xs text-slate-300 pt-2">
                <li className="flex items-center gap-2"><Check className="size-3.5 text-emerald-400" /> Custom white-label maps</li>
                <li className="flex items-center gap-2"><Check className="size-3.5 text-emerald-400" /> API access & DPA agreement</li>
                <li className="flex items-center gap-2"><Check className="size-3.5 text-emerald-400" /> 24/7 priority SLA support</li>
              </ul>
            </div>
            <Button onClick={() => setCurrentPlan("agency")} variant="outline" className="w-full mt-6 text-xs border-slate-700">Contact Sales / Upgrade</Button>
          </div>
        </div>

        {/* Retention / Cancel Subscription Modal */}
        <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
          <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-slate-100">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <HeartHandshake className="size-5 text-emerald-400" />
                We'd hate to see you go!
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Cancel Subscription is a retention experience: let us help you find the right option before leaving for good.
              </DialogDescription>
            </DialogHeader>

            {cancelStep === "survey" && (
              <div className="space-y-4 py-2">
                <p className="text-xs text-slate-300 font-medium">Why are you considering cancelling Pro?</p>
                <div className="space-y-2 text-xs">
                  <button onClick={() => setCancelStep("retention_offer")} className="w-full text-left p-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200">
                    "I'm not traveling right now"
                  </button>
                  <button onClick={() => setCancelStep("retention_offer")} className="w-full text-left p-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200">
                    "It's too expensive for my budget"
                  </button>
                  <button onClick={() => setCancelStep("retention_offer")} className="w-full text-left p-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200">
                    "Missing a specific district or trail"
                  </button>
                </div>
              </div>
            )}

            {cancelStep === "retention_offer" && (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2">
                  <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                    🎁 Exclusive Retention Offer
                  </h4>
                  <p className="text-slate-300">
                    Instead of cancelling, take **50% OFF** your next 3 months (₹249/mo), or **Pause your account for 30 days** at zero cost.
                  </p>
                </div>

                <div className="space-y-2">
                  <Button onClick={handleAcceptDiscount} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5">
                    Claim 50% Off for 3 Months
                  </Button>
                  <Button onClick={handlePauseSubscription} variant="outline" className="w-full border-slate-700 text-slate-200 text-xs">
                    Pause Subscription for 30 Days
                  </Button>
                  <button onClick={handleConfirmCancel} className="w-full text-center text-xs text-rose-400 hover:underline pt-2">
                    No thanks, confirm full cancellation
                  </button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
