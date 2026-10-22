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
import { checkRateLimit, getClientIp } from "./lib/security/rate-limiter";
import { CreatePlaceSchema, UserSyncPayloadSchema, PlannerChatPayloadSchema } from "./lib/security/api-schemas";
import {
  getSupabaseAdminClient,
  verifySupabaseSession,
  unauthorized,
  forbidden,
  requireAdmin,
  VerifiedSession,
} from "./lib/security/server-auth";

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

  // 1a-1e. CAIN Security Endpoints — administrator-only. Every route below the
  // /api/v1/security/ prefix requires a verified Supabase session with an
  // admin/super_admin role in public.users.
  if (path.startsWith("/api/v1/security/")) {
    const guard = await requireAdmin(request);
    if (!guard.ok) return guard.response;

    if (path === "/api/v1/security/status" && method === "GET") {
      const status = getCainSecurityStatus();
      return new Response(
        JSON.stringify({ status: "success", data: status }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (path === "/api/v1/security/audit-logs" && method === "GET") {
      const logs = getChainedAuditLogs();
      const verification = verifyAuditChain();
      return new Response(
        JSON.stringify({ status: "success", count: logs.length, verification, data: logs }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

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

    if (path === "/api/v1/security/mfa/setup" && method === "POST") {
      try {
        // The admin identity comes from the verified session, never the request body.
        const mfaConfig = setupAdminMfa(guard.session.userId, guard.session.email);
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

    if (path === "/api/v1/security/mfa/verify" && method === "POST") {
      try {
        const body = await request.clone().json().catch(() => ({}));
        const token = body.token || "";

        const result = verifyAdminMfaToken(guard.session.userId, token);
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

    return new Response(
      JSON.stringify({ error: "Unknown security endpoint" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
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
    // Rate limit: 30 requests per minute per IP
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit(`user-sync:${clientIp}`, { limit: 30, windowMs: 60000 });
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later.", retryAfterSeconds: rateLimit.retryAfterSeconds }),
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }

    // Writes require a verified Supabase session; identity is derived from the
    // token, never from the request body.
    const verified = await verifySupabaseSession(request);

    let supabaseAdmin;
    try {
      supabaseAdmin = getSupabaseAdminClient();
    } catch (configErr) {
      return new Response(
        JSON.stringify({ error: "Supabase service key is not configured on server" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // GET stays intentionally unauthenticated: the sign-in modal checks an
    // email before a session exists. Rate limiting above blunts enumeration.
    if (method === "GET") {
      try {
        const email = url.searchParams.get("email")?.trim().toLowerCase();
        if (!email || !email.includes("@")) {
          return new Response(
            JSON.stringify({ valid: false, message: "Valid email parameter required" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        // Check if user exists in public.users
        const { data: userRecord } = await supabaseAdmin
          .from("users")
          .select("id, email, status, role")
          .eq("email", email)
          .maybeSingle();

        // Also verify in auth.users (the service key is configured at this point)
        let authUser = null;
        try {
          const { data: authList } = await supabaseAdmin.auth.admin.listUsers();
          authUser = authList?.users?.find((u) => u.email?.toLowerCase() === email) || null;
        } catch (authErr) {
          console.warn("[User Sync API] auth list check warning:", authErr);
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
          JSON.stringify({ valid: false, error: "Verification failed" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    if (method === "POST") {
      if (!verified) return unauthorized();

      try {
        const rawBody = await request.clone().json().catch(() => ({}));
        const parseResult = UserSyncPayloadSchema.safeParse(rawBody);
        if (!parseResult.success) {
          return new Response(
            JSON.stringify({ error: "Validation Error", details: parseResult.error.format() }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        const { user, isSignUp } = parseResult.data;
        // Identity always comes from the verified session token; the body only
        // carries profile fields.
        const email = verified.email;
        const name = user.name || email.split("@")[0] || "Explorer User";

        const { data: existingUser } = await supabaseAdmin
          .from("users")
          .select("id, email, name, role, status")
          .eq("email", email)
          .maybeSingle();

        if (existingUser && (existingUser.status === "suspended" || existingUser.status === "blocked")) {
          return new Response(
            JSON.stringify({
              exists: true,
              valid: false,
              message: "User account has been deactivated or suspended.",
            }),
            { status: 403, headers: { "Content-Type": "application/json" } }
          );
        }

        // Role is owned by the database record — this API never mints
        // privileged roles from caller-supplied emails.
        const role = existingUser?.role || "explorer";

        if (!isSignUp && !existingUser) {
          return new Response(
            JSON.stringify({ exists: false, message: "user not found" }),
            { status: 404, headers: { "Content-Type": "application/json" } }
          );
        }

        // The caller already holds a verified Supabase session, so their auth
        // user exists. Keep the existing row id (legacy rows use synthetic ids)
        // to avoid primary-key changes on referenced rows.
        const targetId = existingUser?.id || verified.userId;

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
        try {
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
            );
        } catch (profileErr) {
          console.warn("[User Sync API] profile upsert warning:", profileErr);
        }

        try {
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
            );
        } catch (statsErr) {
          console.warn("[User Sync API] stats upsert warning:", statsErr);
        }

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

    const placesFilters: { category?: string; district?: string; search?: string } = {};
    if (category) placesFilters.category = category;
    if (district) placesFilters.district = district;
    if (search) placesFilters.search = search;

    const places = await SupabaseDatabaseRepository.getPublicPlaces(placesFilters);
    return new Response(
      JSON.stringify({ status: "success", count: places.length, data: places }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  }

  if (path === "/api/v1/places" && method === "POST") {
    // Writes require a signed-in explorer: the service key bypasses RLS, so
    // this endpoint must never be anonymous.
    const placeSession = await verifySupabaseSession(request);
    if (!placeSession) return unauthorized();

    // Rate limit write endpoint: 20 creations per hour per IP
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit(`create-place:${clientIp}`, { limit: 20, windowMs: 3600000 });
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded for creating places", retryAfterSeconds: rateLimit.retryAfterSeconds }),
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }

    try {
      const rawBody = await request.clone().json().catch(() => ({}));
      const parseResult = CreatePlaceSchema.safeParse(rawBody);
      if (!parseResult.success) {
        return new Response(
          JSON.stringify({ error: "Validation Error", details: parseResult.error.format() }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const created = await SupabaseDatabaseRepository.createPlace(parseResult.data);
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
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  }

  // 1c-ii. Place Weather Endpoint: GET /api/v1/places/:slug/weather
  if (path.startsWith("/api/v1/places/") && path.endsWith("/weather") && method === "GET") {
    const slug = path.replace("/api/v1/places/", "").replace("/weather", "");
    const intel = getPlaceTravelIntelligence(slug) as any;
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
    // Rate limit: 25 copilot requests per minute per IP
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit(`planner-chat:${clientIp}`, { limit: 25, windowMs: 60000 });
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ error: "Trip Copilot is busy. Please wait a few seconds before trying again.", retryAfterSeconds: rateLimit.retryAfterSeconds }),
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }

    try {
      const rawBody = await request.clone().json().catch(() => ({}));
      const parseResult = PlannerChatPayloadSchema.safeParse(rawBody);
      if (!parseResult.success) {
        return new Response(
          JSON.stringify({ error: "Validation Error", details: parseResult.error.format() }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const body = parseResult.data;
      const userMsg: string = body.message || body.user_message || "Plan a trip to Madurai";
      const cid: string = body.conversationId || body.session_id || `conv-${Date.now().toString(36)}`;
      const traceId = `tr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

      let session = sessionsMemory.get(cid);
      if (!session) {
        // Cap in-memory sessions so long-lived instances don't grow unbounded.
        const MAX_PLANNER_SESSIONS = 500;
        if (sessionsMemory.size >= MAX_PLANNER_SESSIONS) {
          const oldest = sessionsMemory.keys().next().value;
          if (oldest !== undefined) sessionsMemory.delete(oldest);
        }
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

  
    // 1e. User Delete Endpoint (soft delete)
    if (path === "/api/v1/user/delete" && method === "DELETE") {
      const guard = await requireAdmin(request)
      if (!guard.ok) return guard.response

      const userId = guard.session.userId
      const supabase = getSupabaseAdminClient()
      const { error } = await supabase.from("users").update({ status: "deleted" }).eq("id", userId)
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

      // Also delete related profile and stats rows
      await supabase.from("user_profiles").delete().eq("user_id", userId)
      await supabase.from("user_stats").delete().eq("user_id", userId)

      return new Response(JSON.stringify({ status: "deleted" }), { status: 200 })
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

// 'unsafe-eval' is only needed by Vite's dev runtime (HMR/module transforms);
// production builds never receive it. Firebase domains were dropped after the
// Google auth migration to Supabase OAuth.
function buildContentSecurityPolicy(): string {
  const isDev = process.env["NODE_ENV"] !== "production";
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    ...(isDev ? ["'unsafe-eval'"] : []),
    "https://apis.google.com",
    "https://maps.googleapis.com",
    "https://unpkg.com",
  ].join(" ");
  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https: wss:",
    "frame-src 'self' https://apis.google.com https://*.google.com",
  ].join("; ");
}

function applySecurityHeaders(res: Response): Response {
  const newHeaders = new Headers(res.headers);
  newHeaders.set("X-Content-Type-Options", "nosniff");
  newHeaders.set("X-Frame-Options", "SAMEORIGIN");
  newHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
  newHeaders.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  newHeaders.set("Content-Security-Policy", buildContentSecurityPolicy());
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
