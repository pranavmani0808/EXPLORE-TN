import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin, Navigation, Car, Bike, Footprints, Clock, Route as RouteIcon,
  Plus, X, ChevronDown, Fuel, Wallet, Search, Loader2,
  ArrowRight, Bookmark, RefreshCw, Trash2, CheckCircle2,
  Mountain, Waves, TreePine, Landmark, UtensilsCrossed, Bus,
  Calendar, Timer, LocateFixed, ChevronRight, Star, Info,
  Compass
} from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { toast } from "sonner";
import {
  CANONICAL_PLACES,
  searchEntities,
  ExplorerPlace,
  PlaceCategory,
} from "@/lib/data/canonical-places";
import { RouteApiRepository, IsolatedRouteResultDTO } from "@/lib/api-client/routes";
import { getPlacesWithinRadius, getPlacesInBand, NearbyPlace } from "@/lib/geo-radius";
import {
  createNewTrip, getActiveTrip, saveActiveTrip, clearActiveTrip,
  addStopToTrip, removeStopFromTrip, estimateFuelCost, formatDuration,
  ActiveTrip, TripStop
} from "@/lib/trip-store";
import { savePlaceToCollection, getSavedPlaces } from "@/lib/explorer-gamification";

export const Route = createFileRoute("/trip-planner")({
  head: () => ({
    meta: [
      { title: "Smart Trip Planner — ExplorerTN" },
      { name: "description", content: "Plan your Tamil Nadu road trip with interactive maps, nearby discovery, route calculation and budget estimation." },
    ],
  }),
  component: TripPlannerPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface LocationSuggestion {
  id: string;
  name: string;
  sublabel: string;
  lat: number;
  lng: number;
}

// ─── Well-known city coordinates ──────────────────────────────────────────────
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "Chennai": { lat: 13.0827, lng: 80.2707 },
  "Madurai": { lat: 9.9252, lng: 78.1198 },
  "Coimbatore": { lat: 11.0168, lng: 76.9558 },
  "Ooty": { lat: 11.4102, lng: 76.6950 },
  "Kodaikanal": { lat: 10.2381, lng: 77.4892 },
  "Kanyakumari": { lat: 8.0883, lng: 77.5385 },
  "Thanjavur": { lat: 10.7870, lng: 79.1378 },
  "Trichy": { lat: 10.7905, lng: 78.7047 },
  "Salem": { lat: 11.6643, lng: 78.1460 },
  "Pondicherry": { lat: 11.9416, lng: 79.8083 },
  "Rameswaram": { lat: 9.2876, lng: 79.3129 },
  "Valparai": { lat: 10.3270, lng: 76.9554 },
  "Yercaud": { lat: 11.7753, lng: 78.2093 },
  "Hogenakkal": { lat: 12.1182, lng: 77.7761 },
  "Courtallam": { lat: 8.9395, lng: 77.2776 },
  "Vellore": { lat: 12.9165, lng: 79.1325 },
  "Tirunelveli": { lat: 8.7139, lng: 77.7567 },
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  waterfalls: <Waves className="w-3.5 h-3.5" />,
  hills: <Mountain className="w-3.5 h-3.5" />,
  beaches: <Waves className="w-3.5 h-3.5" />,
  temples: <Landmark className="w-3.5 h-3.5" />,
  heritage: <Landmark className="w-3.5 h-3.5" />,
  trekking: <TreePine className="w-3.5 h-3.5" />,
  food: <UtensilsCrossed className="w-3.5 h-3.5" />,
};
const CATEGORY_EMOJI: Record<string, string> = {
  waterfalls: "💧", hills: "⛰️", beaches: "🏖️", temples: "🛕",
  heritage: "🏛️", trekking: "🥾", food: "🍲", museums: "🏛",
  wildlife: "🌿", adventure: "🧗", lakes: "🏞️",
};
const CAT_COLOR: Record<string, string> = {
  waterfalls: "text-sky-400 bg-sky-500/15 border-sky-500/30",
  hills: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
  beaches: "text-cyan-400 bg-cyan-500/15 border-cyan-500/30",
  temples: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  heritage: "text-purple-400 bg-purple-500/15 border-purple-500/30",
  trekking: "text-lime-400 bg-lime-500/15 border-lime-500/30",
  food: "text-orange-400 bg-orange-500/15 border-orange-500/30",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildSuggestions(query: string): LocationSuggestion[] {
  if (!query.trim()) return [];
  const results = searchEntities(query).slice(0, 8);
  return results.map((r) => ({
    id: r.id,
    name: r.name,
    sublabel: r.sublabel,
    lat: r.place?.latitude ?? r.area?.latitude ?? 0,
    lng: r.place?.longitude ?? r.area?.longitude ?? 0,
  })).filter((s) => s.lat !== 0);
}

function catColorClass(cat: string) {
  return CAT_COLOR[cat] || "text-slate-400 bg-white/5 border-white/10";
}

// ─── Place Card ───────────────────────────────────────────────────────────────
function NearbyPlaceCard({
  place,
  onAddToTrip,
  isInTrip,
}: {
  place: NearbyPlace;
  onAddToTrip: (p: NearbyPlace) => void;
  isInTrip: boolean;
}) {
  const emoji = CATEGORY_EMOJI[place.primaryCategory] || "📍";
  const colorCls = catColorClass(place.primaryCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="shrink-0 w-56 bg-[#141c26] border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:border-white/25 transition-all group cursor-pointer"
    >
      {/* Image area */}
      <div className="h-28 bg-gradient-to-br from-slate-700 to-slate-800 relative overflow-hidden">
        {place.image ? (
          <img
            src={place.image}
            alt={place.canonicalName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-4xl">{emoji}</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${colorCls}`}>
          {emoji} {place.primaryCategory}
        </span>
        {place.rating && (
          <span className="absolute top-2 right-2 text-[10px] font-bold text-amber-300 flex items-center gap-0.5 bg-black/50 px-1.5 py-0.5 rounded-full">
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> {place.rating}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <h4 className="font-bold text-white text-xs leading-tight line-clamp-2">
          {place.canonicalName || place.name}
        </h4>
        <p className="text-[10px] text-slate-400 line-clamp-2">{place.tagline || place.description}</p>

        {/* Distance badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
            <Navigation className="w-2.5 h-2.5" /> {place.distanceKm} km
          </span>
          <span className="flex items-center gap-1 text-[10px] text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded-full border border-sky-500/20">
            <Clock className="w-2.5 h-2.5" /> ~{formatDuration(place.estimatedDriveMins)}
          </span>
        </div>

        {/* Add to Trip */}
        <button
          type="button"
          onClick={() => onAddToTrip(place)}
          className={`w-full py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            isInTrip
              ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
              : "bg-white/5 border border-white/15 text-slate-300 hover:bg-emerald-500/15 hover:border-emerald-500/40 hover:text-emerald-400"
          }`}
        >
          {isInTrip ? <CheckCircle2 className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          {isInTrip ? "Added to Trip" : "Add to Trip"}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Location Input with autocomplete ─────────────────────────────────────────
function LocationInput({
  label, icon, value, placeholder, onChange, onSelect, suggestions, showDropdown, onFocus, onBlur,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  onSelect: (s: LocationSuggestion) => void;
  suggestions: LocationSuggestion[];
  showDropdown: boolean;
  onFocus: () => void;
  onBlur: () => void;
}) {
  return (
    <div className="relative">
      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">{label}</label>
      <div className="flex items-center gap-2 bg-white/5 border border-white/15 focus-within:border-emerald-400 px-3 py-2.5 rounded-xl transition">
        <span className="text-emerald-400 shrink-0">{icon}</span>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={() => setTimeout(onBlur, 180)}
          className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-medium"
        />
        {value && (
          <button type="button" onClick={() => onChange("")} className="text-slate-500 hover:text-white shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <AnimatePresence>
        {showDropdown && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#0e1520]/98 backdrop-blur-2xl border border-white/20 rounded-2xl max-h-52 overflow-y-auto shadow-2xl p-1.5 custom-scrollbar"
          >
            {suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onMouseDown={() => onSelect(s)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-emerald-500/15 text-left transition cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{s.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{s.sublabel}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function TripPlannerPage() {
  // ── Origin / Destination state
  const [originText, setOriginText] = useState("");
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [originName, setOriginName] = useState("");
  const [destText, setDestText] = useState("");
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destName, setDestName] = useState("");

  // ── Autocomplete suggestions
  const [originSugs, setOriginSugs] = useState<LocationSuggestion[]>([]);
  const [destSugs, setDestSugs] = useState<LocationSuggestion[]>([]);
  const [showOriginDrop, setShowOriginDrop] = useState(false);
  const [showDestDrop, setShowDestDrop] = useState(false);

  // ── Trip config
  const [travelMode, setTravelMode] = useState<"driving" | "motorcycle" | "walking" | "cycling">("driving");
  const [travelDate, setTravelDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [departureTime, setDepartureTime] = useState("07:00");

  // ── Extra stops
  const [extraStops, setExtraStops] = useState<TripStop[]>([]);
  const [stopText, setStopText] = useState("");
  const [stopSugs, setStopSugs] = useState<LocationSuggestion[]>([]);
  const [showStopDrop, setShowStopDrop] = useState(false);

  // ── Route result
  const [routeResult, setRouteResult] = useState<IsolatedRouteResultDTO | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // ── Active trip
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(() => getActiveTrip());

  // ── Nearby discovery
  const [nearbyCategory, setNearbyCategory] = useState<PlaceCategory>("all");
  const [exploreRangeKm, setExploreRangeKm] = useState<"50-100" | "100-200" | "200+">("50-100");

  // ── Map
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletModRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  // ── Derived: nearby and explore-more places
  const nearbyPlaces = useMemo<NearbyPlace[]>(() => {
    if (!destCoords) return [];
    return getPlacesWithinRadius(
      destCoords.lat, destCoords.lng, 50,
      nearbyCategory === "all" ? undefined : nearbyCategory,
      activeTrip?.stops.map((s) => s.id) || []
    ).slice(0, 30);
  }, [destCoords, nearbyCategory, activeTrip]);

  const explorePlaces = useMemo<NearbyPlace[]>(() => {
    if (!destCoords) return [];
    const [min, max] = exploreRangeKm === "50-100" ? [50, 100] : exploreRangeKm === "100-200" ? [100, 200] : [200, 600];
    return getPlacesInBand(
      destCoords.lat, destCoords.lng, min, max,
      nearbyCategory === "all" ? undefined : nearbyCategory,
      activeTrip?.stops.map((s) => s.id) || []
    ).slice(0, 30);
  }, [destCoords, exploreRangeKm, nearbyCategory, activeTrip]);

  const tripStopIds = useMemo(() => new Set(activeTrip?.stops.map((s) => s.id) || []), [activeTrip]);

  // ── Fuel & cost
  const fuelCost = useMemo(() => {
    if (!routeResult) return 0;
    const vType = travelMode === "motorcycle" ? "bike" : travelMode === "walking" ? "car" : "car";
    return estimateFuelCost(routeResult.distanceKm, vType as any);
  }, [routeResult, travelMode]);

  // ─────────────────────────────────────────────────────
  // Autocomplete handlers
  // ─────────────────────────────────────────────────────
  useEffect(() => {
    setOriginSugs(buildSuggestions(originText));
  }, [originText]);

  useEffect(() => {
    setDestSugs(buildSuggestions(destText));
  }, [destText]);

  useEffect(() => {
    setStopSugs(buildSuggestions(stopText));
  }, [stopText]);

  const handleSelectOrigin = useCallback((s: LocationSuggestion) => {
    setOriginText(s.name);
    setOriginName(s.name);
    setOriginCoords({ lat: s.lat, lng: s.lng });
    setShowOriginDrop(false);
  }, []);

  const handleSelectDest = useCallback((s: LocationSuggestion) => {
    setDestText(s.name);
    setDestName(s.name);
    setDestCoords({ lat: s.lat, lng: s.lng });
    setShowDestDrop(false);
  }, []);

  const handleAddStop = useCallback((s: LocationSuggestion) => {
    const stop: TripStop = {
      id: s.id,
      name: s.name,
      latitude: s.lat,
      longitude: s.lng,
      addedAt: new Date().toISOString(),
    };
    setExtraStops((prev) => prev.some((p) => p.id === s.id) ? prev : [...prev, stop]);
    setStopText("");
    setShowStopDrop(false);
  }, []);

  // ─────────────────────────────────────────────────────
  // Route Calculation
  // ─────────────────────────────────────────────────────
  const handleCalculateRoute = useCallback(async () => {
    if (!originCoords || !destCoords) {
      toast.error("Please enter both origin and destination.");
      return;
    }
    setRouteLoading(true);
    setRouteError(null);
    try {
      const allStops = [
        { name: originName, latitude: originCoords.lat, longitude: originCoords.lng, state: "Tamil Nadu", country: "India" },
        ...extraStops.map((s) => ({ name: s.name, latitude: s.latitude, longitude: s.longitude, state: "Tamil Nadu", country: "India" })),
        { name: destName, latitude: destCoords.lat, longitude: destCoords.lng, state: "Tamil Nadu", country: "India" },
      ];

      const result = await RouteApiRepository.calculateRoute({
        requestId: `trip-${Date.now()}`,
        origin: allStops[0],
        waypoints: allStops.slice(1, -1),
        destination: allStops[allStops.length - 1],
        travelMode,
      });
      setRouteResult(result);

      // Create / update active trip
      const trip = createNewTrip({
        originName,
        originLat: originCoords.lat,
        originLng: originCoords.lng,
        destinationName: destName,
        destinationLat: destCoords.lat,
        destinationLng: destCoords.lng,
        travelMode,
        travelDate,
        departureTime,
      });
      // Add extra stops
      extraStops.forEach((stop) => addStopToTrip(stop));
      setActiveTrip(getActiveTrip());
      toast.success(`Route calculated: ${result.distanceKm} km · ${formatDuration(result.durationMinutes)} 🗺️`);
    } catch (err: any) {
      setRouteError(err?.message || "Could not calculate route. Please check your locations.");
      toast.error("Route calculation failed.");
    } finally {
      setRouteLoading(false);
    }
  }, [originCoords, destCoords, originName, destName, extraStops, travelMode, travelDate, departureTime]);

  // ─────────────────────────────────────────────────────
  // Map initialization & updates
  // ─────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    let map: any;
    (async () => {
      const L = await import("leaflet");
      leafletModRef.current = L;
      if (!mapContainerRef.current || leafletMapRef.current) return;

      map = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false })
        .setView([10.5, 78.5], 7);

      try {
        const { getGoogleTileUrl } = await import("@/lib/google-maps-loader");
        const tileUrl = getGoogleTileUrl("roadmap");
        L.tileLayer(tileUrl, { maxZoom: 20 }).addTo(map);
      } catch {
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
      }

      L.control.zoom({ position: "bottomright" }).addTo(map);
      leafletMapRef.current = map;
    })();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update markers & polyline whenever route or stops change
  useEffect(() => {
    const map = leafletMapRef.current;
    const L = leafletModRef.current;
    if (!map || !L) return;

    // Clear existing
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];
    if (polylineRef.current) { map.removeLayer(polylineRef.current); polylineRef.current = null; }

    const bounds = L.latLngBounds([]);

    const makeDotIcon = (color: string, label: string) => L.divIcon({
      className: "",
      html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center;">
        <div style="width:16px;height:16px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.5);"></div>
        <div style="background:${color};color:#fff;font-size:10px;font-weight:800;padding:2px 7px;border-radius:999px;margin-top:3px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.4);">${label}</div>
      </div>`,
      iconSize: [80, 40],
      iconAnchor: [40, 16],
    });

    if (originCoords) {
      const m = L.marker([originCoords.lat, originCoords.lng], { icon: makeDotIcon("#10b981", `🚦 ${originName || "Start"}`) }).addTo(map);
      markersRef.current.push(m);
      bounds.extend([originCoords.lat, originCoords.lng]);
    }

    extraStops.forEach((stop, idx) => {
      const m = L.marker([stop.latitude, stop.longitude], { icon: makeDotIcon("#f59e0b", `⏸ Stop ${idx + 1}`) }).addTo(map);
      markersRef.current.push(m);
      bounds.extend([stop.latitude, stop.longitude]);
    });

    if (destCoords) {
      const m = L.marker([destCoords.lat, destCoords.lng], { icon: makeDotIcon("#3b82f6", `🏁 ${destName || "Destination"}`) }).addTo(map);
      markersRef.current.push(m);
      bounds.extend([destCoords.lat, destCoords.lng]);
    }

    // Draw polyline
    if (routeResult?.geometry?.coordinates?.length) {
      const coords = routeResult.geometry.coordinates as [number, number][];
      const shadow = L.polyline(coords, { color: "#0f172a", weight: 9, opacity: 0.8 }).addTo(map);
      const line = L.polyline(coords, { color: "#3b82f6", weight: 6, opacity: 1 }).addTo(map);
      polylineRef.current = shadow;
      markersRef.current.push(shadow, line);
      coords.forEach((c) => bounds.extend(c));
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [originCoords, destCoords, extraStops, routeResult]);

  // ─────────────────────────────────────────────────────
  // Add to trip handler (from nearby section)
  // ─────────────────────────────────────────────────────
  const handleAddNearbyToTrip = useCallback((place: NearbyPlace) => {
    if (!activeTrip) {
      toast.error("Plan a route first, then add stops to your trip.");
      return;
    }
    const stop: TripStop = {
      id: place.id,
      name: place.canonicalName || place.name,
      latitude: place.latitude,
      longitude: place.longitude,
      district: place.district,
      category: place.primaryCategory,
      addedAt: new Date().toISOString(),
    };
    addStopToTrip(stop);
    setActiveTrip(getActiveTrip());
    toast.success(`${place.canonicalName || place.name} added to your trip! 📍`);
  }, [activeTrip]);

  const handleRemoveStop = useCallback((stopId: string) => {
    removeStopFromTrip(stopId);
    setActiveTrip(getActiveTrip());
  }, []);

  const handleClearTrip = useCallback(() => {
    clearActiveTrip();
    setActiveTrip(null);
    setRouteResult(null);
    setExtraStops([]);
    toast.info("Trip cleared.");
  }, []);

  // ─────────────────────────────────────────────────────
  // Quick city select for origin
  // ─────────────────────────────────────────────────────
  const QUICK_CITIES = ["Chennai", "Madurai", "Coimbatore", "Salem", "Trichy"];

  // ─────────────────────────────────────────────────────
  // Category filter pills
  // ─────────────────────────────────────────────────────
  const NEARBY_CATS: { id: PlaceCategory; label: string }[] = [
    { id: "all", label: "All" },
    { id: "waterfalls", label: "💧 Falls" },
    { id: "hills", label: "⛰️ Hills" },
    { id: "beaches", label: "🏖️ Beaches" },
    { id: "temples", label: "🛕 Temples" },
    { id: "heritage", label: "🏛️ Heritage" },
    { id: "trekking", label: "🥾 Trekking" },
    { id: "food", label: "🍲 Food" },
    { id: "wildlife", label: "🌿 Wildlife" },
  ];

  return (
    <AppShell>
      <div className="min-h-screen bg-[#080d14] text-white">
        {/* ── Header ──────────────────────────────────────────── */}
        <div className="bg-[#0d1520]/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30 px-4 py-3 flex items-center gap-3">
          <Compass className="w-5 h-5 text-emerald-400" />
          <div>
            <h1 className="text-sm font-extrabold text-white">Smart Trip Planner</h1>
            <p className="text-[10px] text-slate-400">Plan · Discover · Explore Tamil Nadu</p>
          </div>
          {activeTrip && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-1 rounded-full">
                🗺️ {activeTrip.originName} → {activeTrip.destinationName}
              </span>
              <button
                type="button"
                onClick={handleClearTrip}
                className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            </div>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
          {/* ── Main Grid: Config + Map ──────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* ── Left Panel: Trip Configuration ─────────────── */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-[#0d1520] border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <RouteIcon className="w-4 h-4 text-emerald-400" />
                  <h2 className="font-bold text-sm text-white">Trip Configuration</h2>
                </div>

                {/* Origin */}
                <LocationInput
                  label="Starting Origin"
                  icon={<MapPin className="w-4 h-4" />}
                  value={originText}
                  placeholder="Your city or location..."
                  onChange={(v) => { setOriginText(v); setOriginCoords(null); setOriginName(v); }}
                  onSelect={handleSelectOrigin}
                  suggestions={originSugs}
                  showDropdown={showOriginDrop && originSugs.length > 0}
                  onFocus={() => setShowOriginDrop(true)}
                  onBlur={() => setShowOriginDrop(false)}
                />

                {/* Quick city select */}
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_CITIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        const coords = CITY_COORDS[c];
                        if (coords) {
                          setOriginText(c);
                          setOriginName(c);
                          setOriginCoords(coords);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition cursor-pointer ${
                        originName === c ? "bg-emerald-500 text-black" : "bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {/* Destination */}
                <LocationInput
                  label="Destination"
                  icon={<Navigation className="w-4 h-4" />}
                  value={destText}
                  placeholder="Where are you going?"
                  onChange={(v) => { setDestText(v); setDestCoords(null); setDestName(v); }}
                  onSelect={handleSelectDest}
                  suggestions={destSugs}
                  showDropdown={showDestDrop && destSugs.length > 0}
                  onFocus={() => setShowDestDrop(true)}
                  onBlur={() => setShowDestDrop(false)}
                />

                {/* Extra stops */}
                {extraStops.length > 0 && (
                  <div className="space-y-1.5">
                    {extraStops.map((stop, i) => (
                      <div key={stop.id} className="flex items-center justify-between bg-amber-500/10 border border-amber-500/25 px-3 py-1.5 rounded-xl text-xs">
                        <span className="flex items-center gap-2 text-amber-300">
                          <span className="w-4 h-4 bg-amber-500 text-black rounded-full flex items-center justify-center text-[9px] font-black">{i + 1}</span>
                          {stop.name}
                        </span>
                        <button type="button" onClick={() => setExtraStops((prev) => prev.filter((_, idx) => idx !== i))} className="text-slate-500 hover:text-rose-400">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add stop input */}
                <div className="relative">
                  <LocationInput
                    label="Add Stop (optional)"
                    icon={<Plus className="w-4 h-4" />}
                    value={stopText}
                    placeholder="Add a waypoint stop..."
                    onChange={setStopText}
                    onSelect={handleAddStop}
                    suggestions={stopSugs}
                    showDropdown={showStopDrop && stopSugs.length > 0}
                    onFocus={() => setShowStopDrop(true)}
                    onBlur={() => setShowStopDrop(false)}
                  />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">Travel Date</label>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/15 px-3 py-2.5 rounded-xl">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <input
                        type="date"
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        className="bg-transparent text-xs text-white focus:outline-none w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">Departure</label>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/15 px-3 py-2.5 rounded-xl">
                      <Timer className="w-3.5 h-3.5 text-emerald-400" />
                      <input
                        type="time"
                        value={departureTime}
                        onChange={(e) => setDepartureTime(e.target.value)}
                        className="bg-transparent text-xs text-white focus:outline-none w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Travel Mode */}
                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2">Travel Mode</label>
                  <div className="grid grid-cols-4 gap-2">
                    {([
                      { id: "driving", label: "Car", icon: <Car className="w-4 h-4" /> },
                      { id: "motorcycle", label: "Bike", icon: <Bike className="w-4 h-4" /> },
                      { id: "cycling", label: "Cycle", icon: <Bike className="w-4 h-4" /> },
                      { id: "walking", label: "Walk", icon: <Footprints className="w-4 h-4" /> },
                    ] as const).map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setTravelMode(mode.id)}
                        className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                          travelMode === mode.id
                            ? "bg-emerald-500 text-black border-emerald-500"
                            : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {mode.icon}
                        <span className="text-[10px]">{mode.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculate Route */}
                <button
                  type="button"
                  onClick={handleCalculateRoute}
                  disabled={routeLoading || !originText || !destText}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25 cursor-pointer"
                >
                  {routeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RouteIcon className="w-4 h-4" />}
                  {routeLoading ? "Calculating..." : "Calculate Route"}
                </button>

                {routeError && (
                  <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-2 rounded-xl">{routeError}</p>
                )}
              </div>

              {/* ── Route Stats Card ─────────────────────────────── */}
              {routeResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#0d1520] border border-emerald-500/30 rounded-3xl p-5 space-y-4 shadow-xl"
                >
                  <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-bold text-sm text-white">Route Summary</h3>
                    <span className="text-[9px] font-mono text-slate-500 ml-auto">via {routeResult.provider?.split(" ")[0] || "OSRM"}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                      <Navigation className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                      <p className="text-[10px] font-mono text-slate-400 uppercase">Distance</p>
                      <p className="text-lg font-black text-emerald-400">{routeResult.distanceKm}<span className="text-xs font-bold ml-0.5">km</span></p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                      <Clock className="w-4 h-4 text-sky-400 mx-auto mb-1" />
                      <p className="text-[10px] font-mono text-slate-400 uppercase">Est. Time</p>
                      <p className="text-lg font-black text-sky-400">{formatDuration(routeResult.durationMinutes)}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                      <Fuel className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                      <p className="text-[10px] font-mono text-slate-400 uppercase">Fuel Est.</p>
                      <p className="text-lg font-black text-amber-400">₹{fuelCost}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                      <MapPin className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                      <p className="text-[10px] font-mono text-slate-400 uppercase">Stops</p>
                      <p className="text-lg font-black text-purple-400">{extraStops.length + 2}</p>
                    </div>
                  </div>

                  {/* Route line: origin → stops → dest */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-black font-bold flex items-center justify-center text-[9px] shrink-0">S</span>
                      <span className="text-emerald-300 font-semibold">{originName}</span>
                    </div>
                    {extraStops.map((stop, i) => (
                      <div key={stop.id} className="flex items-center gap-2 text-xs pl-1">
                        <span className="w-3 h-3 border-l-2 border-white/20 ml-1 mr-1 inline-block" />
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-[9px] shrink-0">{i + 1}</span>
                        <span className="text-amber-300 font-semibold truncate">{stop.name}</span>
                        <button type="button" onClick={() => setExtraStops((p) => p.filter((_, idx) => idx !== i))} className="ml-auto text-slate-600 hover:text-rose-400">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-5 h-5 rounded-full bg-sky-500 text-black font-bold flex items-center justify-center text-[9px] shrink-0">E</span>
                      <span className="text-sky-300 font-semibold">{destName}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Active Trip Stops ────────────────────────────── */}
              {activeTrip && activeTrip.stops.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-[#0d1520] border border-sky-500/20 rounded-3xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-sky-300 flex items-center gap-2">
                      <Bookmark className="w-3.5 h-3.5" /> My Trip Stops ({activeTrip.stops.length})
                    </h3>
                    <button type="button" onClick={handleClearTrip} className="text-[10px] text-slate-500 hover:text-rose-400 flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Clear All
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {activeTrip.stops.map((stop) => (
                      <div key={stop.id} className="flex items-center justify-between bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-xs">
                        <span className="text-white font-medium truncate flex-1">{stop.name}</span>
                        <span className="text-slate-500 text-[10px] ml-2 shrink-0">{stop.district}</span>
                        <button type="button" onClick={() => handleRemoveStop(stop.id)} className="ml-2 text-slate-600 hover:text-rose-400 shrink-0">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* ── Right: Map ──────────────────────────────────── */}
            <div className="lg:col-span-3">
              <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl h-[500px] lg:h-[640px] relative">
                <div ref={mapContainerRef} className="w-full h-full" />
                {!originCoords && !destCoords && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/70 backdrop-blur-md rounded-2xl px-6 py-4 text-center space-y-2">
                      <MapPin className="w-8 h-8 text-emerald-400 mx-auto" />
                      <p className="text-sm font-bold text-white">Enter origin & destination</p>
                      <p className="text-xs text-slate-400">Your route will appear here</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Map tip */}
              {routeResult && (
                <p className="text-[10px] text-slate-500 text-center mt-2 flex items-center justify-center gap-1">
                  <Info className="w-3 h-3" /> Blue line = OSRM road network route · Green = Origin · Blue = Destination
                </p>
              )}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* Phase 2 — Nearby Places within 50km                        */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {destCoords && (
            <section className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <span className="text-emerald-400">📍</span> Explore Nearby — Within 50 km
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Attractions around <strong className="text-white">{destName}</strong> · {nearbyPlaces.length} places found
                  </p>
                </div>
                {/* Category filter */}
                <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                  {NEARBY_CATS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setNearbyCategory(c.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition cursor-pointer ${
                        nearbyCategory === c.id
                          ? "bg-emerald-500 text-black shadow"
                          : "bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {nearbyPlaces.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-slate-400 text-sm">
                  <Mountain className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  No {nearbyCategory !== "all" ? nearbyCategory : ""} places found within 50km of {destName}.
                  <button type="button" onClick={() => setNearbyCategory("all")} className="block mt-2 text-emerald-400 text-xs font-semibold underline mx-auto cursor-pointer">
                    Show all categories
                  </button>
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                  {nearbyPlaces.map((place) => (
                    <NearbyPlaceCard
                      key={place.id}
                      place={place}
                      onAddToTrip={handleAddNearbyToTrip}
                      isInTrip={tripStopIds.has(place.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* Phase 2 — Explore More: Beyond 50km                        */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {destCoords && (
            <section className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <span className="text-sky-400">🌏</span> Explore More Destinations
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Farther destinations from {destName}</p>
                </div>

                {/* Distance band filter */}
                <div className="flex items-center gap-2">
                  {([
                    { id: "50-100", label: "50–100 km" },
                    { id: "100-200", label: "100–200 km" },
                    { id: "200+", label: "200+ km" },
                  ] as const).map((band) => (
                    <button
                      key={band.id}
                      type="button"
                      onClick={() => setExploreRangeKm(band.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition cursor-pointer ${
                        exploreRangeKm === band.id
                          ? "bg-sky-500 text-white shadow"
                          : "bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {band.label}
                    </button>
                  ))}
                </div>
              </div>

              {explorePlaces.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-slate-400 text-sm">
                  <Compass className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  No places found in this range. Try a different distance band.
                  <button
                    type="button"
                    onClick={() => setExploreRangeKm("100-200")}
                    className="block mt-2 text-sky-400 text-xs font-semibold underline mx-auto cursor-pointer"
                  >
                    Expand to 100–200 km
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                    {explorePlaces.map((place) => (
                      <NearbyPlaceCard
                        key={place.id}
                        place={place}
                        onAddToTrip={handleAddNearbyToTrip}
                        isInTrip={tripStopIds.has(place.id)}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 text-center">
                    Distances shown are straight-line estimates. Road distances are approximately 28% longer.
                  </p>
                </>
              )}
            </section>
          )}

          {/* ─── Empty state when no dest yet ───────────────────────── */}
          {!destCoords && (
            <div className="bg-white/3 border border-white/8 rounded-3xl p-12 text-center space-y-4">
              <div className="text-6xl">🗺️</div>
              <h3 className="text-xl font-extrabold text-white">Where do you want to go?</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">
                Enter your origin and destination above. Once you calculate a route, nearby attractions, waterfalls, temples, hill stations and more will appear here.
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {["Ooty", "Kodaikanal", "Madurai", "Kanyakumari", "Valparai", "Rameswaram"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      const coords = CITY_COORDS[d];
                      if (coords) {
                        setDestText(d);
                        setDestName(d);
                        setDestCoords(coords);
                      }
                    }}
                    className="px-4 py-2 bg-white/5 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/40 rounded-full text-sm font-semibold text-slate-300 hover:text-emerald-400 transition cursor-pointer"
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
