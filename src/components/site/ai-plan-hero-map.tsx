import React, { useEffect } from "react";
import { Compass, Sparkles, Navigation, Layers, SlidersHorizontal, MapPin, Plus, Minus, RotateCcw, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TNLandmarksIllustration } from "@/components/site/tn-landmarks-illustration";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
  MarkerPopup,
  MapRoute,
  useMap,
} from "@/components/ui/map";
import { cn } from "@/lib/utils";

interface StopItem {
  order: number;
  day_number: number;
  place_id: string;
  name: string;
  slug: string;
  category: string;
  lat: number;
  lng: number;
  district?: string;
  distance_from_prev_km: number;
  duration_from_prev_mins: number;
}

interface AIRecommendationItem {
  id: string;
  name: string;
  type: string;
  icon: string;
  lat: number;
  lng: number;
  detourMins?: number;
}

interface AIPlanHeroMapProps {
  title?: string;
  subtitle?: string;
  stops?: StopItem[];
  routePolylinePoints?: Array<[number, number]>;
  recommendations?: AIRecommendationItem[];
  originName?: string;
  destName?: string;
  selectedStopId?: string | null;
  onSelectStop?: (stopId: string) => void;
  onCustomizeClick?: () => void;
  isLoading?: boolean;
  isError?: boolean;
}

// Controller component inside <Map> to handle center flyTo, auto-fit bounds, and controls
function MapViewController({
  selectedStop,
  routePoints,
  centerLat,
  centerLng
}: {
  selectedStop?: StopItem | null;
  routePoints: Array<[number, number]>;
  centerLat: number;
  centerLng: number;
}) {
  const mapContext = useMap();
  const hasFittedRef = React.useRef(false);
  const prevRouteKeyRef = React.useRef("");
  const prevSelectedStopIdRef = React.useRef<string | null>(null);

  // Auto-fit map bounds to complete route on initial load or route updates
  useEffect(() => {
    const map = mapContext?.leafletMap;
    if (!map) return;

    const routeKey = JSON.stringify(routePoints);
    const selectedStopId = selectedStop ? (selectedStop.place_id || selectedStop.slug || selectedStop.name) : null;

    // If a stop was selected, fly to it
    if (selectedStop && selectedStopId !== prevSelectedStopIdRef.current) {
      prevSelectedStopIdRef.current = selectedStopId;
      map.flyTo([selectedStop.lat, selectedStop.lng], 12, {
        duration: 1.0
      });
      return;
    }

    prevSelectedStopIdRef.current = selectedStopId;

    // Only fitBounds once on initial mount or when routePoints geometry actually changes
    if (!hasFittedRef.current || routeKey !== prevRouteKeyRef.current) {
      if (routePoints.length > 0 && (window as any).L) {
        try {
          const L = (window as any).L;
          const bounds = L.latLngBounds(routePoints);
          map.fitBounds(bounds, { padding: [45, 45] });
          hasFittedRef.current = true;
          prevRouteKeyRef.current = routeKey;
        } catch (e) {
          map.setView([centerLat, centerLng], 8);
        }
      }
    }
  }, [selectedStop, routePoints, centerLat, centerLng, mapContext?.leafletMap]);

  return (
    <div className="absolute top-20 right-4 z-20 flex flex-col gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-white/10 shadow-lg backdrop-blur-md text-white">
      <button
        type="button"
        onClick={() => {
          if (mapContext?.leafletMap) {
            mapContext.leafletMap.zoomIn();
          } else {
            mapContext?.setZoom((z) => Math.min(18, z + 1));
          }
        }}
        className="p-2 hover:bg-white/10 rounded-xl transition-all"
        title="Zoom in"
      >
        <Plus className="w-4 h-4 text-emerald-400" />
      </button>
      <button
        type="button"
        onClick={() => {
          if (mapContext?.leafletMap) {
            mapContext.leafletMap.zoomOut();
          } else {
            mapContext?.setZoom((z) => Math.max(4, z - 1));
          }
        }}
        className="p-2 hover:bg-white/10 rounded-xl transition-all"
        title="Zoom out"
      >
        <Minus className="w-4 h-4 text-emerald-400" />
      </button>
      <button
        type="button"
        onClick={() => {
          if (mapContext?.leafletMap && routePoints.length > 0 && (window as any).L) {
            const L = (window as any).L;
            const bounds = L.latLngBounds(routePoints);
            mapContext.leafletMap.fitBounds(bounds, { padding: [45, 45] });
          }
        }}
        className="p-2 hover:bg-white/10 rounded-xl transition-all"
        title="Fit Map to Entire Route"
      >
        <RotateCcw className="w-4 h-4 text-emerald-400" />
      </button>
      <button
        type="button"
        onClick={() => {
          const nextStyle = mapContext?.style === "dark" ? "satellite" : mapContext?.style === "satellite" ? "outdoors" : "dark";
          mapContext?.setStyle(nextStyle);
        }}
        className="p-2 hover:bg-white/10 rounded-xl transition-all"
        title="Switch Map Tiles (Dark / Satellite / Outdoors)"
      >
        <Layers className="w-4 h-4 text-cyan-400" />
      </button>
    </div>
  );
}

