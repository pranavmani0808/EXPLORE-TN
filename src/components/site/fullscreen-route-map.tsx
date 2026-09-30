import React, { useState, useEffect, useRef, useMemo } from "react";
import { getGoogleTileUrl } from "@/lib/google-maps-loader";
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
  Bookmark,
  Layers,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import {
  CANONICAL_PLACES,
  GEOGRAPHIC_AREAS,
  GeographicArea,
  getPlacesWithinArea,
  searchEntities,
  resolvePlaceById,
  searchLocations,
  ExplorerPlace,
  PlaceCategory,
  CategorizedSearchResult,
} from "@/lib/data/canonical-places";
import { RouteApiRepository, IsolatedRouteResultDTO, RouteOption } from "@/lib/api-client/routes";
import { RouteStopRecommendationEngine, RouteStopCandidate } from "@/lib/routing/stop-recommendation-engine";
import { useAuthGuard } from "@/lib/auth-guard-context";
import { toast } from "sonner";

export interface FullscreenRouteMapProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialOriginPlaceId?: string;
  initialDestinationPlaceId?: string;
  initialTravelMode?: "driving" | "motorcycle" | "walking" | "cycling";
  initialArea?: string;
  initialPlaceId?: string;
}

const ROUTE_LEG_CACHE = new Map<string, { distanceKm: number; durationMins: number; polyline: [number, number][] }>();

