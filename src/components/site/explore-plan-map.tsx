import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  Clock,
  Navigation,
  Car,
  Bike,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Compass,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  resolvePlace,
  resolvePlaceById,
  ExplorerPlace,
  DestinationResolutionError,
} from "@/lib/data/canonical-places";
import { RouteApiRepository, IsolatedRouteResultDTO } from "@/lib/api-client/routes";
import heroImg from "@/assets/hero-ghats.jpg";

export interface ExplorePlanStop {
  placeId: string;
  order: number;
  visitDurationMinutes?: number;
  activities?: string[];
}

export interface ExplorePlan {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  originPlaceId?: string;
  stops: ExplorePlanStop[];
  travelMode?: "driving" | "motorcycle";
  categories?: string[];
}

export interface OriginOption {
  placeId: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface ExplorePlanMapProps {
  plans: ExplorePlan[];
  initialPlanId?: string;
  originOptions?: OriginOption[];
  title?: string;
  subtitle?: string;
  className?: string;
}

// In-Memory Route Leg Cache (Key: `originPlaceId:destPlaceId:mode`)
const ROUTE_LEG_CACHE = new Map<string, { distanceKm: number; durationMins: number; polyline: [number, number][] }>();

export function ExplorePlanMap({
  plans,
  initialPlanId,
  originOptions = [
    { placeId: "theni", name: "Theni Central Hub", latitude: 10.0104, longitude: 77.4768 },
    { placeId: "madurai", name: "Madurai City", latitude: 9.9195, longitude: 78.1193 },
    { placeId: "chennai", name: "Chennai", latitude: 13.0827, longitude: 80.2707 },
    { placeId: "coimbatore", name: "Coimbatore", latitude: 11.0168, longitude: 76.9558 },
    { placeId: "bengaluru", name: "Bengaluru", latitude: 12.9716, longitude: 77.5946 },
  ],
  title,
  subtitle,
  className = "",
}: ExplorePlanMapProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(initialPlanId || plans[0]?.id || "");
  const [selectedOrigin, setSelectedOrigin] = useState<OriginOption>(originOptions[0]);
  const [travelMode, setTravelMode] = useState<"driving" | "motorcycle">("driving");
  const [selectedStopIndex, setSelectedStopIndex] = useState<number>(0);

  // Active Schedule Mode
  const [isTripActive, setIsTripActive] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<string>("08:00");

  // Route Engine State
  const [segmentData, setSegmentData] = useState<
    Array<{ distanceKm: number; durationMins: number; polyline: [number, number][] }>
  >([]);
  const [routeLoading, setRouteLoading] = useState<boolean>(false);
  const [resolutionError, setResolutionError] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletModuleRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineGroupRef = useRef<any>(null);
  const activeRequestIdRef = useRef<string>("");

  // Active Plan Object
  const currentPlan = useMemo(() => {
    return plans.find((p) => p.id === selectedPlanId) || plans[0];
  }, [plans, selectedPlanId]);

  // Resolve All Stops via Canonical Place Engine
  const resolvedStops = useMemo(() => {
    setResolutionError(null);
    if (!currentPlan) return [];

    try {
      return currentPlan.stops.map((stop) => {
        const canonical = resolvePlace(stop.placeId);
        if (!canonical) {
          throw new DestinationResolutionError(stop.placeId);
        }
        return {
          ...stop,
          place: canonical,
        };
      });
    } catch (err: any) {
      const msg = err?.message || "Destination could not be resolved through Canonical Place Engine.";
      setResolutionError(msg);
      return [];
    }
  }, [currentPlan]);

  // Segment Road Route Calculation with Stale Request Protection
  useEffect(() => {
    if (resolvedStops.length < 2) return;

    const requestId = `explore-plan-map-${selectedPlanId}-${Date.now()}`;
    activeRequestIdRef.current = requestId;
    setRouteLoading(true);

    const calculateAllSegments = async () => {
      const segments: Array<{ distanceKm: number; durationMins: number; polyline: [number, number][] }> = [];

      // Combine Origin + Stops for full journey routing
      const waypoints = [
        { latitude: selectedOrigin.latitude, longitude: selectedOrigin.longitude, name: selectedOrigin.name },
        ...resolvedStops.map((s) => ({ latitude: s.place.latitude, longitude: s.place.longitude, name: s.place.name })),
      ];

      for (let i = 0; i < waypoints.length - 1; i++) {
        const origin = waypoints[i];
        const dest = waypoints[i + 1];
        const cacheKey = `${origin.latitude.toFixed(4)},${origin.longitude.toFixed(4)}:${dest.latitude.toFixed(4)},${dest.longitude.toFixed(4)}:${travelMode}`;

        if (ROUTE_LEG_CACHE.has(cacheKey)) {
          segments.push(ROUTE_LEG_CACHE.get(cacheKey)!);
          continue;
        }

        try {
          const res: IsolatedRouteResultDTO = await RouteApiRepository.calculateRoute({
            requestId,
            origin: { latitude: origin.latitude, longitude: origin.longitude, label: origin.name },
            destination: { latitude: dest.latitude, longitude: dest.longitude, label: dest.name },
            travelMode,
          });

          if (activeRequestIdRef.current !== requestId) return; // Reject stale responses!

          const segInfo = {
            distanceKm: res.summary.distanceKm,
            durationMins: res.summary.durationMins,
            polyline: res.geometry.coordinates as [number, number][],
          };

          ROUTE_LEG_CACHE.set(cacheKey, segInfo);
          segments.push(segInfo);
        } catch (err) {
          if (activeRequestIdRef.current !== requestId) return;
          // Fallback straight line polyline if OSRM service is unreachable
          const p1: [number, number] = [origin.latitude, origin.longitude];
          const p2: [number, number] = [dest.latitude, dest.longitude];
          const dLat = p2[0] - p1[0];
          const dLng = p2[1] - p1[1];
          const approxKm = Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 111 * 10) / 10;

          const fallbackSeg = {
            distanceKm: approxKm,
            durationMins: Math.round(approxKm * 1.5),
            polyline: [p1, p2] as [number, number][],
          };
          segments.push(fallbackSeg);
        }
      }

      if (activeRequestIdRef.current === requestId) {
        setSegmentData(segments);
        setRouteLoading(false);
      }
    };

    calculateAllSegments();
  }, [selectedPlanId, selectedOrigin, travelMode, resolvedStops]);

