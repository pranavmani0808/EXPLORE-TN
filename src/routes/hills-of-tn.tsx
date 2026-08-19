import { useState, useEffect, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  Clock,
  Sparkles,
  Navigation,
  ArrowRight,
  Compass,
  Mountain,
  Trees,
  Landmark,
  Waves,
  ShieldAlert,
  Route as RouteIcon,
  SlidersHorizontal,
  X,
  CheckCircle2,
  Filter,
  Building2,
  Sun,
  Eye,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import { RouteApiRepository, IsolatedRouteResultDTO } from "@/lib/api-client/routes";
import heroImg from "@/assets/hero-ghats.jpg";
import waterfallsImg from "@/assets/cat-waterfalls.jpg";
import routesImg from "@/assets/cat-routes.jpg";
import campingImg from "@/assets/cat-camping.jpg";
import templesImg from "@/assets/cat-temples.jpg";

export const Route = createFileRoute("/hills-of-tn")({
  head: () => ({
    meta: [
      { title: "Hills of Tamil Nadu — Discovery & Route Engine | ExplorerTN" },
      {
        name: "description",
        content:
          "Discover Kolli Hills, Yelagiri, Tharangambadi, Kalrayan Hills, Gingee Fort and Panchamalai. Misty mountains, hill forts, and coastal heritage across Tamil Nadu.",
      },
      { property: "og:title", content: "Hills of Tamil Nadu — ExplorerTN" },
      {
        property: "og:description",
        content:
          "Curated Tamil Nadu destination discovery engine with origin switcher, dynamic isolated routing, interactive Leaflet map, and AI Trip Planner integration.",
      },
    ],
  }),
  component: HillsOfTNPage,
});

export interface TamilNaduHillDestination {
  id: string;
  name: string;
  district: string;
  state: "Tamil Nadu";
  country: "India";
  latitude: number;
  longitude: number;
  category: string[];
  subCategory: string;
  description: string;
  image: string;
  badge: string;
  tags: string[];
  highlights: string[];
  warnings?: string[];
  approxDuration: string;
}

export interface OriginLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

const ORIGIN_LOCATIONS: OriginLocation[] = [
  { id: "chennai", name: "Chennai", latitude: 13.0827, longitude: 80.2707 },
  { id: "bengaluru", name: "Bengaluru", latitude: 12.9716, longitude: 77.5946 },
  { id: "coimbatore", name: "Coimbatore", latitude: 11.0168, longitude: 76.9558 },
  { id: "madurai", name: "Madurai", latitude: 9.9252, longitude: 78.1198 },
  { id: "pondicherry", name: "Pondicherry", latitude: 11.9416, longitude: 79.8083 },
];

// 6 Canonical Tamil Nadu Destinations
const HILLS_OF_TN_DESTINATIONS: TamilNaduHillDestination[] = [
  {
    id: "kolli-hills",
    name: "Kolli Hills",
    district: "Namakkal",
    state: "Tamil Nadu",
    country: "India",
    latitude: 11.2721,
    longitude: 78.3412,
    category: ["Mountains", "Nature", "Adventure", "Trekking", "Road Trip"],
    subCategory: "Mountain · Adventure",
    description:
      "Legendary Eastern Ghats hill range famous for 70 continuous hairpin bends, Agaya Gangai 300ft waterfall, and untouched spice forests.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    badge: "Mountain Adventure",
    tags: ["70 Hairpin Bends", "Agaya Gangai", "Eastern Ghats", "Trekking"],
    highlights: [
      "70 Thrilling Continuous Hairpin Bends",
      "300ft Cascading Agaya Gangai Waterfall",
      "Arapaleeswarar Historic Temple & Forest Trails",
    ],
    approxDuration: "1–2 Days",
    warnings: ["Drive cautiously on hairpin bends; test brakes before ascending."],
  },
  {
    id: "yelagiri-hills",
    name: "Yelagiri Hills",
    district: "Tirupathur",
    state: "Tamil Nadu",
    country: "India",
    latitude: 12.5786,
    longitude: 78.6389,
    category: ["Hill Stations", "Nature", "Adventure", "Road Trip"],
    subCategory: "Hill Station · Nature",
    description:
      "Tranquil hill station situated at 1,110m MSL featuring serene Punganoor man-made lake, Jalagamparai water cascades, and Swamimalai trekking.",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80",
    badge: "Weekend Hill Escape",
    tags: ["Punganoor Lake", "Swamimalai Trek", "Jalagamparai", "Weekend"],
    highlights: [
      "Punganoor Boating Lake & Nature Park",
      "Swamimalai Highest Peak Trekking Trail",
      "Jalagamparai Water Falls & Forest Reserve",
    ],
    approxDuration: "1–2 Days",
  },
  {
    id: "tharangambadi",
    name: "Tharangambadi (Tranquebar)",
    district: "Mayiladuthurai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 11.0347,
    longitude: 79.8524,
    category: ["Coastal", "Heritage"],
    subCategory: "Coastal Heritage",
    description:
      "Historic 1620 Danish East India trading post on the Coromandel coast featuring Fort Dansborg, Danish-era cobblestone streets, and sea views.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    badge: "Coastal Heritage",
    tags: ["Danish Fort Dansborg", "Coromandel Coast", "1620 Heritage"],
    highlights: [
      "1620 Danish Fort Dansborg Citadel",
      "Historic Governor Bungalow & Cobblestone Streets",
      "Tranquil Coromandel Coastline Promenade",
    ],
    approxDuration: "1 Day",
    warnings: ["Tharangambadi is a coastal heritage site, not a hill station."],
  },
  {
    id: "kalrayan-hills",
    name: "Kalrayan Hills",
    district: "Kallakurichi",
    state: "Tamil Nadu",
    country: "India",
    latitude: 11.9674,
    longitude: 78.7562,
    category: ["Hills", "Nature", "Offbeat", "Road Trip"],
    subCategory: "Hills · Nature",
    description:
      "Lesser-known Eastern Ghats hill range known for pristine forest cover, Gomukhi dam reservoir, Periyar falls, and peaceful rural roads.",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80",
    badge: "Offbeat Hills",
    tags: ["Eastern Ghats", "Periyar Falls", "Botanical Garden", "Offbeat"],
    highlights: [
      "Periyar & Megam Cascading Waterfalls",
      "Gomukhi Dam Reservoir & Picnic Valley",
      "Quiet Botanical Gardens & Forest Canopy",
    ],
    approxDuration: "1–2 Days",
  },
  {
    id: "gingee-fort",
    name: "Gingee Fort",
    district: "Villupuram",
    state: "Tamil Nadu",
    country: "India",
    latitude: 12.2530,
    longitude: 79.4184,
    category: ["Hill Forts", "Heritage", "Adventure", "Trekking"],
    subCategory: "Hill Fort · Heritage",
    description:
      "Impregnable 16th-century 'Troy of the East' hill fortress spanning three massive granite citadel hills (Rajagiri, Krishnagiri, Chandrayandurg).",
    image: "https://images.unsplash.com/photo-1609946782701-7fa158869150?auto=format&fit=crop&w=1000&q=80",
    badge: "Hill Fort",
    tags: ["Rajagiri Citadel", "Troy of East", "Rock Fortress", "Heritage Climb"],
    highlights: [
      "Rajagiri 800ft Steep Granite Rock Citadel",
      "Multi-Story 7-Tier Kalyan Mahal Pavilion",
      "Granite Moat & Historic Granary Structures",
    ],
    approxDuration: "1 Day",
    warnings: ["Strenuous rock staircase climb; carry ample drinking water."],
  },
  {
    id: "panchamalai",
    name: "Panchamalai — Salem",
    district: "Salem",
    state: "Tamil Nadu",
    country: "India",
    latitude: 11.5167,
    longitude: 78.5000,
    category: ["Hills", "Nature", "Offbeat", "Road Trip"],
    subCategory: "Hills · Nature",
    description:
      "Hidden Eastern Ghats green hill range offering peaceful countryside drives, mountain air, and unexplored ridge vistas.",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
    badge: "Hidden Hill Escape",
    tags: ["Salem Hills", "Rural Drive", "Unexplored", "Green Ridge"],
    highlights: [
      "Unexplored Eastern Ghats Mountain Ridges",
      "Tranquil Countryside Agricultural Drives",
      "Offbeat Panoramic Sunset Viewpoints",
    ],
    approxDuration: "1 Day",
  },
];

const CATEGORY_FILTERS = [
  "All",
  "Mountains",
  "Hill Stations",
  "Hill Forts",
  "Nature",
  "Heritage",
  "Adventure",
  "Offbeat",
  "Coastal",
];

export function HillsOfTNPage() {
  const navigate = useNavigate();
  const [selectedOrigin, setSelectedOrigin] = useState<OriginLocation>(ORIGIN_LOCATIONS[0]);
  const [selectedDestination, setSelectedDestination] = useState<TamilNaduHillDestination>(HILLS_OF_TN_DESTINATIONS[0]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [detailModalDestination, setDetailModalDestination] = useState<TamilNaduHillDestination | null>(null);

  const [routeMetrics, setRouteMetrics] = useState<{ distanceKm: number; durationMins: number } | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletModuleRef = useRef<any>(null);

  // Recalculate Isolated Route from Selected Origin to Selected Destination
  useEffect(() => {
    setIsCalculatingRoute(true);
    const req = {
      requestId: `hills-tn-${selectedOrigin.id}-${selectedDestination.id}-${Date.now()}`,
      origin: { name: selectedOrigin.name, latitude: selectedOrigin.latitude, longitude: selectedOrigin.longitude },
      destination: { name: selectedDestination.name, latitude: selectedDestination.latitude, longitude: selectedDestination.longitude },
      travelMode: "driving" as const,
    };

    RouteApiRepository.calculateRoute(req)
      .then((res: IsolatedRouteResultDTO) => {
        setRouteMetrics({ distanceKm: res.distanceKm, durationMins: res.durationMinutes });
        if (leafletMapRef.current && leafletModuleRef.current) {
          drawRouteOnMap(selectedOrigin, selectedDestination, res.geometry.coordinates);
        }
      })
      .catch(() => {
        // Fallback spatial calculation
        const dLat = selectedDestination.latitude - selectedOrigin.latitude;
        const dLng = selectedDestination.longitude - selectedOrigin.longitude;
        const approxKm = Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 110 * 1.25);
        setRouteMetrics({ distanceKm: approxKm, durationMins: Math.round((approxKm / 45) * 60) });
        if (leafletMapRef.current && leafletModuleRef.current) {
          drawFallbackMap(selectedOrigin, selectedDestination);
        }
      })
      .finally(() => setIsCalculatingRoute(false));
  }, [selectedOrigin, selectedDestination]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;
    let isMounted = true;

    async function initMap() {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (!isMounted || !mapContainerRef.current) return;

      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }

      leafletModuleRef.current = L;

      const map = L.map(mapContainerRef.current, {
        center: [11.5, 78.8],
        zoom: 7,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      leafletMapRef.current = map;
    }

    initMap();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  const drawRouteOnMap = (origin: OriginLocation, dest: TamilNaduHillDestination, coordinates: number[][]) => {
    const map = leafletMapRef.current;
    const L = leafletModuleRef.current;
    if (!map || !L) return;

    map.eachLayer((layer: any) => {
      if (layer instanceof L.Polyline || layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    const latLngs: [number, number][] = coordinates.map((c) => [c[1], c[0]]);
    if (latLngs.length > 0) {
      const polyline = L.polyline(latLngs, {
        color: "#10b981",
        weight: 4,
        opacity: 0.9,
        dashArray: "8, 6",
      }).addTo(map);

      map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    }

    // Origin Pin
    const originIcon = L.divIcon({
      className: "origin-pin",
      html: `<div style="background: #3b82f6; color: #fff; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 9999px; border: 2px solid #fff; box-shadow: 0 6px 18px rgba(0,0,0,0.5); white-space: nowrap; font-family: sans-serif;">📍 ${origin.name}</div>`,
      iconSize: [110, 28],
      iconAnchor: [55, 14],
    });
    L.marker([origin.latitude, origin.longitude], { icon: originIcon }).addTo(map);

    // Numbered Markers for All 6 Destinations
    HILLS_OF_TN_DESTINATIONS.forEach((d, idx) => {
      const isSelected = d.id === dest.id;
      const numLabel = `0${idx + 1}`;
      const markerIcon = L.divIcon({
        className: `tn-dest-marker-${idx}`,
        html: `<div style="background: ${
          isSelected ? "#10b981" : "#1f2937"
        }; color: ${isSelected ? "#000" : "#fff"}; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 9999px; border: 2px solid ${
          isSelected ? "#fff" : "#4b5563"
        }; box-shadow: 0 6px 18px rgba(0,0,0,0.5); white-space: nowrap; font-family: sans-serif;">${numLabel} ${d.name}</div>`,
        iconSize: [130, 28],
        iconAnchor: [65, 14],
      });
      L.marker([d.latitude, d.longitude], { icon: markerIcon }).addTo(map);
    });
  };

  const drawFallbackMap = (origin: OriginLocation, dest: TamilNaduHillDestination) => {
    const map = leafletMapRef.current;
    const L = leafletModuleRef.current;
    if (!map || !L) return;

    const points: [number, number][] = [
      [origin.latitude, origin.longitude],
      [dest.latitude, dest.longitude],
    ];
    const polyline = L.polyline(points, { color: "#10b981", weight: 3, opacity: 0.8, dashArray: "6, 6" }).addTo(map);
    map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
  };

  const handlePlanTrip = (dest: TamilNaduHillDestination) => {
    const promptText = `Plan a trip from ${selectedOrigin.name} to ${dest.name}, Tamil Nadu.`;
    navigate({ to: "/planner", search: { prompt: promptText } });
  };

  const filteredDestinations = HILLS_OF_TN_DESTINATIONS.filter((d) => {
    if (selectedCategory === "All") return true;
    return d.category.includes(selectedCategory);
  });

  return (
    <AppShell>
      {/* Hero Header */}
      <PageHeader
        eyebrow="TAMIL NADU · 6 DESTINATIONS"
        title="Hills of Tamil Nadu"
        description="Misty mountains, winding roads, hidden forests and ancient hill forts waiting to be explored."
      />

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        {/* Origin Switcher & Live Route Engine Banner */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-elevate mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider font-semibold">
                Starting Origin:
              </span>
              <div className="flex items-center gap-1.5 bg-secondary p-1 rounded-2xl border border-border overflow-x-auto">
                {ORIGIN_LOCATIONS.map((orig) => {
                  const isActive = selectedOrigin.id === orig.id;
                  return (
                    <button
                      key={orig.id}
                      type="button"
                      onClick={() => setSelectedOrigin(orig)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      📍 {orig.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Calculated Distance */}
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
              <Navigation className="size-3.5" />
              <span>
                {selectedOrigin.name} → {selectedDestination.name}:{" "}
                {routeMetrics ? `${routeMetrics.distanceKm} km · ${Math.floor(routeMetrics.durationMins / 60)}h ${routeMetrics.durationMins % 60}m` : "Calculating..."}
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Map */}
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-elevate mb-8">
          <div className="flex items-center justify-between p-4 border-b border-border bg-card/60">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider font-mono">
              <Compass className="size-4 text-primary" />
              <span>Isolated Route Engine: {selectedOrigin.name} → {selectedDestination.name}</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">Select destination card to zoom</span>
          </div>

          <div className="relative h-[340px] sm:h-[400px] w-full bg-background">
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 no-scrollbar">
          <Filter className="size-4 text-muted-foreground shrink-0 mr-1" />
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 6 Destination Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-14">
          {filteredDestinations.map((dest, idx) => {
            const isSelected = selectedDestination.id === dest.id;
            return (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35 }}
                className={`flex flex-col rounded-3xl border bg-card overflow-hidden shadow-elevate transition group ${
                  isSelected ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/40"
                }`}
              >
                {/* Image Banner */}
                <div
                  onClick={() => setDetailModalDestination(dest)}
                  className="relative h-48 w-full overflow-hidden bg-secondary cursor-pointer"
                >
                  <img
                    src={dest.image}
                    alt={`${dest.name} in Tamil Nadu`}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = campingImg;
                    }}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="size-6 rounded-full bg-primary text-primary-foreground font-mono font-bold text-xs flex items-center justify-center shadow-md">
                      0{idx + 1}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/90 text-primary-foreground shadow-sm">
                      {dest.badge}
                    </span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3
                      onClick={() => setDetailModalDestination(dest)}
                      className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors cursor-pointer"
                    >
                      {dest.name}
                    </h3>
                    <span className="text-[10px] font-mono text-muted-foreground">📍 {dest.district}</span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">
                    {dest.description}
                  </p>

                  <div className="space-y-1 mb-4">
                    {dest.highlights.slice(0, 2).map((h) => (
                      <div key={h} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <span className="size-1 rounded-full bg-primary" />
                        <span className="truncate">{h}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 mt-auto pt-3 border-t border-border/60">
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedDestination(dest);
                        window.scrollTo({ top: 250, behavior: "smooth" });
                      }}
                      className={`rounded-xl text-xs font-semibold ${
                        isSelected ? "bg-primary text-primary-foreground" : "border-border hover:bg-secondary"
                      }`}
                    >
                      <RouteIcon className="size-3.5 mr-1" /> Calculate Route
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handlePlanTrip(dest)}
                      className="rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border"
                    >
                      <Sparkles className="size-3.5 mr-1" /> Plan Trip
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Curated Experience Collections */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-elevate mb-12">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">Curated Collections</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-2xl border border-border/80 bg-secondary/50">
              <h4 className="font-display text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
                <Mountain className="size-4 text-primary" /> Mountain Adventures
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                High-altitude hairpin roads, waterfall hikes, and cool mountain air.
              </p>
              <div className="text-[11px] font-bold text-primary">Kolli Hills · Yelagiri · Kalrayan</div>
            </div>

            <div className="p-4 rounded-2xl border border-border/80 bg-secondary/50">
              <h4 className="font-display text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
                <Building2 className="size-4 text-primary" /> Heritage & Hill Forts
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                Impregnable granite rock citadels, steep stairs, and 16th-century history.
              </p>
              <div className="text-[11px] font-bold text-primary">Gingee Fort</div>
            </div>

            <div className="p-4 rounded-2xl border border-border/80 bg-secondary/50">
              <h4 className="font-display text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
                <Waves className="size-4 text-primary" /> Coastal Heritage
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                1620 Danish East India citadel, ocean breeze, and colonial architecture.
              </p>
              <div className="text-[11px] font-bold text-primary">Tharangambadi (Tranquebar)</div>
            </div>

            <div className="p-4 rounded-2xl border border-border/80 bg-secondary/50">
              <h4 className="font-display text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
                <Trees className="size-4 text-primary" /> Hidden Hills
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                Quiet offbeat Eastern Ghats valleys away from commercial tourist crowds.
              </p>
              <div className="text-[11px] font-bold text-primary">Kalrayan Hills · Panchamalai</div>
            </div>
          </div>
        </div>

        {/* CTA Footer Banner */}
        <div className="rounded-3xl border border-primary/30 bg-primary/10 p-6 sm:p-10 text-center backdrop-blur-md">
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">
            Ready to discover the Hills of Tamil Nadu?
          </h3>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-6">
            Get instant road navigation, dynamic itineraries, weather updates, and local tips with AI Trip Copilot.
          </p>
          <Button
            size="lg"
            onClick={() =>
              navigate({
                to: "/planner",
                search: {
                  prompt:
                    "Plan a Tamil Nadu hills tour covering Gingee Fort, Kolli Hills 70 hairpin bends, and Tharangambadi coastal fort.",
                },
              })
            }
            className="rounded-2xl bg-primary text-primary-foreground font-bold px-8 py-6 shadow-lg hover:bg-primary/90 transition text-sm"
          >
            <Sparkles className="size-5 mr-2" /> Plan Tamil Nadu Trip with AI Copilot
          </Button>
        </div>
      </div>

      {/* Destination Detail Modal */}
      <AnimatePresence>
        {detailModalDestination && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card shadow-2xl p-6 text-foreground"
            >
              <button
                type="button"
                onClick={() => setDetailModalDestination(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-secondary text-muted-foreground hover:text-foreground cursor-pointer z-10"
              >
                <X className="size-5" />
              </button>

              <div className="relative h-56 w-full rounded-2xl overflow-hidden mb-5 bg-secondary">
                <img
                  src={detailModalDestination.image}
                  alt={detailModalDestination.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground mb-2 inline-block">
                    {detailModalDestination.badge}
                  </span>
                  <h2 className="font-display text-2xl font-bold text-foreground">{detailModalDestination.name}</h2>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                    About Destination
                  </h4>
                  <p className="text-xs text-foreground leading-relaxed">{detailModalDestination.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-secondary/50 p-3.5 rounded-2xl border border-border/80">
                  <div>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">District & State</span>
                    <p className="text-xs font-bold text-primary">{detailModalDestination.district}, Tamil Nadu</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">Recommended Duration</span>
                    <p className="text-xs font-bold text-foreground">{detailModalDestination.approxDuration}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wider font-semibold mb-2">
                    Verified Highlights
                  </h4>
                  <div className="space-y-1.5">
                    {detailModalDestination.highlights.map((h) => (
                      <div key={h} className="text-xs text-foreground flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {detailModalDestination.warnings && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
                    ⚠️ {detailModalDestination.warnings[0]}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedDestination(detailModalDestination);
                      setDetailModalDestination(null);
                      window.scrollTo({ top: 250, behavior: "smooth" });
                    }}
                    className="rounded-xl text-xs font-semibold border-border hover:bg-secondary"
                  >
                    <RouteIcon className="size-3.5 mr-1" /> Calculate Route
                  </Button>
                  <Button
                    onClick={() => {
                      const dest = detailModalDestination;
                      setDetailModalDestination(null);
                      handlePlanTrip(dest);
                    }}
                    className="rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Sparkles className="size-3.5 mr-1" /> Plan Trip with AI
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
