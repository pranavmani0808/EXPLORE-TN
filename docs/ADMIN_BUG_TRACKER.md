# ExploreTN — Admin Panel Bug Tracker & Defect Log

**Status**: Active  
**Maintained by**: Antigravity Quality Engineering  

---

## Resolved Defect Registry

### 1. BUG-001: CAIN Security Dashboard Runtime Crash (500 Error)
- **Severity**: Critical (P0)
- **Component**: `src/components/admin/security-dashboard.tsx`
- **Root Cause**: The module attempted to import and invoke `node:crypto` inside client-side browser bundle execution, triggering an uncaught ReferenceError / Module Not Found exception.
- **Resolution**: Replaced `node:crypto` with the native browser Web Cryptography API (`window.crypto.subtle.digest("SHA-256", ...)` and `window.crypto.getRandomValues(...)`).
- **Status**: **RESOLVED & VERIFIED** (Passes automated tests without errors).

### 2. BUG-002: Hardcoded / Fake Platform Analytics Data
- **Severity**: High (P1)
- **Component**: `src/routes/admin.tsx` (Platform Analytics section)
- **Root Cause**: The analytics view previously displayed static dummy numbers rather than reflecting live system telemetry.
- **Resolution**: Connected the view directly to `getAnalyticsEvents()` from `src/lib/explorer-activity.ts` and `getLiveDashboardMetrics()` from `src/lib/dashboard-telemetry.ts`, dynamically computing real visitor views, searches, bookmarks, and navigations.
- **Status**: **RESOLVED & VERIFIED**.

### 3. BUG-003: Non-Functional Add Buttons in Activities & Events
- **Severity**: Medium (P2)
- **Component**: `src/routes/admin.tsx` (Activities and Events sub-sections)
- **Root Cause**: The "+ Add Activity" and "+ Create Event" buttons were present in the UI without event listener handlers or modal bindings.
- **Resolution**: Added interactive modal dialogs, form validation, dynamic state management, inline edit prompt handlers, and deletion capabilities with sonner toast notifications.
- **Status**: **RESOLVED & VERIFIED**.

### 4. BUG-004: Users & RBAC Matrix "+ Add User" Button Disconnected
- **Severity**: Medium (P2)
- **Component**: `src/routes/admin.tsx` (`activeSection === "users"`)
- **Root Cause**: The "+ Add User" button did not trigger `UserManagementModal`.
- **Resolution**: Connected the button to `isUserModalOpen`, opening the full 360° user management panel with soft-delete safeguards and role assignment.
- **Status**: **RESOLVED & VERIFIED**.

### 5. BUG-005: AI Configurations & System Settings Unsaved State
- **Severity**: Low (P3)
- **Component**: `src/routes/admin.tsx` (`ai_config` and `settings` sections)
- **Root Cause**: Submitting the form did not persist values across sessions.
- **Resolution**: Wired inputs to component state, connected submission handlers to `localStorage`, and triggered confirmation toast feedback.
- **Status**: **RESOLVED & VERIFIED**.

---

## Active / Open Issues

*None at this time. All 23 admin functional modules are verified operational.*
