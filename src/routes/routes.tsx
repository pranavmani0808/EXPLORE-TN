import { useState, useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Fuel, Clock, Utensils, Camera, CloudSun, MapPin, Sparkles, Navigation, RefreshCw, ArrowRight, ShieldCheck, Compass } from "lucide-react";
import { AppShell, PageHeader } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-ghats.jpg";
import waterfallsImg from "@/assets/cat-waterfalls.jpg";
import templesImg from "@/assets/cat-temples.jpg";
import routesImg from "@/assets/cat-routes.jpg";
import foodImg from "@/assets/cat-food.jpg";
import beachesImg from "@/assets/cat-beaches.jpg";
import campingImg from "@/assets/cat-camping.jpg";

export const Route = createFileRoute("/routes")({
  head: () => ({
    meta: [
      { title: "Route Explorer & Planner — ExplorerTN" },
      {
        name: "description",
        content:
          "Generate custom scenic routes across Tamil Nadu. Select start and destination to build instant stop-by-stop itineraries with distance, fuel, food and photo tips.",
      },
    ],
  }),
  component: RoutesPage,
});

type OriginCity = "Chennai" | "Coimbatore" | "Madurai" | "Trichy" | "Salem" | "Tirunelveli" | "Pondicherry";
type DestinationCity = "Kodaikanal" | "Ooty" | "Valparai" | "Kolli Hills" | "Dhanushkodi" | "Yercaud" | "Meghamalai" | "Courtallam";

interface RouteStopDetail {
  name: string;
  description: string;
  distance: string;
  time: string;
  fuel: string;
  food: string;
  tip: string;
  weather: string;
  image: string;
  coords: [number, number]; // [lat, lng]
}

interface CustomRouteData {
  slug: string;
  name: string;
  summary: string;
  totalDistance: string;
  totalTime: string;
  fuelEstimate: string;
  bestSeason: string;
  stops: RouteStopDetail[];
}

const ORIGINS: OriginCity[] = ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Tirunelveli", "Pondicherry"];
const DESTINATIONS: DestinationCity[] = ["Kodaikanal", "Ooty", "Valparai", "Kolli Hills", "Dhanushkodi", "Yercaud", "Meghamalai", "Courtallam"];

