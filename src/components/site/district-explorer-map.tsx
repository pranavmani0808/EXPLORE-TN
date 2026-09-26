import { useEffect, useRef, useState } from "react";
import type L from "leaflet";
import { DistrictSpot, DistrictCategoryKey } from "@/lib/data/districts";
import { getGoogleTileUrl, loadGoogleMapsScript } from "@/lib/google-maps-loader";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Clock, X, Layers } from "lucide-react";

interface DistrictExplorerMapProps {
  spots: DistrictSpot[];
  centerCoords: [number, number];
  defaultZoom: number;
  selectedCategory: DistrictCategoryKey;
  activeSpotId: string | null;
  onSelectSpot: (spot: DistrictSpot | null) => void;
  className?: string;
}

export type MapTileStyle = "google-roadmap" | "google-satellite" | "google-terrain" | "osm";

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; pinBg: string }> = {
  temples: { bg: "#f59e0b", border: "#d97706", text: "#78350f", pinBg: "#f59e0b" },
  "tourist-spots": { bg: "#10b981", border: "#059669", text: "#064e3b", pinBg: "#10b981" },
  "food-spots": { bg: "#f97316", border: "#ea580c", text: "#7c2d12", pinBg: "#f97316" },
  "thrift-streets": { bg: "#a855f7", border: "#9333ea", text: "#581c87", pinBg: "#a855f7" },
};

function getCategoryIconSymbol(cat: string): string {
  switch (cat) {
    case "temples":
      return "🛕";
    case "tourist-spots":
      return "🏛️";
    case "food-spots":
      return "🍲";
    case "thrift-streets":
      return "🛍️";
    default:
      return "📍";
  }
}

function getTileLayerUrl(style: MapTileStyle): string {
  switch (style) {
    case "google-roadmap":
      return getGoogleTileUrl("roadmap");
    case "google-satellite":
      return getGoogleTileUrl("hybrid"); // High-res Satellite + Road Labels
    case "google-terrain":
      return "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"; // Topographic Elevation Contours & Mountain Relief
    case "osm":
      return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"; // Dark Mode Mapcn
    default:
      return getGoogleTileUrl("roadmap");
  }
}

function computeDistrictBounds(LModule: typeof L, centerCoords: [number, number], spots: DistrictSpot[]) {
  const points: [number, number][] = [[centerCoords[0], centerCoords[1]]];
  spots.forEach((s) => {
    if (typeof s.latitude === "number" && typeof s.longitude === "number") {
      points.push([s.latitude, s.longitude]);
    }
  });

  let minLat = points[0][0];
  let maxLat = points[0][0];
  let minLng = points[0][1];
  let maxLng = points[0][1];

  points.forEach(([lat, lng]) => {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  });

  const padLat = Math.max(0.35, (maxLat - minLat) * 0.4);
  const padLng = Math.max(0.35, (maxLng - minLng) * 0.4);

  return LModule.latLngBounds(
    [minLat - padLat, minLng - padLng],
    [maxLat + padLat, maxLng + padLng]
  );
}

