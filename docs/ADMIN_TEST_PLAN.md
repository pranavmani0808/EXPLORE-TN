# ExploreTN — Admin Panel Test Plan

**Document Version**: 1.0  
**Target Environment**: Local Vite Test Runner (Port 4173) & Production Vercel Preview  
**Framework**: Playwright (`@playwright/test`)

---

## 1. Scope & Strategy

The purpose of this test plan is to validate all functional surfaces, security gates, CRUD operations, state persistence, and real-time integrations within the ExploreTN Admin Operations Center (`/admin`).

### Test Levels
- **Level 1: Authentication & Access Control (RBAC)**: Ensure non-authenticated users and unauthorized standard explorers cannot access or tamper with administrative functions.
- **Level 2: Navigation & Subtab Rendering**: Verify all 20+ navigation sections load without blank screens, script crashes, or 500 runtime errors.
- **Level 3: Functional CRUD & Mutation Testing**: Verify creation, modification, soft-deletion, and approval queues across places, activities, events, users, and categories.
- **Level 4: Data Quality & Cryptographic Security**: Validate Tamil Nadu geospatial bounding checks and CAIN cryptographic SHA-256 hash chains.

---

## 2. Test Matrix & Detailed Scenarios

### Section A: Authentication & RBAC

| Test ID | Test Scenario | Preconditions | Input / Steps | Expected Result | Pass Criteria |
|---|---|---|---|---|---|
| `TC-AUTH-01` | Unauthenticated Access | No active session | Navigate to `/admin` | Redirected to `/login` | URL matches `/login` |
| `TC-AUTH-02` | Unauthorized Explorer Access | `role = "explorer"` | Inject explorer session, navigate to `/admin` | Redirected to `/login` with unauthorized toast | URL matches `/login` |
| `TC-AUTH-03` | Super Admin Access | `role = "super_admin"` | Inject admin session, navigate to `/admin` | Allowed access, admin shell visible | Admin header and sidebar rendered |

### Section B: Core Operations Modules

| Test ID | Module | Input / Action | Expected Result | Pass Criteria |
|---|---|---|---|---|
| `TC-MOD-01` | Executive Dashboard | Click Executive Dashboard | Telemetry numbers, health status, and quick action cards display | Metric cards visible |
| `TC-MOD-02` | District-Wise Tables | Select District tab, switch districts | 38 District buttons render; table updates spots dynamically | District selector and table loaded |
| `TC-MOD-03` | Global Places Catalog | Type search query in places filter | Filtered place list displays matches | Search input updates table |
| `TC-MOD-04` | Kodaikanal POIs | Click Kodaikanal POIs tab | 30 curated spots display with coordinates and tags | 30 POI catalog rendered |
| `TC-MOD-05` | Place Suggestions | Click Suggestions tab | Scout submissions display with Approve/Reject actions | Actions respond to clicks |
| `TC-MOD-06` | Map Intelligence | Click Map Intelligence tab | Geospatial safety pipeline and elevation stats render | Elevation cards rendered |
| `TC-MOD-07` | Categories & Taxonomy | Add new category | Category is added to list and saved to store | Category saved in taxonomy |
| `TC-MOD-08` | Routes & Road Trips | Click Routes tab | 18 curated road trips displayed | Route list and details visible |
| `TC-MOD-09` | Activities & Adventures | Click Add Activity, fill form, submit | New activity added to active list | Activity rendered in grid |
| `TC-MOD-10` | Events & Festivals | Click Create Event, fill form, submit | New event added to upcoming list | Event rendered in list |
| `TC-MOD-11` | AI Configuration | Modify model & prompt, click Save | Settings saved to localStorage | Toast notification displayed |
| `TC-MOD-12` | Data Quality Center | Click Data Quality tab | District coverage, missing photos, and geo health displayed | Health checks rendered |
| `TC-MOD-13` | Users & RBAC Matrix | Click Add User | Modal opens with role picker and soft-delete safeguards | Modal opens without errors |
| `TC-MOD-14` | User Queries Helpdesk | Click Helpdesk tab | Live user inquiries rendered with triage actions | Tickets displayed |
| `TC-MOD-15` | Reviews & Moderation | Click Moderation tab | Place reviews rendered with Approve/Reject controls | Moderation queue rendered |
| `TC-MOD-16` | Media Asset Library | Click Media Library tab | Image assets displayed with GPS EXIF metadata | Media grid rendered |
| `TC-MOD-17` | Platform Analytics | Click Analytics tab | Live counters for active sessions, place opens, routes rendered | Counters rendered with dynamic values |
| `TC-MOD-18` | CAIN Security Dashboard| Click CAIN Security tab | Cryptographic ledger rendered with no `node:crypto` 500 crash | Blockchain audit trail rendered |
| `TC-MOD-19` | System Settings | Modify platform name, click Save | Saved in localStorage | Settings toast shown |
| `TC-MOD-20` | System Health Monitor | Click Health Monitor tab | API Gateway, Database, AI Engine latency displayed | Latency badges rendered |
