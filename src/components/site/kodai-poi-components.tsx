import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  MapPin,
  Compass,
  Droplets,
  Mountain,
  Trees,
  Car,
  Utensils,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Info,
  Footprints,
  Eye,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Navigation,
  Share2,
  ExternalLink,
  ChevronRight,
  Sun,
  Cloud,
  Thermometer,
  FileCheck,
  Maximize2
} from "lucide-react";
import {
  KodaiPoiRecord,
  KodaiPoiCategory,
  VerificationStatus,
  getKodaiPoisByCategory,
  getAllKodaiPois
} from "@/lib/data/kodaikanal-pois";

// Category metadata helper
export const KODAI_CATEGORY_META: Record<
  KodaiPoiCategory | "all",
  { label: string; icon: string; bg: string; border: string; text: string }
> = {
  all: { label: "All POIs", icon: "✨", bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" },
  lakes: { label: "Lakes & Water", icon: "🌊", bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400" },
  waterfalls: { label: "Waterfalls", icon: "💦", bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400" },
  viewpoints: { label: "Viewpoints", icon: "🌄", bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" },
  parks: { label: "Parks & Gardens", icon: "🌳", bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" },
  caves: { label: "Caves & Rocks", icon: "🪨", bg: "bg-stone-500/10", border: "border-stone-500/30", text: "text-stone-400" },
  forest: { label: "Forest & Nature", icon: "🌲", bg: "bg-teal-500/10", border: "border-teal-500/30", text: "text-teal-400" },
  temples: { label: "Temples & Heritage", icon: "🛕", bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400" },
  museums: { label: "Museums & Info", icon: "🏛️", bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400" },
  villages: { label: "Villages & Countryside", icon: "🏘️", bg: "bg-indigo-500/10", border: "border-indigo-500/30", text: "text-indigo-400" },
  trekking: { label: "Trekking & Trails", icon: "🥾", bg: "bg-lime-500/10", border: "border-lime-500/30", text: "text-lime-400" }
};

// Verification status badge renderer
export function VerificationStatusBadge({ status }: { status: VerificationStatus }) {
  const configs: Record<VerificationStatus, { label: string; bg: string; text: string; border: string }> = {
    verified: { label: "Verified On-Ground", bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/40" },
    official: { label: "Official Govt Record", bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/40" },
    community: { label: "Community Verified", bg: "bg-amber-500/20", text: "text-amber-300", border: "border-amber-500/40" },
    estimated: { label: "Estimated Data", bg: "bg-slate-500/20", text: "text-slate-300", border: "border-slate-500/40" },
    outdated: { label: "Needs Verification Update", bg: "bg-rose-500/20", text: "text-rose-300", border: "border-rose-500/40" }
  };
  const cfg = configs[status] || configs.estimated;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <ShieldCheck className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

// Category filter tabs
export function KodaiPoiCategoryTabs({
  selectedCategory,
  onSelectCategory,
  poiCounts
}: {
  selectedCategory: KodaiPoiCategory | "all";
  onSelectCategory: (cat: KodaiPoiCategory | "all") => void;
  poiCounts?: Record<string, number>;
}) {
  const categories: (KodaiPoiCategory | "all")[] = [
    "all",
    "lakes",
    "waterfalls",
    "viewpoints",
    "parks",
    "caves",
    "forest",
    "trekking",
    "temples",
    "villages",
    "museums"
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {categories.map((cat) => {
        const meta = KODAI_CATEGORY_META[cat];
        const isSelected = selectedCategory === cat;
        const count = poiCounts ? poiCounts[cat] ?? 0 : cat === "all" ? getAllKodaiPois().length : getKodaiPoisByCategory(cat).length;

        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${
              isSelected
                ? `${meta.bg} ${meta.border} ${meta.text} shadow-lg shadow-emerald-950/40`
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <span>{meta.icon}</span>
            <span>{meta.label}</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${isSelected ? "bg-emerald-500/30 text-emerald-200" : "bg-slate-800 text-slate-500"}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Single POI Card for Grids
export function KodaiPoiCard({ poi }: { poi: KodaiPoiRecord }) {
  const catMeta = KODAI_CATEGORY_META[poi.category] || KODAI_CATEGORY_META.all;

  return (
    <div className="group relative bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800/80 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden flex flex-col hover:shadow-xl hover:shadow-emerald-950/20">
      {/* Top Image Banner */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-950">
        <img
          src={poi.images[0] || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"}
          alt={poi.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        
        {/* Category & Accessibility Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium backdrop-blur-md border ${catMeta.bg} ${catMeta.text} ${catMeta.border}`}>
            <span>{catMeta.icon}</span>
            <span>{poi.subcategory}</span>
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 rounded-lg bg-slate-950/80 text-emerald-400 text-[11px] font-mono border border-emerald-500/30 flex items-center gap-1">
            <Mountain className="w-3 h-3 text-emerald-400" />
            {poi.elevation}m MSL
          </span>
        </div>

        {/* POI Title over Image */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
            {poi.name}
          </h3>
          <p className="text-xs text-slate-300/90 flex items-center gap-2 font-mono">
            <span>Kodaikanal, Dindigul</span>
            <span>•</span>
            <span className="text-emerald-400">{poi.accessibility}</span>
          </p>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {poi.shortDescription || poi.description}
        </p>

        {/* Essential Signals Pills */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/60 text-[11px]">
          <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-slate-950/50 border border-slate-800 text-center">
            <span className="text-slate-400 flex items-center gap-1 mb-0.5">
              <Car className="w-3 h-3 text-emerald-400" /> Parking
            </span>
            <span className="font-semibold text-slate-200 line-clamp-1">{poi.parking.carParking}</span>
          </div>

          <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-slate-950/50 border border-slate-800 text-center">
            <span className="text-slate-400 flex items-center gap-1 mb-0.5">
              <Clock className="w-3 h-3 text-amber-400" /> Hours
            </span>
            <span className="font-semibold text-slate-200 line-clamp-1">{poi.openingHours.split(",")[0] || poi.openingHours}</span>
          </div>

          <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-slate-950/50 border border-slate-800 text-center">
            <span className="text-slate-400 flex items-center gap-1 mb-0.5">
              <Eye className="w-3 h-3 text-cyan-400" /> Visibility
            </span>
            <span className="font-semibold text-slate-200 line-clamp-1">{poi.visibility.split(" ")[0]}</span>
          </div>
        </div>

        {/* Footer Actions & Verification */}
        <div className="flex items-center justify-between pt-1">
          <VerificationStatusBadge status={poi.facilities ? "verified" : "estimated"} />

          <Link
            to="/place/$slug"
            params={{ slug: poi.slug }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors group-hover:translate-x-0.5 transition-transform"
          >
            <span>Explore POI</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// Detailed View Component for a Kodaikanal POI
export function KodaiPoiDetailView({ poi }: { poi: KodaiPoiRecord }) {
  const [activeTab, setActiveTab] = useState<"overview" | "essentials" | "parking" | "route">("overview");
  const catMeta = KODAI_CATEGORY_META[poi.category] || KODAI_CATEGORY_META.all;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${poi.name} — ExploreTN`,
        text: `Check out ${poi.name} in Kodaikanal on ExploreTN!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="w-full space-y-6 text-slate-200">
      {/* Top Hero Card */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="h-64 sm:h-80 w-full relative bg-slate-950">
          <img
            src={poi.images[0] || poi.gallery[0] || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"}
            alt={poi.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          {/* Top Floating Controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md border ${catMeta.bg} ${catMeta.text} ${catMeta.border} shadow-lg`}>
                {catMeta.icon} {poi.subcategory}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md text-xs font-mono text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <Mountain className="w-3.5 h-3.5" />
                {poi.elevation}m Elevation
              </span>
            </div>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-md transition-all"
              title="Share POI"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Hero Content */}
          <div className="absolute bottom-6 left-6 right-6 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Kodaikanal Hill Region
              </span>
              <VerificationStatusBadge status={poi.facilities ? "verified" : "estimated"} />
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {poi.name}
            </h1>
            {poi.shortDescription && (
              <p className="text-sm sm:text-base text-emerald-200/90 font-medium">
                {poi.shortDescription}
              </p>
            )}
            <p className="text-sm text-slate-300 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{poi.latitude.toFixed(4)}° N, {poi.longitude.toFixed(4)}° E</span>
              <span>•</span>
              <span className="text-amber-400 font-medium">{poi.accessibility}</span>
            </p>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-800/80 bg-slate-950/80 border-t border-slate-800/80 text-xs">
          <div className="p-3.5 flex items-center gap-3">
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-slate-500 text-[11px]">Visiting Hours</div>
              <div className="font-semibold text-slate-200">{poi.openingHours}</div>
            </div>
          </div>

          <div className="p-3.5 flex items-center gap-3">
            <Sun className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-slate-500 text-[11px]">Best Time to Visit</div>
              <div className="font-semibold text-slate-200">{poi.bestTimeToVisit}</div>
            </div>
          </div>

          <div className="p-3.5 flex items-center gap-3">
            <Car className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <div className="text-slate-500 text-[11px]">Car Parking</div>
              <div className="font-semibold text-slate-200">{poi.parking.carParking}</div>
            </div>
          </div>

          <div className="p-3.5 flex items-center gap-3">
            <Navigation className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <div className="text-slate-500 text-[11px]">Est. Duration</div>
              <div className="font-semibold text-slate-200">{poi.estimatedVisitDuration}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            activeTab === "overview"
              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Overview & Profile
        </button>

        <button
          onClick={() => setActiveTab("essentials")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            activeTab === "essentials"
              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Nearby Essentials ({poi.nearbyEssentials.length})
        </button>

        <button
          onClick={() => setActiveTab("parking")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            activeTab === "parking"
              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Parking & Access
        </button>

        <button
          onClick={() => setActiveTab("route")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            activeTab === "route"
              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Route & Remote Intelligence
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Description & Category Specific Specs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800/80 space-y-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-400" />
                About {poi.name}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {poi.description}
              </p>
            </div>

            {/* Category Profile Box */}
            {poi.categorySpecs && (
              <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800/80 space-y-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Category Specific Profile ({poi.subcategory})
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {poi.categorySpecs.waterFlowCondition && (
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-slate-400">Water Flow Condition</span>
                      <p className="font-semibold text-cyan-300">{poi.categorySpecs.waterFlowCondition}</p>
                    </div>
                  )}

                  {poi.categorySpecs.bathingAllowed !== undefined && (
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-slate-400">Bathing / Swimming</span>
                      <p className="font-semibold text-amber-300">
                        {poi.categorySpecs.bathingAllowed ? "Allowed (Exercise Caution)" : "Strictly Prohibited"}
                      </p>
                    </div>
                  )}

                  {poi.categorySpecs.visibilityGrade && (
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-slate-400">Valley Visibility Grade</span>
                      <p className="font-semibold text-amber-300">{poi.categorySpecs.visibilityGrade}</p>
                    </div>
                  )}

                  {poi.categorySpecs.difficulty && (
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-slate-400">Trek Difficulty & Trail</span>
                      <p className="font-semibold text-lime-300">
                        {poi.categorySpecs.difficulty} • {poi.categorySpecs.trailDistanceKm} km
                      </p>
                    </div>
                  )}

                  {poi.categorySpecs.wildlifeAdvisory && (
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1 sm:col-span-2">
                      <span className="text-slate-400">Wildlife & Forest Advisory</span>
                      <p className="font-semibold text-rose-300">{poi.categorySpecs.wildlifeAdvisory}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Safety Guidelines */}
            {poi.safetyInformation.length > 0 && (
              <div className="bg-amber-500/5 rounded-2xl p-5 border border-amber-500/20 space-y-3">
                <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> Safety & Visitor Precautions
                </h3>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1.5">
                  {poi.safetyInformation.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar: Before You Go Verification Box */}
          <div className="space-y-6">
            <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  Before You Go Verification
                </h3>
                <span className="text-[10px] font-mono text-slate-400">{poi.lastVerified}</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Data Source</span>
                  <span className="font-semibold text-slate-200">{poi.dataSource}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Data Confidence</span>
                  <span className="font-bold text-emerald-400">{poi.confidence}% Verified</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Entry Fee</span>
                  <span className="font-semibold text-amber-300">{poi.entryFee}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Crowd Level</span>
                  <span className="font-semibold text-slate-200">{poi.crowdLevel}</span>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-400">Road Quality</span>
                  <span className="font-semibold text-emerald-400">{poi.roadCondition}</span>
                </div>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${poi.latitude},${poi.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-950/50"
              >
                <Navigation className="w-4 h-4" />
                Navigate via Google Maps
              </a>
            </div>

            {/* Nearby Places Cards */}
            {poi.nearbyPlaces && poi.nearbyPlaces.length > 0 && (
              <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800/80 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-400" /> Nearby Places Worth Visiting
                </h3>
                <div className="space-y-2">
                  {poi.nearbyPlaces.map((near, idx) => (
                    <Link
                      key={idx}
                      to="/place/$slug"
                      params={{ slug: near.slug }}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 transition-colors text-xs"
                    >
                      <span className="font-semibold text-slate-200">{near.name}</span>
                      <span className="text-emerald-400 font-mono">{near.distance}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: NEARBY ESSENTIALS */}
      {activeTab === "essentials" && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800/80">
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified Nearby Essentials & On-Ground Facilities
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Real verified essential services near {poi.name}. Avoid surprises on remote hill roads.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {poi.nearbyEssentials.map((service) => (
                <div
                  key={service.id}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-200">{service.name}</h4>
                      <span className="text-[10px] text-slate-400 capitalize">{service.type} Service</span>
                    </div>
                    <span className="text-xs font-mono text-emerald-400">{service.distance} ({service.direction})</span>
                  </div>

                  {service.notes && (
                    <p className="text-[11px] text-slate-400 italic line-clamp-2">{service.notes}</p>
                  )}

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                    <span className="text-emerald-400 font-semibold">{service.available ? "Available" : "Not Available"}</span>
                    <VerificationStatusBadge status={service.verificationStatus} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PARKING & ACCESS */}
      {activeTab === "parking" && (
        <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800/80 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Car className="w-4 h-4 text-emerald-400" />
            Parking & Vehicle Access Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Car Parking Status</span>
              <p className="text-sm font-bold text-emerald-400">{poi.parking.carParking}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Two-Wheeler Parking</span>
              <p className="text-sm font-bold text-cyan-400">{poi.parking.bikeParking}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Parking Distance to Spot</span>
              <p className="text-sm font-bold text-amber-300">{poi.parking.parkingDistance}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Parking Tariff</span>
              <p className="text-sm font-bold text-purple-300">{poi.parking.parkingFee}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ROUTE INTELLIGENCE */}
      {activeTab === "route" && (
        <div className="space-y-4">
          {poi.routeInformation.isRemoteStretch && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5 space-y-2">
              <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> Remote Stretch Advisory
              </h3>
              <p className="text-xs text-slate-300">
                {poi.routeInformation.remoteStretchWarning || "This POI is located along a remote hill stretch. Ensure adequate fuel, food, and emergency contacts before proceeding."}
              </p>
            </div>
          )}

          <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800/80 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-400" />
              Route Intelligence & Last Fuel / Medical Stops
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-400">Road Quality</span>
                <p className="font-semibold text-emerald-400">{poi.routeInformation.roadQuality}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-400">Last Fuel Station</span>
                <p className="font-semibold text-amber-300">{poi.routeInformation.lastFuelStation}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-400">Mobile Network Availability</span>
                <p className="font-semibold text-cyan-300">{poi.routeInformation.networkAvailability}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-400">Nearest Medical / Hospital</span>
                <p className="font-semibold text-purple-300">{poi.routeInformation.nearestHospital}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM SECTION: KODAIKANAL TOURIST PLACES */}
      <KodaiTouristPlacesSection
        title="Explore Other Kodaikanal Tourist Places"
        subtitle="Discover nearby lakes, waterfalls, viewpoints, parks, caves, forest trails, and heritage spots across Kodaikanal."
        currentPoiSlug={poi.slug}
      />
    </div>
  );
}

// Bottom Section Component listing all 30 Kodaikanal POIs
export function KodaiTouristPlacesSection({
  title = "Kodaikanal Tourist Places",
  subtitle = "Explore mapped attractions, waterfalls, viewpoints, lakes, forest trails & heritage sites across Kodaikanal.",
  currentPoiSlug,
}: {
  title?: string;
  subtitle?: string;
  currentPoiSlug?: string;
}) {
  const [selectedCategory, setSelectedCategory] = useState<KodaiPoiCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const allPois = getAllKodaiPois();

  const filteredPois = allPois.filter((p) => {
    if (currentPoiSlug && p.slug === currentPoiSlug) return false;
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="w-full space-y-6 pt-10 border-t border-slate-800/80 my-10 text-slate-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Mountain className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
              {filteredPois.length} Spots
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">{subtitle}</p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search Kodaikanal places..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <KodaiPoiCategoryTabs
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {filteredPois.length === 0 ? (
        <div className="p-10 rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 text-center text-slate-400 text-xs">
          No Kodaikanal tourist places match your selected filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPois.map((poi) => (
            <KodaiPoiCard key={poi.id} poi={poi} />
          ))}
        </div>
      )}
    </section>
  );
}
