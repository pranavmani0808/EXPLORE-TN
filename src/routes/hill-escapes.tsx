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
  Sun,
  Filter,
  Route as RouteIcon,
  SlidersHorizontal,
  Trees,
  CloudSun,
  Flame,
  ChevronRight,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import { RouteApiRepository, IsolatedRouteResultDTO } from "@/lib/api-client/routes";
import heroImg from "@/assets/hero-ghats.jpg";
import waterfallsImg from "@/assets/cat-waterfalls.jpg";
import routesImg from "@/assets/cat-routes.jpg";
import campingImg from "@/assets/cat-camping.jpg";

export const Route = createFileRoute("/hill-escapes")({
  head: () => ({
    meta: [
      { title: "Hill Escapes from Chennai — ExplorerTN" },
      {
        name: "description",
        content:
          "Discover mountain destinations reachable from Chennai: Horsley Hills, Yelagiri, Yercaud, Kolli Hills, Sirumalai, Kodaikanal, Palani Hills, Kotagiri, and Coonoor.",
      },
      { property: "og:title", content: "Hill Escapes from Chennai — ExplorerTN" },
      {
        property: "og:description",
        content:
          "Hub-and-spoke mountain discovery system from Chennai with dynamic distance calculation, route maps, and AI Trip Planner integration.",
      },
    ],
  }),
  component: HillEscapesPage,
});

export interface HillDestination {
  id: string;
  name: string;
  state: string;
  country: "India";
  latitude: number;
  longitude: number;
  category: string[];
  description: string;
  image: string;
  tags: string[];
  approximateDistanceFromChennai?: number;
  estimatedDuration?: string;
  difficulty?: string;
  highlights: string[];
  tripType: "Weekend" | "Long Weekend" | "Extended Road Trip";
  popularityRank: number;
}

interface OriginCityConfig {
  name: string;
  latitude: number;
  longitude: number;
}

const ORIGIN_CITIES: Record<string, OriginCityConfig> = {
  Chennai: { name: "Chennai", latitude: 13.0827, longitude: 80.2707 },
  Bengaluru: { name: "Bengaluru", latitude: 12.9716, longitude: 77.5946 },
  Coimbatore: { name: "Coimbatore", latitude: 11.0168, longitude: 76.9558 },
  Madurai: { name: "Madurai", latitude: 9.9252, longitude: 78.1198 },
  Pondicherry: { name: "Pondicherry", latitude: 11.9416, longitude: 79.8083 },
};

