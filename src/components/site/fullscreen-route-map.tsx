import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  X,
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
import { getSavedPlaces, savePlaceToCollection, removeSavedPlace } from "@/lib/explorer-gamification";
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


// All 38 Tamil Nadu Districts with approximate center coordinates
const TN_DISTRICTS: { name: string; lat: number; lng: number; zoom: number }[] = [
  { name: 'Chennai', lat: 13.0827, lng: 80.2707, zoom: 12 },
  { name: 'Tiruvallur', lat: 13.1436, lng: 79.9068, zoom: 11 },
  { name: 'Chengalpattu', lat: 12.6922, lng: 79.9722, zoom: 11 },
  { name: 'Kancheepuram', lat: 12.8308, lng: 79.7086, zoom: 11 },
  { name: 'Vellore', lat: 12.9165, lng: 79.1325, zoom: 10 },
  { name: 'Ranipet', lat: 12.9279, lng: 79.3328, zoom: 10 },
  { name: 'Tirupattur', lat: 12.4958, lng: 78.5683, zoom: 10 },
  { name: 'Krishnagiri', lat: 12.5266, lng: 78.2139, zoom: 10 },
  { name: 'Dharmapuri', lat: 12.1182, lng: 77.9283, zoom: 10 },
  { name: 'Salem', lat: 11.6643, lng: 78.1460, zoom: 10 },
  { name: 'Namakkal', lat: 11.2183, lng: 78.1673, zoom: 10 },
  { name: 'Erode', lat: 11.3410, lng: 77.7172, zoom: 10 },
  { name: 'Tirupur', lat: 11.1085, lng: 77.3411, zoom: 10 },
  { name: 'Coimbatore', lat: 11.0168, lng: 76.9558, zoom: 11 },
  { name: 'The Nilgiris', lat: 11.4067, lng: 76.6954, zoom: 10 },
  { name: 'Tiruvannamalai', lat: 12.2253, lng: 79.0747, zoom: 10 },
  { name: 'Viluppuram', lat: 11.9396, lng: 79.4927, zoom: 10 },
  { name: 'Villupuram', lat: 11.9396, lng: 79.4927, zoom: 10 },
  { name: 'Kallakurichi', lat: 11.7383, lng: 78.9590, zoom: 10 },
  { name: 'Cuddalore', lat: 11.7480, lng: 79.7714, zoom: 10 },
  { name: 'Ariyalur', lat: 11.1404, lng: 79.0783, zoom: 10 },
  { name: 'Perambalur', lat: 11.2339, lng: 78.8804, zoom: 10 },
  { name: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047, zoom: 11 },
  { name: 'Karur', lat: 10.9601, lng: 78.0766, zoom: 10 },
  { name: 'Dindigul', lat: 10.3624, lng: 77.9695, zoom: 10 },
  { name: 'Theni', lat: 10.0130, lng: 77.4769, zoom: 10 },
  { name: 'Madurai', lat: 9.9252, lng: 78.1198, zoom: 11 },
  { name: 'Sivaganga', lat: 9.8464, lng: 78.4839, zoom: 10 },
  { name: 'Virudhunagar', lat: 9.5839, lng: 77.9628, zoom: 10 },
  { name: 'Tenkasi', lat: 8.9595, lng: 77.3155, zoom: 10 },
  { name: 'Tirunelveli', lat: 8.7139, lng: 77.7567, zoom: 11 },
  { name: 'Thoothukudi', lat: 8.7642, lng: 78.1348, zoom: 10 },
  { name: 'Kanyakumari', lat: 8.0883, lng: 77.5385, zoom: 11 },
  { name: 'Ramanathapuram', lat: 9.3638, lng: 78.8395, zoom: 10 },
  { name: 'Pudukottai', lat: 10.3793, lng: 78.8171, zoom: 10 },
  { name: 'Thanjavur', lat: 10.7870, lng: 79.1378, zoom: 11 },
  { name: 'Nagapattinam', lat: 10.7667, lng: 79.8420, zoom: 10 },
  { name: 'Tiruvarur', lat: 10.7694, lng: 79.6364, zoom: 10 },
  { name: 'Mayiladuthurai', lat: 11.1019, lng: 79.6516, zoom: 10 },
];

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

  // Saved Places Collection State & Sync
  const [savedPlaceIds, setSavedPlaceIds] = useState<Set<string>>(() => {
    return new Set(getSavedPlaces().map((p) => p.id));
  });

  useEffect(() => {
    const handleSavedUpdated = () => {
      setSavedPlaceIds(new Set(getSavedPlaces().map((p) => p.id)));
    };
    window.addEventListener("etn_saved_places_updated", handleSavedUpdated);
    return () => {
      window.removeEventListener("etn_saved_places_updated", handleSavedUpdated);
    };
  }, []);

  const toggleSavePlace = (place: ExplorerPlace) => {
    const isSaved = savedPlaceIds.has(place.id);
    if (isSaved) {
      removeSavedPlace(place.id);
      toast.success(`Removed ${place.canonicalName || place.name} from saved places`);
    } else {
      savePlaceToCollection({
        id: place.id,
        name: place.canonicalName || place.name,
        category: place.primaryCategory || "all",
        district: place.district || "Tamil Nadu",
        imageUrl: place.image,
        rating: place.rating,
        savedAt: new Date().toISOString(),
      });
      toast.success(`Saved ${place.canonicalName || place.name} to collection ⭐`);
    }
  };

  const [isDirectionsFocusMode, setIsDirectionsFocusMode] = useState<boolean>(() => {
    return Boolean(initialDestinationPlaceId && !initialOriginPlaceId);
  });
  const [focusOriginQuery, setFocusOriginQuery] = useState("");

  const handleGetDirections = (place: ExplorerPlace) => {
    setSelectedDestination(place);
    setIsDirectionsFocusMode(true);
    setPanelState("compact");
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([place.latitude, place.longitude], 13, { animate: true, duration: 1.2 });
    }
    toast.info(`Please select your starting origin for directions to ${place.canonicalName || place.name} 🧭`);
  };

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
    if (initialArea) {
      const cleanAreaKey = initialArea.toLowerCase().replace(/[-+]/g, " ").trim();
      const areaKey = Object.keys(GEOGRAPHIC_AREAS).find(k => k.toLowerCase() === cleanAreaKey || k.toLowerCase().replace(/[-+]/g, " ") === cleanAreaKey);
      if (areaKey) {
        const area = GEOGRAPHIC_AREAS[areaKey];
        return { type: area.entityType, areaName: area.name, selectedArea: area };
      }
      const displayName = initialArea.replace(/\+/g, " ");
      return { type: "DESTINATION_AREA", areaName: displayName, selectedArea: null };
    }
    return { type: "ALL_TAMIL_NADU", areaName: "Tamil Nadu", selectedArea: GEOGRAPHIC_AREAS["tamil-nadu"] };
  });

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<PlaceCategory>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [globalQuery, setGlobalQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState<string>("");

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
  const [waypointQuery, setWaypointQuery] = useState("");
  const [excludedStopIds, setExcludedStopIds] = useState<Set<string>>(new Set());
  const [travelMode, setTravelMode] = useState<"driving" | "motorcycle" | "walking" | "cycling">(initialTravelMode);

  // Auto-close Focus Mode Origin Prompt once both Origin & Destination are selected
  useEffect(() => {
    if (selectedOrigin && selectedDestination) {
      setIsDirectionsFocusMode(false);
    }
  }, [selectedOrigin, selectedDestination]);

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
  const markersByIdRef = useRef<Record<string, any>>({});
  const polylineGroupRef = useRef<any>(null);
  const activeRequestIdRef = useRef<string>("");
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null);

  // Derived list of places in current scope & category filter
  const placesInScope = useMemo(() => {
    let list = getPlacesWithinArea(mapScope.areaName);
    if (activeCategoryFilter !== "all") {
      list = list.filter((p) => p.categories?.includes(activeCategoryFilter) || p.primaryCategory === activeCategoryFilter);
    }
    if (selectedDistrict) {
      list = list.filter((p) => p.district?.toLowerCase() === selectedDistrict.toLowerCase());
    }
    return list;
  }, [mapScope.areaName, activeCategoryFilter, selectedDistrict]);

  // Sync initial props when passed
  useEffect(() => {
    if (initialOriginPlaceId) {
      const p = resolvePlaceById(initialOriginPlaceId);
      if (p) setSelectedOrigin(p);
    }
    if (initialDestinationPlaceId) {
      const p = resolvePlaceById(initialDestinationPlaceId);
      if (p) {
        setSelectedDestination(p);
        if (!initialOriginPlaceId) {
          setIsDirectionsFocusMode(true);
        }
      }
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
    markersByIdRef.current = {};
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
      const categoryColor =
        place.primaryCategory === "temples" ? "#f59e0b" :
        place.primaryCategory === "waterfalls" ? "#38bdf8" :
        place.primaryCategory === "beaches" ? "#06b6d4" :
        place.primaryCategory === "heritage" ? "#a78bfa" :
        place.primaryCategory === "hills" ? "#4ade80" :
        place.primaryCategory === "food" ? "#fb923c" :
        "#10b981";

      // Minimal dot pin — no text label, just a clean circle
      const dotIcon = L.divIcon({
        className: `custom-dot-pin-${place.id}`,
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ${isSelectedPOI ? '<span style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(16,185,129,0.35); animation: ping 1.5s infinite;"></span>' : ''}
            <div style="
              width: ${isSelectedPOI ? '14px' : '10px'};
              height: ${isSelectedPOI ? '14px' : '10px'};
              border-radius: 50%;
              background: ${isSelectedPOI ? '#10b981' : categoryColor};
              border: 2px solid ${isSelectedPOI ? '#6ee7b7' : 'rgba(255,255,255,0.55)'};
              box-shadow: 0 2px 8px rgba(0,0,0,0.55);
              transition: transform 0.15s ease;
            "></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker([place.latitude, place.longitude], {
        icon: dotIcon,
        zIndexOffset: isSelectedPOI ? 2000 : 1000,
      }).addTo(map);

      // Attach a lightweight tooltip that shows the place name on hover
      const categoryEmoji =
        place.primaryCategory === "temples" ? "🛕" :
        place.primaryCategory === "waterfalls" ? "💧" :
        place.primaryCategory === "beaches" ? "🏖️" :
        place.primaryCategory === "heritage" ? "🏛️" :
        place.primaryCategory === "hills" ? "⛰️" :
        place.primaryCategory === "food" ? "🍲" : "📍";

      marker.bindTooltip(
        `<div style="font-family:system-ui,sans-serif;font-size:12px;font-weight:700;color:#fff;background:#121821cc;padding:4px 10px;border-radius:999px;border:1px solid rgba(255,255,255,0.18);white-space:nowrap;box-shadow:0 2px 12px rgba(0,0,0,0.5);">${categoryEmoji} ${place.canonicalName || place.name}</div>`,
        {
          permanent: false,
          direction: "top",
          offset: [0, -10],
          className: "etn-minimal-tooltip",
          opacity: 1,
        }
      );

      const isSaved = savedPlaceIds.has(place.id);

      marker.bindPopup(`
        <div style="font-family: system-ui, -apple-system, sans-serif; width: 250px; color: #ffffff; padding: 4px;">
          <strong style="font-size: 15px; color: #34d399; display: block; margin-bottom: 2px;">${place.canonicalName || place.name}</strong>
          <span style="font-size: 11px; color: #a1a1aa;">${place.primaryCategory?.toUpperCase()} · ${place.district} District</span>
          <p style="font-size: 12px; margin: 6px 0; color: #d4d4d8; line-height: 1.4;">${place.tagline || place.description}</p>
          
          <div style="display: flex; gap: 6px; margin-top: 10px;">
            <button
              onclick="window.dispatchEvent(new CustomEvent('directions-place-event', { detail: '${place.id}' }))"
              style="flex: 1; padding: 6px; border-radius: 8px; background: rgba(59,130,246,0.25); border: 1px solid rgba(59,130,246,0.5); color: #60a5fa; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;"
            >
              🧭 Directions
            </button>
            <button
              onclick="window.dispatchEvent(new CustomEvent('save-place-event', { detail: '${place.id}' }))"
              style="flex: 1; padding: 6px; border-radius: 8px; background: ${isSaved ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}; border: 1px solid ${isSaved ? 'rgba(16,185,129,0.6)' : 'rgba(255,255,255,0.2)'}; color: ${isSaved ? '#34d399' : '#e4e4e7'}; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;"
            >
              ${isSaved ? '★ Saved' : '🔖 Save'}
            </button>
          </div>

          <div style="display: flex; gap: 6px; margin-top: 6px;">
            <button
              onclick="window.dispatchEvent(new CustomEvent('set-origin-event', { detail: '${place.id}' }))"
              style="flex: 1; padding: 5px; border-radius: 6px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); color: #a7f3d0; font-size: 10px; font-weight: 600; cursor: pointer;"
            >
              + Origin
            </button>
            <button
              onclick="window.dispatchEvent(new CustomEvent('set-dest-event', { detail: '${place.id}' }))"
              style="flex: 1; padding: 5px; border-radius: 6px; background: rgba(56,189,248,0.15); border: 1px solid rgba(56,189,248,0.3); color: #bae6fd; font-size: 10px; font-weight: 600; cursor: pointer;"
            >
              + Dest
            </button>
          </div>
        </div>
      `, { className: "custom-mapcn-popup-window" });

      marker.on("mouseover", () => {
        marker.openTooltip();
      });

      marker.on("click", () => {
        setMapScope({ type: "POI", areaName: place.district, selectedPOI: place });
        map.flyTo([place.latitude, place.longitude], 14, { animate: true, duration: 1 });
        marker.openPopup();
      });

      markersRef.current.push(marker);
      markersByIdRef.current[place.id] = marker;
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
      const place = resolvePlaceById(placeId) || placesInScope.find((p) => p.id === placeId);
      if (place) {
        setSelectedOrigin(place);
        toast.success(`Set ${place.canonicalName || place.name} as Route Origin ✓`);
      }
    };
    const handleSetDest = (e: any) => {
      const placeId = e.detail;
      const place = resolvePlaceById(placeId) || placesInScope.find((p) => p.id === placeId);
      if (place) {
        setSelectedDestination(place);
        toast.success(`Set ${place.canonicalName || place.name} as Route Destination ✓`);
      }
    };
    const handleSave = (e: any) => {
      const placeId = e.detail;
      const place = resolvePlaceById(placeId) || placesInScope.find((p) => p.id === placeId);
      if (place) {
        toggleSavePlace(place);
      }
    };
    const handleDirections = (e: any) => {
      const placeId = e.detail;
      const place = resolvePlaceById(placeId) || placesInScope.find((p) => p.id === placeId);
      if (place) {
        handleGetDirections(place);
      }
    };

    window.addEventListener("set-origin-event", handleSetOrigin);
    window.addEventListener("set-dest-event", handleSetDest);
    window.addEventListener("save-place-event", handleSave);
    window.addEventListener("directions-place-event", handleDirections);
    return () => {
      window.removeEventListener("set-origin-event", handleSetOrigin);
      window.removeEventListener("set-dest-event", handleSetDest);
      window.removeEventListener("save-place-event", handleSave);
      window.removeEventListener("directions-place-event", handleDirections);
    };
  }, [placesInScope, savedPlaceIds, travelMode]);

  // Re-render elements whenever scope, stops, or route updates
  useEffect(() => {
    renderMapElements();
  }, [mapScope, placesInScope, stops, segmentData, selectedStopIndex]);

  // Sidebar hover → highlight marker on map
  const handleSidebarHover = (place: ExplorerPlace | null) => {
    const L = leafletModuleRef.current;
    if (!L) return;

    setHoveredPlaceId(place?.id ?? null);

    if (place) {
      const marker = markersByIdRef.current[place.id];
      if (marker) {
        const categoryColor =
          place.primaryCategory === "temples" ? "#f59e0b" :
          place.primaryCategory === "waterfalls" ? "#38bdf8" :
          place.primaryCategory === "beaches" ? "#06b6d4" :
          place.primaryCategory === "heritage" ? "#a78bfa" :
          place.primaryCategory === "hills" ? "#4ade80" :
          place.primaryCategory === "food" ? "#fb923c" :
          "#10b981";

        // Enlarge the dot and give it a glowing ring
        const highlightIcon = L.divIcon({
          className: `custom-dot-hover-${place.id}`,
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
              <span style="position: absolute; width: 26px; height: 26px; border-radius: 50%; background: ${categoryColor}44; animation: ping 1.2s infinite;"></span>
              <div style="
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background: ${categoryColor};
                border: 2px solid #fff;
                box-shadow: 0 0 0 3px ${categoryColor}66, 0 4px 12px rgba(0,0,0,0.6);
                transform: scale(1.3);
              "></div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        marker.setIcon(highlightIcon);
        marker.setZIndexOffset(3000);
        marker.openTooltip();
      }
    } else {
      // Reset all markers back to their default dot icon
      renderMapElements();
    }
  };


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


  // Handle District selection — zoom into district with dramatic animation
  const handleSelectDistrict = (district: { name: string; lat: number; lng: number; zoom: number }) => {
    setSelectedDistrict(district.name);
    setShowDistrictPicker(false);
    // Reset scope to all TN so district filter works across all places
    setMapScope({ type: "ALL_TAMIL_NADU", areaName: "Tamil Nadu", selectedArea: GEOGRAPHIC_AREAS["tamil-nadu"] });
    if (leafletMapRef.current) {
      // First zoom out slightly for dramatic effect, then zoom in
      leafletMapRef.current.flyTo([district.lat, district.lng], district.zoom, {
        animate: true,
        duration: 1.4,
        easeLinearity: 0.25,
      });
    }
    toast.success(`📍 Showing ${district.name} District spots`);
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

      {/* Animated Focus Mode Origin Prompt Overlay */}
      <AnimatePresence>
        {isDirectionsFocusMode && selectedDestination && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="absolute top-20 left-4 z-50 w-80 sm:w-96 bg-[#121821]/95 backdrop-blur-2xl border border-emerald-500/50 rounded-3xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.85)] text-white space-y-4 pointer-events-auto"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest min-w-0">
                <Navigation className="w-4 h-4 animate-pulse shrink-0" />
                <span className="truncate">Directions: {selectedDestination.canonicalName || selectedDestination.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsDirectionsFocusMode(false)}
                className="size-7 grid place-items-center rounded-full bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-semibold text-slate-200">Where are you starting your trip from?</p>

            {/* Live Search Input for Starting Origin */}
            <div className="relative space-y-1.5">
              <div className="flex items-center gap-2 bg-white/5 border border-white/20 focus-within:border-emerald-400 px-3 py-2 rounded-xl transition">
                <Search className="w-4 h-4 text-emerald-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Type starting city, district or POI..."
                  value={focusOriginQuery}
                  onChange={(e) => setFocusOriginQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none font-medium"
                  autoFocus
                />
                {focusOriginQuery && (
                  <button
                    type="button"
                    onClick={() => setFocusOriginQuery("")}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Live Search Suggestions Dropdown */}
              {focusOriginQuery.trim() && (
                <div className="bg-[#121821] border border-white/20 rounded-2xl max-h-48 overflow-y-auto p-1.5 shadow-2xl space-y-1 custom-scrollbar no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {searchEntities(focusOriginQuery).length === 0 ? (
                    <div className="p-2.5 text-xs text-slate-400 text-center">No origin matching '{focusOriginQuery}'</div>
                  ) : (
                    searchEntities(focusOriginQuery).map((item) => {
                      const targetPlace: ExplorerPlace | null = item.place || (item.area ? {
                        id: item.area.id,
                        canonicalName: item.area.name,
                        name: item.area.name,
                        slug: item.area.slug,
                        district: item.area.district,
                        state: "Tamil Nadu",
                        country: "India",
                        latitude: item.area.latitude,
                        longitude: item.area.longitude,
                        categories: ["all"],
                        primaryCategory: "all",
                        verified: true,
                      } : null);

                      if (!targetPlace) return null;

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedOrigin(targetPlace);
                            setFocusOriginQuery("");
                            setIsDirectionsFocusMode(false);
                            toast.success(`Set ${targetPlace.canonicalName || targetPlace.name} as Starting Origin 🚗`);
                          }}
                          className="p-2 rounded-xl hover:bg-emerald-500/20 text-xs text-white flex items-center justify-between gap-2 transition cursor-pointer border border-transparent hover:border-emerald-500/40"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-sm">{item.icon}</span>
                            <div className="truncate">
                              <span className="font-bold text-white block truncate">{item.name}</span>
                              <span className="text-[10px] text-slate-400 block">{item.sublabel}</span>
                            </div>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-bold shrink-0">+ Set Origin</span>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* GPS Auto-Detect Option */}
            <button
              type="button"
              onClick={() => {
                handleUseCurrentLocation();
                setIsDirectionsFocusMode(false);
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 hover:bg-emerald-500/25 text-emerald-300 font-bold text-xs transition cursor-pointer active:scale-95"
            >
              <div className="flex items-center gap-2.5">
                <LocateFixed className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Use My Live GPS Location</span>
              </div>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-mono">GPS</span>
            </button>

            {/* Popular Origin Presets */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Or select quick starting city:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: "Chennai", lat: 13.0827, lng: 80.2707 },
                  { name: "Madurai", lat: 9.9252, lng: 78.1198 },
                  { name: "Coimbatore", lat: 11.0168, lng: 76.9558 },
                  { name: "Salem", lat: 11.6643, lng: 78.1460 },
                  { name: "Tiruchirappalli", lat: 10.7905, lng: 78.7047 },
                ].map((city) => (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => {
                      const placeObj: ExplorerPlace = {
                        id: `geo-${city.name.toLowerCase()}`,
                        canonicalName: city.name,
                        name: city.name,
                        slug: city.name.toLowerCase(),
                        district: city.name,
                        state: "Tamil Nadu",
                        country: "India",
                        latitude: city.lat,
                        longitude: city.lng,
                        categories: ["all"],
                        primaryCategory: "all",
                        verified: true,
                      };
                      setSelectedOrigin(placeObj);
                      setIsDirectionsFocusMode(false);
                      toast.success(`Calculated route from ${city.name} to ${selectedDestination.canonicalName || selectedDestination.name} 🚗`);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-emerald-500/20 hover:border-emerald-500/40 border border-white/10 text-xs font-semibold text-slate-200 transition cursor-pointer active:scale-95"
                  >
                    + {city.name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Left Explorer Panel */}
      <aside
        aria-labelledby="explorer-destinations-heading"
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
        {/* Polite Live Region for dynamic screen reader updates */}
        <div aria-live="polite" className="sr-only">
          {statusMessage}
        </div>

        <div className="w-full h-full bg-[#121821]/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-4 shadow-2xl flex flex-col overflow-hidden text-white overscroll-contain">
          {/* Drag Handle Collapse Button */}
          <button
            type="button"
            aria-expanded={panelState === "expanded"}
            aria-controls="explorer-places-list"
            aria-label={panelState === "expanded" ? "Collapse destinations panel" : "Expand destinations panel"}
            onClick={() => {
              const next = panelState === "expanded" ? "compact" : "expanded";
              setPanelState(next);
              setStatusMessage(next === "expanded" ? "Destinations panel expanded" : "Destinations panel collapsed");
            }}
            className="w-full flex flex-col items-center cursor-pointer py-1 group shrink-0 focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg min-h-[36px] justify-center"
          >
            <div className="w-12 h-1.5 rounded-full bg-white/20 group-hover:bg-emerald-400 transition" />
            <span className="text-[10px] text-slate-300 uppercase tracking-widest mt-1 font-mono font-semibold">
              {panelState === "expanded" ? "Click to Collapse" : "Click to Expand"}
            </span>
          </button>

          {/* Panel Header & Breadcrumbs */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mt-1 shrink-0">
            <div>
              <nav aria-label="Breadcrumb" className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setMapScope({ type: "ALL_TAMIL_NADU", areaName: "Tamil Nadu", selectedArea: GEOGRAPHIC_AREAS["tamil-nadu"] });
                    setStatusMessage("Reset scope to All Tamil Nadu");
                  }}
                  className="cursor-pointer hover:underline text-emerald-400 font-bold focus-visible:ring-2 focus-visible:ring-emerald-400 rounded px-1 py-0.5"
                >
                  Tamil Nadu
                </button>
                {mapScope.areaName !== "Tamil Nadu" && (
                  <>
                    <span aria-hidden="true">/</span>
                    <span className="text-white font-extrabold">{mapScope.areaName}</span>
                  </>
                )}
                {mapScope.selectedPOI && (
                  <>
                    <span aria-hidden="true">/</span>
                    <span className="text-sky-300 font-extrabold truncate max-w-[120px] inline-block">{mapScope.selectedPOI.canonicalName || mapScope.selectedPOI.name}</span>
                  </>
                )}
              </nav>
              <h2 id="explorer-destinations-heading" className="text-sm font-extrabold text-white uppercase tracking-wider mt-0.5">
                {mapScope.areaName.toUpperCase()} DESTINATIONS ({placesInScope.length})
              </h2>
            </div>
            <button
              type="button"
              aria-expanded={panelState === "expanded"}
              aria-controls="explorer-places-list"
              aria-label={panelState === "expanded" ? "Collapse destinations panel" : "Expand destinations panel"}
              onClick={() => {
                const next = panelState === "expanded" ? "compact" : "expanded";
                setPanelState(next);
                setStatusMessage(next === "expanded" ? "Destinations panel expanded" : "Destinations panel collapsed");
              }}
              className="p-1.5 min-w-[36px] min-h-[36px] grid place-items-center rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              {panelState === "expanded" ? (
                <ChevronDown className="w-4 h-4" aria-hidden="true" />
              ) : (
                <ChevronUp className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Category Filter Pills Bar */}
          <div className="flex flex-col gap-1.5 shrink-0 border-b border-white/10 pb-2.5 pt-1.5">
            {/* Category pills row */}
            <div
              role="toolbar"
              aria-label="Filter destinations by category"
              className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-1"
            >
              {[
                { id: "all", label: "All" },
                { id: "temples", label: "🛕 Temples" },
                { id: "heritage", label: "🏛️ Heritage" },
                { id: "waterfalls", label: "💧 Falls" },
                { id: "hills", label: "⛰️ Hills" },
                { id: "beaches", label: "🏖️ Beaches" },
                { id: "food", label: "🍲 Food" },
                { id: "museums", label: "🏛 Museums" },
                { id: "trekking", label: "🥾 Trekking" },
              ].map((cat) => {
                const isSelected = activeCategoryFilter === cat.id && !selectedDistrict;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      setActiveCategoryFilter(cat.id as any);
                      setSelectedDistrict(null);
                      setStatusMessage(`Category filter set to ${cat.label}`);
                    }}
                    className={`px-3 py-1.5 min-h-[32px] rounded-full text-xs font-bold shrink-0 transition focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                      isSelected
                        ? "bg-emerald-500 text-black shadow-md font-extrabold"
                        : "bg-white/5 border border-white/15 text-slate-200 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* District selector row */}
            <div className="relative">
              <button
                type="button"
                id="district-filter-trigger"
                aria-haspopup="dialog"
                aria-expanded={showDistrictPicker}
                aria-controls="district-picker-dropdown"
                onClick={() => setShowDistrictPicker((v) => !v)}
                onKeyDown={(e) => {
                  if (e.key === "Escape" && showDistrictPicker) {
                    e.preventDefault();
                    setShowDistrictPicker(false);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full text-xs font-bold shrink-0 transition w-full justify-between focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  selectedDistrict
                    ? "bg-sky-500 text-black shadow-md font-extrabold"
                    : "bg-white/5 border border-white/15 text-slate-200 hover:text-white hover:bg-white/10"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                  {selectedDistrict ? `${selectedDistrict} District` : "📍 Filter by District"}
                </span>
                <span className="flex items-center gap-1">
                  {selectedDistrict && (
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={`Clear ${selectedDistrict} district filter`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDistrict(null);
                        setShowDistrictPicker(false);
                        setStatusMessage("District filter cleared");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedDistrict(null);
                          setShowDistrictPicker(false);
                          setStatusMessage("District filter cleared");
                        }
                      }}
                      className="text-black/70 hover:text-black font-black text-sm leading-none p-1"
                    >
                      ×
                    </span>
                  )}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDistrictPicker ? "rotate-180" : ""}`} aria-hidden="true" />
                </span>
              </button>

              {/* District Dropdown Grid */}
              {showDistrictPicker && (
                <div
                  id="district-picker-dropdown"
                  role="dialog"
                  aria-label="Tamil Nadu Districts Filter"
                  className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-[#0c1218]/98 backdrop-blur-2xl border border-white/20 rounded-2xl p-3 shadow-[0_20px_60px_rgba(0,0,0,0.85)] max-h-64 overflow-y-auto custom-scrollbar no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                  <p className="text-[10px] font-mono text-slate-300 uppercase tracking-widest mb-2 font-semibold">
                    Tamil Nadu Districts — Select to focus map
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {TN_DISTRICTS.map((d) => (
                      <button
                        key={d.name}
                        type="button"
                        onClick={() => {
                          handleSelectDistrict(d);
                          setStatusMessage(`Filtered to ${d.name} District`);
                        }}
                        className={`px-2.5 py-2 min-h-[36px] rounded-xl text-xs font-semibold text-left transition cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-400 ${
                          selectedDistrict === d.name
                            ? "bg-sky-500 text-black font-bold"
                            : "bg-white/5 hover:bg-sky-500/20 hover:text-sky-300 text-slate-200 border border-white/10 hover:border-sky-500/40"
                        }`}
                      >
                        {d.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Active district badge */}
            {selectedDistrict && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-sky-500/15 border border-sky-500/30 rounded-xl text-[11px] text-sky-300 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" aria-hidden="true" />
                <span>Showing <strong className="text-sky-100">{selectedDistrict}</strong> District · {placesInScope.length} spots</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDistrict(null);
                    setStatusMessage("District filter cleared");
                  }}
                  className="ml-auto text-sky-300 hover:text-white font-bold text-xs underline p-1 focus-visible:ring-2 focus-visible:ring-sky-400 rounded"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Active Route Calculation Metrics & Intermediate Waypoint Addition */}
          {(selectedOrigin || selectedDestination) && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl my-2 shrink-0 space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div>
                  <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>Active Route Corridor</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-white truncate max-w-[200px] mt-0.5">
                    {selectedOrigin ? selectedOrigin.name : "Select Origin"} → {selectedDestination ? selectedDestination.name : "Select Destination"}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrigin(null);
                    setSelectedDestination(null);
                    setWaypoints([]);
                    setIsDirectionsFocusMode(false);
                  }}
                  className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[9px] font-bold transition active:scale-95 cursor-pointer"
                >
                  Clear Route
                </button>
              </div>

              {/* Calculated Stats (Distance, Time, Stops) */}
              <div className="grid grid-cols-3 gap-1.5 bg-black/40 border border-white/10 rounded-xl p-2 text-center">
                <div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase block">Distance</span>
                  <span className="text-xs font-black text-emerald-400">{totalDistanceKm > 0 ? `${totalDistanceKm} km` : "..."}</span>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase block">Est. Time</span>
                  <span className="text-xs font-black text-sky-400">{totalDurationMins > 0 ? durationString : "..."}</span>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase block">Total Stops</span>
                  <span className="text-xs font-black text-amber-400">{stops.length} Stops</span>
                </div>
              </div>

              {/* Waypoint Addition Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 uppercase font-bold">
                  <span>+ Add Extra Place In-Between:</span>
                  {waypoints.length > 0 && <span className="text-emerald-400">{waypoints.length} Waypoints</span>}
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-emerald-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    placeholder="Search place to add as waypoint stop..."
                    value={waypointQuery}
                    onChange={(e) => setWaypointQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 focus:border-emerald-400 rounded-xl pl-7 pr-3 py-1 text-[11px] text-white placeholder-slate-400 focus:outline-none"
                  />

                  {waypointQuery.trim() && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#121821] border border-white/20 rounded-2xl max-h-40 overflow-y-auto p-1.5 shadow-2xl space-y-1 custom-scrollbar no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                      {searchEntities(waypointQuery).map((item) => {
                        const placeObj = item.place || (item.area ? {
                          id: item.area.id,
                          canonicalName: item.area.name,
                          name: item.area.name,
                          slug: item.area.slug,
                          district: item.area.district,
                          state: "Tamil Nadu",
                          country: "India",
                          latitude: item.area.latitude,
                          longitude: item.area.longitude,
                          categories: ["all"],
                          primaryCategory: "all",
                          verified: true,
                        } : null);

                        if (!placeObj || stops.some(s => s.id === placeObj.id)) return null;

                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              setWaypoints(prev => [...prev, placeObj as ExplorerPlace]);
                              setWaypointQuery("");
                              toast.success(`Added ${placeObj.name} as waypoint stop 📍`);
                            }}
                            className="p-1.5 rounded-xl hover:bg-emerald-500/20 text-xs text-white flex items-center justify-between gap-2 cursor-pointer"
                          >
                            <span className="font-bold truncate text-[11px]">{item.name}</span>
                            <span className="text-[9px] text-emerald-400 font-bold shrink-0">+ Add Stop</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Stops Summary Timeline */}
              {stops.length > 0 && (
                <div className="space-y-1">
                  {stops.map((stop, idx) => {
                    const isStart = idx === 0;
                    const isEnd = idx === stops.length - 1;
                    const isWaypoint = !isStart && !isEnd;

                    return (
                      <div
                        key={stop.id}
                        className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between gap-2 text-[11px]"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 ${
                            isStart ? "bg-emerald-500 text-black" : isEnd ? "bg-sky-500 text-black" : "bg-amber-500 text-black"
                          }`}>
                            {isStart ? "S" : isEnd ? "E" : idx}
                          </span>
                          <span className="font-bold text-white truncate">{stop.canonicalName || stop.name}</span>
                        </div>

                        {isWaypoint && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRecommendedStop(stop.id)}
                            className="text-slate-400 hover:text-rose-400 p-0.5"
                            title="Remove stop"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Places List for Selected Scope */}
          {panelState === "expanded" && (
            <div
              id="explorer-places-list"
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-2 space-y-2 pr-1 custom-scrollbar no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {placesInScope.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-300 bg-white/5 border border-white/15 rounded-2xl my-2 space-y-2">
                  <p>No verified tourist places found in {mapScope.areaName} for this category filter.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategoryFilter("all");
                      setMapScope({ type: "ALL_TAMIL_NADU", areaName: "Tamil Nadu", selectedArea: GEOGRAPHIC_AREAS["tamil-nadu"] });
                      setStatusMessage("Reset to All Tamil Nadu Destinations");
                    }}
                    className="text-emerald-400 font-bold underline cursor-pointer block mx-auto text-xs py-1 min-h-[36px]"
                  >
                    Reset to All Tamil Nadu Destinations
                  </button>
                </div>
              ) : (
                placesInScope.map((place) => {
                  const isSelected = mapScope.selectedPOI?.id === place.id;
                  const isSaved = savedPlaceIds.has(place.id);
                  const categoryIcon = place.primaryCategory === "temples" ? "🛕" : place.primaryCategory === "heritage" ? "🏛️" : place.primaryCategory === "waterfalls" ? "💧" : "📍";

                  return (
                    <article
                      key={place.id}
                      onMouseEnter={() => handleSidebarHover(place)}
                      onMouseLeave={() => handleSidebarHover(null)}
                      className={`group p-3 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                        isSelected
                          ? "bg-emerald-500/20 border-emerald-500/60 shadow-lg"
                          : hoveredPlaceId === place.id
                          ? "bg-white/10 border-white/30 shadow-md"
                          : "bg-white/5 border-white/15 hover:bg-white/10 hover:border-white/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setMapScope({ type: "POI", areaName: place.district, selectedPOI: place });
                            if (leafletMapRef.current) {
                              leafletMapRef.current.flyTo([place.latitude, place.longitude], 14, { animate: true });
                            }
                            setStatusMessage(`Focused map on ${place.canonicalName || place.name}`);
                          }}
                          className="space-y-1 min-w-0 flex-1 text-left cursor-pointer rounded-lg p-0.5 focus-visible:ring-2 focus-visible:ring-emerald-400"
                          aria-label={`Focus map on ${place.canonicalName || place.name}, ${place.district} District`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm" aria-hidden="true">{categoryIcon}</span>
                            <h4 className="font-bold text-white text-xs truncate group-hover:text-emerald-300 transition-colors">
                              {place.canonicalName || place.name}
                            </h4>
                          </div>
                          <p className="text-[11px] text-slate-200 line-clamp-1 leading-snug">
                            {place.tagline || place.description}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-300 font-mono pt-0.5">
                            <span className="text-emerald-400 font-bold uppercase">{place.primaryCategory}</span>
                            <span aria-hidden="true">•</span>
                            <span>{place.district} District</span>
                            <span aria-hidden="true">•</span>
                            <span>{place.rating ? `★ ${place.rating}` : "No reviews yet"}</span>
                          </div>
                        </button>
                      </div>

                      {/* Action Buttons Row — Directions, Save, +Origin, +Dest */}
                      <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-white/10">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleGetDirections(place)}
                            className="px-2.5 py-1.5 min-h-[32px] rounded-lg bg-blue-500/20 hover:bg-blue-500/35 text-blue-200 border border-blue-500/40 text-[11px] font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-400"
                            aria-label={`Get directions to ${place.canonicalName || place.name}`}
                          >
                            <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
                            Directions
                          </button>

                          <button
                            type="button"
                            aria-pressed={isSaved}
                            onClick={() => {
                              toggleSavePlace(place);
                              setStatusMessage(isSaved ? `Removed ${place.name} from saved places` : `Saved ${place.name} to collection`);
                            }}
                            className={`px-2.5 py-1.5 min-h-[32px] rounded-lg text-[11px] font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer border focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                              isSaved
                                ? "bg-emerald-500/30 text-emerald-200 border-emerald-500/60"
                                : "bg-white/10 hover:bg-white/20 text-slate-200 border-white/20"
                            }`}
                            aria-label={isSaved ? `Remove ${place.name} from saved places` : `Save ${place.name}`}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-emerald-400 text-emerald-400" : ""}`} aria-hidden="true" />
                            {isSaved ? "Saved" : "Save"}
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrigin(place);
                              toast.success(`Set ${place.canonicalName || place.name} as Route Origin ✓`);
                              setStatusMessage(`Set ${place.canonicalName || place.name} as Route Origin`);
                            }}
                            className="px-2 py-1.5 min-h-[32px] rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 border border-emerald-500/30 text-[10px] font-bold transition active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400"
                            aria-label={`Set ${place.name} as Route Origin`}
                          >
                            + Origin
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDestination(place);
                              toast.success(`Set ${place.canonicalName || place.name} as Route Destination ✓`);
                              setStatusMessage(`Set ${place.canonicalName || place.name} as Route Destination`);
                            }}
                            className="px-2 py-1.5 min-h-[32px] rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-200 border border-sky-500/30 text-[10px] font-bold transition active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-400"
                            aria-label={`Set ${place.name} as Route Destination`}
                          >
                            + Dest
                          </button>
                        </div>
                      </div>
                    </article>
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
