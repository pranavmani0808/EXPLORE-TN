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
  ChevronUp,
  ChevronDown,
  LocateFixed,
  Filter,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export interface LocationMiniExplorerProps {
  location: ExplorerPlace;
  userPreferredCategories?: string[];
  isOpen?: boolean;
  onClose?: () => void;
  onSelectPlaceOnMap?: (place: ExplorerPlace) => void;
  selectedPlaceIds?: string[];
  onTogglePlaceSelection?: (id: string) => void;
}

export function LocationMiniExplorer({
  location,
  userPreferredCategories = ["temples", "tourist-places", "food", "nature"],
  isOpen = true,
  onClose,
  onSelectPlaceOnMap,
  selectedPlaceIds: externalSelectedIds,
  onTogglePlaceSelection,
}: LocationMiniExplorerProps) {
  const navigate = useNavigate();
  const [panelState, setPanelState] = useState<"compact" | "expanded" | "closed">("expanded");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>([location.id]);
  const [originMode, setOriginMode] = useState<"current" | "custom">("current");
  const [customOriginId, setCustomOriginId] = useState<string>("chennai");

  const selectedIds = externalSelectedIds !== undefined ? externalSelectedIds : internalSelectedIds;

  const toggleSelection = (id: string) => {
    if (onTogglePlaceSelection) {
      onTogglePlaceSelection(id);
    } else {
      setInternalSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
      );
    }
  };

  // Geographic Haversine Radius & District Matching Discovery
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
      .sort((a, b) => {
        // User preference ranking boost
        const aPreferred = a.place.categories.some((c) => userPreferredCategories.includes(c));
        const bPreferred = b.place.categories.some((c) => userPreferredCategories.includes(c));
        if (aPreferred && !bPreferred) return -1;
        if (!aPreferred && bPreferred) return 1;
        return a.distKm - b.distKm;
      });
  }, [location, userPreferredCategories]);

  // Extract Non-Empty Dynamic Categories
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    nearbyPlaces.forEach(({ place }) => {
      place.categories.forEach((c) => set.add(c));
    });
    return Array.from(set);
  }, [nearbyPlaces]);

  // Filter Nearby Places by Active Category Filter
  const filteredPlaces = useMemo(() => {
    if (activeCategory === "all") return nearbyPlaces;
    return nearbyPlaces.filter(({ place }) => place.categories.includes(activeCategory as PlaceCategory));
  }, [nearbyPlaces, activeCategory]);

  // Build Trip & Open FullscreenRouteMap CTA Handler
  const handleBuildTrip = () => {
    const origin = originMode === "current" ? "current-location" : customOriginId;
    navigate({
      to: "/routes",
      search: {
        origin,
        destination: location.id,
        mode: "driving",
      },
    });
  };

  if (!isOpen || panelState === "closed") {
    return (
      <div className="fixed bottom-6 right-6 z-40 pointer-events-auto">
        <button
          type="button"
          onClick={() => setPanelState("expanded")}
          className="bg-[#121821]/95 backdrop-blur-2xl border border-white/15 px-4 py-2.5 rounded-full text-xs font-bold text-white shadow-2xl transition flex items-center gap-2 hover:border-emerald-500/40 cursor-pointer"
        >
          <Compass className="w-4 h-4 text-emerald-400" />
          <span>Explore {location.name} ({selectedIds.length} Selected)</span>
        </button>
      </div>
    );
  }

  // STATE 1 — COMPACT
  if (panelState === "compact") {
    return (
      <div className="fixed bottom-6 right-6 z-40 w-80 sm:w-96 pointer-events-auto animate-in slide-in-from-bottom duration-300">
        <div className="bg-[#121821]/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-4 text-white shadow-2xl flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 font-mono">
              <MapPin className="w-3.5 h-3.5" /> {location.canonicalName || location.name}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {nearbyPlaces.length} places nearby · {selectedIds.length} in trip
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPanelState("expanded")}
              className="px-3 py-1.5 rounded-full bg-emerald-500 text-black text-xs font-extrabold shadow-md hover:bg-emerald-400 transition cursor-pointer flex items-center gap-1"
            >
              <ChevronUp className="w-3.5 h-3.5" /> Expand
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-full text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // STATE 2 — EXPANDED
  return (
    <aside className="fixed bottom-6 right-6 z-40 w-80 sm:w-[400px] h-[65vh] sm:h-[70vh] max-h-[640px] pointer-events-auto animate-in slide-in-from-bottom duration-300 font-sans">
      <div className="h-full bg-[#121821]/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-4 shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Drag Handle Bar */}
        <div
          onClick={() => setPanelState("compact")}
          className="w-full flex flex-col items-center cursor-pointer py-1 group"
        >
          <div className="w-12 h-1.5 rounded-full bg-white/20 group-hover:bg-emerald-400 transition" />
          <span className="text-[9px] text-slate-400 uppercase tracking-widest mt-1 font-mono">
            Drag / Click to Collapse
          </span>
        </div>

        {/* Sticky Location Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mt-1">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-bold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" /> Location Mini-Explorer
            </div>
            <h3 className="text-base font-black text-white leading-tight mt-0.5">
              {location.canonicalName || location.name}
            </h3>
            <p className="text-[10px] text-slate-400">
              {location.district}, {location.state} · {nearbyPlaces.length} places nearby
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPanelState("compact")}
              className="p-1 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
              title="Collapse"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Horizontal Category Chips */}
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

        {/* Nearby Place Catalog Scrollable List */}
        <div className="flex-1 overflow-y-auto py-2.5 space-y-2 no-scrollbar">
          {filteredPlaces.map(({ place, distKm }) => {
            const isAdded = selectedIds.includes(place.id);
            const isFocused = place.id === location.id;

            return (
              <div
                key={place.id}
                onClick={() => onSelectPlaceOnMap?.(place)}
                className={`p-2.5 rounded-2xl border transition cursor-pointer ${
                  isFocused
                    ? "bg-emerald-500/20 border-emerald-500/50"
                    : isAdded
                    ? "bg-white/10 border-emerald-500/30"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 overflow-hidden shrink-0">
                    <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-white truncate">{place.canonicalName || place.name}</h4>
                      <span className="text-[9px] text-emerald-400 font-mono shrink-0 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        {distKm === 0 ? "Hub" : `${distKm} km`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-300 mt-1">
                      <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" /> {place.rating}
                      </span>
                      <span>·</span>
                      <span className="capitalize text-slate-400">{place.primaryCategory}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">
                    {place.district}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelection(place.id);
                    }}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
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

        {/* Sticky Bottom Build Trip Action Bar */}
        <div className="pt-3 border-t border-white/10 space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Origin:</span>
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
              <option value="current" className="bg-[#121821] text-white">📍 Live GPS Location</option>
              <option value="chennai" className="bg-[#121821] text-white">📍 Chennai</option>
              <option value="coimbatore" className="bg-[#121821] text-white">📍 Coimbatore</option>
              <option value="madurai" className="bg-[#121821] text-white">📍 Madurai</option>
              <option value="puducherry" className="bg-[#121821] text-white">📍 Puducherry</option>
            </select>
          </div>

          <Button
            onClick={handleBuildTrip}
            className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold py-2.5 text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" /> Build My Trip ({selectedIds.length} Places) <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
