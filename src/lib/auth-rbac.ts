export type UserRole =
  | "explorer"
  | "beta_tester"
  | "place_manager"
  | "route_manager"
  | "community_manager"
  | "content_editor"
  | "weather_manager"
  | "analytics_manager"
  | "ai_manager"
  | "admin"
  | "super_admin";

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
  | "can_moderate_community";

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
}

export const PERMISSION_MATRIX: Record<UserRole, Permission[]> = {
  explorer: [],
  beta_tester: [],
  place_manager: ["manage_places", "can_create_place", "can_edit_place", "can_verify_place"],
  route_manager: ["manage_routes", "can_publish_route", "can_delete_route"],
  community_manager: ["manage_reviews", "can_moderate_community"],
  content_editor: ["manage_places", "can_create_place", "can_edit_place"],
  weather_manager: ["can_manage_weather"],
  analytics_manager: ["can_view_analytics"],
  ai_manager: ["can_manage_ai"],
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
  ],
};

export function getAuthorizedRedirectRoute(role: UserRole): string {
  switch (role) {
    case "explorer":
    case "beta_tester":
      return "/";
    case "place_manager":
      return "/ops?tab=places";
    case "route_manager":
      return "/ops?tab=routes";
    case "community_manager":
      return "/ops?tab=community";
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
  return user.role === "super_admin" || user.role === "admin";
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
