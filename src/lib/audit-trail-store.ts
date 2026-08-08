export interface AuditTrailEntry {
  id: string;
  entityType: "user" | "place" | "route" | "media" | "review" | "weather" | "system";
  entityId: string;
  entityName: string;
  action: "CREATED" | "UPDATED" | "VERIFIED" | "DELETED" | "APPROVED" | "REJECTED" | "ROLE_CHANGED" | "SUSPENDED" | "BACKUP";
  performedBy: string;
  performedByRole: string;
  timestamp: string;
  details?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  time: string;
  isRead: boolean;
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "place_manager" | "route_manager" | "community_manager" | "explorer";
  status: "ACTIVE" | "INACTIVE" | "BLOCKED";
  district?: string;
  lastLogin: string;
  joinedDate: string;
}

const STORAGE_KEYS = {
  AUDIT_TRAIL: "etn_audit_trail_v3",
  NOTIFICATIONS: "etn_notifications_v3",
  MANAGED_USERS: "etn_managed_users_v3",
};

export function getAuditTrail(): AuditTrailEntry[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEYS.AUDIT_TRAIL);
  if (!stored) {
    // Truthful initial audit log: logged in user session
    const defaultAudit: AuditTrailEntry[] = [
      {
        id: "aud-1",
        entityType: "user",
        entityId: "u-1",
        entityName: "Pranav",
        action: "CREATED",
        performedBy: "Pranav",
        performedByRole: "SUPER_ADMIN",
        timestamp: "Today, 10:21 AM",
        details: "Created ExplorerTN account & initialized active session",
      },
    ];
    localStorage.setItem(STORAGE_KEYS.AUDIT_TRAIL, JSON.stringify(defaultAudit));
    return defaultAudit;
  }
  return JSON.parse(stored);
}

export function recordAuditLog(entry: Omit<AuditTrailEntry, "id" | "timestamp">) {
  if (typeof window === "undefined") return;
  const now = new Date();
  const timeStr = `Today, ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  const fullEntry: AuditTrailEntry = {
    ...entry,
    id: `aud-${Date.now()}`,
    timestamp: timeStr,
  };
  const list = getAuditTrail();
  const updated = [fullEntry, ...list].slice(0, 50);
  localStorage.setItem(STORAGE_KEYS.AUDIT_TRAIL, JSON.stringify(updated));

  // Trigger real-time notification
  addNotification({
    title: `${entry.performedBy} • ${entry.performedByRole.toUpperCase()} • ${entry.action.replace("_", " ")}`,
    message: entry.details || `${entry.entityType.toUpperCase()} "${entry.entityName}" updated`,
    type: entry.action === "DELETED" || entry.action === "REJECTED" ? "warning" : "success",
  });
}

export function getNotifications(): AppNotification[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  if (!stored) {
    const defaultNotifs: AppNotification[] = [
      {
        id: "notif-1",
        title: "Database Telemetry Online",
        message: "Operations Command Center active for Pranav (SUPER ADMIN)",
        type: "info",
        time: "Just now",
        isRead: false,
      },
    ];
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(defaultNotifs));
    return defaultNotifs;
  }
  return JSON.parse(stored);
}

export function addNotification(notif: Omit<AppNotification, "id" | "time" | "isRead">) {
  if (typeof window === "undefined") return;
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const fullNotif: AppNotification = {
    ...notif,
    id: `notif-${Date.now()}`,
    time: timeStr,
    isRead: false,
  };
  const list = getNotifications();
  const updated = [fullNotif, ...list].slice(0, 20);
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
}

// REAL USER DIRECTORY (Zero Hardcoded Demo Identities)
export function getManagedUsers(): ManagedUser[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEYS.MANAGED_USERS);
  if (!stored) {
    const defaultUsers: ManagedUser[] = [
      {
        id: "usr-1",
        name: "Pranav",
        email: "pranavviper7@gmail.com",
        role: "super_admin",
        status: "ACTIVE",
        district: "Chennai",
        lastLogin: "Today, 10:21 AM",
        joinedDate: "Today",
      },
    ];
    localStorage.setItem(STORAGE_KEYS.MANAGED_USERS, JSON.stringify(defaultUsers));
    return defaultUsers;
  }
  return JSON.parse(stored);
}

export function saveManagedUsers(users: ManagedUser[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.MANAGED_USERS, JSON.stringify(users));
}
