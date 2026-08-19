import { useState, useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Send,
  Sparkles,
  Wallet,
  Fuel,
  CloudSun,
  Backpack,
  Download,
  Share2,
  Compass,
  AlertCircle,
  Loader2,
  MapPin,
  Clock,
  Navigation,
  ShieldAlert,
  Moon,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import { PlannerApiRepository, PlannerChatResponseDTO } from "@/lib/api-client/planner";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerLabel,
  MarkerPopup,
  MarkerTooltip,
  MapControls,
  MapRoute,
} from "@/components/ui/map";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Trip Planner — ExplorerTN" },
      {
        name: "description",
        content:
          "Describe your weekend and get a Tamil Nadu itinerary with interactive road route map, distance, travel time, fuel cost, weather and packing list.",
      },
      { property: "og:title", content: "AI Trip Planner — ExplorerTN" },
      {
        property: "og:description",
        content: "Itinerary, interactive road route map, budget, fuel and packing list for your next Tamil Nadu ride.",
      },
    ],
  }),
  component: PlannerPage,
});

const defaultPacking = [
  "Rain shell",
  "Grip gloves",
  "Headlamp",
  "2L water",
  "Power bank",
  "Cash ₹2,000",
  "Tyre inflator",
];

// Well-known coordinates for Mapcn marker fallback positioning
const CITY_COORDINATES: Record<string, { lat: number; lng: number; desc: string }> = {
  madurai: { lat: 9.9252, lng: 78.1198, desc: "Meenakshi Amman Temple & Heritage City" },
  ooty: { lat: 11.4102, lng: 76.6950, desc: "Queen of Hill Stations (Nilgiris)" },
  kodaikanal: { lat: 10.2381, lng: 77.4892, desc: "Princess of Hill Stations (Dindigul)" },
  valparai: { lat: 10.3270, lng: 76.9554, desc: "70 Hairpin Pass Ghat Run" },
  chennai: { lat: 13.0827, lng: 80.2707, desc: "Capital City Departure Point" },
  salem: { lat: 11.6643, lng: 78.1460, desc: "Mango City En-Route Stop" },
  trichy: { lat: 10.7905, lng: 78.7047, desc: "Rockfort Heritage City" },
};

