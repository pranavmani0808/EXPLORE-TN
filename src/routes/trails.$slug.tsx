import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Compass,
  MapPin,
  Navigation,
  ArrowRight,
  Clock,
  Sparkles,
  Flame,
  Trees,
  Waves,
  Mountain,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Route as RouteIcon
} from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import { CANONICAL_PLACES, ExplorerPlace } from "@/lib/data/canonical-places";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
  MapControls,
  MapRoute,
} from "@/components/ui/map";

export interface TrailData {
  slug: string;
  title: string;
  subtitle: string;
  badge: string;
  distance: string;
  duration: string;
  difficulty: "Easy" | "Moderate" | "Challenging";
  bestSeason: string;
  description: string;
  highlights: string[];
  stops: { name: string; district: string; slug: string; description: string; latitude: number; longitude: number }[];
}

const TRAIL_CATALOG: Record<string, TrailData> = {
  "western-ghats-70-hairpin": {
    slug: "western-ghats-70-hairpin",
    title: "Western Ghats 70-Hairpin Pass Road Trip",
    subtitle: "Thakkaram to Valparai & Meghamalai cloud estate highways",
    badge: "Ghat Highway",
    distance: "460 km",
    duration: "2 Days",
    difficulty: "Challenging",
    bestSeason: "September to March",
    description:
      "A breathtaking mountain road trip navigating 70 hairpin curves through the Western Ghats shola cloud forests, tea plantations, and waterfalls.",
    highlights: [
      "70 Hairpin curves through Kolli & Valparai hills",
      "Highland tea estate vistas & mist viewpoints",
      "Wild elephant corridor transit rules",
      "Cool mountain climate & fresh air"
    ],
    stops: [
      { name: "Valparai 40-Hairpins", district: "Coimbatore", slug: "valparai", description: "Scenic tea valley pass", latitude: 10.3262, longitude: 76.9554 },
      { name: "Suruli Waterfalls", district: "Theni", slug: "suruli-falls", description: "150ft mountain cascade", latitude: 9.6644, longitude: 77.2711 },
      { name: "Kodaikanal Lake & Sholas", district: "Dindigul", slug: "kodaikanal-lake", description: "Highland lake & pine forest", latitude: 10.2381, longitude: 77.4892 },
      { name: "Doddabetta Peak", district: "The Nilgiris", slug: "doddabetta-peak", description: "Highest peak in Nilgiris", latitude: 11.4005, longitude: 76.7352 }
    ]
  },
  "coromandel-coastal": {
    slug: "coromandel-coastal",
    title: "Coromandel Coastal & Temple Ocean Highway",
    subtitle: "Scenic coastal stretch connecting Mahabalipuram, Pondicherry & Rameswaram",
    badge: "Coastal Drive",
    distance: "580 km",
    duration: "3 Days",
    difficulty: "Easy",
    bestSeason: "October to February",
    description:
      "Drive along the East Coast Road (ECR) bordering the Bay of Bengal, passing 7th-century UNESCO stone monuments, French colonial avenues, and sea temples.",
    highlights: [
      "ECR sea-view driving route along Bay of Bengal",
      "UNESCO Shore Temple stone reliefs in Mahabalipuram",
      "Pamban Sea Bridge & Dhanushkodi ghost town beach",
      "Fresh coastal seafood & ocean breezes"
    ],
    stops: [
      { name: "Mahabalipuram Coastal Heritage", district: "Chengalpattu", slug: "shore-temple", description: "7th-century UNESCO monuments", latitude: 12.6269, longitude: 80.1927 },
      { name: "Marina Beach Promenade", district: "Chennai", slug: "marina-beach", description: "13km urban sea beach", latitude: 13.0499, longitude: 80.2824 },
      { name: "Mathoor Hanging Aqueduct", district: "Kanyakumari", slug: "mathoor-hanging-trough", description: "Asia's highest canal aqueduct", latitude: 8.3283, longitude: 77.3197 }
    ]
  }
};

export const Route = createFileRoute("/trails/$slug")({
  head: ({ params }) => {
    const trail = TRAIL_CATALOG[params.slug] || { title: "Travel Trail — ExplorerTN" };
    return {
      meta: [
        { title: `${trail.title} | ExplorerTN` },
        { name: "description", content: trail.subtitle || trail.description }
      ]
    };
  },
  component: TrailPage
});

function TrailPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const trail = TRAIL_CATALOG[slug] || {
    slug,
    title: slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    subtitle: "Curated road circuit across Tamil Nadu",
    badge: "Scenic Trail",
    distance: "400+ km",
    duration: "2-3 Days",
    difficulty: "Moderate" as const,
    bestSeason: "Year-round",
    description: "Explore curated scenic stops, highway passes, and cultural highlights.",
    highlights: ["Scenic highway transit", "Local food stops", "Verified coordinates"],
    stops: [
      { name: "Valparai Pass", district: "Coimbatore", slug: "valparai", description: "Scenic gateway", latitude: 10.3262, longitude: 76.9554 }
    ]
  };

  const initialCenter: [number, number] = trail.stops.length > 0
    ? [trail.stops[0].latitude, trail.stops[0].longitude]
    : [11.1271, 78.6569];

  const [mapCenter, setMapCenter] = useState<[number, number]>(initialCenter);
  const [mapZoom, setMapZoom] = useState<number>(8);
  const [activeStopIndex, setActiveStopIndex] = useState<number>(0);

  const routeCoordinates: Array<[number, number]> = trail.stops.map((s) => [s.latitude, s.longitude]);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 pt-24 space-y-8 font-sans text-slate-900">
        {/* Header Hero */}
        <div className="rounded-3xl border border-sky-100 bg-white p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="px-3.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-xs font-mono font-bold">
              {trail.badge}
            </span>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
              <span>🛣️ {trail.distance}</span>
              <span>⏱️ {trail.duration}</span>
              <span>🔥 {trail.difficulty}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-slate-900 tracking-tight">
              {trail.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl">{trail.subtitle}</p>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">{trail.description}</p>

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100">
            <Button
              onClick={() => navigate({ to: "/routes", search: { destination: trail.stops[0]?.slug } })}
              className="rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-md shadow-sky-600/20"
            >
              <Sparkles className="mr-2 size-4" /> Open Interactive Route Planner
            </Button>
            <Button asChild variant="outline" className="rounded-2xl border-slate-200 text-slate-700 hover:bg-slate-50">
              <Link to="/routes">Back to All Routes</Link>
            </Button>
          </div>
        </div>

        {/* Trail Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {trail.highlights.map((h, idx) => (
            <div key={idx} className="rounded-2xl border border-sky-100 bg-white p-4 space-y-2 shadow-sm">
              <CheckCircle2 className="size-5 text-sky-600" />
              <p className="text-xs font-semibold text-slate-800">{h}</p>
            </div>
          ))}
        </div>

        {/* Interactive Trail Map Section with Stop Selector */}
        <div className="rounded-3xl border border-sky-100 bg-white p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-sky-50 border border-sky-200 px-2.5 py-0.5 text-xs font-mono font-bold text-sky-700">
                  Interactive Route Map
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {trail.stops.length} Scenic Waypoints
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-display mt-1">
                Visual Trail Path & Stop Locations
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setMapCenter(initialCenter);
                  setMapZoom(8);
                }}
                className="text-xs font-semibold text-slate-500 hover:text-sky-600 cursor-pointer"
              >
                Reset Map ↺
              </button>
            </div>
          </div>

          {/* Map Container */}
          <div className="h-[440px] w-full rounded-2xl overflow-hidden border border-sky-100 relative">
            <Map center={mapCenter} zoom={mapZoom} style="outdoors" className="h-full w-full">
              <MapControls position="top-right" />

              {routeCoordinates.length > 1 && (
                <MapRoute coordinates={routeCoordinates} animated color="#0284c7" weight={4} />
              )}

              {trail.stops.map((stop, idx) => {
                const isActive = activeStopIndex === idx;
                return (
                  <MapMarker key={stop.name} latitude={stop.latitude} longitude={stop.longitude}>
                    <MarkerContent>
                      <button
                        onClick={() => {
                          setActiveStopIndex(idx);
                          setMapCenter([stop.latitude, stop.longitude]);
                          setMapZoom(11);
                        }}
                        className={`flex size-7 items-center justify-center rounded-full font-bold text-xs shadow-md transition-all cursor-pointer ${
                          isActive
                            ? "bg-sky-600 text-white scale-125 ring-4 ring-sky-300"
                            : "bg-white text-sky-700 border border-sky-300 hover:scale-110"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    </MarkerContent>
                    <MarkerTooltip>{stop.name}</MarkerTooltip>
                    <MarkerPopup title={stop.name}>
                      <div className="space-y-1.5 p-1 text-slate-800">
                        <p className="text-xs text-slate-500">{stop.district} District · Stop #{idx + 1}</p>
                        <p className="text-xs text-slate-700">{stop.description}</p>
                        <div className="flex items-center gap-2 pt-1">
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:underline"
                          >
                            <span>Google Maps</span>
                            <ExternalLink className="size-3" />
                          </a>
                        </div>
                      </div>
                    </MarkerPopup>
                  </MapMarker>
                );
              })}
            </Map>
          </div>
        </div>

        {/* Stops Catalog with Direct GPS Navigation Buttons */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-display text-slate-900 flex items-center gap-2">
              <MapPin className="size-5 text-sky-600" /> Trail Itinerary & Key Stops
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Click any stop to locate or navigate
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trail.stops.map((stop, i) => {
              const isSelected = activeStopIndex === i;
              return (
                <div
                  key={i}
                  className={`rounded-2xl border bg-white p-5 space-y-3 transition-all duration-200 ${
                    isSelected ? "border-sky-400 ring-2 ring-sky-200 shadow-md" : "border-slate-200/80 hover:border-sky-200 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 font-mono text-[10px] font-bold border border-sky-100">
                      Stop #{i + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{stop.district} District</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{stop.name}</h3>
                    <p className="text-xs text-slate-600 mt-1">{stop.description}</p>
                    <p className="text-[11px] font-mono text-slate-400 mt-1">
                      Coordinates: {stop.latitude.toFixed(4)}°N, {stop.longitude.toFixed(4)}°E
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveStopIndex(i);
                        setMapCenter([stop.latitude, stop.longitude]);
                        setMapZoom(12);
                        window.scrollTo({ top: 380, behavior: "smooth" });
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
                    >
                      <MapPin className="size-3.5" />
                      <span>Focus on Map</span>
                    </button>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 ml-auto"
                    >
                      <span>Directions</span>
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
