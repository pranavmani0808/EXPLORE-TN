import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { AppShell } from "@/components/site/app-shell";
import { AIPlanSidebar } from "@/components/site/ai-plan-sidebar";
import { AIPlanHeroMap } from "@/components/site/ai-plan-hero-map";
import { AIPlanRouteControls } from "@/components/site/ai-plan-route-controls";
import { AIPlanBottomBar } from "@/components/site/ai-plan-bottom-bar";
import { AIPlanCustomizeModal } from "@/components/site/ai-plan-customize-modal";
import { PlannerApiRepository } from "@/lib/api-client/planner";
import { useAuthGuard } from "@/lib/auth-guard-context";
import { toast } from "sonner";

import { saveGuestTripDraft, saveTripToUserAccount } from "@/lib/user-saved-trips";
import { getCurrentAuthUser } from "@/lib/auth-rbac";
import confetti from "canvas-confetti";
import { getRouteHillIntelligence } from "@/lib/data/hill-region-intelligence";
import { RouteHillIntelligenceCard, TripReadinessCard } from "@/components/site/hill-region-intelligence-components";

export const Route = createFileRoute("/ai-plan")({
  head: () => ({
    meta: [
      { title: "AI Route Plan — ExploreTN" },
      {
        name: "description",
        content:
          "Personalized 2-column AI Travel Route Plan with Leaflet road route visualization, Tamil Nadu landmark illustrations, vertical itinerary timeline, and live route controls.",
      },
      { property: "og:title", content: "AI Route Plan — ExploreTN" },
    ],
  }),
  component: AIPlanPage,
});

