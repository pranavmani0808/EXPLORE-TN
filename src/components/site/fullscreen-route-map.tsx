import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Navigation,
  Compass,
  ArrowRight,
  Maximize2,
  X,
  ChevronUp,
  ChevronDown,
  Clock,
  RotateCcw,
  Sparkles,
  Search,
  Check,
  LocateFixed,
  Car,
  Bike,
  Footprints,
} from "lucide-react";
import { CANONICAL_PLACES, resolvePlace, resolvePlaceById, ExplorerPlace } from "@/lib/data/canonical-places";
import { RouteApiRepository, IsolatedRouteResultDTO } from "@/lib/api-client/routes";

export interface FullscreenRouteMapProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialOriginPlaceId?: string;
  initialDestinationPlaceId?: string;
  initialTravelMode?: "driving" | "motorcycle" | "walking" | "cycling";
}

const ROUTE_LEG_CACHE = new Map<string, { distanceKm: number; durationMins: number; polyline: [number, number][] }>();

export function FullscreenRouteMap({
  isOpen = true,
  onClose,
  initialOriginPlaceId,
  initialDestinationPlaceId,
  initialTravelMode = "driving",
}: FullscreenRouteMapProps) {
  // Client-Aware Origin & Destination Selection State
  const [originQuery, setOriginQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [selectedOrigin, setSelectedOrigin] = useState<ExplorerPlace | null>(() => {
    return initialOriginPlaceId ? resolvePlaceById(initialOriginPlaceId) : null;
  });
  const [selectedDestination, setSelectedDestination] = useState<ExplorerPlace | null>(() => {
    return initialDestinationPlaceId ? resolvePlaceById(initialDestinationPlaceId) : null;
  });
  const [waypoints, setWaypoints] = useState<ExplorerPlace[]>([]);
  const [travelMode, setTravelMode] = useState<"driving" | "motorcycle" | "walking" | "cycling">(initialTravelMode);

  // Panel State: "expanded" | "compact" | "hidden"
  const [panelState, setPanelState] = useState<"expanded" | "compact" | "hidden">("expanded");
  const [searchFocused, setSearchFocused] = useState<"origin" | "destination" | null>(null);

  // Route Engine Calculation State
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [segmentData, setSegmentData] = useState<Array<{ distanceKm: number; durationMins: number; polyline: [number, number][] }>>([]);
  const [selectedStopIndex, setSelectedStopIndex] = useState<number>(0);
  const [geoLocating, setGeoLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Map References
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletModuleRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineGroupRef = useRef<any>(null);
  const activeRequestIdRef = useRef<string>("");

  // Sync initial props when passed
  useEffect(() => {
    if (initialOriginPlaceId) {
      const p = resolvePlaceById(initialOriginPlaceId);
      if (p) setSelectedOrigin(p);
    }
    if (initialDestinationPlaceId) {
      const p = resolvePlaceById(initialDestinationPlaceId);
      if (p) setSelectedDestination(p);
    }
  }, [initialOriginPlaceId, initialDestinationPlaceId]);

  // Request Client Browser Geolocation for Origin
  const handleUseCurrentLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    setGeoLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const currentLocPlace: ExplorerPlace = {
          id: "current-location",
          canonicalName: "My Current Location",
          name: "My Current Location",
          slug: "current-location",
          district: "GPS Location",
          state: "Current State",
          country: "India",
          latitude,
          longitude,
          categories: ["gps"],
          primaryCategory: "gps",
          tagline: "User Live GPS Location",
          description: "Live GPS coordinates detected from browser location API.",
          rating: 5.0,
          reviewsCount: 1,
          verified: true,
          source: "Device GPS",
        };
        setSelectedOrigin(currentLocPlace);
        setGeoLocating(false);
      },
      (err) => {
        setGeoLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError("Location permission denied. Please search & select your starting location.");
        } else {
          setGeoError("Unable to retrieve GPS coordinates. Please select your starting origin.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Route Stops Array: [Origin, ...Waypoints, Destination]
  const stops: ExplorerPlace[] = React.useMemo(() => {
    const arr: ExplorerPlace[] = [];
    if (selectedOrigin) arr.push(selectedOrigin);
    arr.push(...waypoints);
    if (selectedDestination) arr.push(selectedDestination);
    return arr;
  }, [selectedOrigin, waypoints, selectedDestination]);

  // Calculate Route via Provider-Agnostic Backend Route Engine
  useEffect(() => {
    if (!selectedOrigin || !selectedDestination) {
      setSegmentData([]);
      setRouteLoading(false);
      return;
    }

    const requestId = `route-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    activeRequestIdRef.current = requestId;
    setRouteLoading(true);
    setRouteError(null);

    const calculateAllSegments = async () => {
      const segments: Array<{ distanceKm: number; durationMins: number; polyline: [number, number][] }> = [];

      for (let i = 0; i < stops.length - 1; i++) {
        const origin = stops[i];
        const dest = stops[i + 1];
        const cacheKey = `${origin.latitude.toFixed(4)},${origin.longitude.toFixed(4)}:${dest.latitude.toFixed(4)},${dest.longitude.toFixed(4)}:${travelMode}`;

        if (ROUTE_LEG_CACHE.has(cacheKey)) {
          segments.push(ROUTE_LEG_CACHE.get(cacheKey)!);
          continue;
        }

        try {
          const res: IsolatedRouteResultDTO = await RouteApiRepository.calculateRoute({
            requestId,
            origin: { latitude: origin.latitude, longitude: origin.longitude, label: origin.canonicalName || origin.name },
            destination: { latitude: dest.latitude, longitude: dest.longitude, label: dest.canonicalName || dest.name },
            travelMode,
          });

          if (activeRequestIdRef.current !== requestId) return; // Discard stale response!

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
          const approxKm = Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 111 * 1.2 * 10) / 10;

          const fallbackSeg = {
            distanceKm: approxKm,
            durationMins: Math.round(approxKm * 1.4),
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
  }, [selectedOrigin, selectedDestination, waypoints, travelMode]);

  // Leaflet Map Initialization & Rendering
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current || stops.length === 0) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;
      leafletModuleRef.current = L;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!leafletMapRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [stops[0].latitude, stops[0].longitude],
          zoom: 9,
          zoomControl: false,
        });

        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a> & ExplorerTN Real Route Engine',
          maxZoom: 19,
          subdomains: "abcd",
        }).addTo(map);

        // Auto-collapse panel when user starts panning/zooming on map
        map.on("dragstart zoomstart", () => {
          setPanelState("compact");
        });

        leafletMapRef.current = map;
        polylineGroupRef.current = L.layerGroup().addTo(map);
      }

      const map = leafletMapRef.current;
      const polylineGroup = polylineGroupRef.current;

      markersRef.current.forEach((m) => map.removeLayer(m));
      markersRef.current = [];
      polylineGroup.clearLayers();

      const bounds = L.latLngBounds([]);

      // Render Numbered Stop Markers (①, ②, ③...) on true WGS84 GPS points
      stops.forEach((place, idx) => {
        bounds.extend([place.latitude, place.longitude]);

        const numberLabel = idx === 0 ? "START" : idx === stops.length - 1 ? "END" : `${idx}`;
        const isSelected = idx === selectedStopIndex;
        const pinBg = isSelected ? "#10b981" : idx === 0 ? "#0284c7" : "#0f172a";

        const customIcon = L.divIcon({
          className: `custom-route-pin-${place.id}`,
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
              ${isSelected ? '<span style="position: absolute; width: 42px; height: 42px; border-radius: 50%; background: rgba(16,185,129,0.35); animation: ping 1.5s infinite;"></span>' : ''}
              <div style="
                background: ${pinBg};
                color: #ffffff;
                border: 2px solid ${isSelected ? '#6ee7b7' : '#38bdf8'};
                font-weight: 800;
                font-size: 11px;
                padding: 4px 10px;
                border-radius: 9999px;
                box-shadow: 0 4px 14px rgba(0,0,0,0.6);
                white-space: nowrap;
                display: flex;
                align-items: center;
                gap: 4px;
                transition: all 0.2s ease;
              ">
                <span style="width: 7px; height: 7px; border-radius: 50%; background: ${isSelected ? '#000000' : '#10b981'};"></span>
                ${numberLabel} · ${place.canonicalName || place.name}
              </div>
            </div>
          `,
          iconSize: [140, 28],
          iconAnchor: [70, 14],
        });

        const marker = L.marker([place.latitude, place.longitude], {
          icon: customIcon,
          zIndexOffset: isSelected ? 2000 : 1000 - idx,
        }).addTo(map);

        marker.bindTooltip(`${idx + 1}. ${place.canonicalName || place.name}`, {
          permanent: isSelected,
          direction: "auto",
          offset: [0, -14],
          className: "custom-decluttered-map-tooltip",
        });

        marker.on("click", () => {
          setSelectedStopIndex(idx);
          map.flyTo([place.latitude, place.longitude], 11, { animate: true, duration: 1.2 });
        });

        markersRef.current.push(marker);
      });

      // Render Solid Road-Following Polylines
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

      // Auto-fit map bounds to encompass all stop points and road geometry
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [60, 60] });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [stops, segmentData, selectedStopIndex]);

  // Aggregate Total Trip Metrics
  const totalDistanceKm = React.useMemo(() => {
    return Math.round(segmentData.reduce((acc, seg) => acc + seg.distanceKm, 0) * 10) / 10;
  }, [segmentData]);

  const totalDurationMins = React.useMemo(() => {
    return segmentData.reduce((acc, seg) => acc + seg.durationMins, 0);
  }, [segmentData]);

  const durationString = React.useMemo(() => {
    const hrs = Math.floor(totalDurationMins / 60);
    const mins = totalDurationMins % 60;
    if (hrs === 0) return `${mins} min`;
    return `${hrs} hr ${mins} min`;
  }, [totalDurationMins]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-[#0B0F14] overflow-hidden font-sans text-white">
      {/* 100% Fullscreen Leaflet Map Container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />

      {/* Compact Floating Top Navbar / Header Bar */}
      <header className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none gap-3">
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 bg-[#121821]/90 backdrop-blur-2xl border border-white/15 hover:border-emerald-500/40 px-4 py-2.5 rounded-full text-xs font-bold text-white shadow-2xl transition cursor-pointer active:scale-95"
          >
            <ArrowRight className="w-4 h-4 rotate-180 text-emerald-400" /> Back to Explorer
          </button>
        </div>

        {/* Compact Top Route Search Bar */}
        <div className="relative pointer-events-auto flex items-center gap-2 bg-[#121821]/90 backdrop-blur-2xl border border-white/15 px-4 py-2 rounded-full shadow-2xl">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-bold text-emerald-400">{selectedOrigin ? selectedOrigin.name : "Select Origin"}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-sky-400">{selectedDestination ? selectedDestination.name : "Select Destination"}</span>
          </div>

          {totalDistanceKm > 0 && (
            <span className="ml-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
              {totalDistanceKm} km · {durationString}
            </span>
          )}
        </div>

        {/* Travel Mode Pills */}
        <div className="flex items-center gap-1 bg-[#121821]/90 backdrop-blur-2xl border border-white/15 p-1 rounded-full pointer-events-auto">
          {[
            { id: "driving", label: "Driving", icon: Car },
            { id: "motorcycle", label: "Motorcycle", icon: Bike },
            { id: "walking", label: "Walk", icon: Footprints },
          ].map((mode) => {
            const Icon = mode.icon;
            const isActive = travelMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setTravelMode(mode.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-emerald-500 text-black shadow-lg"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{mode.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Floating Draggable Left Directions Panel (Desktop & Mobile Bottom Sheet) */}
      <aside
        className={`absolute z-40 transition-all duration-300 pointer-events-auto ${
          panelState === "hidden"
            ? "-left-96 bottom-6"
            : panelState === "compact"
            ? "left-4 bottom-6 w-80 sm:w-96 max-h-48"
            : "left-4 top-20 bottom-6 w-80 sm:w-96"
        }`}
      >
        <div className="h-full bg-[#121821]/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-5 shadow-2xl flex flex-col overflow-hidden text-white">
          {/* Drag Handle Bar */}
          <div
            onClick={() => setPanelState((prev) => (prev === "expanded" ? "compact" : "expanded"))}
            className="w-full flex flex-col items-center cursor-pointer py-1 group"
          >
            <div className="w-12 h-1.5 rounded-full bg-white/20 group-hover:bg-emerald-400 transition" />
            <span className="text-[9px] text-slate-400 uppercase tracking-widest mt-1 font-mono">
              {panelState === "expanded" ? "Click/Drag to Collapse" : "Click/Drag to Expand"}
            </span>
          </div>

          {/* Panel Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mt-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Directions & Itinerary</h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPanelState((prev) => (prev === "expanded" ? "compact" : "expanded"))}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                {panelState === "expanded" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Location Origin / Destination Search Controls */}
          <div className="py-3 space-y-2 border-b border-white/10">
            {/* Origin Input */}
            <div className="relative">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
                <input
                  type="text"
                  placeholder="Select Origin..."
                  value={originQuery || (selectedOrigin ? selectedOrigin.canonicalName || selectedOrigin.name : "")}
                  onChange={(e) => {
                    setOriginQuery(e.target.value);
                    setSearchFocused("origin");
                  }}
                  onFocus={() => setSearchFocused("origin")}
                  className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={geoLocating}
                  title="Use My Current GPS Location"
                  className="p-1 text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
                >
                  <LocateFixed className={`w-4 h-4 ${geoLocating ? "animate-spin" : ""}`} />
                </button>
              </div>

              {/* Origin Spotlight Dropdown */}
              {searchFocused === "origin" && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#1a2332] border border-white/20 rounded-xl max-h-48 overflow-y-auto shadow-2xl p-1">
                  <div
                    onClick={handleUseCurrentLocation}
                    className="p-2.5 rounded-lg hover:bg-emerald-500/20 text-xs font-bold text-emerald-400 flex items-center gap-2 cursor-pointer"
                  >
                    <LocateFixed className="w-4 h-4" /> Use My Current GPS Location
                  </div>
                  {CANONICAL_PLACES.filter((p) =>
                    (p.canonicalName || p.name).toLowerCase().includes(originQuery.toLowerCase())
                  ).slice(0, 8).map((place) => (
                    <div
                      key={place.id}
                      onClick={() => {
                        setSelectedOrigin(place);
                        setOriginQuery("");
                        setSearchFocused(null);
                      }}
                      className="p-2 rounded-lg hover:bg-white/10 text-xs text-white flex items-center justify-between cursor-pointer"
                    >
                      <span>📍 {place.canonicalName || place.name}</span>
                      <span className="text-[10px] text-slate-400">{place.district}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Destination Input */}
            <div className="relative">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shrink-0"></span>
                <input
                  type="text"
                  placeholder="Select Destination..."
                  value={destinationQuery || (selectedDestination ? selectedDestination.canonicalName || selectedDestination.name : "")}
                  onChange={(e) => {
                    setDestinationQuery(e.target.value);
                    setSearchFocused("destination");
                  }}
                  onFocus={() => setSearchFocused("destination")}
                  className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Destination Spotlight Dropdown */}
              {searchFocused === "destination" && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#1a2332] border border-white/20 rounded-xl max-h-48 overflow-y-auto shadow-2xl p-1">
                  {CANONICAL_PLACES.filter((p) =>
                    (p.canonicalName || p.name).toLowerCase().includes(destinationQuery.toLowerCase())
                  ).slice(0, 8).map((place) => (
                    <div
                      key={place.id}
                      onClick={() => {
                        setSelectedDestination(place);
                        setDestinationQuery("");
                        setSearchFocused(null);
                      }}
                      className="p-2 rounded-lg hover:bg-white/10 text-xs text-white flex items-center justify-between cursor-pointer"
                    >
                      <span>⛰️ {place.canonicalName || place.name}</span>
                      <span className="text-[10px] text-slate-400">{place.district}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {geoError && <p className="text-[10px] text-rose-400 px-1">{geoError}</p>}
          </div>

          {/* NO ROUTE STATE */}
          {(!selectedOrigin || !selectedDestination) && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <Navigation className="w-8 h-8 text-emerald-400 mb-2 animate-bounce" />
              <h3 className="text-sm font-bold text-white">Select Origin & Destination</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Choose your starting location and destination above to calculate real road distance and ETAs.
              </p>
            </div>
          )}

          {/* EXPANDED ROUTE ITINERARY & STOPS LIST */}
          {selectedOrigin && selectedDestination && panelState === "expanded" && (
            <div className="flex-1 overflow-y-auto py-3 space-y-3 no-scrollbar">
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs">
                <div>
                  <div className="font-bold text-emerald-400">Total Journey Distance</div>
                  <div className="text-lg font-black text-white mt-0.5">{totalDistanceKm} km</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-400">Driving ETA</div>
                  <div className="text-lg font-black text-white mt-0.5">{durationString}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Journey Timeline ({stops.length} Stops)
                </div>
                {stops.map((stop, idx) => {
                  const isSelected = idx === selectedStopIndex;
                  const legInfo = idx > 0 && segmentData[idx - 1];

                  return (
                    <div
                      key={stop.id}
                      onClick={() => {
                        setSelectedStopIndex(idx);
                        if (leafletMapRef.current) {
                          leafletMapRef.current.flyTo([stop.latitude, stop.longitude], 11, { animate: true });
                        }
                      }}
                      className={`p-3 rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? "bg-emerald-500/20 border-emerald-500/50"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="grid size-5 place-items-center rounded-full bg-emerald-500 text-black font-extrabold text-[10px]">
                            {idx === 0 ? "S" : idx}
                          </span>
                          <span className="text-xs font-bold text-white">{stop.canonicalName || stop.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{stop.district}</span>
                      </div>

                      {legInfo && (
                        <div className="mt-2 text-[10px] text-emerald-400 font-mono flex items-center justify-between pt-1 border-t border-white/10">
                          <span>Segment Drive: {legInfo.distanceKm} km</span>
                          <span>ETA: {legInfo.durationMins} min</span>
                        </div>
                      )}

                      <div className="mt-2 flex items-center gap-2">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}&travelmode=driving`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-md bg-emerald-500 text-black font-bold text-[10px] hover:bg-emerald-400 transition"
                        >
                          Navigate →
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* COMPACT STATE SUMMARY */}
          {selectedOrigin && selectedDestination && panelState === "compact" && (
            <div className="py-2 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">
                  {selectedOrigin.name} → {selectedDestination.name}
                </div>
                <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
                  {totalDistanceKm} km · {durationString}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPanelState("expanded")}
                className="px-3 py-1.5 bg-emerald-500 text-black font-bold text-xs rounded-xl hover:bg-emerald-400 transition"
              >
                Expand →
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Floating Restore Button when Panel is Hidden */}
      {panelState === "hidden" && (
        <button
          type="button"
          onClick={() => setPanelState("expanded")}
          className="absolute left-4 bottom-6 z-40 px-4 py-2.5 bg-[#121821]/90 backdrop-blur-2xl border border-white/15 text-emerald-400 font-bold text-xs rounded-full shadow-2xl transition flex items-center gap-2 hover:bg-[#121821] cursor-pointer"
        >
          <Compass className="w-4 h-4" /> Restore Directions ({totalDistanceKm} km)
        </button>
      )}

      {/* Floating Map Zoom & Action Controls */}
      <div className="absolute right-4 bottom-6 z-40 flex flex-col gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          title="Center on My Location"
          className="p-3 bg-[#121821]/90 backdrop-blur-2xl border border-white/15 text-white rounded-full shadow-2xl hover:bg-emerald-500 hover:text-black transition cursor-pointer"
        >
          <LocateFixed className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => leafletMapRef.current?.zoomIn()}
          title="Zoom In"
          className="p-3 bg-[#121821]/90 backdrop-blur-2xl border border-white/15 text-white rounded-full shadow-2xl hover:bg-white/20 transition cursor-pointer font-extrabold text-sm"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => leafletMapRef.current?.zoomOut()}
          title="Zoom Out"
          className="p-3 bg-[#121821]/90 backdrop-blur-2xl border border-white/15 text-white rounded-full shadow-2xl hover:bg-white/20 transition cursor-pointer font-extrabold text-sm"
        >
          −
        </button>
      </div>
    </div>
  );
}
