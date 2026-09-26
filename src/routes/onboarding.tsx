import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Compass, Sparkles, Check, ArrowRight, MapPin, Heart, Shield, Camera, User, FileText } from "lucide-react";
import { ExploreModuleWizard, WizardStep } from "@/components/site/explore-module-wizard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

const WIZARD_STEPS: WizardStep[] = [
  { id: "identity", number: 1, title: "Explorer Identity", subtitle: "Handle, Profile Photo & Base Location" },
  { id: "styles", number: 2, title: "Travel Preferences", subtitle: "Trekking, Heritage & Food Interests" },
  { id: "districts", number: 3, title: "Target Destinations", subtitle: "Districts & Regions of Interest" },
  { id: "tier", number: 4, title: "Travel Tier & Transit", subtitle: "Budget Tier & Vehicle Preference" },
  { id: "declarations", number: 5, title: "Consent & Safety", subtitle: "Trail Safety Rules & Pass Issuance" },
];

const TRAVEL_STYLES = [
  { id: "adventure", label: "Trekking & Waterfalls", icon: "⛰️", desc: "Western Ghats, waterfalls & wildlife trails" },
  { id: "heritage", label: "Temple & Heritage", icon: "🛕", desc: "Dravidian architecture & ancient monuments" },
  { id: "coastal", label: "Coastal & Beaches", icon: "🌊", desc: "Coromandel coast, Rameshwaram & Kanyakumari" },
  { id: "food", label: "Food & Culinary Routes", icon: "🍛", desc: "Chettinad spices, Madurai street food & filter coffee" },
  { id: "hillstation", label: "Hill Escapes & Tea Gardens", icon: "🍃", desc: "Ooty, Kodaikanal, Valparai & Meghamalai" },
];

const DISTRICT_SELECTIONS = [
  "Nilgiris (Ooty)",
  "Dindigul (Kodaikanal)",
  "Madurai",
  "Thanjavur",
  "Kanyakumari",
  "Chennai",
  "Coimbatore & Valparai",
  "Theni & Meghamalai",
];

