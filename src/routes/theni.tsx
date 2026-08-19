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
  Waves,
  Sun,
  ShieldAlert,
  Calendar,
  Filter,
  Route as RouteIcon,
  Flame,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import { RouteApiRepository, IsolatedRouteResultDTO } from "@/lib/api-client/routes";
import heroImg from "@/assets/hero-ghats.jpg";
import waterfallsImg from "@/assets/cat-waterfalls.jpg";
import routesImg from "@/assets/cat-routes.jpg";
import foodImg from "@/assets/cat-food.jpg";
import beachesImg from "@/assets/cat-beaches.jpg";
import campingImg from "@/assets/cat-camping.jpg";

export const Route = createFileRoute("/theni")({
  head: () => ({
    meta: [
      { title: "Theni Adventure & Nature Circuit — ExplorerTN" },
      {
        name: "description",
        content:
          "Discover the best waterfalls, tea estates, cloud forests, rivers, Cumbum vineyards, and mountain trekking trails across Theni, Tamil Nadu.",
      },
      { property: "og:title", content: "Theni Adventure & Nature Circuit — ExplorerTN" },
      {
        property: "og:description",
        content:
          "Explore Meghamalai, Suruli Falls, Cumbum Vineyards, Kumbakkarai, Vaigai Dam, and Kurangani Top Station trek.",
      },
    ],
  }),
  component: TheniCircuitPage,
});

export interface AdventureDestination {
  id: string;
  name: string;
  destination: string;
  district: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  category: string[];
  description: string;
  image: string;
  difficulty?: "Easy" | "Easy/Moderate" | "Moderate" | "Challenging";
  bestSeason?: string;
  estimatedDuration?: string;
  tags: string[];
  warnings?: string[];
}

// 9 Verified Theni Adventure & Nature Destinations
const THENI_DESTINATIONS: AdventureDestination[] = [
  {
    id: "meghamalai",
    name: "Meghamalai",
    destination: "Meghamalai",
    district: "Theni",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.6738,
    longitude: 77.4207,
    category: ["Mountains", "Viewpoints"],
    description: "High Wavy Mountains perched at 1,500m elevation featuring tea estates, cloud forests, and Western Ghats panoramic ridges.",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80",
    difficulty: "Easy/Moderate",
    bestSeason: "Oct – Mar",
    estimatedDuration: "Full Day",
    tags: ["Nature", "Mountains", "Photography", "Road Trip", "Viewpoint"],
  },
  {
    id: "suruli-falls",
    name: "Suruli Falls",
    destination: "Suruli Falls",
    district: "Theni",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.6705,
    longitude: 77.306,
    category: ["Waterfalls", "Family"],
    description: "Cascading 150ft 2-tier waterfall surrounded by dense evergreen Meghamalai forest reserves and mountain streams.",
    image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1000&q=80",
    difficulty: "Easy/Moderate",
    bestSeason: "Sep – Feb",
    estimatedDuration: "2–3 Hours",
    tags: ["Waterfall", "Nature", "Family", "Photography"],
  },
  {
    id: "cumbum-vineyard",
    name: "Vineyard Experience",
    destination: "Cumbum Valley Vineyard",
    district: "Theni",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.736,
    longitude: 77.283,
    category: ["Vineyard", "Family"],
    description: "Tour Cumbum Valley's lush grape orchards producing over 90% of Tamil Nadu's Muscat grapes amidst mountain backdrops.",
    image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1000&q=80",
    difficulty: "Easy",
    bestSeason: "Year-round",
    estimatedDuration: "1–2 Hours",
    tags: ["Vineyard", "Countryside", "Food", "Photography", "Agriculture"],
  },
  {
    id: "ellapatti-river",
    name: "Ellapatti River",
    destination: "Ellapatti River",
    district: "Theni",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.789,
    longitude: 77.254,
    category: ["Rivers", "Offbeat"],
    description: "Serene riverside views, natural cooling mountain water streams, and tranquil countryside relaxation spots.",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80",
    difficulty: "Easy",
    bestSeason: "Aug – Feb",
    estimatedDuration: "2 Hours",
    tags: ["River", "Nature", "Photography", "Relaxation"],
  },
  {
    id: "chinna-suruli",
    name: "Chinna Suruli",
    destination: "Chinna Suruli",
    district: "Theni",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.87,
    longitude: 77.39,
    category: ["Waterfalls", "Offbeat"],
    description: "Offbeat secluded waterfall tucked deep inside quiet forest landscape near Kombaithozhu village, distinct from main Suruli.",
    image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=80",
    difficulty: "Moderate",
    bestSeason: "Sep – Jan",
    estimatedDuration: "2 Hours",
    tags: ["Waterfall", "Offbeat", "Nature", "Photography"],
  },
  {
    id: "kumbakkarai-falls",
    name: "Kumbakkarai Falls",
    destination: "Kumbakkarai Falls",
    district: "Theni",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.1804,
    longitude: 77.5303,
    category: ["Waterfalls", "Family"],
    description: "Natural rock formation cascades fed by Kodaikanal hill streams located at the foot of Periyakulam hill slope.",
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80",
    difficulty: "Easy",
    bestSeason: "Oct – Mar",
    estimatedDuration: "2 Hours",
    tags: ["Waterfall", "Nature", "Family", "Photography"],
  },
  {
    id: "thottipalam",
    name: "Thottipalam",
    destination: "Thottipalam Aqueduct",
    district: "Theni",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.045,
    longitude: 77.585,
    category: ["Viewpoints", "Offbeat"],
    description: "Historic elevated aqueduct bridge near Periyakulam offering panoramic road-trip views of green paddy fields and hill ranges.",
    image: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1000&q=80",
    difficulty: "Easy",
    bestSeason: "Year-round",
    estimatedDuration: "1 Hour",
    tags: ["Viewpoint", "Photography", "Road Trip", "Scenic"],
  },
  {
    id: "vaigai-dam",
    name: "Vaigai Dam",
    destination: "Vaigai Dam",
    district: "Theni",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.0551,
    longitude: 77.591,
    category: ["Family", "Viewpoints"],
    description: "Massive irrigation dam reservoir across Vaigai river featuring manicured gardens, evening illumination, and sunset views.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    difficulty: "Easy",
    bestSeason: "Year-round",
    estimatedDuration: "2 Hours",
    tags: ["Dam", "Viewpoint", "Family", "Photography", "Sunset"],
  },
  {
    id: "kurangani-top-station",
    name: "Kurangani → Top Station",
    destination: "Kurangani Trek",
    district: "Theni",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.08,
    longitude: 77.24,
    category: ["Adventure", "Mountains"],
    description: "Celebrated mountain trek climbing from Kurangani foothills through pine forests, tea estates, and cliff ridges up to Top Station.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
    difficulty: "Challenging",
    bestSeason: "Oct – Feb",
    estimatedDuration: "6–8 Hours",
    tags: ["Trekking", "Mountains", "Adventure", "Nature", "Photography"],
    warnings: ["Check current forest/route permissions before travelling."],
  },
];

