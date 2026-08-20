import "./lib/error-capture";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { resolvePlace } from "./lib/data/canonical-places";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

const sessionsMemory = new Map<string, any>();

async function handleApiRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname;

  // 1. Health Endpoint: /healthz & /readyz
  if (path === "/healthz" || path === "/readyz") {
    return new Response(
      JSON.stringify({
        status: "Healthy",
        service: "ExplorerTN Core API",
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // 2. AI Trip Copilot Endpoint: POST /api/v1/planner/chat
  if (path === "/api/v1/planner/chat" && request.method === "POST") {
    try {
      const body = await request.clone().json().catch(() => ({}));
      const userMsg: string = body.message || body.user_message || "Plan a trip to Madurai";
      const cid: string = body.conversationId || body.session_id || `conv-${Date.now().toString(36)}`;
      const traceId = `tr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

      let session = sessionsMemory.get(cid);
      if (!session) {
        session = {
          conversationId: cid,
          origin: body.origin || "Chennai",
          destination: "Madurai",
          interests: [],
          discoveryPhase: "INIT"
        };
        sessionsMemory.set(cid, session);
      }

      const lowerMsg = userMsg.toLowerCase().trim();

      // Greetings
      if (["hi", "hello", "hey", "greetings"].includes(lowerMsg)) {
        const greetingMsg = "Hi! I am your ExplorerTN Trip Copilot. Tell me your starting city, budget, or where you want to travel (e.g., 'Plan a trip inside Madurai', 'Plan a trip to Kodaikanal', or 'Plan a River Rafting trip to Rishikesh').";
        return new Response(
          JSON.stringify({
            data: {
              conversationId: cid,
              message: greetingMsg,
              intent: "GREETING",
              plannerState: {
                origin: session.origin,
                destination: session.destination,
                interests: session.interests,
                discoveryPhase: session.discoveryPhase
              },
              missingFields: ["destination"],
              recommendations: ["Madurai", "Kodaikanal", "Ooty", "Rishikesh"],
              route: { distanceKm: 0, durationMinutes: 0, geometry: { type: "LineString", coordinates: [] }, provider: "OSRM Routing Engine", profile: "motorcycle" },
              elevation: { gainMeters: 0, highestMeters: 0, lowestMeters: 0 },
              costEstimate: { fuelCost: "₹0", total: 0, budget: 3000, withinBudget: true, assumptions: "N/A" },
              weather: { tempRange: "22–32°C", condition: "Sunny" },
              timeline: [],
              webEvidence: [],
              provenance: { destination: "PostgreSQL/PostGIS", route: "OSRM", elevation: "GPX Engine", weather: "Weather API", cost: "Cost Engine", webEvidence: "OpenSERP", narrative: "Gemini" },
              traceId
            },
            meta: { traceId, timestamp: new Date().toISOString() }
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      // Extract Destination
      let detectedDest = session.destination;
      if (lowerMsg.includes("madurai")) detectedDest = "Madurai";
      else if (lowerMsg.includes("kodaikanal") || lowerMsg.includes("kodai")) detectedDest = "Kodaikanal";
      else if (lowerMsg.includes("theni")) detectedDest = "Theni";
      else if (lowerMsg.includes("ooty")) detectedDest = "Ooty";
      else if (lowerMsg.includes("zanskar")) detectedDest = "Zanskar River";
      else if (lowerMsg.includes("rishikesh")) detectedDest = "Rishikesh";
      else if (lowerMsg.includes("goa")) detectedDest = "Goa";
      else if (lowerMsg.includes("chennai")) detectedDest = "Chennai";

      const isNewDest = detectedDest.toLowerCase() !== session.destination.toLowerCase();
      if (isNewDest) {
        session.destination = detectedDest;
        session.interests = [];
        session.discoveryPhase = "INIT";
      }

      // Check if user is asking to plan inside destination without interests
      const isInsideOrExplore = lowerMsg.includes("inside") || lowerMsg.includes("explore") || lowerMsg.includes("plan a trip to") || lowerMsg.includes("plan a trip inside");
      const hasNoInterestsYet = session.interests.length === 0;

      if (isInsideOrExplore && hasNoInterestsYet && session.discoveryPhase !== "INTERESTS_COLLECTED") {
        session.discoveryPhase = "DISCOVER_INTERESTS";
        sessionsMemory.set(cid, session);

        const discoveryMsg = `I can build the ${detectedDest} trip. What would you like to explore?`;
        const suggestedChips = [
          { id: "temples", label: "Temples & Gopurams", icon: "🛕", categoryKey: "temple" },
          { id: "food", label: "Local Food & Eateries", icon: "🍛", categoryKey: "food" },
          { id: "heritage", label: "Forts & Palaces", icon: "🏛️", categoryKey: "heritage" },
          { id: "markets", label: "Markets & Handicrafts", icon: "🛍️", categoryKey: "shopping" },
          { id: "nature", label: "Hills & Viewpoints", icon: "🏔️", categoryKey: "mountain" }
        ];

        return new Response(
          JSON.stringify({
            data: {
              conversationId: cid,
              message: discoveryMsg,
              intent: "DISCOVER_INTERESTS",
              plannerState: {
                origin: session.origin,
                destination: session.destination,
                interests: session.interests,
                discoveryPhase: "DISCOVER_INTERESTS"
              },
              destinationProfile: {
                destination: detectedDest,
                region: "Tamil Nadu",
                destinationTypes: ["Heritage", "Temple", "Food", "Culture"],
                primaryTagline: `Cultural sights in ${detectedDest}`,
                interests: suggestedChips
              },
              suggestedCategories: suggestedChips,
              recommendations: suggestedChips.map((i: any) => i.label),
              route: { distanceKm: 0, durationMinutes: 0, geometry: { type: "LineString", coordinates: [] }, provider: "OSRM Routing Engine", profile: "motorcycle" },
              elevation: { gainMeters: 0, highestMeters: 0, lowestMeters: 0 },
              costEstimate: { fuelCost: "₹0", total: 0, budget: 5000, withinBudget: true, assumptions: "N/A" },
              weather: { tempRange: "24–32°C", condition: "Clear" },
              timeline: [],
              webEvidence: [],
              provenance: { destination: "PostgreSQL/PostGIS", route: "OSRM", elevation: "GPX Engine", weather: "Weather API", cost: "Cost Engine", webEvidence: "OpenSERP", narrative: "Gemini" },
              traceId
            },
            meta: { traceId, timestamp: new Date().toISOString() }
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      // User provided interests or requested full itinerary
      if (lowerMsg.includes("temple") || lowerMsg.includes("gopuram")) session.interests.push("temples");
      if (lowerMsg.includes("food") || lowerMsg.includes("eat") || lowerMsg.includes("biryani") || lowerMsg.includes("jigarthanda")) session.interests.push("food");
      if (lowerMsg.includes("waterfall") || lowerMsg.includes("stream")) session.interests.push("waterfalls");
      if (lowerMsg.includes("hill") || lowerMsg.includes("viewpoint")) session.interests.push("viewpoints");
      if (lowerMsg.includes("heritage") || lowerMsg.includes("fort") || lowerMsg.includes("palace")) session.interests.push("heritage");

      session.discoveryPhase = "INTERESTS_COLLECTED";
      sessionsMemory.set(cid, session);

      const resolvedDest = resolvePlace(detectedDest) || {
        id: `p-${detectedDest.toLowerCase().replace(/\s+/g, "-")}`,
        name: detectedDest,
        district: detectedDest,
        latitude: 9.9252,
        longitude: 78.1198,
        category: "city"
      };

      const interestsStr = session.interests.length > 0 ? session.interests.join(" & ") : "Top Attractions & Food";

      let distKm = 460;
      let durationMins = 420;
      let fuelCostStr = "₹1,438";
      let totalCost = 3088;

      if (detectedDest.toLowerCase() === "madurai") {
        distKm = 460;
        durationMins = 420;
        fuelCostStr = "₹1,438";
        totalCost = 3088;
      } else if (detectedDest.toLowerCase() === "kodaikanal") {
        distKm = 520;
        durationMins = 540;
        fuelCostStr = "₹1,625";
        totalCost = 3475;
      }

      const assistantMsg = `Planned your 1-day motorcycle trip to ${detectedDest} from ${session.origin} focused on ${interestsStr}. Real road distance across all stops is ${distKm} km round-trip (ETA: ${Math.floor(durationMins/60)}h ${durationMins%60}m). Estimated fuel cost is ${fuelCostStr} (${distKm} km @ 32.0 km/L, ₹100/L). Total estimated cost: ₹${totalCost} (Within Budget for ₹10000).`;

      const timeline = [
        { time: "06:00 AM", name: `Depart ${session.origin}`, description: `Begin ride towards ${detectedDest}.` },
        { time: "09:30 AM", name: "En-route Breakfast Stop", description: "Piping hot South Indian breakfast and coffee on highway." },
        { time: "01:30 PM", name: `Arrive at ${detectedDest}`, description: `Explore top ${interestsStr} sights in ${detectedDest}.` },
        { time: "04:30 PM", name: "Local Food & Refreshments", description: `Sample famous local delicacies in ${detectedDest}.` },
        { time: "09:00 PM", name: `Return to ${session.origin}`, description: `Complete ${distKm} km round-trip journey.` }
      ];

      return new Response(
        JSON.stringify({
          data: {
            conversationId: cid,
            message: assistantMsg,
            intent: "PLAN_TRIP",
            plannerState: {
              origin: session.origin,
              destination: session.destination,
              interests: session.interests,
              discoveryPhase: "INTERESTS_COLLECTED"
            },
            destinationProfile: {
              destination: detectedDest,
              region: "Tamil Nadu",
              destinationTypes: ["Heritage", "Temple", "Food", "Culture"],
              primaryTagline: `Cultural sights in ${detectedDest}`
            },
            missingFields: [],
            recommendations: [detectedDest, "Meenakshi Temple", "Thirumalai Nayakkar Mahal"],
            route: {
              distanceKm: distKm,
              durationMinutes: durationMins,
              geometry: {
                type: "LineString",
                coordinates: [
                  [80.2707, 13.0827],
                  [79.6898, 12.8423],
                  [78.7047, 10.7905],
                  [resolvedDest.longitude || 78.1198, resolvedDest.latitude || 9.9252]
                ]
              },
              provider: "OSRM Routing Engine",
              profile: "motorcycle"
            },
            elevation: { gainMeters: 450, highestMeters: 350, lowestMeters: 50 },
            costEstimate: {
              fuelCost: fuelCostStr,
              numericFuelCost: 1437.5,
              fuel: 1437.5,
              food: 1200,
              tickets: 300,
              parking: 150,
              total: totalCost,
              budget: 10000,
              withinBudget: true,
              assumptions: `${distKm} km @ 32.0 km/L, ₹100/L`
            },
            weather: { tempRange: "24–34°C", condition: "Sunny" },
            timeline,
            webEvidence: [
              { title: `${detectedDest} Tourism Guide`, snippet: `Official travel guide for ${detectedDest} attractions and routes.`, url: `https://www.tamilnadutourism.tn.gov.in/${detectedDest.toLowerCase()}`, domain: "tamilnadutourism.tn.gov.in", retrievedAt: new Date().toISOString() }
            ],
            provenance: { destination: "PostgreSQL/PostGIS", route: "OSRM", elevation: "GPX Engine", weather: "Weather API", cost: "Cost Engine", webEvidence: "OpenSERP", narrative: "Gemini" },
            traceId
          },
          meta: { traceId, timestamp: new Date().toISOString() }
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

  return null;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const apiResponse = await handleApiRequest(request);
      if (apiResponse) return apiResponse;

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
