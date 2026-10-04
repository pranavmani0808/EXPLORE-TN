export type UserRole =
  | "guest"
  | "explorer" // Registered User (Traveler)
  | "scout" // Local Contributor
  | "moderator" // Community & Content Safety
  | "content_editor" // Editorial Management
  | "support_agent" // Helpdesk & User Queries
  | "admin" // Day-to-Day Platform Admin
  | "super_admin"; // Highest Privilege / Platform Owner

export type Permission =
  | "manage_users"
  | "manage_places"
  | "manage_routes"
  | "manage_hotels"
  | "manage_reviews"
  | "manage_crawler"
  | "approve_crawler_data"
  | "modify_system_settings"
  | "view_audit_logs"
  | "verify_integrity"
  | "manage_mfa"
  | "manage_security"
  | "can_create_place"
  | "can_edit_place"
  | "can_delete_place"
  | "can_verify_place"
  | "can_publish_route"
  | "can_delete_route"
  | "can_manage_users"
  | "can_manage_roles"
  | "can_manage_weather"
  | "can_manage_ai"
  | "can_view_analytics"
  | "can_moderate_community"
  | "can_contribute_scout"
  | "can_manage_helpdesk";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole; // Platform Authorization Role (e.g., super_admin)
  status: "active" | "suspended" | "pending";
  rank: string; // Explorer Gamification Rank (e.g., Level 0 Explorer)
  districtCount: number;
  xp?: number;
  authProvider?: "google" | "email" | "apple";
}

export const PERMISSION_MATRIX: Record<UserRole, Permission[]> = {
  guest: [],
  explorer: [],
  scout: ["can_contribute_scout"],
  moderator: ["manage_reviews", "can_moderate_community"],
  content_editor: [
    "manage_places",
    "can_create_place",
    "can_edit_place",
    "manage_routes",
    "can_publish_route",
    "manage_hotels",
  ],
  support_agent: ["can_manage_helpdesk"],
  admin: [
    "manage_places",
    "manage_routes",
    "manage_hotels",
    "manage_reviews",
    "manage_crawler",
    "approve_crawler_data",
    "view_audit_logs",
    "verify_integrity",
    "manage_mfa",
    "manage_security",
    "can_create_place",
    "can_edit_place",
    "can_verify_place",
    "can_publish_route",
    "can_delete_route",
    "can_moderate_community",
    "can_manage_weather",
    "can_manage_ai",
    "can_view_analytics",
    "can_manage_helpdesk",
    "can_manage_users",
  ],
  super_admin: [
    "manage_users",
    "manage_places",
    "manage_routes",
    "manage_hotels",
    "manage_reviews",
    "manage_crawler",
    "approve_crawler_data",
    "modify_system_settings",
    "view_audit_logs",
    "verify_integrity",
    "manage_mfa",
    "manage_security",
    "can_create_place",
    "can_edit_place",
    "can_delete_place",
    "can_verify_place",
    "can_publish_route",
    "can_delete_route",
    "can_manage_users",
    "can_manage_roles",
    "can_manage_weather",
    "can_manage_ai",
    "can_view_analytics",
    "can_moderate_community",
    "can_contribute_scout",
    "can_manage_helpdesk",
  ],
};

export function getAuthorizedRedirectRoute(role: UserRole): string {
  switch (role) {
    case "guest":
    case "explorer":
    case "scout":
      return "/";
    case "moderator":
      return "/admin?section=reviews";
    case "content_editor":
      return "/admin?section=destinations";
    case "support_agent":
      return "/admin?section=user_queries";
    case "admin":
    case "super_admin":
    default:
      return "/admin";
  }
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return PERMISSION_MATRIX[role]?.includes(permission) ?? false;
}

export function isAdminUser(user: UserProfile | null): boolean {
  if (!user) return false;
  return (
    user.role === "super_admin" ||
    user.role === "admin" ||
    user.role === "content_editor" ||
    user.role === "moderator" ||
    user.role === "support_agent"
  );
}