// Curated Route Presets
const ROUTE_PRESETS: Record<string, CustomRouteData> = {
  "Chennai-Kodaikanal": {
    slug: "chennai-kodaikanal",
    name: "Chennai → Kodaikanal Ghat Run",
    summary: "520 km of Chola temple towns, 20 hairpin curves, and misty cloud forests.",
    totalDistance: "520 km",
    totalTime: "11 h riding",
    fuelEstimate: "₹2,450",
    bestSeason: "Oct – Mar",
    stops: [
      {
        name: "Chennai — Start",
        description: "Roll out before 5 AM to clear GST road and catch sunrise.",
        distance: "0 km",
        time: "04:45 AM",
        fuel: "Full tank",
        food: "Saravana Bhavan pongal",
        tip: "Shoot the empty flyovers in blue hour",
        weather: "26°C · Clear",
        image: heroImg,
        coords: [13.0827, 80.2707],
      },
      {
        name: "Thanjavur — Chola Country",
        description: "Break at Brihadeeswarar temple while the granite is still cool.",
        distance: "348 km",
        time: "10:30 AM",
        fuel: "₹1,180 used",
        food: "Sathars biryani",
        tip: "East face, low angle, 35mm lens",
        weather: "31°C · Sunny",
        image: templesImg,
        coords: [10.7870, 79.1378],
      },
      {
        name: "Dindigul — Plains Halt",
        description: "Last flat stretch. Top up fuel, check tyre pressure before the climb.",
        distance: "444 km",
        time: "02:00 PM",
        fuel: "Top up ₹520",
        food: "Dindigul Thalappakatti",
        tip: "Check brake pads here",
        weather: "33°C · Hot",
        image: foodImg,
        coords: [10.3673, 77.9803],
      },
      {
        name: "Batlagundu Ghat Road — 20 Hairpins",
        description: "The climb into the Palani Hills. Cool air hits around hairpin 12.",
        distance: "492 km",
        time: "04:10 PM",
        fuel: "—",
        food: "Silver Cascade tea stall",
        tip: "Pull into the designated bays, never blind corners",
        weather: "21°C · Misty",
        image: routesImg,
        coords: [10.2644, 77.5813],
      },
      {
        name: "Kodaikanal — Cloud Line",
        description: "Arrive before dusk, park the bike, walk the lake at first light.",
        distance: "520 km",
        time: "05:40 PM",
        fuel: "₹2,450 total",
        food: "Pastry Corner hot chocolate",
        tip: "Dolphin's Nose at sunrise tomorrow",
        weather: "16°C · Cold",
        image: campingImg,
        coords: [10.2381, 77.4892],
      },
    ],
  },
  "Coimbatore-Ooty": {
    slug: "coimbatore-ooty",
    name: "Coimbatore → Ooty Nilgiri Express",
    summary: "88 km of 36 hairpins through Mettupalayam, Coonoor tea gardens & eucalyptus ridges.",
    totalDistance: "88 km",
    totalTime: "3.5 h riding",
    fuelEstimate: "₹550",
    bestSeason: "Sep – May",
    stops: [
      {
        name: "Coimbatore — Foothills",
        description: "Start at North Coimbatore junction towards Mettupalayam.",
        distance: "0 km",
        time: "06:00 AM",
        fuel: "Full tank",
        food: "Annapoorna Sambar Vadai",
        tip: "Clear Mettupalayam before morning lorry traffic",
        weather: "25°C · Pleasant",
        image: heroImg,
        coords: [11.0168, 76.9558],
      },
      {
        name: "Kallar Ghat — 36 Hairpins Begin",
        description: "Forest checkpost. High hairpin density begins up the Nilgiri ridge.",
        distance: "38 km",
        time: "07:15 AM",
        fuel: "—",
        food: "Kallar fresh guava & jackfruit stalls",
        tip: "Watch out for wild elephant corridors at bend 14",
        weather: "22°C · Forest Breeze",
        image: routesImg,
        coords: [11.3321, 76.9012],
      },
      {
        name: "Coonoor — Tea Valley View",
        description: "Stop at Wellington view point and tea estate valley.",
        distance: "68 km",
        time: "08:45 AM",
        fuel: "—",
        food: "Coonoor high tea & varkey",
        tip: "Shoot the Toy Train crossing over the stone bridge",
        weather: "18°C · Cool",
        image: waterfallsImg,
        coords: [11.3530, 76.7959],
      },
      {
        name: "Ooty — Queen of Hill Stations",
        description: "Summit at Doddabetta peak & Ooty Lake.",
        distance: "88 km",
        time: "09:30 AM",
        fuel: "₹550 total",
        food: "Homemade chocolate & lemon tea",
        tip: "Walk the pine forest trail at sunset",
        weather: "14°C · Chilly",
        image: campingImg,
        coords: [11.4102, 76.6950],
      },
    ],
  },
  "Coimbatore-Valparai": {
    slug: "coimbatore-valparai",
    name: "Coimbatore → Valparai 40 Hairpin Climb",
    summary: "105 km through Anamalai Tiger Reserve, Aliyar Dam and 40 steep hairpin turns.",
    totalDistance: "105 km",
    totalTime: "4 h riding",
    fuelEstimate: "₹720",
    bestSeason: "Oct – Mar",
    stops: [
      {
        name: "Coimbatore — South Exit",
        description: "Head south towards Pollachi through coconut palm groves.",
        distance: "0 km",
        time: "05:30 AM",
        fuel: "Full tank",
        food: "Pollachi tender coconut water",
        tip: "Golden light over coconut canopy near Pollachi",
        weather: "26°C · Sunny",
        image: heroImg,
        coords: [11.0168, 76.9558],
      },
      {
        name: "Aliyar Dam Foot & Checkpost",
        description: "Entry to Anamalai Tiger Reserve. Hairpin 1 of 40 starts here.",
        distance: "55 km",
        time: "07:00 AM",
        fuel: "—",
        food: "Dam side tea shack",
        tip: "Viewpoint at Hairpin 9 gives full panoramic view of Aliyar reservoir",
        weather: "24°C · Breeze",
        image: routesImg,
        coords: [10.4851, 76.9723],
      },
      {
        name: "Loam's Viewpoint — Hairpin 9",
        description: "Breathtaking cliff viewpoint overlooking the reservoir valley.",
        distance: "65 km",
        time: "07:45 AM",
        fuel: "—",
        food: "Freshly roasted peanuts",
        tip: "Keep camera ready for Nilgiri Tahr mountain goats",
        weather: "20°C · Cool",
        image: waterfallsImg,
        coords: [10.4321, 76.9543],
      },
      {
        name: "Valparai — Sholayar Plateau",
        description: "Endless tea gardens, lion-tailed macaques, and quiet rain forest roads.",
        distance: "105 km",
        time: "09:30 AM",
        fuel: "₹720 total",
        food: "Valparai green tea & parotta",
        tip: "Visit Sholayar Dam backwaters at sunset",
        weather: "17°C · Pleasant",
        image: campingImg,
        coords: [10.3274, 76.9554],
      },
    ],
  },
  "Madurai-Dhanushkodi": {
    slug: "madurai-dhanushkodi",
    name: "Madurai → Dhanushkodi Ocean Highway",
    summary: "180 km from the temple city to the ghost town at the edge of the Indian Ocean.",
    totalDistance: "180 km",
    totalTime: "4.5 h riding",
    fuelEstimate: "₹1,150",
    bestSeason: "Nov – Feb",
    stops: [
      {
        name: "Madurai — Meenakshi Start",
        description: "Early morning start from West Masi Street.",
        distance: "0 km",
        time: "05:00 AM",
        fuel: "Full tank",
        food: "Madurai bun parotta & coffee",
        tip: "Gopuram silhouettes in sunrise sky",
        weather: "27°C · Clear",
        image: templesImg,
        coords: [9.9252, 78.1198],
      },
      {
        name: "Pamban Sea Bridge",
        description: "Crossing India's historic ocean railway bridge connecting Rameswaram island.",
        distance: "155 km",
        time: "08:30 AM",
        fuel: "—",
        food: "Fresh fish fry near Mandapam",
        tip: "Park at the bridge bay and wait for train crossing",
        weather: "29°C · Sea Wind",
        image: beachesImg,
        coords: [9.2818, 79.2086],
      },
      {
        name: "Dhanushkodi — Arichal Munai",
        description: "The tip of India where Bay of Bengal meets Indian Ocean.",
        distance: "180 km",
        time: "09:30 AM",
        fuel: "₹1,150 total",
        food: "Rameswaram prawn curry",
        tip: "Drone shot of the road surrounded by ocean on both sides",
        weather: "28°C · Sunny & Windy",
        image: beachesImg,
        coords: [9.1517, 79.4455],
      },
    ],
  },
  "Salem-Kolli Hills": {
    slug: "salem-kolli-hills",
    name: "Salem → Kolli Hills 70 Hairpin Challenge",
    summary: "75 km dedicated motorcycle climb featuring 70 continuous hairpin curves.",
    totalDistance: "75 km",
    totalTime: "2.5 h riding",
    fuelEstimate: "₹480",
    bestSeason: "Sep – Mar",
    stops: [
      {
        name: "Salem City — Start",
        description: "Ride south-east towards Rasipuram foothill road.",
        distance: "0 km",
        time: "06:00 AM",
        fuel: "Full tank",
        food: "Salem thattu vadai set",
        tip: "Fuel up before Karavalli base",
        weather: "26°C · Clear",
        image: heroImg,
        coords: [11.6643, 78.1460],
      },
      {
        name: "Karavalli Base Checkpost",
        description: "Hairpin 1 begins! 70 numbered hairpin curves start here.",
        distance: "45 km",
        time: "07:00 AM",
        fuel: "—",
        food: "Karavalli tea & bajji",
        tip: "Zero your trip meter at Hairpin 1 marker",
        weather: "24°C · Cool",
        image: routesImg,
        coords: [11.3340, 78.3320],
      },
      {
        name: "Hairpin 36 Viewpoint",
        description: "Midway panoramic viewpoint looking down over 30 curves below.",
        distance: "58 km",
        time: "07:45 AM",
        fuel: "—",
        food: "Fresh jackfruit slices",
        tip: "Wide-angle lens for hairpin stack photos",
        weather: "21°C · Misty",
        image: routesImg,
        coords: [11.3020, 78.3500],
      },
      {
        name: "Semmedu Plateau — Agaya Gangai",
        description: "Peak plateau & 1,200 step hike down to Agaya Gangai waterfall.",
        distance: "75 km",
        time: "08:30 AM",
        fuel: "₹480 total",
        food: "Tribal honey & herbal tea",
        tip: "Arapaleeswarar temple visit after waterfall hike",
        weather: "19°C · Pleasant",
        image: waterfallsImg,
        coords: [11.2721, 78.3412],
      },
    ],
  },
};