// 9 Canonical Independent Hill Destinations
const HILL_DESTINATIONS: HillDestination[] = [
  {
    id: "horsley-hills",
    name: "Horsley Hills",
    state: "Andhra Pradesh",
    country: "India",
    latitude: 13.6608,
    longitude: 78.397,
    category: ["Hill Station", "Nature", "Weekend Getaway", "Mountain"],
    description: "Cool climate mountain sanctuary with dense eucalyptus groves, wind rocks, and panoramic viewpoints near the border.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    tags: ["Cross-State", "Eucalyptus", "Sunset Point", "Quiet"],
    approximateDistanceFromChennai: 371,
    highlights: ["Kaundinya Wildlife Sanctuary View", "Eucalyptus Ridge Walk", "Gali Bandalu Wind Rocks"],
    tripType: "Weekend",
    popularityRank: 7,
  },
  {
    id: "yelagiri",
    name: "Yelagiri",
    state: "Tamil Nadu",
    country: "India",
    latitude: 12.5786,
    longitude: 78.6389,
    category: ["Hill Station", "Nature", "Adventure", "Weekend Getaway"],
    description: "Serene hill cluster at 1,110m elevation featuring Punganoor boating lake, Swamimalai trek, and 14 quiet tribal villages.",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80",
    tags: ["Closest", "Boating Lake", "Trekking", "Orchards"],
    approximateDistanceFromChennai: 275,
    highlights: ["Punganoor Boating Lake", "Swamimalai Peak Hike (4,338 ft)", "Jalagamparai Waterfalls"],
    tripType: "Weekend",
    popularityRank: 1,
  },
  {
    id: "yercaud",
    name: "Yercaud",
    state: "Tamil Nadu",
    country: "India",
    latitude: 11.7753,
    longitude: 78.2093,
    category: ["Hill Station", "Lake", "Nature", "Coffee", "Road Trip"],
    description: "Jewel of the Shevaroys. Coffee plantations, orange groves, 20 hairpin curves, and cold mountain lakes.",
    image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=80",
    tags: ["Coffee", "20 Hairpins", "Lake View", "Shevaroy"],
    approximateDistanceFromChennai: 366,
    highlights: ["Emerald Yercaud Lake", "Pagoda Point Valley View", "Lady's Seat Sunset Cliff"],
    tripType: "Weekend",
    popularityRank: 2,
  },
  {
    id: "kolli-hills",
    name: "Kolli Hills",
    state: "Tamil Nadu",
    country: "India",
    latitude: 11.2721,
    longitude: 78.3412,
    category: ["Mountain", "Adventure", "Trekking", "Waterfall", "Road Trip"],
    description: "Unspoiled mountain range famous for its legendary 70 continuous hairpin bends, Agaya Gangai falls, and herbal flora.",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80",
    tags: ["70 Hairpins", "Agaya Gangai", "Medicinal Herbs", "Rider Thrill"],
    approximateDistanceFromChennai: 365,
    highlights: ["70 Continuous Hairpin Bend Climb", "Agaya Gangai 300ft Waterfall", "Arapaleeswarar Temple"],
    tripType: "Long Weekend",
    popularityRank: 3,
  },
  {
    id: "sirumalai",
    name: "Sirumalai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.1983,
    longitude: 77.9944,
    category: ["Hill Station", "Nature", "Forest", "Offbeat", "Road Trip"],
    description: "Offbeat dense forest hill reserve with 18 hairpin bends, high biodiversity, and serene mountain valleys.",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80",
    tags: ["Offbeat", "Quiet", "Dense Forest", "18 Hairpins"],
    approximateDistanceFromChennai: 460,
    highlights: ["Sirumalai Observation Tower", "Sananjeevani Hill Reserve", "18 Hairpin Mountain Pass"],
    tripType: "Long Weekend",
    popularityRank: 8,
  },
  {
    id: "kodaikanal",
    name: "Kodaikanal",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.2381,
    longitude: 77.4892,
    category: ["Hill Station", "Lake", "Nature", "Adventure", "Photography"],
    description: "Princess of Hill Stations. Star-shaped lake, misty Coaker's Walk, Pillar Rocks, and high-altitude pine forests.",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80",
    tags: ["Major Hub", "Star Lake", "Pine Forest", "Cloud Forest"],
    approximateDistanceFromChennai: 525,
    highlights: ["Star-Shaped Kodai Lake", "Coaker's Walk Cloud Canopy", "Pillar Rocks & Dolphin's Nose"],
    tripType: "Long Weekend",
    popularityRank: 4,
  },
  {
    id: "palani-hills",
    name: "Palani Hills",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.4497,
    longitude: 77.5204,
    category: ["Mountains", "Nature", "Temple", "Road Trip", "Culture"],
    description: "Eastern spur of the Western Ghats featuring sacred Sivagiri hill, deep river valleys, and wilderness sanctuaries.",
    image: "https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80",
    tags: ["Heritage", "Sivagiri Hill", "Valley Wilderness", "Sacred Abode"],
    approximateDistanceFromChennai: 525,
    highlights: ["Palani Sivagiri Hill Shrine", "Palani Ghat Road Views", "Western Ghats Foothills"],
    tripType: "Extended Road Trip",
    popularityRank: 9,
  },
  {
    id: "kotagiri",
    name: "Kotagiri",
    state: "Tamil Nadu",
    country: "India",
    latitude: 11.4243,
    longitude: 76.8672,
    category: ["Nilgiris", "Hill Station", "Tea", "Nature", "Trekking"],
    description: "Oldest and quietest Nilgiri hill station surrounded by emerald tea plantations, Catherine Falls, and Kodanad cliff view.",
    image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1000&q=80",
    tags: ["Nilgiris", "Tea Gardens", "Catherine Falls", "Kodanad"],
    approximateDistanceFromChennai: 537,
    highlights: ["Catherine 250ft Double Falls", "Kodanad Viewpoint Ridge", "Longwood Shola Virgin Forest"],
    tripType: "Extended Road Trip",
    popularityRank: 5,
  },
  {
    id: "coonoor",
    name: "Coonoor",
    state: "Tamil Nadu",
    country: "India",
    latitude: 11.353,
    longitude: 76.7959,
    category: ["Nilgiris", "Hill Station", "Tea", "Heritage", "Nature"],
    description: "Second largest Nilgiri hill station famous for high-altitude tea factories, Sim's Botanical Park, and UNESCO Toy Train.",
    image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1000&q=80",
    tags: ["Nilgiris", "Sim's Park", "Toy Train", "Dolphin's Nose"],
    approximateDistanceFromChennai: 539,
    highlights: ["Sim's Botanical Park", "Dolphin's Nose Cliff View", "Nilgiri Mountain Railway Ride"],
    tripType: "Extended Road Trip",
    popularityRank: 6,
  },
];

