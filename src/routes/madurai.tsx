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
  CheckCircle2,
  Eye,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import { RouteApiRepository, IsolatedRouteResultDTO } from "@/lib/api-client/routes";
import foodImg from "@/assets/cat-food.jpg";
import templesImg from "@/assets/cat-temples.jpg";

export const Route = createFileRoute("/madurai")({
  head: () => ({
    meta: [
      { title: "Explore Madurai — Temples, Tourist Places & Taste Madurai | ExplorerTN" },
      {
        name: "description",
        content:
          "Discover Meenakshi Amman Temple, Thirupparankundram, Alagar Kovil, Pazhamudircholai, Thirumalai Nayakkar Mahal, Gandhi Museum, Samanar Hills, Vandiyur Teppakulam, Vaigai River, Jigarthanda and Madurai food.",
      },
      { property: "og:title", content: "Explore Madurai — ExplorerTN" },
      {
        property: "og:description",
        content:
          "Dedicated Madurai city guide covering ancient temples, historic landmarks, iconic local street food, interactive map, and AI Trip Planner integration.",
      },
    ],
  }),
  component: ExploreMaduraiPage,
});

export interface MaduraiPlace {
  id: string;
  name: string;
  category: "Temple" | "Tourist Place";
  subCategory: string;
  district: "Madurai";
  state: "Tamil Nadu";
  country: "India";
  latitude: number;
  longitude: number;
  description: string;
  highlights: string[];
  image: string;
  recommendedDuration: string;
  approxDistanceKm: number;
}

export interface MaduraiFoodItem {
  id: string;
  name: string;
  category: string;
  subTag: string;
  description: string;
  image: string;
  tags: string[];
}

// Category 1: Madurai Temples (4 Cards)
const MADURAI_TEMPLES: MaduraiPlace[] = [
  {
    id: "meenakshi-temple",
    name: "Meenakshi Amman Temple",
    category: "Temple",
    subCategory: "Temple · Heritage",
    district: "Madurai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.9195,
    longitude: 78.1193,
    description:
      "World-famous Dravidian architectural marvel featuring 14 multi-tiered painted gopurams, 1,000-pillar hall, and Golden Lotus tank.",
    highlights: ["14 Soaring Multi-Tiered Gopurams", "Historic 1,000-Pillar Sculpted Hall", "Golden Lotus Sacred Tank"],
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
    recommendedDuration: "2–3 Hours",
    approxDistanceKm: 0,
  },
  {
    id: "thirupparankundram",
    name: "Thirupparankundram Murugan Temple",
    category: "Temple",
    subCategory: "Temple · Heritage",
    district: "Madurai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.8797,
    longitude: 78.071,
    description:
      "6th-century rock-cut cave temple carved into a massive granite hill celebrating the celestial wedding of Lord Murugan.",
    highlights: ["Historic Rock-Cut Cave Shrine", "Ancient Granite Hill Surroundings", "Sacred Murugan Heritage"],
    image: "https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80",
    recommendedDuration: "1.5 Hours",
    approxDistanceKm: 8,
  },
  {
    id: "alagar-kovil",
    name: "Alagar Kovil",
    category: "Temple",
    subCategory: "Temple · Heritage · Nature",
    district: "Madurai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.0742,
    longitude: 78.2136,
    description:
      "Historic Vishnu temple situated at the foot of Alagar Hills forest reserve, renowned for intricate stone carvings and natural scenery.",
    highlights: ["Kallazhagar Historic Vishnu Shrine", "Alagar Hills Forest Canopy", "Scenic Valley Surroundings"],
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80",
    recommendedDuration: "2 Hours",
    approxDistanceKm: 21,
  },
  {
    id: "pazhamudircholai",
    name: "Pazhamudircholai",
    category: "Temple",
    subCategory: "Temple · Hill",
    district: "Madurai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.0911,
    longitude: 78.2173,
    description:
      "5th Arupadai Veedu Murugan shrine nestled inside evergreen hill forests above Alagar Kovil along a scenic winding mountain road.",
    highlights: ["Forested Hill Surroundings", "Solaimalai Mountain Shrine", "Scenic Mountain Route"],
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80",
    recommendedDuration: "1.5 Hours",
    approxDistanceKm: 24,
  },
];

