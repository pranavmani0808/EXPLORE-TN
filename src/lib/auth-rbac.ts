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

export const MOCK_USERS: Record<string, UserProfile> = {
  super_admin: {
    id: "user-1",
    name: "Arun Kumar",
    email: "arun@explorertn.com",
    avatar: "AK",
    role: "super_admin",
    status: "active",
    rank: "Chief Architect & Super Admin",
    districtCount: 38,
  },
  place_manager: {
    id: "user-2",
    name: "Karthik Raja",
    email: "karthik.places@explorertn.com",
    avatar: "KR",
    role: "place_manager",
    status: "active",
    rank: "Ghat Place Verifier",
    districtCount: 14,
  },
  route_manager: {
    id: "user-3",
    name: "Deepa Sundaram",
    email: "deepa.routes@explorertn.com",
    avatar: "DS",
    role: "route_manager",
    status: "active",
    rank: "Nilgiri Route Lead",
    districtCount: 22,
  },
  community_manager: {
    id: "user-4",
    name: "Venkatesh M",
    email: "venkat.mod@explorertn.com",
    avatar: "VM",
    role: "community_manager",
    status: "active",
    rank: "Community Lead",
    districtCount: 19,
  },
  explorer: {
    id: "user-5",
    name: "Priya Ramesh",
    email: "priya@gmail.com",
    avatar: "PR",
    role: "explorer",
    status: "active",
    rank: "Weekend Explorer",
    districtCount: 8,
  },
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
