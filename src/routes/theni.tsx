import { useState, useEffect, useRef, useMemo } from "react";
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
  Waves,
  Sun,
  ShieldAlert,
  Calendar,
  Filter,
  Route as RouteIcon,
  Flame,
  Car,
  Bike,
  CheckCircle2,
  ExternalLink,
  Play,
  RotateCcw,
  LocateFixed,
  Info,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import { RouteApiRepository, IsolatedRouteResultDTO } from "@/lib/api-client/routes";
import { CANONICAL_PLACES, ExplorerPlace, resolvePlace } from "@/lib/data/canonical-places";
import waterfallsImg from "@/assets/cat-waterfalls.jpg";
import heroImg from "@/assets/hero-ghats.jpg";
import routesImg from "@/assets/cat-routes.jpg";
import campingImg from "@/assets/cat-camping.jpg";

export const Route = createFileRoute("/theni")({
  head: () => ({
    meta: [
      { title: "Theni Trip Planner & Interactive Nature Circuit — ExplorerTN" },
      {
        name: "description",
        content:
          "Plan real multi-stop trip itineraries across Theni nature circuits, Suruli Falls, Meghamalai, Cumbum vineyards, and Kurangani Top Station trek.",
      },
      { property: "og:title", content: "Theni Trip Planner — ExplorerTN" },
      {
        property: "og:description",
        content:
          "Interactive trip planning map with exact road distances, driving times, visit durations, activities, and live navigation.",
      },
    ],
  }),
  component: TheniTripPlannerPage,
});

export interface TripStop {
  placeId: string;
  order: number;
  visitDuration: number; // in minutes
  activities: string[];
}

export interface TripCircuit {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  travelMode: "car" | "motorcycle";
  recommendedDuration: string;
  stops: TripStop[];
}

