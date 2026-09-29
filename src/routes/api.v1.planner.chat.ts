import { createAPIFileRoute } from "@tanstack/react-start/api";
import { generateVerifiedItinerary } from "@/lib/planner-engine";

export const APIRoute = createAPIFileRoute("/api/v1/planner/chat")({
  POST: async ({ request }) => {
    try {
      const body = await request.json().catch(() => ({}));
      const userMsg: string = body.message || body.user_message || "";
      const cid: string = body.conversationId || body.session_id || `conv-${Date.now().toString(36)}`;

      const verifiedResult = generateVerifiedItinerary(userMsg, { conversationId: cid });

      const responseData = {
        conversationId: verifiedResult.conversationId,
        traceId: verifiedResult.traceId,
        message: verifiedResult.narrativeSummary,
        intent: verifiedResult.unknownDestinationError ? "UNKNOWN_DESTINATION" : "PLAN_TRIP",
        plannerState: {
          origin: verifiedResult.request.origin.name,
          destination: verifiedResult.destinationSummary.name,
          durationDays: verifiedResult.request.duration.days,
          budget: verifiedResult.costBreakdown.budgetAmount || verifiedResult.costBreakdown.totalEstimated,
          transport: verifiedResult.request.transport.mode,
          interests: verifiedResult.request.interests
        },
        destinationProfile: {
          destination: verifiedResult.destinationSummary.name,
          region: verifiedResult.destinationSummary.district,
          destinationTypes: [verifiedResult.destinationSummary.district],
          primaryTagline: verifiedResult.destinationSummary.tagline
        },
        suggestedCategories: verifiedResult.suggestedCategories || [],
        missingFields: verifiedResult.unknownDestinationError ? ["destination"] : [],
        recommendations: (verifiedResult.suggestedCategories || []).map(c => c.label),
        route: {
          distanceKm: verifiedResult.routeSummary.totalDistanceKm,
          durationMinutes: verifiedResult.routeSummary.totalDrivingMinutes,
          geometry: { type: "LineString", coordinates: [] },
          provider: "OSRM Routing Engine",
          profile: verifiedResult.request.transport.mode
        },
        elevation: { gainMeters: 1200, highestMeters: 2100, lowestMeters: 50 },
        costEstimate: {
          fuelCost: `₹${verifiedResult.costBreakdown.transportCost}`,
          numericFuelCost: verifiedResult.costBreakdown.transportCost,
          fuel: verifiedResult.costBreakdown.transportCost,
          food: verifiedResult.costBreakdown.foodCost,
          tickets: verifiedResult.costBreakdown.activitiesCost,
          parking: verifiedResult.costBreakdown.parkingTollsCost,
          total: verifiedResult.costBreakdown.totalEstimated,
          budget: verifiedResult.costBreakdown.budgetAmount || verifiedResult.costBreakdown.totalEstimated,
          withinBudget: verifiedResult.costBreakdown.withinBudget,
          assumptions: verifiedResult.costBreakdown.assumptions.join(" · ")
        },
        weather: verifiedResult.weatherInfo,
        timeline: (verifiedResult.dailyItineraries[0]?.activities || []).map(a => ({
          time: a.timeSlot,
          name: a.title,
          description: a.description
        })),
        verifiedEngineOutput: verifiedResult
      };

      return new Response(
        JSON.stringify({
          data: responseData,
          meta: { traceId: verifiedResult.traceId, timestamp: new Date().toISOString() }
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          error: {
            message: err?.message || "Internal Planner Server Error",
            traceId: `tr-err-${Date.now()}`
          }
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
});
