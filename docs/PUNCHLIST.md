# ExplorerTN — Honest Engineering Punch List

**Date:** 20 Aug 2026  
**Repo:** `pranavmani0808/EXPLORE-TN`  
**Status:** Strong UI + planner prototype. Not closed-beta ready.

This list is based on the actual code, not the QA markdown in `docs/QA/`.

---

## Done in this pass

- [x] Removed hardcoded AI / JWT / OpenSERP keys from `backend/app/core/config.py`
- [x] Browser API client now uses same-origin relative URLs (Vite proxies `/api`, `/healthz`, `/readyz`)
- [x] CORS allows `*.e2b.app` and `*.vercel.app` preview hosts
- [x] `/explore` is a real catalog + map page with category, district, search, URL params
- [x] Places list / autocomplete hit `GET /api/v1/places` (was calling a non-existent `/api/v1/discover`)
- [x] Search panel navigates to a place or `/explore?q=`
- [x] Telemetry helper no longer invents request-rate numbers when the API is down

---

## P0 — Must fix before any real users

1. **No real database.** `PlacesService` is an in-memory dict. Creates, verifies, and feedback die on process restart. `supabase/schema.sql` is unused.
2. **Auth is a stub.** Missing `Authorization` header becomes a hardcoded `super_admin` named Pranav (`backend/app/core/security.py`). Any anonymous caller can mutate places.
3. **Secrets were in git.** Rotate the leaked `osk_live_...` key and the old JWT default. Treat them as compromised.
4. **QA docs overclaim.** `docs/QA/*` says Postgres, Redis, PostGIS, and closed beta are verified. They are not. Do not ship those reports as truth.
5. **Readyz lies.** It always reports `database: healthy` / `PostgreSQL + PostGIS Pool Active` even though there is no DB connection.

## P1 — Product gaps that break the promise

6. Home hero still says “1,240 places · 38 districts”. Catalog is ~53–55 places.
7. Place detail (`/place/$slug`) still reads only the static frontend catalog. API-only places 404.
8. Reviews, “I’ve been here”, community posts, and admin CMS write to `localStorage`, not the backend.
9. `/routes` is only a fullscreen map modal. No trail directory, GPX, or elevation UI.
10. `/community` and `/profile` are mostly static chrome. Passport stamps / XP are client-only.
11. Planner conversation state lives in a process-local dict. Multi-instance / Vercel serverless will forget chats.
12. OSRM public demo (`router.project-osrm.org`) is rate-limited and not a production SLA.
13. Weather, OpenSERP, Gemini, Mapbox, Google Maps keys are optional and mostly unused or faked.
14. `/admin` and `/ops` look like a SaaS console but are not backed by real tenants, billing, or RLS.

## P2 — Quality / correctness

15. Frontend and backend place records are duplicated and drift (slugs, categories, images).
16. Category vocab is inconsistent: `temple` vs `temples`, `waterfall` vs `waterfalls`, extra `nature` values not in the TS union.
17. Geofence rejects some valid South-India destinations (Agumbe, Mullayanagiri, Horsley Hills) if create-validation is applied strictly.
18. Verify endpoint used to hardcode `created_by_id = "usr-manager-2"`; createdBy is still a display name, not a user id.
19. `fetchHomeExperience` / `fetchExploreExperience` BFF endpoints do not exist on the backend.
20. Leaflet CSS / map instances are created per page; rapid navigation can leak maps.
21. No CI. Backend tests mock a lot of “production” behavior. Frontend has no unit tests.
22. Dark mode is default in `__root.tsx` (`className="dark"`) even when the user chose light.

## Suggested next build order

1. Postgres (or even SQLite) repository behind `PlacesService` + drop the dict.
2. Real auth: no anonymous super_admin; explorer is default; admin routes require a role.
3. Single canonical place catalog shared by frontend and API.
4. Place detail loader: API first, static fallback.
5. Persist planner conversations and community submissions.
6. Delete or rewrite `docs/QA/*` so they match reality.

---

**Verdict:** Keep building. Do not call this closed beta until P0 is done.
