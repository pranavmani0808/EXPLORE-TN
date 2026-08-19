import { useState, useEffect, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  MapPin,
  Clock,
  Sparkles,
  Navigation,
  ArrowRight,
  Compass,
  Mountain,
  Trees,
  Coffee,
  Camera,
  Footprints,
  CloudRain,
  Car,
  Bike,
  Route as RouteIcon,
  AlertTriangle,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import { RouteApiRepository, IsolatedRouteResultDTO } from "@/lib/api-client/routes";
import heroImg from "@/assets/hero-ghats.jpg";
import waterfallsImg from "@/assets/cat-waterfalls.jpg";
import routesImg from "@/assets/cat-routes.jpg";
import campingImg from "@/assets/cat-camping.jpg";

export const Route = createFileRoute("/western-ghats")({
  head: () => ({
    meta: [
      { title: "Western Ghats — Mist, Mountains & Rainforest Route | ExplorerTN" },
      {
        name: "description",
        content:
          "Experience the Western Ghats road trip: Kinnakorai -> Mullayanagiri -> Agumbe. Discover remote mountains, Karnataka's highest peak, coffee estates, and rainforest trails.",
      },
      { property: "og:title", content: "Western Ghats — Mist, Mountains & Rainforest Route" },
      {
        property: "og:description",
        content:
          "Structured multi-stop road-trip experience with isolated route engine, interactive maps, segment breakdowns, and AI Trip Planner integration.",
      },
    ],
  }),
  component: WesternGhatsRoutePage,
});

export interface WesternGhatsDestination {
  id: string;
  name: string;
  locationLabel: string;
  district?: string;
  state: string;
  country: "India";
  latitude: number;
  longitude: number;
  category: string[];
  description: string;
  highlights: string[];
  image: string;
  tags: string[];
  warnings?: string[];
}

// 3 Canonical Sequential Route Destinations
const WESTERN_GHATS_DESTINATIONS: WesternGhatsDestination[] = [
  {
    id: "kinnakorai",
    name: "Kinnakorai",
    locationLabel: "The Nilgiris / Western Ghats Border",
    district: "The Nilgiris",
    state: "Tamil Nadu",
    country: "India",
    latitude: 11.2333,
    longitude: 76.5833,
    category: ["Offbeat", "Mountains", "Nature", "Road Trip", "Photography"],
    description:
      "A remote mountain hamlet nestled amidst misty Western Ghats ridges, quiet forest canopy, and winding country roads.",
    highlights: ["Remote Mountain Ridges", "Forest Canopy Surroundings", "Scenic Mountain Pass Drives"],
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    tags: ["Remote", "Mist", "Offbeat", "Mountain Road"],
    warnings: ["Check local access and road conditions before travelling."],
  },
  {
    id: "mullayanagiri",
    name: "Mullayanagiri",
    locationLabel: "Chikkamagaluru, Karnataka",
    district: "Chikkamagaluru",
    state: "Karnataka",
    country: "India",
    latitude: 13.3908,
    longitude: 75.7214,
    category: ["Mountain", "Trekking", "Viewpoint", "Nature", "Photography", "Coffee"],
    description:
      "Karnataka's highest mountain peak at 1,930m elevation, featuring panoramic Shola grassland vistas, coffee estate slopes, and summit trekking trails.",
    highlights: ["Highest Peak in Karnataka (1,930m)", "Shola Grassland Summit Trail", "Coffee Plantation Landscape"],
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80",
    tags: ["Highest Peak", "Trekking", "Coffee Country", "Summit View"],
    warnings: ["Check current trail conditions and local permissions before starting the trek."],
  },
  {
    id: "agumbe",
    name: "Agumbe",
    locationLabel: "Shivamogga, Karnataka",
    district: "Shivamogga",
    state: "Karnataka",
    country: "India",
    latitude: 13.5028,
    longitude: 75.0931,
    category: ["Rainforest", "Nature", "Waterfalls", "Trekking", "Photography", "Wildlife", "Sunset"],
    description:
      "High-rainfall rainforest reserve known as the 'Cherrapunji of the South', home to dense canopy biodiversity, roaring waterfalls, and sunset point.",
    highlights: ["Lush Rainforest Canopy & Ecology", "Agumbe Sunset Viewpoint", "Cascading Waterfall Trails"],
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80",
    tags: ["Rainforest", "Cherrapunji of South", "Waterfalls", "Sunset"],
    warnings: ["Check current weather, forest entry permissions and road conditions before travelling."],
  },
];

const CATEGORIES = ["All", "Mountains", "Rainforest", "Trekking", "Waterfalls", "Coffee", "Photography", "Road Trip", "Offbeat"];

export function WesternGhatsRoutePage() {
  const navigate = useNavigate();
  const [travelMode, setTravelMode] = useState<"driving" | "motorcycle" | "cycling">("driving");
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState<number | "full">("full");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [routeMetrics, setRouteMetrics] = useState<{
    totalKm: number;
    totalMins: number;
    segment1Km: number;
    segment2Km: number;
  } | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  const activeRequestIdRef = useRef<string>("");
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletModuleRef = useRef<any>(null);

  // Recalculate Route Segments via Isolated Route Engine
  useEffect(() => {
    setIsCalculatingRoute(true);
    const reqId = `wg-${travelMode}-${Date.now()}`;
    activeRequestIdRef.current = reqId;

    const stop0 = WESTERN_GHATS_DESTINATIONS[0];
    const stop1 = WESTERN_GHATS_DESTINATIONS[1];
    const stop2 = WESTERN_GHATS_DESTINATIONS[2];

    const req1 = {
      requestId: `${reqId}-seg1`,
      origin: { name: stop0.name, latitude: stop0.latitude, longitude: stop0.longitude },
      destination: { name: stop1.name, latitude: stop1.latitude, longitude: stop1.longitude },
      travelMode,
    };

    const req2 = {
      requestId: `${reqId}-seg2`,
      origin: { name: stop1.name, latitude: stop1.latitude, longitude: stop1.longitude },
      destination: { name: stop2.name, latitude: stop2.latitude, longitude: stop2.longitude },
      travelMode,
    };

    Promise.all([
      RouteApiRepository.calculateRoute(req1).catch(() => null),
      RouteApiRepository.calculateRoute(req2).catch(() => null),
    ])
      .then(([res1, res2]) => {
        if (activeRequestIdRef.current !== reqId) return; // Ignore stale response

        const seg1Dist = res1 ? res1.distanceKm : 270;
        const seg1Time = res1 ? res1.durationMinutes : 360;
        const seg2Dist = res2 ? res2.distanceKm : 110;
        const seg2Time = res2 ? res2.durationMinutes : 160;

        const totalKm = Math.round(seg1Dist + seg2Dist);
        const totalMins = Math.round(seg1Time + seg2Time);

        setRouteMetrics({
          totalKm,
          totalMins,
          segment1Km: Math.round(seg1Dist),
          segment2Km: Math.round(seg2Dist),
        });

        const coords1 = res1?.geometry?.coordinates || [
          [stop0.longitude, stop0.latitude],
          [stop1.longitude, stop1.latitude],
        ];
        const coords2 = res2?.geometry?.coordinates || [
          [stop1.longitude, stop1.latitude],
          [stop2.longitude, stop2.latitude],
        ];

        if (leafletMapRef.current && leafletModuleRef.current) {
          drawRouteOnMap(coords1, coords2);
        }
      })
      .finally(() => {
        if (activeRequestIdRef.current === reqId) setIsCalculatingRoute(false);
      });
  }, [travelMode]);

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
        center: [12.4, 75.8],
        zoom: 8,
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

  const drawRouteOnMap = (coords1: number[][], coords2: number[][]) => {
    const map = leafletMapRef.current;
    const L = leafletModuleRef.current;
    if (!map || !L) return;

    map.eachLayer((layer: any) => {
      if (layer instanceof L.Polyline || layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    const latLngs1: [number, number][] = coords1.map((c) => [c[1], c[0]]);
    const latLngs2: [number, number][] = coords2.map((c) => [c[1], c[0]]);
    const allLatLngs = [...latLngs1, ...latLngs2];

    const polyline1 = L.polyline(latLngs1, { color: "#10b981", weight: 4, opacity: 0.9, dashArray: "8, 6" }).addTo(map);
    const polyline2 = L.polyline(latLngs2, { color: "#3b82f6", weight: 4, opacity: 0.9, dashArray: "8, 6" }).addTo(map);

    if (selectedSegmentIndex === 0) {
      map.fitBounds(polyline1.getBounds(), { padding: [40, 40] });
    } else if (selectedSegmentIndex === 1) {
      map.fitBounds(polyline2.getBounds(), { padding: [40, 40] });
    } else {
      const fullPolyline = L.polyline(allLatLngs);
      map.fitBounds(fullPolyline.getBounds(), { padding: [40, 40] });
    }

    // Numbered Markers
    WESTERN_GHATS_DESTINATIONS.forEach((stop, idx) => {
      const numLabel = `0${idx + 1}`;
      const markerIcon = L.divIcon({
        className: `wg-marker-${idx}`,
        html: `<div style="background: #10b981; color: #000; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 9999px; border: 2px solid #fff; box-shadow: 0 6px 18px rgba(0,0,0,0.5); white-space: nowrap; font-family: sans-serif;">${numLabel} ${stop.name}</div>`,
        iconSize: [130, 28],
        iconAnchor: [65, 14],
      });
      L.marker([stop.latitude, stop.longitude], { icon: markerIcon }).addTo(map);
    });
  };

  const handlePlanFullRoadTrip = () => {
    navigate({
      to: "/planner",
      search: {
        prompt:
          "Plan a Western Ghats road trip covering Kinnakorai, Mullayanagiri and Agumbe with rainforest trails, coffee estate stays and mountain viewpoints.",
      },
    });
  };

  const filteredDestinations = WESTERN_GHATS_DESTINATIONS.filter((d) => {
    if (selectedCategory === "All") return true;
    return d.category.includes(selectedCategory);
  });

  return (
    <AppShell>
      {/* Hero Header */}
      <PageHeader
        eyebrow="WESTERN GHATS · KARNATAKA"
        title="Mist, Mountains & Rainforest"
        description="A scenic Western Ghats journey through remote mountains, Karnataka's highest peak and the rainforest trails of Agumbe."
      />

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        {/* Travel Mode Selector & Live Route Metrics */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-elevate mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider font-semibold">
                Travel Mode:
              </span>
              <div className="flex items-center gap-1.5 bg-secondary p-1 rounded-2xl border border-border">
                {[
                  { id: "driving", label: "Car", icon: Car },
                  { id: "motorcycle", label: "Motorcycle", icon: Bike },
                  { id: "cycling", label: "Cycling", icon: Footprints },
                ].map((m) => {
                  const Icon = m.icon;
                  const isActive = travelMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setTravelMode(m.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="size-3.5" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Metrics */}
            <div className="flex items-center gap-3 text-xs font-mono font-bold text-primary bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
              <span>Full Route: {routeMetrics ? `${routeMetrics.totalKm} km` : "Calculating..."}</span>
              <span>•</span>
              <span>Est: {routeMetrics ? `${Math.floor(routeMetrics.totalMins / 60)}h ${routeMetrics.totalMins % 60}m` : "..."}</span>
            </div>
          </div>
        </div>

        {/* Route Overview Timeline */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-elevate mb-8">
          <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-wider font-semibold mb-4">
            Canonical Route Timeline
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {WESTERN_GHATS_DESTINATIONS.map((stop, idx) => (
              <button
                key={stop.id}
                type="button"
                onClick={() => {
                  setSelectedSegmentIndex(idx === 2 ? "full" : idx);
                  if (leafletMapRef.current) {
                    leafletMapRef.current.setView([stop.latitude, stop.longitude], 10);
                  }
                }}
                className={`text-left p-4 rounded-2xl border transition cursor-pointer ${
                  selectedSegmentIndex === idx
                    ? "bg-primary/15 border-primary text-foreground"
                    : "bg-secondary/60 border-border/80 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">
                    0{idx + 1}
                  </span>
                  {idx < 2 && routeMetrics && (
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Seg {idx + 1}: {idx === 0 ? routeMetrics.segment1Km : routeMetrics.segment2Km} km
                    </span>
                  )}
                </div>
                <h3 className="font-display text-sm font-bold text-foreground mb-0.5">{stop.name}</h3>
                <p className="text-[11px] text-muted-foreground">{stop.locationLabel}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Map */}
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-elevate mb-10">
          <div className="flex items-center justify-between p-4 border-b border-border bg-card/60">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider font-mono">
              <Navigation className="size-4 text-primary" />
              <span>Interactive Map: Kinnakorai → Mullayanagiri → Agumbe</span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedSegmentIndex("full")}
              className="text-[10px] font-mono text-primary px-2.5 py-0.5 bg-primary/10 rounded-full border border-primary/20 font-semibold cursor-pointer"
            >
              Fit Full Route
            </button>
          </div>

          <div className="relative h-[360px] sm:h-[440px] w-full bg-background">
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
          <Filter className="size-4 text-muted-foreground shrink-0 mr-1" />
          {CATEGORIES.map((cat) => (
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

        {/* 3 Destination Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-14">
          {filteredDestinations.map((stop, idx) => (
            <motion.div
              key={stop.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              className="flex flex-col rounded-3xl border border-border bg-card overflow-hidden shadow-elevate transition hover:border-primary/40 group"
            >
              {/* Image Banner */}
              <div className="relative h-48 w-full overflow-hidden bg-secondary">
                <img
                  src={stop.image}
                  alt={`${stop.name} mountain landscape in Karnataka`}
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
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-background/80 backdrop-blur-md text-foreground border border-border">
                    📍 {stop.locationLabel}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                  {stop.name}
                </h3>

                <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">
                  {stop.description}
                </p>

                {/* Highlights */}
                <div className="mb-4 space-y-1">
                  {stop.highlights.map((h) => (
                    <div key={h} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <span className="size-1 rounded-full bg-primary" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                {/* Warning Banner if present */}
                {stop.warnings && stop.warnings.length > 0 && (
                  <div className="mb-4 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-400 flex items-start gap-2">
                    <AlertTriangle className="size-3.5 shrink-0 mt-0.5 text-amber-400" />
                    <span>{stop.warnings[0]}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-auto pt-3 border-t border-border/60">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (leafletMapRef.current) {
                        leafletMapRef.current.setView([stop.latitude, stop.longitude], 11);
                        window.scrollTo({ top: 400, behavior: "smooth" });
                      }
                    }}
                    className="rounded-xl text-xs font-semibold border-border hover:bg-secondary"
                  >
                    <RouteIcon className="size-3.5 mr-1" /> Explore Route
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      navigate({
                        to: "/planner",
                        search: { prompt: `Plan a trip to ${stop.name}, ${stop.locationLabel}.` },
                      })
                    }
                    className="rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border"
                  >
                    <Sparkles className="size-3.5 mr-1" /> Plan Trip
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Highlights Section */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-elevate mb-12">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">What makes this route special?</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Mountain,
                title: "🏔️ Mountains",
                desc: "Mullayanagiri and the surrounding Western Ghats peak landscape.",
              },
              {
                icon: CloudRain,
                title: "🌿 Rainforest",
                desc: "Agumbe's lush high-rainfall Western Ghats forest canopy.",
              },
              {
                icon: Footprints,
                title: "🥾 Adventure",
                desc: "Trekking, winding mountain roads and nature exploration.",
              },
              {
                icon: Coffee,
                title: "☕ Coffee Country",
                desc: "The Chikkamagaluru region's shade-grown coffee plantations.",
              },
              {
                icon: Camera,
                title: "📸 Photography",
                desc: "Mist, mountain ridges, waterfalls, and scenic forest roads.",
              },
            ].map((h) => {
              const Icon = h.icon;
              return (
                <div key={h.title} className="p-4 rounded-2xl border border-border/80 bg-secondary/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="size-4 text-primary" />
                    <h4 className="font-display text-sm font-bold text-foreground">{h.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{h.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Footer Banner */}
        <div className="rounded-3xl border border-primary/30 bg-primary/10 p-6 sm:p-10 text-center backdrop-blur-md">
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">
            Ready to experience the Western Ghats road trip?
          </h3>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-6">
            Get instant road directions, weather advisories, coffee stays, and customized itineraries with AI Trip Copilot.
          </p>
          <Button
            size="lg"
            onClick={handlePlanFullRoadTrip}
            className="rounded-2xl bg-primary text-primary-foreground font-bold px-8 py-6 shadow-lg hover:bg-primary/90 transition text-sm"
          >
            <Sparkles className="size-5 mr-2" /> Plan This Road Trip with AI Copilot
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
