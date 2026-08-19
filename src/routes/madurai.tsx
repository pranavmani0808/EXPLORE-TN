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
  Landmark,
  Utensils,
  Sun,
  Filter,
  Route as RouteIcon,
  SlidersHorizontal,
  Flame,
  Building2,
  Waves,
  Trees,
  X,
  Info,
  CheckCircle2,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import { RouteApiRepository, IsolatedRouteResultDTO } from "@/lib/api-client/routes";
import heroImg from "@/assets/hero-ghats.jpg";
import waterfallsImg from "@/assets/cat-waterfalls.jpg";
import routesImg from "@/assets/cat-routes.jpg";
import foodImg from "@/assets/cat-food.jpg";
import templesImg from "@/assets/cat-temples.jpg";

export const Route = createFileRoute("/madurai")({
  head: () => ({
    meta: [
      { title: "Explore Madurai — Heritage, Nature & Taste Madurai | ExplorerTN" },
      {
        name: "description",
        content:
          "Discover Meenakshi Amman Temple, Thirumalai Nayakkar Mahal, Thirupparankundram, Alagar Kovil, Samanar Hills, Sirumalai, Vaigai Dam, Kumbakkarai Falls and famous Madurai food.",
      },
      { property: "og:title", content: "Explore Madurai — ExplorerTN" },
      {
        property: "og:description",
        content:
          "Madurai hub-and-spoke destination discovery, interactive maps, curated circuits, and AI Trip Planner integration.",
      },
    ],
  }),
  component: ExploreMaduraiPage,
});

export interface MaduraiDestination {
  id: string;
  name: string;
  role: string;
  district: string;
  state: "Tamil Nadu";
  country: "India";
  latitude: number;
  longitude: number;
  category: string[];
  description: string;
  highlights: string[];
  bestExperiences: string[];
  image: string;
  approxDistanceKm?: number;
  recommendedDuration: string;
  popularityRank: number;
}

export interface MaduraiFoodItem {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  tags: string[];
}

