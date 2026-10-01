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
  Utensils
} from "lucide-react";

interface RegionalTravelDiscoveryProps {
  initialOriginId?: string;
  onSelectPlaceForPlanner?: (place: ExplorerPlace, origin: TravelOriginCity) => void;
  className?: string;
}

export const RegionalTravelDiscovery: React.FC<RegionalTravelDiscoveryProps> = ({
  initialOriginId = "coimbatore",
  onSelectPlaceForPlanner,
  className = ""
}) => {
  const [selectedOriginId, setSelectedOriginId] = useState<string>(initialOriginId);
  const [maxDistance, setMaxDistance] = useState<number | "all">("all");
  const [tripType, setTripType] = useState<"all" | "day" | "weekend" | "overnight">("all");
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | "all">("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [inspectingPlace, setInspectingPlace] = useState<ExplorerPlace | null>(null);

  const currentOrigin = SUPPORTED_ORIGINS[selectedOriginId] || SUPPORTED_ORIGINS.coimbatore;

  // Compute origin-centered places
  const originPlaces = useMemo(() => {
    return getPlacesForOrigin(selectedOriginId, CANONICAL_PLACES);
  }, [selectedOriginId]);

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
  }, [originPlaces, selectedOriginId, maxDistance, tripType, selectedCategory, selectedRegion, searchQuery]);

  return (
    <div className={`w-full bg-[#0b0f17] text-gray-100 rounded-3xl border border-emerald-500/20 overflow-hidden shadow-2xl ${className}`}>
      {/* Header Banner */}
      <div className="relative bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-6 sm:p-8 border-b border-emerald-500/20">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Compass className="w-64 h-64 text-emerald-400" />
        </div>

        <div className="relative z-10 max-w-4xl">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Origin-Based Travel Hub
            </span>
            <span className="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full text-xs font-medium">
              Real Driving Distances & Multi-State Boundaries
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex flex-wrap items-center gap-3">
            <span>Explore Destinations from</span>
            <div className="inline-flex items-center gap-2 bg-emerald-900/60 border border-emerald-400/40 px-3.5 py-1.5 rounded-2xl shadow-lg">
              <MapPin className="w-6 h-6 text-emerald-400 animate-pulse" />
              <select
                value={selectedOriginId}
                onChange={(e) => setSelectedOriginId(e.target.value)}
                className="bg-transparent text-emerald-300 font-bold text-xl sm:text-2xl focus:outline-none cursor-pointer"
              >
                {Object.values(SUPPORTED_ORIGINS).map((origin) => (
                  <option key={origin.id} value={origin.id} className="bg-[#121821] text-white">
                    📍 {origin.name}
                  </option>
                ))}
              </select>
            </div>
          </h2>

          <p className="mt-3 text-gray-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            {currentOrigin.tagline}. Discover nearby waterfalls, hill stations, wildlife reserves, and heritage cultural spots independent of district administrative lines.
          </p>

          {/* Quick Stats Bar */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium text-emerald-200/80">
            <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>{filteredPlaces.length} Destinations Discovered</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
              <Layers className="w-4 h-4 text-teal-400" />
              <span>{availableRegions.length} Geographic Regions</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Coordinates & Permits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 sm:p-6 bg-[#121824] border-b border-gray-800 space-y-4">
        {/* Search input + Origin Selector Quick Pills */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={`Search spots near ${currentOrigin.name} (e.g. Parambikulam, Coonoor, Siruvani, Mylapore, ECR)...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d121d] text-white border border-gray-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
            />
            <Compass className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Origin Pickers */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Origin:</span>
            {Object.values(SUPPORTED_ORIGINS).map((origin) => (
              <button
                key={origin.id}
                onClick={() => setSelectedOriginId(origin.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap border ${
                  selectedOriginId === origin.id
                    ? "bg-emerald-500 text-slate-950 font-bold border-emerald-400"
                    : "bg-[#0d121d] text-gray-300 border-gray-700 hover:border-emerald-500/50"
                }`}
              >
                {origin.name}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Rows */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {/* Distance Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Max Distance</label>
            <select
              value={maxDistance}
              onChange={(e) => setMaxDistance(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="w-full bg-[#0d121d] text-emerald-300 border border-gray-700/80 rounded-xl px-3 py-2 text-xs font-medium focus:border-emerald-400"
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
            <label className="block text-xs font-semibold text-gray-400 mb-1">Trip Duration</label>
            <select
              value={tripType}
              onChange={(e) => setTripType(e.target.value as any)}
              className="w-full bg-[#0d121d] text-emerald-300 border border-gray-700/80 rounded-xl px-3 py-2 text-xs font-medium focus:border-emerald-400"
            >
              <option value="all">All Trip Types</option>
              <option value="day">⚡ Day Trips (&lt; 100 km)</option>
              <option value="weekend">🚗 Weekend Getaways (50-250 km)</option>
              <option value="overnight">🌙 Overnight Journeys (&gt; 200 km)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="w-full bg-[#0d121d] text-emerald-300 border border-gray-700/80 rounded-xl px-3 py-2 text-xs font-medium focus:border-emerald-400"
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
              <option value="food">🍽️ Food & Experiences</option>
            </select>
          </div>

          {/* Geographic Region Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Geographic Region</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-[#0d121d] text-emerald-300 border border-gray-700/80 rounded-xl px-3 py-2 text-xs font-medium focus:border-emerald-400"
            >
              <option value="all">All Regions</option>
              {availableRegions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="p-4 sm:p-6 bg-[#0b0f17]">
        {filteredPlaces.length === 0 ? (
          <div className="py-16 text-center text-gray-400 space-y-3">
            <AlertTriangle className="w-10 h-10 text-yellow-400 mx-auto opacity-75" />
            <p className="text-base font-semibold text-white">No matching destinations found for current filters.</p>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Try expanding your max distance range or clearing specific category and region filters.
            </p>
            <button
              onClick={() => {
                setMaxDistance("all");
                setTripType("all");
                setSelectedCategory("all");
                setSelectedRegion("all");
                setSearchQuery("");
              }}
              className="mt-2 px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold hover:bg-emerald-500/30 transition"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPlaces.map((place) => {
              const distInfo = place.distanceFromOrigin?.[selectedOriginId];
              const distKm = distInfo?.km || 0;
              const durationText = distInfo?.durationText || "1.5 hrs";
              const isKerala = place.state === "Kerala";
              const hasForestPermit = place.metadata?.forestPermitRequired;
              const isNeighborhoodOrExp = place.placeType === "neighborhood" || place.placeType === "experience";

              return (
                <div
                  key={place.id}
                  className="group bg-[#121824] border border-gray-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-emerald-950/30 flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail Image Header */}
                    <div className="relative h-44 w-full overflow-hidden bg-gray-900">
                      <img
                        src={place.image}
                        alt={place.canonicalName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#121824] via-transparent to-black/40" />

                      {/* Distance Badge */}
                      <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md border border-emerald-500/40 px-3 py-1 rounded-xl text-xs font-bold text-emerald-300 flex items-center gap-1.5 shadow-md">
                        <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{distKm} km from {currentOrigin.name}</span>
                        <span className="text-gray-400">({durationText})</span>
                      </div>

                      {/* State / Administrative District Badge */}
                      <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-xl text-[11px] font-semibold tracking-wide border shadow-md ${
                        isKerala
                          ? "bg-teal-950/90 text-teal-300 border-teal-500/40"
                          : "bg-slate-950/90 text-sky-300 border-sky-500/40"
                      }`}>
                        {place.district}, {place.state}
                      </div>

                      {/* Geographic Region Overlay Pill */}
                      {place.geographicRegion && (
                        <div className="absolute bottom-2 left-3 bg-black/70 backdrop-blur-sm border border-gray-700/60 text-gray-300 px-2.5 py-0.5 rounded-lg text-[10px] font-medium">
                          {place.geographicRegion}
                        </div>
                      )}
                    </div>

                    {/* Card Content Body */}
                    <div className="p-4 space-y-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                            {place.canonicalName}
                          </h3>
                          {place.placeType === "neighborhood" && (
                            <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded text-[10px] font-semibold">
                              Neighborhood Area
                            </span>
                          )}
                          {place.placeType === "experience" && (
                            <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-semibold flex items-center gap-1">
                              <Utensils className="w-3 h-3" /> Food Experience
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-emerald-400/90 font-medium italic mt-0.5">
                          "{place.tagline}"
                        </p>
                      </div>

                      <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                        {place.description}
                      </p>

                      {/* Access / Permit Warning Banner */}
                      {hasForestPermit && (
                        <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl px-2.5 py-1.5 text-[11px] text-amber-300 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{place.metadata?.accessPermissions || "Forest Department permit required."}</span>
                        </div>
                      )}

                      {/* Highlights Pills */}
                      {place.highlights && place.highlights.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {place.highlights.slice(0, 3).map((hl, i) => (
                            <span key={i} className="bg-[#1b2333] text-gray-300 text-[10px] px-2 py-0.5 rounded-md border border-gray-700/50">
                              • {hl}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-4 pt-0 flex items-center gap-2">
                    <button
                      onClick={() => setInspectingPlace(place)}
                      className="flex-1 bg-[#1b2434] hover:bg-[#232f44] text-gray-200 border border-gray-700 rounded-xl py-2 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Info className="w-3.5 h-3.5 text-emerald-400" /> Inspect Spot
                    </button>

                    {onSelectPlaceForPlanner && (
                      <button
                        onClick={() => onSelectPlaceForPlanner(place, currentOrigin)}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl py-2 px-3 text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/50 transition"
                      >
                        <Car className="w-3.5 h-3.5" /> Plan Trip
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Spot Inspection Modal Drawer */}
      {inspectingPlace && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121824] border border-emerald-500/30 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 text-gray-100 shadow-2xl relative my-8">
            <button
              onClick={() => setInspectingPlace(null)}
              className="absolute top-4 right-4 p-2 bg-[#1b2434] text-gray-400 hover:text-white rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold">
                  {inspectingPlace.district}, {inspectingPlace.state}
                </span>
                {inspectingPlace.geographicRegion && (
                  <span className="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full text-xs font-medium">
                    {inspectingPlace.geographicRegion}
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-black text-white">{inspectingPlace.canonicalName}</h3>
              <p className="text-xs text-emerald-400 font-medium italic">"{inspectingPlace.tagline}"</p>
            </div>

            {/* Modal Image */}
            <div className="h-56 w-full rounded-2xl overflow-hidden bg-gray-900 border border-gray-800">
              <img src={inspectingPlace.image} alt={inspectingPlace.canonicalName} className="w-full h-full object-cover" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Destination Overview</h4>
              <p className="text-sm text-gray-300 leading-relaxed">{inspectingPlace.description}</p>
            </div>

            {/* Practical Visitor Intelligence Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#0c1018] p-4 rounded-2xl border border-gray-800 text-xs">
              <div>
                <span className="text-gray-400 font-semibold block">Best Time to Visit</span>
                <span className="text-emerald-300 font-medium">{inspectingPlace.metadata?.bestTime || "Throughout the year"}</span>
              </div>
              <div>
                <span className="text-gray-400 font-semibold block">Recommended Duration</span>
                <span className="text-emerald-300 font-medium">{inspectingPlace.metadata?.duration || "Half day"}</span>
              </div>
              <div>
                <span className="text-gray-400 font-semibold block">Coordinates (Lat / Lng)</span>
                <span className="text-gray-300 font-mono">{inspectingPlace.latitude.toFixed(4)}, {inspectingPlace.longitude.toFixed(4)}</span>
              </div>
              <div>
                <span className="text-gray-400 font-semibold block">Source Verification</span>
                <span className="text-emerald-400 font-medium">{inspectingPlace.source || "Official Regional Tourism"}</span>
              </div>
            </div>

            {/* Access Permissions / Advisories */}
            {inspectingPlace.metadata?.accessPermissions && (
              <div className="bg-amber-950/30 border border-amber-500/40 p-4 rounded-2xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> Access & Permits Notice
                </div>
                <p className="text-amber-200/90">{inspectingPlace.metadata.accessPermissions}</p>
              </div>
            )}

            {/* Highlights */}
            {inspectingPlace.highlights && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Key Sights & Activities</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {inspectingPlace.highlights.map((hl, idx) => (
                    <div key={idx} className="bg-[#1b2434] p-2.5 rounded-xl border border-gray-700/60 text-xs text-gray-200 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={() => setInspectingPlace(null)}
                className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition"
              >
                Close Inspection
              </button>

              {onSelectPlaceForPlanner && (
                <button
                  onClick={() => {
                    const placeToPlan = inspectingPlace;
                    setInspectingPlace(null);
                    onSelectPlaceForPlanner(placeToPlan, currentOrigin);
                  }}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition"
                >
                  <Car className="w-4 h-4" /> Start Planning from {currentOrigin.name}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