  // Leaflet Map Initialization & Dynamic Marker / Polyline Layer Update
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current || resolvedStops.length === 0) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;
      leafletModuleRef.current = L;

      // Fix standard leaflet icon path
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!leafletMapRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [resolvedStops[0].place.latitude, resolvedStops[0].place.longitude],
          zoom: 10,
          zoomControl: false,
        });

        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a> & ExplorerTN Canonical Catalog',
          maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: "topright" }).addTo(map);

        leafletMapRef.current = map;
        polylineGroupRef.current = L.layerGroup().addTo(map);
      }

      const map = leafletMapRef.current;
      const polylineGroup = polylineGroupRef.current;

      // Clear existing markers and lines
      markersRef.current.forEach((m) => map.removeLayer(m));
      markersRef.current = [];
      polylineGroup.clearLayers();

      const bounds = L.latLngBounds([]);

      // 1. Plot Numbered Stop Markers (①, ②, ③, ④...)
      resolvedStops.forEach((stop, idx) => {
        const place = stop.place;
        bounds.extend([place.latitude, place.longitude]);

        const numberCircle = idx === 0 ? "START" : `${idx}`;
        const markerBg = idx === selectedStopIndex ? "#10b981" : idx === 0 ? "#0284c7" : "#0f172a";

        const customIcon = L.divIcon({
          className: "custom-stop-marker",
          html: `
            <div style="
              background-color: ${markerBg};
              color: white;
              font-weight: 800;
              font-size: 12px;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 3px solid white;
              box-shadow: 0 4px 14px rgba(0,0,0,0.35);
              transition: all 0.2s ease;
            ">
              ${numberCircle}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([place.latitude, place.longitude], { icon: customIcon }).addTo(map);

        marker.bindTooltip(`${idx === 0 ? "START" : idx}. ${place.canonicalName || place.name}`, {
          permanent: idx === selectedStopIndex,
          direction: "top",
          offset: [0, -16],
          className: "custom-decluttered-map-tooltip",
        });

        const legDist = idx > 0 && segmentData[idx] ? `${segmentData[idx].distanceKm} km` : "Starting Hub";
        const legDuration = idx > 0 && segmentData[idx] ? `${segmentData[idx].durationMins} min` : "0 min";

        marker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; padding: 4px; max-width: 220px;">
            <div style="font-size: 10px; font-weight: 700; color: #10b981; text-transform: uppercase;">Stop #${stop.order} · ${place.district}</div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px;">${place.canonicalName || place.name}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">${place.tagline}</div>
            <div style="margin-top: 8px; font-size: 11px; background: #f1f5f9; padding: 6px; border-radius: 6px; display: flex; justify-content: space-between;">
              <span>Drive: <strong>${legDist}</strong></span>
              <span>ETA: <strong>${legDuration}</strong></span>
            </div>
            <div style="margin-top: 8px; display: flex; gap: 4px;">
              <a href="https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}&travelmode=driving" target="_blank" rel="noopener noreferrer" style="background: #10b981; color: white; text-decoration: none; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; flex: 1; text-align: center;">
                Navigate →
              </a>
            </div>
          </div>
        `);

        marker.on("click", () => {
          setSelectedStopIndex(idx);
        });

        markersRef.current.push(marker);
      });

      // 2. Draw Solid Road Polyline Segments
      segmentData.forEach((seg, idx) => {
        if (seg.polyline && seg.polyline.length > 0) {
          const isSelectedLeg = idx === selectedStopIndex;
          const polyline = L.polyline(seg.polyline, {
            color: isSelectedLeg ? "#10b981" : "#0284c7",
            weight: isSelectedLeg ? 6 : 4,
            opacity: isSelectedLeg ? 0.95 : 0.8,
            lineJoin: "round",
          }).addTo(polylineGroup);

          seg.polyline.forEach((pt) => bounds.extend(pt));
        }
      });

      // Auto-fit bounds so all stops + route polylines are nicely framed
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [resolvedStops, segmentData, selectedStopIndex]);

  // Focus Map Viewport on selected stop card
  const handleSelectStop = (idx: number) => {
    setSelectedStopIndex(idx);
    const stop = resolvedStops[idx];
    if (stop && leafletMapRef.current) {
      leafletMapRef.current.flyTo([stop.place.latitude, stop.place.longitude], 13, { duration: 1 });
      if (markersRef.current[idx]) {
        markersRef.current[idx].openPopup();
      }
    }
  };

  // Live Summary Metrics Calculations
  const totalDrivingKm = useMemo(() => {
    return Math.round(segmentData.reduce((acc, s) => acc + s.distanceKm, 0) * 10) / 10;
  }, [segmentData]);

  const totalDrivingMins = useMemo(() => {
    return segmentData.reduce((acc, s) => acc + s.durationMins, 0);
  }, [segmentData]);

  const totalVisitMins = useMemo(() => {
    return resolvedStops.reduce((acc, s) => acc + (s.visitDurationMinutes || 60), 0);
  }, [resolvedStops]);

  const totalTripMins = totalDrivingMins + totalVisitMins;

  const formatHours = (mins: number) => {
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    if (hrs === 0) return `${m}m`;
    return m === 0 ? `${hrs}h` : `${hrs}h ${m}m`;
  };

  // Itinerary Time Schedule Generator
  const itinerarySchedule = useMemo(() => {
    if (!isTripActive) return [];
    let currentMins = parseInt(startTime.split(":")[0], 10) * 60 + parseInt(startTime.split(":")[1], 10);

    return resolvedStops.map((stop, idx) => {
      if (idx > 0 && segmentData[idx]) {
        currentMins += segmentData[idx].durationMins;
      }
      const arrivalMins = currentMins;
      const visitMins = stop.visitDurationMinutes || 60;
      currentMins += visitMins;
      const departureMins = currentMins;

      const formatTime = (totalMins: number) => {
        const h = Math.floor(totalMins / 60) % 24;
        const m = totalMins % 60;
        const ampm = h >= 12 ? "PM" : "AM";
        const displayH = h % 12 === 0 ? 12 : h % 12;
        return `${displayH.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ampm}`;
      };

      return {
        stop,
        arrivalTime: formatTime(arrivalMins),
        departureTime: formatTime(departureMins),
        driveFromPrevKm: idx > 0 && segmentData[idx] ? segmentData[idx].distanceKm : 0,
        driveFromPrevMins: idx > 0 && segmentData[idx] ? segmentData[idx].durationMins : 0,
      };
    });
  }, [isTripActive, startTime, resolvedStops, segmentData]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header & Plan Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <Compass className="size-3.5" /> Canonical Road Route Engine
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            {title || currentPlan?.title || "Explore Road Trip Planner"}
          </h2>
          {subtitle && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{subtitle}</p>}
        </div>

        {/* Plan Switcher Pills */}
        {plans.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {plans.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPlanId(p.id);
                  setSelectedStopIndex(0);
                  setIsTripActive(false);
                }}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
                  selectedPlanId === p.id
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.02]"
                    : "bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Resolution Error Banner if place resolution fails */}
      {resolutionError && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 p-4 flex items-center gap-3 text-rose-800 dark:text-rose-200 text-sm">
          <ShieldAlert className="size-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <div className="flex-1 font-medium">{resolutionError}</div>
        </div>
      )}

      {/* Control Bar: Origin Selector, Mode Toggle, Start Trip */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121821] p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Origin Selector */}
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-emerald-500 shrink-0" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start From:</span>
            <select
              value={selectedOrigin.placeId}
              onChange={(e) => {
                const found = originOptions.find((o) => o.placeId === e.target.value);
                if (found) setSelectedOrigin(found);
              }}
              className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {originOptions.map((o) => (
                <option key={o.placeId} value={o.placeId} className="dark:bg-slate-900">
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          {/* Travel Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-lg border border-slate-200 dark:border-white/10">
            <button
              onClick={() => setTravelMode("driving")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                travelMode === "driving"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Car className="size-3.5" /> Car
            </button>
            <button
              onClick={() => setTravelMode("motorcycle")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                travelMode === "motorcycle"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Bike className="size-3.5" /> Motorcycle
            </button>
          </div>
        </div>

        {/* Start Trip Button */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {!isTripActive ? (
            <Button
              onClick={() => setIsTripActive(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl px-4 py-2 flex items-center gap-2 shadow-md shadow-emerald-600/20"
            >
              <Play className="size-3.5 fill-current" /> Start Trip Schedule →
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Clock className="size-3.5 animate-spin" /> Active Itinerary
              </span>
              <Button
                onClick={() => setIsTripActive(false)}
                variant="outline"
                className="text-xs font-bold rounded-xl px-3 py-1.5"
              >
                Reset
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121821] p-4 shadow-sm">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Driving Distance</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {routeLoading ? "Calculating..." : `${totalDrivingKm} km`}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121821] p-4 shadow-sm">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Driving Time</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {routeLoading ? "..." : formatHours(totalDrivingMins)}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121821] p-4 shadow-sm">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Visit Duration</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatHours(totalVisitMins)}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 shadow-sm">
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Total Trip Duration</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
            {routeLoading ? "..." : formatHours(totalTripMins)}
          </div>
        </div>
      </div>

      {/* Main 2-Column Desktop / Responsive Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Interactive Leaflet Road Route Map */}
        <div className="lg:col-span-7 flex flex-col rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121821] shadow-sm overflow-hidden min-h-[420px] lg:min-h-[540px] relative">
          <div ref={mapContainerRef} className="w-full h-full min-h-[420px] lg:min-h-[540px] z-0" />

          {/* Map Legend Overlay */}
          <div className="absolute top-4 left-4 z-10 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-2 border border-slate-200 dark:border-white/10 shadow-md text-xs font-medium space-y-1">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-sky-600" /> <span>Start Hub</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-slate-900 dark:bg-white" /> <span>Stops</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-emerald-500" /> <span>Active Selected</span>
            </div>
          </div>
        </div>

        {/* Timeline & Stop Details Panel */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121821] p-6 shadow-sm flex-1">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Itinerary Timeline & Stops ({resolvedStops.length})</span>
              <span className="text-xs font-mono text-slate-400">Canonical Resolved</span>
            </h3>

            <div className="mt-4 space-y-4 max-h-[480px] overflow-y-auto pr-1">
              {isTripActive && itinerarySchedule.length > 0 ? (
                // Active Schedule Itinerary Mode
                itinerarySchedule.map((sched, idx) => (
                  <div
                    key={sched.stop.placeId}
                    onClick={() => handleSelectStop(idx)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      idx === selectedStopIndex
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20"
                        : "border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="size-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                          {idx === 0 ? "START" : idx}
                        </span>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {sched.stop.place.canonicalName || sched.stop.place.name}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded">
                        {sched.arrivalTime}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                      {sched.stop.place.tagline}
                    </p>

                    {idx > 0 && (
                      <div className="mt-3 text-xs text-slate-500 border-t border-slate-200/60 dark:border-white/5 pt-2 flex items-center justify-between">
                        <span>Drive from previous: <strong>{sched.driveFromPrevKm} km</strong></span>
                        <span>ETA: <strong>{sched.driveFromPrevMins} mins</strong></span>
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-white/5">
                      <span className="text-xs font-medium text-slate-500">Visit: {sched.stop.visitDurationMinutes || 60} mins</span>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${sched.stop.place.latitude},${sched.stop.place.longitude}&travelmode=driving`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
                      >
                        Navigate →
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                // Standard Stop Timeline Mode
                resolvedStops.map((stop, idx) => (
                  <div
                    key={stop.placeId}
                    onClick={() => handleSelectStop(idx)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      idx === selectedStopIndex
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20"
                        : "border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="size-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center">
                          {idx === 0 ? "START" : idx}
                        </span>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {stop.place.canonicalName || stop.place.name}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {stop.place.district}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                      {stop.place.tagline}
                    </p>

                    {stop.activities && stop.activities.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {stop.activities.slice(0, 3).map((act, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-200/60 dark:bg-white/10 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium"
                          >
                            {act}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-white/5">
                      <span className="text-xs font-medium text-slate-500">Rec. Visit: {stop.visitDurationMinutes || 60} min</span>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${stop.place.latitude},${stop.place.longitude}&travelmode=driving`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
                      >
                        Navigate →
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
