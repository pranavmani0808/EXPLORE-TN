import React, { useState, useEffect, useRef, useMemo } from "react";
import { CANONICAL_PLACES, ExplorerPlace, PlaceCategory } from "@/lib/data/canonical-places";
import {
  MapPin,
  Star,
  ShieldCheck,
  ExternalLink,
  X,
  Search,
  Sparkles,
  Filter,
  Navigation,
  Compass,
  Map,
  Landmark,
  MapPinned,
  Waves,
  Mountain,
  MountainSnow,
  Umbrella,
  Castle,
  Footprints,
  Droplets,
  ChevronDown,
  Check,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { LocationMiniExplorer } from "@/components/site/location-mini-explorer";

// Category Definitions & Lucide Icon Mapping
export interface CategoryConfig {
  id: string;
  shortLabel: string;
  fullLabel: string;
  icon: React.ElementType;
  isPrimary: boolean;
}

export const CATEGORIES_CONFIG: CategoryConfig[] = [
  { id: "all", shortLabel: "All", fullLabel: "All Places", icon: Map, isPrimary: true },
  { id: "temples", shortLabel: "Temples", fullLabel: "Temples & Sacred Sites", icon: Landmark, isPrimary: true },
  { id: "tourist-places", shortLabel: "Tourist", fullLabel: "Tourist Places & Attractions", icon: MapPinned, isPrimary: true },
  { id: "waterfalls", shortLabel: "Waterfalls", fullLabel: "Waterfalls & Cascades", icon: Waves, isPrimary: true },
  { id: "hills", shortLabel: "Hills", fullLabel: "Hill Stations & Escapes", icon: Mountain, isPrimary: true },
  { id: "mountains", shortLabel: "Mountains", fullLabel: "Mountain Peaks & Trails", icon: MountainSnow, isPrimary: true },
  { id: "beaches", shortLabel: "Coastal", fullLabel: "Coastal & Beaches", icon: Umbrella, isPrimary: false },
  { id: "heritage", shortLabel: "Heritage", fullLabel: "Heritage & Forts", icon: Castle, isPrimary: false },
  { id: "adventure", shortLabel: "Adventure", fullLabel: "Adventure & Wildlife", icon: Compass, isPrimary: false },
  { id: "trekking", shortLabel: "Trekking", fullLabel: "Trekking & Hiking Routes", icon: Footprints, isPrimary: false },
  { id: "rivers", shortLabel: "Rivers", fullLabel: "Rivers & Lakes", icon: Waves, isPrimary: false },
  { id: "dams", shortLabel: "Dams", fullLabel: "Dams & Reservoirs", icon: Droplets, isPrimary: false },
];

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
  const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const leafletModuleRef = useRef<any>(null);

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMoreOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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

  // Leaflet Map Initialization & Lifecycle
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

      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
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

      const marker = L.marker([place.latitude, place.longitude], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 100,
      }).addTo(map);

      // Smart auto-directional decluttered tooltip positioning
      marker.bindTooltip(place.canonicalName || place.name, {
        permanent: isSelected,
        direction: "auto",
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

  if (!isOpen) return null;

  const primaryCategories = CATEGORIES_CONFIG.filter((c) => c.isPrimary);
  const secondaryCategories = CATEGORIES_CONFIG.filter((c) => !c.isPrimary);
  const activeSecondaryCategory = secondaryCategories.find((c) => c.id === activeCategory);

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-[#0B0F14] overflow-hidden font-sans animate-in fade-in duration-200">
      {/* 100% Fullscreen Leaflet Map Container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />

      {/* Top Floating Header Bar */}
      <header className="absolute top-4 left-4 right-4 z-40 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2.5 bg-[#0a1419]/90 backdrop-blur-xl border border-white/15 px-4 py-2 rounded-full shadow-2xl">
            <span className="grid size-6 place-items-center rounded-full bg-emerald-500 text-black font-black text-[10px]">
              TN
            </span>
            <div>
              <h1 className="text-xs font-black text-white leading-none">ExplorerTN Unified Spatial Catalog</h1>
              <p className="text-[9px] text-emerald-400 font-mono mt-0.5">
                CartoDB Dark Engine • {filteredPlaces.length} places
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Fullscreen Map"
            className="px-3.5 py-2 bg-rose-500/90 hover:bg-rose-600 text-white font-bold text-xs rounded-full shadow-2xl transition flex items-center gap-1.5 active:scale-95 cursor-pointer backdrop-blur-xl border border-rose-400/30"
          >
            <X className="w-4 h-4" /> Close Map
          </button>
        </div>

        {/* Spotlight Search Bar */}
        <div className="relative w-full sm:w-80 pointer-events-auto">
          <div className="bg-[#0a1419]/90 backdrop-blur-xl border border-white/15 hover:border-emerald-500/40 rounded-full px-3.5 py-2 shadow-2xl flex items-center gap-2 transition">
            <Search className="w-4 h-4 text-emerald-400 shrink-0" />
            <input
              type="text"
              placeholder="Search places, districts, states..."
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

      {/* Lightweight Floating Category Control Bar (Top-Left overlay, compact & minimal) */}
      <nav
        aria-label="Map Category Filters"
        className="absolute top-16 left-4 z-40 pointer-events-auto flex items-center gap-1.5 max-sm:right-4 max-sm:overflow-x-auto no-scrollbar"
      >
        <div className="bg-[#0a1419]/90 backdrop-blur-xl border border-white/15 rounded-2xl p-1.5 shadow-2xl flex items-center gap-1">
          {/* Primary Categories */}
          {primaryCategories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                title={cat.fullLabel}
                aria-label={`Filter by ${cat.fullLabel}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-emerald-500 text-black shadow-md"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-black" : "text-slate-400"}`} />
                <span>{cat.shortLabel}</span>
                {cat.id === "all" && (
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${isActive ? "bg-black/20 text-black" : "bg-white/10 text-slate-400"}`}>
                    {CANONICAL_PLACES.length}
                  </span>
                )}
              </button>
            );
          })}

          {/* Secondary Categories "More ▾" Popover Menu */}
          <div ref={moreMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsMoreOpen((prev) => !prev)}
              title="More Categories"
              aria-label="More category filters"
              aria-expanded={isMoreOpen}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeSecondaryCategory
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <span>{activeSecondaryCategory ? activeSecondaryCategory.shortLabel : "More"}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMoreOpen ? "rotate-180 text-emerald-400" : "text-slate-400"}`} />
            </button>

            {/* "More ▾" Dropdown Popover */}
            {isMoreOpen && (
              <div
                role="menu"
                className="absolute top-full left-0 mt-2 w-48 bg-[#0a1419]/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-150"
              >
                {secondaryCategories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setIsMoreOpen(false);
                      }}
                      title={cat.fullLabel}
                      aria-label={`Filter by ${cat.fullLabel}`}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
                        isActive
                          ? "bg-emerald-500 text-black font-bold"
                          : "text-slate-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${isActive ? "text-black" : "text-slate-400"}`} />
                        <span>{cat.shortLabel}</span>
                      </div>
                      {isActive && <Check className="w-3.5 h-3.5 text-black" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Contextual Location Mini-Explorer (Bottom-Right Sliding Panel) */}
      {selectedPlace && (
        <LocationMiniExplorer
          location={selectedPlace}
          isOpen={true}
          onClose={() => setSelectedPlace(null)}
          onSelectPlaceOnMap={(place) => {
            setSelectedPlace(place);
            if (leafletMapRef.current) {
              leafletMapRef.current.flyTo([place.latitude, place.longitude], 11, { animate: true, duration: 1.0 });
            }
          }}
        />
      )}
    </div>
  );
}
