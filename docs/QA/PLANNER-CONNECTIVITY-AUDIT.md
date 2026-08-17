# ExplorerTN — Official Planner Frontend-to-FastAPI Production Connectivity Audit Report

**Audit Date:** August 17, 2026  
**Auditor Role:** Principal Systems Architect  
**Target Component:** Trip Copilot Frontend (`/planner`) ↔ FastAPI Backend (`/api/v1/planner/chat`)  
**Backend Entrypoint:** `backend/app/main.py` (`uvicorn` port 8000)  
**Backend Health Probe:** `GET http://localhost:8000/healthz` (`200 OK`)  
**Backend Readiness Probe:** `GET http://localhost:8000/readyz` (`200 OK`)  
**Planner Chat Probe:** `POST http://localhost:8000/api/v1/planner/chat` (`200 OK`)  
**Pytest Backend Suite Status:** **`71 passed in 0.49s` (100% Pass Rate)** ✅  
**Frontend Production Build Status:** **`CLEAN BUILD (0 errors)`** ✅  
**Production Backend Deployment Status:** **`PRODUCTION BACKEND URL: MISSING`** ⚠️

---

## 1. System Architecture & Component Mapping

```text
Browser Client (Google Chrome)
   │
   ├── [1. Frontend Asset Host: Vercel]
   │    URL: https://explore-tn-trails-main.vercel.app
   │    Serves: React 19 / TanStack Start / Vite SSR bundle
   │
   └── [2. Backend Core API Engine: FastAPI (Uvicorn)]
        Local Dev URL: http://localhost:8000
        Production URL: Configured via VITE_API_URL environment variable
        Serves:
          - GET /healthz
          - GET /readyz
          - POST /api/v1/planner/chat
          - PostgreSQL / PostGIS Spatial Queries
          - OSRM Real Road Routing & ETA Engine
          - OpenSERP Web Evidence Engine
          - Gemini AI Narrative Pipeline
```

---

## 2. Confirmed Root Cause & Strict Guard Implementation

| Component | Defect & Resolution |
| :--- | :--- |
| **Confirmed Root Cause** | Previous `getApiBaseUrl()` in `src/lib/api-client/config.ts` fell back to `window.location.origin` in non-localhost browser environments. On Vercel (`https://explore-tn-trails-main.vercel.app`), this caused Chrome to send API requests to Vercel's static React frontend host instead of Uvicorn, returning HTTP **404 Not Found**. |
| **Strict Production Guard** | Updated `src/lib/api-client/config.ts` to enforce explicit environment variable checking. If `VITE_API_URL` is missing in production (`MODE === "production"`), it throws an explicit error: `"Production API URL is not configured. Set VITE_API_URL to the deployed FastAPI backend."` Never silently falls back to `localhost` or `window.location.origin`. |
| **Eradication of Mock Fallbacks** | Confirmed 100% removal of the old mock string (`"Good call — I've folded that into..."`). Failed API calls render an explicit error alert displaying `[TraceID: tr-xxxx] Backend unavailable`. |

---

## 3. Local Multi-Turn E2E Verification Logs

Tested against local Uvicorn FastAPI server (`http://localhost:8000`):

### Turn 1 Request:
`POST http://localhost:8000/api/v1/planner/chat`  
Payload: `{"conversationId": "chrome-debug-002", "message": "Plan a one day motorcycle trip from Chennai to Kodaikanal"}`  
Response: HTTP 200 OK (`conversationId: "chrome-debug-002"`, `durationDays: 1`, `withinBudget: false`, `traceId: "tr-1786949468020-8c84fd"`).

### Turn 2 Request:
`POST http://localhost:8000/api/v1/planner/chat`  
Payload: `{"conversationId": "chrome-debug-002", "message": "Make it a 2 day trip and keep the budget under ₹6000"}`  
Response: HTTP 200 OK (`conversationId: "chrome-debug-002"`, `durationDays: 2`, `budget: 6000.0`, `withinBudget: true`, `traceId: "tr-1786949468031-df1d67"`).

---

## 4. Production API Status & Deployment Requirement

> **PRODUCTION BACKEND URL: MISSING**  
> **"Frontend configuration is corrected, but production FastAPI deployment is still required."**

To enable production Chrome clients on `https://explore-tn-trails-main.vercel.app` to reach the FastAPI core:

1. Deploy `backend/app/main.py` to a production cloud host (e.g. Render, Railway, Fly.io, Cloud Run, AWS).
2. Set the environment variable in Vercel Project Settings:
   `VITE_API_URL=https://<your-fastapi-production-host>`
3. Re-trigger Vercel deployment so Vite injects the production API host URL into client bundles.

---

## 5. Verification Checklist

- ✅ **Root cause confirmed & fixed:** Eliminated `window.location.origin` fallback.
- ✅ **Strict production guard implemented:** Throws error if `VITE_API_URL` is missing in production.
- ✅ **Mock fallback strings eradicated:** All static mock strings removed.
- ✅ **Local FastAPI endpoints verified:** `/healthz`, `/readyz`, and `POST /api/v1/planner/chat` return HTTP 200 OK.
- ✅ **Local multi-turn session state verified:** Retains `conversationId`, updates `durationDays` (1 ➔ 2) and `budget` (6000.0).
- ✅ **Secrets protected:** `GEMINI_API_KEY`, `OPENSERP_API_KEY`, `DATABASE_URL` strictly isolated on FastAPI backend.
- ✅ **Pytest backend suite passed:** `71 passed in 0.49s`.
- ✅ **Frontend build passed:** `npm run build` succeeded in `196ms`.

**Audit Verdict:** **`Frontend configuration is corrected, but production FastAPI deployment is still required.`** ⚠️🚀