// 11 Major Madurai Destinations & Excursions
const MADURAI_DESTINATIONS: MaduraiDestination[] = [
  {
    id: "meenakshi-temple",
    name: "Meenakshi Amman Temple",
    role: "Madurai's Primary Heritage Landmark",
    district: "Madurai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.9195,
    longitude: 78.1193,
    category: ["Temple", "Heritage", "Architecture", "Culture", "Photography"],
    description: "Historic Dravidian temple complex featuring 14 soaring gopurams, Ashta Shakti Mandapam, and 33,000 stone sculptures.",
    highlights: ["1,000-Pillar Hall (Aayiram Kaal Mandapam)", "Golden Lotus Tank (Porthamarai Kulam)", "Soaring Southern Gopuram (170ft)"],
    bestExperiences: ["Early morning deity procession", "Exploring 1,000-pillar hall art museum", "Evening lamp rituals & temple music"],
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
    approxDistanceKm: 0,
    recommendedDuration: "2–3 Hours",
    popularityRank: 1,
  },
  {
    id: "thirupparankundram",
    name: "Thirupparankundram Murugan Temple",
    role: "Temple + Hill Heritage",
    district: "Madurai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.8797,
    longitude: 78.071,
    category: ["Temple", "Hill", "Heritage", "Culture", "Photography"],
    description: "6th-century rock-cut cave temple carved into a massive granite hill celebrating the celestial wedding of Lord Murugan.",
    highlights: ["Rock-Cut Cave Sanctuaries", "Hilltop Viewpoint of Madurai", "Historic Inscriptions"],
    bestExperiences: ["Exploring ancient rock-carved sanctums", "Sunset view from Thirupparankundram hill ridge", "Attending evening pooja"],
    image: "https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80",
    approxDistanceKm: 8,
    recommendedDuration: "1.5 Hours",
    popularityRank: 2,
  },
  {
    id: "alagar-kovil",
    name: "Alagar Kovil",
    role: "Temple + Mountain / Nature Excursion",
    district: "Madurai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.0742,
    longitude: 78.2136,
    category: ["Temple", "Heritage", "Nature", "Hill", "Culture"],
    description: "Nestled at the foot of Alagar Hills forest reserve. Ancient Vishnu shrine surrounded by lush green valley wilderness.",
    highlights: ["Kallazhagar Shrine Architecture", "Alagar Hills Forest Canopy", "Holy Spring Water Dip"],
    bestExperiences: ["Valley drive through Alagar forest", "Visiting sacred mountain stream", "Tasting traditional temple prasadam"],
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80",
    approxDistanceKm: 21,
    recommendedDuration: "2 Hours",
    popularityRank: 3,
  },
  {
    id: "pazhamudircholai",
    name: "Pazhamudircholai Murugan Temple",
    role: "Hill Temple + Forest Nature",
    district: "Madurai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.0911,
    longitude: 78.2173,
    category: ["Temple", "Hill", "Nature", "Forest", "Culture"],
    description: "5th Arupadai Veedu shrine located deep inside evergreen Solaimalai hill forests above Alagar Kovil.",
    highlights: ["Dense Hill Forest Drive", "Solaimalai Mountain Shrine", "Avvaiyar Rose-Apple Tree Spot"],
    bestExperiences: ["Scenic hill road trip through Solaimalai hills", "Forest walking trail", "Panoramic view of Madurai countryside"],
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80",
    approxDistanceKm: 24,
    recommendedDuration: "1.5 Hours",
    popularityRank: 4,
  },
  {
    id: "samanar-hills",
    name: "Samanar Hills",
    role: "Heritage + Hill + Viewpoint",
    district: "Madurai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.9056,
    longitude: 78.0538,
    category: ["Heritage", "Hill", "Viewpoint", "History", "Photography"],
    description: "Hill ridge in Keelakuyilkudi village featuring ancient Jain rock-cut beds, stone carvings, and panoramic sunset views over paddy fields.",
    highlights: ["Settipodavu Jain Rock Sculptures", "Pechipallam Springs", "Panoramic Sunset Over Madurai Plains"],
    bestExperiences: ["Climbing rock steps to Settipodavu caves", "Photography of 9th-century Jain bas-relief sculptures", "Sunset view over rural Madurai"],
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    approxDistanceKm: 10,
    recommendedDuration: "2 Hours",
    popularityRank: 5,
  },
  {
    id: "gandhi-museum",
    name: "Gandhi Memorial Museum",
    role: "History & Cultural Education",
    district: "Madurai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.9304,
    longitude: 78.1384,
    category: ["Museum", "History", "Culture", "Day Trips"],
    description: "Housed in the historic Tamukkam Summer Palace of Nayak queens. One of five Gandhi Museums in India with freedom movement relics.",
    highlights: ["Historic Tamukkam Palace", "Freedom Struggle Photo Gallery", "Peace Garden"],
    bestExperiences: ["Guided history walk through freedom movement gallery", "Exploring Nayak queen summer palace architecture", "Quiet walk in peace gardens"],
    image: "https://images.unsplash.com/photo-1589705298607-4e9640426b38?auto=format&fit=crop&w=1000&q=80",
    approxDistanceKm: 4,
    recommendedDuration: "1.5 Hours",
    popularityRank: 6,
  },
  {
    id: "thirumalai-mahal",
    name: "Thirumalai Nayakkar Mahal",
    role: "Palace Architecture & Heritage",
    district: "Madurai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.9158,
    longitude: 78.1232,
    category: ["Palace", "Architecture", "Heritage", "History", "Photography"],
    description: "1636 Indo-Saracenic palace built by King Thirumalai Nayak featuring massive white columns, stuccowork, and courtyard arches.",
    highlights: ["Giant White Columns (82ft high)", "Swarga Vilasam Courtyard", "Sound & Light Evening Show"],
    bestExperiences: ["Architectural photography of 82ft white columns", "Viewing celestial pavilion dome", "Evening light and sound show"],
    image: "https://images.unsplash.com/photo-1609946782701-7fa158869150?auto=format&fit=crop&w=1000&q=80",
    approxDistanceKm: 2,
    recommendedDuration: "1.5 Hours",
    popularityRank: 7,
  },
  {
    id: "vaigai-dam",
    name: "Vaigai Dam",
    role: "Day Trip Reservoir & Nature",
    district: "Theni / Madurai Border",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.0551,
    longitude: 77.591,
    category: ["Dam", "Nature", "Viewpoint", "Family", "Photography", "Day Trips"],
    description: "Massive reservoir across Vaigai River with manicured gardens, children's park, and sunset reservoir viewpoints.",
    highlights: ["Vaigai Reservoir Water View", "Landscaped Flower Gardens", "Sunset Promenade"],
    bestExperiences: ["Picnic along landscaped dam gardens", "Sunset view across Vaigai waters", "Scenic drive from Madurai"],
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    approxDistanceKm: 70,
    recommendedDuration: "Half Day",
    popularityRank: 8,
  },
  {
    id: "kumbakkarai-falls",
    name: "Kumbakkarai Falls",
    role: "Waterfall Nature Day Trip",
    district: "Theni",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.1804,
    longitude: 77.5303,
    category: ["Waterfall", "Nature", "Adventure", "Photography", "Day Trips"],
    description: "Cascading natural mountain stream flowing over granite rock formations at the foot of Kodaikanal hill slope.",
    highlights: ["Natural Rock Pool Stream", "Kodaikanal Foothill Canopy", "Cool Water Spray"],
    bestExperiences: ["Dipper pools in mountain stream", "Forest canopy photography", "Combining with Vaigai Dam day trip"],
    image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1000&q=80",
    approxDistanceKm: 85,
    recommendedDuration: "Half Day",
    popularityRank: 9,
  },
  {
    id: "sirumalai",
    name: "Sirumalai",
    role: "Offbeat Madurai Hill Escape",
    district: "Dindigul",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.1983,
    longitude: 77.9944,
    category: ["Hill", "Forest", "Nature", "Offbeat", "Road Trips"],
    description: "Quiet forest hill valley at 1,600m with 18 hairpin bends, high biodiversity, and serene mountain roads.",
    highlights: ["18 Hairpin Bend Climb", "Observation Tower View", "Quiet Hill Village Atmosphere"],
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80",
    approxDistanceKm: 48,
    recommendedDuration: "Full Day",
    popularityRank: 10,
  },
  {
    id: "thirumangalam-rural",
    name: "Thirumangalam / Rural Madurai",
    role: "Local Culture & Countryside",
    district: "Madurai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.8242,
    longitude: 77.9868,
    category: ["Local", "Food", "Culture", "Countryside"],
    description: "Experience rural Madurai agricultural life, terracotta Ayyanar horse pottery, and traditional village messes.",
    highlights: ["Terracotta Ayyanar Horse Statues", "Paddy Field Scenery", "Authentic Village Mess Meal"],
    bestExperiences: ["Exploring rural pottery workshops", "Village mess lunch on banana leaf", "Countryside photography drive"],
    image: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1000&q=80",
    approxDistanceKm: 20,
    recommendedDuration: "3 Hours",
    popularityRank: 11,
  },
];

