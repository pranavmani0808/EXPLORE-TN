import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Compass,
  MapPin,
  Sparkles,
  Navigation,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  RotateCcw,
  Search,
  Utensils,
  Waves,
  Mountain,
  Landmark,
  Bed,
  Layers,
  ArrowRight,
  ShieldCheck,
  Pause,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { findNearbyRecommendations, parseNaturalLanguageDiscoveryIntent, DiscoveryCategory, NearbyRecommendationItem } from "@/lib/trip-intelligence/discovery/recommendation-engine";
import { DynamicItineraryManager, DynamicItineraryState } from "@/lib/trip-intelligence/itinerary/dynamic-itinerary";
import { GeofenceManager } from "@/lib/trip-intelligence/arrival/geofence-manager";
import { toast } from "sonner";

interface ExploreMoreWorkspaceProps {
  tripId: string;
  destinationName: string;
  originName: string;
  durationDays: number;
  userLat?: number;
  userLng?: number;
  geofenceManager: GeofenceManager;
  itineraryManager: DynamicItineraryManager;
  onItineraryChange?: (newState: DynamicItineraryState) => void;
}

export function ExploreMoreWorkspace({
  tripId,
  destinationName,
  originName,
  durationDays,
  userLat = 11.4102,
  userLng = 76.6950,
  geofenceManager,
  itineraryManager,
  onItineraryChange,
}: ExploreMoreWorkspaceProps) {
  const [activeCategory, setActiveCategory] = useState<DiscoveryCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [itineraryState, setItineraryState] = useState<DynamicItineraryState>(itineraryManager.getState());
  const [arrivalState, setArrivalState] = useState(geofenceManager.getCurrentState());
  const [isTrackingActive, setIsTrackingActive] = useState(geofenceManager.isTrackingActive());
  const [manualArrived, setManualArrived] = useState(false);

  // Sync state changes
  useEffect(() => {
    setItineraryState(itineraryManager.getState());
  }, [itineraryManager]);

  const activeGeofence = geofenceManager.getActiveGeofence();

  // Recommendations query
  const recommendations: NearbyRecommendationItem[] = findNearbyRecommendations({
    userLat,
    userLng,
    radiusKm: 35,
    category: activeCategory,
    searchQuery,
    destinationName,
  });

  const handleAddSpotToItinerary = (spot: NearbyRecommendationItem) => {
    const newState = itineraryManager.addStop({
      id: spot.id,
      name: spot.name,
      district: spot.district,
      latitude: spot.latitude,
      longitude: spot.longitude,
      category: spot.primaryCategory,
      description: spot.description,
    });
    setItineraryState(newState);
    if (onItineraryChange) onItineraryChange(newState);
    toast.success(`Added ${spot.name} to active trip itinerary ✓`);
  };

  const handleRemoveStop = (stopId: string) => {
    const newState = itineraryManager.removeStop(stopId);
    setItineraryState(newState);
    if (onItineraryChange) onItineraryChange(newState);
    toast.info("Stop removed from itinerary");
  };

  const handleToggleSkip = (stopId: string) => {
    const newState = itineraryManager.toggleSkipStop(stopId);
    setItineraryState(newState);
    if (onItineraryChange) onItineraryChange(newState);
  };

  const handleExtendOvernight = () => {
    const newState = itineraryManager.extendTripOvernight(1);
    setItineraryState(newState);
    if (onItineraryChange) onItineraryChange(newState);
    toast.success(`Extended trip to multi-day with overnight resort stay near ${destinationName} ✓`);
  };

  const handleRestoreOriginal = () => {
    const newState = itineraryManager.restoreOriginalItinerary();
    setItineraryState(newState);
    if (onItineraryChange) onItineraryChange(newState);
    toast.info("Restored original planned itinerary");
  };

  const handleManualArrival = () => {
    geofenceManager.confirmArrivalManually();
    setArrivalState("arrived");
    setManualArrived(true);
    toast.success(`Arrival confirmed at ${destinationName}! Explore nearby places below 🎉`);
  };

  const handleToggleTracking = () => {
    const paused = geofenceManager.togglePause();
    setIsTrackingActive(!paused);
    toast.info(paused ? "Location tracking paused" : "Location tracking active");
  };

  return (
    <div className="space-y-6 rounded-3xl border border-emerald-500/30 bg-slate-900/95 p-6 text-white shadow-2xl backdrop-blur-xl">
      {/* Header & Geofence Tracker Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-500/20 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Compass className="size-3.5 text-emerald-400" /> ExploreTN Explore More
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Spontaneous Trip Copilot & Location Assistant
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Real-time geofence arrival detection, spontaneous spot discovery, and dynamic route recalculation.
          </p>
        </div>

        {/* Tracker Status & Manual Confirm Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleTracking}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              isTrackingActive
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
            }`}
          >
            {isTrackingActive ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            <span>{isTrackingActive ? "Tracking Active" : "Tracking Paused"}</span>
          </button>

          <button
            type="button"
            onClick={handleManualArrival}
            className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="size-3.5" />
            <span>Confirm Arrival Here</span>
          </button>
        </div>
      </div>

      {/* Arrival Banner Notification */}
      <AnimatePresence>
        {(arrivalState === "arrived" || manualArrived) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl bg-gradient-to-r from-emerald-950 via-zinc-900 to-emerald-900 border border-emerald-400/40 p-4 shadow-xl flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-500 text-slate-950 font-black">
                📍
              </span>
              <div>
                <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  🎉 Welcome to {destinationName}! You've reached your destination.
                </h4>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Discover nearby food, waterfalls, viewpoint peaks, or extend your trip overnight below.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Discovery Workspace: Search + Categories */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Natural Language Search Input */}
          <div className="relative w-full flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Ask anything (e.g. 'Find good food near me', 'Show waterfalls', 'What can we visit in 2 hrs?')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-800/90 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition font-medium"
            />
          </div>

          {/* OverNight Trip Extension Action */}
          <button
            type="button"
            onClick={handleExtendOvernight}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition text-xs font-bold shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Bed className="size-4 text-amber-400" />
            <span>Stay Overnight (+1 Day)</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { key: "all", label: "All Nearby", icon: Sparkles },
            { key: "food", label: "🍲 Food & Rest", icon: Utensils },
            { key: "waterfalls", label: "💧 Waterfalls", icon: Waves },
            { key: "hills", label: "⛰️ Hills & Views", icon: Mountain },
            { key: "temples", label: "🛕 Heritage", icon: Landmark },
            { key: "beaches", label: "🏖️ Beaches", icon: Waves },
            { key: "hotel", label: "🏨 Resorts & Stays", icon: Bed },
          ].map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key as DiscoveryCategory)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer flex items-center gap-1.5 border ${
                  isActive
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20"
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span>{recommendations.length} Spontaneous Spots Discovered Nearby</span>
          {itineraryState.isModified && (
            <button
              onClick={handleRestoreOriginal}
              className="text-amber-400 hover:underline flex items-center gap-1 text-[11px]"
            >
              <RotateCcw className="size-3" /> Restore Original Itinerary
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
          {recommendations.slice(0, 6).map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.01 }}
              className="rounded-2xl border border-slate-800 bg-slate-800/80 p-3.5 flex flex-col justify-between space-y-3 hover:border-emerald-500/40 transition"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-xs text-white line-clamp-1">{item.name}</h4>
                    <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                      📍 {item.distanceKm} km away · {item.matchReason}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    ★ {item.rating}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">{item.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-slate-400">{item.openingHours}</span>
                <button
                  type="button"
                  onClick={() => handleAddStopToItinerary(item)}
                  className="px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-[11px] transition flex items-center gap-1 cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  <Plus className="size-3.5" />
                  <span>Add to Trip</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Active Dynamic Itinerary Manager Sequence */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-emerald-400" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Active Modified Itinerary ({itineraryState.activeStops.length} Stops · {itineraryState.totalDistanceKm} km · ₹{itineraryState.totalCostEstimate.toLocaleString("en-IN")})
            </h3>
          </div>
          {itineraryState.isExtendedOvernight && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              🌙 Multi-Day Extended (+{itineraryState.extendedNights} Night)
            </span>
          )}
        </div>

        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {itineraryState.activeStops.map((stop, idx) => (
            <div
              key={stop.id}
              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                stop.isSkipped
                  ? "bg-slate-950/50 border-slate-800 opacity-50 line-through text-slate-500"
                  : stop.isCustomAdded
                  ? "bg-emerald-950/40 border-emerald-500/40 text-white"
                  : "bg-slate-800/80 border-slate-700 text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-900 text-emerald-400 font-bold">
                  {stop.timeSlot}
                </span>
                <div>
                  <p className="font-bold text-xs flex items-center gap-1.5">
                    <span>{stop.name}</span>
                    {stop.isCustomAdded && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500 text-slate-950">
                        Added
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-slate-400">{stop.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleToggleSkip(stop.id)}
                  className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-[10px] font-semibold text-slate-300 transition"
                >
                  {stop.isSkipped ? "Unskip" : "Skip"}
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveStop(stop.id)}
                  className="p-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 transition"
                  title="Remove stop"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