// 5 Structured Curated Trip Circuits
const TRIP_CIRCUITS: TripCircuit[] = [
  {
    id: "circuit-a",
    name: "Circuit A — Nature & Waterfalls",
    subtitle: "Cascading falls, wild mountain streams & river walks",
    description: "Theni → Suruli Falls → Chinna Suruli → Ellapatti River Walk",
    travelMode: "car",
    recommendedDuration: "1 Day (6–7 Hours)",
    stops: [
      { placeId: "theni", order: 1, visitDuration: 0, activities: ["Trip Assembly", "Fuel & Snacks"] },
      {
        placeId: "suruli-waterfalls",
        order: 2,
        visitDuration: 120,
        activities: ["150ft Waterfall Viewing", "Rock Cave Shrines", "Forest Trail Walk", "Photography"],
      },
      {
        placeId: "chinna-suruli-waterfalls",
        order: 3,
        visitDuration: 60,
        activities: ["Secluded Bathing", "Kombaitholu Forest Stream", "Wild Cascade Photo"],
      },
      {
        placeId: "ellapatti-river-walk",
        order: 4,
        visitDuration: 90,
        activities: ["Shallow Stream Bathing", "Shaded Bamboo Canopy Walk", "Sunset Relaxation"],
      },
    ],
  },
  {
    id: "circuit-b",
    name: "Circuit B — Kodaikanal-side Nature",
    subtitle: "Foothill granite rock baths & historic elevated aqueducts",
    description: "Theni → Kumbakkarai Falls → Thottipalam Aqueduct",
    travelMode: "car",
    recommendedDuration: "Half Day (4–5 Hours)",
    stops: [
      { placeId: "theni", order: 1, visitDuration: 0, activities: ["Trip Assembly"] },
      {
        placeId: "kumbakkarai-falls",
        order: 2,
        visitDuration: 120,
        activities: ["Granite Rock Water Basins", "Foothills Stream Bathing", "Family Picnic"],
      },
      {
        placeId: "thottipalam-aqueduct",
        order: 3,
        visitDuration: 60,
        activities: ["Aqueduct Canal Walk", "Paddy Field Vistas", "Historic Engineering Photo"],
      },
    ],
  },
  {
    id: "circuit-c",
    name: "Circuit C — Meghamalai Cloud Forests",
    subtitle: "Misty tea estates, 18 hairpin bends & high-altitude lakes",
    description: "Theni → Meghamalai Tea Estates & High Wavy Peak",
    travelMode: "car",
    recommendedDuration: "Full Day (8–9 Hours)",
    stops: [
      { placeId: "theni", order: 1, visitDuration: 0, activities: ["Trip Assembly"] },
      {
        placeId: "meghamalai",
        order: 2,
        visitDuration: 240,
        activities: ["18 Hairpin Bend Mountain Drive", "High Waves Tea Plantation Safari", "Meghamalai Dam Lake", "Sea of Clouds View"],
      },
    ],
  },
  {
    id: "circuit-d",
    name: "Circuit D — Mountain Trekking Adventure",
    subtitle: "Pine forest climbing, cliff ridges & 1,700m summit vistas",
    description: "Theni → Kurangani Foothills → Top Station Ridge",
    travelMode: "car",
    recommendedDuration: "Full Day (9–10 Hours)",
    stops: [
      { placeId: "theni", order: 1, visitDuration: 0, activities: ["Trip Assembly", "Gear Check"] },
      {
        placeId: "kurangani-hill-village",
        order: 2,
        visitDuration: 90,
        activities: ["Trekking Basecamp Prep", "Central Station Valley View", "Shola Forest Gateway"],
      },
      {
        placeId: "top-station-viewpoint",
        order: 3,
        visitDuration: 180,
        activities: ["1,700m Summit Panorama", "Sea of Clouds Morning Viewpoint", "Historic Ropeway Terminal"],
      },
    ],
  },
  {
    id: "circuit-e",
    name: "Circuit E — Relaxed Family & Countryside",
    subtitle: "111ft reservoir dam, flower gardens & grape tasting",
    description: "Theni → Vaigai Dam → Cumbum Valley Vineyards",
    travelMode: "car",
    recommendedDuration: "Half Day (5–6 Hours)",
    stops: [
      { placeId: "theni", order: 1, visitDuration: 0, activities: ["Trip Assembly"] },
      {
        placeId: "vaigai-dam",
        order: 2,
        visitDuration: 120,
        activities: ["111ft Dam Wall View", "Lush Flower Gardens", "Sunset Reservoir Promenade"],
      },
      {
        placeId: "cumbum-valley-vineyards",
        order: 3,
        visitDuration: 90,
        activities: ["Muscat Grape Farm Tasting", "Vineyard Walk", "Agro-Tourism Tour"],
      },
    ],
  },
];

// Origin Locations
const ORIGIN_OPTIONS = [
  { label: "Theni Central Hub", latitude: 10.0104, longitude: 77.4768 },
  { label: "Madurai City", latitude: 9.9195, longitude: 78.1193 },
  { label: "Coimbatore", latitude: 11.0168, longitude: 76.9558 },
  { label: "Chennai", latitude: 13.0827, longitude: 80.2707 },
  { label: "Bengaluru", latitude: 12.9716, longitude: 77.5946 },
];