// Fallback dynamic generator for custom origin-destination pairs
function generateDynamicRoute(origin: OriginCity, destination: DestinationCity): CustomRouteData {
  const key = `${origin}-${destination}`;
  if (ROUTE_PRESETS[key]) return ROUTE_PRESETS[key];

  // Coordinates map for Tamil Nadu cities
  const CITY_COORDS: Record<string, [number, number]> = {
    Chennai: [13.0827, 80.2707],
    Coimbatore: [11.0168, 76.9558],
    Madurai: [9.9252, 78.1198],
    Trichy: [10.7905, 78.7047],
    Salem: [11.6643, 78.1460],
    Tirunelveli: [8.7139, 77.7567],
    Pondicherry: [11.9416, 79.8083],
    Kodaikanal: [10.2381, 77.4892],
    Ooty: [11.4102, 76.6950],
    Valparai: [10.3274, 76.9554],
    "Kolli Hills": [11.2721, 78.3412],
    Dhanushkodi: [9.1517, 79.4455],
    Yercaud: [11.7753, 78.2093],
    Meghamalai: [9.6738, 77.4207],
    Courtallam: [8.9315, 77.2678],
  };

  const startCoords = CITY_COORDS[origin] || [11.0, 78.0];
  const endCoords = CITY_COORDS[destination] || [10.2, 77.4];

  // Rough distance calculation based on lat/lng Euclidean approx for TN
  const dLat = endCoords[0] - startCoords[0];
  const dLng = endCoords[1] - startCoords[1];
  const distKm = Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 110 * 1.3);
  const durationHours = (distKm / 45).toFixed(1);
  const fuelCost = Math.round(distKm * 4.5);

  const midLat = (startCoords[0] + endCoords[0]) / 2;
  const midLng = (startCoords[1] + endCoords[1]) / 2;

  return {
    slug: `${origin.toLowerCase()}-${destination.toLowerCase()}`,
    name: `${origin} → ${destination} Spatial Trail`,
    summary: `Custom calculated ${distKm} km spatial trail from ${origin} to ${destination} via scenic highways and mountain passes.`,
    totalDistance: `${distKm} km`,
    totalTime: `${durationHours} h riding`,
    fuelEstimate: `₹${fuelCost.toLocaleString()}`,
    bestSeason: "Sep – Mar",
    stops: [
      {
        name: `${origin} — Departure Point`,
        description: `Early morning departure from ${origin}. Check tyre pressures and fuel tank.`,
        distance: "0 km",
        time: "06:00 AM",
        fuel: "Full tank",
        food: `Local ${origin} breakfast mess`,
        tip: "Clear city perimeter before peak traffic hours",
        weather: "26°C · Pleasant",
        image: heroImg,
        coords: startCoords,
      },
      {
        name: `Midway Highway Stop`,
        description: "Highway halt for refreshment, tea, and quick vehicle inspection.",
        distance: `${Math.round(distKm * 0.5)} km`,
        time: "09:30 AM",
        fuel: `₹${Math.round(fuelCost * 0.5)} used`,
        food: "Roadside tea stall & tender coconut",
        tip: "Keep camera ready for rural countryside views",
        weather: "28°C · Sunny",
        image: routesImg,
        coords: [midLat, midLng],
      },
      {
        name: `${destination} — Destination Arrival`,
        description: `Arrive at ${destination} elevation point. Enjoy mountain views and local trails.`,
        distance: `${distKm} km`,
        time: "01:00 PM",
        fuel: `₹${fuelCost} total`,
        food: "Local specialty dish",
        tip: "Capture golden hour photography at hilltop viewpoint",
        weather: "18°C · Cool",
        image: campingImg,
        coords: endCoords,
      },
    ],
  };
}