export function DistrictExplorerMap({
  spots,
  centerCoords,
  defaultZoom,
  selectedCategory,
  activeSpotId,
  onSelectSpot,
  className = "h-[540px] w-full rounded-3xl overflow-hidden shadow-2xl border border-zinc-800",
}: DistrictExplorerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const leafletRef = useRef<typeof L | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  const [mapStyle, setMapStyle] = useState<MapTileStyle>("google-roadmap");
  const [hoveredSpot, setHoveredSpot] = useState<DistrictSpot | null>(null);
  const [isPopupDismissed, setIsPopupDismissed] = useState(false);

  const filteredSpots = spots.filter((s) => selectedCategory === "all" || s.category === selectedCategory);

  // Load Google Maps JS SDK in background
  useEffect(() => {
    loadGoogleMapsScript().catch(() => {});
  }, []);

  // Initialize Map with Google Maps Tiles & Dynamic District Bounds
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;
    let isCancelled = false;

    (async () => {
      const LModule = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      if (isCancelled || !mapContainerRef.current) return;

      leafletRef.current = LModule;
      const bounds = computeDistrictBounds(LModule, centerCoords, spots);

      if (!mapInstanceRef.current) {
        const map = LModule.map(mapContainerRef.current, {
          center: centerCoords,
          zoom: defaultZoom,
          minZoom: 9,
          maxZoom: 18,
          maxBounds: bounds,
          maxBoundsViscosity: 0.8,
          zoomControl: true,
          scrollWheelZoom: false,
        });

        // Google Maps Roadmap Tile Layer
        const tileLayer = LModule.tileLayer(getTileLayerUrl("google-roadmap"), {
          attribution: '&copy; <a href="https://maps.google.com">Google Maps Engine</a>',
          subdomains: ["mt0", "mt1", "mt2", "mt3"],
          maxZoom: 19,
        }).addTo(map);

        tileLayerRef.current = tileLayer;
        mapInstanceRef.current = map;
      } else {
        mapInstanceRef.current.setMaxBounds(bounds);
        mapInstanceRef.current.setView(centerCoords, defaultZoom);
      }
    })();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [centerCoords[0], centerCoords[1], defaultZoom, spots]);

  // Update Map Style (Google Roadmap / Satellite Hybrid / Topographic Terrain / Dark Mapcn)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const LModule = leafletRef.current;
    if (!map || !LModule) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const subdomains =
      mapStyle === "google-terrain"
        ? ["a", "b", "c"]
        : mapStyle === "osm"
        ? ["a", "b", "c", "d"]
        : ["mt0", "mt1", "mt2", "mt3"];

    const attribution =
      mapStyle === "google-terrain"
        ? '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
        : mapStyle === "osm"
        ? '&copy; <a href="https://carto.com">CARTO Dark</a>'
        : '&copy; <a href="https://maps.google.com">Google Maps Engine</a>';

    const newTileLayer = LModule.tileLayer(getTileLayerUrl(mapStyle), {
      attribution,
      subdomains,
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
  }, [mapStyle]);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const LModule = leafletRef.current;
    if (!map || !LModule) return;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    filteredSpots.forEach((spot) => {
      const colorScheme = CATEGORY_COLORS[spot.category] || CATEGORY_COLORS.temples;
      const emoji = getCategoryIconSymbol(spot.category);

      const customIcon = LModule.divIcon({
        className: "custom-district-marker",
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background-color: ${colorScheme.pinBg};
            border: 2px solid white;
            box-shadow: 0 4px 14px rgba(0,0,0,0.4);
            font-size: 18px;
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            <span>${emoji}</span>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const marker = LModule.marker([spot.latitude, spot.longitude], { icon: customIcon }).addTo(map);

      marker.on("click", () => {
        onSelectSpot(spot);
        setIsPopupDismissed(false);
        map.flyTo([spot.latitude, spot.longitude], 15, { duration: 1 });
      });

      marker.on("mouseover", () => {
        if (typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches) {
          setHoveredSpot(spot);
          setIsPopupDismissed(false);
        }
      });

      marker.on("mouseout", () => {
        setHoveredSpot(null);
      });

      markersRef.current.set(spot.id, marker);
    });
  }, [filteredSpots, onSelectSpot]);

  // Handle activeSpotId changes (flying to marker from place card click)
  useEffect(() => {
    if (!activeSpotId || !mapInstanceRef.current) return;
    const targetSpot = spots.find((s) => s.id === activeSpotId);
    if (targetSpot) {
      setIsPopupDismissed(false);
      mapInstanceRef.current.flyTo([targetSpot.latitude, targetSpot.longitude], 15, { duration: 1.2 });
    }
  }, [activeSpotId, spots]);

  const activeOrHoveredSpot = hoveredSpot || spots.find((s) => s.id === activeSpotId);

  return (
    <div className="relative size-full transform-gpu">
      <div ref={mapContainerRef} className={className} />

      {/* Google Maps / Mapcn Engine Indicator */}
      <div className="pointer-events-none absolute top-3 left-3 z-[900] flex items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-950/85 px-3 py-1.5 backdrop-blur-md text-[11px] text-emerald-400 font-mono shadow-md">
        <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-bold">
          {mapStyle === "google-roadmap"
            ? "GOOGLE MAPS ROADMAP"
            : mapStyle === "google-satellite"
            ? "GOOGLE SATELLITE HYBRID"
            : mapStyle === "google-terrain"
            ? "TOPOGRAPHIC ELEVATION TERRAIN"
            : "MAPCN DARK MODE"}{" "}
          · BOUNDARY LOCKED
        </span>
      </div>

      {/* Map Style Selector Controls (Google Roadmap / Satellite / Terrain / Dark Mapcn) */}
      <div className="absolute top-3 right-3 z-[900] flex items-center gap-1 rounded-xl border border-zinc-800/80 bg-zinc-950/90 p-1 backdrop-blur-md text-[10px] shadow-lg">
        <button
          onClick={() => setMapStyle("google-roadmap")}
          className={`px-2.5 py-1 rounded-lg font-semibold transition ${
            mapStyle === "google-roadmap" ? "bg-emerald-500 text-zinc-950 font-bold shadow-sm" : "text-zinc-300 hover:text-white hover:bg-zinc-800"
          }`}
        >
          🗺️ Google Map
        </button>
        <button
          onClick={() => setMapStyle("google-satellite")}
          className={`px-2.5 py-1 rounded-lg font-semibold transition ${
            mapStyle === "google-satellite" ? "bg-emerald-500 text-zinc-950 font-bold shadow-sm" : "text-zinc-300 hover:text-white hover:bg-zinc-800"
          }`}
        >
          🛰️ Satellite
        </button>
        <button
          onClick={() => setMapStyle("google-terrain")}
          className={`px-2.5 py-1 rounded-lg font-semibold transition ${
            mapStyle === "google-terrain" ? "bg-emerald-500 text-zinc-950 font-bold shadow-sm" : "text-zinc-300 hover:text-white hover:bg-zinc-800"
          }`}
        >
          ⛰️ Topo Terrain
        </button>
        <button
          onClick={() => setMapStyle("osm")}
          className={`px-2.5 py-1 rounded-lg font-semibold transition ${
            mapStyle === "osm" ? "bg-emerald-500 text-zinc-950 font-bold shadow-sm" : "text-zinc-300 hover:text-white hover:bg-zinc-800"
          }`}
        >
          🌙 Dark Mapcn
        </button>
      </div>

      {/* Compact Floating Mapcn Card Popup (Sleek & Non-Intrusive) */}
      {activeOrHoveredSpot && !isPopupDismissed && (
        <div className="absolute bottom-4 left-4 z-[1000] w-72 md:w-80 rounded-2xl border border-zinc-700/80 bg-zinc-950/95 p-3.5 text-zinc-100 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-2">
            <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-300 text-[10px] uppercase tracking-wider">
              {getCategoryIconSymbol(activeOrHoveredSpot.category)} {activeOrHoveredSpot.categoryLabel}
            </Badge>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                <span>{activeOrHoveredSpot.rating}</span>
              </div>
              <button
                onClick={() => setIsPopupDismissed(true)}
                className="rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
                title="Dismiss overlay"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>

          <h4 className="mt-1.5 font-display text-sm font-bold text-white line-clamp-1">{activeOrHoveredSpot.name}</h4>
          <p className="mt-0.5 text-[11px] text-zinc-300 line-clamp-2 leading-tight">{activeOrHoveredSpot.tagline}</p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-zinc-400 pt-1.5 border-t border-zinc-800/80">
            <span className="flex items-center gap-1">
              <MapPin className="size-3 text-emerald-400" />
              {activeOrHoveredSpot.address.split(",")[0]}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3 text-sky-400" />
              {activeOrHoveredSpot.timings}
            </span>
          </div>

          {activeOrHoveredSpot.mustTry && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {activeOrHoveredSpot.mustTry.slice(0, 2).map((item, idx) => (
                <span key={idx} className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-[9px] text-amber-300">
                  • {item}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating Map Category Legend */}
      <div className="absolute bottom-4 right-4 z-[900] flex items-center gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/85 px-3 py-1.5 backdrop-blur-md text-[10px]">
        <div className="flex items-center gap-1.5 text-amber-300">
          <span>🛕</span> <span className="font-medium text-zinc-200">Temples</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-300">
          <span>🏛️</span> <span className="font-medium text-zinc-200">Tourist</span>
        </div>
        <div className="flex items-center gap-1.5 text-orange-300">
          <span>🍲</span> <span className="font-medium text-zinc-200">Food</span>
        </div>
        <div className="flex items-center gap-1.5 text-purple-300">
          <span>🛍️</span> <span className="font-medium text-zinc-200">Thrift Streets</span>
        </div>
      </div>
    </div>
  );
}