// Recommended Curated Circuit Clusters
interface RecommendedCircuit {
  id: string;
  name: string;
  description: string;
  stopIds: string[];
}

const CIRCUIT_CLUSTERS: RecommendedCircuit[] = [
  {
    id: "circuit-a",
    name: "Circuit A — Theni Nature & Waterfalls",
    description: "Theni → Suruli Falls → Chinna Suruli → Ellapatti River",
    stopIds: ["suruli-falls", "chinna-suruli", "ellapatti-river"],
  },
  {
    id: "circuit-b",
    name: "Circuit B — Kodaikanal-side Nature",
    description: "Theni → Kumbakkarai Falls → Thottipalam",
    stopIds: ["kumbakkarai-falls", "thottipalam"],
  },
  {
    id: "circuit-c",
    name: "Circuit C — Meghamalai Cloud Forests",
    description: "Theni → Meghamalai Tea Estates & High Wavy Peak",
    stopIds: ["meghamalai"],
  },
  {
    id: "circuit-d",
    name: "Circuit D — Mountain Trekking Adventure",
    description: "Theni → Kurangani Foothills → Top Station Ridge",
    stopIds: ["kurangani-top-station"],
  },
  {
    id: "circuit-e",
    name: "Circuit E — Relaxed Family & Countryside",
    description: "Theni → Vaigai Dam → Cumbum Vineyard",
    stopIds: ["vaigai-dam", "cumbum-vineyard"],
  },
];

const CATEGORIES = ["All", "Waterfalls", "Mountains", "Rivers", "Adventure", "Viewpoints", "Family", "Offbeat", "Vineyard"];

