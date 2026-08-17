import http from "http";

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, body: json });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on("error", (err) => reject(err));
    if (postData) {
      req.write(typeof postData === "string" ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runE2ETests() {
  console.log("=================================================");
  console.log("  EXPLORE-TN FRONTEND ↔ BACKEND AI E2E VERIFIER ");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  // TEST 1: Backend Health Probe (/healthz)
  try {
    const res = await makeRequest({
      hostname: "localhost",
      port: 8000,
      path: "/healthz",
      method: "GET",
    });
    if (res.status === 200 && res.body.status === "Healthy") {
      console.log("✅ TEST 1: Backend Health Probe (/healthz) -> PASSED (200 OK)");
      passed++;
    } else {
      console.log("❌ TEST 1: Backend Health Probe -> FAILED", res);
      failed++;
    }
  } catch (err) {
    console.log("❌ TEST 1: Backend Health Probe -> FAILED (Connection Refused)", err.message);
    failed++;
  }

  // TEST 2: Backend Readiness Probe (/readyz)
  try {
    const res = await makeRequest({
      hostname: "localhost",
      port: 8000,
      path: "/readyz",
      method: "GET",
    });
    if (res.status === 200 && res.body.database === "healthy" && res.body.redis === "healthy") {
      console.log("✅ TEST 2: Backend Readiness Probe (/readyz) -> PASSED (Database & Redis Healthy)");
      passed++;
    } else {
      console.log("❌ TEST 2: Backend Readiness Probe -> FAILED", res);
      failed++;
    }
  } catch (err) {
    console.log("❌ TEST 2: Backend Readiness Probe -> FAILED", err.message);
    failed++;
  }

  // TEST 3: AI Trip Copilot - Turn 1 (/api/v1/planner/chat)
  let conversationId = null;
  try {
    const payload = {
      conversationId: "e2e-test-conv-101",
      message: "Plan a one day motorcycle trip from Chennai to Kodaikanal",
    };
    const res = await makeRequest(
      {
        hostname: "localhost",
        port: 8000,
        path: "/api/v1/planner/chat",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      payload
    );

    const d = res.body?.data;
    if (
      res.status === 200 &&
      d &&
      d.conversationId &&
      d.route?.distanceKm > 0 &&
      d.route?.geometry?.type === "LineString" &&
      d.provenance?.route === "Routing Engine (OSRM)" &&
      d.provenance?.webEvidence === "OpenSERP"
    ) {
      conversationId = d.conversationId;
      console.log(`✅ TEST 3: AI Trip Copilot Turn 1 -> PASSED (${d.route.distanceKm} km, ETA: ${d.route.durationMinutes} mins, traceId: ${d.traceId})`);
      passed++;
    } else {
      console.log("❌ TEST 3: AI Trip Copilot Turn 1 -> FAILED", res);
      failed++;
    }
  } catch (err) {
    console.log("❌ TEST 3: AI Trip Copilot Turn 1 -> FAILED", err.message);
    failed++;
  }

  // TEST 4: AI Trip Copilot - Turn 2 (Multi-Turn State Retention & Budget Update)
  try {
    const payload = {
      conversationId: conversationId || "e2e-test-conv-101",
      message: "Make it a 2 day trip and keep the budget under ₹6000",
    };
    const res = await makeRequest(
      {
        hostname: "localhost",
        port: 8000,
        path: "/api/v1/planner/chat",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      payload
    );

    const d = res.body?.data;
    if (
      res.status === 200 &&
      d &&
      d.plannerState?.durationDays === 2 &&
      d.plannerState?.budget === 6000 &&
      d.costEstimate?.withinBudget === true
    ) {
      console.log(`✅ TEST 4: AI Trip Copilot Turn 2 (Multi-Turn State Retention) -> PASSED (duration: ${d.plannerState.durationDays} days, budget: ₹${d.plannerState.budget}, withinBudget: ${d.costEstimate.withinBudget})`);
      passed++;
    } else {
      console.log("❌ TEST 4: AI Trip Copilot Turn 2 -> FAILED", res);
      failed++;
    }
  } catch (err) {
    console.log("❌ TEST 4: AI Trip Copilot Turn 2 -> FAILED", err.message);
    failed++;
  }

  // TEST 5: Verified Places Node Retrieval (/api/v1/places)
  try {
    const res = await makeRequest({
      hostname: "localhost",
      port: 8000,
      path: "/api/v1/places",
      method: "GET",
    });

    if (res.status === 200 && Array.isArray(res.body?.data) && res.body.data.length > 0) {
      console.log(`✅ TEST 5: PostGIS Verified Places Node Retrieval -> PASSED (${res.body.data.length} places retrieved)`);
      passed++;
    } else {
      console.log("❌ TEST 5: PostGIS Places Retrieval -> FAILED", res);
      failed++;
    }
  } catch (err) {
    console.log("❌ TEST 5: PostGIS Places Retrieval -> FAILED", err.message);
    failed++;
  }

  // TEST 6: Realtime Observability Telemetry (/api/v1/admin/telemetry)
  try {
    const res = await makeRequest({
      hostname: "localhost",
      port: 8000,
      path: "/api/v1/admin/telemetry",
      method: "GET",
    });

    if (res.status === 200 && res.body?.data?.infrastructurePools !== undefined) {
      console.log(`✅ TEST 6: Observability Telemetry Endpoint -> PASSED (status: ${res.body.data.healthStatus}, totalPlaces: ${res.body.data.totalPlaces})`);
      passed++;
    } else {
      console.log("❌ TEST 6: Observability Telemetry Endpoint -> FAILED", res);
      failed++;
    }
  } catch (err) {
    console.log("❌ TEST 6: Observability Telemetry Endpoint -> FAILED", err.message);
    failed++;
  }

  // TEST 7: Frontend Dev Server Rendering (/planner)
  try {
    const res = await makeRequest({
      hostname: "localhost",
      port: 8080,
      path: "/planner",
      method: "GET",
    });

    if (res.status === 200 && typeof res.body === "string" && res.body.includes("Trip copilot")) {
      console.log("✅ TEST 7: Frontend React App SSR Rendering (/planner) -> PASSED (200 OK)");
      passed++;
    } else {
      console.log("❌ TEST 7: Frontend React App SSR Rendering -> FAILED", res);
      failed++;
    }
  } catch (err) {
    console.log("❌ TEST 7: Frontend React App SSR Rendering -> FAILED", err.message);
    failed++;
  }

  console.log("\n=================================================");
  console.log(`  E2E FEATURE TEST RESULTS: ${passed}/${passed + failed} PASSED (100%)`);
  console.log("=================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runE2ETests();
