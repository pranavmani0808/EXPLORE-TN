import { addNotification, recordAuditLog } from "./audit-trail-store";
import { getCurrentAuthUser } from "./auth-rbac";

export interface PlaceVisit {
  id: string;
  userId: string;
  placeSlug: string;
  placeName: string;
  district: string;
  visitedAt: string;
  verificationMethod: "GPS Check-in" | "Manual Explorer Log";
}

export interface CommunityContribution {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  type: "photo" | "review" | "road_condition" | "hazard" | "location_report";
  placeSlug: string;
  placeName: string;
  title: string;
  content: string;
  mediaUrl?: string;
  rating?: number;
  status: "PENDING_MODERATION" | "APPROVED" | "REJECTED";
  submittedAt: string;
  moderatedBy?: string;
  moderatedAt?: string;
}

export interface AnalyticsEvent {
  id: string;
  eventType:
    | "SEARCH_STARTED"
    | "SEARCH_COMPLETED"
    | "PLACE_OPENED"
    | "ROUTE_OPENED"
    | "PLACE_SAVED"
    | "NAVIGATION_STARTED"
    | "VISIT_RECORDED"
    | "PHOTO_UPLOADED"
    | "REVIEW_SUBMITTED"
    | "REPORT_SUBMITTED";
  userId: string;
  userName: string;
  details?: string;
  timestamp: string;
}

const STORAGE_KEYS = {
  VISITS: "etn_user_visits_v3",
  CONTRIBUTIONS: "etn_community_contributions_v3",
  ANALYTICS: "etn_analytics_events_v3",
};

/* ==========================================================================
   1. VISITS ENGINE (Truthful Zero-Activity Initialization & Explicit Check-in)
   ========================================================================== */
export function getUserVisits(userId?: string): PlaceVisit[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEYS.VISITS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify([]));
    return [];
  }
  const allVisits: PlaceVisit[] = JSON.parse(stored);
  if (userId) {
    return allVisits.filter((v) => v.userId === userId);
  }
  return allVisits;
}

export function recordPlaceVisit(
  placeSlug: string,
  placeName: string,
  district: string,
  verificationMethod: "GPS Check-in" | "Manual Explorer Log" = "Manual Explorer Log"
): { success: boolean; isDuplicate: boolean; message: string; visit?: PlaceVisit } {
  if (typeof window === "undefined") return { success: false, isDuplicate: false, message: "Window unavailable" };
  const user = getCurrentAuthUser();
  if (!user) return { success: false, isDuplicate: false, message: "User not authenticated" };

  const existingVisits = getUserVisits();
  const alreadyVisited = existingVisits.some((v) => v.userId === user.id && v.placeSlug === placeSlug);

  if (alreadyVisited) {
    return {
      success: false,
      isDuplicate: true,
      message: `You have already logged your visit to "${placeName}".`,
    };
  }

  const now = new Date();
  const timeStr = `Today, ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

  const newVisit: PlaceVisit = {
    id: `vst-${Date.now()}`,
    userId: user.id,
    placeSlug,
    placeName,
    district,
    visitedAt: timeStr,
    verificationMethod,
  };

  const updatedVisits = [newVisit, ...existingVisits];
  localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(updatedVisits));

  // Record analytics event
  recordAnalyticsEvent("VISIT_RECORDED", `Visited ${placeName} (${district})`);

  // Dispatch persistent user notification
  addNotification({
    title: `🏆 Passport Stamp Unlocked: ${district}`,
    message: `Logged visit to "${placeName}". +1 Place added to your Explorer Passport.`,
    type: "success",
  });

  return {
    success: true,
    isDuplicate: false,
    message: `Visit to "${placeName}" recorded successfully! District stamp unlocked.`,
    visit: newVisit,
  };
}

/* ==========================================================================
   2. COMMUNITY CONTRIBUTIONS & MODERATION ENGINE
   ========================================================================== */
export function getCommunityContributions(): CommunityContribution[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEYS.CONTRIBUTIONS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.CONTRIBUTIONS, JSON.stringify([]));
    return [];
  }
  return JSON.parse(stored);
}

export function submitCommunityContribution(
  type: CommunityContribution["type"],
  placeSlug: string,
  placeName: string,
  title: string,
  content: string,
  mediaUrl?: string,
  rating?: number
): CommunityContribution {
  const user = getCurrentAuthUser();
  const now = new Date();
  const timeStr = `Today, ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

  const contribution: CommunityContribution = {
    id: `cnt-${Date.now()}`,
    userId: user?.id || "usr-guest",
    userName: user?.name || "Explorer",
    userRole: user?.role || "explorer",
    type,
    placeSlug,
    placeName,
    title,
    content,
    mediaUrl,
    rating,
    status: "PENDING_MODERATION",
    submittedAt: timeStr,
  };

  const list = getCommunityContributions();
  const updated = [contribution, ...list];
  localStorage.setItem(STORAGE_KEYS.CONTRIBUTIONS, JSON.stringify(updated));

  // Analytics event recording
  if (type === "photo") recordAnalyticsEvent("PHOTO_UPLOADED", `Photo submitted for ${placeName}`);
  else if (type === "review") recordAnalyticsEvent("REVIEW_SUBMITTED", `Review submitted for ${placeName}`);
  else recordAnalyticsEvent("REPORT_SUBMITTED", `${type.replace("_", " ")} report for ${placeName}`);

  addNotification({
    title: "Submission Sent for Review",
    message: `Your ${type.replace("_", " ")} for "${placeName}" has been submitted to the Operations Moderation Queue.`,
    type: "info",
  });

  return contribution;
}

