import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Compass,
  Sparkles,
  MapPin,
  Car,
  Bike,
  Bus,
  Footprints,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  Sliders,
  Shield,
  Heart,
  Award,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { getCurrentAuthUser, updateProfileUser, UserProfile } from "@/lib/auth-rbac";
import { toast } from "sonner";

export interface UserTravelPreferences {
  name: string;
  username: string;
  email: string;
  phone: string;
  homeLocation: string;
  bio: string;
  emergencyContact: string;
  travelStyle: "Relaxed" | "Balanced" | "Adventure";
  transportMode: string[];
  tripPace: "Slow" | "Moderate" | "Fast";
  interests: string[];
  defaultTripDuration: number;
  defaultMode: string;
  avoidOptions: string[];
  preferOptions: string[];
  safetyAlertsEnabled: boolean;
  onboardingCompleted: boolean;
}

export const DEFAULT_PREFERENCES: UserTravelPreferences = {
  name: "",
  username: "",
  email: "",
  phone: "",
  homeLocation: "",
  bio: "",
  emergencyContact: "",
  travelStyle: "Balanced",
  transportMode: ["Car"],
  tripPace: "Moderate",
  interests: ["Mountains", "Waterfalls", "Temples", "Food"],
  defaultTripDuration: 3,
  defaultMode: "Car",
  avoidOptions: ["Toll roads"],
  preferOptions: ["Scenic routes", "Viewpoints"],
  safetyAlertsEnabled: true,
  onboardingCompleted: false,
};

function getPreferencesStorageKey(): string {
  if (typeof window === "undefined") return "etn_user_preferences_guest";
  try {
    const user = getCurrentAuthUser();
    if (user && user.id) {
      return `etn_user_preferences_${user.id}`;
    }
  } catch {}
  return "etn_user_preferences_guest";
}

export function getStoredPreferences(): UserTravelPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const key = getPreferencesStorageKey();
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch {
    // fallback
  }
  return DEFAULT_PREFERENCES;
}

export function saveStoredPreferences(prefs: Partial<UserTravelPreferences>) {
  if (typeof window === "undefined") return;
  const key = getPreferencesStorageKey();
  const current = getStoredPreferences();
  const updated = { ...current, ...prefs, onboardingCompleted: true };
  localStorage.setItem(key, JSON.stringify(updated));
  localStorage.setItem("etn_onboarding_completed", "true");
  window.dispatchEvent(new CustomEvent("etn_preferences_updated", { detail: updated }));
}

