export interface DeviceSession {
  id: string;
  deviceName: string;
  browser: string;
  deviceType: "desktop" | "mobile" | "tablet";
  location: string;
  lastActive: string;
  isCurrentSession: boolean;
}

export function detectCurrentDevice(): Omit<DeviceSession, "id"> {
  if (typeof window === "undefined") {
    return {
      deviceName: "Unknown Device",
      browser: "Web Browser",
      deviceType: "desktop",
      location: "Chennai, TN",
      lastActive: "Active Now",
      isCurrentSession: true,
    };
  }

  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";

  let os = "Desktop PC";
  let deviceType: "desktop" | "mobile" | "tablet" = "desktop";

  if (/Mac/i.test(platform) || /Macintosh/i.test(ua)) {
    os = "MacBook Pro (macOS)";
    deviceType = "desktop";
  } else if (/iPhone/i.test(ua)) {
    os = "iPhone (iOS)";
    deviceType = "mobile";
  } else if (/iPad/i.test(ua)) {
    os = "iPad (iPadOS)";
    deviceType = "tablet";
  } else if (/Android/i.test(ua)) {
    os = /Mobile/i.test(ua) ? "Android Phone" : "Android Tablet";
    deviceType = /Mobile/i.test(ua) ? "mobile" : "tablet";
  } else if (/Win/i.test(platform) || /Windows/i.test(ua)) {
    os = "Windows PC (Windows)";
    deviceType = "desktop";
  } else if (/Linux/i.test(platform) || /Linux/i.test(ua)) {
    os = "Linux Workstation";
    deviceType = "desktop";
  }

  // Detect Browser
  let browser = "Web Browser";
  if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) {
    browser = "Google Chrome";
  } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
    browser = "Apple Safari";
  } else if (/Firefox/i.test(ua)) {
    browser = "Mozilla Firefox";
  } else if (/Edg/i.test(ua)) {
    browser = "Microsoft Edge";
  }

  // Timezone / Regional Location Indicator
  let location = "Chennai, Tamil Nadu";
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.includes("Kolkata") || tz.includes("Asia")) {
      location = "Chennai, TN";
    } else {
      location = tz.split("/")[1]?.replace("_", " ") || "India";
    }
  } catch {
    // fallback
  }

  return {
    deviceName: os,
    browser,
    deviceType,
    location,
    lastActive: "Active Now",
    isCurrentSession: true,
  };
}

export function getActiveDeviceSessions(): DeviceSession[] {
  if (typeof window === "undefined") return [];

  const current = detectCurrentDevice();
  const currentSessionObj: DeviceSession = {
    id: "session_current",
    ...current,
  };

  try {
    const raw = localStorage.getItem("etn_active_sessions");
    if (raw) {
      const parsed: DeviceSession[] = JSON.parse(raw);
      // Ensure current session is always updated at top
      const others = parsed.filter((s) => !s.isCurrentSession);
      return [currentSessionObj, ...others];
    }
  } catch {
    // fallback
  }

  // Initial default fallback secondary session (for testing revoke feature)
  const defaultSessions: DeviceSession[] = [
    currentSessionObj,
    {
      id: "session_mobile_01",
      deviceName: current.deviceType === "mobile" ? "MacBook Pro (macOS)" : "iPhone 15 Pro",
      browser: current.deviceType === "mobile" ? "Apple Safari" : "Safari Mobile",
      deviceType: current.deviceType === "mobile" ? "desktop" : "mobile",
      location: "Chennai, TN",
      lastActive: "Last active 2 hours ago",
      isCurrentSession: false,
    },
  ];

  localStorage.setItem("etn_active_sessions", JSON.stringify(defaultSessions));
  return defaultSessions;
}

export function revokeDeviceSession(id: string): DeviceSession[] {
  if (typeof window === "undefined") return [];
  const all = getActiveDeviceSessions();
  const updated = all.filter((s) => s.id !== id);
  localStorage.setItem("etn_active_sessions", JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("etn_sessions_updated", { detail: updated }));
  return updated;
}