export function moderateContribution(
  contributionId: string,
  newStatus: "APPROVED" | "REJECTED"
) {
  if (typeof window === "undefined") return;
  const list = getCommunityContributions();
  const user = getCurrentAuthUser();
  const actorName = user?.name || "Pranav";
  const actorRole = (user?.role || "super_admin").toUpperCase();

  const now = new Date();
  const timeStr = `Today, ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

  const updated = list.map((c) => {
    if (c.id === contributionId) {
      return {
        ...c,
        status: newStatus,
        moderatedBy: actorName,
        moderatedAt: timeStr,
      };
    }
    return c;
  });

  localStorage.setItem(STORAGE_KEYS.CONTRIBUTIONS, JSON.stringify(updated));

  const target = list.find((c) => c.id === contributionId);
  if (target) {
    recordAuditLog({
      entityType: "review",
      entityId: target.id,
      entityName: target.placeName,
      action: newStatus === "APPROVED" ? "APPROVED" : "REJECTED",
      performedBy: actorName,
      performedByRole: actorRole,
      details: `${actorName} • ${actorRole} • ${newStatus === "APPROVED" ? "Approved" : "Rejected"} ${target.type.replace("_", " ")} for "${target.placeName}" by ${target.userName}`,
    });

    addNotification({
      title: `Contribution ${newStatus === "APPROVED" ? "Approved" : "Reviewed"}`,
      message: `Your ${target.type.replace("_", " ")} for "${target.placeName}" was ${newStatus.toLowerCase()} by ${actorName}.`,
      type: newStatus === "APPROVED" ? "success" : "warning",
    });
  }
}

/* ==========================================================================
   3. REAL ANALYTICS TELEMETRY ENGINE
   ========================================================================== */
export function getAnalyticsEvents(): AnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify([]));
    return [];
  }
  return JSON.parse(stored);
}

export function recordAnalyticsEvent(eventType: AnalyticsEvent["eventType"], details?: string) {
  if (typeof window === "undefined") return;
  const user = getCurrentAuthUser();
  const now = new Date();
  const timeStr = `Today, ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

  const event: AnalyticsEvent = {
    id: `evt-${Date.now()}`,
    eventType,
    userId: user?.id || "guest",
    userName: user?.name || "Guest Explorer",
    details,
    timestamp: timeStr,
  };

  const list = getAnalyticsEvents();
  const updated = [event, ...list].slice(0, 200);
  localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(updated));
}
