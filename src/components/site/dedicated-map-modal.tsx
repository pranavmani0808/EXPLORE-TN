import React, { useState, useEffect, useRef } from "react";
import { places, Place } from "@/data/places";
import { MapPin, Star, ShieldCheck, ExternalLink, X, Search } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function DedicatedMapModal({
  isOpen,
  onClose,
  initialPlace,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialPlace?: Place | null;
}) {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(initialPlace || places[0]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const leafletModuleRef = useRef<any>(null);

  const filteredPlaces = places.filter((p) => {
    const matchesCategory = activeCategory === "all" || p.category === activeCategory;
    const matchesQuery = !searchQuery.trim() || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;

    let isMounted = true;

    async function initLeaflet() {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (!isMounted || !mapContainerRef.current || leafletMapRef.current) return;

      leafletModuleRef.current = L;

      const map = L.map(mapContainerRef.current, {
        center: [11.1085, 78.3379],
        zoom: 8,
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

  const renderMarkers = () => {
    const map = leafletMapRef.current;
    const L = leafletModuleRef.current;
    if (!map || !L) return;

    Object.values(markersRef.current).forEach((m: any) => m.remove());
    markersRef.current = {};

    filteredPlaces.forEach((place) => {
      const lat = 13.2 - (place.y / 100) * 4.8;
      const lng = 76.5 + (place.x / 100) * 3.8;
      const isSelected = selectedPlace?.slug === place.slug;

      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            ${isSelected ? '<span class="absolute -inset-2 rounded-full bg-emerald-500/40 animate-ping"></span>' : ''}
            <div style="background: ${isSelected ? '#10b981' : '#121821'}; color: ${isSelected ? '#000000' : '#ffffff'}; border: 1.5px solid ${isSelected ? '#34d399' : '#334155'}; padding: 5px 12px; border-radius: 9999px; font-weight: 800; font-size: 11px; font-family: sans-serif; white-space: nowrap; box-shadow: 0 10px 25px rgba(0,0,0,0.6); display: flex; items-center; gap: 4px;">
              <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: ${isSelected ? '#000000' : '#10b981'}; margin-right: 4px;"></span>
              ${place.name}
            </div>
          </div>
        `,
        iconSize: [130, 32],
        iconAnchor: [65, 16],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      marker.on("click", () => {
        setSelectedPlace(place);
        map.panTo([lat, lng], { animate: true });
      });

      markersRef.current[place.slug] = marker;
    });
  };

  useEffect(() => {
    renderMarkers();
  }, [filteredPlaces, selectedPlace]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-[#0B0F14] overflow-hidden font-sans animate-in fade-in duration-200">
      {/* 100% Fullscreen Map Container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />

      {/* Top Floating Glass Header (Apple Maps Style) */}
      <header className="absolute top-5 left-5 right-5 z-40 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Brand Pill & Close Button */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 bg-[#121821]/90 backdrop-blur-2xl border border-white/15 px-4 py-2.5 rounded-full shadow-2xl">
            <span className="grid size-7 place-items-center rounded-full bg-emerald-500 text-black font-black text-xs">
              TN
            </span>
            <div>
              <h1 className="text-xs font-black text-white leading-none">ExplorerTN Spatial Viewport</h1>
              <p className="text-[9px] text-emerald-400 font-mono mt-0.5">CartoDB Dark Engine • Fullscreen Dedicated Map</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-full shadow-2xl transition flex items-center gap-1.5 active:scale-95"
          >
            <X className="w-4 h-4" /> Close Full Screen
          </button>
        </div>

        {/* Floating Spotlight Search Bar */}
        <div className="relative w-full sm:w-96 pointer-events-auto">
          <div className="bg-[#121821]/90 backdrop-blur-2xl border border-white/15 hover:border-emerald-500/40 rounded-full px-4 py-2.5 shadow-2xl flex items-center gap-2.5 transition">
            <Search className="w-4 h-4 text-emerald-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search places or districts..."
              className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none font-medium"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-[10px] text-slate-400 hover:text-white">Clear</button>
            )}
          </div>
        </div>
      </header>

      {/* Floating Left Category Layer Filter Pills */}
      <div className="absolute top-24 left-5 z-30 flex flex-col gap-1.5 pointer-events-auto">
        {["all", "waterfalls", "temples", "hills", "food", "beaches", "offroad"].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition backdrop-blur-2xl border shadow-2xl active:scale-95 text-left ${
              activeCategory === cat
                ? "bg-emerald-500 text-black border-emerald-400"
                : "bg-[#121821]/80 text-slate-300 border-white/10 hover:text-white hover:border-white/20"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Floating Bottom Sheet Place Card */}
      {selectedPlace && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-lg z-40 pointer-events-auto animate-in slide-in-from-bottom duration-300">
          <div className="bg-[#121821]/95 border border-white/15 rounded-3xl p-4 shadow-2xl backdrop-blur-2xl text-white">
            <div className="flex gap-4">
              <img
                src={selectedPlace.image}
                alt={selectedPlace.name}
                className="w-24 h-24 rounded-2xl object-cover shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full uppercase">
                    {selectedPlace.category}
                  </span>
                  <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {selectedPlace.rating}
                  </span>
                </div>
                <h3 className="text-base font-black text-white mt-1">{selectedPlace.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {selectedPlace.district} • 🌤 {selectedPlace.weather}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Link
                    to="/place/$slug"
                    params={{ slug: selectedPlace.slug }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 font-extrabold text-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    View Place Details <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
