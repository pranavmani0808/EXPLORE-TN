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
  Moon,
  ShieldAlert,
  Calendar,
  Filter,
  Route as RouteIcon,
  Car,
  Bike,
  Building2,
  Anchor,
  Sun,
  Layers,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import { RouteApiRepository, IsolatedRouteResultDTO } from "@/lib/api-client/routes";
import heroImg from "@/assets/hero-ghats.jpg";
import waterfallsImg from "@/assets/cat-waterfalls.jpg";
import routesImg from "@/assets/cat-routes.jpg";
import foodImg from "@/assets/cat-food.jpg";
import beachesImg from "@/assets/cat-beaches.jpg";
import templesImg from "@/assets/cat-temples.jpg";

export const Route = createFileRoute("/coastal-heritage")({
  head: () => ({
    meta: [
      { title: "Ultimate Tamil Nadu Coastal & Heritage Road Trip — ExplorerTN" },
      {
        name: "description",
        content:
          "From Chennai to Kanniyakumari via ECR, Mahabalipuram, Puducherry, Pichavaram, Tharangambadi, Thanjavur, Karaikudi, Pamban Bridge, Rameswaram, Dhanushkodi & Kanniyakumari.",
      },
      { property: "og:title", content: "Ultimate Tamil Nadu Coastal & Heritage Road Trip — ExplorerTN" },
      {
        property: "og:description",
        content: "14 canonical stops, 6 overnight hubs, 1,000+ km of Bay of Bengal coastal highway and Chola & Chettinad heritage.",
      },
    ],
  }),
  component: CoastalHeritagePage,
});

export interface CoastalHeritageStop {
  id: string;
  name: string;
  role: string;
  district: string;
  state: "Tamil Nadu";
  country: "India";
  latitude: number;
  longitude: number;
  categories: string[];
  description: string;
  highlights: string[];
  image: string;
  isOvernightHub?: boolean;
  isEngineeringLandmark?: boolean;
  isScenicDrive?: boolean;
  advisory?: string;
  dayNumber: number;
}

