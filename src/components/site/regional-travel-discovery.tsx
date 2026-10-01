import React, { useState, useMemo } from "react";
import { CANONICAL_PLACES, ExplorerPlace, PlaceCategory } from "@/lib/data/canonical-places";
import { SUPPORTED_ORIGINS, getPlacesForOrigin, TravelOriginCity } from "@/lib/data/travel-origins";
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
  initialOriginId = "coimbatore",
  onSelectPlaceForPlanner,
  className = ""
}) => {
  const [selectedOriginId, setSelectedOriginId] = useState<string>(initialOriginId);
  const [maxDistance, setMaxDistance] = useState<number | "all">("all");
  const [tripType, setTripType] = useState<"all" | "day" | "weekend" | "overnight">("all");
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | "all">("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [inspectingPlace, setInspectingPlace] = useState<ExplorerPlace | null>(null);

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
            <div className="inline-flex items-center gap-1.5 bg-emerald-900/60 border border-emerald-400/40 px-3 py-1 rounded-xl shadow">
              <MapPin className="w-4 h-4 text-emerald-400 animate-pulse" />
              <select
                value={selectedOriginId}
                onChange={(e) => setSelectedOriginId(e.target.value)}
                className="bg-transparent text-emerald-300 font-extrabold text-base sm:text-lg focus:outline-none cursor-pointer"
              >
                {Object.values(SUPPORTED_ORIGINS).map((origin) => (
                  <option key={origin.id} value={origin.id} className="bg-[#121821] text-white">
                    📍 {origin.name}
                  </option>
                ))}
              </select>
            </div>
          </h2>

          <p className="mt-1.5 text-gray-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            {currentOrigin.tagline}. Discover nearby waterfalls, hill stations, and heritage spots independent of administrative lines.
          </p>

          {/* Compact Stats Bar */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-medium text-emerald-200/90">
            <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>{filteredPlaces.length} Destinations Active</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{availableDistricts.length} Districts Covered</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Coordinates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Controls Bar */}
      <div className="p-3 sm:p-4 bg-[#121824] border-b border-gray-800 space-y-3">
        {/* Search input + Origin Selector Quick Pills */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={`Search spots near ${currentOrigin.name} (e.g. Parambikulam, Coonoor, Suruli, ECR)...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d121d] text-white border border-gray-700/80 rounded-xl pl-9 pr-7 py-1.5 text-xs focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
            />
            <Compass className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Origin Pickers */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-[11px] text-gray-400 font-semibold whitespace-nowrap">Origin:</span>
            {Object.values(SUPPORTED_ORIGINS).map((origin) => (
              <button
                key={origin.id}
                onClick={() => setSelectedOriginId(origin.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition whitespace-nowrap border ${
                  selectedOriginId === origin.id
                    ? "bg-emerald-500 text-slate-950 font-extrabold border-emerald-400 shadow-sm"
                    : "bg-[#0d121d] text-gray-300 border-gray-700 hover:border-emerald-500/50"
                }`}
              >
                {origin.name}
              </button>
            ))}
          </div>

          {/* Advanced Options Toggle Button */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer shrink-0 ${
              showAdvanced || selectedDistrict !== "all" || maxDistance !== "all" || tripType !== "all"
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm"
                : "bg-[#0d121d] text-gray-300 border-gray-700 hover:border-gray-600 hover:text-white"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Advanced Options</span>
          </button>
        </div>

        {/* Collapsible Advanced Options Panel */}
        {showAdvanced && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-gray-800/80">
            {/* District Filter */}
            <div>
              <label className="block text-[11px] font-bold text-amber-400 mb-1">📍 District</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full bg-[#0d121d] text-amber-300 border border-gray-700 rounded-lg px-2.5 py-1 text-xs font-medium focus:border-amber-400 cursor-pointer"
              >
                <option value="all">📍 All Districts</option>
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d} District
                  </option>
                ))}
              </select>
            </div>

            {/* Distance Filter */}
            <div>
              <label className="block text-[11px] font-bold text-emerald-400 mb-1">🚗 Max Distance</label>
              <select
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value === "all" ? "all" : Number(e.target.value))}
                className="w-full bg-[#0d121d] text-emerald-300 border border-gray-700 rounded-lg px-2.5 py-1 text-xs font-medium focus:border-emerald-400 cursor-pointer"
              >
                <option value="all">Any Distance (&lt; 300 km)</option>
                <option value={50}>Within 50 km</option>
                <option value={100}>Within 100 km</option>
                <option value={200}>Within 200 km</option>
                <option value={300}>Within 300 km</option>
              </select>
            </div>

            {/* Trip Duration Filter */}
            <div>
              <label className="block text-[11px] font-bold text-sky-400 mb-1">⏱️ Trip Type</label>
              <select
                value={tripType}
                onChange={(e) => setTripType(e.target.value as any)}
                className="w-full bg-[#0d121d] text-sky-300 border border-gray-700 rounded-lg px-2.5 py-1 text-xs font-medium focus:border-sky-400 cursor-pointer"
              >
                <option value="all">All Trip Types</option>
                <option value="day">⚡ Day Trips (&lt; 100 km)</option>
                <option value="weekend">🚗 Weekend Getaways</option>
                <option value="overnight">🌙 Overnight Stay</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-[11px] font-bold text-teal-400 mb-1">🏷️ Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="w-full bg-[#0d121d] text-teal-300 border border-gray-700 rounded-lg px-2.5 py-1 text-xs font-medium focus:border-teal-400 cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="waterfalls">🌿 Waterfalls & Nature</option>
                <option value="hills">⛰️ Hills & Viewpoints</option>
                <option value="wildlife">🐅 Wildlife & Forest</option>
                <option value="trekking">🥾 Trekking & Adventure</option>
                <option value="temples">🛕 Temples & Cultural</option>
                <option value="heritage">🏛️ Heritage & Museums</option>
                <option value="beaches">🏖️ Beaches & Coastal</option>
                <option value="shopping">🛍️ Shopping & Bazaars</option>
              </select>
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