function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // Form State
  const [explorerHandle, setExplorerHandle] = useState("ExploreTN Traveler");
  const [baseCity, setBaseCity] = useState("Chennai");
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["adventure", "heritage"]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>(["Nilgiris (Ooty)", "Madurai"]);
  const [budgetTier, setBudgetTier] = useState<"budget" | "standard" | "luxury">("standard");
  const [agreedToSafety, setAgreedToSafety] = useState(true);

  const toggleStyle = (id: string) => {
    setSelectedStyles((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleDistrict = (district: string) => {
    setSelectedDistricts((prev) =>
      prev.includes(district) ? prev.filter((d) => d !== district) : [...prev, district]
    );
  };

  const handleFinishOnboarding = () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "explorertn_user_onboarding",
          JSON.stringify({
            explorerHandle,
            baseCity,
            selectedStyles,
            selectedDistricts,
            budgetTier,
            completedAt: new Date().toISOString(),
          })
        );
      }
    } catch (err) {
      console.warn("Storage operation skipped in onboarding:", err);
    }
    toast.success("Explorer Registration Complete! Welcome to ExploreTN.");
    navigate({ to: "/planner" });
  };

  return (
    <ExploreModuleWizard
      moduleCategory="EXPLORER REGISTRATION MODULE"
      moduleTitle="Create Your Candidate Profile"
      moduleSubtitle="Use the progress menu on the left to track your trail onboarding setup"
      steps={WIZARD_STEPS}
      currentStepIndex={currentStepIndex}
      onSelectStep={(idx) => setCurrentStepIndex(idx)}
      onNextStep={() => setCurrentStepIndex((prev) => Math.min(WIZARD_STEPS.length - 1, prev + 1))}
      onPrevStep={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
      onComplete={handleFinishOnboarding}
    >
      {/* STEP 1: EXPLORER IDENTITY */}
      {currentStepIndex === 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Photo Capture / Avatar Box */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Camera className="size-4" />
                <span>PROFILE AVATAR PHOTO</span>
              </div>
              
              <div className="size-28 mx-auto rounded-full bg-zinc-900 border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center text-zinc-400 hover:border-amber-400/60 transition cursor-pointer">
                <User className="size-8 text-amber-400/80 mb-1" />
                <span className="text-[10px] font-semibold">Upload Photo</span>
              </div>

              {/* Photo Guidelines Callout Box */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 space-y-2 text-xs text-amber-200/90">
                <p className="font-bold text-amber-300 flex items-center gap-1.5">
                  <span>⚠️ Photo Guidelines</span>
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-zinc-400">
                  <li>Face should be clearly visible</li>
                  <li>Good lighting without harsh outdoor glare</li>
                  <li>Clear portrait or adventure outdoor gear shot</li>
                </ul>
              </div>
            </div>

            {/* Identity Fields */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Explorer Handle / Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={explorerHandle}
                  onChange={(e) => setExplorerHandle(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  placeholder="e.g. Pranav R (Madurai Explorer)"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Home Base City <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={baseCity}
                  onChange={(e) => setBaseCity(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  placeholder="e.g. Chennai / Coimbatore"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: TRAVEL STYLES */}
      {currentStepIndex === 1 && (
        <div className="space-y-6">
          <p className="text-xs text-zinc-400">Select all travel styles that match your Tamil Nadu interests.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TRAVEL_STYLES.map((style) => {
              const isSelected = selectedStyles.includes(style.id);
              return (
                <div
                  key={style.id}
                  onClick={() => toggleStyle(style.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10 text-white"
                      : "bg-zinc-950/50 border-zinc-800 hover:border-zinc-700 text-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{style.icon}</span>
                    {isSelected && <Check className="size-4 text-amber-400" />}
                  </div>
                  <h4 className="font-bold text-sm mt-2">{style.label}</h4>
                  <p className="text-xs text-zinc-400 mt-1">{style.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: TARGET DESTINATIONS */}
      {currentStepIndex === 2 && (
        <div className="space-y-6">
          <p className="text-xs text-zinc-400">We'll prioritize routes & hidden spots near your chosen destinations.</p>
          <div className="flex flex-wrap gap-2.5">
            {DISTRICT_SELECTIONS.map((district) => {
              const isSelected = selectedDistricts.includes(district);
              return (
                <button
                  key={district}
                  type="button"
                  onClick={() => toggleDistrict(district)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition ${
                    isSelected
                      ? "bg-amber-400 text-zinc-950 border-amber-300 font-extrabold shadow-md shadow-amber-500/20"
                      : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                  }`}
                >
                  <MapPin className="size-3.5" />
                  {district}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 4: BUDGET TIER */}
      {currentStepIndex === 3 && (
        <div className="space-y-6">
          <p className="text-xs text-zinc-400">Used by AI Travel Planner to recommend appropriate stays and food joints.</p>
          <div className="space-y-3">
            {[
              { id: "budget", label: "Budget Explorer", price: "₹800 - ₹2,000 / day", desc: "Backpacker hostels, local state buses, authentic mess food" },
              { id: "standard", label: "Standard Traveler", price: "₹2,000 - ₹5,000 / day", desc: "Boutique stays, rental bikes/cars, multi-cuisine dining" },
              { id: "luxury", label: "Luxury & Heritage Stays", price: "₹5,000+ / day", desc: "Palace hotels, private chauffeur drivers, fine dining" },
            ].map((tier) => (
              <div
                key={tier.id}
                onClick={() => setBudgetTier(tier.id as any)}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  budgetTier === tier.id
                    ? "bg-amber-500/10 border-amber-500/60 text-white"
                    : "bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white">{tier.label}</h4>
                  <span className="text-xs font-mono text-amber-400">{tier.price}</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">{tier.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 5: CONSENT & SAFETY */}
      {currentStepIndex === 4 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 space-y-3">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Shield className="size-4 text-emerald-400" />
              <span>Ghat Trail Safety & Eco-Travel Commitment</span>
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              By completing your Explorer Registration, you agree to comply with Forest Department guidelines in Western Ghats reserve areas, respect local heritage customs at Dravidian temple sites, and maintain non-polluting travel habits.
            </p>

            <label className="flex items-center gap-2.5 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToSafety}
                onChange={(e) => setAgreedToSafety(e.target.checked)}
                className="size-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-400"
              />
              <span className="text-xs text-zinc-300 font-medium">
                I agree to the ExploreTN Community Safety & Eco-Travel Guidelines
              </span>
            </label>
          </div>
        </div>
      )}
    </ExploreModuleWizard>
  );
}