// Dedicated Taste Madurai Food Collection
const MADURAI_FOOD_ITEMS: MaduraiFoodItem[] = [
  {
    id: "jigarthanda",
    name: "Famous Madurai Jigarthanda",
    category: "Beverage / Dessert",
    description: "Cooling legendary dessert drink made with almond gum (badam pisin), nannari syrup, condensed milk, and topped with basundi ice cream.",
    image: foodImg,
    tags: ["Legendary", "Cooling", "Sweet", "Must Try"],
  },
  {
    id: "bun-parotta",
    name: "Madurai Bun Parotta",
    category: "Street Food Specialty",
    description: "Golden-fried multi-layered fluffy dough shaped like a soft bun, crispy on the outside and pillow-soft inside, served with hot spicy salna.",
    image: foodImg,
    tags: ["Crispy", "Fluffy", "Spicy Salna", "Iconic"],
  },
  {
    id: "kari-dosa",
    name: "Madurai Kari Dosa",
    category: "Non-Veg Delicacy",
    description: "3-tiered thick dosa layered with plain batter, fluffy omelette, and topped generously with fiery minced mutton masala fry.",
    image: foodImg,
    tags: ["Minced Mutton", "3-Tier Dosa", "Fiery", "Dinner Special"],
  },
  {
    id: "soft-idli",
    name: "Madurai Soft Idli & Chutneys",
    category: "South Indian Breakfast",
    description: "Steaming, cloud-soft rice cakes served on banana leaf with coconut, tomato, coriander chutneys, and piping hot sambar.",
    image: foodImg,
    tags: ["Melt in Mouth", "Banana Leaf", "Breakfast", "Classic"],
  },
  {
    id: "breakfast-mess",
    name: "Traditional South Indian Mess Feast",
    category: "Mess Meal",
    description: "Ghee Ven Pongal, crispy Medu Vada, Podi Ghee Roast Dosa, and authentic brass-tumbler South Indian filter coffee.",
    image: foodImg,
    tags: ["Pongal & Vada", "Filter Coffee", "Ghee Roast"],
  },
  {
    id: "street-food",
    name: "Madurai Night Street Food Culture",
    category: "Night Food Walk",
    description: "Vibrant late-night street food stalls serving Kothu Parotta, Mutton Sukka, Brain Fry, and hot tea till midnight.",
    image: foodImg,
    tags: ["Late Night", "Kothu Parotta", "Street Vibe"],
  },
];

