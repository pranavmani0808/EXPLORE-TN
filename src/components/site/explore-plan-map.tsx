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

const DEFAULT_ORIGIN_OPTIONS: OriginOption[] = [
  { placeId: "direct-trail", name: "Direct Trail (Start at Stop 1)", latitude: 0, longitude: 0 },
  { placeId: "madurai-hub", name: "Madurai Central Hub", latitude: 9.9195, longitude: 78.1193 },
  { placeId: "theni", name: "Theni Central Hub", latitude: 10.0104, longitude: 77.4768 },
  { placeId: "chennai", name: "Chennai", latitude: 13.0827, longitude: 80.2707 },
  { placeId: "coimbatore", name: "Coimbatore", latitude: 11.0168, longitude: 76.9558 },
  { placeId: "bengaluru", name: "Bengaluru", latitude: 12.9716, longitude: 77.5946 },
];

// In-Memory Route Leg Cache (Key: `originPlaceId:destPlaceId:mode`)
const ROUTE_LEG_CACHE = new Map<string, { distanceKm: number; durationMins: number; polyline: [number, number][] }>();

export function ExplorePlanMap({
  plans,
  initialPlanId,
  originOptions = DEFAULT_ORIGIN_OPTIONS,
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
        const canonical = resolvePlaceById(stop.placeId);
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

  // Check if an external origin hub is selected (not direct trail)
  const isExternalOriginSelected = selectedOrigin && selectedOrigin.placeId !== "direct-trail";

  // Segment Road Route Calculation
  useEffect(() => {
    if (resolvedStops.length < 2) return;

    const requestId = `explore-plan-map-${selectedPlanId}-${Date.now()}`;
    activeRequestIdRef.current = requestId;
    setRouteLoading(true);

    const calculateAllSegments = async () => {
      const segments: Array<{ distanceKm: number; durationMins: number; polyline: [number, number][] }> = [];

      // Combine optional external origin + Plan Stops
      const waypoints = isExternalOriginSelected
        ? [
            { latitude: selectedOrigin.latitude, longitude: selectedOrigin.longitude, name: selectedOrigin.name },
            ...resolvedStops.map((s) => ({ latitude: s.place.latitude, longitude: s.place.longitude, name: s.place.name })),
          ]
        : resolvedStops.map((s) => ({ latitude: s.place.latitude, longitude: s.place.longitude, name: s.place.name }));

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
        } catch (err: any) {
          if (activeRequestIdRef.current !== requestId) return;
          setResolutionError(err?.message || "Road route unavailable. Could not fetch road network geometry.");
          setRouteLoading(false);
          return;
        }
      }

      if (activeRequestIdRef.current === requestId) {
        setSegmentData(segments);
        setRouteLoading(false);
      }
    };

    calculateAllSegments();
  }, [selectedPlanId, selectedOrigin, travelMode, resolvedStops, isExternalOriginSelected]);

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
          zoom: 11,
          zoomControl: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> & ExplorerTN Canonical Catalog',
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

      // 1. Plot External Starting Hub Marker if selected
      if (isExternalOriginSelected) {
        bounds.extend([selectedOrigin.latitude, selectedOrigin.longitude]);

        const originIcon = L.divIcon({
          className: "custom-origin-marker",
          html: `
            <div style="
              background-color: #0284c7;
              color: white;
              font-weight: 800;
              font-size: 10px;
              padding: 4px 8px;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2px solid white;
              box-shadow: 0 4px 14px rgba(0,0,0,0.4);
              white-space: nowrap;
            ">
              START: ${selectedOrigin.name.split(" ")[0]}
            </div>
          `,
          iconSize: [80, 24],
          iconAnchor: [40, 12],
        });

        const originMarker = L.marker([selectedOrigin.latitude, selectedOrigin.longitude], { icon: originIcon }).addTo(map);
        originMarker.bindTooltip(`START HUB: ${selectedOrigin.name}`, { direction: "top", offset: [0, -12] });
        markersRef.current.push(originMarker);
      }

      // 2. Plot Plan Stop Markers (Numbered 1, 2, 3, 4...)
      resolvedStops.forEach((stop, idx) => {
        const place = stop.place;
        bounds.extend([place.latitude, place.longitude]);

        const stopNumber = `${idx + 1}`;
        const isSelected = idx === selectedStopIndex;
        const markerBg = isSelected ? "#10b981" : "#0f172a";

        const customIcon = L.divIcon({
          className: "custom-stop-marker",
          html: `
            <div style="
              background-color: ${markerBg};
              color: white;
              font-weight: 800;
              font-size: 13px;
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
              ${stopNumber}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([place.latitude, place.longitude], { icon: customIcon }).addTo(map);

        marker.bindTooltip(`${stopNumber}. ${place.canonicalName || place.name}`, {
          permanent: isSelected,
          direction: "top",
          offset: [0, -16],
          className: "custom-decluttered-map-tooltip",
        });

        const legDist = idx > 0 && segmentData[idx] ? `${segmentData[idx].distanceKm} km` : isExternalOriginSelected ? "Via Hub" : "Start";
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

      // 3. Draw Solid Road Polyline Segments with Google Maps Casing
      segmentData.forEach((seg, idx) => {
        if (seg.polyline && seg.polyline.length > 0) {
          const legIndex = isExternalOriginSelected ? idx - 1 : idx;
          const isSelectedLeg = legIndex === selectedStopIndex;

          // Outer casing border (Google Maps road outline)
          L.polyline(seg.polyline, {
            color: "#0f172a",
            weight: isSelectedLeg ? 10 : 7,
            opacity: 0.85,
            lineJoin: "round",
            lineCap: "round",
          }).addTo(polylineGroup);

          // Inner navigation route line
          L.polyline(seg.polyline, {
            color: isSelectedLeg ? "#10b981" : "#0284c7",
            weight: isSelectedLeg ? 6 : 4,
            opacity: 0.95,
            lineJoin: "round",
            lineCap: "round",
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
  }, [resolvedStops, segmentData, selectedStopIndex, selectedOrigin, isExternalOriginSelected]);

  // Focus Map Viewport on selected stop card
  const handleSelectStop = (idx: number) => {
    setSelectedStopIndex(idx);
    const stop = resolvedStops[idx];
    if (stop && leafletMapRef.current) {
      leafletMapRef.current.flyTo([stop.place.latitude, stop.place.longitude], 13, { duration: 1 });
      const markerOffset = isExternalOriginSelected ? idx + 1 : idx;
      if (markersRef.current[markerOffset]) {
        markersRef.current[markerOffset].openPopup();
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
      const segIndex = isExternalOriginSelected ? idx + 1 : idx;
      if (idx > 0 && segmentData[segIndex]) {
        currentMins += segmentData[segIndex].durationMins;
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
        driveFromPrevKm: segmentData[segIndex] ? segmentData[segIndex].distanceKm : 0,
        driveFromPrevMins: segmentData[segIndex] ? segmentData[segIndex].durationMins : 0,
      };
    });
  }, [isTripActive, startTime, resolvedStops, segmentData, isExternalOriginSelected]);

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

      {/* Control Bar: Starting Hub & Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-900 border border-slate-800 p-4 text-white shadow-xl">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Start From:</span>
            <select
              value={selectedOrigin.placeId}
              onChange={(e) => {
                const found = originOptions.find((o) => o.placeId === e.target.value);
                if (found) setSelectedOrigin(found);
              }}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {originOptions.map((o) => (
                <option key={o.placeId} value={o.placeId}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setTravelMode("driving")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                travelMode === "driving" ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <Car className="size-3.5" /> Car
            </button>
            <button
              onClick={() => setTravelMode("motorcycle")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                travelMode === "motorcycle" ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <Bike className="size-3.5" /> Motorcycle
            </button>
          </div>
        </div>

        <Button
          onClick={() => setIsTripActive(!isTripActive)}
          className={`h-9 rounded-xl font-bold text-xs ${
            isTripActive ? "bg-amber-500 text-slate-950 hover:bg-amber-400" : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
          }`}
        >
          {isTripActive ? <RotateCcw className="mr-1.5 size-4" /> : <Play className="mr-1.5 size-4" />}
          {isTripActive ? "Reset Trip Schedule" : "Start Trip Schedule →"}
        </Button>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Driving Distance</span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
            {routeLoading ? "Calculating..." : `${totalDrivingKm} km`}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Driving Time</span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
            {routeLoading ? "..." : formatHours(totalDrivingMins)}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Visit Duration</span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
            {formatHours(totalVisitMins)}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Total Trip Duration</span>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {routeLoading ? "..." : formatHours(totalTripMins)}
          </div>
        </div>
      </div>

      {/* Main Split Layout: Map Left + Timeline Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* MAP DISPLAY COLUMN */}
        <div className="lg:col-span-6 relative h-[480px] rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl">
          <div ref={mapContainerRef} className="size-full" />

          {/* Map Legend Floating Banner */}
          <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-1 rounded-xl bg-slate-950/85 p-2.5 backdrop-blur-md text-[10px] text-white border border-slate-800 shadow-md">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-[#0284c7]" /> <span>Start Hub</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-[#0f172a] border border-white" /> <span>Stops (1, 2, 3...)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-[#10b981]" /> <span>Active Selected</span>
            </div>
          </div>
        </div>

        {/* ITINERARY TIMELINE & STOPS RIGHT COLUMN */}
        <div className="lg:col-span-6 space-y-4 rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-extrabold text-slate-900 dark:text-white">
              Itinerary Timeline & Stops ({resolvedStops.length})
            </h3>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">Canonical Resolved</span>
          </div>

          <div className="space-y-3">
            {resolvedStops.map((stop, idx) => {
              const isSelected = idx === selectedStopIndex;
              const place = stop.place;

              return (
                <div
                  key={stop.placeId}
                  onClick={() => handleSelectStop(idx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/10 shadow-lg ring-1 ring-emerald-500/50"
                      : "border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`size-8 rounded-full flex items-center justify-center text-xs font-extrabold text-white shrink-0 ${
                          isSelected ? "bg-emerald-500" : "bg-slate-900"
                        }`}
                      >
                        {idx + 1}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">{place.canonicalName || place.name}</h4>
                          <span className="text-[10px] text-slate-500 font-mono">{stop.placeId}</span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400">{place.tagline || place.description}</p>

                        {/* Activities */}
                        {stop.activities && stop.activities.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {stop.activities.map((act, i) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-medium">
                                {act}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}&travelmode=driving`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0"
                    >
                      Navigate →
                    </a>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200 dark:border-white/10 pt-2 font-mono">
                    <span>Rec. Visit: {stop.visitDurationMinutes || 60} min</span>
                    {isTripActive && itinerarySchedule[idx] && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        Arrival: {itinerarySchedule[idx].arrivalTime}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
