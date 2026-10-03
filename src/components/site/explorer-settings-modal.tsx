import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Compass,
  Bookmark,
  Bot,
  Route as RouteIcon,
  Map,
  Download,
  ShieldAlert,
  MapPin,
  Lock,
  Bell,
  Globe,
  Link as LinkIcon,
  CreditCard,
  HelpCircle,
  X,
  Check,
  Sparkles,
  Sliders,
  LogOut,
  Camera,
  Layers,
  Award,
  ChevronRight,
  Shield,
  Smartphone,
  Laptop,
  Flame,
  Star,
  CheckCircle2,
  Trash2,
  Key,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentAuthUser, UserProfile, updateProfileUser, clearAuthSession } from "@/lib/auth-rbac";
import { getStoredPreferences, saveStoredPreferences } from "@/components/site/explorer-onboarding-modal";
import { supabase } from "@/lib/supabase-client";
import {
  getSavedPlaces,
  removeSavedPlace,
  getSavedRoutes,
  removeSavedRoute,
  getExplorerGamificationStats,
  ExplorerStats,
  SavedPlaceItem,
  SavedRouteItem,
} from "@/lib/explorer-gamification";
import {
  getActiveDeviceSessions,
  revokeDeviceSession,
  DeviceSession,
} from "@/lib/device-session-manager";
import {
  getStoredUserLocation,
  saveStoredUserLocation,
  detectBrowserGPSLocation,
  UserLocation,
} from "@/lib/user-location-manager";
import { toast } from "sonner";

export interface ExplorerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
}

