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
  Building2,
  Building,
  TreePine,
  MapMarker,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { LocationMiniExplorer } from "@/components/site/location-mini-explorer";
import { TNGeoApiRepository, TNGeoNode, TNGeoAreaDetail } from "@/lib/api/tn-geo-api";

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

  // Administrative Geographic Directory State (Phase 1)
  const [districts, setDistricts] = useState<TNGeoNode[]>([]);
  const [selectedGeoNode, setSelectedGeoNode] = useState<TNGeoNode | null>(null);
  const [areaDetail, setAreaDetail] = useState<TNGeoAreaDetail | null>(null);
  const [geoSearchResults, setGeoSearchResults] = useState<TNGeoNode[]>([]);
  const [isSearchingGeo, setIsSearchingGeo] = useState<boolean>(false);
  const [currentZoomLevel, setCurrentZoomLevel] = useState<number>(7);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const geoMarkersRef = useRef<{ [key: string]: any }>({});
  const leafletModuleRef = useRef<any>(null);

  // Load Administrative Districts on Init
  useEffect(() => {
    async function loadGeoDirectory() {
      try {
        const d = await TNGeoApiRepository.getDistricts();
        setDistricts(d);
      } catch (err) {
        console.error("Failed to load TN Geo Directory", err);
      }
    }
    loadGeoDirectory();
  }, []);

  // Search Engine Listener
  useEffect(() => {
    if (!searchQuery.trim()) {
      setGeoSearchResults([]);
      setIsSearchingGeo(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingGeo(true);
      try {
        const res = await TNGeoApiRepository.searchGeo(searchQuery.trim());
        setGeoSearchResults(res.nodes);
      } catch (err) {
        setGeoSearchResults([]);
      } finally {
        setIsSearchingGeo(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load Area Detail when Selected Area Changes
  useEffect(() => {
    if (!selectedGeoNode) {
      setAreaDetail(null);
      return;
    }
    async function loadDetail() {
      try {
        const det = await TNGeoApiRepository.getAreaDetail(selectedGeoNode.id);
        setAreaDetail(det);
      } catch (err) {
        setAreaDetail(null);
      }
    }
    loadDetail();
  }, [selectedGeoNode]);

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
        zoom: 7.5,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      map.on("zoomend", () => {
        setCurrentZoomLevel(map.getZoom());
      });

      leafletMapRef.current = map;
      renderMarkers();
      renderGeoMarkers();
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

  // Render Administrative Directory Markers
  const renderGeoMarkers = () => {
    const map = leafletMapRef.current;
    const L = leafletModuleRef.current;
    if (!map || !L) return;

    Object.values(geoMarkersRef.current).forEach((m: any) => m.remove());
    geoMarkersRef.current = {};

    districts.forEach((dist) => {
      const isSelected = selectedGeoNode?.id === dist.id;
      const icon = L.divIcon({
        className: `custom-geo-pin-${dist.id}`,
        html: `
          <div style="
            background: ${isSelected ? '#3b82f6' : '#1e293b'};
            color: #ffffff;
            border: 2px solid ${isSelected ? '#93c5fd' : '#64748b'};
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 800;
            font-family: monospace;
            box-shadow: 0 4px 12px rgba(0,0,0,0.6);
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            white-space: nowrap;
          ">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: #60a5fa;"></span>
            <span>${dist.nameEn}</span>
          </div>
        `,
        iconSize: [110, 24],
        iconAnchor: [55, 12]
      });

      const marker = L.marker([dist.latitude, dist.longitude], { icon, zIndexOffset: 200 }).addTo(map);
      marker.on("click", async () => {
        setSelectedGeoNode(dist);
        map.flyTo([dist.latitude, dist.longitude], 9.5, { animate: true, duration: 1.2 });
      });

      geoMarkersRef.current[dist.id] = marker;
    });
  };

  // Render Tourism Markers
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
              width: ${isSelected ? '24px' : '16px'};
              height: ${isSelected ? '24px' : '16px'};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 14px rgba(0,0,0,0.5);
              transition: all 0.2s ease;
            ">
              <span style="width: 5px; height: 5px; border-radius: 50%; background: ${isSelected ? '#000000' : '#38bdf8'};"></span>
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([place.latitude, place.longitude], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 100,
      }).addTo(map);

      marker.bindTooltip(place.canonicalName || place.name, {
        permanent: isSelected,
        direction: "auto",
        offset: [0, -12],
        className: "custom-decluttered-map-tooltip",
      });

      marker.on("click", () => {
        setSelectedPlace(place);
        setSelectedGeoNode(null);
        map.flyTo([place.latitude, place.longitude], 11, { animate: true, duration: 1.2 });
      });

      markersRef.current[place.id] = marker;
    });
  };

  useEffect(() => {
    renderMarkers();
    renderGeoMarkers();
  }, [filteredPlaces, selectedPlace, districts, selectedGeoNode]);

  const selectSearchGeoNode = (node: TNGeoNode) => {
    setSelectedGeoNode(node);
    setSelectedPlace(null);
    setSearchQuery("");
    setGeoSearchResults([]);
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([node.latitude, node.longitude], node.level === "DISTRICT" ? 9.5 : 12, { animate: true, duration: 1.2 });
    }
  };

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
              <h1 className="text-xs font-black text-white leading-none">Tamil Nadu Geographic Directory</h1>
              <p className="text-[9px] text-emerald-400 font-mono mt-0.5">
                38 Districts • 25 Corporations • Local Bodies • Phase 1
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
        <div className="relative w-full sm:w-96 pointer-events-auto">
          <div className="bg-[#0a1419]/90 backdrop-blur-xl border border-white/15 hover:border-emerald-500/40 rounded-full px-3.5 py-2 shadow-2xl flex items-center gap-2 transition">
            <Search className="w-4 h-4 text-emerald-400 shrink-0" />
            <input
              type="text"
              placeholder="Search Tamil Nadu areas (District, City, Town, Village)..."
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

          {/* Search Results Dropdown */}
          {geoSearchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a1419]/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl p-2 z-50 max-h-72 overflow-y-auto space-y-1">
              <div className="px-3 py-1 text-[10px] font-mono text-emerald-400 font-bold uppercase border-b border-white/10">
                Official Geographic Results ({geoSearchResults.length})
              </div>
              {geoSearchResults.map((node) => (
                <button
                  key={node.id}
                  onClick={() => selectSearchGeoNode(node)}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-white/10 transition flex items-center justify-between text-white"
                >
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <span>{node.nameEn}</span>
                      <span className="text-slate-400 text-[10px]">({node.nameTa})</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {node.level} · {node.districtName} District · LGD {node.lgdCode}
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Floating Category Control Bar */}
      <nav
        aria-label="Map Category Filters"
        className="absolute top-16 left-4 z-40 pointer-events-auto flex items-center gap-1.5 max-sm:right-4 max-sm:overflow-x-auto no-scrollbar"
      >
        <div className="bg-[#0a1419]/90 backdrop-blur-xl border border-white/15 rounded-2xl p-1.5 shadow-2xl flex items-center gap-1">
          {primaryCategories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                title={cat.fullLabel}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-emerald-500 text-black shadow-md"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-black" : "text-slate-400"}`} />
                <span>{cat.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Area Information Panel (Side Card overlay) */}
      {selectedGeoNode && (
        <div className="absolute bottom-6 left-6 z-40 w-full max-w-md bg-[#0a1419]/95 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl text-white space-y-4 font-sans animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-start justify-between border-b border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {selectedGeoNode.level}
                </span>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {selectedGeoNode.adminType}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white mt-1">
                {selectedGeoNode.nameEn}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {selectedGeoNode.nameTa} · {selectedGeoNode.districtName} District
              </p>
            </div>
            <button onClick={() => setSelectedGeoNode(null)} className="text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
              <span className="text-[9px] text-slate-400 block uppercase">LGD CODE</span>
              <span className="font-bold text-emerald-400">{selectedGeoNode.lgdCode}</span>
            </div>
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
              <span className="text-[9px] text-slate-400 block uppercase">COORDINATES</span>
              <span className="font-bold text-white">({selectedGeoNode.latitude.toFixed(2)}, {selectedGeoNode.longitude.toFixed(2)})</span>
            </div>
          </div>

          {/* REAL TOURISM DATA LINKED TO AREA */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
              <span className="font-bold text-white font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Linked Explore TN Data
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {areaDetail?.tourismStats.dataAvailability || "LIVE DATABASE"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1">
              <div className="p-2 bg-black/40 rounded-xl">
                <div className="text-[10px] text-slate-400">DESTINATIONS</div>
                <div className="text-base font-bold text-emerald-400">{selectedGeoNode.placesCount}</div>
              </div>
              <div className="p-2 bg-black/40 rounded-xl">
                <div className="text-[10px] text-slate-400">ATTRACTIONS</div>
                <div className="text-base font-bold text-emerald-400">{selectedGeoNode.attractionsCount}</div>
              </div>
              <div className="p-2 bg-black/40 rounded-xl">
                <div className="text-[10px] text-slate-400">HOTELS</div>
                <div className="text-base font-bold text-emerald-400">{selectedGeoNode.hotelsCount}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                const searchQ = selectedGeoNode.nameEn.split(" ")[0];
                setSearchQuery(searchQ);
              }}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition"
            >
              Explore Places in {selectedGeoNode.nameEn} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Contextual Location Mini-Explorer */}
      {selectedPlace && !selectedGeoNode && (
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
