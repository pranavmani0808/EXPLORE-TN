import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  MapPin,
  Navigation,
  Compass,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  LocateFixed,
  Car,
  Bike,
  Footprints,
  Coffee,
  Fuel,
  Utensils,
  Hotel,
  Clock,
  Sparkles,
  Check,
  Plus,
} from "lucide-react";
import { CANONICAL_PLACES, resolvePlaceById, ExplorerPlace } from "@/lib/data/canonical-places";
import { RouteApiRepository, IsolatedRouteResultDTO } from "@/lib/api-client/routes";
import { RouteStopRecommendationEngine, RouteStopCandidate } from "@/lib/routing/stop-recommendation-engine";

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
  // Origin & Destination State
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

  // Panel State & Phase 2 Recommendations Tab
  const [panelState, setPanelState] = useState<"expanded" | "compact" | "hidden">("expanded");
  const [activePanelTab, setActivePanelTab] = useState<"timeline" | "suggestions">("timeline");
  const [departureTime, setDepartureTime] = useState<string>("06:00 AM");
  const [searchFocused, setSearchFocused] = useState<"origin" | "destination" | null>(null);

  // Route Engine Calculation State
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [segmentData, setSegmentData] = useState<Array<{ distanceKm: number; durationMins: number; polyline: [number, number][] }>>([]);
  const [selectedStopIndex, setSelectedStopIndex] = useState<number>(0);
  const [geoLocating, setGeoLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Map & Search References
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
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

  // Click-Away Listener to Close Search Dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchFocused(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
  const stops: ExplorerPlace[] = useMemo(() => {
    const arr: ExplorerPlace[] = [];
    if (selectedOrigin) arr.push(selectedOrigin);
    arr.push(...waypoints);
    if (selectedDestination) arr.push(selectedDestination);
    return arr;
  }, [selectedOrigin, waypoints, selectedDestination]);

  // Aggregate Total Trip Metrics
  const totalDistanceKm = useMemo(() => {
    return Math.round(segmentData.reduce((acc, seg) => acc + seg.distanceKm, 0) * 10) / 10;
  }, [segmentData]);

  const totalDurationMins = useMemo(() => {
    return segmentData.reduce((acc, seg) => acc + seg.durationMins, 0);
  }, [segmentData]);

  const durationString = useMemo(() => {
    const hrs = Math.floor(totalDurationMins / 60);
    const mins = totalDurationMins % 60;
    if (hrs === 0) return `${mins} min`;
    return `${hrs} hr ${mins} min`;
  }, [totalDurationMins]);

  // Phase 2: Calculate Intelligent Rest, Meal & Overnight Recommendations
  const recommendationResult = useMemo(() => {
    if (!selectedOrigin || !selectedDestination || segmentData.length === 0) return null;
    const combinedPolyline = segmentData.flatMap((seg) => seg.polyline || []);
    if (combinedPolyline.length < 2) return null;

    return RouteStopRecommendationEngine.generateRecommendations({
      routePolyline: combinedPolyline,
      totalDistanceKm,
      totalDurationMinutes: totalDurationMins,
      departureTime,
      maxDetourKm: 5.0,
    });
  }, [selectedOrigin, selectedDestination, segmentData, totalDistanceKm, totalDurationMins, departureTime]);

  // Add Recommended Stop to Route Waypoints & Trigger Real Road Network Recalculation
  const handleAddRecommendedStop = (candidate: RouteStopCandidate) => {
    const placeObj: ExplorerPlace = candidate.placeObject || {
      id: candidate.placeId,
      canonicalName: candidate.name,
      name: candidate.name,
      slug: candidate.placeId,
      district: candidate.district,
      state: "Tamil Nadu",
      country: "India",
      latitude: candidate.lat,
      longitude: candidate.lng,
      categories: ["food"],
      primaryCategory: "food",
      tagline: candidate.tagline,
      description: candidate.reason,
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
      rating: candidate.rating,
      verified: true,
      source: "Route Stop Engine",
      tags: ["rest-stop", candidate.category],
    };

    if (waypoints.some((w) => w.id === placeObj.id)) return;

    setWaypoints((prev) => [...prev, placeObj]);
  };

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
        } catch (err: any) {
          if (activeRequestIdRef.current !== requestId) return;
          setRouteError(err?.message || "Road route unavailable. Could not calculate road network geometry.");
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
  }, [selectedOrigin, selectedDestination, waypoints, travelMode]);

  // Leaflet Map Initialization & Lifecycle Management
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    async function initMap() {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (!isMounted || !mapContainerRef.current) return;
      leafletModuleRef.current = L;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!leafletMapRef.current) {
        const initialCenter: [number, number] = stops.length > 0 ? [stops[0].latitude, stops[0].longitude] : [10.8, 78.2];

        const map = L.map(mapContainerRef.current, {
          center: initialCenter,
          zoom: 8,
          zoomControl: false,
          attributionControl: false,
        });

        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          maxZoom: 19,
          subdomains: "abcd",
        }).addTo(map);

        leafletMapRef.current = map;
        polylineGroupRef.current = L.layerGroup().addTo(map);

        requestAnimationFrame(() => {
          map.invalidateSize();
        });
      }

      renderRouteOnMap();
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

  // ResizeObserver for Container Sizing & Viewport Layout Safety
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    const invalidate = () => {
      if (leafletMapRef.current) {
        requestAnimationFrame(() => {
          leafletMapRef.current?.invalidateSize();
        });
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      invalidate();
    });

    resizeObserver.observe(mapContainerRef.current);
    window.addEventListener("resize", invalidate);
    window.addEventListener("orientationchange", invalidate);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", invalidate);
      window.removeEventListener("orientationchange", invalidate);
    };
  }, []);

  // Invalidate Size when panelState changes
  useEffect(() => {
    if (leafletMapRef.current) {
      setTimeout(() => {
        leafletMapRef.current?.invalidateSize();
      }, 300);
    }
  }, [panelState]);

  // Render Numbered Markers & Real Road Network Polylines
  const renderRouteOnMap = () => {
    const map = leafletMapRef.current;
    const L = leafletModuleRef.current;
    const polylineGroup = polylineGroupRef.current;

    if (!map || !L || !polylineGroup) return;

    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];
    polylineGroup.clearLayers();

    if (stops.length === 0) return;

    const bounds = L.latLngBounds([]);

    // 1. Render Numbered Stop Markers (①, ②, ③...) on true WGS84 GPS points
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

    // 2. Render Solid Real Road-Following Polylines
    segmentData.forEach((seg, idx) => {
      if (seg.polyline && seg.polyline.length > 0) {
        const isSelectedLeg = idx === selectedStopIndex;
        L.polyline(seg.polyline, {
          color: isSelectedLeg ? "#10b981" : "#0284c7",
          weight: isSelectedLeg ? 6 : 4,
          opacity: isSelectedLeg ? 0.95 : 0.8,
          lineJoin: "round",
        }).addTo(polylineGroup);

        seg.polyline.forEach((pt) => bounds.extend(pt));
      }
    });

    // 3. Auto-fit Map Viewport to Encompass Full Road Geometry + Stop Markers
    if (bounds.isValid()) {
      map.invalidateSize();
      map.fitBounds(bounds, {
        paddingTopLeft: [420, 100],
        paddingBottomRight: [80, 80],
        maxZoom: 14,
      });
    }
  };

  // Re-render route on map whenever stops or segment data updates
  useEffect(() => {
    renderRouteOnMap();
  }, [stops, segmentData, selectedStopIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 w-full h-full h-[100vh] h-[100dvh] min-h-[100vh] overflow-hidden bg-[#0B0F14] font-sans text-white relative">
      {/* 100% Fullscreen Leaflet Map Container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Compact Top Navigation Bar (z-index: 30 / 100) */}
      <header className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none gap-3">
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

        {/* Travel Mode Selector */}
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

      {/* Floating Directions Panel: Desktop TOP-LEFT (top-20 left-4), Mobile Bottom Sheet (z-index: 40 / 200) */}
      <aside
        className={`absolute z-40 transition-all duration-300 pointer-events-auto ${
          panelState === "hidden"
            ? "-left-96 top-20"
            : panelState === "compact"
            ? "left-4 top-20 w-80 sm:w-96 max-h-48"
            : "left-4 top-20 w-80 sm:w-[380px] max-h-[calc(100dvh-110px)] max-sm:top-auto max-sm:bottom-4 max-sm:left-4 max-sm:right-4 max-sm:w-auto max-sm:max-h-[70vh]"
        }`}
      >
        <div className="h-full bg-[#121821]/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-5 shadow-2xl flex flex-col overflow-hidden text-white">
          {/* Drag Handle Bar */}
          <div
            onClick={() => setPanelState((prev) => (prev === "expanded" ? "compact" : "expanded"))}
            className="w-full flex flex-col items-center cursor-pointer py-1 group shrink-0"
          >
            <div className="w-12 h-1.5 rounded-full bg-white/20 group-hover:bg-emerald-400 transition" />
            <span className="text-[9px] text-slate-400 uppercase tracking-widest mt-1 font-mono">
              {panelState === "expanded" ? "Click/Drag to Collapse" : "Click/Drag to Expand"}
            </span>
          </div>

          {/* Panel Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mt-2 shrink-0">
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

          {/* Location Origin & Destination Search Inputs */}
          <div ref={searchContainerRef} className="py-3 space-y-2 border-b border-white/10 shrink-0 relative">
            {/* Origin Input */}
            <div className="relative">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
                <input
                  type="text"
                  placeholder="Select Origin..."
                  value={searchFocused === "origin" ? originQuery : (selectedOrigin ? selectedOrigin.canonicalName || selectedOrigin.name : originQuery)}
                  onChange={(e) => {
                    setOriginQuery(e.target.value);
                    setSearchFocused("origin");
                  }}
                  onFocus={() => {
                    setSearchFocused("origin");
                    if (selectedOrigin && !originQuery) {
                      setOriginQuery(selectedOrigin.canonicalName || selectedOrigin.name);
                    }
                  }}
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
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#161e2b] border border-white/20 rounded-2xl max-h-52 overflow-y-auto shadow-2xl p-1.5 backdrop-blur-xl">
                  <div
                    onClick={() => {
                      handleUseCurrentLocation();
                      setSearchFocused(null);
                    }}
                    className="p-2.5 rounded-xl hover:bg-emerald-500/20 text-xs font-bold text-emerald-400 flex items-center gap-2 cursor-pointer mb-1 border border-emerald-500/30"
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
                      className="p-2.5 rounded-xl hover:bg-white/10 text-xs text-white flex items-center justify-between cursor-pointer transition"
                    >
                      <span className="font-semibold">📍 {place.canonicalName || place.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{place.district}</span>
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
                  value={searchFocused === "destination" ? destinationQuery : (selectedDestination ? selectedDestination.canonicalName || selectedDestination.name : destinationQuery)}
                  onChange={(e) => {
                    setDestinationQuery(e.target.value);
                    setSearchFocused("destination");
                  }}
                  onFocus={() => {
                    setSearchFocused("destination");
                    if (selectedDestination && !destinationQuery) {
                      setDestinationQuery(selectedDestination.canonicalName || selectedDestination.name);
                    }
                  }}
                  className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Destination Spotlight Dropdown */}
              {searchFocused === "destination" && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#161e2b] border border-white/20 rounded-2xl max-h-52 overflow-y-auto shadow-2xl p-1.5 backdrop-blur-xl">
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
                      className="p-2.5 rounded-xl hover:bg-white/10 text-xs text-white flex items-center justify-between cursor-pointer transition"
                    >
                      <span className="font-semibold">⛰️ {place.canonicalName || place.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{place.district}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {geoError && <p className="text-[10px] text-rose-400 px-1">{geoError}</p>}
            {routeError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-rose-400">
                  ⚠️ Road Route Unavailable
                </div>
                <p className="text-[11px] leading-snug">{routeError}</p>
                <button
                  type="button"
                  onClick={() => {
                    setRouteError(null);
                    setRouteLoading(true);
                  }}
                  className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-black font-bold text-[10px] rounded-lg transition"
                >
                  Retry Route Calculation
                </button>
              </div>
            )}
          </div>

          {/* NO ROUTE STATE */}
          {(!selectedOrigin || !selectedDestination) && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <Navigation className="w-8 h-8 text-emerald-400 mb-2 animate-bounce" />
              <h3 className="text-sm font-bold text-white">Select Origin & Destination</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Choose your starting location and destination above to calculate real road distance, ETAs, and rest recommendations.
              </p>
            </div>
          )}

          {/* PHASE 2: TAB SELECTOR (Timeline vs Rest & Meals Engine) */}
          {selectedOrigin && selectedDestination && panelState === "expanded" && (
            <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-xl my-2 shrink-0">
              <button
                type="button"
                onClick={() => setActivePanelTab("timeline")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activePanelTab === "timeline" ? "bg-emerald-500 text-black shadow-lg" : "text-slate-300 hover:text-white"
                }`}
              >
                <Compass className="w-3.5 h-3.5" /> Timeline ({stops.length})
              </button>
              <button
                type="button"
                onClick={() => setActivePanelTab("suggestions")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activePanelTab === "suggestions" ? "bg-emerald-500 text-black shadow-lg" : "text-slate-300 hover:text-white"
                }`}
              >
                <Coffee className="w-3.5 h-3.5" /> Rest & Meals {recommendationResult?.recommendations.length ? `(${recommendationResult.recommendations.length})` : ""}
              </button>
            </div>
          )}

          {/* EXPANDED ROUTE ITINERARY & STOPS LIST */}
          {selectedOrigin && selectedDestination && panelState === "expanded" && activePanelTab === "timeline" && (
            <div className="flex-1 overflow-y-auto py-2 space-y-3 pr-1">
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

          {/* PHASE 2: INTELLIGENT REST, MEAL & OVERNIGHT RECOMMENDATION ENGINE VIEW */}
          {selectedOrigin && selectedDestination && panelState === "expanded" && activePanelTab === "suggestions" && (
            <div className="flex-1 overflow-y-auto py-2 space-y-3 pr-1">
              {/* Departure Time Controls */}
              <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" /> Departure Time:
                </span>
                <select
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="bg-[#121821] border border-white/20 rounded-lg px-2.5 py-1 text-emerald-400 font-bold focus:outline-none cursor-pointer text-xs"
                >
                  {["05:00 AM", "06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM", "06:00 PM"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Long Journey Mode Active Banner */}
              {recommendationResult?.isLongJourney && (
                <div className="p-3 bg-gradient-to-r from-emerald-500/20 via-sky-500/20 to-purple-500/20 border border-emerald-500/40 rounded-xl text-xs space-y-1">
                  <div className="font-extrabold text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
                    LONG JOURNEY MODE ACTIVATED
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Route Distance: <span className="font-mono text-emerald-400 font-bold">{totalDistanceKm} km</span> · Expected Arrival: <span className="font-mono text-sky-300 font-bold">{recommendationResult.expectedArrivalTime}</span>
                  </div>
                </div>
              )}

              {/* Recommendations List */}
              {(!recommendationResult || recommendationResult.recommendations.length === 0) ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-white/5 border border-white/10 rounded-xl">
                  {totalDistanceKm < 150 ? (
                    <p>Short route ({totalDistanceKm} km) — Rest & meal stops are not required for trips under 150 km.</p>
                  ) : (
                    <p>No rest stops found within 5 km corridor detour of this route.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Suggested Stops Along Route Corridor ({recommendationResult.recommendations.length})
                  </div>

                  {recommendationResult.recommendations.map((rec) => {
                    const isAlreadyAdded = waypoints.some((w) => w.id === rec.placeId);
                    const CategoryIcon = rec.category === "tea" ? Coffee : rec.category === "fuel" ? Fuel : rec.category === "hotel" ? Hotel : Utensils;
                    const catBg = rec.category === "tea" ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : rec.category === "fuel" ? "bg-sky-500/20 text-sky-300 border-sky-500/40" : rec.category === "hotel" ? "bg-purple-500/20 text-purple-300 border-purple-500/40" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";

                    return (
                      <div
                        key={rec.placeId}
                        className="p-3 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl space-y-2 text-xs transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold flex items-center gap-1 ${catBg}`}>
                                <CategoryIcon className="w-3 h-3" />
                                {rec.category.toUpperCase()}
                              </span>
                              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                                ETA ~ {rec.estimatedArrivalTime}
                              </span>
                            </div>
                            <h4 className="font-bold text-white text-xs mt-1">{rec.name}</h4>
                            <p className="text-[11px] text-slate-300 mt-0.5">{rec.tagline}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-white/10">
                          <span>{rec.routeDistanceFromOriginKm} km from start</span>
                          <span>{rec.detourDistanceKm} km detour</span>
                          {rec.rating && <span className="text-amber-400 font-bold">★ {rec.rating}</span>}
                        </div>

                        <p className="text-[10px] text-emerald-300 italic">{rec.reason}</p>

                        <div className="pt-1 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => handleAddRecommendedStop(rec)}
                            disabled={isAlreadyAdded}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                              isAlreadyAdded
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                                : "bg-emerald-500 text-black hover:bg-emerald-400"
                            }`}
                          >
                            {isAlreadyAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" /> Added as Stop
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" /> Add Stop to Route
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
          className="absolute left-4 top-20 z-40 px-4 py-2.5 bg-[#121821]/90 backdrop-blur-2xl border border-white/15 text-emerald-400 font-bold text-xs rounded-full shadow-2xl transition flex items-center gap-2 hover:bg-[#121821] cursor-pointer"
        >
          <Compass className="w-4 h-4" /> Restore Directions ({totalDistanceKm} km)
        </button>
      )}

      {/* Floating Map Zoom & Action Controls (z-index: 50 / 300) */}
      <div className="absolute right-4 bottom-6 z-50 flex flex-col gap-2 pointer-events-auto">
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
