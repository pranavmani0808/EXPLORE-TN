export interface AuditTrailEntry {
  id: string;
  entityType: "user" | "place" | "route" | "media" | "review" | "weather" | "system";
  entityId: string;
  entityName: string;
  action: "CREATED" | "UPDATED" | "VERIFIED" | "DELETED" | "APPROVED" | "REJECTED" | "ROLE_CHANGED" | "BACKUP";
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
  AUDIT_TRAIL: "etn_audit_trail_v2",
  NOTIFICATIONS: "etn_notifications_v2",
  MANAGED_USERS: "etn_managed_users_v2",
};

export function getAuditTrail(): AuditTrailEntry[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEYS.AUDIT_TRAIL);
  if (!stored) {
    const defaultAudit: AuditTrailEntry[] = [
      {
        id: "aud-1",
        entityType: "user",
        entityId: "u-1",
        entityName: "Pranav",
        action: "CREATED",
        performedBy: "Pranav",
        performedByRole: "Super Admin",
        timestamp: "10:21 AM",
        details: "Created ExplorerTN account & initiated active session",
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
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const fullEntry: AuditTrailEntry = {
    ...entry,
    id: `aud-${Date.now()}`,
    timestamp: timeStr,
  };
  const list = getAuditTrail();
  const updated = [fullEntry, ...list].slice(0, 50);
  localStorage.setItem(STORAGE_KEYS.AUDIT_TRAIL, JSON.stringify(updated));

  // Also trigger a notification
  addNotification({
    title: `${entry.performedBy} ${entry.action.toLowerCase()} ${entry.entityName}`,
    message: entry.details || `${entry.entityType.toUpperCase()} action recorded`,
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
        title: "Session Initiated",
        message: "Operations Command Center active",
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
        lastLogin: "Today 09:12",
        joinedDate: "Today",
      },
      {
        id: "usr-2",
        name: "Arun Kumar",
        email: "admin@exploretn.com",
        role: "super_admin",
        status: "ACTIVE",
        district: "Nilgiris",
        lastLogin: "Today 09:15",
        joinedDate: "Yesterday",
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