// Module-level authorized role mapping matching official matrix
export const MODULE_ALLOWED_ROLES: Record<string, UserRole[]> = {
  dashboard: ["admin", "super_admin"],
  district_places: ["content_editor", "admin", "super_admin"],
  destinations: ["content_editor", "admin", "super_admin"],
  kodai_pois: ["content_editor", "admin", "super_admin"],
  place_suggestions: ["moderator", "admin", "super_admin"],
  map_intelligence: ["content_editor", "admin", "super_admin"],
  categories: ["content_editor", "admin", "super_admin"],
  routes: ["content_editor", "admin", "super_admin"],
  activities: ["content_editor", "admin", "super_admin"],
  events: ["content_editor", "admin", "super_admin"],
  ai_planner: ["admin", "super_admin"],
  ai_config: ["admin", "super_admin"],
  data_quality: ["content_editor", "admin", "super_admin"],
  users: ["admin", "super_admin"], // Admin has limited scope, Super Admin has full
  user_queries: ["support_agent", "admin", "super_admin"],
  reviews: ["moderator", "admin", "super_admin"],
  media_library: ["content_editor", "admin", "super_admin"],
  articles: ["content_editor", "admin", "super_admin"],
  weekly_digest: ["admin", "super_admin"],
  search_analytics: ["admin", "super_admin"],
  analytics: ["admin", "super_admin"],
  security: ["super_admin"], // CAIN Security Dashboard: Super Admin only
  notifications: ["support_agent", "moderator", "content_editor", "admin", "super_admin"],
  audit: ["admin", "super_admin"], // Admin read-only, Super Admin full
  settings: ["super_admin"], // System Settings: Super Admin only
  system_health: ["admin", "super_admin"],
};

export function isSectionAuthorized(role: UserRole, sectionId: string): boolean {
  if (role === "super_admin") return true;
  const allowed = MODULE_ALLOWED_ROLES[sectionId];
  return allowed ? allowed.includes(role) : false;
}

// REAL AUTH SESSION MANAGER with Reactive Event Broadcast
export function getCurrentAuthUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("etn_auth_user");
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function setAuthSession(user: UserProfile) {
  if (typeof window !== "undefined") {
    localStorage.setItem("etn_auth_user", JSON.stringify(user));
    window.dispatchEvent(new CustomEvent("etn_auth_updated", { detail: user }));
  }
  try {
    import("./supabase-database").then(({ SupabaseDatabaseRepository }) => {
      SupabaseDatabaseRepository.upsertUserRecord(user);
    });
  } catch {
    // Graceful silent database sync
  }
}

export function updateProfileUser(partial: Partial<UserProfile>) {
  const current = getCurrentAuthUser();
  if (current) {
    const updated: UserProfile = { ...current, ...partial };
    setAuthSession(updated);
  }
}

export function updateAuthRole(newRole: UserRole) {
  const current = getCurrentAuthUser();
  if (current) {
    const updated: UserProfile = { ...current, role: newRole };
    setAuthSession(updated);
    try {
      import("./supabase-database").then(({ SupabaseDatabaseRepository }) => {
        SupabaseDatabaseRepository.updateUserRoleInDB(current.id, newRole);
      });
    } catch {
      // Graceful silent database sync
    }
  }
}

export function clearAuthSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("etn_auth_user");
    window.dispatchEvent(new CustomEvent("etn_auth_updated", { detail: null }));
  }
}

export function subscribeToAuthChanges(callback: (user: UserProfile | null) => void) {
  if (typeof window === "undefined") return () => {};
  const handler = (e: any) => {
    callback(e.detail);
  };
  const storageHandler = (e: StorageEvent) => {
    if (e.key === "etn_auth_user") {
      try {
        const updated = e.newValue ? JSON.parse(e.newValue) : null;
        callback(updated);
      } catch {
        callback(null);
      }
    }
  };
  window.addEventListener("etn_auth_updated", handler);
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener("etn_auth_updated", handler);
    window.removeEventListener("storage", storageHandler);
  };
}