// Curated Madurai Circuits
interface MaduraiCircuit {
  id: string;
  name: string;
  description: string;
  stopIds: string[];
}

const MADURAI_CIRCUITS: MaduraiCircuit[] = [
  {
    id: "circuit-heritage",
    name: "Circuit 1 — Madurai Heritage",
    description: "Madurai → Meenakshi Amman Temple → Thirumalai Nayakkar Mahal → Gandhi Museum",
    stopIds: ["meenakshi-temple", "thirumalai-mahal", "gandhi-museum"],
  },
  {
    id: "circuit-temple-hills",
    name: "Circuit 2 — Madurai Temple & Hills",
    description: "Madurai → Thirupparankundram → Alagar Kovil → Pazhamudircholai",
    stopIds: ["thirupparankundram", "alagar-kovil", "pazhamudircholai"],
  },
  {
    id: "circuit-nature",
    name: "Circuit 3 — Madurai Nature Escape",
    description: "Madurai → Sirumalai Hill Reserve → Vaigai Dam Reservoir",
    stopIds: ["sirumalai", "vaigai-dam"],
  },
  {
    id: "circuit-waterfall",
    name: "Circuit 4 — Madurai Waterfall Escape",
    description: "Madurai → Kumbakkarai Falls Day Trip",
    stopIds: ["kumbakkarai-falls"],
  },
  {
    id: "circuit-culture-food",
    name: "Circuit 5 — Madurai Culture & Food Walk",
    description: "Madurai → Samanar Hills → Local Markets → Taste Madurai Food Walk",
    stopIds: ["samanar-hills", "thirumangalam-rural"],
  },
];

const CATEGORIES = ["All", "Heritage", "Temples", "Culture", "Food", "Hills", "Waterfalls", "Nature", "Adventure", "Day Trips"];