function AIPlanPage() {
  const { requireAuth } = useAuthGuard();
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [aiPlan, setAiPlan] = useState<any | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isAddingRec, setIsAddingRec] = useState(false);

  // Auto-persist active plan to guest draft so sign-in/up saves it seamlessly
  useEffect(() => {
    if (aiPlan) {
      saveGuestTripDraft(aiPlan);
    }
  }, [aiPlan]);

  // Initial load of default or query-driven AI plan
  useEffect(() => {
    const fetchInitialPlan = async () => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const destination = params.get("destination") || "Kanyakumari";
      const origin = params.get("origin") || "Madurai";
      const days = Number(params.get("days")) || 2;

      setLoading(true);
      setIsError(false);
      try {
        const res = await PlannerApiRepository.planAITravel({
          query: `Plan a ${days} day trip from ${origin} to ${destination} with beaches, temples, and hidden places`,
          origin,
          destination,
          days
        });
        setAiPlan(res);
      } catch (err) {
        console.error("Failed to load initial AI plan:", err);
        setIsError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialPlan();
  }, []);

  const handleRouteAction = async (action: string) => {
    if (!aiPlan) return;
    setLoading(true);
    try {
      const updated = await PlannerApiRepository.modifyAIPlan({
        current_plan: aiPlan,
        action: action
      });
      setAiPlan(updated);
      toast.success("Route recalculated and updated ✓");
    } catch (err) {
      toast.error("Failed to update route.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecommendation = async (recId: string) => {
    if (!aiPlan) return;
    setIsAddingRec(true);
    try {
      const updated = await PlannerApiRepository.modifyAIPlan({
        current_plan: aiPlan,
        action: "add_hidden"
      });
      setAiPlan(updated);
      toast.success("Recommendation added to your route! Distance & travel time updated ✓");
    } catch (err) {
      toast.error("Failed to add recommendation.");
    } finally {
      setIsAddingRec(false);
    }
  };

  const handleCustomRegenerate = async (params: {
    origin: string;
    destination: string;
    days: number;
    categories: string[];
    travel_mode: string;
    budget: string;
  }) => {
    setLoading(true);
    setIsError(false);
    try {
      const res = await PlannerApiRepository.planAITravel({
        query: `Plan a ${params.days} day trip from ${params.origin} to ${params.destination} with ${params.categories.join(", ")}`,
        origin: params.origin,
        destination: params.destination,
        days: params.days,
        categories: params.categories
      });
      setAiPlan(res);
      setIsCustomizeOpen(false);
      toast.success("Customized AI Itinerary generated successfully ✓");
    } catch (err) {
      toast.error("Failed to regenerate customized itinerary.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  // Synchronized Selection: Clicking marker scrolls sidebar to timeline card
  const handleSelectStop = (stopId: string) => {
    setSelectedStopId(stopId);
    if (typeof document !== "undefined") {
      const elem = document.getElementById(`timeline-stop-${stopId}`);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handleSaveTrip = () => {
    requireAuth(() => {
      const user = getCurrentAuthUser();
      if (user && aiPlan) {
        saveTripToUserAccount(aiPlan, user.id);
      }
      setIsSaved(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#10b981", "#f59e0b", "#3b82f6", "#ec4899"],
      });
      toast.success("Trip saved to your ExploreTN account ✓");
    }, "Sign in or create an account to save this personalized AI route plan to your account.");
  };

  const handleShareTrip = () => {
    if (navigator.share) {
      navigator.share({
        title: aiPlan?.title || "ExploreTN AI Route Plan",
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.info("Trip link copied to clipboard 📋");
    }
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  const stops = aiPlan?.ordered_stops || [];
  const title = aiPlan?.title || "Your Kanyakumari Adventure";
  const subtitle = aiPlan?.summary || "2-day journey through beaches, temples, hidden gems and heritage.";
  const totalDistance = aiPlan?.total_distance_km || 128;
  const totalDuration = aiPlan?.total_driving_time_mins || 255;

  const originName = aiPlan?.origin?.name || "Chennai";
  const destName = aiPlan?.destination?.name || "Kodaikanal";
  const hillRouteIntel = getRouteHillIntelligence(originName, destName);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-6 pt-24 sm:px-6 sm:pt-28 space-y-6">
        
        {/* 🏔️ HILL TRIP READINESS CHECKLIST */}
        {hillRouteIntel && (
          <TripReadinessCard checklist={hillRouteIntel.tripReadinessChecklist} />
        )}

        {/* 🛣️ LONG-DISTANCE HILL ROUTE & REMOTE STRETCH INTELLIGENCE */}
        {hillRouteIntel && (
          <RouteHillIntelligenceCard route={hillRouteIntel} />
        )}

        {/* Main Two-Column Layout (Left 35%, Right 65%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Itinerary & Recommendations (35% width on lg) */}
          <div className="lg:col-span-4 w-full h-auto space-y-6">
            <AIPlanSidebar
              tripTitle={title}
              subtitle={subtitle}
              originName={aiPlan?.origin?.name || "Madurai"}
              destName={aiPlan?.destination?.name || "Kanyakumari"}
              durationDays={aiPlan?.raw_intent?.days || 2}
              travelMode="Car Road Trip"
              stopsCount={stops.length}
              preferences={["Beaches", "Temples", "Hidden Places", "Heritage", "Photography"]}
              stops={stops}
              selectedStopId={selectedStopId}
              onSelectStop={handleSelectStop}
              onAddRecommendation={handleAddRecommendation}
              isAddingRec={isAddingRec}
            />
          </div>

          {/* Right Column: Hero Visual Route Map & Controls (65% width on lg) */}
          <div className="lg:col-span-8 w-full space-y-4 lg:sticky lg:top-28">
            <AIPlanHeroMap
              title={title}
              subtitle={subtitle}
              stops={stops}
              routePolylinePoints={aiPlan?.route_polyline_points}
              originName={aiPlan?.origin?.name || "Madurai"}
              destName={aiPlan?.destination?.name || "Kanyakumari"}
              selectedStopId={selectedStopId}
              onSelectStop={handleSelectStop}
              onCustomizeClick={() => setIsCustomizeOpen(true)}
              isLoading={loading}
              isError={isError}
            />

            {/* Interactive Route Action Bar */}
            <AIPlanRouteControls
              onAction={handleRouteAction}
              isLoading={loading}
            />
          </div>
        </div>

        {/* Bottom Summary Bar */}
        <AIPlanBottomBar
          totalDistanceKm={totalDistance}
          totalDurationMins={totalDuration}
          destinationsCount={stops.length}
          durationDays={aiPlan?.raw_intent?.days || 2}
          onSaveTrip={handleSaveTrip}
          onShareTrip={handleShareTrip}
          onDownloadPdf={handleDownloadPdf}
          isSaved={isSaved}
        />

        {/* Customize Trip Modal */}
        <AIPlanCustomizeModal
          isOpen={isCustomizeOpen}
          onClose={() => setIsCustomizeOpen(false)}
          onRegenerate={handleCustomRegenerate}
          isLoading={loading}
        />
      </div>
    </AppShell>
  );
}
