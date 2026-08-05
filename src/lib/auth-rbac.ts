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
  role: UserRole;
  status: "active" | "suspended" | "pending";
  rank: string;
  districtCount: number;
}

export const PERMISSION_MATRIX: Record<UserRole, Permission[]> = {
  explorer: [],
  beta_tester: [],
  place_manager: ["can_create_place", "can_edit_place", "can_verify_place"],
  route_manager: ["can_publish_route", "can_delete_route"],
  community_manager: ["can_moderate_community"],
  content_editor: ["can_create_place", "can_edit_place"],
  weather_manager: ["can_manage_weather"],
  analytics_manager: ["can_view_analytics"],
  ai_manager: ["can_manage_ai"],
  admin: [
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
      return "/ops?tab=overview";
    case "super_admin":
    default:
      return "/ops";
  }
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return PERMISSION_MATRIX[role]?.includes(permission) ?? false;
}

// REAL AUTH SESSION MANAGER (No Hardcoded Profiles)
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
  }
}

export function clearAuthSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("etn_auth_user");
  }
}
