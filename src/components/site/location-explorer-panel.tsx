import React, { useState, useMemo } from "react";
import { CANONICAL_PLACES, ExplorerPlace, PlaceCategory } from "@/lib/data/canonical-places";
import { haversineKm } from "@/lib/geo-radius";
import {
  MapPin,
  Star,
  ShieldCheck,
  X,
  Plus,
  Check,
  Sparkles,
  Navigation,
  Compass,
  ArrowRight,
  Utensils,
  Landmark,
  Trees,
  Mountain,
  Waves,
  Camera,
  LocateFixed,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export interface LocationExplorerPanelProps {
  location: ExplorerPlace;
  onClose?: () => void;
  onSelectPlaceOnMap?: (place: ExplorerPlace) => void;
}

export function LocationExplorerPanel({
  location,
  onClose,
  onSelectPlaceOnMap,
}: LocationExplorerPanelProps) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([location.id]);
  const [originMode, setOriginMode] = useState<"current" | "custom">("current");
  const [customOriginId, setCustomOriginId] = useState<string>("chennai");

  // Performance optimization: Filter places by bounding box first before doing expensive trigonometric Haversine math.
  // ~1 degree of latitude/longitude is ~111 km. For 65 km radius, ~0.65 deg lat and ~0.75 deg lng cover the search area.
  // This reduces full Haversine calculations from ~500+ items to ~20-50 relevant items (~85-90% reduction in trig operations).
  const nearbyPlaces = useMemo(() => {
    const lat1 = location.latitude;
    const lon1 = location.longitude;
    const latDelta = 0.65;
    const lngDelta = 0.75;

    return CANONICAL_PLACES.filter(
      (p) =>
        p.district === location.district ||
        (Math.abs(p.latitude - lat1) <= latDelta && Math.abs(p.longitude - lon1) <= lngDelta)
    )
      .map((p) => {
        const distKm = Math.round(haversineKm(lat1, lon1, p.latitude, p.longitude) * 10) / 10;
        return { place: p, distKm };
      })
      .filter((item) => item.distKm <= 65 || item.place.district === location.district)
      .sort((a, b) => a.distKm - b.distKm);
  }, [location]);

  // Extract unique categories available for this location
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    nearbyPlaces.forEach(({ place }) => {
      place.categories.forEach((c) => set.add(c));
    });
    return Array.from(set);
  }, [nearbyPlaces]);

  // Filtered Nearby Places by Category
  const filteredNearby = useMemo(() => {
    if (activeCategory === "all") return nearbyPlaces;
    return nearbyPlaces.filter(({ place }) => place.categories.includes(activeCategory as PlaceCategory));
  }, [nearbyPlaces, activeCategory]);

  // Toggle Place Addition to Trip
  const togglePlaceSelection = (id: string) => {
    setSelectedPlaceIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  // Quick Plan Preset Handlers
  const handleQuickPlan = (presetType: "temple" | "food" | "heritage" | "nature") => {
    let matches: string[] = [location.id];
    if (presetType === "temple") {
      matches = nearbyPlaces
        .filter(({ place }) => place.categories.includes("temples"))
        .slice(0, 4)
        .map(({ place }) => place.id);
    } else if (presetType === "food") {
      matches = nearbyPlaces
        .filter(({ place }) => place.categories.includes("tourist-places") || place.tags.some((t) => t.toLowerCase().includes("food")))
        .slice(0, 4)
        .map(({ place }) => place.id);
    } else if (presetType === "heritage") {
      matches = nearbyPlaces
        .filter(({ place }) => place.categories.includes("heritage"))
        .slice(0, 4)
        .map(({ place }) => place.id);
    } else if (presetType === "nature") {
      matches = nearbyPlaces
        .filter(({ place }) => place.categories.includes("nature") || place.categories.includes("waterfalls") || place.categories.includes("hills"))
        .slice(0, 4)
        .map(({ place }) => place.id);
    }
    if (matches.length > 0) {
      setSelectedPlaceIds(Array.from(new Set([location.id, ...matches])));
    }
  };

  // Build Trip CTA Handler
  const handleBuildTrip = () => {
    const origin = originMode === "current" ? "current-location" : customOriginId;
    const dest = location.id;
    navigate({
      to: "/routes",
      search: {
        origin,
        destination: dest,
        mode: "driving",
      },
    });
  };

  return (
    <div className="h-full bg-white/95 backdrop-blur-2xl border border-sky-200 rounded-3xl p-5 shadow-2xl flex flex-col overflow-hidden text-slate-900 font-sans">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-sky-600 font-mono font-bold uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 text-sky-600" />
            <span>Location Discovery</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 leading-tight mt-0.5">{location.canonicalName || location.name}</h2>
          <p className="text-[11px] text-slate-400">{location.district}, {location.state} · {nearbyPlaces.length} places nearby</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Plan Presets Bar */}
      <div className="py-3 border-b border-slate-200">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
          ⚡ 1-Click Quick Plan Presets
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => handleQuickPlan("temple")}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-slate-200 hover:border-amber-500/40 text-[11px] font-bold text-amber-300 hover:bg-white/10 transition flex items-center gap-1.5 cursor-pointer"
          >
            🛕 Temple Trail
          </button>
          <button
            type="button"
            onClick={() => handleQuickPlan("heritage")}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-slate-200 hover:border-purple-500/40 text-[11px] font-bold text-purple-300 hover:bg-white/10 transition flex items-center gap-1.5 cursor-pointer"
          >
            🏰 Heritage Walk
          </button>
          <button
            type="button"
            onClick={() => handleQuickPlan("food")}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-slate-200 hover:border-sky-500/40 text-[11px] font-bold text-emerald-300 hover:bg-white/10 transition flex items-center gap-1.5 cursor-pointer"
          >
            🍲 Local Food
          </button>
          <button
            type="button"
            onClick={() => handleQuickPlan("nature")}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-slate-200 hover:border-sky-500/40 text-[11px] font-bold text-sky-300 hover:bg-white/10 transition flex items-center gap-1.5 cursor-pointer"
          >
            🌲 Nature & Views
          </button>
        </div>
      </div>

      {/* Dynamic Category Chips */}
      <div className="py-2.5 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeCategory === "all"
              ? "bg-sky-500 text-black shadow-md"
              : "bg-white/5 text-slate-300 hover:text-slate-900 hover:bg-white/10 border border-slate-200"
          }`}
        >
          All ({nearbyPlaces.length})
        </button>
        {availableCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition whitespace-nowrap cursor-pointer ${
              activeCategory === cat
                ? "bg-sky-500 text-black shadow-md"
                : "bg-white/5 text-slate-300 hover:text-slate-900 hover:bg-white/10 border border-slate-200"
            }`}
          >
            {cat.replace("-", " ")}
          </button>
        ))}
      </div>

      {/* Nearby Places Scrollable List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2.5 no-scrollbar">
        {filteredNearby.map(({ place, distKm }) => {
          const isAdded = selectedPlaceIds.includes(place.id);
          const isCurrentFocus = place.id === location.id;

          return (
            <div
              key={place.id}
              onClick={() => onSelectPlaceOnMap?.(place)}
              className={`p-3 rounded-2xl border transition cursor-pointer ${
                isCurrentFocus
                  ? "bg-sky-500/15 border-sky-500/50 shadow-lg"
                  : isAdded
                  ? "bg-white/10 border-sky-500/30"
                  : "bg-white/5 border-slate-200 hover:bg-white/10"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-extrabold text-slate-900">{place.canonicalName || place.name}</h4>
                    {place.verified && <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{place.tagline}</p>
                </div>
                <span className="text-[10px] text-sky-600 font-mono font-bold shrink-0 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                  {distKm === 0 ? "Hub" : `${distKm} km`}
                </span>
              </div>

              <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-200">
                <div className="flex items-center gap-2 text-[10px] text-slate-300">
                  <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                    <Star className="w-3 h-3 fill-amber-400" /> {place.rating}
                  </span>
                  <span>·</span>
                  <span className="capitalize">{place.primaryCategory}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlaceSelection(place.id);
                  }}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                    isAdded
                      ? "bg-sky-500/20 text-emerald-300 border border-sky-500/40"
                      : "bg-sky-500 hover:bg-emerald-400 text-black font-extrabold shadow-md"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3 h-3 text-sky-600" /> Added
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3" /> Add to Trip
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Trip Action Bar */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium">Starting Origin:</span>
          <select
            value={originMode === "current" ? "current" : customOriginId}
            onChange={(e) => {
              if (e.target.value === "current") {
                setOriginMode("current");
              } else {
                setOriginMode("custom");
                setCustomOriginId(e.target.value);
              }
            }}
            className="bg-white/10 border border-sky-200 rounded-lg px-2 py-1 text-[11px] text-slate-900 focus:outline-none cursor-pointer"
          >
            <option value="current" className="bg-white text-slate-900">📍 My Current Location</option>
            <option value="chennai" className="bg-white text-slate-900">📍 Chennai</option>
            <option value="coimbatore" className="bg-white text-slate-900">📍 Coimbatore</option>
            <option value="madurai" className="bg-white text-slate-900">📍 Madurai</option>
            <option value="puducherry" className="bg-white text-slate-900">📍 Puducherry</option>
            <option value="salem" className="bg-white text-slate-900">📍 Salem</option>
            <option value="trichy" className="bg-white text-slate-900">📍 Trichy</option>
          </select>
        </div>

        <Button
          onClick={handleBuildTrip}
          className="w-full rounded-2xl bg-sky-500 hover:bg-emerald-600 text-black font-extrabold py-3 shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" /> Build My Trip ({selectedPlaceIds.length} Places) <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
