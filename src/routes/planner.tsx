import { useState } from "react";
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
      text: "Hi! I am your ExplorerTN Trip Copilot. Tell me where you want to start, your budget, or interests (e.g. 'trip from chennai to madurai at 11 pm' or 'one-day bike trip to ooty').",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dynamic Route & Planner Response State
  const [plannerData, setPlannerData] = useState<PlannerChatResponseDTO | null>(null);
  const [timeline, setTimeline] = useState<Array<{ time: string; name: string; description: string }>>([
    {
      time: "06:00 AM",
      name: "Start Location",
      description: "Enter your starting city to generate a verified Tamil Nadu itinerary and road route.",
    },
  ]);

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

  const destLower = destName.toLowerCase();
  const destCoord = CITY_COORDINATES[destLower] || { lat: 9.9252, lng: 78.1198, desc: `${destName} Destination` };

  const distanceKm = plannerData?.route?.distanceKm || 0;
  const durationMins = plannerData?.route?.durationMinutes || 0;
  const hours = Math.floor(durationMins / 60);
  const mins = durationMins % 60;
  const durationDisplay = durationMins > 0 ? `${hours}h ${mins}m` : "N/A";

  const fuelCostDisplay = plannerData?.costEstimate?.fuelCost || "₹0";
  const totalCostDisplay = plannerData?.costEstimate?.total ? `₹${plannerData.costEstimate.total.toLocaleString("en-IN")}` : "₹3,000";
  const budgetDisplay = plannerData?.plannerState?.budget ? `₹${plannerData.plannerState.budget.toLocaleString("en-IN")}` : "₹3,000";
  const weatherDisplay = plannerData?.weather?.tempRange ? `${plannerData.weather.tempRange} (${plannerData.weather.condition || 'Clear'})` : "22–32°C";

  const warnings = plannerData?.validation?.warnings || [];

  return (
    <AppShell>
      <PageHeader
        eyebrow="AI Planner & Real Road Routing"
        title="Plan the whole ride in one conversation"
        description="Tell it where you are, how long you have and what you love. It returns a verified road map, route distance, travel time, fuel cost, weather and packing list."
      />

      <div className="mx-auto grid max-w-6xl gap-6 px-4 pb-24 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
        {/* Left Column: Chat Conversation Panel */}
        <div className="glass flex h-[640px] flex-col rounded-4xl p-5 shadow-elevate">
          <p className="mb-4 flex items-center justify-between text-sm font-medium">
            <span className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Compass className="size-4" aria-hidden />
              </span>
              Trip copilot
            </span>
            {plannerData?.traceId && (
              <span className="rounded-md border border-border/50 bg-background/50 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                {plannerData.traceId}
              </span>
            )}
          </p>

          {errorMsg && (
            <div className="mb-3 flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={m.role === "user" ? "flex justify-end" : ""}
              >
                {m.role === "user" ? (
                  <p className="max-w-[85%] rounded-2xl bg-primary px-4 py-3 text-sm text-primary-foreground">{m.text}</p>
                ) : (
                  <div className="max-w-[95%] rounded-2xl border border-border/60 bg-card/60 p-4 text-sm leading-relaxed text-foreground backdrop-blur-md">
                    <p className="whitespace-pre-line">{m.text}</p>
                  </div>
                )}
              </motion.div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin text-primary" />
                <span>Querying PostGIS, calculating OSRM road geometry & fuel math...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-background/50 p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. trip from chennai to madurai at 11 pm"
              aria-label="Message the trip planner"
              disabled={loading}
              className="min-h-11 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()} className="rounded-xl" aria-label="Send">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </form>
        </div>

        {/* Right Column: Interactive Route Map, Route Metrics & Itinerary */}
        <div className="space-y-4">
          {/* Feasibility Alert / Overnight Advisory Banner */}
          {warnings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={
                overnightTravel
                  ? "rounded-3xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-indigo-200 shadow-md backdrop-blur-md"
                  : "rounded-3xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200 shadow-md backdrop-blur-md"
              }
            >
              <div className="flex items-start gap-3">
                {overnightTravel ? (
                  <Moon className="mt-0.5 size-5 text-indigo-400 shrink-0" />
                ) : (
                  <ShieldAlert className="mt-0.5 size-5 text-amber-400 shrink-0" />
                )}
                <div>
                  <h4 className="font-display text-xs font-bold uppercase tracking-wider">
                    {overnightTravel ? "🌙 Overnight Travel Plan" : "⚠️ Trip Feasibility Warning"}
                  </h4>
                  {warnings.map((w, idx) => (
                    <p key={idx} className="mt-1 text-xs leading-relaxed opacity-90">
                      {w}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Interactive Mapcn.dev Route Map Card */}
          <div className="glass overflow-hidden rounded-4xl p-2 shadow-elevate">
            <div className="flex items-center justify-between px-4 py-2">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Navigation className="size-3.5 text-emerald-400" /> Interactive OSRM Road Map
              </p>
              {mapRoutePoints.length > 0 && (
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                  {plannerData?.route?.provider || "OSRM Engine"}
                </span>
              )}
            </div>

            <Map center={[10.8, 78.7]} zoom={6} style="dark" className="h-[280px] w-full rounded-3xl border-0">
              <MapControls position="top-right" />

              {/* Render OSRM Road Geometry LineString */}
              {mapRoutePoints.length > 1 && (
                <MapRoute coordinates={mapRoutePoints} animated color="#10b981" weight={3.5} />
              )}

              {/* Origin Marker */}
              <MapMarker latitude={13.0827} longitude={80.2707}>
                <MarkerContent>
                  <span className="relative flex size-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-3 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />
                  </span>
                </MarkerContent>
                <MarkerLabel>Origin: {originName}</MarkerLabel>
              </MapMarker>

              {/* Destination Marker (Dynamic) */}
              <MapMarker latitude={destCoord.lat} longitude={destCoord.lng}>
                <MarkerContent>
                  <span className="flex size-4 items-center justify-center rounded-full bg-emerald-600 ring-4 ring-emerald-500/30">
                    <MapPin className="size-2.5 text-white" />
                  </span>
                </MarkerContent>
                <MarkerLabel>Destination: {destName}</MarkerLabel>
                <MarkerTooltip>{destCoord.desc}</MarkerTooltip>
                <MarkerPopup title={destName} rating={4.8}>
                  <p className="text-xs text-muted-foreground">{destCoord.desc}</p>
                </MarkerPopup>
              </MapMarker>

              {/* Waypoint Marker */}
              {waypointsList.some((w) => w.toLowerCase().includes("madurai")) && destName.toLowerCase() !== "madurai" && (
                <MapMarker latitude={9.9252} longitude={78.1198}>
                  <MarkerContent>
                    <span className="size-3 rounded-full bg-amber-400 ring-2 ring-amber-400/30" />
                  </MarkerContent>
                  <MarkerLabel>Waypoint: Madurai</MarkerLabel>
                </MapMarker>
              )}
            </Map>
          </div>

          {/* Route Metrics Summary Grid */}
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-3xl border border-border bg-card p-3.5">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <Navigation className="size-3 text-emerald-400" /> Distance
              </p>
              <p className="mt-1.5 font-display text-base font-bold text-foreground">
                {distanceKm > 0 ? `${distanceKm.toLocaleString("en-IN")} km` : "0 km"}
              </p>
              <p className="text-[10px] text-muted-foreground">Round-trip road</p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-3.5">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <Clock className="size-3 text-sky-400" /> Riding Time
              </p>
              <p className="mt-1.5 font-display text-base font-bold text-foreground">{durationDisplay}</p>
              <p className="text-[10px] text-muted-foreground">OSRM Riding ETA</p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-3.5">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <Fuel className="size-3 text-amber-400" /> Fuel Cost
              </p>
              <p className="mt-1.5 font-display text-base font-bold text-foreground">{fuelCostDisplay}</p>
              <p className="text-[10px] text-muted-foreground">@ 32 km/L mileage</p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-3.5">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <Wallet className="size-3 text-purple-400" /> Total Cost
              </p>
              <p className="mt-1.5 font-display text-base font-bold text-foreground">{totalCostDisplay}</p>
              <p className="text-[10px] text-muted-foreground">Budget: {budgetDisplay}</p>
            </div>
          </div>

          {/* Generated Timeline Card */}
          <div className="glass rounded-4xl p-5 shadow-elevate">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="size-4 text-gold" aria-hidden /> Verified Itinerary Timeline
            </p>
            <ol className="mt-4 space-y-3 border-l border-border pl-5">
              {timeline.map((s, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="relative rounded-2xl border border-border bg-card p-3"
                >
                  <span className="absolute -left-[27px] top-4 size-3 rounded-full bg-primary ring-4 ring-background" />
                  <p className="font-display text-sm font-semibold">{s.time} · {s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                </motion.li>
              ))}
            </ol>
          </div>

          {/* Packing Checklist Card */}
          <div className="glass rounded-4xl p-5">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Backpack className="size-4 text-sunset" aria-hidden /> Packing checklist
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {defaultPacking.map((p) => (
                <span key={p} className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground">
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button className="rounded-xl">
              <Download className="size-4" /> Download itinerary
            </Button>
            <Button variant="outline" className="rounded-xl">
              <Share2 className="size-4" /> Share
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