export function TheniTripPlannerPage() {
  const navigate = useNavigate();
  const [selectedCircuitId, setSelectedCircuitId] = useState<string>("circuit-a");
  const [selectedOrigin, setSelectedOrigin] = useState(ORIGIN_OPTIONS[0]);
  const [selectedStopIndex, setSelectedStopIndex] = useState<number>(0);
  const [travelMode, setTravelMode] = useState<"car" | "motorcycle">("car");

  // Active Trip Itinerary Mode
  const [isTripActive, setIsTripActive] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<string>("08:00");

  // Route Engine State
  const [segmentData, setSegmentData] = useState<
    Array<{ distanceKm: number; durationMins: number; polyline: [number, number][] }>
  >([]);
  const [routeLoading, setRouteLoading] = useState<boolean>(false);
  const activeRequestIdRef = useRef<string>("");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletModuleRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineGroupRef = useRef<any>(null);

  // Active Circuit Object
  const currentCircuit = useMemo(() => {
    return TRIP_CIRCUITS.find((c) => c.id === selectedCircuitId) || TRIP_CIRCUITS[0];
  }, [selectedCircuitId]);

  // Resolved Stops from Canonical Catalog
  const resolvedStops = useMemo(() => {
    return currentCircuit.stops.map((stop) => {
      const canonical = resolvePlace(stop.placeId);
      return {
        ...stop,
        place: canonical || {
          id: stop.placeId,
          name: stop.placeId.replace(/-/g, " ").toUpperCase(),
          district: "Theni",
          state: "Tamil Nadu",
          country: "India" as const,
          latitude: 10.01,
          longitude: 77.47,
          categories: ["tourist-places"],
          primaryCategory: "tourist-places",
          tagline: "Theni Destination",
          description: "Scenic stop along the Theni nature circuit.",
          image: heroImg,
          verified: true,
          tags: ["Theni"],
        },
      };
    });
  }, [currentCircuit]);

  // Calculate Segment-by-Segment Isolated Road Routes
  useEffect(() => {
    const requestId = `theni-route-${selectedCircuitId}-${Date.now()}`;
    activeRequestIdRef.current = requestId;
    setRouteLoading(true);

    const stops = resolvedStops;
    const fetchSegments = async () => {
      const results: Array<{ distanceKm: number; durationMins: number; polyline: [number, number][] }> = [];

      for (let i = 0; i < stops.length - 1; i++) {
        const from = i === 0 && selectedOrigin.label !== "Theni Central Hub"
          ? selectedOrigin
          : { name: stops[i].place.name, latitude: stops[i].place.latitude, longitude: stops[i].place.longitude };

        const to = { name: stops[i + 1].place.name, latitude: stops[i + 1].place.latitude, longitude: stops[i + 1].place.longitude };

        try {
          const res: IsolatedRouteResultDTO = await RouteApiRepository.calculateRoute({
            requestId: `${requestId}-seg-${i}`,
            origin: { name: from.name || "Origin", latitude: from.latitude, longitude: from.longitude },
            destination: { name: to.name, latitude: to.latitude, longitude: to.longitude },
            travelMode: travelMode === "car" ? "driving" : "motorcycle",
          });

          // Check stale response guard
          if (activeRequestIdRef.current !== requestId) return;

          const polyline: [number, number][] = res.geometry.coordinates.map((c) => [c[1], c[0]]);
          results.push({
            distanceKm: res.distanceKm,
            durationMins: res.durationMinutes,
            polyline,
          });
        } catch {
          // Haversine fallback for this segment
          const dLat = (to.latitude - from.latitude) * (Math.PI / 180);
          const dLng = (to.longitude - from.longitude) * (Math.PI / 180);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(from.latitude * (Math.PI / 180)) *
              Math.cos(to.latitude * (Math.PI / 180)) *
              Math.sin(dLng / 2) *
              Math.sin(dLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const estDist = Math.round(6371 * c * 1.3);
          const estDur = Math.round((estDist / (travelMode === "car" ? 45 : 40)) * 60);

          results.push({
            distanceKm: estDist,
            durationMins: estDur,
            polyline: [
              [from.latitude, from.longitude],
              [to.latitude, to.longitude],
            ],
          });
        }
      }

      if (activeRequestIdRef.current === requestId) {
        setSegmentData(results);
        setRouteLoading(false);
      }
    };

    fetchSegments();
  }, [selectedCircuitId, selectedOrigin, travelMode, resolvedStops]);

  // Total Summary Calculations
  const tripTotals = useMemo(() => {
    const totalDrivingDist = segmentData.reduce((acc, s) => acc + s.distanceKm, 0);
    const totalDrivingMins = segmentData.reduce((acc, s) => acc + s.durationMins, 0);
    const totalVisitMins = resolvedStops.reduce((acc, s) => acc + s.visitDuration, 0);
    const totalTripMins = totalDrivingMins + totalVisitMins;

    return {
      drivingDistKm: totalDrivingDist,
      drivingMins: totalDrivingMins,
      visitMins: totalVisitMins,
      totalTripMins,
      stopsCount: resolvedStops.length,
    };
  }, [segmentData, resolvedStops]);

  // Leaflet Map Setup & Marker Rendering
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
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      leafletMapRef.current = map;
      renderMapElements();
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

  // Update Map Layers on Circuit / Selected Stop Change
  const renderMapElements = () => {
    const map = leafletMapRef.current;
    const L = leafletModuleRef.current;
    if (!map || !L) return;

    // Clear existing markers & polylines
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (polylineGroupRef.current) {
      polylineGroupRef.current.clearLayers();
    } else {
      polylineGroupRef.current = L.featureGroup().addTo(map);
    }

    // Draw Polylines for each segment
    const allPolyCoords: [number, number][] = [];
    segmentData.forEach((seg, idx) => {
      const isSegmentActive = selectedStopIndex === idx || selectedStopIndex === idx + 1;
      const poly = L.polyline(seg.polyline, {
        color: isSegmentActive ? "#10b981" : "#3b82f6",
        weight: isSegmentActive ? 5 : 3,
        opacity: isSegmentActive ? 0.95 : 0.6,
        dashArray: isSegmentActive ? undefined : "6, 6",
      });
      poly.addTo(polylineGroupRef.current);
      allPolyCoords.push(...seg.polyline);
    });

    if (allPolyCoords.length > 0) {
      const bounds = L.latLngBounds(allPolyCoords);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    // Draw Stop Markers (Numbered ①, ②, ③, ④)
    resolvedStops.forEach((stop, index) => {
      const isSelected = selectedStopIndex === index;
      const isStart = index === 0;
      const color = isSelected ? "#10b981" : isStart ? "#3b82f6" : "#f59e0b";
      const numLabel = index + 1;

      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          ${isSelected ? '<span class="absolute -inset-2 rounded-full bg-emerald-500/40 animate-ping"></span>' : ''}
          <div style="background: ${color}; color: #000000; border: 2px solid #ffffff; padding: 4px 10px; border-radius: 9999px; font-weight: 800; font-size: 11px; font-family: sans-serif; white-space: nowrap; box-shadow: 0 8px 20px rgba(0,0,0,0.6); display: flex; align-items: center; gap: 4px;">
            <span style="background: #000; color: #fff; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 900;">${numLabel}</span>
            <span>${stop.place.name}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: `theni-stop-marker-${index}`,
        html: markerHtml,
        iconSize: [140, 30],
        iconAnchor: [70, 15],
      });

      const marker = L.marker([stop.place.latitude, stop.place.longitude], { icon: customIcon }).addTo(map);

      // Popup content
      const driveInfo = index > 0 && segmentData[index - 1]
        ? `${segmentData[index - 1].durationMins} min (${segmentData[index - 1].distanceKm} km) driving`
        : "Starting Location";

      const popupContent = `
        <div style="padding: 6px; font-family: sans-serif; color: #ffffff; min-width: 160px;">
          <div style="font-size: 10px; font-weight: 800; color: #10b981; font-family: monospace;">STOP 0${index + 1}</div>
          <div style="font-size: 13px; font-weight: 800; color: #ffffff; margin-top: 2px;">${stop.place.name}</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">${driveInfo}</div>
          <div style="font-size: 11px; color: #cbd5e1; margin-top: 2px;">Visit: ${stop.visitDuration} min</div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on("click", () => {
        setSelectedStopIndex(index);
        map.panTo([stop.place.latitude, stop.place.longitude], { animate: true });
      });

      markersRef.current.push(marker);
    });
  };

  useEffect(() => {
    renderMapElements();
  }, [selectedCircuitId, selectedStopIndex, segmentData, resolvedStops]);

  // Geolocation trigger
  const handleUseMyLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setSelectedOrigin({
            label: "Current Location",
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {
          alert("Could not access location permission. Using default Theni Central Hub.");
        }
      );
    }
  };

  // Helper to format minutes into h & m
  const formatTimeHM = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} hr`;
    return `${h} hr ${m} min`;
  };

  // Generate Timestamps for Active Itinerary Mode
  const generateItinerarySchedule = () => {
    const [startH, startM] = startTime.split(":").map(Number);
    let currentTotalMins = startH * 60 + startM;

    return resolvedStops.map((stop, idx) => {
      if (idx > 0 && segmentData[idx - 1]) {
        currentTotalMins += segmentData[idx - 1].durationMins;
      }

      const arrivalH = Math.floor(currentTotalMins / 60) % 24;
      const arrivalM = currentTotalMins % 60;
      const arrivalFormatted = `${arrivalH.toString().padStart(2, "0")}:${arrivalM.toString().padStart(2, "0")}`;

      const departTotalMins = currentTotalMins + stop.visitDuration;
      const departH = Math.floor(departTotalMins / 60) % 24;
      const departM = departTotalMins % 60;
      const departFormatted = `${departH.toString().padStart(2, "0")}:${departM.toString().padStart(2, "0")}`;

      currentTotalMins = departTotalMins;

      return {
        ...stop,
        arrivalTime: arrivalFormatted,
        departureTime: departFormatted,
      };
    });
  };

  const itinerarySchedule = useMemo(() => generateItinerarySchedule(), [startTime, resolvedStops, segmentData]);

  const activeStop = resolvedStops[selectedStopIndex] || resolvedStops[0];

  return (
    <AppShell>
      {/* Hero Header */}
      <PageHeader
        eyebrow="THENI · TAMIL NADU"
        title="Theni Interactive Nature Trip Planner"
        description="Plan real multi-stop road itineraries with exact driving distances, visit durations, activities, and live WGS84 GPS navigation."
      />

      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 font-sans">
        {/* Origin & Travel Mode Bar */}
        <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-elevate mb-6 flex flex-wrap items-center justify-between gap-4">
          {/* Origin Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-mono font-bold text-primary uppercase flex items-center gap-1.5">
              <MapPin className="size-4 text-primary" /> Start Trip From:
            </span>

            <div className="flex items-center gap-2">
              <select
                value={selectedOrigin.label}
                onChange={(e) => {
                  const opt = ORIGIN_OPTIONS.find((o) => o.label === e.target.value);
                  if (opt) setSelectedOrigin(opt);
                }}
                className="bg-secondary text-foreground text-xs font-semibold rounded-xl px-3 py-2 border border-border focus:outline-none focus:border-primary"
              >
                {ORIGIN_OPTIONS.map((opt) => (
                  <option key={opt.label} value={opt.label}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleUseMyLocation}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition flex items-center gap-1"
              >
                <LocateFixed className="size-3.5" /> Use My Location
              </button>
            </div>
          </div>

          {/* Travel Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-muted-foreground uppercase">Mode:</span>
            <div className="flex items-center bg-secondary rounded-xl p-1 border border-border">
              <button
                type="button"
                onClick={() => setTravelMode("car")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  travelMode === "car" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                <Car className="size-3.5" /> Car
              </button>
              <button
                type="button"
                onClick={() => setTravelMode("motorcycle")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  travelMode === "motorcycle" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                <Bike className="size-3.5" /> Motorcycle
              </button>
            </div>
          </div>
        </div>

        {/* Circuit Selection Buttons */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-elevate mb-8">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2 text-primary font-mono text-xs font-semibold uppercase tracking-wider">
              <Compass className="size-4 text-primary" />
              <span>Select Curated Nature Circuit</span>
            </div>

            <button
              type="button"
              onClick={() => setIsTripActive(!isTripActive)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md ${
                isTripActive
                  ? "bg-rose-500 text-white hover:bg-rose-600"
                  : "bg-emerald-500 text-black hover:bg-emerald-400 font-extrabold"
              }`}
            >
              {isTripActive ? (
                <>
                  <RotateCcw className="size-4" /> Reset Itinerary Mode
                </>
              ) : (
                <>
                  <Play className="size-4 fill-black" /> Start Trip →
                </>
              )}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {TRIP_CIRCUITS.map((circuit) => {
              const isSelected = selectedCircuitId === circuit.id;
              return (
                <button
                  key={circuit.id}
                  type="button"
                  onClick={() => {
                    setSelectedCircuitId(circuit.id);
                    setSelectedStopIndex(0);
                  }}
                  className={`text-left p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-primary/15 border-primary text-foreground shadow-md ring-1 ring-primary"
                      : "bg-secondary/60 border-border/80 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-foreground mb-1 leading-snug">{circuit.name}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-2">{circuit.subtitle}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[10px] font-mono text-primary font-bold">
                    <span>{circuit.stops.length} Stops</span>
                    <span>{circuit.recommendedDuration.split(" ")[0]}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Trip Summary Banner */}
        <div className="rounded-3xl border border-primary/30 bg-primary/10 p-5 mb-8 backdrop-blur-md">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase">Driving Distance</p>
              <p className="font-display text-xl font-extrabold text-foreground mt-0.5">
                {routeLoading ? "..." : `${tripTotals.drivingDistKm} km`}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase">Driving Time</p>
              <p className="font-display text-xl font-extrabold text-foreground mt-0.5">
                {formatTimeHM(tripTotals.drivingMins)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase">Visit Duration</p>
              <p className="font-display text-xl font-extrabold text-foreground mt-0.5">
                {formatTimeHM(tripTotals.visitMins)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                Est. Total Trip Time
              </p>
              <p className="font-display text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {formatTimeHM(tripTotals.totalTripMins)}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase">Total Stops</p>
              <p className="font-display text-xl font-extrabold text-foreground mt-0.5">
                {tripTotals.stopsCount} Stops
              </p>
            </div>
          </div>
        </div>

        {/* Main Desktop (60% Map / 40% Timeline) Layout */}
        <div className="grid lg:grid-cols-12 gap-8 mb-12">
          {/* Left Column (60%): Interactive Map */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-elevate">
              <div className="flex items-center justify-between p-4 border-b border-border bg-card/60">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider font-mono">
                  <Navigation className="size-4 text-primary" />
                  <span>Interactive Route Map</span>
                </div>

                {/* Map Legend */}
                <div className="flex items-center gap-3 text-[10px] font-mono font-semibold">
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-blue-500"></span> Start
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-amber-500"></span> Stop
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-0.5 bg-emerald-500"></span> Route
                  </span>
                </div>
              </div>

              <div className="relative h-[420px] sm:h-[500px] w-full bg-background">
                <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />
              </div>
            </div>
          </div>

          {/* Right Column (40%): Trip Timeline & Active Stop Details */}
          <div className="lg:col-span-5 space-y-4">
            {/* Active Itinerary Header */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-elevate">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-base font-bold text-foreground">
                  {isTripActive ? "⏱️ Active Itinerary Timeline" : "📍 Circuit Stop Timeline"}
                </h3>
                {isTripActive && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground">Start:</span>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="bg-secondary text-foreground text-xs font-mono font-bold rounded-lg px-2 py-1 border border-border"
                    />
                  </div>
                )}
              </div>

              {/* Stop Timeline Items */}
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1 no-scrollbar">
                {resolvedStops.map((stop, idx) => {
                  const isSelected = selectedStopIndex === idx;
                  const sched = itinerarySchedule[idx];
                  const driveSegment = idx > 0 ? segmentData[idx - 1] : null;

                  return (
                    <div key={stop.placeId} className="relative">
                      {/* Segment Drive Time Pill (between stops) */}
                      {driveSegment && (
                        <div className="my-1.5 ml-6 pl-4 border-l-2 border-dashed border-emerald-500/40 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <span>↓ Drive {driveSegment.durationMins} min ({driveSegment.distanceKm} km)</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStopIndex(idx);
                          if (leafletMapRef.current) {
                            leafletMapRef.current.panTo([stop.place.latitude, stop.place.longitude], { animate: true });
                          }
                        }}
                        className={`w-full text-left p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? "bg-primary/15 border-primary shadow-sm"
                            : "bg-secondary/40 border-border/60 hover:bg-secondary"
                        }`}
                      >
                        <span className="size-7 rounded-full bg-emerald-500 text-black font-black text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-foreground truncate">{stop.place.name}</h4>
                            {isTripActive && (
                              <span className="text-[10px] font-mono font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-md">
                                {sched.arrivalTime} – {sched.departureTime}
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                            {stop.place.tagline || stop.place.description}
                          </p>

                          <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-muted-foreground">
                            {stop.visitDuration > 0 && <span>⏱️ Visit: {stop.visitDuration} min</span>}
                            <span>📍 {stop.place.district}</span>
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Selected Stop Detail Card */}
            {activeStop && (
              <div className="rounded-3xl border border-primary/40 bg-card p-5 shadow-elevate space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-primary uppercase">
                      Stop 0{selectedStopIndex + 1} Selected
                    </span>
                    <h3 className="font-display text-lg font-bold text-foreground">{activeStop.place.name}</h3>
                  </div>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${activeStop.place.latitude},${activeStop.place.longitude}&travelmode=driving`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition flex items-center gap-1.5 shadow-md shrink-0"
                  >
                    <ExternalLink className="size-3.5" /> Navigate →
                  </a>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">{activeStop.place.description}</p>

                {/* Activities Checklist */}
                {activeStop.activities && activeStop.activities.length > 0 && (
                  <div>
                    <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase mb-1.5">
                      Activities & Highlights
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {activeStop.activities.map((act) => (
                        <span
                          key={act}
                          className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[11px] font-semibold border border-primary/20 flex items-center gap-1"
                        >
                          <CheckCircle2 className="size-3 text-primary" /> {act}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* All 9 Theni Destinations Card Grid */}
        <div className="mt-12">
          <h3 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Flame className="size-5 text-primary" /> All Verified Theni Circuit Destinations
          </h3>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CANONICAL_PLACES.filter((p) => p.district === "Theni").map((dest) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35 }}
                className="flex flex-col rounded-3xl border border-border bg-card overflow-hidden shadow-elevate transition hover:border-primary/40 group"
              >
                <div className="relative h-44 w-full overflow-hidden bg-secondary">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {dest.categories.map((c) => (
                      <span
                        key={c}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-background/80 backdrop-blur-md text-primary border border-primary/20 uppercase font-mono"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h4 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                    {dest.name}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                    {dest.description}
                  </p>

                  <div className="mt-auto grid grid-cols-2 gap-2 pt-3 border-t border-border/60">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const circuitIndex = TRIP_CIRCUITS.findIndex((c) =>
                          c.stops.some((s) => s.placeId === dest.id)
                        );
                        if (circuitIndex !== -1) {
                          setSelectedCircuitId(TRIP_CIRCUITS[circuitIndex].id);
                          window.scrollTo({ top: 350, behavior: "smooth" });
                        }
                      }}
                      className="rounded-xl text-xs font-semibold border-border hover:bg-secondary"
                    >
                      <RouteIcon className="size-3.5 mr-1" /> View in Route
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => navigate({ to: "/planner", search: { prompt: `Plan a trip to ${dest.name}, Theni, Tamil Nadu` } })}
                      className="rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Sparkles className="size-3.5 mr-1" /> AI Plan
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