export const AIPlanHeroMap: React.FC<AIPlanHeroMapProps> = ({
  title = "Madurai → Kanyakumari",
  subtitle = "Temples • Coastal Beauty • Hidden Gems",
  stops = [],
  routePolylinePoints,
  recommendations = [],
  originName = "Madurai",
  destName = "Kanyakumari",
  selectedStopId,
  onSelectStop,
  onCustomizeClick,
  isLoading = false,
  isError = false
}) => {
  const routePoints: Array<[number, number]> = (routePolylinePoints && routePolylinePoints.length > 0)
    ? routePolylinePoints
    : stops.map((s) => [s.lat, s.lng]);

  const defaultLat = stops.length > 0 ? stops[0].lat : 8.0883;
  const defaultLng = stops.length > 0 ? stops[0].lng : 77.5385;

  const centerLat = stops.length > 0 ? stops.reduce((sum, s) => sum + s.lat, 0) / stops.length : defaultLat;
  const centerLng = stops.length > 0 ? stops.reduce((sum, s) => sum + s.lng, 0) / stops.length : defaultLng;

  const selectedStop = stops.find((s) => s.place_id === selectedStopId || s.slug === selectedStopId);

  return (
    <div className="w-full h-[650px] min-h-[560px] bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col relative">
      
      {/* 1. Map Header Overlay */}
      <div className="p-5 bg-gradient-to-b from-slate-950/95 via-slate-900/90 to-transparent border-b border-white/10 z-20 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              YOUR EXPLORETN AI PLAN
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <Sparkles className="w-3 h-3 text-amber-400" /> ✨ Personalized for your preferences
            </span>
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight mt-1">
            {title}
          </h2>
          <p className="text-xs text-slate-300 font-medium">
            {subtitle}
          </p>
        </div>

        {/* Right Action & Compass */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl shadow-sm">
            <Compass className="w-4 h-4 text-emerald-400 animate-spin-slow" />
            <span>N 8.08° E 77.53°</span>
          </div>

          <Button
            size="sm"
            onClick={onCustomizeClick}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
            Customize This Trip
          </Button>
        </div>
      </div>

      {/* 2. Loading State */}
      {isLoading && (
        <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center text-white space-y-2">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            <span className="text-sm font-bold">Creating your road-trip route...</span>
          </div>
        </div>
      )}

      {/* 3. Error Fallback State */}
      {isError && (
        <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center text-white p-6">
          <div className="flex items-center gap-3 text-rose-400 bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <span className="text-xs font-semibold">Unable to calculate the route right now. Please check network connection and retry.</span>
          </div>
        </div>
      )}

      {/* 4. Interactive Leaflet Map Container */}
      <div className="flex-1 relative w-full h-[530px] min-h-[480px]">
        <Map center={[centerLat, centerLng]} zoom={8} className="w-full h-full min-h-[480px]">
          <MapViewController selectedStop={selectedStop} routePoints={routePoints} centerLat={centerLat} centerLng={centerLng} />

          {/* Real Dominant Road Polyline */}
          {routePoints.length > 1 && (
            <MapRoute
              coordinates={routePoints}
              color="#10b981"
              casingColor="#0f172a"
              weight={6}
              casingWeight={10}
              opacity={0.98}
            />
          )}

          {/* Main Itinerary Route Markers */}
          {stops.map((stop, idx) => {
            const isSelected = selectedStopId === stop.place_id || selectedStopId === stop.slug;
            const isStart = idx === 0;
            const isEnd = idx === stops.length - 1;

            const hours = Math.floor(stop.duration_from_prev_mins / 60);
            const mins = stop.duration_from_prev_mins % 60;
            const timeStr = `${hours > 0 ? `${hours}h ` : ""}${mins}m`;

            return (
              <MapMarker key={stop.place_id || idx} latitude={stop.lat} longitude={stop.lng}>
                <MarkerContent>
                  <div
                    onClick={() => onSelectStop && onSelectStop(stop.place_id || stop.slug)}
                    className="flex flex-col items-center cursor-pointer group"
                  >
                    {/* Compact Map Pin Badge */}
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full font-black text-xs flex items-center justify-center transition-all shadow-xl border-2",
                        isStart && "bg-emerald-500 text-slate-950 border-white ring-4 ring-emerald-500/30 scale-110",
                        isEnd && "bg-amber-500 text-slate-950 border-white ring-4 ring-amber-500/30 scale-110",
                        !isStart && !isEnd && isSelected && "bg-cyan-400 text-slate-950 border-white ring-4 ring-cyan-400/40 scale-110",
                        !isStart && !isEnd && !isSelected && "bg-slate-900 text-emerald-400 border-emerald-500/60 hover:bg-emerald-950 hover:scale-110"
                      )}
                    >
                      {isStart ? "S" : isEnd ? "🏁" : stop.order || idx + 1}
                    </div>

                    {/* Small City Name Badge */}
                    <div className="mt-1 px-2 py-0.5 bg-slate-950/90 text-white border border-white/20 rounded-full text-[10px] font-bold whitespace-nowrap shadow-md max-w-[130px] truncate">
                      {stop.name}
                    </div>
                  </div>
                </MarkerContent>

                <MarkerTooltip>
                  {stop.name} ({stop.district || 'Tamil Nadu'}) — Click for details & route info
                </MarkerTooltip>

                {/* Rich Interactive Place Card Popup */}
                <MarkerPopup className="w-64 bg-slate-900/95 border-emerald-500/40 text-white shadow-2xl p-4 rounded-2xl backdrop-blur-xl">
                  <div className="space-y-3">
                    {/* Header Image & Title */}
                    <div className="flex items-start gap-3">
                      {stop.image_url ? (
                        <img
                          src={stop.image_url}
                          alt={stop.name}
                          className="w-12 h-12 rounded-xl object-cover border border-white/20 shrink-0 shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-lg shrink-0">
                          📍
                        </div>
                      )}
                      <div>
                        <span className="text-[9px] font-black uppercase text-amber-400 tracking-wider">
                          {isStart ? "STARTING POINT" : isEnd ? "DESTINATION" : `STOP ${stop.order || idx + 1}`}
                        </span>
                        <h4 className="font-black text-sm text-white leading-tight mt-0.5">{stop.name}</h4>
                        <span className="text-[10px] text-slate-300 font-medium">{stop.district || "Tamil Nadu"}</span>
                      </div>
                    </div>

                    {/* Leg Travel Info */}
                    {stop.duration_from_prev_mins > 0 && (
                      <div className="px-2.5 py-1.5 bg-slate-800/80 rounded-xl border border-white/10 text-[11px] text-emerald-300 font-mono flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>🚗 Drive: {timeStr} ({stop.distance_from_prev_km} km)</span>
                      </div>
                    )}

                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                      {stop.rationale}
                    </p>

                    {/* Action Link to Place Page */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                      <a
                        href={`/place/${stop.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        <span>View Place Page</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <button
                        type="button"
                        onClick={() => onSelectStop && onSelectStop(stop.place_id || stop.slug)}
                        className="text-[11px] font-bold text-slate-400 hover:text-white transition-all"
                      >
                        Focus Timeline
                      </button>
                    </div>
                  </div>
                </MarkerPopup>
              </MapMarker>
            );
          })}

          {/* Secondary AI Recommendation Markers */}
          {recommendations.map((rec) => (
            <MapMarker key={rec.id} latitude={rec.lat} longitude={rec.lng}>
              <MarkerContent>
                <div className="px-2 py-1 bg-purple-950/90 border border-purple-400/50 text-purple-200 text-[10px] font-bold rounded-full shadow-lg flex items-center gap-1 hover:scale-110 transition-transform">
                  <span>{rec.icon || "💎"}</span>
                  <span>{rec.name}</span>
                </div>
              </MarkerContent>
              <MarkerTooltip>
                {rec.name} — Optional AI Recommendation ({rec.detourMins || 12} min detour)
              </MarkerTooltip>
            </MapMarker>
          ))}
        </Map>

        {/* 5. Map Legend Overlay */}
        <div className="absolute top-20 left-4 z-20 p-3 bg-slate-900/90 border border-white/10 rounded-2xl shadow-xl backdrop-blur-md text-white text-[11px] space-y-1.5">
          <div className="font-extrabold text-[10px] uppercase text-emerald-400 tracking-wider">Map Legend</div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 bg-emerald-500 rounded" />
            <span>━━━ Main Route</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black flex items-center justify-center">①</span>
            <span>Main Stop</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">💎</span>
            <span>AI Recommendation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black flex items-center justify-center">🏁</span>
            <span>Destination</span>
          </div>
        </div>

        {/* 7. Tamil Nadu Landmark Artwork Illustration Overlay */}
        <div className="absolute bottom-4 right-4 z-20 max-w-xs hidden lg:block">
          <TNLandmarksIllustration landmark="kanyakumari" />
        </div>
      </div>
    </div>
  );
};