const CATEGORIES = ["All", "Weekend", "Hill Stations", "Trekking", "Waterfalls", "Tea", "Nature", "Adventure", "Offbeat"];

export function HillEscapesPage() {
  const navigate = useNavigate();
  const [selectedOrigin, setSelectedOrigin] = useState("Chennai");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState<"Closest" | "Farthest" | "Popular" | "Adventure" | "Weekend">("Closest");
  const [activeDestination, setActiveDestination] = useState<HillDestination>(HILL_DESTINATIONS[1]); // Yelagiri
  
  const [routeMetrics, setRouteMetrics] = useState<{ distanceKm: number; durationMins: number } | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletModuleRef = useRef<any>(null);

  // Recalculate Route dynamically whenever Origin or Active Destination changes
  useEffect(() => {
    setIsCalculatingRoute(true);

    const originConfig = ORIGIN_CITIES[selectedOrigin] || ORIGIN_CITIES.Chennai;
    const req = {
      requestId: `route-hill-${selectedOrigin}-${activeDestination.id}-${Date.now()}`,
      origin: { name: originConfig.name, latitude: originConfig.latitude, longitude: originConfig.longitude },
      destination: { name: activeDestination.name, latitude: activeDestination.latitude, longitude: activeDestination.longitude },
      travelMode: "driving" as const,
    };

    RouteApiRepository.calculateRoute(req)
      .then((res: IsolatedRouteResultDTO) => {
        setRouteMetrics({ distanceKm: res.distanceKm, durationMins: res.durationMinutes });
        if (leafletMapRef.current && leafletModuleRef.current) {
          drawRouteOnMap(originConfig, activeDestination, res.geometry.coordinates);
        }
      })
      .catch(() => {
        // Fallback spatial calculation
        const dLat = activeDestination.latitude - originConfig.latitude;
        const dLng = activeDestination.longitude - originConfig.longitude;
        const approxKm = Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 110 * 1.3);
        setRouteMetrics({ distanceKm: approxKm, durationMins: Math.round((approxKm / 45) * 60) });
        if (leafletMapRef.current && leafletModuleRef.current) {
          drawFallbackMap(originConfig, activeDestination);
        }
      })
      .finally(() => setIsCalculatingRoute(false));
  }, [selectedOrigin, activeDestination]);

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
        center: [12.0, 78.5],
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

  const drawRouteOnMap = (origin: OriginCityConfig, dest: HillDestination, coordinates: number[][]) => {
    const map = leafletMapRef.current;
    const L = leafletModuleRef.current;
    if (!map || !L) return;

    // Clear previous layers
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
      html: `<div style="background: #3b82f6; color: #fff; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 9999px; border: 2px solid #fff; box-shadow: 0 6px 18px rgba(0,0,0,0.5); white-space: nowrap; font-family: sans-serif;">📍 Origin: ${origin.name}</div>`,
      iconSize: [120, 28],
      iconAnchor: [60, 14],
    });
    L.marker([origin.latitude, origin.longitude], { icon: originIcon }).addTo(map);

    // Destination Pin
    const destIcon = L.divIcon({
      className: "dest-pin",
      html: `<div style="background: #10b981; color: #000; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 9999px; border: 2px solid #fff; box-shadow: 0 6px 18px rgba(0,0,0,0.5); white-space: nowrap; font-family: sans-serif;">⛰️ ${dest.name}</div>`,
      iconSize: [130, 28],
      iconAnchor: [65, 14],
    });
    L.marker([dest.latitude, dest.longitude], { icon: destIcon }).addTo(map);
  };

  const drawFallbackMap = (origin: OriginCityConfig, dest: HillDestination) => {
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

  // Filter & Sort Logic
  const filteredDestinations = HILL_DESTINATIONS.filter((item) => {
    if (selectedCategory === "All") return true;
    if (selectedCategory === "Weekend") return item.tripType === "Weekend";
    return item.category.includes(selectedCategory);
  }).sort((a, b) => {
    if (selectedSort === "Closest") return (a.approximateDistanceFromChennai || 0) - (b.approximateDistanceFromChennai || 0);
    if (selectedSort === "Farthest") return (b.approximateDistanceFromChennai || 0) - (a.approximateDistanceFromChennai || 0);
    if (selectedSort === "Popular") return a.popularityRank - b.popularityRank;
    if (selectedSort === "Adventure") return b.category.includes("Adventure") ? 1 : -1;
    if (selectedSort === "Weekend") return a.tripType === "Weekend" ? -1 : 1;
    return 0;
  });

  const handlePlanTrip = (dest: HillDestination) => {
    const promptText = `Plan a road trip from ${selectedOrigin} to ${dest.name}, ${dest.state}.`;
    navigate({ to: "/planner", search: { prompt: promptText } });
  };

  return (
    <AppShell>
      {/* Hero Header */}
      <PageHeader
        eyebrow="HILL ESCAPES FROM CHENNAI"
        title="Escape to the Hills"
        description="Discover mountain roads, misty valleys, tea estates, waterfalls and quiet hill towns within reach of Chennai."
      />

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        {/* Origin Switcher & Route Calculator Panel */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-elevate mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider font-semibold">
                📍 Origin Location:
              </span>
              <div className="relative">
                <select
                  value={selectedOrigin}
                  onChange={(e) => setSelectedOrigin(e.target.value)}
                  className="h-10 bg-secondary border border-border rounded-xl px-4 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:border-primary transition cursor-pointer appearance-none pr-8"
                >
                  {Object.keys(ORIGIN_CITIES).map((city) => (
                    <option key={city} value={city} className="bg-card text-card-foreground">
                      📍 {city}
                    </option>
                  ))}
                </select>
                <Navigation className="absolute right-2.5 top-3 size-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Active Destination & Live Route Metrics */}
            <div className="flex items-center gap-3 text-xs font-mono font-bold text-primary bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
              <span>Selected: {activeDestination.name}</span>
              <span>•</span>
              <span>Distance: {routeMetrics ? `${routeMetrics.distanceKm} km` : "Calculating..."}</span>
              <span>•</span>
              <span>Est: {routeMetrics ? `${Math.floor(routeMetrics.durationMins / 60)}h ${routeMetrics.durationMins % 60}m` : "..."}</span>
            </div>
          </div>
        </div>

        {/* Hub-and-Spoke Route Map Viewport */}
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-elevate mb-10">
          <div className="flex items-center justify-between p-4 border-b border-border bg-card/60">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider font-mono">
              <Compass className="size-4 text-primary" />
              <span>Hub-and-Spoke Route: {selectedOrigin} → {activeDestination.name}</span>
            </div>
            <span className="text-[10px] font-mono text-primary px-2.5 py-0.5 bg-primary/10 rounded-full border border-primary/20 font-semibold">
              Isolated Route Engine
            </span>
          </div>

          <div className="relative h-[360px] sm:h-[440px] w-full bg-background">
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />
          </div>
        </div>

        {/* Collections Quick Filter Bar */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-elevate mb-8">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
            <Trees className="size-4 text-primary" /> Curated Hill Collections
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Closest Mountain Escapes",
                desc: "Yelagiri, Yercaud & Kolli Hills",
                destId: "yelagiri",
              },
              {
                title: "Western Ghats Escapes",
                desc: "Kodaikanal, Sirumalai & Palani Hills",
                destId: "kodaikanal",
              },
              {
                title: "Nilgiri Escapes",
                desc: "Kotagiri & Coonoor Tea Estates",
                destId: "coonoor",
              },
              {
                title: "Cross-State Hill Escape",
                desc: "Horsley Hills (Andhra Pradesh)",
                destId: "horsley-hills",
              },
            ].map((col) => (
              <button
                key={col.title}
                type="button"
                onClick={() => {
                  const target = HILL_DESTINATIONS.find((d) => d.id === col.destId);
                  if (target) setActiveDestination(target);
                }}
                className="text-left p-3.5 rounded-2xl border border-border/80 bg-secondary/50 hover:bg-secondary hover:border-primary/40 transition cursor-pointer"
              >
                <p className="text-xs font-bold text-foreground mb-1">{col.title}</p>
                <p className="text-[11px] text-muted-foreground">{col.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
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

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground">Sort:</span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as any)}
              className="h-8 bg-secondary border border-border rounded-xl px-3 text-xs font-semibold text-foreground focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="Closest">Closest Distance</option>
              <option value="Farthest">Farthest Distance</option>
              <option value="Popular">Most Popular</option>
              <option value="Adventure">Adventure First</option>
              <option value="Weekend">Weekend Getaways</option>
            </select>
          </div>
        </div>

        {/* 9 Destination Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDestinations.map((dest) => {
            const isActive = activeDestination.id === dest.id;
            return (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35 }}
                className={`flex flex-col rounded-3xl border bg-card overflow-hidden shadow-elevate transition group ${
                  isActive ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/40"
                }`}
              >
                {/* Image Banner */}
                <div className="relative h-48 w-full overflow-hidden bg-secondary">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = campingImg;
                    }}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-background/80 backdrop-blur-md text-primary border border-primary/20">
                      📍 {dest.state}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-background/80 backdrop-blur-md text-foreground border border-border">
                      {dest.tripType}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {dest.name}
                    </h3>
                  </div>

                  <p className="text-xs text-primary font-mono mb-2">
                    Approx. ~{dest.approximateDistanceFromChennai} km from {selectedOrigin}
                  </p>

                  <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">
                    {dest.description}
                  </p>

                  {/* Highlights List */}
                  <div className="mb-4 space-y-1">
                    {dest.highlights.map((h) => (
                      <div key={h} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <span className="size-1 rounded-full bg-primary" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-auto pt-3 border-t border-border/60">
                    <Button
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setActiveDestination(dest);
                        window.scrollTo({ top: 350, behavior: "smooth" });
                      }}
                      className={`rounded-xl text-xs font-semibold ${
                        isActive ? "bg-primary text-primary-foreground" : "border-border hover:bg-secondary"
                      }`}
                    >
                      <RouteIcon className="size-3.5 mr-1" /> Explore Route →
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

        {/* CTA Footer Banner */}
        <div className="mt-14 rounded-3xl border border-primary/30 bg-primary/10 p-6 sm:p-10 text-center backdrop-blur-md">
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">
            Ready to plan your mountain getaway from {selectedOrigin}?
          </h3>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-6">
            Get instant road directions, hairpins advice, weather forecasts, and customized itineraries with AI Trip Copilot.
          </p>
          <Button
            size="lg"
            onClick={() => handlePlanTrip(activeDestination)}
            className="rounded-2xl bg-primary text-primary-foreground font-bold px-8 py-6 shadow-lg hover:bg-primary/90 transition text-sm"
          >
            <Sparkles className="size-5 mr-2" /> Plan {activeDestination.name} Trip with AI Copilot
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