export function FullscreenRouteMap({
  isOpen = true,
  onClose,
  initialOriginPlaceId,
  initialDestinationPlaceId,
  initialTravelMode = "driving",
  initialArea,
  initialPlaceId,
}: FullscreenRouteMapProps) {
  const { requireAuth } = useAuthGuard();

  // Map Explorer Scope State (GEOGRAPHIC SEARCH vs POI SEARCH)
  const [mapScope, setMapScope] = useState<{
    type: "ALL_TAMIL_NADU" | "CITY" | "DISTRICT" | "DESTINATION_AREA" | "POI";
    areaName: string;
    selectedArea?: GeographicArea | null;
    selectedPOI?: ExplorerPlace | null;
  }>(() => {
    if (initialPlaceId) {
      const p = resolvePlaceById(initialPlaceId);
      return { type: "POI", areaName: p.district || "Tamil Nadu", selectedPOI: p };
    }
    if (initialArea && GEOGRAPHIC_AREAS[initialArea.toLowerCase()]) {
      const area = GEOGRAPHIC_AREAS[initialArea.toLowerCase()];
      return { type: area.entityType, areaName: area.name, selectedArea: area };
    }
    if (initialArea) {
      return { type: "CITY", areaName: initialArea, selectedArea: null };
    }
    return { type: "ALL_TAMIL_NADU", areaName: "Tamil Nadu", selectedArea: GEOGRAPHIC_AREAS["tamil-nadu"] };
  });

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<PlaceCategory>("all");
  const [globalQuery, setGlobalQuery] = useState("");

  // Origin & Destination Routing State
  const [originQuery, setOriginQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [selectedOrigin, setSelectedOrigin] = useState<ExplorerPlace | null>(() => {
    return initialOriginPlaceId ? resolvePlaceById(initialOriginPlaceId) : null;
  });
  const [selectedDestination, setSelectedDestination] = useState<ExplorerPlace | null>(() => {
    return initialDestinationPlaceId ? resolvePlaceById(initialDestinationPlaceId) : null;
  });
  const [waypoints, setWaypoints] = useState<ExplorerPlace[]>([]);
  const [excludedStopIds, setExcludedStopIds] = useState<Set<string>>(new Set());
  const [travelMode, setTravelMode] = useState<"driving" | "motorcycle" | "walking" | "cycling">(initialTravelMode);

  // Alternative Routes State
  const [availableRoutes, setAvailableRoutes] = useState<RouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("fastest");

  // Panel State & Recommendations Tab
  const [panelState, setPanelState] = useState<"expanded" | "compact" | "hidden">("expanded");
  const [activePanelTab, setActivePanelTab] = useState<"explore" | "timeline" | "suggestions">("explore");
  const [departureTime, setDepartureTime] = useState<string>("06:00 AM");
  const [searchFocused, setSearchFocused] = useState<"global" | "origin" | "destination" | null>(null);

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

  // Derived list of places in current scope & category filter
  const placesInScope = useMemo(() => {
    let list = getPlacesWithinArea(mapScope.areaName);
    if (activeCategoryFilter !== "all") {
      list = list.filter((p) => p.categories?.includes(activeCategoryFilter) || p.primaryCategory === activeCategoryFilter);
    }
    return list;
  }, [mapScope.areaName, activeCategoryFilter]);

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

  // Fetch Alternative Routes when Origin/Destination/TravelMode changes
  useEffect(() => {
    if (!selectedOrigin || !selectedDestination) {
      setAvailableRoutes([]);
      setSelectedRouteId("fastest");
      return;
    }

    RouteApiRepository.fetchAlternativeRoutes({
      requestId: `alt-${Date.now()}`,
      origin: {
        latitude: selectedOrigin.latitude,
        longitude: selectedOrigin.longitude,
        name: selectedOrigin.canonicalName || selectedOrigin.name,
      },
      destination: {
        latitude: selectedDestination.latitude,
        longitude: selectedDestination.longitude,
        name: selectedDestination.canonicalName || selectedDestination.name,
      },
      travelMode,
    }).then((routes) => {
      setAvailableRoutes(routes);
      if (routes.length > 0 && !routes.some((r) => r.id === selectedRouteId)) {
        setSelectedRouteId(routes[0].id);
      }
    });
  }, [selectedOrigin, selectedDestination, travelMode]);

  // Click-Away Listener to Close Search Dropdowns
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
          state: "Tamil Nadu",
          country: "India",
          latitude,
          longitude,
          categories: ["all"],
          primaryCategory: "all",
          tagline: "User Live GPS Location",
          description: "Live GPS coordinates detected from browser location API.",
          rating: 5.0,
          reviewsCount: 1,
          verified: true,
          source: "Device GPS",
          tags: ["gps"],
        };
        setSelectedOrigin(currentLocPlace);
        setGeoLocating(false);
        toast.success("Live GPS origin set ✓");
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

  // Rest & Meals Stop Recommendation Engine
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

    setExcludedStopIds((prev) => {
      const next = new Set(prev);
      next.delete(candidate.placeId);
      return next;
    });

    if (!waypoints.some((w) => w.id === placeObj.id)) {
      setWaypoints((prev) => [...prev, placeObj]);
    }
  };

  const handleRemoveRecommendedStop = (placeId: string) => {
    setWaypoints((prev) => prev.filter((w) => w.id !== placeId));
    setExcludedStopIds((prev) => {
      const next = new Set(prev);
      next.add(placeId);
      return next;
    });
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

    const activeRouteOpt = availableRoutes.find((r) => r.id === selectedRouteId);

    if (activeRouteOpt && waypoints.length === 0 && activeRouteOpt.geometry.length > 0) {
      setSegmentData([
        {
          distanceKm: activeRouteOpt.distanceKm,
          durationMins: activeRouteOpt.durationMins,
          polyline: activeRouteOpt.geometry,
        },
      ]);
      setRouteLoading(false);
      return;
    }

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

          if (activeRequestIdRef.current !== requestId) return;

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
  }, [selectedOrigin, selectedDestination, waypoints, travelMode, selectedRouteId, availableRoutes]);

  // Leaflet Map Initialization & Scope Lifecycle
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
        const map = L.map(mapContainerRef.current, {
          center: [10.8, 78.7],
          zoom: 7,
          zoomControl: false,
          attributionControl: false,
        });

        L.tileLayer(getGoogleTileUrl("roadmap"), {
          maxZoom: 19,
          subdomains: "abcd",
        }).addTo(map);

        leafletMapRef.current = map;
        polylineGroupRef.current = L.layerGroup().addTo(map);

        requestAnimationFrame(() => {
          map.invalidateSize();
        });
      }

      renderMapElements();
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

  // ResizeObserver for Container Sizing
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

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", invalidate);
    };
  }, []);

  // Render Map Markers & Geometry based on Scope / Active Route
  const renderMapElements = () => {
    const map = leafletMapRef.current;
    const L = leafletModuleRef.current;
    const polylineGroup = polylineGroupRef.current;

    if (!map || !L || !polylineGroup) return;

    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];
    polylineGroup.clearLayers();

    const bounds = L.latLngBounds([]);

    // CASE A: Active Route Engine Mode (Origin & Destination selected)
    if (selectedOrigin && selectedDestination && stops.length > 1) {
      stops.forEach((place, idx) => {
        bounds.extend([place.latitude, place.longitude]);

        const numberLabel = idx === 0 ? "START" : idx === stops.length - 1 ? "END" : `${idx}`;
        const isSelected = idx === selectedStopIndex;
        const pinBg = isSelected ? "#2563eb" : idx === 0 ? "#0284c7" : "#0f172a";

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
              ">
                <span style="width: 7px; height: 7px; border-radius: 50%; background: ${isSelected ? '#000000' : '#10b981'};"></span>
                ${numberLabel} · ${place.canonicalName || place.name}
              </div>
            </div>
          `,
          iconSize: [140, 28],
          iconAnchor: [70, 14],
        });

        const marker = L.marker([place.latitude, place.longitude], { icon: customIcon }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; width: 220px; color: #fff;">
            <strong style="font-size: 14px; display: block; color: #34d399;">${place.canonicalName || place.name}</strong>
            <span style="font-size: 11px; color: #a1a1aa;">${place.district} District</span>
            <p style="font-size: 12px; margin: 4px 0; color: #e4e4e7;">${place.tagline || place.description}</p>
          </div>
        `, { className: "custom-mapcn-popup-window" });

        marker.on("click", () => {
          setSelectedStopIndex(idx);
          map.flyTo([place.latitude, place.longitude], 12, { animate: true });
        });

        markersRef.current.push(marker);
      });

      segmentData.forEach((seg, idx) => {
        if (seg.polyline && seg.polyline.length > 0) {
          const isSelectedLeg = idx === selectedStopIndex;

          L.polyline(seg.polyline, {
            color: "#0f172a",
            weight: isSelectedLeg ? 10 : 7,
            opacity: 0.85,
            lineJoin: "round",
          }).addTo(polylineGroup);

          L.polyline(seg.polyline, {
            color: isSelectedLeg ? "#3b82f6" : "#2563eb",
            weight: isSelectedLeg ? 8 : 6,
            opacity: 0.95,
            lineJoin: "round",
          }).addTo(polylineGroup);

          seg.polyline.forEach((pt) => bounds.extend(pt));
        }
      });

      if (bounds.isValid()) {
        map.fitBounds(bounds, { paddingTopLeft: [420, 100], paddingBottomRight: [80, 80], maxZoom: 14 });
      }
      return;
    }

    // CASE B: Geographic Scope / POI Area Exploration Mode
    placesInScope.forEach((place) => {
      bounds.extend([place.latitude, place.longitude]);

      const isSelectedPOI = mapScope.type === "POI" && mapScope.selectedPOI?.id === place.id;
      const categoryIcon = place.primaryCategory === "temples" ? "🛕" : place.primaryCategory === "heritage" ? "🏛️" : place.primaryCategory === "waterfalls" ? "💧" : "📍";

      const customIcon = L.divIcon({
        className: `custom-area-pin-${place.id}`,
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ${isSelectedPOI ? '<span style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(16,185,129,0.4); animation: ping 1.5s infinite;"></span>' : ''}
            <div style="
              background: ${isSelectedPOI ? '#10b981' : '#1e293b'};
              color: ${isSelectedPOI ? '#000000' : '#ffffff'};
              border: 2px solid ${isSelectedPOI ? '#6ee7b7' : 'rgba(255,255,255,0.2)'};
              font-weight: 700;
              font-size: 11px;
              padding: 4px 10px;
              border-radius: 9999px;
              box-shadow: 0 4px 14px rgba(0,0,0,0.6);
              white-space: nowrap;
              display: flex;
              align-items: center;
              gap: 4px;
            ">
              <span>${categoryIcon}</span>
              ${place.canonicalName || place.name}
            </div>
          </div>
        `,
        iconSize: [140, 28],
        iconAnchor: [70, 14],
      });

      const marker = L.marker([place.latitude, place.longitude], {
        icon: customIcon,
        zIndexOffset: isSelectedPOI ? 2000 : 1000,
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; width: 240px; color: #ffffff; padding: 2px;">
          <strong style="font-size: 15px; color: #34d399; display: block; margin-bottom: 2px;">${place.canonicalName || place.name}</strong>
          <span style="font-size: 11px; color: #a1a1aa;">${place.primaryCategory?.toUpperCase()} · ${place.district} District</span>
          <p style="font-size: 12px; margin: 6px 0; color: #d4d4d8; line-height: 1.4;">${place.tagline || place.description}</p>
          <div style="display: flex; gap: 6px; margin-top: 10px;">
            <button
              onclick="window.dispatchEvent(new CustomEvent('set-origin-event', { detail: '${place.id}' }))"
              style="flex: 1; padding: 6px; border-radius: 8px; background: rgba(16,185,129,0.2); border: 1px solid rgba(16,185,129,0.4); color: #6ee7b7; font-size: 10px; font-weight: 700; cursor: pointer;"
            >
              Set as Origin
            </button>
            <button
              onclick="window.dispatchEvent(new CustomEvent('set-dest-event', { detail: '${place.id}' }))"
              style="flex: 1; padding: 6px; border-radius: 8px; background: rgba(56,189,248,0.2); border: 1px solid rgba(56,189,248,0.4); color: #38bdf8; font-size: 10px; font-weight: 700; cursor: pointer;"
            >
              Set as Dest
            </button>
          </div>
        </div>
      `, { className: "custom-mapcn-popup-window" });

      marker.on("click", () => {
        setMapScope({ type: "POI", areaName: place.district, selectedPOI: place });
        map.flyTo([place.latitude, place.longitude], 14, { animate: true, duration: 1 });
      });

      markersRef.current.push(marker);
    });

    if (mapScope.type === "POI" && mapScope.selectedPOI) {
      map.flyTo([mapScope.selectedPOI.latitude, mapScope.selectedPOI.longitude], 14, { animate: true });
    } else if (bounds.isValid() && placesInScope.length > 0) {
      map.fitBounds(bounds, { paddingTopLeft: [400, 80], paddingBottomRight: [60, 60], maxZoom: 13 });
    }
  };

  // Listen for popup event dispatches
  useEffect(() => {
    const handleSetOrigin = (e: any) => {
      const placeId = e.detail;
      const place = resolvePlaceById(placeId);
      if (place) {
        setSelectedOrigin(place);
        toast.success(`Set ${place.canonicalName || place.name} as Route Origin ✓`);
      }
    };
    const handleSetDest = (e: any) => {
      const placeId = e.detail;
      const place = resolvePlaceById(placeId);
      if (place) {
        setSelectedDestination(place);
        toast.success(`Set ${place.canonicalName || place.name} as Route Destination ✓`);
      }
    };

    window.addEventListener("set-origin-event", handleSetOrigin);
    window.addEventListener("set-dest-event", handleSetDest);
    return () => {
      window.removeEventListener("set-origin-event", handleSetOrigin);
      window.removeEventListener("set-dest-event", handleSetDest);
    };
  }, []);

  // Re-render elements whenever scope, stops, or route updates
  useEffect(() => {
    renderMapElements();
  }, [mapScope, placesInScope, stops, segmentData, selectedStopIndex]);

  // Handle Geographic Area selection from search
  const handleSelectArea = (area: GeographicArea) => {
    setMapScope({
      type: area.entityType,
      areaName: area.name,
      selectedArea: area,
      selectedPOI: null,
    });
    setGlobalQuery("");
    setSearchFocused(null);
    toast.info(`Loaded ${area.name} Area Destinations ✓`);
  };

  // Handle POI selection from search
  const handleSelectPOI = (place: ExplorerPlace) => {
    setMapScope({
      type: "POI",
      areaName: place.district,
      selectedPOI: place,
    });
    setGlobalQuery("");
    setSearchFocused(null);
  };

  if (!isOpen) return null;

  const categorizedResults = searchEntities(globalQuery);

  return (
    <div className="fixed inset-0 z-50 w-full h-full h-[100vh] h-[100dvh] min-h-[100vh] overflow-hidden bg-[#0B0F14] font-sans text-white relative">
      {/* 100% Fullscreen Map Container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Top Header Bar */}
      <header className="absolute top-4 left-4 right-4 z-30 flex flex-wrap items-center justify-between pointer-events-none gap-3">
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 bg-[#121821]/90 backdrop-blur-2xl border border-white/15 hover:border-emerald-500/40 px-4 py-2.5 rounded-full text-xs font-bold text-white shadow-2xl transition cursor-pointer active:scale-95"
          >
            <ArrowRight className="w-4 h-4 rotate-180 text-emerald-400" /> Back to Explorer
          </button>
        </div>

        {/* Global Area & POI Search Bar */}
        <div ref={searchContainerRef} className="relative pointer-events-auto flex-1 max-w-md">
          <div className="flex items-center gap-2 bg-[#121821]/95 backdrop-blur-2xl border border-white/20 px-3.5 py-2 rounded-full shadow-2xl">
            <Search className="w-4 h-4 text-emerald-400 shrink-0" />
            <input
              type="text"
              placeholder="Search City (Madurai, Chennai), District or POI..."
              value={globalQuery}
              onChange={(e) => {
                setGlobalQuery(e.target.value);
                setSearchFocused("global");
              }}
              onFocus={() => setSearchFocused("global")}
              className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none font-medium"
            />
          </div>

          {/* Categorized Search Results Dropdown */}
          {searchFocused === "global" && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-[#121821]/95 border border-white/20 rounded-2xl max-h-80 overflow-y-auto shadow-2xl p-2 backdrop-blur-2xl space-y-1">
              {categorizedResults.length === 0 ? (
                <div className="p-3 text-xs text-slate-400 text-center">No locations or POIs found matching '{globalQuery}'</div>
              ) : (
                categorizedResults.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl hover:bg-white/10 text-xs text-white flex items-center justify-between gap-2 transition border border-transparent hover:border-white/10"
                  >
                    <div
                      onClick={() => {
                        if (item.area) handleSelectArea(item.area);
                        else if (item.place) handleSelectPOI(item.place);
                      }}
                      className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                    >
                      <span className="text-base">{item.icon}</span>
                      <div className="truncate">
                        <span className="font-bold text-white block truncate">{item.name}</span>
                        <span className="text-[10px] text-slate-400 block">{item.sublabel}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {item.area && (
                        <button
                          type="button"
                          onClick={() => handleSelectArea(item.area!)}
                          className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold cursor-pointer"
                        >
                          Explore Area
                        </button>
                      )}
                      {item.place && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSelectPOI(item.place!)}
                            className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold cursor-pointer"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrigin(item.place!);
                              setSearchFocused(null);
                              toast.success(`Set ${item.name} as Origin ✓`);
                            }}
                            className="px-1.5 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 text-[10px] font-bold cursor-pointer"
                          >
                            + Origin
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDestination(item.place!);
                              setSearchFocused(null);
                              toast.success(`Set ${item.name} as Destination ✓`);
                            }}
                            className="px-1.5 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 text-[10px] font-bold cursor-pointer"
                          >
                            + Dest
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
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
                  isActive ? "bg-emerald-500 text-black shadow-lg" : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{mode.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Left Explorer Panel */}
      <aside
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className={`absolute z-40 transition-all duration-300 pointer-events-auto ${
          panelState === "hidden"
            ? "-left-96 top-20"
            : panelState === "compact"
            ? "left-4 top-20 w-80 sm:w-96 max-h-48"
            : "left-4 top-20 w-80 sm:w-[380px] h-[calc(100dvh-100px)] max-h-[calc(100dvh-100px)] max-sm:top-auto max-sm:bottom-4 max-sm:left-4 max-sm:right-4 max-sm:w-auto max-sm:h-[70vh] max-sm:max-h-[70vh]"
        }`}
      >
        <div className="w-full h-full bg-[#121821]/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-4 shadow-2xl flex flex-col overflow-hidden text-white overscroll-contain">
          {/* Drag Handle */}
          <div
            onClick={() => setPanelState((prev) => (prev === "expanded" ? "compact" : "expanded"))}
            className="w-full flex flex-col items-center cursor-pointer py-1 group shrink-0"
          >
            <div className="w-12 h-1.5 rounded-full bg-white/20 group-hover:bg-emerald-400 transition" />
            <span className="text-[9px] text-slate-400 uppercase tracking-widest mt-1 font-mono">
              {panelState === "expanded" ? "Click to Collapse" : "Click to Expand"}
            </span>
          </div>

          {/* Panel Header & Breadcrumbs */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mt-1 shrink-0">
            <div>
              <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                <span
                  onClick={() => setMapScope({ type: "ALL_TAMIL_NADU", areaName: "Tamil Nadu", selectedArea: GEOGRAPHIC_AREAS["tamil-nadu"] })}
                  className="cursor-pointer hover:underline"
                >
                  Tamil Nadu
                </span>
                {mapScope.areaName !== "Tamil Nadu" && (
                  <>
                    <span>/</span>
                    <span className="text-white font-extrabold">{mapScope.areaName}</span>
                  </>
                )}
                {mapScope.selectedPOI && (
                  <>
                    <span>/</span>
                    <span className="text-sky-300 font-extrabold truncate max-w-[120px] inline-block">{mapScope.selectedPOI.canonicalName || mapScope.selectedPOI.name}</span>
                  </>
                )}
              </div>
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider mt-0.5">
                {mapScope.areaName.toUpperCase()} DESTINATIONS ({placesInScope.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setPanelState((prev) => (prev === "expanded" ? "compact" : "expanded"))}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              {panelState === "expanded" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>

          {/* Category Filter Pills Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 shrink-0 border-b border-white/10 custom-scrollbar">
            {[
              { id: "all", label: "All" },
              { id: "temples", label: "Temples" },
              { id: "heritage", label: "Heritage" },
              { id: "waterfalls", label: "Waterfalls" },
              { id: "hills", label: "Hills" },
              { id: "beaches", label: "Beaches" },
              { id: "food", label: "Food" },
              { id: "museums", label: "Museums" },
              { id: "trekking", label: "Trekking" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategoryFilter(cat.id as any)}
                className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition ${
                  activeCategoryFilter === cat.id
                    ? "bg-emerald-500 text-black shadow-md"
                    : "bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Optional Origin / Destination Active Bar */}
          {(selectedOrigin || selectedDestination) && (
            <div className="py-2.5 px-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl my-2 shrink-0 space-y-1">
              <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-between">
                <span>Active Route Corridor</span>
                {totalDistanceKm > 0 && <span>{totalDistanceKm} km · {durationString}</span>}
              </div>
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>{selectedOrigin ? selectedOrigin.name : "Origin"} → {selectedDestination ? selectedDestination.name : "Destination"}</span>
                <button
                  type="button"
                  onClick={() => { setSelectedOrigin(null); setSelectedDestination(null); setWaypoints([]); }}
                  className="text-[10px] text-rose-400 hover:underline font-normal"
                >
                  Clear Route
                </button>
              </div>
            </div>
          )}

          {/* Places List for Selected Scope */}
          {panelState === "expanded" && (
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-2 space-y-2 pr-1 custom-scrollbar">
              {placesInScope.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-white/5 border border-white/10 rounded-2xl my-2 space-y-2">
                  <p>No verified tourist places found in {mapScope.areaName} for this category filter.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategoryFilter("all");
                      setMapScope({ type: "ALL_TAMIL_NADU", areaName: "Tamil Nadu", selectedArea: GEOGRAPHIC_AREAS["tamil-nadu"] });
                    }}
                    className="text-emerald-400 font-bold underline cursor-pointer block mx-auto text-xs"
                  >
                    Reset to All Tamil Nadu Destinations
                  </button>
                </div>
              ) : (
                placesInScope.map((place) => {
                  const isSelected = mapScope.selectedPOI?.id === place.id;
                  const categoryIcon = place.primaryCategory === "temples" ? "🛕" : place.primaryCategory === "heritage" ? "🏛️" : place.primaryCategory === "waterfalls" ? "💧" : "📍";

                  return (
                    <div
                      key={place.id}
                      onClick={() => {
                        setMapScope({ type: "POI", areaName: place.district, selectedPOI: place });
                        if (leafletMapRef.current) {
                          leafletMapRef.current.flyTo([place.latitude, place.longitude], 14, { animate: true });
                        }
                      }}
                      className={`p-3 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? "bg-emerald-500/20 border-emerald-500/60 shadow-lg"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{categoryIcon}</span>
                          <h4 className="font-bold text-white text-xs truncate">{place.canonicalName || place.name}</h4>
                        </div>
                        <p className="text-[11px] text-slate-300 line-clamp-1">{place.tagline || place.description}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono pt-0.5">
                          <span className="text-emerald-400 font-bold uppercase">{place.primaryCategory}</span>
                          <span>•</span>
                          <span>{place.district} District</span>
                          <span>•</span>
                          <span>{place.rating ? `★ ${place.rating}` : "No reviews yet"}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrigin(place);
                            toast.success(`Set ${place.canonicalName || place.name} as Route Origin ✓`);
                          }}
                          className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold transition active:scale-95"
                        >
                          + Origin
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDestination(place);
                            toast.success(`Set ${place.canonicalName || place.name} as Route Destination ✓`);
                          }}
                          className="px-2 py-0.5 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-[9px] font-bold transition active:scale-95"
                        >
                          + Dest
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Floating Controls (Zoom & Location) */}
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
