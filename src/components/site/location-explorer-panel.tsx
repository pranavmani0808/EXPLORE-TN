import React, { useState, useMemo } from "react";
import { CANONICAL_PLACES, ExplorerPlace, PlaceCategory } from "@/lib/data/canonical-places";
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

  // Geographic Haversine Distance Calculation to find nearby places
  const nearbyPlaces = useMemo(() => {
    const lat1 = location.latitude;
    const lon1 = location.longitude;

    return CANONICAL_PLACES.map((p) => {
      const lat2 = p.latitude;
      const lon2 = p.longitude;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const distKm = Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
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
    <div className="h-full bg-[#121821]/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-5 shadow-2xl flex flex-col overflow-hidden text-white font-sans">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-bold uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Location Discovery</span>
          </div>
          <h2 className="text-lg font-black text-white leading-tight mt-0.5">{location.canonicalName || location.name}</h2>
          <p className="text-[11px] text-slate-400">{location.district}, {location.state} · {nearbyPlaces.length} places nearby</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Plan Presets Bar */}
      <div className="py-3 border-b border-white/10">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
          ⚡ 1-Click Quick Plan Presets
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => handleQuickPlan("temple")}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/40 text-[11px] font-bold text-amber-300 hover:bg-white/10 transition flex items-center gap-1.5 cursor-pointer"
          >
            🛕 Temple Trail
          </button>
          <button
            type="button"
            onClick={() => handleQuickPlan("heritage")}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/40 text-[11px] font-bold text-purple-300 hover:bg-white/10 transition flex items-center gap-1.5 cursor-pointer"
          >
            🏰 Heritage Walk
          </button>
          <button
            type="button"
            onClick={() => handleQuickPlan("food")}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 text-[11px] font-bold text-emerald-300 hover:bg-white/10 transition flex items-center gap-1.5 cursor-pointer"
          >
            🍲 Local Food
          </button>
          <button
            type="button"
            onClick={() => handleQuickPlan("nature")}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-sky-500/40 text-[11px] font-bold text-sky-300 hover:bg-white/10 transition flex items-center gap-1.5 cursor-pointer"
          >
            🌲 Nature & Views
          </button>
        </div>
      </div>

      {/* Dynamic Category Chips */}
      <div className="py-2.5 border-b border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeCategory === "all"
              ? "bg-emerald-500 text-black shadow-md"
              : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10"
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
                ? "bg-emerald-500 text-black shadow-md"
                : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10"
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
                  ? "bg-emerald-500/15 border-emerald-500/50 shadow-lg"
                  : isAdded
                  ? "bg-white/10 border-emerald-500/30"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-extrabold text-white">{place.canonicalName || place.name}</h4>
                    {place.verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{place.tagline}</p>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-bold shrink-0 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {distKm === 0 ? "Hub" : `${distKm} km`}
                </span>
              </div>

              <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-white/10">
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
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold shadow-md"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" /> Added
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
      <div className="pt-3 border-t border-white/10 space-y-2">
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
            className="bg-white/10 border border-white/15 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none cursor-pointer"
          >
            <option value="current" className="bg-[#121821] text-white">📍 My Current Location</option>
            <option value="chennai" className="bg-[#121821] text-white">📍 Chennai</option>
            <option value="coimbatore" className="bg-[#121821] text-white">📍 Coimbatore</option>
            <option value="madurai" className="bg-[#121821] text-white">📍 Madurai</option>
            <option value="puducherry" className="bg-[#121821] text-white">📍 Puducherry</option>
            <option value="salem" className="bg-[#121821] text-white">📍 Salem</option>
            <option value="trichy" className="bg-[#121821] text-white">📍 Trichy</option>
          </select>
        </div>

        <Button
          onClick={handleBuildTrip}
          className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold py-3 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" /> Build My Trip ({selectedPlaceIds.length} Places) <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