// Category 2: Madurai Tourist Places (5 Cards)
const MADURAI_TOURIST_PLACES: MaduraiPlace[] = [
  {
    id: "thirumalai-mahal",
    name: "Thirumalai Nayakkar Mahal",
    category: "Tourist Place",
    subCategory: "Palace · Heritage · Architecture",
    district: "Madurai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.9158,
    longitude: 78.1232,
    description:
      "1636 Indo-Saracenic palace constructed by King Thirumalai Nayak featuring massive 82ft white pillars, stuccowork, and courtyard arches.",
    highlights: ["Grand Indo-Saracenic Architecture", "82ft Massive White Columns", "Swarga Vilasam Courtyard"],
    image: "https://images.unsplash.com/photo-1609946782701-7fa158869150?auto=format&fit=crop&w=1000&q=80",
    recommendedDuration: "1.5 Hours",
    approxDistanceKm: 2,
  },
  {
    id: "gandhi-museum",
    name: "Gandhi Memorial Museum",
    category: "Tourist Place",
    subCategory: "Museum · History · Culture",
    district: "Madurai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.9304,
    longitude: 78.1384,
    description:
      "Housed in the historic Tamukkam Summer Palace of Nayak queens. One of five Gandhi Museums in India with freedom movement exhibits.",
    highlights: ["Historical Freedom Struggle Exhibits", "17th-Century Tamukkam Palace", "Peace Garden Walk"],
    image: "https://images.unsplash.com/photo-1589705298607-4e9640426b38?auto=format&fit=crop&w=1000&q=80",
    recommendedDuration: "1.5 Hours",
    approxDistanceKm: 4,
  },
  {
    id: "samanar-hills",
    name: "Samanar Hills",
    category: "Tourist Place",
    subCategory: "Heritage · Viewpoint · History",
    district: "Madurai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.9056,
    longitude: 78.0538,
    description:
      "Rock hill complex in Keelakuyilkudi village containing 9th-century Jain rock-cut beds, stone carvings, and sweeping views of Madurai.",
    highlights: ["Ancient Jain Rock-Cut Reliefs", "Scenic Hilltop Viewpoint", "Sunset Over Madurai Plains"],
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    recommendedDuration: "2 Hours",
    approxDistanceKm: 10,
  },
  {
    id: "vandiyur-teppakulam",
    name: "Vandiyur Mariamman Teppakulam",
    category: "Tourist Place",
    subCategory: "Landmark · Heritage · Photography",
    district: "Madurai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.9133,
    longitude: 78.1517,
    description:
      "Massive 16-acre square temple tank built in 1645 by King Thirumalai Nayak, featuring central Maiya Mandapam island pavilion.",
    highlights: ["16-Acre Massive Temple Tank", "Central Island Maiya Mandapam", "Evening Atmospheric Vibe"],
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    recommendedDuration: "1 Hour",
    approxDistanceKm: 4,
  },
  {
    id: "vaigai-riverfront",
    name: "Vaigai River / Vaigai Riverfront",
    category: "Tourist Place",
    subCategory: "City · Nature · Photography",
    district: "Madurai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.9280,
    longitude: 78.1220,
    description:
      "Historic river corridor flowing through central Madurai, offering city bridge viewpoints and authentic local Madurai atmosphere.",
    highlights: ["Vaigai River City Corridor", "Bridge Photography Vistas", "Local Madurai Urban Vibe"],
    image: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1000&q=80",
    recommendedDuration: "1 Hour",
    approxDistanceKm: 1,
  },
];

