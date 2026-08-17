# ExplorerTN — Backend Architecture Inventory Report

**Inventory Date:** August 10, 2026  
**Audit Context:** Phase 10 — Backend Reality Check & Architecture Inventory  
**Auditor:** Senior Backend Reliability & Systems QA Engineer  

---

## 1. Backend Core Architecture

- **Framework:** Python FastAPI `v0.110+` (`backend/app/main.py`)
- **ASGI Server Engine:** Uvicorn `v0.28+`
- **Validation Library:** Pydantic V2 (`backend/app/schemas/`)
- **Core Security Module:** PyJWT `v2.8+` with Supabase JWT decoding (`backend/app/core/security.py`)
- **Log Engine:** Structured JSON Logger (`backend/app/core/logging.py`)
- **Exception Contract:** Global API Exception Handler (`backend/app/core/exceptions.py`)

---

## 2. Server Router Topology (`backend/app/api/v1/`)

1. **`health.py`**:
   - `GET /healthz` — Infrastructure liveness probe
   - `GET /readyz` — Database & service readiness probe
2. **`places.py`**:
   - `GET /api/v1/places` — List destination places with spatial/category filters
   - `POST /api/v1/places` — Create destination node with WGS84 bounding box validation
   - `POST /api/v1/places/{place_id}/verify` — Verify place node with self-approval restriction
3. **`admin.py`**:
   - `GET /api/v1/admin/telemetry` — Retrieve live database telemetry counts

---

## 3. Database & PostGIS Schema Inventory (`supabase/schema.sql`)

- **Database Engine:** Supabase PostgreSQL with PostGIS Spatial Extensions
- **Enumeration Types:**
  - `user_role` (`explorer`, `place_manager`, `route_manager`, `community_manager`, `super_admin`)
  - `user_status` (`active`, `suspended`, `pending`)
  - `audit_action` (`CREATED`, `UPDATED`, `VERIFIED`, `DELETED`, `APPROVED`, `REJECTED`, `ROLE_CHANGED`, `STATUS_CHANGED`, `BACKUP`)
- **Entity Tables:**
  - `public.users` (UUID PK, name, email, role, status, rank, xp, created_at)
  - `public.audit_logs` (UUID PK, actor_id, actor_name, actor_role, action, entity_type, entity_id, entity_name, before_data, after_data)
  - `public.places` (UUID PK, slug, name, district, category, latitude, longitude, elevation, verified, created_by)
  - `public.routes` (UUID PK, slug, title, district, difficulty, distance_km, verified, created_by)
- **PL/pgSQL Functions:**
  - `public.get_dashboard_telemetry()` — Returns live JSON telemetry counts directly from PostgreSQL tables
  - `public.handle_new_user()` — Automatic profile synchronization trigger on Supabase Auth sign-up

---

## 4. Pytest Automated Test Suite Inventory (`backend/tests/`)

- **Test Suite Entrypoint:** `backend/tests/test_backend_core.py`
- **Current Test Coverage:**
  1. `test_health_and_readiness` — Liveness & readiness probes
  2. `test_wgs84_geofence_validation` — Rejection of coordinates outside Tamil Nadu (e.g. Mumbai 19.076°N)
  3. `test_spatial_duplicate_detection` — Detection of duplicates within 5km radius
  4. `test_permission_rbac_enforcement` — Rejection of unauthorized role mutations (`EXPLORER` role)
  5. `test_self_approval_restriction` — Rejection of self-verification attempts by place managers
- **Pass Rate:** `5 / 5 passed (100%)`

---

## 5. External Services & Infrastructure Status

- **Supabase Auth & RLS:** Active RLS policies on `users`, `places`, `routes`, `audit_logs`
- **Google Gemini API:** Structured JSON schema validation engine (`backend/app/services/places_service.py`)
- **Redis Cache & Background Workers:** Available for high-frequency cache layer expansion