export function PlannerPage() {
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    {
      role: "assistant",
      text: "Hi! I am your ExplorerTN Trip Copilot. Tell me where you want to start, your budget, or interests (e.g. 'trip from chennai to madurai at 11 pm' or 'Plan a Paragliding trip to Bir Billing').",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const initializedRef = useRef(false);

  // Dynamic Route & Planner Response State
  const [plannerData, setPlannerData] = useState<PlannerChatResponseDTO | null>(null);
  const [timeline, setTimeline] = useState<Array<{ time: string; name: string; description: string }>>([
    {
      time: "06:00 AM",
      name: "Start Location",
      description: "Enter your starting city to generate a verified Tamil Nadu itinerary and road route.",
    },
  ]);

  // Safe client-only URL search parameter parsing on mount
  useEffect(() => {
    if (typeof window === "undefined" || initializedRef.current) return;
    const searchParams = new URLSearchParams(window.location.search);
    const urlPrompt = searchParams.get("prompt");

    if (urlPrompt) {
      initializedRef.current = true;
      setErrorMsg(null);
      setMessages((prev) => [...prev, { role: "user", text: urlPrompt }]);
      setLoading(true);

      PlannerApiRepository.sendChatMessage(urlPrompt, conversationId)
        .then((res: PlannerChatResponseDTO) => {
          setConversationId(res.conversationId);
          setPlannerData(res);
          setMessages((prev) => [...prev, { role: "assistant", text: res.message }]);
          if (res.timeline && res.timeline.length > 0) {
            setTimeline(res.timeline);
          }
        })
        .catch((err: any) => {
          setErrorMsg(err?.message || "Trip Copilot is temporarily unavailable.");
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");
    setErrorMsg(null);
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    try {
      const res: PlannerChatResponseDTO = await PlannerApiRepository.sendChatMessage(userText, conversationId);
      setConversationId(res.conversationId);
      setPlannerData(res);
      
      setMessages((prev) => [...prev, { role: "assistant", text: res.message }]);

      if (res.timeline && res.timeline.length > 0) {
        setTimeline(res.timeline);
      }
    } catch (err: any) {
      const msg = err?.message || "Trip Copilot is temporarily unavailable.";
      setErrorMsg(msg);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Trip Copilot encountered an issue connecting to the backend. Please verify details and retry.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Extract Route Coordinates & Markers from API response
  const rawCoords = plannerData?.route?.geometry?.coordinates || [];
  const mapRoutePoints: Array<[number, number]> = rawCoords.map(([lng, lat]) => [lat, lng]);

  const originName = plannerData?.plannerState?.origin || "Chennai";
  const destName = plannerData?.plannerState?.destination || "Madurai";
  const waypointsList = plannerData?.plannerState?.waypoints || [];
  const overnightTravel = plannerData?.plannerState?.overnightTravel || false;

  const originCityKey = originName.toLowerCase();
  const destCityKey = destName.toLowerCase();

  const originPos = CITY_COORDINATES[originCityKey] || { lat: 13.0827, lng: 80.2707, desc: `${originName} Departure` };
  const destPos = CITY_COORDINATES[destCityKey] || { lat: 9.9252, lng: 78.1198, desc: `${destName} Target Destination` };

  const missingFields = plannerData?.missingFields || [];
  const warnings = plannerData?.validation?.warnings || [];
  const costEstimate = plannerData?.costEstimate;

  return (
    <AppShell>
      <PageHeader
        title="AI Trip Copilot"
        subtitle="Conversational route & feasibility engine powered by PostGIS spatial database, OSRM highway routing, and OpenSERP web evidence."
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-12">

          {/* Left Column: Chat Conversation Stream */}
          <div className="flex flex-col rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121821]/80 backdrop-blur-[16px] shadow-sm lg:col-span-6 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-bold text-slate-900 dark:text-white">Live Planner Chat</h3>
              </div>
              <span className="text-xs font-mono font-medium text-slate-400">
                {conversationId ? `Session: ${conversationId}` : "New Session"}
              </span>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-6 max-h-[500px]">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-emerald-600 text-white font-medium shadow-md shadow-emerald-600/20"
                        : "bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl bg-slate-100 dark:bg-white/5 px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <Loader2 className="size-4 animate-spin text-emerald-500" />
                    <span>Calculating OSRM road geometry & route feasibility...</span>
                  </div>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="mx-6 mb-3 flex items-center gap-2 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-600 dark:text-rose-400 font-medium">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="border-t border-slate-100 dark:border-white/10 p-4">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Ask copilot... (e.g. 'add ooty', 'include food spots', 'make it 2 days')"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 py-3.5 pl-4 pr-12 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                />
                <Button
                  type="submit"
                  disabled={loading || !input.trim()}
                  size="icon"
                  className="absolute right-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white size-9"
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column: Route Map & Feasibility Overview */}
          <div className="space-y-6 lg:col-span-6">
            {/* Interactive OSRM Route Mapcn */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-900 shadow-sm relative h-[320px]">
              <Map center={[originPos.lat, originPos.lng]} zoom={7} className="size-full">
                <MapControls />
                {mapRoutePoints.length > 0 && (
                  <MapRoute coordinates={mapRoutePoints} color="#10b981" weight={4} dashArray="6,8" />
                )}

                <MapMarker latitude={originPos.lat} longitude={originPos.lng}>
                  <MarkerContent>
                    <div className="grid size-7 place-items-center rounded-full bg-emerald-500 text-slate-950 font-black text-xs shadow-lg">
                      A
                    </div>
                  </MarkerContent>
                  <MarkerTooltip>{originName} (Origin)</MarkerTooltip>
                </MapMarker>

                <MapMarker latitude={destPos.lat} longitude={destPos.lng}>
                  <MarkerContent>
                    <div className="grid size-7 place-items-center rounded-full bg-amber-500 text-slate-950 font-black text-xs shadow-lg">
                      B
                    </div>
                  </MarkerContent>
                  <MarkerTooltip>{destName} (Destination)</MarkerTooltip>
                </MapMarker>
              </Map>

              {overnightTravel && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 bg-indigo-950/90 border border-indigo-500/40 text-indigo-300 text-xs font-bold rounded-full backdrop-blur-md">
                  <Moon className="size-3.5 text-indigo-400" />
                  <span>Overnight Ride Scheduled</span>
                </div>
              )}
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121821]/80 p-4 text-center">
                <Navigation className="mx-auto size-5 text-emerald-500 mb-1" />
                <div className="text-xs font-medium text-slate-500 dark:text-muted-foreground">Round Distance</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {plannerData?.route?.distanceKm ? `${plannerData.route.distanceKm} km` : "—"}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121821]/80 p-4 text-center">
                <Clock className="mx-auto size-5 text-indigo-500 mb-1" />
                <div className="text-xs font-medium text-slate-500 dark:text-muted-foreground">Travel Time</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {plannerData?.route?.durationMinutes
                    ? `${Math.floor(plannerData.route.durationMinutes / 60)}h ${plannerData.route.durationMinutes % 60}m`
                    : "—"}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121821]/80 p-4 text-center">
                <Fuel className="mx-auto size-5 text-amber-500 mb-1" />
                <div className="text-xs font-medium text-slate-500 dark:text-muted-foreground">Est. Fuel Cost</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {costEstimate?.fuelCost || "—"}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121821]/80 p-4 text-center">
                <Wallet className="mx-auto size-5 text-purple-500 mb-1" />
                <div className="text-xs font-medium text-slate-500 dark:text-muted-foreground">Total Budget</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {costEstimate?.total ? `₹${costEstimate.total}` : "—"}
                </div>
              </div>
            </div>

            {/* Feasibility Advisory Warnings */}
            {warnings.length > 0 && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-700 dark:text-amber-300 font-medium space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-200">
                  <ShieldAlert className="size-4" />
                  <span>Feasibility Advisories</span>
                </div>
                {warnings.map((w, idx) => (
                  <div key={idx}>• {w}</div>
                ))}
              </div>
            )}

            {/* Timeline Itinerary */}
            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121821]/80 p-6 space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="size-4 text-emerald-500" />
                <span>Generated Itinerary Timeline</span>
              </h4>

              <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-white/10 pl-6">
                {timeline.map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-6 top-1 size-2.5 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-[#121821]" />
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{item.time}</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</div>
                    <div className="text-xs text-slate-500 dark:text-muted-foreground">{item.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