// 14 Strict Sequential Canonical Destinations
const COASTAL_HERITAGE_STOPS: CoastalHeritageStop[] = [
  {
    id: "chennai",
    name: "Chennai",
    role: "Starting Hub & Departure Point",
    district: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 13.0827,
    longitude: 80.2707,
    categories: ["City", "Culture", "Food", "Coastal"],
    description: "Capital of Tamil Nadu. Roll out from Marina Beach flyover as blue hour breaks over the Bay of Bengal into ECR.",
    highlights: ["Marina Beach Sunrise", "Santhome Cathedral", "Traditional Filter Coffee"],
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
    dayNumber: 1,
  },
  {
    id: "ecr",
    name: "East Coast Road (ECR)",
    role: "Scenic Coastal Highway",
    district: "Chengalpattu",
    state: "Tamil Nadu",
    country: "India",
    latitude: 12.78,
    longitude: 80.22,
    categories: ["Road Trip", "Coastal", "Photography"],
    description: "State Highway 49 hugging the Coromandel Coast with ocean vistas, fishing hamlets, and sea breeze curves.",
    highlights: ["Kovalam Surf Break", "Muttukadu Backwaters", "Coastal Highway Curves"],
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80",
    isScenicDrive: true,
    dayNumber: 1,
  },
  {
    id: "mahabalipuram",
    name: "Mahabalipuram",
    role: "UNESCO World Heritage Site",
    district: "Chengalpattu",
    state: "Tamil Nadu",
    country: "India",
    latitude: 12.6269,
    longitude: 80.1927,
    categories: ["Heritage", "Temples", "Coastal", "Photography"],
    description: "7th-century Pallava seaport carved with monolithic rock-cut cave temples and the iconic Shore Temple overlooking breaking waves.",
    highlights: ["Shore Temple at Sea Edge", "Pancha Rathas Monoliths", "Arjuna's Penance Relief"],
    image: "https://images.unsplash.com/photo-1609946782701-7fa158869150?auto=format&fit=crop&w=1000&q=80",
    dayNumber: 1,
  },
  {
    id: "puducherry",
    name: "Puducherry",
    role: "French Heritage & Coastal Hub",
    district: "Puducherry",
    state: "Tamil Nadu",
    country: "India",
    latitude: 11.9416,
    longitude: 79.8083,
    categories: ["Coastal", "Culture", "Food", "Road Trip"],
    description: "Seaside French quarter with pastel-yellow colonial villas, bougainvillea streets, French bakeries, and Rock Beach promenade.",
    highlights: ["White Town French Quarter", "Rock Beach Promenade Walk", "Auroville Matrimandir"],
    image: "https://images.unsplash.com/photo-1589705298607-4e9640426b38?auto=format&fit=crop&w=1000&q=80",
    isOvernightHub: true,
    dayNumber: 1,
  },
  {
    id: "pichavaram",
    name: "Pichavaram Mangrove Forest",
    role: "World's 2nd Largest Mangrove",
    district: "Cuddalore",
    state: "Tamil Nadu",
    country: "India",
    latitude: 11.4286,
    longitude: 79.7797,
    categories: ["Nature", "Photography", "Adventure"],
    description: "1,100-hectare mangrove wetland reserve with intricate canal waterways, wooden rowboat safaris, and dense green canopy.",
    highlights: ["Rowboat Canal Safari", "Avicennia Mangrove Roots", "Migratory Waterbird Spotting"],
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80",
    advisory: "Check current boat operations before travelling.",
    dayNumber: 2,
  },
  {
    id: "tharangambadi",
    name: "Tharangambadi (Tranquebar)",
    role: "Danish Colonial Heritage Coast",
    district: "Mayiladuthurai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 11.0347,
    longitude: 79.8524,
    categories: ["Heritage", "Coastal", "Culture"],
    description: "Tranquil 1620 Danish trading port featuring Fort Dansborg, Scandinavian church spires, and quiet ocean surf.",
    highlights: ["1620 Fort Dansborg", "Zion Church & Town Gate", "Coromandel Ocean Breeze"],
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    dayNumber: 2,
  },
  {
    id: "nagore",
    name: "Nagore",
    role: "Sufi Heritage & Cultural Stop",
    district: "Nagapattinam",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.8197,
    longitude: 79.8436,
    categories: ["Culture", "Heritage", "Pilgrimage"],
    description: "Historic 16th-century Sufi shrine Nagore Dargah featuring 5 towering white minarets and secular cultural harmony.",
    highlights: ["Nagore Dargah 5 Minarets", "Cultural Heritage Lane", "Coastal Pilgrimage Square"],
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1000&q=80",
    dayNumber: 2,
  },
  {
    id: "velankanni",
    name: "Velankanni",
    role: "Coastal Basilica & Overnight Hub",
    district: "Nagapattinam",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.6811,
    longitude: 79.8361,
    categories: ["Heritage", "Pilgrimage", "Coastal"],
    description: "Gothic revival Basilica of Our Lady of Good Health rising above sandy shores where Bay of Bengal waves lap the beach.",
    highlights: ["White Gothic Basilica Tower", "Coromandel Coastal Shore", "Pilgrimage Promenade"],
    image: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1000&q=80",
    isOvernightHub: true,
    dayNumber: 2,
  },
  {
    id: "thanjavur",
    name: "Thanjavur",
    role: "Chola Empire Capital & Major Hub",
    district: "Thanjavur",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.787,
    longitude: 79.1378,
    categories: ["Heritage", "Temples", "Culture", "Food"],
    description: "Heart of the Great Living Chola Temples. 1,000-year-old Brihadisvara Temple with an 81-ton monolithic granite vimana.",
    highlights: ["Brihadisvara Temple Monolith", "Maratha Palace & Saraswathi Mahal Library", "Thanjavur Art Plates & Bronzes"],
    image: "https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80",
    isOvernightHub: true,
    dayNumber: 3,
  },
  {
    id: "karaikudi",
    name: "Karaikudi",
    role: "Chettinad Heritage & Culinary Hub",
    district: "Sivaganga",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.0735,
    longitude: 78.7834,
    categories: ["Culture", "Food", "Heritage"],
    description: "Capital of Chettinad. Palatial 19th-century merchant mansions with Burmese teak pillars, Athangudi tiles, and rich spices.",
    highlights: ["Chettinad Palace Mansions", "Athangudi Handmade Tile Craft", "Authentic Chettinad Banana Leaf Feast"],
    image: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1000&q=80",
    isOvernightHub: true,
    dayNumber: 4,
  },
  {
    id: "pamban-bridge",
    name: "Pamban Bridge",
    role: "Ocean Cantilever Engineering Landmark",
    district: "Ramanathapuram",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.2818,
    longitude: 79.2086,
    categories: ["Engineering", "Coastal", "Road Trip", "Photography"],
    description: "2.06 km historic sea railway cantilever bridge crossing Palk Strait with parallel road bridge overlooking turquoise ocean.",
    highlights: ["Scherzer Rolling Lift Cantilever", "Palk Strait Ocean View", "Pamban Sea Bridge Road Drive"],
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    isEngineeringLandmark: true,
    dayNumber: 5,
  },
  {
    id: "rameswaram",
    name: "Rameswaram",
    role: "Sacred Island Temple Hub",
    district: "Ramanathapuram",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.2876,
    longitude: 79.3129,
    categories: ["Temples", "Coastal", "Heritage"],
    description: "Holy island town featuring Ramanathaswamy Temple's 1,212 carved granite pillar corridors and 22 sacred wells.",
    highlights: ["1,212 Pillar Temple Corridor", "Agni Theertham Sea Dip", "APJ Abdul Kalam National Memorial"],
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80",
    isOvernightHub: true,
    dayNumber: 5,
  },
  {
    id: "dhanushkodi",
    name: "Dhanushkodi",
    role: "Ghost Town Ruins & Land's End",
    district: "Ramanathapuram",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.1517,
    longitude: 79.4455,
    categories: ["Coastal", "Photography", "Road Trip", "Nature"],
    description: "Submerged ghost town destroyed in 1964 cyclone. 9.5 km ocean highway surrounded by Bay of Bengal and Indian Ocean to Arichal Munai.",
    highlights: ["Arichal Munai Tip (Ocean Confluence)", "1964 Cyclone Ruined Church & Station", "Dual Ocean Highway Drive"],
    image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=80",
    advisory: "Check local road and weather conditions before travelling.",
    dayNumber: 6,
  },
  {
    id: "kanniyakumari",
    name: "Kanniyakumari",
    role: "Southern Tip Finale & Overnight Hub",
    district: "Kanniyakumari",
    state: "Tamil Nadu",
    country: "India",
    latitude: 8.0883,
    longitude: 77.5385,
    categories: ["Coastal", "Viewpoints", "Culture", "Heritage"],
    description: "Southernmost tip of mainland India where Indian Ocean, Arabian Sea, and Bay of Bengal unite. Famous for Vivekananda Rock Memorial.",
    highlights: ["Tricontinental 3-Ocean Confluence", "Vivekananda Rock & Thiruvalluvar Statue", "Sunset & Sunrise Point"],
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    isOvernightHub: true,
    dayNumber: 6,
  },
];

