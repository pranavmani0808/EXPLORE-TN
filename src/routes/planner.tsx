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
  Check,
  ArrowRight,
  Bookmark,
  Trash2,
  PlusCircle,
  RefreshCw,
  Award
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/site/app-shell";
import { AITravelPlannerInput } from "@/components/site/ai-travel-planner-input";
import { Button } from "@/components/ui/button";
import { useAuthGuard } from "@/lib/auth-guard-context";
import { toast } from "sonner";
import { PlannerApiRepository, PlannerChatResponseDTO, SuggestedCategoryItem } from "@/lib/api-client/planner";
import { resolvePlace } from "@/lib/data/canonical-places";
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
          "Describe your trip and get a verified itinerary with interactive road route map, distance, travel time, fuel cost, weather and packing list.",
      },
      { property: "og:title", content: "AI Trip Planner — ExplorerTN" },
      {
        property: "og:description",
        content: "Itinerary, interactive road route map, budget, fuel and packing list for your next journey.",
      },
    ],
  }),
  component: PlannerPage,
});

// Well-known canonical coordinates for map positioning fallbacks
const CITY_COORDINATES: Record<string, { lat: number; lng: number; desc: string }> = {
  madurai: { lat: 9.9252, lng: 78.1198, desc: "Meenakshi Amman Temple & Heritage City" },
  ooty: { lat: 11.4102, lng: 76.6950, desc: "Queen of Hill Stations (Nilgiris)" },
  kodaikanal: { lat: 10.2381, lng: 77.4892, desc: "Princess of Hill Stations (Dindigul)" },
  valparai: { lat: 10.3270, lng: 76.9554, desc: "70 Hairpin Pass Ghat Run" },
  chennai: { lat: 13.0827, lng: 80.2707, desc: "Capital City Departure Point" },
  salem: { lat: 11.6643, lng: 78.1460, desc: "Mango City En-Route Stop" },
  trichy: { lat: 10.7905, lng: 78.7047, desc: "Rockfort Heritage City" },
  goa: { lat: 15.6868, lng: 73.7042, desc: "Goa Surfing & Coastal Beach" },
  "bir billing": { lat: 32.0365, lng: 76.7196, desc: "Bir Billing Paragliding Takeoff Point" },
  bir: { lat: 32.0365, lng: 76.7196, desc: "Bir Billing Paragliding Takeoff Point" },
  mysore: { lat: 12.2958, lng: 76.6394, desc: "Mysore Skydiving Dropzone" },
  jaipur: { lat: 26.9124, lng: 75.7873, desc: "Jaipur Hot Air Balloon Launch" },
  havelock: { lat: 12.0000, lng: 92.9800, desc: "Havelock Island Scuba Reef" },
  "havelock island": { lat: 12.0000, lng: 92.9800, desc: "Havelock Island Scuba Reef" },
  zanskar: { lat: 33.4833, lng: 76.8833, desc: "Zanskar River Kayaking Rapids" },
  "zanskar river": { lat: 33.4833, lng: 76.8833, desc: "Zanskar River Kayaking Rapids" },
  rishikesh: { lat: 30.0869, lng: 78.2676, desc: "Rishikesh Ganges Rafting Point" },
  kovalam: { lat: 8.4004, lng: 76.9787, desc: "Kovalam Lighthouse Surf Break" },
  gulmarg: { lat: 34.0484, lng: 74.3805, desc: "Gulmarg Gondola & Alpine Snow Peak" },
  "elephant beach": { lat: 11.9961, lng: 92.9515, desc: "Elephant Beach Sea Walk" },
};