interface ExplorerOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export function ExplorerOnboardingModal({
  isOpen,
  onClose,
  onComplete,
}: ExplorerOnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [homeLocation, setHomeLocation] = useState("");
  const [bio, setBio] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  const [travelStyle, setTravelStyle] = useState<"Relaxed" | "Balanced" | "Adventure">("Balanced");
  const [transportMode, setTransportMode] = useState<string[]>(["Car"]);
  const [tripPace, setTripPace] = useState<"Slow" | "Moderate" | "Fast">("Moderate");
  const [interests, setInterests] = useState<string[]>([
    "Mountains",
    "Waterfalls",
    "Temples",
    "Food",
  ]);

  const [defaultTripDuration, setDefaultTripDuration] = useState(3);
  const [avoidOptions, setAvoidOptions] = useState<string[]>(["Toll roads"]);
  const [preferOptions, setPreferOptions] = useState<string[]>(["Scenic routes", "Viewpoints"]);
  const [safetyAlertsEnabled, setSafetyAlertsEnabled] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredPreferences();
      const u = getCurrentAuthUser();
      setCurrentUser(u);

      setName(stored.name || (u?.name ?? ""));
      setUsername(stored.username || (u?.email ? u.email.split("@")[0] : ""));
      setEmail(stored.email || (u?.email ?? ""));
      setPhone(stored.phone || "");
      setHomeLocation(stored.homeLocation || "");
      setBio(stored.bio || "");
      setEmergencyContact(stored.emergencyContact || "");

      setTravelStyle(stored.travelStyle || "Balanced");
      setTransportMode(stored.transportMode.length ? stored.transportMode : ["Car"]);
      setTripPace(stored.tripPace || "Moderate");
      setInterests(stored.interests.length ? stored.interests : ["Mountains", "Waterfalls"]);

      setDefaultTripDuration(stored.defaultTripDuration || 3);
      setAvoidOptions(stored.avoidOptions || ["Toll roads"]);
      setPreferOptions(stored.preferOptions || ["Scenic routes"]);
      setSafetyAlertsEnabled(stored.safetyAlertsEnabled ?? true);
      setStep(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const ALL_INTERESTS = [
    { label: "Mountains & Ghats", icon: "⛰️" },
    { label: "Waterfalls", icon: "🌊" },
    { label: "Temples & Heritage", icon: "🛕" },
    { label: "Beaches & Coast", icon: "🏖️" },
    { label: "Trekking & Trails", icon: "🥾" },
    { label: "Local Food Routes", icon: "🍲" },
    { label: "Wildlife & Forests", icon: "🐘" },
    { label: "Camping Spots", icon: "🏕️" },
    { label: "Photography Hotspots", icon: "📸" },
    { label: "Off-beat Hidden Gems", icon: "💎" },
  ];

  const toggleTransport = (mode: string) => {
    setTransportMode((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  const toggleInterest = (interestLabel: string) => {
    setInterests((prev) =>
      prev.includes(interestLabel)
        ? prev.filter((i) => i !== interestLabel)
        : [...prev, interestLabel]
    );
  };

  const toggleAvoid = (item: string) => {
    setAvoidOptions((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const togglePrefer = (item: string) => {
    setPreferOptions((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleFinish = () => {
    const finalPrefs: UserTravelPreferences = {
      name: name.trim() || "Explorer",
      username: username.trim() || (email ? email.split("@")[0] : "explorer_tn"),
      email: email.trim(),
      phone: phone.trim(),
      homeLocation: homeLocation.trim(),
      bio: bio.trim(),
      emergencyContact: emergencyContact.trim(),
      travelStyle,
      transportMode,
      tripPace,
      interests,
      defaultTripDuration,
      defaultMode: transportMode[0] || "Car",
      avoidOptions,
      preferOptions,
      safetyAlertsEnabled,
      onboardingCompleted: true,
    };

    saveStoredPreferences(finalPrefs);

    if (currentUser) {
      updateProfileUser({
        name: finalPrefs.name,
        email: finalPrefs.email,
      });
    }

    toast.success("Welcome to ExploreTN! Your explorer profile & preferences have been configured.", {
      icon: <CheckCircle2 className="size-4 text-emerald-400" />,
    });

    if (onComplete) onComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full max-w-2xl rounded-3xl bg-[#09090b] border border-zinc-800 shadow-[0_25px_80px_rgba(0,0,0,0.8)] text-white overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Top Header & Progress Stepper */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-amber-950/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-2xl bg-emerald-500 text-zinc-950 font-black shadow-lg shadow-emerald-500/25">
                <Compass className="size-6" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                  <span>Welcome to ExploreTN</span>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                    Step {step} of 4
                  </span>
                </h2>
                <p className="text-xs text-zinc-400">Set up your explorer profile & travel preferences</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="grid size-8 place-items-center rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition"
              title="Close setup modal"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Stepper Bar */}
          <div className="grid grid-cols-4 gap-2 mt-5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s <= step ? "bg-emerald-500 shadow-sm shadow-emerald-500/50" : "bg-zinc-800"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Scrollable Step Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: PERSONAL PROFILE IDENTITY */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <User className="size-4" />
                  <span>Step 1: Your Explorer Identity</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Tell us who you are so AI Trip Copilot can personalize your itineraries.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Pranav Mani"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Explorer Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. ghat_explorer_99"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. yourname@gmail.com"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Home Location / Base City</label>
                  <input
                    type="text"
                    value={homeLocation}
                    onChange={(e) => setHomeLocation(e.target.value)}
                    placeholder="e.g. Chennai, Coimbatore, Madurai..."
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Emergency Contact Number</label>
                  <input
                    type="tel"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="e.g. +91 98765 00000"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Explorer Bio & Travel Vision</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short line about your favorite travel style in Tamil Nadu..."
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </motion.div>
          )}

          {/* STEP 2: TRAVEL STYLE & TRANSPORT MODES */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <Compass className="size-4" />
                  <span>Step 2: Travel Style & Preferred Transport</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  How do you like to explore Tamil Nadu's ghat roads, heritage sites, and trails?
                </p>
              </div>

              {/* Travel Style Selector */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">Overall Travel Style</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { style: "Relaxed", desc: "Leisurely pace, frequent rest stops, luxury resorts" },
                    { style: "Balanced", desc: "Mix of top sightseeing, local food, and comfortable drives" },
                    { style: "Adventure", desc: "Trekking, hairpin ghat bends, waterfalls, early morning starts" },
                  ].map((item) => (
                    <button
                      key={item.style}
                      type="button"
                      onClick={() => setTravelStyle(item.style as any)}
                      className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition ${
                        travelStyle === item.style
                          ? "bg-emerald-500/15 border-emerald-500 text-white"
                          : "bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                      }`}
                    >
                      <span className="text-xs font-extrabold text-emerald-400 mb-1">{item.style}</span>
                      <span className="text-[10px] text-zinc-400 leading-relaxed">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Transport Mode */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Preferred Transport Modes (Select all that apply)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { mode: "Car", icon: Car, label: "Car / SUV" },
                    { mode: "Bike", icon: Bike, label: "Motorbike" },
                    { mode: "Public transport", icon: Bus, label: "Bus / Train" },
                    { mode: "Walking", icon: Footprints, label: "Trekking" },
                  ].map((t) => {
                    const Icon = t.icon;
                    const selected = transportMode.includes(t.mode);
                    return (
                      <button
                        key={t.mode}
                        type="button"
                        onClick={() => toggleTransport(t.mode)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition ${
                          selected
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <Icon className="size-4" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Trip Pace */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">Trip Pace Preference</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(["Slow", "Moderate", "Fast"] as const).map((pace) => (
                    <button
                      key={pace}
                      type="button"
                      onClick={() => setTripPace(pace)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                        tripPace === pace
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      {pace} Pace
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: CATEGORY INTEREST THEMES */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <Heart className="size-4" />
                  <span>Step 3: Favorite Categories & Interest Themes</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Select the types of destinations you enjoy visiting across Tamil Nadu's 38 districts.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {ALL_INTERESTS.map((item) => {
                  const isSelected = interests.includes(item.label);
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => toggleInterest(item.label)}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold transition ${
                        isSelected
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 4: AI PLANNER & SAFETY PREFERENCES */}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <Sparkles className="size-4" />
                  <span>Step 4: AI Trip Planner & Safety Alerts</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Configure default routing rules, avoiding ghat hazards, and safety push warnings.
                </p>
              </div>

              {/* Default Trip Duration */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-zinc-300">Default Trip Duration</label>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {defaultTripDuration} {defaultTripDuration === 1 ? "Day" : "Days"}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={7}
                  value={defaultTripDuration}
                  onChange={(e) => setDefaultTripDuration(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 bg-zinc-900 cursor-pointer"
                />
              </div>

              {/* Avoid Parameters */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">Avoid Parameters</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Toll roads", "Difficult ghat roads", "Unpaved roads", "Highways"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleAvoid(opt)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition text-left ${
                        avoidOptions.includes(opt)
                          ? "bg-amber-500/15 border-amber-500 text-amber-300"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      {avoidOptions.includes(opt) ? "✓ Avoid " : "+ Avoid "} {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prefer Parameters */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">Prefer Parameters</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Scenic routes", "Viewpoints", "Food stops", "Less crowded places"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => togglePrefer(opt)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition text-left ${
                        preferOptions.includes(opt)
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      {preferOptions.includes(opt) ? "✓ Prefer " : "+ Prefer "} {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ghat Safety Warnings */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-3">
                  <Shield className="size-5 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Ghat Road Safety Alerts</h4>
                    <p className="text-[10px] text-zinc-400">Hairpin bend, landslide & weather push alerts</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={safetyAlertsEnabled}
                  onChange={(e) => setSafetyAlertsEnabled(e.target.checked)}
                  className="size-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 rounded-xl transition"
            >
              <ChevronLeft className="size-4" />
              <span>Previous</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition"
            >
              Skip Setup
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-extrabold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition shadow-md shadow-emerald-500/20"
            >
              <span>Next Step</span>
              <ChevronRight className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-black text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition shadow-lg shadow-emerald-400/30"
            >
              <Check className="size-4" />
              <span>Save & Complete Setup</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