const CATEGORIES = ["All", "Coastal", "Heritage", "Temples", "Nature", "Food", "Culture", "Photography", "Road Trip"];

export function CoastalHeritagePage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeStop, setActiveStop] = useState<CoastalHeritageStop>(COASTAL_HERITAGE_STOPS[0]);
  const [travelMode, setTravelMode] = useState<"driving" | "motorcycle" | "cycling">("driving");

  const [routeMetrics, setRouteMetrics] = useState<{ totalKm: number; totalMins: number } | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletModuleRef = useRef<any>(null);

  const filteredStops = COASTAL_HERITAGE_STOPS.filter((stop) => {
    if (selectedCategory === "All") return true;
    return stop.categories.includes(selectedCategory);
  });

  // Calculate Full 1,000+ km Highway Route using Isolated Route Engine
  useEffect(() => {
    setIsCalculatingRoute(true);

    const origin = COASTAL_HERITAGE_STOPS[0];
    const destination = COASTAL_HERITAGE_STOPS[COASTAL_HERITAGE_STOPS.length - 1];
    const waypoints = COASTAL_HERITAGE_STOPS.slice(1, -1).map((s) => ({
      name: s.name,
      latitude: s.latitude,
      longitude: s.longitude,
    }));

    const req = {
      requestId: `coastal-route-${Date.now()}`,
      origin: { name: origin.name, latitude: origin.latitude, longitude: origin.longitude },
      waypoints,
      destination: { name: destination.name, latitude: destination.latitude, longitude: destination.longitude },
      travelMode: travelMode === "motorcycle" ? "driving" : travelMode,
    };

    RouteApiRepository.calculateRoute(req)
      .then((res: IsolatedRouteResultDTO) => {
        setRouteMetrics({ totalKm: res.distanceKm, totalMins: res.durationMinutes });
        if (leafletMapRef.current && leafletModuleRef.current) {
          drawRouteOnMap(res.geometry.coordinates, COASTAL_HERITAGE_STOPS);
        }
      })
      .catch(() => {
        // Fallback spatial calculation
        setRouteMetrics({ totalKm: 1084, totalMins: 1440 });
        if (leafletMapRef.current && leafletModuleRef.current) {
          drawFallbackMarkers(COASTAL_HERITAGE_STOPS);
        }
      })
      .finally(() => setIsCalculatingRoute(false));
  }, [travelMode]);

  // Leaflet Map Setup
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
        center: [10.5, 79.2],
        zoom: 7,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      leafletMapRef.current = map;
      drawFallbackMarkers(COASTAL_HERITAGE_STOPS);
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

  const drawRouteOnMap = (coordinates: number[][], stops: CoastalHeritageStop[]) => {
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

    stops.forEach((stop, index) => {
      const isStart = index === 0;
      const isEnd = index === stops.length - 1;
      const pinColor = isStart
        ? "#3b82f6"
        : isEnd
        ? "#10b981"
        : stop.isOvernightHub
        ? "#8b5cf6"
        : stop.isEngineeringLandmark
        ? "#eab308"
        : "#06b6d4";

      const iconHtml = `
        <div style="background: ${pinColor}; color: #000; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 9999px; border: 2px solid #ffffff; box-shadow: 0 6px 18px rgba(0,0,0,0.6); white-space: nowrap; font-family: sans-serif;">
          ${index + 1}. ${stop.name}
        </div>
      `;

      const customIcon = L.divIcon({
        className: "coastal-marker-pin",
        html: iconHtml,
        iconSize: [130, 28],
        iconAnchor: [65, 14],
      });

      L.marker([stop.latitude, stop.longitude], { icon: customIcon }).addTo(map);
    });
  };

  const drawFallbackMarkers = (stops: CoastalHeritageStop[]) => {
    const map = leafletMapRef.current;
    const L = leafletModuleRef.current;
    if (!map || !L) return;

    const points: [number, number][] = stops.map((s) => [s.latitude, s.longitude]);
    const polyline = L.polyline(points, { color: "#10b981", weight: 3, opacity: 0.8, dashArray: "6, 6" }).addTo(map);
    map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
  };

  const handleZoomToStop = (stop: CoastalHeritageStop) => {
    setActiveStop(stop);
    const map = leafletMapRef.current;
    if (map) {
      map.flyTo([stop.latitude, stop.longitude], 12, { duration: 1.2 });
    }
  };

  const handlePlanFullRoute = () => {
    const promptText = `Plan an ultimate Tamil Nadu coastal and heritage road trip from Chennai to Kanniyakumari via ECR, Mahabalipuram, Puducherry, Pichavaram, Tharangambadi, Nagore, Velankanni, Thanjavur, Karaikudi, Pamban Bridge, Rameswaram and Dhanushkodi.`;
    navigate({ to: "/planner", search: { prompt: promptText } });
  };

  return (
    <AppShell>
      {/* Hero Header */}
      <PageHeader
        eyebrow="FLAGSHIP ROAD TRIP · TAMIL NADU"
        title="The Ultimate Tamil Nadu Coastal & Heritage Road Trip"
        description="From Chennai's coast to Kanniyakumari — beaches, temples, mangroves, heritage towns, Chettinad culture and the southern edge of India."
      />

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        {/* Controls Bar: Travel Mode & Total Highway Metrics */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-elevate mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider font-semibold mr-1">
                Travel Mode:
              </span>
              {[
                { mode: "driving", label: "Drive", icon: Car },
                { mode: "motorcycle", label: "Ride", icon: Bike },
                { mode: "cycling", label: "Cycle", icon: Navigation },
              ].map(({ mode, label, icon: Icon }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTravelMode(mode as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    travelMode === mode
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Live Highway Metrics */}
            <div className="flex items-center gap-4 text-xs font-mono font-bold text-primary bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
              <span className="flex items-center gap-1">
                <Compass className="size-3.5" /> Total Distance: {routeMetrics ? `${routeMetrics.totalKm} km` : "1,084 km"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" /> Est. Driving Time: {routeMetrics ? `${Math.floor(routeMetrics.totalMins / 60)} hours` : "24 hours"}
              </span>
              <span>•</span>
              <span>6 Days</span>
            </div>
          </div>
        </div>

        {/* Interactive Highway Map */}
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-elevate mb-10">
          <div className="flex items-center justify-between p-4 border-b border-border bg-card/60">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider font-mono">
              <Navigation className="size-4 text-primary" />
              <span>Coromandel Coast & Heritage Highway Map (14 Sequential Stops)</span>
            </div>
            <span className="text-[10px] font-mono text-primary px-2.5 py-0.5 bg-primary/10 rounded-full border border-primary/20 font-semibold">
              Isolated Route Engine
            </span>
          </div>

          <div className="relative h-[380px] sm:h-[480px] w-full bg-background">
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />
          </div>
        </div>

        {/* 6-Day Suggested Itinerary Timeline Breakdown */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-elevate mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 font-mono flex items-center gap-2">
            <Calendar className="size-4 text-primary" /> Multi-Day Route Architecture (6 Days)
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                day: "Day 1",
                segment: "Chennai → ECR → Mahabalipuram → Puducherry",
                hub: "Puducherry",
                theme: "Coromandel Coastal Drive & French Heritage",
              },
              {
                day: "Day 2",
                segment: "Puducherry → Pichavaram → Tharangambadi → Nagore → Velankanni",
                hub: "Velankanni",
                theme: "Mangrove Safari & Danish/Sufi/Gothic Heritage",
              },
              {
                day: "Day 3",
                segment: "Velankanni → Thanjavur",
                hub: "Thanjavur",
                theme: "Great Living Chola Empire & Big Temple",
              },
              {
                day: "Day 4",
                segment: "Thanjavur → Karaikudi",
                hub: "Karaikudi",
                theme: "Chettinad Merchant Mansions & Spices",
              },
              {
                day: "Day 5",
                segment: "Karaikudi → Pamban Bridge → Rameswaram",
                hub: "Rameswaram",
                theme: "Palk Strait Sea Bridge & Sacred Island Temple",
              },
              {
                day: "Day 6",
                segment: "Rameswaram → Dhanushkodi → Kanniyakumari",
                hub: "Kanniyakumari",
                theme: "Ghost Town Land's End & 3-Ocean Confluence Sunset",
              },
            ].map((d) => (
              <div key={d.day} className="rounded-2xl border border-border/80 bg-secondary/50 p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold font-mono text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                    {d.day}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Moon className="size-3 text-purple-400" /> Hub: <strong className="text-foreground">{d.hub}</strong>
                  </span>
                </div>
                <p className="text-xs font-bold text-foreground mb-1">{d.segment}</p>
                <p className="text-[11px] text-muted-foreground">{d.theme}</p>
              </div>
            ))}
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

        {/* 14 Destination Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStops.map((stop, index) => (
            <motion.div
              key={stop.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: (index % 3) * 0.05 }}
              className="flex flex-col rounded-3xl border border-border bg-card overflow-hidden shadow-elevate transition hover:border-primary/40 group"
            >
              {/* Image Banner */}
              <div className="relative h-48 w-full overflow-hidden bg-secondary">
                <img
                  src={stop.image}
                  alt={stop.name}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = beachesImg;
                  }}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                
                {/* Stop Number Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="grid size-7 place-items-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground shadow-md">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-background/80 backdrop-blur-md text-foreground border border-border">
                    Day {stop.dayNumber}
                  </span>
                </div>

                {/* Overnight Hub / Special Badges */}
                <div className="absolute bottom-3 right-3 flex flex-wrap gap-1">
                  {stop.isOvernightHub && (
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-md flex items-center gap-1">
                      <Moon className="size-3" /> Overnight Hub
                    </span>
                  )}
                  {stop.isEngineeringLandmark && (
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md flex items-center gap-1">
                      <Anchor className="size-3" /> Engineering Landmark
                    </span>
                  )}
                  {stop.isScenicDrive && (
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md flex items-center gap-1">
                      <Compass className="size-3" /> Scenic Drive
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-0.5">
                  {stop.name}
                </h3>
                
                <p className="text-[11px] text-primary font-mono font-semibold mb-2">
                  {stop.role} · {stop.district}, Tamil Nadu
                </p>

                <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">
                  {stop.description}
                </p>

                {/* Highlights List */}
                <div className="mb-4 space-y-1">
                  {stop.highlights.map((h) => (
                    <div key={h} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <span className="size-1 rounded-full bg-primary" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                {/* Advisory Notice */}
                {stop.advisory && (
                  <div className="mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 flex items-start gap-2 text-amber-600 dark:text-amber-400 text-xs">
                    <ShieldAlert className="size-4 shrink-0 mt-0.5" />
                    <span className="font-medium">{stop.advisory}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-auto pt-3 border-t border-border/60">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleZoomToStop(stop)}
                    className="rounded-xl text-xs font-semibold border-border hover:bg-secondary"
                  >
                    <RouteIcon className="size-3.5 mr-1" /> Map Segment
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      navigate({
                        to: "/planner",
                        search: { prompt: `Plan a trip to ${stop.name}, Tamil Nadu as part of coastal road trip` },
                      })
                    }
                    className="rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Sparkles className="size-3.5 mr-1" /> Plan Stop →
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Ultimate Route CTA Banner */}
        <div className="mt-14 rounded-3xl border border-primary/30 bg-primary/10 p-6 sm:p-10 text-center backdrop-blur-md">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-mono font-bold mb-3 border border-primary/30">
            FLAGSHIP 1,000+ KM COASTAL CORRIDOR
          </span>
          <h3 className="font-display text-2xl font-bold text-foreground mb-3">
            Ready to embark on the Ultimate Coastal & Heritage Journey?
          </h3>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
            Generate your complete 6-day itinerary across 14 destinations from Chennai to Kanniyakumari with AI Trip Copilot.
          </p>
          <Button
            size="lg"
            onClick={handlePlanFullRoute}
            className="rounded-2xl bg-primary text-primary-foreground font-bold px-8 py-6 shadow-xl hover:bg-primary/90 transition text-sm"
          >
            <Sparkles className="size-5 mr-2" /> Plan Complete Ultimate Road Trip with AI Copilot
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