export function TheniCircuitPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCircuit, setSelectedCircuit] = useState<string>("circuit-a");
  const [activeDestination, setActiveDestination] = useState<AdventureDestination>(THENI_DESTINATIONS[0]);
  
  const [routeMetrics, setRouteMetrics] = useState<{ distanceKm: number; durationMins: number } | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletModuleRef = useRef<any>(null);

  const filteredDestinations = THENI_DESTINATIONS.filter((item) => {
    if (selectedCategory === "All") return true;
    return item.category.includes(selectedCategory);
  });

  // Calculate Stateless Isolated Route for Selected Circuit or Active Destination
  useEffect(() => {
    const activeCircuit = CIRCUIT_CLUSTERS.find((c) => c.id === selectedCircuit);
    const stopsToRoute = activeCircuit
      ? THENI_DESTINATIONS.filter((d) => activeCircuit.stopIds.includes(d.id))
      : [activeDestination];

    const theniOrigin = { name: "Theni Hub", latitude: 10.0104, longitude: 77.4768 };
    const targetDestination = stopsToRoute[stopsToRoute.length - 1];

    const routeRequest = {
      requestId: `route-theni-${Date.now()}`,
      origin: theniOrigin,
      waypoints: stopsToRoute.slice(0, -1).map((s) => ({ name: s.name, latitude: s.latitude, longitude: s.longitude })),
      destination: { name: targetDestination.name, latitude: targetDestination.latitude, longitude: targetDestination.longitude },
      travelMode: "driving",
    };

    setRouteLoading(true);

    RouteApiRepository.calculateRoute(routeRequest)
      .then((res: IsolatedRouteResultDTO) => {
        setRouteMetrics({ distanceKm: res.distanceKm, durationMins: res.durationMinutes });
        if (leafletMapRef.current && leafletModuleRef.current) {
          drawRouteOnMap(res.geometry.coordinates, [theniOrigin, ...stopsToRoute]);
        }
      })
      .catch(() => {
        // Fallback spatial calculation
        const dist = Math.round(
          Math.sqrt(
            Math.pow(targetDestination.latitude - theniOrigin.latitude, 2) +
              Math.pow(targetDestination.longitude - theniOrigin.longitude, 2)
          ) * 110 * 1.3
        );
        setRouteMetrics({ distanceKm: dist, durationMins: Math.round((dist / 40) * 60) });
        if (leafletMapRef.current && leafletModuleRef.current) {
          drawFallbackMapPoints([theniOrigin, ...stopsToRoute]);
        }
      })
      .finally(() => setRouteLoading(false));
  }, [selectedCircuit, activeDestination]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;
    let isMounted = true;

    async function initLeaflet() {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (!isMounted || !mapContainerRef.current) return;

      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }

      leafletModuleRef.current = L;

      const map = L.map(mapContainerRef.current, {
        center: [10.0104, 77.4768],
        zoom: 10,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      leafletMapRef.current = map;
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

  const drawRouteOnMap = (coordinates: number[][], points: Array<{ name: string; latitude: number; longitude: number }>) => {
    const map = leafletMapRef.current;
    const L = leafletModuleRef.current;
    if (!map || !L) return;

    // Clear previous layers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Polyline || layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Draw route polyline
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

    // Render Markers
    points.forEach((pt, index) => {
      const isStart = index === 0;
      const isEnd = index === points.length - 1;
      const color = isStart ? "#3b82f6" : isEnd ? "#10b981" : "#f59e0b";

      const iconHtml = `
        <div style="background: ${color}; color: #000; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 9999px; border: 2px solid #ffffff; box-shadow: 0 6px 18px rgba(0,0,0,0.5); white-space: nowrap; font-family: sans-serif;">
          ${index === 0 ? "📍 Start: " : `${index}. `}${pt.name}
        </div>
      `;

      const customIcon = L.divIcon({
        className: "theni-marker-pin",
        html: iconHtml,
        iconSize: [130, 28],
        iconAnchor: [65, 14],
      });

      L.marker([pt.latitude, pt.longitude], { icon: customIcon }).addTo(map);
    });
  };

  const drawFallbackMapPoints = (points: Array<{ name: string; latitude: number; longitude: number }>) => {
    const map = leafletMapRef.current;
    const L = leafletModuleRef.current;
    if (!map || !L) return;

    const latLngs: [number, number][] = points.map((p) => [p.latitude, p.longitude]);
    const polyline = L.polyline(latLngs, { color: "#10b981", weight: 3, opacity: 0.8, dashArray: "6, 6" }).addTo(map);
    map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
  };

  const handlePlanTrip = (dest: AdventureDestination) => {
    let promptText = `Plan a trip to ${dest.name}, Theni, Tamil Nadu`;
    if (dest.id === "kurangani-top-station") {
      promptText = `Plan a trekking trip from Kurangani to Top Station, Theni, Tamil Nadu`;
    }
    navigate({ to: "/planner", search: { prompt: promptText } });
  };

  return (
    <AppShell>
      {/* Hero Header */}
      <PageHeader
        eyebrow="THENI · TAMIL NADU"
        title="Theni Adventure & Nature Circuit"
        description="Waterfalls, misty mountains, rivers, Cumbum vineyards, and Western Ghats trekking trails."
      />

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        {/* Recommended Circuit Selector */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-elevate mb-8">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2 text-primary font-mono text-xs font-semibold uppercase tracking-wider">
              <Compass className="size-4 text-primary" />
              <span>Select Curated Circuit</span>
            </div>
            {routeMetrics && (
              <div className="flex items-center gap-3 text-xs font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                <span>Distance: {routeMetrics.distanceKm} km</span>
                <span>•</span>
                <span>Est: {Math.floor(routeMetrics.durationMins / 60)}h {routeMetrics.durationMins % 60}m</span>
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CIRCUIT_CLUSTERS.map((cluster) => {
              const isSelected = selectedCircuit === cluster.id;
              return (
                <button
                  key={cluster.id}
                  type="button"
                  onClick={() => setSelectedCircuit(cluster.id)}
                  className={`text-left p-3.5 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? "bg-primary/15 border-primary text-foreground shadow-sm"
                      : "bg-secondary/60 border-border/80 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <p className="text-xs font-bold text-foreground mb-1">{cluster.name}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{cluster.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Route Map & Circuit Details */}
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-elevate mb-10">
          <div className="flex items-center justify-between p-4 border-b border-border bg-card/60">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider font-mono">
              <Navigation className="size-4 text-primary" />
              <span>Theni Geographic Circuit Map</span>
            </div>
            <span className="text-[10px] font-mono text-primary px-2.5 py-0.5 bg-primary/10 rounded-full border border-primary/20 font-semibold">
              Isolated Route Engine
            </span>
          </div>

          <div className="relative h-[360px] sm:h-[440px] w-full bg-background">
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
          <Filter className="size-4 text-muted-foreground shrink-0 mr-1" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 9 Destination Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDestinations.map((dest) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              className="flex flex-col rounded-3xl border border-border bg-card overflow-hidden shadow-elevate transition hover:border-primary/40 group"
            >
              {/* Image Banner */}
              <div className="relative h-48 w-full overflow-hidden bg-secondary">
                <img
                  src={dest.image}
                  alt={dest.name}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = waterfallsImg;
                  }}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  {dest.category.map((c) => (
                    <span
                      key={c}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-background/80 backdrop-blur-md text-primary border border-primary/20"
                    >
                      {c}
                    </span>
                  ))}
                </div>
                {dest.difficulty && (
                  <span className="absolute bottom-3 right-3 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 backdrop-blur-md">
                    {dest.difficulty}
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {dest.name}
                  </h3>
                </div>

                <p className="text-xs text-primary font-mono flex items-center gap-1 mb-2">
                  <MapPin className="size-3 text-primary shrink-0" />
                  <span>{dest.district}, Tamil Nadu, India</span>
                </p>

                <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">
                  {dest.description}
                </p>

                {/* Warnings / Forest Advisories */}
                {dest.warnings && dest.warnings.length > 0 && (
                  <div className="mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 flex items-start gap-2 text-amber-600 dark:text-amber-400 text-xs">
                    <ShieldAlert className="size-4 shrink-0 mt-0.5" />
                    <span className="font-medium">{dest.warnings[0]}</span>
                  </div>
                )}

                {/* Best Season & Tags */}
                <div className="flex items-center justify-between border-t border-border/60 pt-3 mb-4 text-xs text-muted-foreground font-mono">
                  {dest.bestSeason && (
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3 text-primary" /> {dest.bestSeason}
                    </span>
                  )}
                  {dest.estimatedDuration && <span>⏱️ {dest.estimatedDuration}</span>}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveDestination(dest);
                      window.scrollTo({ top: 350, behavior: "smooth" });
                    }}
                    className="rounded-xl text-xs font-semibold border-border hover:bg-secondary"
                  >
                    <RouteIcon className="size-3.5 mr-1" /> Route Map
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handlePlanTrip(dest)}
                    className="rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Sparkles className="size-3.5 mr-1" /> Plan Trip →
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Footer Banner */}
        <div className="mt-12 rounded-3xl border border-primary/30 bg-primary/10 p-6 sm:p-8 text-center backdrop-blur-md">
          <h3 className="font-display text-xl font-bold text-foreground mb-2">
            Ready to explore the Theni Nature Circuit?
          </h3>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-6">
            Get instant road routes, riding times, fuel estimates, food stops, and weather forecasts with AI Trip Copilot.
          </p>
          <Button
            size="lg"
            onClick={() => navigate({ to: "/planner", search: { prompt: "Plan a 3-day nature trip to Theni, Meghamalai and Suruli Falls, Tamil Nadu" } })}
            className="rounded-2xl bg-primary text-primary-foreground font-bold px-8 py-6 shadow-lg hover:bg-primary/90 transition"
          >
            <Sparkles className="size-5 mr-2" /> Plan Complete Theni Circuit with AI Copilot
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