// Category 3: Taste Madurai Food Cards (7 Cards)
const TASTE_MADURAI_FOOD: MaduraiFoodItem[] = [
  {
    id: "jigarthanda",
    name: "Jigarthanda",
    category: "Drink · Local Specialty",
    subTag: "Madurai Specialty",
    description:
      "Cooling legendary dessert drink made with badam pisin (almond gum), nannari syrup, condensed milk, and topped with basundi ice cream.",
    image: foodImg,
    tags: ["Legendary", "Cooling", "Sweet", "Iconic"],
  },
  {
    id: "kari-dosa",
    name: "Kari Dosa",
    category: "Food · Local Specialty",
    subTag: "Madurai Specialty",
    description:
      "3-tiered thick dosa layered with crisp batter, fluffy egg omelette, and topped generously with fiery minced mutton masala fry.",
    image: foodImg,
    tags: ["Minced Mutton", "3-Tier Dosa", "Spicy", "Dinner Special"],
  },
  {
    id: "madurai-parotta",
    name: "Madurai Parotta",
    category: "Street Food · Local Specialty",
    subTag: "Madurai Specialty",
    description:
      "Multi-layered flaky golden parotta kneaded and beaten on marble slabs, served piping hot with spicy non-veg or veg salna.",
    image: foodImg,
    tags: ["Flaky", "Golden", "Spicy Salna", "Street Favorite"],
  },
  {
    id: "idli",
    name: "Idli",
    category: "Breakfast · South Indian",
    subTag: "Madurai Specialty",
    description:
      "Steaming cloud-soft rice cakes served on fresh banana leaf with coconut, coriander, tomato chutneys, and hot sambar.",
    image: foodImg,
    tags: ["Melt in Mouth", "Banana Leaf", "Breakfast Classic"],
  },
  {
    id: "kothu-parotta",
    name: "Kothu Parotta",
    category: "Street Food",
    description:
      "Shredded parotta minced on hot iron griddle with eggs, chicken or mutton gravy, onions, and aromatic South Indian spices.",
    image: foodImg,
    tags: ["Minced Parotta", "Iron Griddle", "Late Night"],
  },
  {
    id: "bun-parotta",
    name: "Bun Parotta",
    category: "Local Specialty",
    subTag: "Madurai Specialty",
    description:
      "Deep-fried soft bun-shaped parotta, crispy golden on the outside and pillow-soft inside, paired with rich mutton gravy.",
    image: foodImg,
    tags: ["Crispy", "Pillow Soft", "Unique Texture"],
  },
  {
    id: "street-food",
    name: "Madurai Street Food",
    category: "Street Food · Local Experience",
    subTag: "Madurai Experience",
    description:
      "Vibrant street food discovery around Meenakshi temple and Town Hall Road serving Mutton Sukka, Brain Fry, and hot tea.",
    image: foodImg,
    tags: ["Late Night Walk", "Authentic Eats", "Town Hall Road"],
  },
];

