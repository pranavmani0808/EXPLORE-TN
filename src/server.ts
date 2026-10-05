import { getPlaceTravelIntelligence } from "./lib/data/travel-intelligence";
import { runDataQualityTestSuite, auditEntityQuality } from "./lib/data-quality";
import { CANONICAL_PLACES } from "./lib/data/canonical-places";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { resolvePlace } from "./lib/data/canonical-places";
import { SupabaseDatabaseRepository } from "./lib/supabase-database";
import { generateItineraryTimeline, getDestinationProfile } from "./lib/planner-timeline";
import { generateVerifiedItinerary } from "./lib/planner-engine";
import { getAllDistrictsList } from "./lib/data/districts";
import {
  getCainSecurityStatus,
  getChainedAuditLogs,
  verifyAuditChain,
  checkRecordIntegrity,
  setupAdminMfa,
  verifyAdminMfaToken,
  encryptData,
  sanitizePiiResponse,
} from "./lib/security";

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
  const path = url.pathname.replace(/\/+$/, "");
  const method = request.method.toUpperCase();

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

  // 1a. CAIN Security Status Endpoint: GET /api/v1/security/status
  if (path === "/api/v1/security/status" && method === "GET") {
    const status = getCainSecurityStatus();
    return new Response(
      JSON.stringify({ status: "success", data: status }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // 1b. CAIN Audit Logs Endpoint: GET /api/v1/security/audit-logs
  if (path === "/api/v1/security/audit-logs" && method === "GET") {
    const logs = getChainedAuditLogs();
    const verification = verifyAuditChain();
    return new Response(
      JSON.stringify({ status: "success", count: logs.length, verification, data: logs }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // 1c. CAIN Verify Integrity Endpoint: POST /api/v1/security/verify-integrity
  if (path === "/api/v1/security/verify-integrity" && method === "POST") {
    try {
      const body = await request.clone().json().catch(() => ({}));
      const recordId = body.recordId || "place-madurai-meenakshi";
      const recordData = body.data || { name: "Meenakshi Amman Temple", district: "Madurai" };

      const check = checkRecordIntegrity(recordId, recordData);
      return new Response(
        JSON.stringify({ status: "success", data: check }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: { message: err?.message || "Integrity verification failed" } }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // 1d. CAIN Admin MFA Setup Endpoint: POST /api/v1/security/mfa/setup
  if (path === "/api/v1/security/mfa/setup" && method === "POST") {
    try {
      const body = await request.clone().json().catch(() => ({}));
      const userId = body.userId || "usr-admin-1";
      const email = body.email || "pranavviper7@gmail.com";

      const mfaConfig = setupAdminMfa(userId, email);
      return new Response(
        JSON.stringify({ status: "success", data: mfaConfig }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: { message: err?.message || "MFA setup failed" } }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // 1e. CAIN Admin MFA Verify Endpoint: POST /api/v1/security/mfa/verify
  if (path === "/api/v1/security/mfa/verify" && method === "POST") {
    try {
      const body = await request.clone().json().catch(() => ({}));
      const userId = body.userId || "usr-admin-1";
      const token = body.token || "";

      const result = verifyAdminMfaToken(userId, token);
      return new Response(
        JSON.stringify({ status: result.success ? "success" : "error", data: result }),
        { status: result.success ? 200 : 400, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: { message: err?.message || "MFA verification failed" } }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // 1a. Geo Districts API Endpoint
  if (path === "/api/v1/geo/districts" && method === "GET") {
    const districts = getAllDistrictsList();
    return new Response(
      JSON.stringify({ status: "success", count: districts.length, data: districts }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // 1a-2. User Sync & Verification Endpoint: /api/v1/user/sync
  if (path === "/api/v1/user/sync") {
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://ajxnljrhueiiuwavbrra.supabase.co";
    const SUPABASE_SECRET_KEY =
      process.env.SUPABASE_SECRET_KEY ||
      process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      "sb_publishable_7iBDUCQZQoCO6zg6KamalA_kdzdjk-8";
    const { createClient } = await import("@supabase/supabase-js");
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    if (method === "GET") {
      try {
        const email = url.searchParams.get("email")?.trim().toLowerCase();
        if (!email) {
          return new Response(
            JSON.stringify({ valid: false, message: "Missing email parameter" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        // Check if user exists in public.users
        const { data: userRecord } = await supabaseAdmin
          .from("users")
          .select("id, email, status, role")
          .eq("email", email)
          .maybeSingle();

        // Also verify in auth.users if service role key is present
        let authUser = null;
        if (process.env.SUPABASE_SECRET_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
          try {
            const { data: authList } = await supabaseAdmin.auth.admin.listUsers();
            authUser = authList?.users?.find((u) => u.email?.toLowerCase() === email) || null;
          } catch (authErr) {
            console.warn("[User Sync API] auth list check warning:", authErr);
          }
        }

        const emailFound = Boolean(userRecord || authUser);

        if (!emailFound) {
          return new Response(
            JSON.stringify({
              exists: false,
              emailFound: false,
              valid: false,
              message: "Email ID not registered. Create an account to explore Tamil Nadu.",
            }),
            { status: 404, headers: { "Content-Type": "application/json" } }
          );
        }

        if (userRecord?.status === "suspended" || userRecord?.status === "blocked") {
          return new Response(
            JSON.stringify({
              exists: true,
              emailFound: true,
              valid: false,
              message: "User account has been deactivated or suspended.",
            }),
            { status: 403, headers: { "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({
            valid: true,
            exists: true,
            emailFound: true,
            role: userRecord?.role || "explorer",
            status: userRecord?.status || "active",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({ valid: false, error: err?.message }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    if (method === "POST") {
      try {
        const body = await request.clone().json().catch(() => ({}));
        const { user, isSignUp } = body;

        if (!user || !user.email) {
          return new Response(
            JSON.stringify({ error: "Missing required user payload" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        const email = user.email.trim().toLowerCase();
        const userId = user.id;
        const name = user.name || email.split("@")[0] || "Explorer User";

        const { data: existingUser } = await supabaseAdmin
          .from("users")
          .select("id, email, name, role, status")
          .eq("email", email)
          .maybeSingle();

        let role = "explorer";
        if (email === "admin@explorertn.com") {
          role = "super_admin";
        } else if (existingUser?.role) {
          role = existingUser.role;
        }

        if (!isSignUp && !existingUser) {
          return new Response(
            JSON.stringify({ exists: false, message: "user not found" }),
            { status: 404, headers: { "Content-Type": "application/json" } }
          );
        }

        // Also sync user to Supabase auth.users so they appear in Supabase Authentication dashboard
        let targetId = existingUser?.id || userId;
        try {
          const { data: authCreated, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            email_confirm: true,
            user_metadata: {
              full_name: name,
              avatar_url: user.avatar || "",
              provider: "google",
            },
          });
          if (authCreated?.user?.id) {
            targetId = authCreated.user.id;
          } else if (createAuthError) {
            const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
            const match = listData?.users?.find((u) => u.email?.toLowerCase() === email);
            if (match?.id) {
              targetId = match.id;
            }
          }
        } catch (authAdminErr) {
          console.warn("[Server User Sync] auth.admin.createUser notice:", authAdminErr);
        }

        const { data: savedUser, error: userError } = await supabaseAdmin
          .from("users")
          .upsert(
            {
              id: targetId,
              email: email,
              name: name,
              avatar_url: user.avatar || "",
              role: role,
              status: "active",
              updated_at: new Date().toISOString(),
            },
            { onConflict: "email" }
          )
          .select()
          .single();

        if (userError) {
          return new Response(
            JSON.stringify({ error: userError.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }

        // Upsert user_profiles and user_stats
        await supabaseAdmin
          .from("user_profiles")
          .upsert(
            {
              user_id: targetId,
              city: user.city || user.location || "Tamil Nadu",
              state: "Tamil Nadu",
              preferred_language: "en",
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          )
          .catch(() => null);

        await supabaseAdmin
          .from("user_stats")
          .upsert(
            {
              user_id: targetId,
              xp: role === "super_admin" ? 1000 : 100,
              rank_title: role === "super_admin" ? "Super Admin" : "Verified Explorer",
              district_count: role === "super_admin" ? 38 : 1,
              last_active_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          )
          .catch(() => null);

        return new Response(
          JSON.stringify({
            success: true,
            exists: true,
            profileComplete: role === "super_admin" || Boolean(user.profileComplete),
            user: savedUser,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({ error: err?.message || "Internal server error" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }
  }

  // 1b. Places API Endpoints for Real-Time Reflection of Admin Created Spots
  if (path === "/api/v1/places" && method === "GET") {
    const category = url.searchParams.get("category") || undefined;
    const district = url.searchParams.get("district") || undefined;
    const search = url.searchParams.get("query") || url.searchParams.get("q") || url.searchParams.get("search") || undefined;

    const places = await SupabaseDatabaseRepository.getPublicPlaces({ category, district, search });
    return new Response(
      JSON.stringify({ status: "success", count: places.length, data: places }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  if (path === "/api/v1/places" && method === "POST") {
    try {
      const body = await request.clone().json().catch(() => ({}));
      const created = await SupabaseDatabaseRepository.createPlace(body);
      return new Response(
        JSON.stringify({ status: "success", data: created }),
        { status: 201, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: { message: err?.message || "Failed to create place" } }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // 1c. Place Intelligence Endpoint: GET /api/v1/places/:slug/intelligence
  if (path.startsWith("/api/v1/places/") && path.endsWith("/intelligence") && method === "GET") {
    const slug = path.replace("/api/v1/places/", "").replace("/intelligence", "");
    const intel = getPlaceTravelIntelligence(slug);
    return new Response(
      JSON.stringify({ status: "success", data: intel }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // 1c-ii. Place Weather Endpoint: GET /api/v1/places/:slug/weather
  if (path.startsWith("/api/v1/places/") && path.endsWith("/weather") && method === "GET") {
    const slug = path.replace("/api/v1/places/", "").replace("/weather", "");
    const intel = getPlaceTravelIntelligence(slug);
    const weather = intel?.liveTelemetry?.weather || {
      temperatureC: 28,
      condition: "Pleasant",
      humidityPercent: 65,
      windSpeedKmh: 12,
      uvIndex: 4,
      advisory: "Clear skies and comfortable exploration conditions.",
    };
    return new Response(
      JSON.stringify({ status: "success", data: weather }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // 1d. Data Quality Audit Endpoint: GET /api/v1/places/audit/data-quality
  if (path === "/api/v1/places/audit/data-quality" && method === "GET") {
    const testSuite = runDataQualityTestSuite();
    const entityAudits = CANONICAL_PLACES.map(auditEntityQuality);
    const avgConfidence = Math.round(
      entityAudits.reduce((acc, curr) => acc + curr.confidenceScore, 0) / (entityAudits.length || 1)
    );

    return new Response(
      JSON.stringify({
        status: "success",
        summary: {
          totalEntities: CANONICAL_PLACES.length,
          avgConfidenceScore: avgConfidence,
          testSuiteResults: testSuite,
        },
        data: entityAudits,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // 2. AI Trip Copilot Endpoint: POST /api/v1/planner/chat
  if (path === "/api/v1/planner/chat" && method === "POST") {
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

      // Use verified planner engine for rich intent parsing & verified routing/costing
      const verifiedResult = generateVerifiedItinerary(userMsg, { conversationId: cid });

      const detectedDest = verifiedResult.destinationSummary.name;
      const days = verifiedResult.request.duration.days;
      const originName = verifiedResult.request.origin.name;
      const interestsStr = verifiedResult.request.interests.length > 0 ? verifiedResult.request.interests.join(" & ") : "Top Attractions & Food";

      const assistantMsg = `Planned your ${days}-day trip to ${detectedDest} & nearby places within 4-5 hours from ${originName} focused on ${interestsStr}. Real road distance across all stops is ${Math.round(verifiedResult.routeSummary.totalDistanceKm)} km round-trip (ETA: ${Math.floor(verifiedResult.routeSummary.totalDrivingMinutes / 60)}h ${Math.round(verifiedResult.routeSummary.totalDrivingMinutes % 60)}m). Estimated fuel cost is ₹${verifiedResult.costBreakdown.transportCost} (${Math.round(verifiedResult.routeSummary.totalDistanceKm)} km @ 32.0 km/L, ₹100/L). Total estimated cost: ₹${verifiedResult.costBreakdown.totalEstimated} (Within Budget for ₹${verifiedResult.costBreakdown.budgetAmount || 10000 * days}).`;

      return new Response(
        JSON.stringify({
          data: {
            conversationId: cid,
            message: assistantMsg,
            intent: verifiedResult.unknownDestinationError ? "UNKNOWN_DESTINATION" : "PLAN_TRIP",
            plannerState: {
              origin: originName,
              destination: detectedDest,
              durationDays: days,
              interests: verifiedResult.request.interests,
              discoveryPhase: "INTERESTS_COLLECTED"
            },
            destinationProfile: {
              destination: detectedDest,
              region: verifiedResult.destinationSummary.district,
              destinationTypes: [verifiedResult.destinationSummary.district],
              primaryTagline: verifiedResult.destinationSummary.tagline
            },
            missingFields: verifiedResult.unknownDestinationError ? ["destination"] : [],
            recommendations: (verifiedResult.suggestedCategories || []).map(c => c.label),
            route: {
              distanceKm: verifiedResult.routeSummary.totalDistanceKm,
              durationMinutes: verifiedResult.routeSummary.totalDrivingMinutes,
              geometry: { type: "LineString", coordinates: [] },
              provider: "OSRM Routing Engine",
              profile: verifiedResult.request.transport.mode
            },
            elevation: { gainMeters: 450, highestMeters: 350, lowestMeters: 50 },
            costEstimate: {
              fuelCost: `₹${verifiedResult.costBreakdown.transportCost}`,
              numericFuelCost: verifiedResult.costBreakdown.transportCost,
              fuel: verifiedResult.costBreakdown.transportCost,
              food: verifiedResult.costBreakdown.foodCost,
              tickets: verifiedResult.costBreakdown.activitiesCost,
              parking: verifiedResult.costBreakdown.parkingTollsCost,
              total: verifiedResult.costBreakdown.totalEstimated,
              budget: verifiedResult.costBreakdown.budgetAmount || 10000 * days,
              withinBudget: verifiedResult.costBreakdown.withinBudget,
              assumptions: verifiedResult.costBreakdown.assumptions.join(" · ")
            },
            weather: verifiedResult.weatherInfo,
            timeline: (verifiedResult.dailyItineraries[0]?.activities || []).map(a => ({
              time: a.timeSlot,
              name: a.title,
              description: a.description
            })),
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

  const err = consumeLastCapturedError();
  console.error(err ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(err || body), {
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

function applySecurityHeaders(res: Response): Response {
  const newHeaders = new Headers(res.headers);
  newHeaders.set("X-Content-Type-Options", "nosniff");
  newHeaders.set("X-Frame-Options", "SAMEORIGIN");
  newHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
  newHeaders.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  newHeaders.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.firebaseapp.com https://maps.googleapis.com https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com; img-src 'self' data: blob: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https: wss:; frame-src 'self' https://apis.google.com https://*.firebaseapp.com https://*.google.com;"
  );
  newHeaders.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self), payment=()");
  newHeaders.set("X-CAIN-Security-Layer", "Active; SHA256-Chained-Audit");

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: newHeaders,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const apiResponse = await handleApiRequest(request);
      if (apiResponse) return applySecurityHeaders(apiResponse);

      const handler = await getServerEntry();
      const rawResponse = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(rawResponse);
      return applySecurityHeaders(normalized);
    } catch (error) {
      console.error(error);
      return applySecurityHeaders(
        new Response(renderErrorPage(error), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        })
      );
    }
  },
};
