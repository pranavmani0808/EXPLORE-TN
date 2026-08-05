import React, { useState, useEffect, useRef } from "react";
import { places, Place } from "@/data/places";
import { MapPin, Star, ShieldCheck, ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function GoogleMapHero({ apiKey }: { apiKey?: string }) {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(places[0]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const leafletModuleRef = useRef<any>(null);

  const filteredPlaces = activeCategory === "all"
    ? places
    : places.filter((p) => p.category === activeCategory);

  // Initialize Leaflet Map safely on Client side only (SSR Safe)
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current || leafletMapRef.current) return;

    let isMounted = true;

    async function initLeaflet() {
      // Dynamic import Leaflet & CSS on client side only
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (!isMounted || !mapContainerRef.current || leafletMapRef.current) return;

      leafletModuleRef.current = L;

      // Center on Tamil Nadu (approx 11.1085° N, 78.3379° E)
      const map = L.map(mapContainerRef.current, {
        center: [11.1085, 78.3379],
        zoom: 7.5,
        zoomControl: true,
        attributionControl: false,
      });

      // Add CartoDB Dark Matter High-Res Real Map Tile Layer
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

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
  }, []);

  // Update Leaflet Markers when places or selection changes
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
            <div style="background: ${isSelected ? '#10b981' : '#121821'}; color: ${isSelected ? '#000000' : '#ffffff'}; border: 1.5px solid ${isSelected ? '#34d399' : '#334155'}; padding: 4px 10px; border-radius: 9999px; font-weight: 700; font-size: 11px; font-family: sans-serif; white-space: nowrap; box-shadow: 0 10px 25px rgba(0,0,0,0.5); display: flex; items-center; gap: 4px;">
              <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: ${isSelected ? '#000000' : '#10b981'}; margin-right: 4px;"></span>
              ${place.name}
            </div>
          </div>
        `,
        iconSize: [120, 30],
        iconAnchor: [60, 15],
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

  return (
    <div className="relative w-full overflow-hidden rounded-4xl border border-white/15 bg-[#0B0F14] p-4 sm:p-6 shadow-2xl">
      {/* Top Header Bar inside Map */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 z-20 relative">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-xl bg-emerald-500 text-black font-black text-xs shadow-md">
            TN
          </span>
          <div>
            <h3 className="font-display text-sm font-bold text-white leading-none">Tamil Nadu Live Spatial Map</h3>
            <p className="text-[10px] text-emerald-400 font-mono mt-0.5">Real Geographic Map Tiles • CartoDB Dark Engine</p>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {["all", "waterfalls", "temples", "hills", "food", "beaches", "offroad"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition ${
                activeCategory === cat
                  ? "bg-emerald-500 text-black shadow-md"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Container with Real Leaflet CartoDB Map Tiles */}
      <div className="relative h-[480px] sm:h-[560px] w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />

        {/* Selected Place Overlay Card inside Map (Apple Maps Style) */}
        {selectedPlace && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-30 pointer-events-auto">
            <div className="bg-[#121821]/95 border border-white/15 rounded-3xl p-4 shadow-2xl backdrop-blur-2xl text-white">
              <div className="flex gap-3">
                <img
                  src={selectedPlace.image}
                  alt={selectedPlace.name}
                  className="w-20 h-20 rounded-2xl object-cover shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full uppercase">
                      {selectedPlace.category}
                    </span>
                    <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {selectedPlace.rating}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">{selectedPlace.name}</h4>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-emerald-400" /> {selectedPlace.district} • {selectedPlace.weather}
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <Link
                      to="/place/$slug"
                      params={{ slug: selectedPlace.slug }}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 font-bold text-black text-xs rounded-xl transition flex items-center gap-1"
                    >
                      Explore Place <ExternalLink className="w-3 h-3" />
                    </Link>
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
