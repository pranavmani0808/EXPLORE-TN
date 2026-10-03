# ExploreTN — Admin Panel Feature Audit

**Audit Date**: October 3, 2026  
**Auditor**: Antigravity Quality & Engineering Agent  
**Version**: v3.5 Control Center  
**Platform**: ExploreTN (Tamil Nadu Geospatial Travel Intelligence)

---

## 1. System Overview & Architecture

- **Frontend Core**: TanStack Start / TanStack Router + Vite + React 19 + Tailwind CSS + Lucide Icons + Motion (Framer Motion).
- **Backend APIs**: Hybrid architecture with dual data layers:
  - Client / Server Supabase Client (`@supabase/supabase-js`) targeting PostgreSQL with Row Level Security (RLS) policies.
  - Python FastAPI REST Service (`backend/app/`) with Pydantic contracts and GIS schemas.
- **Authentication & RBAC**: Real reactive local & database auth session handling via `src/lib/auth-rbac.ts`. Dual-layer authorization supporting roles: `explorer`, `beta_tester`, `place_manager`, `route_manager`, `community_manager`, `content_editor`, `weather_manager`, `analytics_manager`, `ai_manager`, `admin`, and `super_admin`.

---

## 2. Feature Inventory & Current Status

| Group | Admin Module / Tab | UI Route / Key | Underlying Backend / Store | Interactive Status | Audit Findings |
|---|---|---|---|---|---|
| **Overview** | Executive Dashboard | `activeSection === "dashboard"` | `dashboard-telemetry.ts`, `audit-trail-store.ts`, `explorer-activity.ts` | **Operational** | Displays real-time session telemetry, database status, system health, and quick actions (Add Place, Invite Manager, Database Backup). |
| **Discovery** | District-Wise Tables (38) | `activeSection === "district_places"` | `tamil-nadu-districts.ts`, Supabase `etn_places_v3` | **Operational** | Full 38 district selector. Interactive table with spot creation, coordinate verification, categorization (temples, hills, falls, beaches, food), editing, and deletion. |
| **Discovery** | Global Places Catalog | `activeSection === "destinations"` | `places.ts`, `SupabaseDatabaseRepository` | **Operational** | Full search filter, category filter, district tags, live status toggling, and AI description generation. |
| **Discovery** | Kodaikanal POIs (30) | `activeSection === "kodai_pois"` | `kodaikanal-places.ts` | **Operational** | Curated catalog of 30 POIs with GPS coordinates, categories, and direct edit/add controls. |
| **Discovery** | Place Suggestions & Scout Reviews | `activeSection === "place_suggestions"` | Supabase `etn_place_suggestions` | **Operational** | Community crowdsourced place submission queue with approve/reject state transitions. |
| **Discovery** | Map Intelligence & Bounds | `activeSection === "map_intelligence"` | `elevation-data.ts`, `data-quality.ts` | **Operational** | Geospatial bounding box verification, elevation gradient analysis, hairpin bend warning system. |
| **Discovery** | Categories & Taxonomy | `activeSection === "categories"` | `taxonomy-categories.ts` | **Operational** | Add, edit, and delete taxonomy categories with immediate synchronization to user explore filters. |
| **Discovery** | Routes & Road Trips | `activeSection === "routes"` | `routes.ts`, `routes-data.ts` | **Operational** | 18 curated highway and scenic routes with elevation gain calculation and waypoint inspection. |
| **Experiences**| Activities & Adventures | `activeSection === "activities"` | `adventuresList` state & local store | **Operational** | Interactive modal for adding, editing, and deleting adventure activities across districts. |
| **Experiences**| Events & Cultural Festivals | `activeSection === "events"` | `events` state & local store | **Operational** | Interactive modal for scheduling cultural festivals, temple celebrations, venues, and dates. |
| **AI Intelligence**| AI Planner Operations | `activeSection === "ai_planner"` | `ai-operations-module.tsx`, `ai.ts` | **Operational** | Plan generation telemetry, query latency tracking, and routing constraints monitor. |
| **AI Intelligence**| AI Configuration & Prompts | `activeSection === "ai_config"` | `localStorage` (`etn_ai_model`, `etn_ai_prompt`) | **Operational** | Model selection (Gemini 1.5 Pro, Gemini Flash, Claude 3.5 Sonnet, GPT-4o), prompt editor, and parameter controls. |
| **Data Quality** | Data Quality Center | `activeSection === "data_quality"` | `content-health-module.tsx`, `data-quality.ts` | **Operational** | District coverage health checks, missing media detection, coordinates bounding box validation. |
| **Community** | Users & RBAC Matrix | `activeSection === "users"` | `audit-trail-store.ts`, `auth-rbac.ts` | **Operational** | User list with full 360° modal, role promotion/demotion, soft delete safeguard with "DELETE" confirmation typing. |
| **Community** | User Queries & Support Helpdesk | `activeSection === "user_queries"` | Supabase `etn_user_queries` | **Operational** | Live tickets submitted from `/support`, status triage (open/resolved), reply tracking. |
| **Community** | Reviews & Moderation | `activeSection === "reviews"` | Supabase `etn_community_contributions_v3` | **Operational** | Live moderation queue for reviews submitted from place detail pages (`/place/$slug`). |
| **Content** | Media Asset Library | `activeSection === "media_library"` | `media-library-module.tsx` | **Operational** | Asset repository with GPS EXIF metadata extraction and AI auto-tagging. |
| **Content** | Articles & Travel Guides | `activeSection === "articles"` | `cms-builder-module.tsx` | **Operational** | Homepage section ordering and publication toggles. |
| **Analytics** | Weekly Digest & Reports | `activeSection === "weekly_digest"` | `weekly-digest-module.tsx`, `localStorage` | **Operational** | Performance broadcast directly integrated with public visitor feed. |
| **Analytics** | Search Management | `activeSection === "search_analytics"` | Real Explorer telemetry | **Operational** | Top searched queries tracking and zero-result search opportunity analysis. |
| **Analytics** | Platform Analytics | `activeSection === "analytics"` | `explorer-activity.ts` | **Operational** | Live visitor counts, place views, search inquiries, and route navigation telemetry. |
| **System** | CAIN Security Dashboard | `activeSection === "security"` | `security-dashboard.tsx`, Web Crypto API | **Operational** | Cryptographic audit chain with SHA-256 block hashing and MFA TOTP secret generator. Fixed node:crypto 500 error. |
| **System** | Notifications Center | `activeSection === "notifications"` | `audit-trail-store.ts` | **Operational** | Real-time system notifications and alerts. |
| **System** | Audit Logs | `activeSection === "audit"` | `audit-trail-store.ts` | **Operational** | Immutable append-only audit trail logging all admin operations and actor attribution. |
| **System** | System Settings | `activeSection === "settings"` | `localStorage` (`etn_platform_name`) | **Operational** | Platform configuration and Mapbox API engine keys. |
| **System** | System Health Monitor | `activeSection === "system_health"` | Microservice telemetry probes | **Operational** | Latency and uptime monitoring for API Gateway, Database, AI Engine, and Supabase Auth. |

---

## 3. Explicit User-Requested Architectural Changes

1. **Hotels & Resorts**: Explicitly removed from navigation and admin control panel per user requirement.
2. **Crawl Pipeline**: Intentionally removed from sidebar per user instruction and replaced with real-time Data Quality & Content Health checks.
3. **Live Data Integration**: Replaced all hardcoded/static mock metrics with dynamic telemetry reading from live database tables and `explorer-activity.ts` event stream.