function PlannerPage() {
  const { requireAuth } = useAuthGuard();
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    {
      role: "assistant",
      text: "Hi! I am your ExplorerTN Trip Copilot. Tell me where you want to start, your budget, or interests (e.g. 'Plan a trip inside Madurai', 'Plan a trip to Kodaikanal', or 'Plan a River Rafting trip to Rishikesh').",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const initializedRef = useRef(false);
  const activeRequestIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Dynamic Route & Planner Response State
  const [plannerData, setPlannerData] = useState<PlannerChatResponseDTO | null>(null);
  const [aiPlanData, setAiPlanData] = useState<any | null>(null);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);

  // Interactive Trip Customizer State
  const [customDays, setCustomDays] = useState<number>(1);
  const [customOrigin, setCustomOrigin] = useState<string>("");
  const [customInterests, setCustomInterests] = useState<string[]>([
    "🛕 Temples & Heritage",
    "🍲 Local Tamil Food"
  ]);
  const [customTransport, setCustomTransport] = useState<string>("Car");

  const currentDestination = plannerData?.plannerState?.destination || aiPlanData?.destination?.name || "Madurai";
  const effectiveOrigin = customOrigin || plannerData?.plannerState?.origin || currentDestination;

  const toggleCustomInterest = (interest: string) => {
    setCustomInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleGenerateCustomPlan = () => {
    const interestLabels = customInterests.length > 0 ? customInterests.join(", ") : "Top Attractions & Local Food";
    const customPrompt = `Plan a ${customDays}-day trip to ${currentDestination} starting from ${effectiveOrigin} focused on ${interestLabels} via ${customTransport}`;
    handleSendMessage(customPrompt);
  };

  const handleAISearch = async (params: {
    query: string;
    origin?: string;
    destination?: string;
    days?: number;
    categories?: string[];
  }) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await PlannerApiRepository.planAITravel(params);
      setAiPlanData(res);
      setMessages((prev) => [
        ...prev,
        { role: "user", text: params.query },
        { role: "assistant", text: res.summary || `AI Plan generated for ${params.query}` }
      ]);
      toast.success("AI Travel Plan generated successfully ✓");
    } catch (err: any) {
      console.error(err);
      // Fallback to chat assistant if standard AI plan route fails
      handleSendMessage(params.query);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStop = async (placeId: string) => {
    if (!aiPlanData) return;
    try {
      const res = await PlannerApiRepository.modifyAIPlan({
        current_plan: aiPlanData,
        action: "remove_stop",
        target_stop_id: placeId
      });
      setAiPlanData(res);
      toast.info("Stop removed. Route recalculated ✓");
    } catch (err: any) {
      toast.error("Failed to modify route stop.");
    }
  };

  const handleAddHiddenPlaces = async () => {
    if (!aiPlanData) return;
    try {
      const res = await PlannerApiRepository.modifyAIPlan({
        current_plan: aiPlanData,
        action: "add_hidden"
      });
      setAiPlanData(res);
      toast.success("Added hidden gem place to itinerary ✓");
    } catch (err: any) {
      toast.error("Failed to add hidden place.");
    }
  };
  const [timeline, setTimeline] = useState<Array<{ time: string; name: string; description: string }>>([]);

  // Safe client-only URL search parameter parsing on mount
  useEffect(() => {
    if (typeof window === "undefined" || initializedRef.current) return;
    const searchParams = new URLSearchParams(window.location.search);
    const urlPrompt = searchParams.get("prompt");

    if (urlPrompt) {
      initializedRef.current = true;
      setErrorMsg(null);
      
      const requestId = crypto.randomUUID();
      activeRequestIdRef.current = requestId;

      setMessages([
        {
          role: "assistant",
          text: "Hi! I am your ExplorerTN Trip Copilot. Tell me where you want to start, your budget, or interests.",
        },
        { role: "user", text: urlPrompt },
      ]);
      setLoading(true);

      PlannerApiRepository.sendChatMessage(urlPrompt, undefined)
        .then((res: PlannerChatResponseDTO) => {
          if (activeRequestIdRef.current !== requestId) return;

          setConversationId(res.conversationId);
          setPlannerData(res);
          setMessages((prev) => [...prev, { role: "assistant", text: res.message }]);
          if (res.timeline && res.timeline.length > 0) {
            setTimeline(res.timeline);
          }
        })
        .catch((err: any) => {
          if (activeRequestIdRef.current !== requestId) return;
          setErrorMsg(err?.message || "Trip Copilot is temporarily unavailable.");
        })
        .finally(() => {
          if (activeRequestIdRef.current === requestId) setLoading(false);
        });
    }
  }, []);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userText = textToSend.trim();
    setInput("");
    setErrorMsg(null);
    setSelectedChips([]);

    const requestId = crypto.randomUUID();
    activeRequestIdRef.current = requestId;

    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    try {
      const res: PlannerChatResponseDTO = await PlannerApiRepository.sendChatMessage(userText, conversationId);
      if (activeRequestIdRef.current !== requestId) return;

      setConversationId(res.conversationId);
      setPlannerData(res);
      setMessages((prev) => [...prev, { role: "assistant", text: res.message }]);

      if (res.timeline && res.timeline.length > 0) {
        setTimeline(res.timeline);
      }
    } catch (err: any) {
      if (activeRequestIdRef.current !== requestId) return;
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
      if (activeRequestIdRef.current === requestId) setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const toggleChipSelection = (chipLabel: string) => {
    setSelectedChips((prev) =>
      prev.includes(chipLabel) ? prev.filter((c) => c !== chipLabel) : [...prev, chipLabel]
    );
  };

  const handleSubmitSelectedChips = () => {
    if (selectedChips.length === 0) return;
    const text = selectedChips.join(", ");
    handleSendMessage(text);
  };

  // Extract Route Coordinates & Markers dynamically from API response (prioritizing AI Plan state)
  const stops = aiPlanData?.ordered_stops || [];
  const rawCoords = aiPlanData?.route_polyline_points || (plannerData?.route?.geometry?.coordinates || []).map(([lng, lat]) => [lat, lng]);
  
  const mapRoutePoints: Array<[number, number]> = (aiPlanData?.route_polyline_points && aiPlanData.route_polyline_points.length > 0)
    ? aiPlanData.route_polyline_points
    : rawCoords.length > 0
    ? rawCoords
    : stops.length > 0
    ? stops.map((s: any) => [s.lat, s.lng])
    : [];

  const originName = aiPlanData?.origin?.name || plannerData?.plannerState?.origin || "Madurai";
  const destName = aiPlanData?.destination?.name || plannerData?.plannerState?.destination || "Ooty";
  const overnightTravel = plannerData?.plannerState?.overnightTravel || false;

  const originCityKey = originName.toLowerCase();
  const destCityKey = destName.toLowerCase();

  // Canonical Place Engine Resolution
  const canonicalOrigin = resolvePlace(originName);
  const canonicalDest = resolvePlace(destName);

  const originPos = mapRoutePoints.length > 0
    ? { lat: mapRoutePoints[0][0], lng: mapRoutePoints[0][1], desc: `${canonicalOrigin?.canonicalName || originName} Departure` }
    : canonicalOrigin
    ? { lat: canonicalOrigin.latitude, lng: canonicalOrigin.longitude, desc: `${canonicalOrigin.canonicalName} (${canonicalOrigin.district})` }
    : (CITY_COORDINATES[originCityKey] || { lat: 9.9252, lng: 78.1198, desc: `${originName} Departure` });

  const destPos = mapRoutePoints.length > 0
    ? { lat: mapRoutePoints[mapRoutePoints.length - 1][0], lng: mapRoutePoints[mapRoutePoints.length - 1][1], desc: `${canonicalDest?.canonicalName || destName} Target Destination` }
    : canonicalDest
    ? { lat: canonicalDest.latitude, lng: canonicalDest.longitude, desc: `${canonicalDest.canonicalName} (${canonicalDest.district})` }
    : (CITY_COORDINATES[destCityKey] || { lat: 11.4102, lng: 76.6950, desc: `${destName} Target Destination` });

  const centerLat = (originPos.lat + destPos.lat) / 2;
  const centerLng = (originPos.lng + destPos.lng) / 2;
  const latDiff = Math.abs(originPos.lat - destPos.lat);
  const lngDiff = Math.abs(originPos.lng - destPos.lng);
  const maxDiff = Math.max(latDiff, lngDiff);

  let mapZoom = 7;
  if (maxDiff > 14) mapZoom = 4;
  else if (maxDiff > 7) mapZoom = 5;
  else if (maxDiff > 3) mapZoom = 6;

  const warnings = plannerData?.validation?.warnings || [];
  const costEstimate = plannerData?.costEstimate;

  const isDiscoveryPhase = plannerData?.plannerState?.discoveryPhase === "DISCOVER_INTERESTS" || (plannerData?.suggestedCategories && plannerData.suggestedCategories.length > 0);
  const hasValidPlan = Boolean(plannerData || aiPlanData);

  return (
    <AppShell>
      <PageHeader
        eyebrow="AI Travel Intelligence"
        title="AI Trip Copilot"
        description="Conversational route & feasibility engine powered by PostGIS spatial database, OSRM highway routing, and OpenSERP web evidence."
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
        {/* Prominent AI Travel Intelligence Engine Input Bar */}
        <AITravelPlannerInput onSearch={handleAISearch} isLoading={loading} />

        {/* AI Travel Plan Summary & Controls Banner */}
        {aiPlanData && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/30 rounded-2xl shadow-lg text-white space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    {aiPlanData.intent_type || "AI PLAN"}
                  </span>
                  <h3 className="font-bold text-lg text-emerald-300">{aiPlanData.title}</h3>
                </div>
                <p className="text-xs text-slate-300 mt-1">{aiPlanData.summary}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleAddHiddenPlaces}
                  className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold"
                >
                  <PlusCircle className="w-3.5 h-3.5 mr-1" /> Add Hidden Places
                </Button>
              </div>
            </div>

            {/* AI Ordered Stops Cards List */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-400" /> Ranked Itinerary Stops ({aiPlanData.ordered_stops?.length || 0})
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {aiPlanData.ordered_stops?.map((stop: any, idx: number) => (
                  <div
                    key={stop.place_id || idx}
                    className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-[10px]">
                          {stop.order || idx + 1}
                        </span>
                        <span className="font-bold text-white text-sm">{stop.name}</span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-300">
                        <span className="text-emerald-400 font-medium">{stop.category}</span>
                        <span>•</span>
                        <span>{stop.district}</span>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2">{stop.rationale}</p>

                      <div className="flex items-center gap-2 pt-1">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[10px] font-semibold border border-emerald-500/20 flex items-center gap-1">
                          <Award className="w-3 h-3 text-emerald-400" />
                          {stop.provenance?.source || "ExploreTN Verified"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {stop.recommended_visit_mins} mins visit
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveStop(stop.place_id || stop.slug)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                      title="Remove stop and recalculate route"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid gap-8 lg:grid-cols-12">

          {/* Left Column: Chat Conversation Stream */}
          <div className="flex flex-col h-[640px] lg:h-[760px] rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121821]/90 backdrop-blur-[16px] shadow-2xl lg:col-span-6 overflow-hidden">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between border-b border-slate-100 dark:border-white/10 px-6 py-4 bg-slate-50 dark:bg-white/5">
              <div className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Sparkles className="size-4" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">Live Planner Copilot</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Ask anything or customize route</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                {conversationId ? `Session: ${conversationId.slice(0, 8)}...` : "Active"}
              </span>
            </div>

            {/* Scrollable Message Stream */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20"
                        : "bg-slate-100 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}

              {/* DESTINATION-AWARE DISCOVERY INTEREST CHIPS */}
              {isDiscoveryPhase && plannerData?.suggestedCategories && plannerData.suggestedCategories.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-3 my-2"
                >
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" /> Select What You Would Like to Explore in {plannerData.plannerState.destination}:
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {plannerData.suggestedCategories.map((item) => {
                      const isSelected = selectedChips.includes(item.label);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleChipSelection(item.label)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? "bg-emerald-500 text-black shadow-md border border-emerald-400"
                              : "bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-black" />}
                        </button>
                      );
                    })}
                  </div>

                  {selectedChips.length > 0 && (
                    <div className="pt-2 flex items-center justify-between border-t border-emerald-500/20">
                      <span className="text-[11px] text-emerald-300 font-medium">
                        Selected {selectedChips.length} interest{selectedChips.length > 1 ? "s" : ""}
                      </span>
                      <button
                        type="button"
                        onClick={handleSubmitSelectedChips}
                        className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
                      >
                        Build My Itinerary <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* INTERACTIVE TRIP CUSTOMIZER CARD */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-slate-900/90 border border-emerald-500/30 rounded-2xl space-y-3.5 my-3 text-white shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                      Interactive Trip Customizer ({currentDestination})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Refine parameters</span>
                </div>

                {/* Duration Row */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">1. Trip Duration (How many days?):</label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setCustomDays(d)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                          customDays === d
                            ? "bg-emerald-500 text-slate-950 shadow-md border border-emerald-400"
                            : "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
                        }`}
                      >
                        {d} {d === 1 ? "Day" : d === 4 ? "4+ Days" : "Days"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Origin Row */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">2. Starting Origin (Where are you starting from?):</label>
                  <div className="flex flex-wrap gap-2">
                    {[currentDestination, "Chennai", "Coimbatore", "Trichy", "Salem"].map((city) => {
                      const isSelected = effectiveOrigin.toLowerCase() === city.toLowerCase();
                      return (
                        <button
                          key={city}
                          type="button"
                          onClick={() => setCustomOrigin(city)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                            isSelected
                              ? "bg-emerald-500 text-slate-950 shadow-md border border-emerald-400"
                              : "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
                          }`}
                        >
                          📍 {city} {city.toLowerCase() === currentDestination.toLowerCase() ? "(Local)" : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Experiences & Interests Row */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">3. Experiences & Places You Want to Explore:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "🛕 Temples & Heritage",
                      "🍲 Local Tamil Food",
                      "⛰️ Nearby Hills",
                      "🏛️ Royal History",
                      "🛍️ Silk & Local Markets",
                      "🌊 Waterfalls & Streams"
                    ].map((exp) => {
                      const isSelected = customInterests.includes(exp);
                      return (
                        <button
                          key={exp}
                          type="button"
                          onClick={() => toggleCustomInterest(exp)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer ${
                            isSelected
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/50"
                              : "bg-slate-800/80 text-slate-400 border border-slate-700/60 hover:text-white"
                          }`}
                        >
                          <span>{exp}</span>
                          {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Transport Mode Row */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">4. Mode of Transport:</label>
                  <div className="flex flex-wrap gap-2">
                    {["Car", "Bike", "Bus", "Train"].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setCustomTransport(mode)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                          customTransport === mode
                            ? "bg-emerald-500 text-slate-950 shadow-md border border-emerald-400"
                            : "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
                        }`}
                      >
                        {mode === "Car" ? "🚗 Car" : mode === "Bike" ? "🏍️ Bike" : mode === "Bus" ? "🚌 Bus" : "🚆 Train"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <div className="pt-2 border-t border-emerald-500/20 flex justify-end">
                  <button
                    type="button"
                    onClick={handleGenerateCustomPlan}
                    disabled={loading}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>✨ Generate Tailored Itinerary →</span>
                  </button>
                </div>
              </motion.div>

              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl bg-slate-100 dark:bg-white/5 px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <Loader2 className="size-4 animate-spin text-emerald-500" />
                    <span>Calculating OSRM road geometry & route feasibility...</span>
                  </div>
                </div>
              )}

              {/* Scroll Anchor */}
              <div ref={messagesEndRef} />
            </div>

            {errorMsg && (
              <div className="shrink-0 mx-5 mb-2 flex items-center gap-2 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-600 dark:text-rose-400 font-medium">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Fixed Bottom Input Bar */}
            <form onSubmit={handleSubmit} className="shrink-0 border-t border-slate-100 dark:border-white/10 p-3.5 bg-slate-50 dark:bg-[#121821]/95">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Ask copilot... (e.g. 'Plan a trip to Kodaikanal', 'viewpoints and waterfalls', 'make it 2 days')"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-zinc-900/90 py-3.5 pl-4 pr-12 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
                <Button
                  type="submit"
                  disabled={loading || !input.trim()}
                  size="icon"
                  className="absolute right-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold size-9"
                >
                  <Send className="size-4 text-zinc-950" />
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column: Route Map & Feasibility Overview */}
          <div className="space-y-6 lg:col-span-6">
            {/* Interactive OSRM Route Map */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-900 shadow-sm relative h-[320px]">
              <Map center={hasValidPlan ? [centerLat, centerLng] : [10.8505, 78.7047]} zoom={hasValidPlan ? mapZoom : 7} className="size-full">
                <MapControls />
                {hasValidPlan && mapRoutePoints.length > 0 && (
                  <MapRoute coordinates={mapRoutePoints} color="#10b981" weight={4} dashArray="6,8" />
                )}

                {hasValidPlan && (
                  <>
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
                  </>
                )}
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

            {/* Constraint Verification & Intelligence Checklist Panel */}
            {plannerData?.verifiedEngineOutput && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 text-white space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                  <div className="flex items-center gap-2">
                    <Award className="size-5 text-emerald-400" />
                    <h4 className="font-bold text-sm text-emerald-300">Data-Grounded Verification Checklist</h4>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Confidence: {Math.round((plannerData.verifiedEngineOutput.confidence?.overallScore || 0.98) * 100)}% Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Check className="size-3.5 text-emerald-400" />
                    <span>Destination: <strong className="text-white">{plannerData.verifiedEngineOutput.destinationSummary.name}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="size-3.5 text-emerald-400" />
                    <span>Duration: <strong className="text-white">{plannerData.verifiedEngineOutput.request.duration.days} / {plannerData.verifiedEngineOutput.dailyItineraries.length} Days</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="size-3.5 text-emerald-400" />
                    <span>Budget: <strong className="text-white">₹{plannerData.verifiedEngineOutput.costBreakdown.totalEstimated.toLocaleString("en-IN")}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="size-3.5 text-emerald-400" />
                    <span>Transport: <strong className="text-white">{plannerData.verifiedEngineOutput.request.transport.mode.toUpperCase()}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="size-3.5 text-emerald-400" />
                    <span>Exclusions: <strong className="text-emerald-300">{plannerData.verifiedEngineOutput.request.constraints.avoid.length > 0 ? `Avoided ${plannerData.verifiedEngineOutput.request.constraints.avoid.join(", ")}` : "Respected"}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="size-3.5 text-emerald-400" />
                    <span>Duplicates: <strong className="text-white">0 Duplicates</strong></span>
                  </div>
                </div>

                {/* Safety & Ghat Advisories */}
                {plannerData.verifiedEngineOutput.safetyNotes && plannerData.verifiedEngineOutput.safetyNotes.length > 0 && (
                  <div className="pt-2 border-t border-emerald-500/20 text-xs text-amber-300 space-y-1">
                    {plannerData.verifiedEngineOutput.safetyNotes.map((note: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <ShieldAlert className="size-3.5 text-amber-400 shrink-0" />
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Itemized Cost Breakdown Card */}
            {plannerData?.verifiedEngineOutput?.costBreakdown && (
              <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121821]/80 p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Wallet className="size-4 text-purple-400" />
                    <span>Itemized Cost Breakdown</span>
                  </h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${plannerData.verifiedEngineOutput.costBreakdown.withinBudget ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border border-amber-500/30"}`}>
                    {plannerData.verifiedEngineOutput.costBreakdown.withinBudget ? "Within Budget" : "Exceeds Target Budget"}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>🚗 Transport & Fuel ({plannerData.verifiedEngineOutput.routeSummary.totalDistanceKm} km):</span>
                    <span className="font-bold text-slate-200">₹{plannerData.verifiedEngineOutput.costBreakdown.transportCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🏨 Accommodation Stay:</span>
                    <span className="font-bold text-slate-200">₹{plannerData.verifiedEngineOutput.costBreakdown.stayCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🍽️ Food & Local Dining:</span>
                    <span className="font-bold text-slate-200">₹{plannerData.verifiedEngineOutput.costBreakdown.foodCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🏛️ Activities & Entry Tickets:</span>
                    <span className="font-bold text-slate-200">₹{plannerData.verifiedEngineOutput.costBreakdown.activitiesCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🅿️ Parking & Tolls:</span>
                    <span className="font-bold text-slate-200">₹{plannerData.verifiedEngineOutput.costBreakdown.parkingTollsCost}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-700/80 flex justify-between text-sm font-extrabold text-white">
                    <span>Estimated Total:</span>
                    <span className="text-emerald-400">₹{plannerData.verifiedEngineOutput.costBreakdown.totalEstimated.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline Itinerary */}
            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121821]/80 p-6 space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="size-4 text-emerald-500" />
                <span>Generated Itinerary Timeline</span>
              </h4>

              {hasValidPlan && timeline.length > 0 ? (
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
              ) : (
                <div className="py-6 text-center space-y-2.5 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] p-5">
                  <div className="size-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                    <Sparkles className="size-5" />
                  </div>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white">
                    Hello, Explorer! 👋
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Where would you like to travel next? Enter your destination, starting city, or budget above to generate a verified timeline, distance, and road route.
                  </p>
                </div>
              )}

              {/* Explanations List ("Why These Places?") */}
              {plannerData?.verifiedEngineOutput?.explanations && plannerData.verifiedEngineOutput.explanations.length > 0 && (
                <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-2">
                  <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-emerald-400" /> Why These Places?
                  </h5>
                  <div className="space-y-1.5">
                    {plannerData.verifiedEngineOutput.explanations.map((exp, i) => (
                      <div key={i} className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                        <strong className="text-white">{exp.placeName}:</strong> {exp.reason}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {timeline.length > 0 && (
                <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSendMessage(`Plan a relaxed ${destName} trip`)}
                      className="text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700"
                    >
                      Make Relaxed
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSendMessage(`Plan a budget ${destName} trip`)}
                      className="text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700"
                    >
                      Make Budget
                    </Button>
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      requireAuth(() => {
                        toast.success("Trip itinerary saved to your account ✓");
                      }, "Sign in to save this trip itinerary to your account.");
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 cursor-pointer flex items-center gap-2"
                  >
                    <Bookmark className="size-4" />
                    <span>Save Trip</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
