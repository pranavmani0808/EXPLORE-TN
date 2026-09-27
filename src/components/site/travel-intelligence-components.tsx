import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ParkingCircle,
  Car,
  Bike,
  Coins,
  MapPin,
  Compass,
  AlertTriangle,
  Route as RouteIcon,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Signal,
  Bus,
  Wrench,
  Fuel,
  Users,
  Footprints,
  Calendar,
  Shirt,
  Camera,
  Ticket,
  Lightbulb,
  Share2,
  Plus,
  ThumbsUp,
  X,
  Navigation,
  Info,
  ChevronRight,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PlaceTravelIntelligence,
  NearbySpotGeo,
  NearbyDistanceTier,
  IntentCategory,
  SmartMiniItinerary,
  CommunityReport,
  submitCommunityReport,
  upvoteCommunityReport,
  getCommunityReports,
} from "@/lib/data/travel-intelligence";
import { useAuthGuard } from "@/lib/auth-guard-context";

// ---------------------------------------------------------
// 1. PARKING & ROAD CONDITION INTELLIGENCE COMPONENT
// ---------------------------------------------------------
export function PlaceTravelInformationSection({ intel }: { intel: PlaceTravelIntelligence }) {
  const [activeTab, setActiveTab] = useState<"parking" | "road" | "before_you_go">("parking");

  const roadBadgeColor =
    intel.roadCondition.condition === "Excellent"
      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
      : intel.roadCondition.condition === "Good"
      ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30"
      : intel.roadCondition.condition === "Moderate"
      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
      : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-xl space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              TRAVEL & ACCESSIBILITY INTELLIGENCE
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground mt-1">
            Travel Information & Access
          </h2>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-accent/50 p-1 rounded-2xl border border-border/40 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("parking")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === "parking"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🅿️ Parking
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("road")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === "road"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🛣️ Road Condition
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("before_you_go")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === "before_you_go"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            💡 Before You Go
          </button>
        </div>
      </div>

      {/* 🅿️ PARKING TAB CONTENT */}
      {activeTab === "parking" && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-2xl bg-accent/30 border border-border/40 space-y-1">
              <p className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                <Car className="size-3.5 text-blue-500" /> Car Parking
              </p>
              <p className="text-sm font-bold text-foreground">
                {intel.parking.carParking}
                {intel.parking.capacityCars && (
                  <span className="text-xs font-normal text-muted-foreground ml-1 font-mono">
                    ({intel.parking.capacityCars})
                  </span>
                )}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-accent/30 border border-border/40 space-y-1">
              <p className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                <Bike className="size-3.5 text-emerald-500" /> Bike Parking
              </p>
              <p className="text-sm font-bold text-foreground">
                {intel.parking.bikeParking}
                {intel.parking.capacityBikes && (
                  <span className="text-xs font-normal text-muted-foreground ml-1 font-mono">
                    ({intel.parking.capacityBikes})
                  </span>
                )}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-accent/30 border border-border/40 space-y-1">
              <p className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                <Coins className="size-3.5 text-amber-500" /> Parking Type
              </p>
              <p className="text-sm font-bold text-foreground">
                {intel.parking.parkingType}
                {intel.parking.parkingFeeDetails && (
                  <span className="block text-[11px] font-medium text-muted-foreground mt-0.5">
                    {intel.parking.parkingFeeDetails}
                  </span>
                )}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-accent/30 border border-border/40 space-y-1">
              <p className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                <MapPin className="size-3.5 text-rose-500" /> Parking Distance
              </p>
              <p className="text-xs font-bold text-foreground leading-snug">
                {intel.parking.parkingDistance}
              </p>
            </div>
          </div>

          {/* Parking Notes & Location Link */}
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <ParkingCircle className="size-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-foreground">Parking Advisory Notes</p>
                <p className="text-xs text-muted-foreground mt-0.5">{intel.parking.parkingNotes}</p>
              </div>
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`parking in ${intel.placeName}, ${intel.district}`)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shrink-0 self-start sm:self-auto"
            >
              <Navigation className="size-3.5" /> Parking Location on Map
            </a>
          </div>
        </div>
      )}

      {/* 🛣️ ROAD CONDITION TAB CONTENT */}
      {activeTab === "road" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className={`px-4 py-2 rounded-2xl border ${roadBadgeColor} flex items-center gap-2`}>
              <RouteIcon className="size-4" />
              <span className="text-xs font-extrabold uppercase tracking-wider">
                Road Condition: {intel.roadCondition.condition}
              </span>
            </div>
            <span className="text-xs font-mono text-muted-foreground bg-accent/40 px-3 py-2 rounded-xl border border-border/40">
              {intel.roadCondition.roadType}
            </span>
          </div>

          {/* Vehicle Accessibility Badges */}
          <div>
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Supported Vehicle Accessibility
            </p>
            <div className="flex flex-wrap gap-2">
              {intel.roadCondition.vehicleAccess.map((v) => (
                <span
                  key={v}
                  className="px-3 py-1.5 rounded-xl bg-accent/60 border border-border/40 text-xs font-bold text-foreground flex items-center gap-1.5"
                >
                  <CheckCircle2 className="size-3.5 text-emerald-500" /> {v}
                </span>
              ))}
            </div>
          </div>

          {/* Specific Road Features Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-3 rounded-2xl bg-accent/30 border border-border/40 flex items-center justify-between">
              <span className="text-muted-foreground">Potholes:</span>
              <span className={`font-bold ${intel.roadCondition.potholes ? "text-amber-500" : "text-emerald-500"}`}>
                {intel.roadCondition.potholes ? "Present" : "Clean"}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-accent/30 border border-border/40 flex items-center justify-between">
              <span className="text-muted-foreground">Narrow Lanes:</span>
              <span className={`font-bold ${intel.roadCondition.narrowRoads ? "text-amber-500" : "text-emerald-500"}`}>
                {intel.roadCondition.narrowRoads ? "Yes" : "No"}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-accent/30 border border-border/40 flex items-center justify-between">
              <span className="text-muted-foreground">Steep Climb:</span>
              <span className={`font-bold ${intel.roadCondition.steepClimb ? "text-amber-500" : "text-emerald-500"}`}>
                {intel.roadCondition.steepClimb ? "Yes" : "Flat"}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-accent/30 border border-border/40 flex items-center justify-between">
              <span className="text-muted-foreground">Unpaved Stretches:</span>
              <span className={`font-bold ${intel.roadCondition.unpavedSections ? "text-amber-500" : "text-emerald-500"}`}>
                {intel.roadCondition.unpavedSections ? "Yes" : "None"}
              </span>
            </div>
          </div>

          {/* ⛰️ HILL / GHAT ROAD SAFETY WARNING SECTION */}
          {intel.hillGhatSafety.isHillGhatRoad && (
            <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-amber-500" />
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-amber-500">
                  Hill & Ghat Road Safety Advisory
                </h4>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                {intel.hillGhatSafety.hairpinBends && (
                  <div className="p-3 rounded-2xl bg-background/60 border border-amber-500/20">
                    <p className="font-mono text-[10px] text-amber-500 uppercase font-bold">Hairpin Bends Count</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">
                      🔄 {intel.hillGhatSafety.hairpinBends} Hairpin Bends
                    </p>
                  </div>
                )}

                {intel.hillGhatSafety.steepAdvisory && (
                  <div className="p-3 rounded-2xl bg-background/60 border border-amber-500/20">
                    <p className="font-mono text-[10px] text-amber-500 uppercase font-bold">Steep Incline Warning</p>
                    <p className="text-xs text-foreground mt-0.5">{intel.hillGhatSafety.steepAdvisory}</p>
                  </div>
                )}

                {intel.hillGhatSafety.landslideWarning && (
                  <div className="p-3 rounded-2xl bg-background/60 border border-amber-500/20">
                    <p className="font-mono text-[10px] text-amber-500 uppercase font-bold">Monsoon & Landslide Alert</p>
                    <p className="text-xs text-foreground mt-0.5">{intel.hillGhatSafety.landslideWarning}</p>
                  </div>
                )}

                {intel.hillGhatSafety.nightDrivingAdvisory && (
                  <div className="p-3 rounded-2xl bg-background/60 border border-amber-500/20">
                    <p className="font-mono text-[10px] text-amber-500 uppercase font-bold">Night Driving Restrictions</p>
                    <p className="text-xs text-foreground mt-0.5">{intel.hillGhatSafety.nightDrivingAdvisory}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 💡 BEFORE YOU GO TAB CONTENT */}
      {activeTab === "before_you_go" && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 rounded-2xl bg-accent/30 border border-border/40 space-y-1">
              <p className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                <Clock className="size-3.5 text-emerald-500" /> Best Time to Arrive
              </p>
              <p className="text-xs font-bold text-foreground">{intel.beforeYouGo.bestTimeToArrive}</p>
            </div>

            {intel.beforeYouGo.dressCodeEtiquette && (
              <div className="p-4 rounded-2xl bg-accent/30 border border-border/40 space-y-1">
                <p className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  <Shirt className="size-3.5 text-indigo-500" /> Dress Code & Etiquette
                </p>
                <p className="text-xs text-foreground font-medium">{intel.beforeYouGo.dressCodeEtiquette}</p>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-accent/30 border border-border/40 space-y-1">
              <p className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                <Users className="size-3.5 text-amber-500" /> Peak Crowd Hours
              </p>
              <p className="text-xs font-bold text-foreground">{intel.beforeYouGo.peakCrowdHours}</p>
            </div>

            <div className="p-4 rounded-2xl bg-accent/30 border border-border/40 space-y-1">
              <p className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                <Camera className="size-3.5 text-cyan-500" /> Camera & Mobile Policy
              </p>
              <p className="text-xs text-foreground font-medium">{intel.beforeYouGo.cameraMobilePolicy}</p>
            </div>

            <div className="p-4 rounded-2xl bg-accent/30 border border-border/40 space-y-1">
              <p className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                <Ticket className="size-3.5 text-purple-500" /> Entry Fee & Rules
              </p>
              <p className="text-xs font-bold text-foreground">{intel.beforeYouGo.entryFeeDetails}</p>
            </div>

            <div className="p-4 rounded-2xl bg-accent/30 border border-border/40 space-y-1">
              <p className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                <Calendar className="size-3.5 text-rose-500" /> Operating Timings
              </p>
              <p className="text-xs font-bold text-foreground">{intel.beforeYouGo.timings}</p>
            </div>
          </div>

          {/* Travel Tips Card */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
            <p className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider font-mono">
              <Lightbulb className="size-4 text-amber-400" /> Verified Travel Tips
            </p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {intel.beforeYouGo.travelTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="size-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------
// 2. SOLO TRAVELER MODE PERSPECTIVE CARD
// ---------------------------------------------------------
export function SoloTravelerSection({ intel }: { intel: PlaceTravelIntelligence }) {
  const [activeTab, setActiveTab] = useState<"safety" | "transit" | "biker">("safety");

  return (
    <section className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 via-card to-card p-6 shadow-xl space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-500 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              SOLO TRAVELER MODE
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground mt-1">
            Solo Traveler Perspective
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Objective safety signals, mobile connectivity, public transport, and solo crowd levels.
          </p>
        </div>

        {/* Perspective Filters */}
        <div className="flex items-center gap-1 bg-accent/50 p-1 rounded-2xl border border-border/40 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("safety")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === "safety" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            🛡️ Safety & Signal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("transit")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === "transit" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            🚌 Public Transit
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("biker")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === "biker" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            🏍️ Biker & Fuel
          </button>
        </div>
      </div>

      {activeTab === "safety" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
            <p className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
              <ShieldCheck className="size-4 text-indigo-400" /> Factual Safety Assessment
            </p>
            <p className="text-xs text-foreground font-medium leading-relaxed">
              {intel.soloTraveler.safetyNotice}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="p-4 rounded-2xl bg-accent/30 border border-border/40 space-y-2">
              <p className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                <Signal className="size-3.5 text-emerald-500" /> Mobile Network Signals
              </p>
              <div className="space-y-1 text-xs">
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Airtel:</span>
                  <span className="font-bold text-foreground">{intel.soloTraveler.mobileSignal.airtel}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Jio:</span>
                  <span className="font-bold text-foreground">{intel.soloTraveler.mobileSignal.jio}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Vi:</span>
                  <span className="font-bold text-foreground">{intel.soloTraveler.mobileSignal.vi}</span>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-accent/30 border border-border/40 space-y-2">
              <p className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                <Users className="size-3.5 text-amber-500" /> Solo Crowd Level
              </p>
              <p className="text-xs font-bold text-foreground">{intel.soloTraveler.soloCrowdLevel}</p>
              <p className="text-[11px] text-muted-foreground">
                Best solo window: <strong>{intel.soloTraveler.bestSoloTime}</strong>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-accent/30 border border-border/40 space-y-2">
              <p className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                <Footprints className="size-3.5 text-cyan-500" /> Nearest Bus Stop
              </p>
              <p className="text-xs font-bold text-foreground">{intel.soloTraveler.nearestBusStop}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "transit" && (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-accent/30 border border-border/40 flex items-start gap-3">
            <Bus className="size-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-foreground">Public Bus & Transit Connectivity</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {intel.soloTraveler.publicTransportAccess}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "biker" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="p-4 rounded-2xl bg-accent/30 border border-border/40 space-y-1">
            <p className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
              <Fuel className="size-3.5 text-blue-500" /> Fuel Pumps Nearby
            </p>
            <p className="text-xs text-foreground font-medium">{intel.soloTraveler.fuelPumpsNearby}</p>
          </div>

          <div className="p-4 rounded-2xl bg-accent/30 border border-border/40 space-y-1">
            <p className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
              <Wrench className="size-3.5 text-amber-500" /> Puncture & Repair Shop
            </p>
            <p className="text-xs text-foreground font-medium">{intel.soloTraveler.punctureRepairNearby}</p>
          </div>
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------
// 3. "AROUND THIS PLACE" & INTENT-BASED DISCOVERY
// ---------------------------------------------------------
export function AroundThisPlaceSection({
  targetSlug,
  geospatialData,
}: {
  targetSlug: string;
  geospatialData: ReturnType<typeof import("@/lib/data/travel-intelligence").getGeospatialAroundPlace>;
}) {
  const [selectedTier, setSelectedTier] = useState<NearbyDistanceTier>("<500m");
  const [selectedIntent, setSelectedIntent] = useState<IntentCategory | "all">("all");

  const tierList: { id: NearbyDistanceTier; label: string; icon: string }[] = [
    { id: "<500m", label: "Immediate Walking (<500m)", icon: "🚶" },
    { id: "500m-1km", label: "Short Walk (500m - 1km)", icon: "🏃" },
    { id: "1km-3km", label: "Short Drive (1 - 3km)", icon: "🛺" },
    { id: "3km-5km", label: "Local Excursion (3 - 5km)", icon: "🚘" },
    { id: "5km-10km", label: "Day Excursion (5 - 10km)", icon: "🚗" },
  ];

  const intentList: { id: IntentCategory | "all"; label: string; icon: string }[] = [
    { id: "all", label: "All Spots", icon: "🌐" },
    { id: "history", label: "History & Heritage", icon: "🏛️" },
    { id: "temple", label: "Temple Trail", icon: "🛕" },
    { id: "food", label: "Food & Eats", icon: "🍱" },
    { id: "photography", label: "Photography", icon: "📸" },
    { id: "shopping", label: "Shopping & Craft", icon: "🛍️" },
    { id: "nature", label: "Nature & Escapes", icon: "🌿" },
  ];

  // Active items filter
  let spotsToDisplay = geospatialData.byTier[selectedTier];
  if (selectedIntent !== "all") {
    spotsToDisplay = spotsToDisplay.filter((s) => s.intents.includes(selectedIntent));
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-xl space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              GEOSPATIAL SPOTS DISCOVERY
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground mt-1">
            Around {geospatialData.targetPlace.canonicalName || geospatialData.targetPlace.name}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Discover nearby attractions grouped by walking & driving radius.
          </p>
        </div>
      </div>

      {/* Distance Tier Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tierList.map((t) => {
          const count = geospatialData.byTier[t.id].length;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTier(t.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition border ${
                selectedTier === t.id
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                  : "bg-accent/40 text-muted-foreground hover:text-foreground border-border/40"
              }`}
            >
              {t.icon} {t.label} <span className="ml-1 opacity-75 font-mono">({count})</span>
            </button>
          );
        })}
      </div>

      {/* "What Can I Do Nearby?" Intent Filters */}
      <div className="space-y-2">
        <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <SlidersHorizontal className="size-3 text-emerald-500" /> What Can I Do Nearby? (Intent Filters)
        </p>
        <div className="flex flex-wrap gap-2">
          {intentList.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => setSelectedIntent(i.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                selectedIntent === i.id
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-card hover:bg-accent/60 text-muted-foreground border-border/40"
              }`}
            >
              {i.icon} {i.label}
            </button>
          ))}
        </div>
      </div>

      {/* Spots Grid */}
      {spotsToDisplay.length === 0 ? (
        <div className="p-8 text-center bg-accent/20 rounded-2xl border border-dashed border-border/60 text-muted-foreground text-xs">
          No spots found in <strong>{selectedTier}</strong> radius matching this intent filter. Try selecting "All Spots" or expanding distance tier.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {spotsToDisplay.map((spot) => (
            <div
              key={spot.id}
              className="group rounded-2xl border border-border/60 bg-background/50 overflow-hidden hover:shadow-lg transition flex flex-col"
            >
              <div className="relative h-32 overflow-hidden">
                <img
                  src={spot.image}
                  alt={spot.name}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-white/20">
                  {spot.distanceFormatted} away
                </div>
              </div>

              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h4 className="text-sm font-bold text-foreground line-clamp-1">{spot.name}</h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{spot.tagline}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    {spot.category}
                  </span>

                  <Link
                    to="/place/$slug"
                    params={{ slug: spot.slug }}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    View Place <ChevronRight className="size-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🚀 SMART DISCOVERY MINI-ITINERARY BLOCK */}
      <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/20 px-2 py-0.5 rounded-full">
              SMART DISCOVERY MINI-TRAIL
            </span>
            <h3 className="text-lg font-bold text-foreground mt-1">
              {geospatialData.miniItinerary.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              {geospatialData.miniItinerary.tagline} · Est. Total: <strong>{geospatialData.miniItinerary.totalDuration}</strong>
            </p>
          </div>
        </div>

        {/* Timeline Steps */}
        <div className="space-y-3 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-emerald-500/30">
          {geospatialData.miniItinerary.steps.map((step) => (
            <div key={step.stepNumber} className="relative pl-9 flex items-start justify-between gap-3 text-xs">
              <div className="absolute left-1 top-1 size-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-background">
                {step.stepNumber}
              </div>

              <div>
                <Link
                  to="/place/$slug"
                  params={{ slug: step.slug }}
                  className="font-bold text-foreground hover:text-emerald-500 transition"
                >
                  {step.placeName}
                </Link>
                <p className="text-[11px] text-muted-foreground mt-0.5">{step.keyHighlight}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  {step.recommendedDuration}
                </span>
                <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                  {step.travelMode} ({step.distanceFromPrevious})
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------
// 4. LIVE COMMUNITY REPORTS SECTION & SUBMIT MODAL
// ---------------------------------------------------------
export function CommunityReportsSection({ placeSlug }: { placeSlug: string }) {
  const { requireAuth } = useAuthGuard();
  const [reports, setReports] = useState<CommunityReport[]>(() => getCommunityReports(placeSlug));
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Form State
  const [reportType, setReportType] = useState<CommunityReport["reportType"]>("damaged_road");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submittedFeedback, setSubmittedFeedback] = useState<string | null>(null);

  const handleUpvote = (id: string) => {
    upvoteCommunityReport(id);
    setReports(getCommunityReports(placeSlug));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    requireAuth(() => {
      submitCommunityReport(placeSlug, reportType, title, description);
      setSubmittedFeedback("Live road/access report submitted! Active on map alerts for 24 hours.");
      setTitle("");
      setDescription("");
      setShowSubmitModal(false);
      setReports(getCommunityReports(placeSlug));
    }, "Sign in to submit a live community report.");
  };

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-xl space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              LIVE COMMUNITY REPORTING
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground mt-1">
            Real-Time Road & Access Alerts
          </h2>
        </div>

        <Button
          onClick={() => setShowSubmitModal(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer"
        >
          <Plus className="size-4 mr-1" /> Submit Road/Access Report
        </Button>
      </div>

      {submittedFeedback && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-mono font-bold">
          ✓ {submittedFeedback}
        </div>
      )}

      {/* Active Reports Display List */}
      {reports.length === 0 ? (
        <div className="p-6 text-center bg-accent/20 rounded-2xl border border-dashed border-border/60 text-muted-foreground text-xs">
          No active road issues or closures reported for this place. All access routes clear.
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-amber-500 shrink-0" />
                  <span className="text-xs font-extrabold uppercase text-amber-500 tracking-wider">
                    {report.title}
                  </span>
                  {report.status === "verified" && (
                    <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      ✓ VERIFIED BY ADMIN
                    </span>
                  )}
                </div>

                <p className="text-xs text-foreground font-medium">{report.description}</p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  Reported by {report.reportedBy} · Expires in{" "}
                  {Math.max(
                    0,
                    Math.round((new Date(report.expiresAt).getTime() - Date.now()) / (1000 * 3600))
                  )}{" "}
                  hours
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleUpvote(report.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/60 hover:bg-accent border border-border/40 text-xs font-bold text-foreground transition shrink-0 self-start sm:self-auto cursor-pointer"
              >
                <ThumbsUp className="size-3.5 text-amber-500" />
                <span>Confirm Alert ({report.upvotes})</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* SUBMIT REPORT MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-lg font-bold text-foreground">Submit Real-Time Road/Access Alert</h3>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-mono font-bold text-muted-foreground uppercase mb-1">
                  Report Category
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="w-full h-10 px-3 bg-accent/40 border border-border/60 rounded-xl text-foreground font-medium"
                >
                  <option value="damaged_road">🚨 Damaged Road / Potholes</option>
                  <option value="road_blocked">🛑 Road Blocked / Construction</option>
                  <option value="heavy_traffic">🚙 Heavy Traffic Congestion</option>
                  <option value="waterlogging">🌊 Waterlogging / Flooding</option>
                  <option value="landslide">⛰️ Landslide / Mudslide</option>
                  <option value="parking_full">🅿️ Parking Full</option>
                  <option value="temporary_closure">🔒 Temporary Closure</option>
                </select>
              </div>

              <div>
                <label className="block font-mono font-bold text-muted-foreground uppercase mb-1">
                  Alert Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. East Gopuram Multi-level Parking Full"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-10 px-3 bg-accent/40 border border-border/60 rounded-xl text-foreground"
                />
              </div>

              <div>
                <label className="block font-mono font-bold text-muted-foreground uppercase mb-1">
                  Detailed Description & Advice
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide exact location marker, alternative routes, or advice for travelers..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-accent/40 border border-border/60 rounded-xl text-foreground"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSubmitModal(false)}
                  className="rounded-xl font-bold text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl"
                >
                  Publish Community Alert
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </section>
  );
}
