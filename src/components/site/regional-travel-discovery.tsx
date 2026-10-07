import React, { useState, useMemo, useEffect } from "react";
import { CANONICAL_PLACES, ExplorerPlace, PlaceCategory } from "@/lib/data/canonical-places";
import { SUPPORTED_ORIGINS, PRIMARY_HUB_ORIGINS, getPlacesForOrigin, TravelOriginCity } from "@/lib/data/travel-origins";
import { getUserHomeLocation } from "@/lib/user-location-manager";
import {
  MapPin,
  Clock,
  Compass,
  Navigation,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Filter,
  Sparkles,
  Info,
  X,
  ExternalLink,
  Car,
  TreePine,
  Calendar,
  Layers,
  Utensils,
  SlidersHorizontal,
  Building2
} from "lucide-react";

interface RegionalTravelDiscoveryProps {
  initialOriginId?: string;
  onSelectPlaceForPlanner?: (place: ExplorerPlace, origin: TravelOriginCity) => void;
  className?: string;
}

const DEFAULT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80";

export const RegionalTravelDiscovery: React.FC<RegionalTravelDiscoveryProps> = ({
  initialOriginId,
  onSelectPlaceForPlanner,
  className = ""
}) => {
  const [selectedOriginId, setSelectedOriginId] = useState<string>(() => {
    if (initialOriginId && SUPPORTED_ORIGINS[initialOriginId]) return initialOriginId;
    const homeLoc = getUserHomeLocation();
    if (homeLoc?.name) {
      const match = Object.values(SUPPORTED_ORIGINS).find(
        (o) =>
          o.name.toLowerCase() === homeLoc.name.toLowerCase() ||
          o.id.toLowerCase() === homeLoc.name.toLowerCase() ||
          o.district.toLowerCase() === homeLoc.name.toLowerCase()
      );
      if (match) return match.id;
    }
    return initialOriginId || "madurai";
  });
  const [maxDistance, setMaxDistance] = useState<number | "all">("all");
  const [tripType, setTripType] = useState<"all" | "day" | "weekend" | "overnight">("all");
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | "all">("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [inspectingPlace, setInspectingPlace] = useState<ExplorerPlace | null>(null);

  // Origin picker modal/dropdown state
  const [isOriginPickerOpen, setIsOriginPickerOpen] = useState<boolean>(false);
  const [originSearch, setOriginSearch] = useState<string>("");
  const [originTab, setOriginTab] = useState<"all" | "hubs" | "districts" | "towns">("all");

  const currentOrigin = SUPPORTED_ORIGINS[selectedOriginId] || SUPPORTED_ORIGINS.coimbatore;

  // Compute origin-centered places with strict deduplication by slug/ID
  const originPlaces = useMemo(() => {
    const rawPlaces = getPlacesForOrigin(selectedOriginId, CANONICAL_PLACES);
    const seen = new Set<string>();
    const deduplicated: ExplorerPlace[] = [];

    for (const p of rawPlaces) {
      const key = (p.slug || p.id || p.canonicalName || "").toLowerCase().trim();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      deduplicated.push(p);
    }
    return deduplicated;
  }, [selectedOriginId]);

  // Extract available districts
  const availableDistricts = useMemo(() => {
    const districts = new Set<string>();
    originPlaces.forEach((p) => {
      if (p.district) districts.add(p.district);
    });
    return Array.from(districts).sort();
  }, [originPlaces]);

  // Extract available geographic regions for the current origin
  const availableRegions = useMemo(() => {
    const regions = new Set<string>();
    originPlaces.forEach((p) => {
      if (p.geographicRegion) regions.add(p.geographicRegion);
    });
    return Array.from(regions);
  }, [originPlaces]);

  // Filtered places list
  const filteredPlaces = useMemo(() => {
    return originPlaces.filter((place) => {
      const distInfo = place.distanceFromOrigin?.[selectedOriginId];
      const distKm = distInfo?.km || 0;

      // Distance filter
      if (maxDistance !== "all" && distKm > maxDistance) return false;

      // Trip type filter
      if (tripType === "day" && distKm > 100) return false;
      if (tripType === "weekend" && (distKm < 50 || distKm > 250)) return false;
      if (tripType === "overnight" && distKm < 200) return false;

      // District filter
      if (selectedDistrict !== "all" && place.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
        return false;
      }

      // Category filter
      if (selectedCategory !== "all") {
        if (!place.categories.includes(selectedCategory) && place.primaryCategory !== selectedCategory) {
          return false;
        }
      }

      // Geographic Region filter
      if (selectedRegion !== "all" && place.geographicRegion !== selectedRegion) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = place.canonicalName.toLowerCase().includes(q) || place.name.toLowerCase().includes(q);
        const matchesDistrict = place.district.toLowerCase().includes(q);
        const matchesState = place.state.toLowerCase().includes(q);
        const matchesTag = place.tags.some((t) => t.toLowerCase().includes(q));
        const matchesRegion = place.geographicRegion?.toLowerCase().includes(q);
        if (!matchesName && !matchesDistrict && !matchesState && !matchesTag && !matchesRegion) {
          return false;
        }
      }

      return true;
    });
  }, [originPlaces, selectedOriginId, maxDistance, tripType, selectedCategory, selectedDistrict, selectedRegion, searchQuery]);

  // All origins categorized and filtered by search
  const filteredOriginsList = useMemo(() => {
    const q = originSearch.trim().toLowerCase();
    const all = Object.values(SUPPORTED_ORIGINS);
    return all.filter((o) => {
      // Tab filter
      const isHub = !!PRIMARY_HUB_ORIGINS[o.id];
      const isDistrict = !isHub && o.canonicalName.includes("District");
      const isTown = !isHub && !isDistrict;

      if (originTab === "hubs" && !isHub) return false;
      if (originTab === "districts" && !isDistrict) return false;
      if (originTab === "towns" && !isTown) return false;

      // Text search
      if (!q) return true;
      return (
        o.name.toLowerCase().includes(q) ||
        o.canonicalName.toLowerCase().includes(q) ||
        o.district.toLowerCase().includes(q) ||
        o.state.toLowerCase().includes(q)
      );
    }).sort((a, b) => {
      // Prioritize flagship hubs first in "all"
      const aHub = !!PRIMARY_HUB_ORIGINS[a.id];
      const bHub = !!PRIMARY_HUB_ORIGINS[b.id];
      if (aHub && !bHub) return -1;
      if (!aHub && bHub) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [originSearch, originTab]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedDistrict !== "all") count++;
    if (maxDistance !== "all") count++;
    if (tripType !== "all") count++;
    if (selectedCategory !== "all") count++;
    if (selectedRegion !== "all") count++;
    return count;
  }, [selectedDistrict, maxDistance, tripType, selectedCategory, selectedRegion]);

  const resetAllFilters = () => {
    setMaxDistance("all");
    setTripType("all");
    setSelectedCategory("all");
    setSelectedDistrict("all");
    setSelectedRegion("all");
    setSearchQuery("");
  };

  return (
    <div className={`w-full bg-[#0b0f17] text-gray-100 rounded-2xl border border-emerald-500/20 overflow-hidden shadow-xl ${className}`}>
      {/* Sleek Compact Header Banner */}
      <div className="relative bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-4 sm:p-6 border-b border-emerald-500/20">
        <div className="relative z-10 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Travel Origin Hub
            </span>
            <span className="px-2.5 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full text-[11px] font-medium">
              Real Driving Distances
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex flex-wrap items-center gap-2">
            <span>Explore Destinations from</span>
            
            {/* Custom Modern Origin Trigger Button */}
            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => setIsOriginPickerOpen(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-900/90 to-teal-900/90 hover:from-emerald-850 hover:to-teal-850 text-emerald-200 hover:text-white px-3.5 py-1.5 rounded-xl border border-emerald-400/50 shadow-lg shadow-emerald-950/50 backdrop-blur-md transition-all duration-200 group cursor-pointer"
                title="Click to search and change origin location"
              >
                <MapPin className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform animate-pulse" />
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white underline decoration-emerald-400/40 underline-offset-4 group-hover:decoration-emerald-400">
                  {currentOrigin.name}
                  {currentOrigin.canonicalName.includes("District") && !currentOrigin.name.includes("District") ? " (District)" : ""}
                </span>
                <span className="text-[10px] bg-emerald-400/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider group-hover:bg-emerald-400/30">
                  Change ▾
                </span>
              </button>
            </div>
          </h2>

          <p className="mt-2 text-gray-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            {currentOrigin.tagline}. Discover nearby waterfalls, hill stations, and heritage spots independent of administrative lines.
          </p>

          {/* Compact Stats Bar */}
          <div className="mt-3.5 flex flex-wrap items-center gap-3 text-xs font-medium text-emerald-200/90">
            <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-lg backdrop-blur-sm shadow-sm">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span><strong className="text-white font-bold">{filteredPlaces.length}</strong> Destinations Active</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-amber-500/30 px-3 py-1 rounded-lg backdrop-blur-sm shadow-sm">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span><strong className="text-white font-bold">{availableDistricts.length}</strong> Districts Covered</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-teal-500/30 px-3 py-1 rounded-lg backdrop-blur-sm shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Verified Driving Coordinates</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODERN ORIGIN PICKER MODAL / POPOVER */}
      {isOriginPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="w-full max-w-2xl bg-[#0f172a] border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border-b border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-emerald-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    Select Your Starting Origin
                    <span className="text-[11px] font-normal text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      {Object.keys(SUPPORTED_ORIGINS).length} Available
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400">Choose any hub, district, or town in Tamil Nadu to calculate driving times</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOriginPickerOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search & Filter Tabs */}
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 space-y-3">
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  placeholder="Search starting origin by city, district, or town name (e.g. Madurai, Ooty, Salem)..."
                  value={originSearch}
                  onChange={(e) => setOriginSearch(e.target.value)}
                  className="w-full bg-[#0b101a] text-white border border-emerald-500/30 focus:border-emerald-400 rounded-xl pl-10 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition placeholder-gray-500"
                />
                <Compass className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                {originSearch && (
                  <button
                    onClick={() => setOriginSearch("")}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Categorization Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                <button
                  type="button"
                  onClick={() => setOriginTab("all")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                    originTab === "all"
                      ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                      : "bg-slate-800/80 text-gray-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  All Places ({Object.keys(SUPPORTED_ORIGINS).length})
                </button>
                <button
                  type="button"
                  onClick={() => setOriginTab("hubs")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    originTab === "hubs"
                      ? "bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20"
                      : "bg-slate-800/80 text-amber-300/80 hover:bg-slate-800 hover:text-amber-300"
                  }`}
                >
                  <span>🌟</span> Flagship Hubs ({Object.keys(PRIMARY_HUB_ORIGINS).length})
                </button>
                <button
                  type="button"
                  onClick={() => setOriginTab("districts")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    originTab === "districts"
                      ? "bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-400/20"
                      : "bg-slate-800/80 text-emerald-300/80 hover:bg-slate-800 hover:text-emerald-300"
                  }`}
                >
                  <span>🏛️</span> 38 Districts
                </button>
                <button
                  type="button"
                  onClick={() => setOriginTab("towns")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    originTab === "towns"
                      ? "bg-sky-400 text-slate-950 font-bold shadow-md shadow-sky-400/20"
                      : "bg-slate-800/80 text-sky-300/80 hover:bg-slate-800 hover:text-sky-300"
                  }`}
                >
                  <span>🏔️</span> Towns & Hills
                </button>
              </div>
            </div>

            {/* Origins List View */}
            <div className="p-3 sm:p-4 overflow-y-auto max-h-[50vh] divide-y divide-slate-800/60 space-y-1">
              {filteredOriginsList.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-80" />
                  <p className="text-sm font-semibold text-white">No origins match "{originSearch}"</p>
                  <p className="text-xs text-gray-400 mt-1">Try searching for a major town or district name.</p>
                </div>
              ) : (
                filteredOriginsList.map((origin) => {
                  const isSelected = selectedOriginId === origin.id;
                  const isHub = !!PRIMARY_HUB_ORIGINS[origin.id];
                  const isDistrict = !isHub && origin.canonicalName.includes("District");

                  return (
                    <button
                      key={origin.id}
                      type="button"
                      onClick={() => {
                        setSelectedOriginId(origin.id);
                        setIsOriginPickerOpen(false);
                        setOriginSearch("");
                      }}
                      className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between transition-all group cursor-pointer ${
                        isSelected
                          ? "bg-gradient-to-r from-emerald-950/90 to-teal-950/80 border border-emerald-400/60 shadow-md"
                          : "hover:bg-slate-800/70 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-lg text-sm shrink-0 ${
                          isSelected
                            ? "bg-emerald-500 text-slate-950 font-bold"
                            : isHub
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : isDistrict
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-slate-800 text-sky-300 border border-slate-700"
                        }`}>
                          {isHub ? "🌟" : isDistrict ? "🏛️" : "📍"}
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold truncate ${
                              isSelected ? "text-emerald-300" : "text-white group-hover:text-emerald-300 transition-colors"
                            }`}>
                              {origin.name}
                            </span>
                            {isHub && (
                              <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded border border-amber-500/40 uppercase">
                                Major Hub
                              </span>
                            )}
                            {isDistrict && (
                              <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[10px] font-medium rounded border border-emerald-500/40">
                                District
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {origin.tagline || `${origin.district} District • ${origin.state}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {isSelected ? (
                          <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 text-xs font-bold rounded-md flex items-center gap-1 shadow">
                            Active Origin ✓
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500 group-hover:text-emerald-400 transition-colors flex items-center">
                            Select <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-gray-400">
              <span>Selected Origin: <strong className="text-emerald-400 font-semibold">{currentOrigin.name}</strong></span>
              <button
                type="button"
                onClick={() => setIsOriginPickerOpen(false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Controls Bar */}
      <div className="p-3.5 sm:p-4 bg-[#121824] border-b border-gray-800/90 space-y-3">
        {/* Search input + Origin Selector Quick Pills */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={`Search spots near ${currentOrigin.name} (e.g. Parambikulam, Coonoor, Suruli, ECR)...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d121d] text-white border border-gray-700/80 rounded-xl pl-9 pr-7 py-2 text-xs focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition placeholder-gray-500"
            />
            <Compass className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Origin Hub Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-[11px] text-gray-400 font-semibold whitespace-nowrap">Hubs:</span>
            {Object.values(PRIMARY_HUB_ORIGINS).map((origin) => (
              <button
                key={origin.id}
                onClick={() => setSelectedOriginId(origin.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap border cursor-pointer ${
                  selectedOriginId === origin.id
                    ? "bg-emerald-500 text-slate-950 font-extrabold border-emerald-400 shadow-md shadow-emerald-500/20"
                    : "bg-[#0d121d] text-gray-300 border-gray-700/80 hover:border-emerald-500/50 hover:text-white"
                }`}
              >
                {origin.name}
              </button>
            ))}
            
            {/* 'More Origins' pill opening modal */}
            <button
              type="button"
              onClick={() => setIsOriginPickerOpen(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/80 transition whitespace-nowrap flex items-center gap-1 cursor-pointer"
            >
              <span>+ All {Object.keys(SUPPORTED_ORIGINS).length}</span>
            </button>
          </div>

          {/* Advanced Options Toggle Button */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer shrink-0 ${
              showAdvanced || activeFiltersCount > 0
                ? "bg-gradient-to-r from-emerald-600/30 to-teal-600/30 text-emerald-300 border-emerald-400/60 shadow-lg shadow-emerald-950/50"
                : "bg-[#0d121d] text-gray-300 border-gray-700/80 hover:border-gray-600 hover:text-white"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Advanced Filters</span>
            {activeFiltersCount > 0 && (
              <span className="ml-1 w-4 h-4 bg-emerald-400 text-slate-950 rounded-full text-[10px] font-black flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* HIGH-IMPACT ADVANCED OPTIONS PANEL */}
        {showAdvanced && (
          <div className="mt-3 p-4 bg-gradient-to-br from-[#0f172a]/95 via-[#111827]/95 to-[#0b1322]/95 border border-emerald-500/30 rounded-2xl shadow-xl backdrop-blur-md space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header row with stats & Reset */}
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-emerald-500/20 rounded-md text-emerald-400">
                  <Filter className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Refine Itineraries & Distances
                </span>
                <span className="text-[11px] text-gray-400">
                  ({filteredPlaces.length} destinations matching)
                </span>
              </div>

              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 rounded-lg border border-rose-500/30 transition cursor-pointer"
                >
                  <X className="w-3 h-3" /> Reset Filters
                </button>
              )}
            </div>

            {/* 4 Focused Category Selectors with Rich Visual Hierarchy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* 1. District Selector */}
              <div className="bg-[#0b101a] p-3 rounded-xl border border-amber-500/20 hover:border-amber-500/40 transition">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <span>🏛️</span> Destination District
                  </label>
                  {selectedDistrict !== "all" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  )}
                </div>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full bg-[#131c2d] text-amber-200 border border-amber-500/30 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 cursor-pointer transition"
                >
                  <option value="all" className="bg-[#131c2d] text-gray-300">📍 All Districts ({availableDistricts.length})</option>
                  {availableDistricts.map((d) => (
                    <option key={d} value={d} className="bg-[#131c2d] text-white">
                      {d} District
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">Cross-district spots near {currentOrigin.name}</p>
              </div>

              {/* 2. Max Distance Range */}
              <div className="bg-[#0b101a] p-3 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 transition">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5" /> Max Distance
                  </label>
                  {maxDistance !== "all" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </div>
                <select
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(e.target.value === "all" ? "all" : Number(e.target.value))}
                  className="w-full bg-[#131c2d] text-emerald-200 border border-emerald-500/30 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 cursor-pointer transition"
                >
                  <option value="all" className="bg-[#131c2d] text-gray-300">Any Distance (&lt; 300 km)</option>
                  <option value={50} className="bg-[#131c2d] text-white">🟢 Within 50 km (Very Close)</option>
                  <option value={100} className="bg-[#131c2d] text-white">🟡 Within 100 km (Day Trips)</option>
                  <option value={200} className="bg-[#131c2d] text-white">🟠 Within 200 km (Weekend)</option>
                  <option value={300} className="bg-[#131c2d] text-white">🔵 Within 300 km (Extended)</option>
                </select>
                <p className="text-[10px] text-gray-400 mt-1">Direct computed route driving radius</p>
              </div>

              {/* 3. Trip Type Selector */}
              <div className="bg-[#0b101a] p-3 rounded-xl border border-sky-500/20 hover:border-sky-500/40 transition">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Trip Type
                  </label>
                  {tripType !== "all" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                  )}
                </div>
                <select
                  value={tripType}
                  onChange={(e) => setTripType(e.target.value as any)}
                  className="w-full bg-[#131c2d] text-sky-200 border border-sky-500/30 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 cursor-pointer transition"
                >
                  <option value="all" className="bg-[#131c2d] text-gray-300">All Trip Types</option>
                  <option value="day" className="bg-[#131c2d] text-white">⚡ Day Trips (&lt; 100 km)</option>
                  <option value="weekend" className="bg-[#131c2d] text-white">🚗 Weekend Getaways (50-250 km)</option>
                  <option value="overnight" className="bg-[#131c2d] text-white">🌙 Overnight Stays (&gt; 200 km)</option>
                </select>
                <p className="text-[10px] text-gray-400 mt-1">Pacing & duration of travel</p>
              </div>

              {/* 4. Category Selector */}
              <div className="bg-[#0b101a] p-3 rounded-xl border border-teal-500/20 hover:border-teal-500/40 transition">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> Place Theme
                  </label>
                  {selectedCategory !== "all" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
                  )}
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="w-full bg-[#131c2d] text-teal-200 border border-teal-500/30 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 cursor-pointer transition"
                >
                  <option value="all" className="bg-[#131c2d] text-gray-300">All Themes & Categories</option>
                  <option value="waterfalls" className="bg-[#131c2d] text-white">🌿 Waterfalls & Nature</option>
                  <option value="hills" className="bg-[#131c2d] text-white">⛰️ Hills & Viewpoints</option>
                  <option value="wildlife" className="bg-[#131c2d] text-white">🐅 Wildlife & Forest Reserves</option>
                  <option value="trekking" className="bg-[#131c2d] text-white">🥾 Trekking & Adventure</option>
                  <option value="temples" className="bg-[#131c2d] text-white">🛕 Temples & Cultural Sites</option>
                  <option value="heritage" className="bg-[#131c2d] text-white">🏛️ Heritage & Monuments</option>
                  <option value="beaches" className="bg-[#131c2d] text-white">🏖️ Beaches & Coastal</option>
                  <option value="shopping" className="bg-[#131c2d] text-white">🛍️ Shopping & Bazaars</option>
                </select>
                <p className="text-[10px] text-gray-400 mt-1">Specific experience type</p>
              </div>
            </div>

            {/* Quick Segment Filter Chips for Common Scenarios */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] font-semibold text-gray-400">Quick Filters:</span>
              <button
                type="button"
                onClick={() => { setMaxDistance(50); setTripType("day"); }}
                className={`px-2.5 py-1 rounded-full border transition cursor-pointer ${
                  maxDistance === 50 && tripType === "day"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-400 font-bold"
                    : "bg-[#0b101a] text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white"
                }`}
              >
                📍 Nearby &lt; 50 km
              </button>
              <button
                type="button"
                onClick={() => { setSelectedCategory("waterfalls"); }}
                className={`px-2.5 py-1 rounded-full border transition cursor-pointer ${
                  selectedCategory === "waterfalls"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-400 font-bold"
                    : "bg-[#0b101a] text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white"
                }`}
              >
                🌿 Waterfalls Only
              </button>
              <button
                type="button"
                onClick={() => { setSelectedCategory("hills"); }}
                className={`px-2.5 py-1 rounded-full border transition cursor-pointer ${
                  selectedCategory === "hills"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-400 font-bold"
                    : "bg-[#0b101a] text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white"
                }`}
              >
                ⛰️ Hill Stations
              </button>
              <button
                type="button"
                onClick={() => { setSelectedCategory("temples"); }}
                className={`px-2.5 py-1 rounded-full border transition cursor-pointer ${
                  selectedCategory === "temples"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-400 font-bold"
                    : "bg-[#0b101a] text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white"
                }`}
              >
                🛕 Temples & Heritage
              </button>
              <button
                type="button"
                onClick={() => { setTripType("weekend"); setMaxDistance(200); }}
                className={`px-2.5 py-1 rounded-full border transition cursor-pointer ${
                  tripType === "weekend" && maxDistance === 200
                    ? "bg-sky-500/20 text-sky-300 border-sky-400 font-bold"
                    : "bg-[#0b101a] text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white"
                }`}
              >
                🚗 Weekend Road Trips
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Destinations Grid */}
      <div className="p-3 sm:p-5 bg-[#0b0f17]">
        {filteredPlaces.length === 0 ? (
          <div className="py-12 text-center text-gray-400 space-y-2">
            <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto opacity-75" />
            <p className="text-sm font-semibold text-white">No matching destinations found for current filters.</p>
            <button
              onClick={() => {
                setMaxDistance("all");
                setTripType("all");
                setSelectedCategory("all");
                setSelectedDistrict("all");
                setSelectedRegion("all");
                setSearchQuery("");
              }}
              className="mt-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold hover:bg-emerald-500/30 transition"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlaces.map((place) => {
              const distInfo = place.distanceFromOrigin?.[selectedOriginId];
              const distKm = distInfo?.km || 0;
              const durationText = distInfo?.durationText || "1.5 hrs";
              const isKerala = place.state === "Kerala";
              const hasForestPermit = place.metadata?.forestPermitRequired;

              return (
                <SpotCardItem
                  key={place.id || place.slug}
                  place={place}
                  distKm={distKm}
                  durationText={durationText}
                  isKerala={isKerala}
                  hasForestPermit={hasForestPermit}
                  currentOriginName={currentOrigin.name}
                  onInspect={() => setInspectingPlace(place)}
                  onPlan={() => onSelectPlaceForPlanner && onSelectPlaceForPlanner(place, currentOrigin)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Spot Inspection Modal Drawer */}
      {inspectingPlace && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121824] border border-emerald-500/30 rounded-2xl max-w-xl w-full p-5 sm:p-6 space-y-4 text-gray-100 shadow-2xl relative my-6">
            <button
              onClick={() => setInspectingPlace(null)}
              className="absolute top-4 right-4 p-1.5 bg-[#1b2434] text-gray-400 hover:text-white rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[11px] font-semibold">
                  {inspectingPlace.district}, {inspectingPlace.state}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white">{inspectingPlace.canonicalName}</h3>
              <p className="text-xs text-emerald-400 italic font-medium">"{inspectingPlace.tagline}"</p>
            </div>

            {/* Modal Image with Fallback */}
            <ModalImage place={inspectingPlace} />

            {/* Description */}
            <div className="space-y-1">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Overview</h4>
              <p className="text-xs text-gray-300 leading-relaxed">{inspectingPlace.description}</p>
            </div>

            {/* Practical Intelligence */}
            <div className="grid grid-cols-2 gap-2 bg-[#0c1018] p-3 rounded-xl border border-gray-800 text-[11px]">
              <div>
                <span className="text-gray-400 block font-semibold">Best Time</span>
                <span className="text-emerald-300 font-medium">{inspectingPlace.metadata?.bestTime || "Year-round"}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">Duration</span>
                <span className="text-emerald-300 font-medium">{inspectingPlace.metadata?.duration || "2-3 hours"}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                onClick={() => setInspectingPlace(null)}
                className="px-3 py-1.5 bg-gray-800 text-gray-300 text-xs font-semibold rounded-lg hover:bg-gray-700 transition"
              >
                Close
              </button>

              {onSelectPlaceForPlanner && (
                <button
                  onClick={() => {
                    const p = inspectingPlace;
                    setInspectingPlace(null);
                    onSelectPlaceForPlanner(p, currentOrigin);
                  }}
                  className="px-4 py-1.5 bg-emerald-500 text-slate-950 font-extrabold text-xs rounded-lg flex items-center gap-1.5 shadow transition hover:bg-emerald-400"
                >
                  <Car className="w-3.5 h-3.5" /> Plan Trip from {currentOrigin.name}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Spot Card Item Component with Guaranteed Image Error Handling
function SpotCardItem({
  place,
  distKm,
  durationText,
  isKerala,
  hasForestPermit,
  currentOriginName,
  onInspect,
  onPlan
}: {
  place: ExplorerPlace;
  distKm: number;
  durationText: string;
  isKerala: boolean;
  hasForestPermit?: boolean;
  currentOriginName: string;
  onInspect: () => void;
  onPlan?: () => void;
}) {
  const [imgSrc, setImgSrc] = useState<string>(place.image || DEFAULT_FALLBACK_IMAGE);

  return (
    <div className="group bg-[#121824] border border-gray-800 hover:border-emerald-500/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col justify-between">
      <div>
        {/* Compact Image Header */}
        <div className="relative h-36 w-full overflow-hidden bg-gray-900">
          <img
            src={imgSrc}
            alt={place.canonicalName}
            onError={() => setImgSrc(DEFAULT_FALLBACK_IMAGE)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121824] via-transparent to-black/30 opacity-90" />

          {/* Distance Badge */}
          <div className="absolute top-2 left-2 bg-slate-950/90 backdrop-blur-md border border-emerald-500/40 px-2.5 py-0.5 rounded-lg text-[11px] font-bold text-emerald-300 flex items-center gap-1 shadow">
            <Navigation className="w-3 h-3 text-emerald-400" />
            <span>{distKm} km ({durationText})</span>
          </div>

          {/* District Badge */}
          <div
            className={`absolute top-2 right-2 px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-wide border shadow ${
              isKerala ? "bg-teal-950/90 text-teal-300 border-teal-500/40" : "bg-slate-950/90 text-sky-300 border-sky-500/40"
            }`}
          >
            {place.district}
          </div>
        </div>

        {/* Card Content Body */}
        <div className="p-3 space-y-1.5">
          <h3 className="text-sm font-extrabold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
            {place.canonicalName}
          </h3>
          <p className="text-[11px] text-gray-300 line-clamp-2 leading-relaxed">{place.description}</p>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-3 pt-0 flex items-center gap-2">
        <button
          onClick={onInspect}
          className="flex-1 bg-[#1b2434] hover:bg-[#232f44] text-gray-200 border border-gray-700 rounded-lg py-1.5 px-2 text-xs font-semibold flex items-center justify-center gap-1 transition"
        >
          <Info className="w-3 h-3 text-emerald-400" /> Inspect
        </button>

        {onPlan && (
          <button
            onClick={onPlan}
            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg py-1.5 px-2 text-xs flex items-center justify-center gap-1 shadow transition"
          >
            <Car className="w-3 h-3" /> Plan Trip
          </button>
        )}
      </div>
    </div>
  );
}

function ModalImage({ place }: { place: ExplorerPlace }) {
  const [src, setSrc] = useState<string>(place.image || DEFAULT_FALLBACK_IMAGE);
  return (
    <div className="h-48 w-full rounded-xl overflow-hidden bg-gray-900 border border-gray-800">
      <img
        src={src}
        alt={place.canonicalName}
        onError={() => setSrc(DEFAULT_FALLBACK_IMAGE)}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
