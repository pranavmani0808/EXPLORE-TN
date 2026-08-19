import React, { useState, useEffect, useRef, useMemo } from "react";
import { CANONICAL_PLACES, ExplorerPlace, PlaceCategory } from "@/lib/data/canonical-places";
import { MapPin, Star, ShieldCheck, ExternalLink, X, Search, Sparkles, Filter, Navigation, Compass } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function DedicatedMapModal({
  isOpen,
  onClose,
  initialPlace,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialPlace?: ExplorerPlace | null;
}) {
  const navigate = useNavigate();
  const [selectedPlace, setSelectedPlace] = useState<ExplorerPlace | null>(initialPlace || CANONICAL_PLACES[0]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const leafletModuleRef = useRef<any>(null);

  // Dynamic Filtering based on Canonical Catalog
  const filteredPlaces = useMemo(() => {
    return CANONICAL_PLACES.filter((p) => {
      const matchesCategory =
        activeCategory === "all" || p.categories.includes(activeCategory as PlaceCategory);

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;
    let isMounted = true;

    async function initLeaflet() {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (!isMounted || !mapContainerRef.current || leafletMapRef.current) return;

      leafletModuleRef.current = L;

      const map = L.map(mapContainerRef.current, {
        center: [11.5, 78.5],
        zoom: 7,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      leafletMapRef.current = map;
      renderMarkers();
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [isOpen]);

  // Render Real WGS84 Decluttered Markers on Map
  const renderMarkers = () => {
    const map = leafletMapRef.current;
    const L = leafletModuleRef.current;
    if (!map || !L) return;

    Object.values(markersRef.current).forEach((m: any) => m.remove());
    markersRef.current = {};

    filteredPlaces.forEach((place) => {
      const isSelected = selectedPlace?.id === place.id;

      const customIcon = L.divIcon({
        className: `custom-leaflet-pin-${place.id}`,
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ${isSelected ? '<span style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(16,185,129,0.35); animation: ping 1.5s infinite;"></span>' : ''}
            <div style="
              background: ${isSelected ? '#10b981' : '#0f172a'};
              color: ${isSelected ? '#000000' : '#ffffff'};
              border: 2px solid ${isSelected ? '#6ee7b7' : '#38bdf8'};
              width: ${isSelected ? '26px' : '18px'};
              height: ${isSelected ? '26px' : '18px'};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 14px rgba(0,0,0,0.5);
              transition: all 0.2s ease;
            ">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: ${isSelected ? '#000000' : '#38bdf8'};"></span>
            </div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([place.latitude, place.longitude], { icon: customIcon }).addTo(map);

      // Decluttered tooltip positioning
      marker.bindTooltip(place.canonicalName || place.name, {
        permanent: isSelected,
        direction: "top",
        offset: [0, -12],
        className: "custom-decluttered-map-tooltip",
      });

      marker.on("click", () => {
        setSelectedPlace(place);
        map.flyTo([place.latitude, place.longitude], 11, { animate: true, duration: 1.2 });
      });

      markersRef.current[place.id] = marker;
    });

    if (filteredPlaces.length > 0 && selectedPlace) {
      const isSelectedInFilter = filteredPlaces.some((p) => p.id === selectedPlace.id);
      if (!isSelectedInFilter) {
        setSelectedPlace(filteredPlaces[0]);
      }
    }
  };

  useEffect(() => {
    renderMarkers();
  }, [filteredPlaces, selectedPlace]);

  const handleSelectPlaceFromSearch = (place: ExplorerPlace) => {
    setSelectedPlace(place);
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([place.latitude, place.longitude], 12, { animate: true, duration: 1.2 });
    }
  };

  const handlePlanTrip = (place: ExplorerPlace) => {
    navigate({
      to: "/planner",
      search: { prompt: `Plan a trip to ${place.name}, ${place.district}, ${place.state}.` },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-[#0B0F14] overflow-hidden font-sans animate-in fade-in duration-200">
      {/* 100% Fullscreen Leaflet Map Container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />

      {/* Top Floating Header */}
      <header className="absolute top-5 left-5 right-5 z-40 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 bg-[#121821]/90 backdrop-blur-2xl border border-white/15 px-4 py-2.5 rounded-full shadow-2xl">
            <span className="grid size-7 place-items-center rounded-full bg-emerald-500 text-black font-black text-xs">
              TN
            </span>
            <div>
              <h1 className="text-xs font-black text-white leading-none">ExplorerTN Unified Spatial Catalog</h1>
              <p className="text-[9px] text-emerald-400 font-mono mt-0.5">
                CartoDB Dark Engine • Showing {filteredPlaces.length} of {CANONICAL_PLACES.length} places
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-full shadow-2xl transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4" /> Close Map
          </button>
        </div>

        {/* Spotlight Search Bar */}
        <div className="relative w-full sm:w-96 pointer-events-auto">
          <div className="bg-[#121821]/90 backdrop-blur-2xl border border-white/15 hover:border-emerald-500/40 rounded-full px-4 py-2.5 shadow-2xl flex items-center gap-2.5 transition">
            <Search className="w-4 h-4 text-emerald-400" />
            <input
              type="text"
              placeholder="Search 50+ places, districts, states..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Category Pills Bar */}
      <div className="absolute top-20 left-5 right-5 z-40 pointer-events-auto flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: "all", label: "All Places" },
          { id: "temples", label: "🛕 Temples" },
          { id: "tourist-places", label: "📍 Tourist Places" },
          { id: "waterfalls", label: "🌊 Waterfalls" },
          { id: "hills", label: "🏔️ Hills" },
          { id: "mountains", label: "⛰️ Mountains" },
          { id: "beaches", label: "🏖️ Coastal & Beaches" },
          { id: "heritage", label: "🏰 Heritage & Forts" },
          { id: "adventure", label: "🥾 Adventure" },
          { id: "trekking", label: "🎒 Trekking" },
          { id: "rivers", label: "🛶 Rivers" },
          { id: "dams", label: "🏞️ Dams" },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap border cursor-pointer ${
              activeCategory === cat.id
                ? "bg-emerald-500 text-black border-emerald-400 shadow-lg"
                : "bg-[#121821]/80 text-slate-300 border-white/10 hover:bg-slate-800 hover:text-white"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Selected Place Card (Bottom Overlay) */}
      {selectedPlace && (
        <div className="absolute bottom-6 left-5 right-5 sm:left-auto sm:right-6 sm:w-[420px] z-40 pointer-events-auto animate-in slide-in-from-bottom duration-300">
          <div className="rounded-3xl border border-white/15 bg-[#121821]/95 backdrop-blur-2xl p-5 text-white shadow-2xl">
            <div className="relative h-40 w-full rounded-2xl overflow-hidden mb-4 bg-slate-900">
              <img
                src={selectedPlace.image}
                alt={selectedPlace.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121821] via-transparent to-transparent" />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-black uppercase font-mono">
                  {selectedPlace.primaryCategory}
                </span>
                {selectedPlace.verified && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/90 text-white flex items-center gap-1 backdrop-blur-md">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-white">{selectedPlace.name}</h3>
                  {selectedPlace.rating && (
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{selectedPlace.rating}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    {selectedPlace.district}, {selectedPlace.state}, {selectedPlace.country}
                  </span>
                </p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                {selectedPlace.description}
              </p>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                <Button
                  size="sm"
                  onClick={() => handlePlanTrip(selectedPlace)}
                  className="rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Plan Trip
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (leafletMapRef.current) {
                      leafletMapRef.current.flyTo([selectedPlace.latitude, selectedPlace.longitude], 14, {
                        animate: true,
                        duration: 1.0,
                      });
                    }
                  }}
                  className="rounded-xl text-xs font-semibold border-white/15 text-white hover:bg-white/10"
                >
                  <Navigation className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Zoom to Location
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