export function ExploreMaduraiPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCircuit, setSelectedCircuit] = useState<string>("circuit-heritage");
  const [activeDestination, setActiveDestination] = useState<MaduraiDestination>(MADURAI_DESTINATIONS[0]);
  const [selectedSort, setSelectedSort] = useState<"Recommended" | "Closest" | "Heritage" | "Nature" | "Food">("Recommended");
  const [detailModalDestination, setDetailModalDestination] = useState<MaduraiDestination | null>(null);

  const [routeMetrics, setRouteMetrics] = useState<{ distanceKm: number; durationMins: number } | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletModuleRef = useRef<any>(null);

  // Recalculate Isolated Route from Madurai Hub to Active Excursion Destination
  useEffect(() => {
    setIsCalculatingRoute(true);

    const maduraiHub = { name: "Madurai Central Hub", latitude: 9.9252, longitude: 78.1198 };
    const req = {
      requestId: `route-madurai-${activeDestination.id}-${Date.now()}`,
      origin: maduraiHub,
      destination: { name: activeDestination.name, latitude: activeDestination.latitude, longitude: activeDestination.longitude },
      travelMode: "driving" as const,
    };

    RouteApiRepository.calculateRoute(req)
      .then((res: IsolatedRouteResultDTO) => {
        setRouteMetrics({ distanceKm: res.distanceKm, durationMins: res.durationMinutes });
        if (leafletMapRef.current && leafletModuleRef.current) {
          drawRouteOnMap(maduraiHub, activeDestination, res.geometry.coordinates);
        }
      })
      .catch(() => {
        // Fallback spatial calculation
        const dLat = activeDestination.latitude - maduraiHub.latitude;
        const dLng = activeDestination.longitude - maduraiHub.longitude;
        const approxKm = Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 110 * 1.3);
        setRouteMetrics({ distanceKm: approxKm, durationMins: Math.round((approxKm / 35) * 60) });
        if (leafletMapRef.current && leafletModuleRef.current) {
          drawFallbackMap(maduraiHub, activeDestination);
        }
      })
      .finally(() => setIsCalculatingRoute(false));
  }, [activeDestination]);

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
        center: [9.9252, 78.1198],
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

    initMap();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  const drawRouteOnMap = (hub: { name: string; latitude: number; longitude: number }, dest: MaduraiDestination, coordinates: number[][]) => {
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

    // Madurai Hub Pin
    const hubIcon = L.divIcon({
      className: "madurai-hub-pin",
      html: `<div style="background: #3b82f6; color: #fff; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 9999px; border: 2px solid #fff; box-shadow: 0 6px 18px rgba(0,0,0,0.5); white-space: nowrap; font-family: sans-serif;">📍 Hub: Madurai</div>`,
      iconSize: [120, 28],
      iconAnchor: [60, 14],
    });
    L.marker([hub.latitude, hub.longitude], { icon: hubIcon }).addTo(map);

    // Destination Pin
    const destIcon = L.divIcon({
      className: "madurai-dest-pin",
      html: `<div style="background: #10b981; color: #000; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 9999px; border: 2px solid #fff; box-shadow: 0 6px 18px rgba(0,0,0,0.5); white-space: nowrap; font-family: sans-serif;">🎯 ${dest.name}</div>`,
      iconSize: [140, 28],
      iconAnchor: [70, 14],
    });
    L.marker([dest.latitude, dest.longitude], { icon: destIcon }).addTo(map);
  };

  const drawFallbackMap = (hub: { name: string; latitude: number; longitude: number }, dest: MaduraiDestination) => {
    const map = leafletMapRef.current;
    const L = leafletModuleRef.current;
    if (!map || !L) return;

    const points: [number, number][] = [
      [hub.latitude, hub.longitude],
      [dest.latitude, dest.longitude],
    ];
    const polyline = L.polyline(points, { color: "#10b981", weight: 3, opacity: 0.8, dashArray: "6, 6" }).addTo(map);
    map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
  };

  // Filter & Sort
  const filteredDestinations = MADURAI_DESTINATIONS.filter((item) => {
    if (selectedCategory === "All") return true;
    if (selectedCategory === "Temples") return item.category.includes("Temple");
    return item.category.includes(selectedCategory);
  }).sort((a, b) => {
    if (selectedSort === "Closest") return (a.approxDistanceKm || 0) - (b.approxDistanceKm || 0);
    if (selectedSort === "Heritage") return a.category.includes("Heritage") ? -1 : 1;
    if (selectedSort === "Nature") return a.category.includes("Nature") ? -1 : 1;
    if (selectedSort === "Food") return a.category.includes("Food") ? -1 : 1;
    return a.popularityRank - b.popularityRank;
  });

  const handlePlanTrip = (dest: MaduraiDestination) => {
    const promptText = `Plan a trip from Madurai to ${dest.name}, Tamil Nadu.`;
    navigate({ to: "/planner", search: { prompt: promptText } });
  };

  return (
    <AppShell>
      {/* Hero Header */}
      <PageHeader
        eyebrow="MADURAI · TAMIL NADU"
        title="Explore Madurai"
        description="Temples, ancient heritage, local food, hills, waterfalls and unforgettable day trips from the heart of Tamil Nadu."
      />

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        {/* Curated Madurai Circuits */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-elevate mb-8">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2 text-primary font-mono text-xs font-semibold uppercase tracking-wider">
              <Compass className="size-4 text-primary" />
              <span>Curated Madurai Circuits</span>
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
            {MADURAI_CIRCUITS.map((circuit) => {
              const isSelected = selectedCircuit === circuit.id;
              return (
                <button
                  key={circuit.id}
                  type="button"
                  onClick={() => {
                    setSelectedCircuit(circuit.id);
                    const firstStop = MADURAI_DESTINATIONS.find((d) => d.id === circuit.stopIds[0]);
                    if (firstStop) setActiveDestination(firstStop);
                  }}
                  className={`text-left p-3.5 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? "bg-primary/15 border-primary text-foreground shadow-sm"
                      : "bg-secondary/60 border-border/80 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <p className="text-xs font-bold text-foreground mb-1">{circuit.name}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{circuit.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hub-and-Spoke Interactive Map */}
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-elevate mb-10">
          <div className="flex items-center justify-between p-4 border-b border-border bg-card/60">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider font-mono">
              <Navigation className="size-4 text-primary" />
              <span>Hub-and-Spoke Route: Madurai → {activeDestination.name}</span>
            </div>
            <span className="text-[10px] font-mono text-primary px-2.5 py-0.5 bg-primary/10 rounded-full border border-primary/20 font-semibold">
              Isolated Route Engine
            </span>
          </div>

          <div className="relative h-[360px] sm:h-[440px] w-full bg-background">
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />
          </div>
        </div>

        {/* Category Filters & Sort Controls */}
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
              <option value="Recommended">Recommended</option>
              <option value="Closest">Closest Distance</option>
              <option value="Heritage">Heritage First</option>
              <option value="Nature">Nature First</option>
              <option value="Food">Food Special</option>
            </select>
          </div>
        </div>

        {/* 11 Destination Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-14">
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
                <div
                  onClick={() => setDetailModalDestination(dest)}
                  className="relative h-48 w-full overflow-hidden bg-secondary cursor-pointer"
                >
                  <img
                    src={dest.image}
                    alt={dest.name}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = templesImg;
                    }}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {dest.category.slice(0, 2).map((c) => (
                      <span
                        key={c}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-background/80 backdrop-blur-md text-primary border border-primary/20"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col p-5">
                  <h3
                    onClick={() => setDetailModalDestination(dest)}
                    className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-0.5 cursor-pointer"
                  >
                    {dest.name}
                  </h3>
                  <p className="text-[11px] text-primary font-mono font-semibold mb-2">
                    {dest.role} · {dest.approxDistanceKm === 0 ? "In City Center" : `~${dest.approxDistanceKm} km from Madurai`}
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

        {/* Dedicated "Taste Madurai" Food Section */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-elevate mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">CULINARY CAPITAL</span>
              <h2 className="font-display text-2xl font-bold text-foreground">Taste Madurai</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Legendary street foods, Jigarthanda, Bun Parotta, Kari Dosa, and melt-in-mouth soft idlis.
              </p>
            </div>
            <Utensils className="size-6 text-primary hidden sm:block" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MADURAI_FOOD_ITEMS.map((food) => (
              <div key={food.id} className="rounded-2xl border border-border/80 bg-secondary/50 p-4 transition hover:border-primary/30">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-display text-sm font-bold text-foreground">{food.name}</h4>
                  <span className="text-[10px] font-mono text-primary px-2 py-0.5 bg-primary/10 rounded-full border border-primary/20">
                    {food.category}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{food.description}</p>
                <div className="flex flex-wrap gap-1">
                  {food.tags.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-card border border-border text-muted-foreground">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Footer Banner */}
        <div className="rounded-3xl border border-primary/30 bg-primary/10 p-6 sm:p-10 text-center backdrop-blur-md">
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">
            Ready to explore Madurai heritage & nature?
          </h3>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-6">
            Get instant road directions, temple timings guidance, food walk stops, and customized itineraries with AI Trip Copilot.
          </p>
          <Button
            size="lg"
            onClick={() =>
              navigate({
                to: "/planner",
                search: {
                  prompt:
                    "Plan a 2-day Madurai heritage and food trip covering Meenakshi Amman Temple, Thirumalai Nayakkar Mahal, Thirupparankundram, Alagar Kovil and Jigarthanda food walk.",
                },
              })
            }
            className="rounded-2xl bg-primary text-primary-foreground font-bold px-8 py-6 shadow-lg hover:bg-primary/90 transition text-sm"
          >
            <Sparkles className="size-5 mr-2" /> Plan Complete Madurai Trip with AI Copilot
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
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setDetailModalDestination(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-secondary text-muted-foreground hover:text-foreground cursor-pointer z-10"
              >
                <X className="size-5" />
              </button>

              {/* Modal Banner */}
              <div className="relative h-56 w-full rounded-2xl overflow-hidden mb-5 bg-secondary">
                <img
                  src={detailModalDestination.image}
                  alt={detailModalDestination.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {detailModalDestination.category.map((c) => (
                      <span key={c} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                        {c}
                      </span>
                    ))}
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">{detailModalDestination.name}</h2>
                  <p className="text-xs text-primary font-mono font-semibold">{detailModalDestination.role}</p>
                </div>
              </div>

              {/* Modal Body */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wider font-semibold mb-1">About Destination</h4>
                  <p className="text-xs text-foreground leading-relaxed">{detailModalDestination.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-secondary/50 p-3.5 rounded-2xl border border-border/80">
                  <div>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">Distance from Madurai</span>
                    <p className="text-xs font-bold text-primary">
                      {detailModalDestination.approxDistanceKm === 0 ? "In City Center" : `~${detailModalDestination.approxDistanceKm} km`}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">Recommended Duration</span>
                    <p className="text-xs font-bold text-foreground">{detailModalDestination.recommendedDuration}</p>
                  </div>
                </div>

                {/* Highlights & Best Experiences */}
                <div>
                  <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wider font-semibold mb-2">Key Highlights</h4>
                  <div className="space-y-1.5">
                    {detailModalDestination.highlights.map((h) => (
                      <div key={h} className="text-xs text-foreground flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {detailModalDestination.bestExperiences && detailModalDestination.bestExperiences.length > 0 && (
                  <div>
                    <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wider font-semibold mb-2">Best Experiences</h4>
                    <div className="space-y-1.5">
                      {detailModalDestination.bestExperiences.map((exp) => (
                        <div key={exp} className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="size-1.5 rounded-full bg-primary shrink-0" />
                          <span>{exp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActiveDestination(detailModalDestination);
                      setDetailModalDestination(null);
                      window.scrollTo({ top: 350, behavior: "smooth" });
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