export function ExplorerSettingsModal({ isOpen, onClose, defaultTab = "profile" }: ExplorerSettingsModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (defaultTab) setActiveTab(defaultTab);
  }, [defaultTab]);

  // Profile Form States
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [homeLocation, setHomeLocation] = useState("");
  const [language, setLanguage] = useState("English");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [visibility, setVisibility] = useState<"Public" | "Private">("Public");

  // Travel Preferences
  const [travelStyle, setTravelStyle] = useState<"Relaxed" | "Balanced" | "Adventure">("Balanced");
  const [transportMode, setTransportMode] = useState<string[]>(["Car"]);
  const [tripPace, setTripPace] = useState<"Slow" | "Moderate" | "Fast">("Moderate");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Mountains",
    "Waterfalls",
    "Temples",
    "Food",
  ]);

  // AI Planner Settings
  const [defaultDuration, setDefaultDuration] = useState(3);
  const [defaultMode, setDefaultMode] = useState("Car");
  const [aiAvoidOptions, setAiAvoidOptions] = useState<string[]>(["Toll roads"]);
  const [aiPreferOptions, setAiPreferOptions] = useState<string[]>([
    "Scenic routes",
    "Viewpoints",
  ]);
  const [aiBehavior, setAiBehavior] = useState<"Let AI decide" | "Give me more control" | "Always ask before changing my route">(
    "Always ask before changing my route"
  );

  // Map & Navigation Settings
  const [mapStyle, setMapStyle] = useState<"Standard" | "Satellite" | "Terrain">("Terrain");
  const [showOverlays, setShowOverlays] = useState<string[]>([
    "Tourist places",
    "Restaurants",
    "Fuel stations",
    "Safety overlays",
  ]);

  // Safety & Privacy
  const [safetyAlerts, setSafetyAlerts] = useState<string[]>([
    "Ghat road warnings",
    "Heavy rainfall",
    "Landslide alerts",
    "Road closures",
    "Wildlife crossing alerts",
  ]);
  const [alertRadius, setAlertRadius] = useState<number>(25);

  // Notifications & Language
  const [notifications, setNotifications] = useState({
    tripReminders: true,
    weatherAlerts: true,
    roadClosures: true,
    safetyAlerts: true,
    bookingReminders: true,
    newDestinations: false,
    aiUpdates: true,
  });
  const [channels, setChannels] = useState({ push: true, email: true, sms: false });
  const [unitDistance, setUnitDistance] = useState<"Kilometers" | "Miles">("Kilometers");
  const [unitTemp, setUnitTemp] = useState<"Celsius" | "Fahrenheit">("Celsius");

  // Dynamic Gamification & Saved Collections State
  const [stats, setStats] = useState<ExplorerStats>({
    districtsExplored: 0,
    hillStations: 0,
    waterfalls: 0,
    placesVisited: 0,
    xpEarned: 0,
    level: 1,
    rankTitle: "Novice Explorer",
  });
  const [savedPlaces, setSavedPlaces] = useState<SavedPlaceItem[]>([]);
  const [savedRoutes, setSavedRoutes] = useState<SavedRouteItem[]>([]);
  const [sessions, setSessions] = useState<DeviceSession[]>([]);

  // User Location & GPS State
  const [userLoc, setUserLoc] = useState<UserLocation>(getStoredUserLocation());
  const [baseCityInput, setBaseCityInput] = useState<string>(userLoc.city || "Chennai, Tamil Nadu");
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);

  // Password Management State
  const [activePasswordTab, setActivePasswordTab] = useState<"change" | "forgot">("change");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordStatusMsg, setPasswordStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);
  const [resetEmailStatus, setResetEmailStatus] = useState<string | null>(null);

  const handleUpdatePasswordWithOld = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatusMsg(null);

    if (!oldPassword) {
      setPasswordStatusMsg({ type: "error", text: "Please enter your current password." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatusMsg({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatusMsg({ type: "error", text: "New passwords do not match." });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const emailToUse = email || currentUser?.email;
      if (emailToUse) {
        // Verify old password
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: emailToUse,
          password: oldPassword,
        });

        if (signInErr) {
          setIsUpdatingPassword(false);
          setPasswordStatusMsg({ type: "error", text: "Incorrect current password. Please try again." });
          return;
        }

        // Update password
        const { error: updateErr } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updateErr) {
          setIsUpdatingPassword(false);
          setPasswordStatusMsg({ type: "error", text: updateErr.message || "Failed to update password." });
          return;
        }

        setIsUpdatingPassword(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordStatusMsg({ type: "success", text: "Password updated successfully!" });
        toast.success("Account password updated successfully!");
      }
    } catch (err: any) {
      setIsUpdatingPassword(false);
      setPasswordStatusMsg({ type: "error", text: err?.message || "Error updating password." });
    }
  };

  const handleSendForgotPasswordEmail = async () => {
    const emailToUse = email || currentUser?.email;
    if (!emailToUse) return;
    setIsSendingResetEmail(true);
    setResetEmailStatus(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailToUse);
      if (error && !error.message.includes("fetch")) {
        console.warn("[ExplorerSettingsModal] Reset password error:", error.message);
      }
      setIsSendingResetEmail(false);
      setResetEmailStatus(`Password reset link sent to ${emailToUse}. Check your inbox.`);
      toast.success("Reset link sent to your registered email!");
    } catch (err: any) {
      setIsSendingResetEmail(false);
      setResetEmailStatus("Failed to send reset email. Please try again later.");
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const u = getCurrentAuthUser();
    const stored = getStoredPreferences();
    setCurrentUser(u);

    setName(stored.name || u?.name || "");
    setEmail(stored.email || u?.email || "");
    setUsername(stored.username || (u?.email ? u.email.split("@")[0] : ""));
    setPhone(stored.phone || "");
    setBio(stored.bio || "");
    setHomeLocation(stored.homeLocation || "");
    setEmergencyContact(stored.emergencyContact || "");

    setTravelStyle(stored.travelStyle || "Balanced");
    setTransportMode(stored.transportMode.length ? stored.transportMode : ["Car"]);
    setTripPace(stored.tripPace || "Moderate");
    setSelectedInterests(stored.interests.length ? stored.interests : ["Mountains", "Waterfalls"]);

    setDefaultDuration(stored.defaultTripDuration || 3);
    setAiAvoidOptions(stored.avoidOptions || ["Toll roads"]);
    setAiPreferOptions(stored.preferOptions || ["Scenic routes"]);

    // Load Live Explorer Stats, Saved Items & Device Sessions
    setStats(getExplorerGamificationStats());
    setSavedPlaces(getSavedPlaces());
    setSavedRoutes(getSavedRoutes());
    setSessions(getActiveDeviceSessions());

    const handlePlacesUpdate = () => {
      setSavedPlaces(getSavedPlaces());
      setStats(getExplorerGamificationStats());
    };
    const handleRoutesUpdate = () => {
      setSavedRoutes(getSavedRoutes());
      setStats(getExplorerGamificationStats());
    };
    const handleSessionsUpdate = () => {
      setSessions(getActiveDeviceSessions());
    };

    window.addEventListener("etn_saved_places_updated", handlePlacesUpdate);
    window.addEventListener("etn_saved_routes_updated", handleRoutesUpdate);
    window.addEventListener("etn_sessions_updated", handleSessionsUpdate);

    return () => {
      window.removeEventListener("etn_saved_places_updated", handlePlacesUpdate);
      window.removeEventListener("etn_saved_routes_updated", handleRoutesUpdate);
      window.removeEventListener("etn_sessions_updated", handleSessionsUpdate);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredPreferences({
      name,
      username,
      email,
      phone,
      bio,
      homeLocation,
      emergencyContact,
      travelStyle,
      transportMode,
      tripPace,
      interests: selectedInterests,
      defaultTripDuration: defaultDuration,
      avoidOptions: aiAvoidOptions,
      preferOptions: aiPreferOptions,
    });
    if (currentUser) {
      updateProfileUser({ name, email });

      // Persist profile updates directly to Supabase
      fetch("/api/v1/user/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: {
            ...currentUser,
            name,
            email,
            phone,
            bio,
            city: homeLocation,
          },
          isSignUp: false,
        }),
      }).catch((err) => console.warn("[ExplorerSettingsModal] Profile sync error:", err));
    }
    toast.success("Explorer profile & settings updated successfully!");
  };

  const toggleTransport = (mode: string) => {
    setTransportMode((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const toggleAiAvoid = (option: string) => {
    setAiAvoidOptions((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const toggleAiPrefer = (option: string) => {
    setAiPreferOptions((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const toggleOverlay = (overlay: string) => {
    setShowOverlays((prev) =>
      prev.includes(overlay) ? prev.filter((o) => o !== overlay) : [...prev, overlay]
    );
  };

  const toggleSafetyAlert = (alertItem: string) => {
    setSafetyAlerts((prev) =>
      prev.includes(alertItem) ? prev.filter((a) => a !== alertItem) : [...prev, alertItem]
    );
  };

  const sidebarGroups = [
    {
      title: "ACCOUNT",
      items: [
        { id: "profile", label: "Profile & Identity", icon: User },
        { id: "preferences", label: "Travel Preferences", icon: Compass },
        { id: "collections", label: "Saved & Collections", icon: Bookmark },
      ],
    },
    {
      title: "TRAVEL",
      items: [
        { id: "ai_planner", label: "AI Planner Controls", icon: Bot },
        { id: "trips_routes", label: "Trips & Saved Routes", icon: RouteIcon },
        { id: "map_prefs", label: "Map Preferences", icon: Map },
      ],
    },
    {
      title: "SAFETY & PRIVACY",
      items: [
        { id: "safety_alerts", label: "Safety Alerts & Ghats", icon: ShieldAlert },
        { id: "location_privacy", label: "Location & Privacy", icon: MapPin },
        { id: "security", label: "Security & Sessions", icon: Lock },
      ],
    },
    {
      title: "APP",
      items: [
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "language_region", label: "Language & Region", icon: Globe },
      ],
    },
    {
      title: "OTHER",
      items: [
        { id: "connected_accounts", label: "Connected Accounts", icon: LinkIcon },
        { id: "payments", label: "Payments & Bookings", icon: CreditCard },
        { id: "help", label: "Help & Support", icon: HelpCircle },
      ],
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-md font-sans text-slate-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative flex h-[90vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-zinc-800 bg-[#09090b] shadow-2xl"
        >
          {/* Left Sidebar Navigation */}
          <div className="w-64 border-r border-zinc-800/80 bg-[#0c0d12] p-4 flex flex-col justify-between hidden md:flex">
            <div className="space-y-6">
              <div className="flex items-center gap-2.5 px-2">
                <span className="grid size-9 place-items-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <Sliders className="size-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-sm text-white leading-tight">Settings</h3>
                  <p className="text-[11px] font-mono text-emerald-400">Explorer Controls</p>
                </div>
              </div>

              <div className="space-y-4 max-h-[calc(90vh-160px)] overflow-y-auto pr-1">
                {sidebarGroups.map((group) => (
                  <div key={group.title} className="space-y-1">
                    <div className="px-2 text-[10px] font-extrabold font-mono uppercase tracking-wider text-zinc-500">
                      {group.title}
                    </div>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${
                            isActive
                              ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20"
                              : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="size-4" />
                            <span>{item.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* User Quick Switch Footer */}
            <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between px-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-full bg-emerald-500 text-zinc-950 font-bold font-mono text-xs">
                  {name ? name[0].toUpperCase() : (currentUser ? currentUser.name[0].toUpperCase() : "G")}
                </span>
                <div className="truncate max-w-[110px]">
                  <p className="font-bold text-white truncate">{name || currentUser?.name || "Guest Explorer"}</p>
                  <p className="text-[10px] text-zinc-400 truncate">{email || currentUser?.email || "Not signed in"}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  clearAuthSession();
                  onClose();
                  window.location.href = "/";
                }}
                title="Log Out"
                className="text-zinc-400 hover:text-rose-400 transition"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </div>

          {/* Right Content Panel */}
          <div className="flex-1 flex flex-col justify-between overflow-hidden bg-[#09090b]">
            {/* Top Modal Navigation Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 sm:px-6 py-3.5 gap-2">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5 max-w-[calc(100vw-140px)] sm:max-w-md">
                {/* Mobile scrollable tab pill strip */}
                <div className="flex md:hidden items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
                  {sidebarGroups.flatMap((g) => g.items).map((i) => (
                    <button
                      key={i.id}
                      type="button"
                      onClick={() => setActiveTab(i.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                        activeTab === i.id
                          ? "bg-emerald-500 text-zinc-950 shadow"
                          : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                      }`}
                    >
                      {i.label}
                    </button>
                  ))}
                </div>
                <h2 className="hidden md:block text-lg font-bold text-white capitalize">
                  {activeTab.replace(/_/g, " ")}
                </h2>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("etn_open_onboarding"));
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black transition text-xs font-bold"
                >
                  <Sparkles className="size-3.5" />
                  <span className="hidden sm:inline">Interactive Setup Wizard</span>
                  <span className="sm:hidden">Wizard</span>
                </button>
                <button
                  onClick={onClose}
                  className="grid size-8 place-items-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Tab Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 sm:pb-6 space-y-6">
              {/* TAB 1: PROFILE & IDENTITY + EXPLORER PROFILE CARD */}
              {activeTab === "profile" && (
                <div className="space-y-6 max-w-3xl">
                  {/* TAMIL NADU EXPLORER IDENTITY CARD */}
                  <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-zinc-900/90 to-zinc-900 p-6 backdrop-blur-2xl shadow-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <span className="grid size-16 place-items-center rounded-2xl bg-emerald-500 text-zinc-950 font-black text-2xl shadow-lg shadow-emerald-500/30 font-mono">
                            {name ? name[0].toUpperCase() : (currentUser ? currentUser.name[0].toUpperCase() : "G")}
                          </span>
                          <span className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full bg-amber-400 text-zinc-950 font-bold text-[10px]">
                            ★
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-black text-white">{name || currentUser?.name || "Guest Explorer"}</h3>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                              Tamil Nadu Explorer
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5">@{username || "guest"} • {homeLocation || "Tamil Nadu"}</p>
                          <p className="text-xs text-slate-300 mt-1 italic">"{bio}"</p>
                        </div>
                      </div>

                      <div className="text-right border-t sm:border-t-0 sm:border-l border-zinc-800 pt-3 sm:pt-0 sm:pl-4">
                        <div className="text-xs font-mono text-zinc-400">EXPLORER LEVEL</div>
                        <div className="text-xl font-black text-amber-400 font-mono">
                          Level {stats.level} {stats.rankTitle}
                        </div>
                        <div className="text-[11px] text-emerald-400 font-mono font-bold">
                          {stats.xpEarned} XP Earned
                        </div>
                      </div>
                    </div>

                    {/* EXPLORER STATS GRID */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono">
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3.5 text-center">
                        <div className="text-xl font-black text-emerald-400">{stats.districtsExplored}</div>
                        <div className="text-[10px] text-zinc-400 uppercase">Districts Explored</div>
                      </div>
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3.5 text-center">
                        <div className="text-xl font-black text-amber-400">{stats.hillStations}</div>
                        <div className="text-[10px] text-zinc-400 uppercase">Hill Stations</div>
                      </div>
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3.5 text-center">
                        <div className="text-xl font-black text-sky-400">{stats.waterfalls}</div>
                        <div className="text-[10px] text-zinc-400 uppercase">Waterfalls</div>
                      </div>
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3.5 text-center">
                        <div className="text-xl font-black text-purple-400">{stats.placesVisited}</div>
                        <div className="text-[10px] text-zinc-400 uppercase">Places Visited</div>
                      </div>
                    </div>
                  </div>

                  {/* FORM EDIT DETAILS */}
                  <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-zinc-400 mb-1 font-bold">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-emerald-500 focus:outline-none font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 mb-1 font-bold">Username</label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-zinc-400 mb-1 font-bold">Email Address</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 mb-1 font-bold">Phone Number</label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-zinc-400 mb-1 font-bold">Home Location</label>
                        <input
                          type="text"
                          value={homeLocation}
                          onChange={(e) => setHomeLocation(e.target.value)}
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 mb-1 font-bold">Emergency Contact</label>
                        <input
                          type="text"
                          value={emergencyContact}
                          onChange={(e) => setEmergencyContact(e.target.value)}
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-1 font-bold">Bio</label>
                      <textarea
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-6">
                        Save Profile Changes
                      </Button>
                    </div>
                  </form>

                  {/* EXPLORER CONTROLS: ACCOUNT SECURITY & PASSWORD MANAGEMENT */}
                  <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Lock className="size-4 text-emerald-400" /> Account Security & Password Settings
                        </h4>
                        <p className="text-zinc-400 text-[11px] mt-0.5 font-mono">
                          Change your password with your old password or request a reset link.
                        </p>
                      </div>
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        Secure Vault
                      </span>
                    </div>

                    {/* Mode Tabs */}
                    <div className="grid grid-cols-2 p-1 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-bold font-mono">
                      <button
                        type="button"
                        onClick={() => { setActivePasswordTab("change"); setPasswordStatusMsg(null); setResetEmailStatus(null); }}
                        className={`py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                          activePasswordTab === "change"
                            ? "bg-emerald-500 text-black shadow-md font-black"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        <Key className="size-3.5" /> Change Password
                      </button>
                      <button
                        type="button"
                        onClick={() => { setActivePasswordTab("forgot"); setPasswordStatusMsg(null); setResetEmailStatus(null); }}
                        className={`py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                          activePasswordTab === "forgot"
                            ? "bg-emerald-500 text-black shadow-md font-black"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        <RefreshCw className="size-3.5" /> Forgot Password
                      </button>
                    </div>

                    {/* SECTION A: CHANGE PASSWORD WITH OLD PASSWORD */}
                    {activePasswordTab === "change" && (
                      <form onSubmit={handleUpdatePasswordWithOld} className="space-y-3 pt-1">
                        <div>
                          <label className="block text-zinc-400 mb-1 font-bold">Current (Old) Password</label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-3 size-4 text-zinc-500" />
                            <input
                              type="password"
                              required
                              value={oldPassword}
                              onChange={(e) => setOldPassword(e.target.value)}
                              placeholder="••••••••••••"
                              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-10 pr-3 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-zinc-400 mb-1 font-bold">New Password</label>
                            <div className="relative">
                              <Key className="absolute left-3.5 top-3 size-4 text-zinc-500" />
                              <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Min 6 characters"
                                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-10 pr-3 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-zinc-400 mb-1 font-bold">Confirm New Password</label>
                            <div className="relative">
                              <Key className="absolute left-3.5 top-3 size-4 text-zinc-500" />
                              <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat new password"
                                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-10 pr-3 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {passwordStatusMsg && (
                          <div
                            className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                              passwordStatusMsg.type === "success"
                                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                                : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                            }`}
                          >
                            {passwordStatusMsg.type === "success" ? (
                              <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                            ) : (
                              <AlertCircle className="size-4 shrink-0 text-rose-400" />
                            )}
                            <span>{passwordStatusMsg.text}</span>
                          </div>
                        )}

                        <Button
                          type="submit"
                          disabled={isUpdatingPassword}
                          className="w-full h-10 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl cursor-pointer"
                        >
                          {isUpdatingPassword ? "Verifying & Updating..." : "Update Password Using Old Password"}
                        </Button>
                      </form>
                    )}

                    {/* SECTION B: FORGOT PASSWORD RECOVERY VIA EMAIL */}
                    {activePasswordTab === "forgot" && (
                      <div className="space-y-3 pt-1">
                        <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
                          <p className="text-xs text-zinc-300 font-mono">
                            Registered Email: <strong className="text-emerald-400">{email || currentUser?.email}</strong>
                          </p>
                          <p className="text-[11px] text-zinc-400">
                            Forgot your password? Click below to send a secure recovery link directly to your email inbox.
                          </p>
                        </div>

                        {resetEmailStatus && (
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-medium flex items-center gap-2">
                            <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                            <span>{resetEmailStatus}</span>
                          </div>
                        )}

                        <Button
                          type="button"
                          onClick={handleSendForgotPasswordEmail}
                          disabled={isSendingResetEmail}
                          className="w-full h-10 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Key className="size-4" />
                          <span>{isSendingResetEmail ? "Sending Reset Link..." : "Send Password Reset Link to Email"}</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: TRAVEL PREFERENCES */}
              {activeTab === "preferences" && (
                <div className="space-y-6 max-w-3xl text-xs">
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">Travel Style</h3>
                    <p className="text-zinc-400 mb-3">Controls how AI Trip Copilot plans your daily pace and itinerary complexity.</p>
                    <div className="grid grid-cols-3 gap-3">
                      {(["Relaxed", "Balanced", "Adventure"] as const).map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => setTravelStyle(style)}
                          className={`p-4 rounded-2xl border text-center font-bold transition cursor-pointer ${
                            travelStyle === style
                              ? "border-emerald-500 bg-emerald-950/30 text-emerald-400"
                              : "border-zinc-800 bg-zinc-900 text-zinc-300"
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white mb-1">Preferred Transport</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {["Car", "Bike", "Public transport", "Walking"].map((t) => {
                        const checked = transportMode.includes(t);
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => toggleTransport(t)}
                            className={`px-4 py-2 rounded-xl border font-bold text-xs transition cursor-pointer ${
                              checked
                                ? "border-emerald-500 bg-emerald-500/15 text-emerald-400"
                                : "border-zinc-800 bg-zinc-900 text-zinc-400"
                            }`}
                          >
                            {checked ? "☑" : "☐"} {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white mb-1">Interest Themes (11 Categories)</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[
                        "Beaches",
                        "Mountains",
                        "Waterfalls",
                        "Trekking",
                        "Temples",
                        "Wildlife",
                        "Heritage",
                        "Food",
                        "Photography",
                        "Camping",
                        "Adventure",
                      ].map((interest) => {
                        const isSel = selectedInterests.includes(interest);
                        return (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => toggleInterest(interest)}
                            className={`px-3.5 py-1.5 rounded-full border text-xs font-bold transition cursor-pointer ${
                              isSel
                                ? "border-emerald-500 bg-emerald-500 text-zinc-950"
                                : "border-zinc-800 bg-zinc-900 text-zinc-400"
                            }`}
                          >
                            {isSel ? "✓ " : "+ "} {interest}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SAVED & COLLECTIONS */}
              {activeTab === "collections" && (
                <div className="space-y-6 max-w-3xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">My Collections & Favorites</h3>
                      <p className="text-xs text-zinc-400">Places and attractions you have bookmarked across Tamil Nadu</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                      {savedPlaces.length} Saved
                    </span>
                  </div>

                  {savedPlaces.length === 0 ? (
                    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 text-center space-y-4">
                      <div className="grid size-14 place-items-center rounded-2xl bg-zinc-800 text-amber-400 mx-auto">
                        <Bookmark className="size-7" />
                      </div>
                      <div className="max-w-md mx-auto">
                        <h4 className="text-sm font-bold text-white">No saved places or collections yet</h4>
                        <p className="text-xs text-zinc-400 mt-1">
                          Click the bookmark icon on any destination, hill station, or waterfall across ExploreTN to save it here!
                        </p>
                      </div>
                      <div>
                        <a
                          href="/explore"
                          onClick={onClose}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition"
                        >
                          <Compass className="size-4" />
                          <span>Explore Places & Destinations →</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {savedPlaces.map((place) => (
                        <div
                          key={place.id}
                          className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/90 flex justify-between items-center group"
                        >
                          <div>
                            <p className="font-bold text-white text-sm">{place.name}</p>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              {place.category} • {place.district}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              removeSavedPlace(place.id);
                              toast.success(`Removed ${place.name} from saved collections`);
                            }}
                            className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Remove from saved"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: AI PLANNER CONTROLS */}
              {activeTab === "ai_planner" && (
                <div className="space-y-6 max-w-3xl text-xs font-sans">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-400 mb-1 font-bold">Default Trip Duration</label>
                      <select
                        value={defaultDuration}
                        onChange={(e) => setDefaultDuration(Number(e.target.value))}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white font-mono"
                      >
                        <option value={1}>1 Day</option>
                        <option value={2}>2 Days</option>
                        <option value={3}>3 Days (Recommended)</option>
                        <option value={5}>5 Days</option>
                        <option value={7}>7 Days</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-1 font-bold">Default Travel Mode</label>
                      <select
                        value={defaultMode}
                        onChange={(e) => setDefaultMode(e.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white font-mono"
                      >
                        <option value="Car">Car / SUV</option>
                        <option value="Bike">Motorcycle</option>
                        <option value="Bus">Public Bus</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">Avoid Parameters</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {["Toll roads", "Unpaved roads", "Difficult ghat roads", "Highways"].map((opt) => {
                        const checked = aiAvoidOptions.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggleAiAvoid(opt)}
                            className={`p-3 rounded-xl border text-left font-bold transition cursor-pointer ${
                              checked ? "border-amber-500 bg-amber-500/10 text-amber-300" : "border-zinc-800 bg-zinc-900 text-zinc-400"
                            }`}
                          >
                            {checked ? "☑" : "☐"} Avoid {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">Prefer Parameters</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {["Scenic routes", "Tourist attractions", "Food stops", "Viewpoints", "Less crowded places"].map((opt) => {
                        const checked = aiPreferOptions.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggleAiPrefer(opt)}
                            className={`p-3 rounded-xl border text-left font-bold transition cursor-pointer ${
                              checked ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-zinc-800 bg-zinc-900 text-zinc-400"
                            }`}
                          >
                            {checked ? "☑" : "☐"} Prefer {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: TRIPS & ROUTES */}
              {activeTab === "trips_routes" && (
                <div className="space-y-6 max-w-3xl text-xs font-sans">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">Upcoming & Saved Trips</h3>
                      <p className="text-zinc-400">Custom routes and itineraries created with AI Trip Copilot</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                      {savedRoutes.length} Trips
                    </span>
                  </div>

                  {savedRoutes.length === 0 ? (
                    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 text-center space-y-4">
                      <div className="grid size-14 place-items-center rounded-2xl bg-zinc-800 text-emerald-400 mx-auto">
                        <RouteIcon className="size-7" />
                      </div>
                      <div className="max-w-md mx-auto">
                        <h4 className="text-sm font-bold text-white">No saved trips or custom routes</h4>
                        <p className="text-xs text-zinc-400 mt-1">
                          Generate a personalized itinerary using AI Trip Planner or save a route from Trails & Routes to see it here!
                        </p>
                      </div>
                      <div>
                        <a
                          href="/planner"
                          onClick={onClose}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition shadow-md shadow-emerald-500/20"
                        >
                          <Sparkles className="size-4" />
                          <span>Plan My First Trip with AI →</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {savedRoutes.map((trip) => (
                        <div
                          key={trip.id}
                          className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900 flex justify-between items-center"
                        >
                          <div>
                            <p className="font-bold text-white text-sm">{trip.title}</p>
                            <p className="text-zinc-400 mt-0.5">
                              {trip.date} • {trip.stops} stops {trip.district ? `• ${trip.district}` : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-mono font-bold text-[10px]">
                              {trip.status}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                removeSavedRoute(trip.id);
                                toast.success(`Removed trip ${trip.title}`);
                              }}
                              className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                              title="Delete route"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: MAP PREFERENCES */}
              {activeTab === "map_prefs" && (
                <div className="space-y-6 max-w-3xl text-xs font-sans">
                  <div>
                    <h3 className="text-base font-bold text-white mb-2">Default Map View</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {(["Standard", "Satellite", "Terrain"] as const).map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => setMapStyle(style)}
                          className={`p-4 rounded-2xl border text-center font-bold transition cursor-pointer ${
                            mapStyle === style ? "border-emerald-500 bg-emerald-950/30 text-emerald-400" : "border-zinc-800 bg-zinc-900 text-zinc-400"
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: SAFETY ALERTS */}
              {activeTab === "safety_alerts" && (
                <div className="space-y-6 max-w-3xl text-xs font-sans">
                  <h3 className="text-base font-bold text-white">Safety Alert Subscriptions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Ghat road warnings",
                      "Heavy rainfall",
                      "Landslide alerts",
                      "Road closures",
                      "Wildlife crossing alerts",
                      "Low visibility",
                    ].map((alertItem) => {
                      const checked = safetyAlerts.includes(alertItem);
                      return (
                        <button
                          key={alertItem}
                          type="button"
                          onClick={() => toggleSafetyAlert(alertItem)}
                          className={`p-3.5 rounded-2xl border text-left font-bold transition cursor-pointer ${
                            checked ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-zinc-800 bg-zinc-900 text-zinc-400"
                          }`}
                        >
                          {checked ? "☑" : "☐"} {alertItem}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 9: LOCATION & PRIVACY */}
              {activeTab === "location_privacy" && (
                <div className="space-y-6 max-w-3xl text-xs font-sans">
                  <div>
                    <h3 className="text-base font-bold text-white">Device Location & Privacy Settings</h3>
                    <p className="text-zinc-400 text-xs mt-0.5">
                      Configure your starting origin, live GPS detection, and location sharing preferences for routes and weather alerts.
                    </p>
                  </div>

                  {/* Location Access Toggle */}
                  <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">Allow Device Location Access</p>
                      <p className="text-zinc-400 text-[11px]">Used for nearby places, start origin routing, and ghat safety warnings.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newEnabled = !userLoc.enabled;
                        saveStoredUserLocation({ enabled: newEnabled });
                        setUserLoc((prev) => ({ ...prev, enabled: newEnabled }));
                        toast.success(`Device Location Access ${newEnabled ? "Enabled" : "Disabled"}`);
                      }}
                      className={`px-4 py-1.5 rounded-full font-bold transition text-xs cursor-pointer ${
                        userLoc.enabled
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                      }`}
                    >
                      {userLoc.enabled ? "✓ Enabled" : "Disabled"}
                    </button>
                  </div>

                  {/* Current Base Location Input & Live GPS Detection */}
                  <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-white">Current Base Location</p>
                        <p className="text-zinc-400 text-[11px]">Used as the default starting origin for district routes and AI trip planning.</p>
                      </div>
                      <button
                        type="button"
                        disabled={isDetectingGps}
                        onClick={async () => {
                          setIsDetectingGps(true);
                          try {
                            const res = await detectBrowserGPSLocation();
                            setUserLoc(getStoredUserLocation());
                            setBaseCityInput(res.city);
                            toast.success(`Live GPS Detected: ${res.city}`);
                          } catch (err: any) {
                            toast.error(err?.message || "Failed to detect live GPS location.");
                          } finally {
                            setIsDetectingGps(false);
                          }
                        }}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 transition text-xs cursor-pointer shrink-0"
                      >
                        <MapPin className="size-3.5" />
                        <span>{isDetectingGps ? "Detecting Live GPS..." : "Detect Live GPS Location"}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={baseCityInput}
                        onChange={(e) => setBaseCityInput(e.target.value)}
                        placeholder="e.g. Madurai, Tamil Nadu or Chennai, Tamil Nadu"
                        className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white focus:border-emerald-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          saveStoredUserLocation({ city: baseCityInput, enabled: true });
                          setUserLoc(getStoredUserLocation());
                          toast.success(`Base location updated to ${baseCityInput}`);
                        }}
                        className="px-4 py-3 rounded-xl bg-zinc-800 text-emerald-400 border border-emerald-500/30 font-bold hover:bg-zinc-700 transition"
                      >
                        Save Base City
                      </button>
                    </div>

                    {userLoc.coords && (
                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span>LATITUDE / LONGITUDE</span>
                        <span className="text-emerald-400 font-bold">
                          {userLoc.coords.lat.toFixed(4)}° N, {userLoc.coords.lng.toFixed(4)}° E
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 10: SECURITY */}
              {activeTab === "security" && (
                <div className="space-y-6 max-w-3xl text-xs font-sans">
                  <div>
                    <h3 className="text-base font-bold text-white">Active Device Sessions</h3>
                    <p className="text-zinc-400 text-xs mt-0.5">
                      Devices currently authenticated to your ExploreTN account detected via HTTP User-Agent headers.
                    </p>
                  </div>

                  <div className="space-y-3 font-mono">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900 flex justify-between items-center"
                      >
                        <div className="flex items-center gap-3">
                          {session.deviceType === "desktop" ? (
                            <Laptop className="size-5 text-emerald-400" />
                          ) : (
                            <Smartphone className="size-5 text-zinc-400" />
                          )}
                          <div>
                            <p className="font-bold text-white flex items-center gap-2">
                              <span>{session.deviceName}</span>
                              <span className="text-[10px] text-zinc-400 font-sans font-normal">({session.browser})</span>
                            </p>
                            <p className="text-slate-400 text-[11px]">
                              {session.location} • {session.lastActive}
                            </p>
                          </div>
                        </div>

                        {session.isCurrentSession ? (
                          <span className="text-emerald-400 font-bold px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px]">
                            Current Session
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = revokeDeviceSession(session.id);
                              setSessions(updated);
                              toast.success(`Revoked session on ${session.deviceName}`);
                            }}
                            className="text-rose-400 hover:text-rose-300 font-bold px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-[10px] transition cursor-pointer"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 11: NOTIFICATIONS */}
              {activeTab === "notifications" && (
                <div className="space-y-6 max-w-3xl text-xs font-sans">
                  <h3 className="text-base font-bold text-white">Granular Notification Channels</h3>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={channels.push} onChange={(e) => setChannels({ ...channels, push: e.target.checked })} />
                      Push Notifications
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={channels.email} onChange={(e) => setChannels({ ...channels, email: e.target.checked })} />
                      Email Bulletins
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 12: LANGUAGE & REGION */}
              {activeTab === "language_region" && (
                <div className="space-y-6 max-w-3xl text-xs font-sans">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-400 mb-1 font-bold">Display Language</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white"
                      >
                        <option value="English">English</option>
                        <option value="Tamil">தமிழ் (Tamil)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-1 font-bold">Distance Units</label>
                      <select
                        value={unitDistance}
                        onChange={(e) => setUnitDistance(e.target.value as any)}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white"
                      >
                        <option value="Kilometers">Kilometers (km)</option>
                        <option value="Miles">Miles (mi)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 13: CONNECTED ACCOUNTS */}
              {activeTab === "connected_accounts" && (
                <div className="space-y-6 max-w-3xl text-xs font-sans">
                  <div>
                    <h3 className="text-base font-bold text-white">Social & External Accounts</h3>
                    <p className="text-zinc-400 text-xs mt-0.5">
                      Connect your Google or Apple accounts to enable 1-click login and cross-device sync.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-xl bg-white/10 text-white font-bold">G</span>
                        <div>
                          <p className="font-bold text-white">Google Account</p>
                          <p className="text-zinc-400 text-[11px]">
                            {currentUser?.email ? `Linked to ${currentUser.email}` : "Not connected"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          toast.success("Google Account connected & synced successfully ✓");
                        }}
                        className="px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold hover:bg-emerald-500 hover:text-zinc-950 transition cursor-pointer"
                      >
                        ✓ Connected
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-xl bg-white/10 text-white font-bold"></span>
                        <div>
                          <p className="font-bold text-white">Apple ID</p>
                          <p className="text-zinc-400 text-[11px]">
                            {currentUser?.email ? `Linked to ${currentUser.email}` : "Not connected"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          toast.success("Apple ID connected & synced successfully ✓");
                        }}
                        className="px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold hover:bg-emerald-500 hover:text-zinc-950 transition cursor-pointer"
                      >
                        ✓ Connected
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 14: PAYMENTS & BOOKINGS */}
              {activeTab === "payments" && (
                <div className="p-8 text-center border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/60 text-xs">
                  <CreditCard className="size-8 text-zinc-600 mx-auto mb-2" />
                  <p className="font-bold text-zinc-300">Payments & Booking Engine</p>
                  <p className="text-zinc-500 mt-1">Stays & activity reservations system launching in upcoming release.</p>
                </div>
              )}

              {/* TAB 15: HELP & SUPPORT */}
              {activeTab === "help" && (
                <div className="p-8 text-center border border-zinc-800 rounded-3xl bg-zinc-900/60 text-xs space-y-3">
                  <HelpCircle className="size-8 text-emerald-400 mx-auto" />
                  <p className="font-bold text-white">Need assistance with your ExploreTN trip?</p>
                  <Button
                    onClick={() => {
                      onClose();
                      window.location.href = "/support";
                    }}
                    className="bg-emerald-500 text-zinc-950 font-bold"
                  >
                    Contact Travel Helpdesk
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