export function ExploreMaduraiPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"temples" | "tourist-places" | "food">("temples");
  const [selectedPlace, setSelectedPlace] = useState<MaduraiPlace>(MADURAI_TEMPLES[0]);
  const [detailModalPlace, setDetailModalPlace] = useState<MaduraiPlace | null>(null);

  const [routeMetrics, setRouteMetrics] = useState<{ distanceKm: number; durationMins: number } | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletModuleRef = useRef<any>(null);

  const templesSectionRef = useRef<HTMLDivElement>(null);
  const touristPlacesSectionRef = useRef<HTMLDivElement>(null);
  const foodSectionRef = useRef<HTMLDivElement>(null);

  // Recalculate Isolated Route from Madurai Central Hub to Selected Place
  useEffect(() => {
    setIsCalculatingRoute(true);

    const maduraiHub = { name: "Madurai Central Hub", latitude: 9.9252, longitude: 78.1198 };
    const req = {
      requestId: `route-madurai-city-${selectedPlace.id}-${Date.now()}`,
      origin: maduraiHub,
      destination: { name: selectedPlace.name, latitude: selectedPlace.latitude, longitude: selectedPlace.longitude },
      travelMode: "driving" as const,
    };

    RouteApiRepository.calculateRoute(req)
      .then((res: IsolatedRouteResultDTO) => {
        setRouteMetrics({ distanceKm: res.distanceKm, durationMins: res.durationMinutes });
        if (leafletMapRef.current && leafletModuleRef.current) {
          drawRouteOnMap(maduraiHub, selectedPlace, res.geometry.coordinates);
        }
      })
      .catch(() => {
        // Fallback spatial calculation
        const dLat = selectedPlace.latitude - maduraiHub.latitude;
        const dLng = selectedPlace.longitude - maduraiHub.longitude;
        const approxKm = Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 110 * 1.2);
        setRouteMetrics({ distanceKm: approxKm, durationMins: Math.round((approxKm / 30) * 60) });
        if (leafletMapRef.current && leafletModuleRef.current) {
          drawFallbackMap(maduraiHub, selectedPlace);
        }
      })
      .finally(() => setIsCalculatingRoute(false));
  }, [selectedPlace]);

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
        zoom: 11,
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

  const drawRouteOnMap = (hub: { name: string; latitude: number; longitude: number }, place: MaduraiPlace, coordinates: number[][]) => {
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

    // Madurai Central Hub Pin
    const hubIcon = L.divIcon({
      className: "madurai-city-hub-pin",
      html: `<div style="background: #3b82f6; color: #fff; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 9999px; border: 2px solid #fff; box-shadow: 0 6px 18px rgba(0,0,0,0.5); white-space: nowrap; font-family: sans-serif;">📍 Madurai City</div>`,
      iconSize: [120, 28],
      iconAnchor: [60, 14],
    });
    L.marker([hub.latitude, hub.longitude], { icon: hubIcon }).addTo(map);

    // Selected Place Pin
    const placeIcon = L.divIcon({
      className: "madurai-place-pin",
      html: `<div style="background: #10b981; color: #000; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 9999px; border: 2px solid #fff; box-shadow: 0 6px 18px rgba(0,0,0,0.5); white-space: nowrap; font-family: sans-serif;">🎯 ${place.name}</div>`,
      iconSize: [140, 28],
      iconAnchor: [70, 14],
    });
    L.marker([place.latitude, place.longitude], { icon: placeIcon }).addTo(map);
  };

  const drawFallbackMap = (hub: { name: string; latitude: number; longitude: number }, place: MaduraiPlace) => {
    const map = leafletMapRef.current;
    const L = leafletModuleRef.current;
    if (!map || !L) return;

    const points: [number, number][] = [
      [hub.latitude, hub.longitude],
      [place.latitude, place.longitude],
    ];
    const polyline = L.polyline(points, { color: "#10b981", weight: 3, opacity: 0.8, dashArray: "6, 6" }).addTo(map);
    map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
  };

  const scrollToTab = (tab: "temples" | "tourist-places" | "food") => {
    setActiveTab(tab);
    if (tab === "temples" && templesSectionRef.current) {
      templesSectionRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (tab === "tourist-places" && touristPlacesSectionRef.current) {
      touristPlacesSectionRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (tab === "food" && foodSectionRef.current) {
      foodSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePlanVisit = (place: MaduraiPlace) => {
    const promptText = `Plan a Madurai trip visit to ${place.name}, Tamil Nadu.`;
    navigate({ to: "/planner", search: { prompt: promptText } });
  };

  const handlePlanFoodTour = (food: MaduraiFoodItem) => {
    const promptText = `Plan a Madurai food tour featuring ${food.name}.`;
    navigate({ to: "/planner", search: { prompt: promptText } });
  };

  return (
    <AppShell>
      {/* Hero Header */}
      <PageHeader
        eyebrow="MADURAI, TAMIL NADU, INDIA"
        title="Explore Madurai"
        description="Ancient temples, historic landmarks and the iconic flavors of Madurai."
      />

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        {/* Category Navigation Tabs */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[
            { id: "temples", label: "🛕 Temples" },
            { id: "tourist-places", label: "📍 Tourist Places" },
            { id: "food", label: "🍽️ Taste Madurai" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => scrollToTab(t.id as any)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer border ${
                activeTab === t.id
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-card border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Interactive Madurai City Map */}
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-elevate mb-12">
          <div className="flex items-center justify-between p-4 border-b border-border bg-card/60">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider font-mono">
              <Navigation className="size-4 text-primary" />
              <span>Madurai Route: City Hub → {selectedPlace.name}</span>
            </div>
            {routeMetrics && (
              <div className="text-xs font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                {routeMetrics.distanceKm === 0 ? "In City Center" : `${routeMetrics.distanceKm} km · Est: ${routeMetrics.durationMins} mins`}
              </div>
            )}
          </div>

          <div className="relative h-[340px] sm:h-[400px] w-full bg-background">
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />
          </div>
        </div>

        {/* SECTION 1: TEMPLES */}
        <div ref={templesSectionRef} className="mb-14 scroll-mt-24">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xl">🛕</span>
            <h2 className="font-display text-2xl font-bold text-foreground">Madurai Temples</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {MADURAI_TEMPLES.map((temple) => {
              const isSelected = selectedPlace.id === temple.id;
              return (
                <motion.div
                  key={temple.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                  className={`flex flex-col rounded-3xl border bg-card overflow-hidden shadow-elevate transition group ${
                    isSelected ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/40"
                  }`}
                >
                  <div
                    onClick={() => setDetailModalPlace(temple)}
                    className="relative h-44 w-full overflow-hidden bg-secondary cursor-pointer"
                  >
                    <img
                      src={temple.image}
                      alt={temple.name}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = templesImg;
                      }}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-background/80 backdrop-blur-md text-primary border border-primary/20">
                        {temple.subCategory}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <h3
                      onClick={() => setDetailModalPlace(temple)}
                      className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors mb-1 cursor-pointer"
                    >
                      {temple.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mb-3 flex-1 line-clamp-2">
                      {temple.description}
                    </p>

                    <div className="space-y-1 mb-4">
                      {temple.highlights.slice(0, 2).map((h) => (
                        <div key={h} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <span className="size-1 rounded-full bg-primary" />
                          <span className="truncate">{h}</span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-auto pt-3 border-t border-border/60">
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedPlace(temple);
                          window.scrollTo({ top: 250, behavior: "smooth" });
                        }}
                        className={`rounded-xl text-xs font-semibold ${
                          isSelected ? "bg-primary text-primary-foreground" : "border-border hover:bg-secondary"
                        }`}
                      >
                        <RouteIcon className="size-3 mr-1" /> Explore
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handlePlanVisit(temple)}
                        className="rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border"
                      >
                        <Sparkles className="size-3 mr-1" /> Plan Visit
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: TOURIST PLACES */}
        <div ref={touristPlacesSectionRef} className="mb-14 scroll-mt-24">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xl">📍</span>
            <h2 className="font-display text-2xl font-bold text-foreground">Madurai Tourist Places</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {MADURAI_TOURIST_PLACES.map((place) => {
              const isSelected = selectedPlace.id === place.id;
              return (
                <motion.div
                  key={place.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                  className={`flex flex-col rounded-3xl border bg-card overflow-hidden shadow-elevate transition group ${
                    isSelected ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/40"
                  }`}
                >
                  <div
                    onClick={() => setDetailModalPlace(place)}
                    className="relative h-48 w-full overflow-hidden bg-secondary cursor-pointer"
                  >
                    <img
                      src={place.image}
                      alt={place.name}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = templesImg;
                      }}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-background/80 backdrop-blur-md text-primary border border-primary/20">
                        {place.subCategory}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3
                      onClick={() => setDetailModalPlace(place)}
                      className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-1 cursor-pointer"
                    >
                      {place.name}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">
                      {place.description}
                    </p>

                    <div className="space-y-1 mb-4">
                      {place.highlights.map((h) => (
                        <div key={h} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <span className="size-1 rounded-full bg-primary" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-auto pt-3 border-t border-border/60">
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedPlace(place);
                          window.scrollTo({ top: 250, behavior: "smooth" });
                        }}
                        className={`rounded-xl text-xs font-semibold ${
                          isSelected ? "bg-primary text-primary-foreground" : "border-border hover:bg-secondary"
                        }`}
                      >
                        <RouteIcon className="size-3.5 mr-1" /> Explore
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handlePlanVisit(place)}
                        className="rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border"
                      >
                        <Sparkles className="size-3.5 mr-1" /> Plan Visit
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: TASTE MADURAI */}
        <div ref={foodSectionRef} className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-elevate mb-12 scroll-mt-24">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">ICONIC FLAVORS</span>
              <h2 className="font-display text-2xl font-bold text-foreground">Taste Madurai</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Legendary street foods, Jigarthanda, Bun Parotta, Kari Dosa, and soft idlis.
              </p>
            </div>
            <Utensils className="size-6 text-primary hidden sm:block" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TASTE_MADURAI_FOOD.map((food) => (
              <div key={food.id} className="flex flex-col rounded-2xl border border-border/80 bg-secondary/50 p-4 transition hover:border-primary/30">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-display text-base font-bold text-foreground">{food.name}</h4>
                  <span className="text-[10px] font-mono text-primary px-2 py-0.5 bg-primary/10 rounded-full border border-primary/20">
                    {food.category}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3 flex-1">{food.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-auto">
                  <div className="flex flex-wrap gap-1">
                    {food.tags.slice(0, 2).map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-card border border-border text-muted-foreground">
                        #{t}
                      </span>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handlePlanFoodTour(food)}
                    className="rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Sparkles className="size-3 mr-1" /> Discover
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Footer Banner */}
        <div className="rounded-3xl border border-primary/30 bg-primary/10 p-6 sm:p-10 text-center backdrop-blur-md">
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">
            Ready to experience Madurai city & food?
          </h3>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-6">
            Get instant temple directions, heritage walking routes, street food stops, and customized itineraries with AI Trip Copilot.
          </p>
          <Button
            size="lg"
            onClick={() =>
              navigate({
                to: "/planner",
                search: {
                  prompt:
                    "Plan a Madurai city trip covering Meenakshi Amman Temple, Thirumalai Nayakkar Mahal, Gandhi Museum, and a Jigarthanda & Kari Dosa food tour.",
                },
              })
            }
            className="rounded-2xl bg-primary text-primary-foreground font-bold px-8 py-6 shadow-lg hover:bg-primary/90 transition text-sm"
          >
            <Sparkles className="size-5 mr-2" /> Plan Madurai City Trip with AI Copilot
          </Button>
        </div>
      </div>

      {/* Place Detail Modal */}
      <AnimatePresence>
        {detailModalPlace && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card shadow-2xl p-6 text-foreground"
            >
              <button
                type="button"
                onClick={() => setDetailModalPlace(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-secondary text-muted-foreground hover:text-foreground cursor-pointer z-10"
              >
                <X className="size-5" />
              </button>

              <div className="relative h-56 w-full rounded-2xl overflow-hidden mb-5 bg-secondary">
                <img
                  src={detailModalPlace.image}
                  alt={detailModalPlace.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground mb-2 inline-block">
                    {detailModalPlace.subCategory}
                  </span>
                  <h2 className="font-display text-2xl font-bold text-foreground">{detailModalPlace.name}</h2>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wider font-semibold mb-1">About Destination</h4>
                  <p className="text-xs text-foreground leading-relaxed">{detailModalPlace.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-secondary/50 p-3.5 rounded-2xl border border-border/80">
                  <div>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">Distance from City Center</span>
                    <p className="text-xs font-bold text-primary">
                      {detailModalPlace.approxDistanceKm === 0 ? "In City Center" : `~${detailModalPlace.approxDistanceKm} km`}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">Recommended Duration</span>
                    <p className="text-xs font-bold text-foreground">{detailModalPlace.recommendedDuration}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wider font-semibold mb-2">Key Highlights</h4>
                  <div className="space-y-1.5">
                    {detailModalPlace.highlights.map((h) => (
                      <div key={h} className="text-xs text-foreground flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedPlace(detailModalPlace);
                      setDetailModalPlace(null);
                      window.scrollTo({ top: 250, behavior: "smooth" });
                    }}
                    className="rounded-xl text-xs font-semibold border-border hover:bg-secondary"
                  >
                    <RouteIcon className="size-3.5 mr-1" /> Explore Route
                  </Button>
                  <Button
                    onClick={() => {
                      const place = detailModalPlace;
                      setDetailModalPlace(null);
                      handlePlanVisit(place);
                    }}
                    className="rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Sparkles className="size-3.5 mr-1" /> Plan Visit with AI
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