function RoutesPage() {
  const [selectedOrigin, setSelectedOrigin] = useState<OriginCity>("Chennai");
  const [selectedDestination, setSelectedDestination] = useState<DestinationCity>("Kodaikanal");
  const [currentRoute, setCurrentRoute] = useState<CustomRouteData>(ROUTE_PRESETS["Chennai-Kodaikanal"]);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletModuleRef = useRef<any>(null);

  // Recalculate route when origin or destination changes
  const handleGenerateRoute = () => {
    const route = generateDynamicRoute(selectedOrigin, selectedDestination);
    setCurrentRoute(route);
  };

  // SSR Safe Leaflet Map initialization for Route Page
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
        center: [10.8, 78.2],
        zoom: 7,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      leafletMapRef.current = map;
      drawRoutePolyline();
    }

    initMap();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [currentRoute]);

  const drawRoutePolyline = () => {
    const map = leafletMapRef.current;
    const L = leafletModuleRef.current;
    if (!map || !L || !currentRoute.stops.length) return;

    const latLngs: [number, number][] = currentRoute.stops.map((s) => s.coords);

    // Draw glowing emerald polyline path on real map tiles
    const polyline = L.polyline(latLngs, {
      color: "#10b981",
      weight: 4,
      opacity: 0.9,
      dashArray: "8, 6",
    }).addTo(map);

    // Fit map bounds to show full route
    map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

    // Draw Pin Markers for every stop along the route
    currentRoute.stops.forEach((stop, index) => {
      const isStart = index === 0;
      const isEnd = index === currentRoute.stops.length - 1;

      const pinColor = isStart ? "#3b82f6" : isEnd ? "#10b981" : "#f59e0b";

      const iconHtml = `
        <div style="background: ${pinColor}; color: #000; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 9999px; border: 2px solid #ffffff; box-shadow: 0 8px 20px rgba(0,0,0,0.6); white-space: nowrap; font-family: sans-serif;">
          ${index + 1}. ${stop.name.split(" — ")[0]}
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-route-marker",
        html: iconHtml,
        iconSize: [120, 28],
        iconAnchor: [60, 14],
      });

      L.marker(stop.coords, { icon: customIcon }).addTo(map);
    });
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Interactive Route Builder"
        title={currentRoute.name}
        description={currentRoute.summary}
      />

      <div className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        {/* Dynamic Route Origin & Destination Controls Box */}
        <div className="bg-[#121821] border border-white/15 rounded-3xl p-5 sm:p-7 shadow-2xl mb-10 text-white">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs mb-3 font-bold">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>SELECT YOUR ORIGIN & DESTINATION TRAIL</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 items-end">
            {/* Start / Origin Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Starting Location (Origin)
              </label>
              <select
                value={selectedOrigin}
                onChange={(e) => setSelectedOrigin(e.target.value as OriginCity)}
                className="w-full bg-[#0B0F14] border border-white/20 rounded-2xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-emerald-400 transition cursor-pointer"
              >
                {ORIGINS.map((city) => (
                  <option key={city} value={city} className="bg-[#0B0F14] text-white">
                    📍 {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Destination (End Point)
              </label>
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value as DestinationCity)}
                className="w-full bg-[#0B0F14] border border-white/20 rounded-2xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-emerald-400 transition cursor-pointer"
              >
                {DESTINATIONS.map((city) => (
                  <option key={city} value={city} className="bg-[#0B0F14] text-white">
                    ⛰️ {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Generate Button */}
            <div>
              <Button
                onClick={handleGenerateRoute}
                size="lg"
                className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-black font-black py-6 shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2 text-sm"
              >
                <Sparkles className="w-4 h-4" /> Calculate Route Map <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Preset Chips */}
          <div className="mt-5 flex flex-wrap items-center gap-2 pt-4 border-t border-white/10 text-xs">
            <span className="text-slate-400 font-medium mr-1">Popular Trails:</span>
            {[
              { origin: "Chennai", dest: "Kodaikanal", label: "Chennai → Kodai (520km)" },
              { origin: "Coimbatore", dest: "Ooty", label: "Coimbatore → Ooty (88km)" },
              { origin: "Coimbatore", dest: "Valparai", label: "Coimbatore → Valparai 40 Hairpins" },
              { origin: "Madurai", dest: "Dhanushkodi", label: "Madurai → Dhanushkodi Ocean Road" },
              { origin: "Salem", dest: "Kolli Hills", label: "Salem → Kolli Hills 70 Hairpins" },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setSelectedOrigin(p.origin as OriginCity);
                  setSelectedDestination(p.dest as DestinationCity);
                  const route = generateDynamicRoute(p.origin as OriginCity, p.dest as DestinationCity);
                  setCurrentRoute(route);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  selectedOrigin === p.origin && selectedDestination === p.dest
                    ? "bg-emerald-500 text-black border-emerald-400 font-bold"
                    : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Route Details & Interactive Leaflet Map Grid */}
        <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr]">
          {/* Left Column: Timeline Stop by Stop */}
          <ol className="relative space-y-6 border-l border-border pl-6">
            {currentRoute.stops.map((stop, i) => (
              <motion.li
                key={stop.name}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <span className="absolute -left-[31px] top-6 grid size-6 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground ring-4 ring-background">
                  {i + 1}
                </span>
                <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-elevate">
                  <img src={stop.image} alt={stop.name} loading="lazy" className="h-48 w-full object-cover" />
                  <div className="space-y-3 p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h2 className="font-display text-xl font-semibold">{stop.name}</h2>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                        <MapPin className="size-3 text-emerald-400" aria-hidden /> {stop.distance}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{stop.description}</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {[
                        [Clock, "Time", stop.time],
                        [Fuel, "Fuel", stop.fuel],
                        [Utensils, "Eat", stop.food],
                        [CloudSun, "Weather", stop.weather],
                      ].map(([Icon, label, value]) => {
                        const I = Icon as typeof Clock;
                        return (
                          <p key={label as string} className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-xs">
                            <I className="size-3.5 text-primary" aria-hidden />
                            <span className="text-muted-foreground">{label as string}</span>
                            <span className="ml-auto font-medium">{value as string}</span>
                          </p>
                        );
                      })}
                    </div>
                    <p className="flex items-start gap-2 rounded-xl border border-border p-3 text-xs text-muted-foreground">
                      <Camera className="mt-0.5 size-3.5 text-gold shrink-0" aria-hidden /> {stop.tip}
                    </p>
                  </div>
                </div>
              </motion.li>
            ))}
          </ol>

          {/* Right Column: Real Geographic Leaflet Map for Route & Metrics */}
          <aside className="glass sticky top-28 h-fit rounded-4xl p-6 shadow-elevate">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-emerald-400" /> Geographic Route Map
              </p>
              <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                CartoDB Engine
              </span>
            </div>

            {/* Real Geographic Leaflet Map Viewport for Route */}
            <div className="relative h-[320px] w-full rounded-3xl overflow-hidden border border-white/15 shadow-2xl mb-4">
              <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />
            </div>

            {/* Metrics Grid */}
            <dl className="grid grid-cols-2 gap-3">
              {[
                ["Total Distance", currentRoute.totalDistance],
                ["Riding Time", currentRoute.totalTime],
                ["Fuel Estimate", currentRoute.fuelEstimate],
                ["Best Season", currentRoute.bestSeason],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl border border-border bg-card/60 p-3">
                  <dt className="text-[11px] uppercase tracking-wide text-muted-foreground font-mono">{k}</dt>
                  <dd className="mt-1 font-display text-sm font-bold text-emerald-400">{v}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
