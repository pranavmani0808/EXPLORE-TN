import { useState, useEffect } from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldAlert,
  MapPin,
  Route as RouteIcon,
  Users,
  Sparkles,
  CloudRain,
  BarChart3,
  FolderKanban,
  CheckCircle2,
  Plus,
  Search,
  Activity,
  Server,
  Settings,
  Bookmark,
  Compass,
  Download,
  Radio,
  Layout,
  Lock,
  ArrowLeft,
  Shield,
  LogIn,
} from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import { UserRole, UserProfile, getCurrentAuthUser, clearAuthSession } from "@/lib/auth-rbac";
import { PlacesManagementModule } from "@/components/admin/places-management-module";
import { RoutesManagementModule } from "@/components/admin/routes-management-module";
import { MediaLibraryModule } from "@/components/admin/media-library-module";
import { CMSBuilderModule } from "@/components/admin/cms-builder-module";
import { CommunityModerationModule } from "@/components/admin/community-moderation-module";
import { WeatherOperationsModule } from "@/components/admin/weather-operations-module";
import { AIOperationsModule } from "@/components/admin/ai-operations-module";
import { ContentHealthModule } from "@/components/admin/content-health-module";

export const Route = createFileRoute("/ops")({
  head: () => ({
    meta: [
      { title: "ExplorerTN Operations Center — Full Platform" },
      {
        name: "description",
        content: "Production Geospatial Operations Platform for ExplorerTN. Places, Routes, DAM, CMS, Moderation, Weather, AI Control Room.",
      },
    ],
  }),
  component: OperationsWorkspacePage,
});

interface SidebarGroup {
  groupLabel: string;
  items: { id: string; label: string; icon: any; badge?: number }[];
}

const FINAL_OPERATIONS_GROUPS: SidebarGroup[] = [
  {
    groupLabel: "DASHBOARD",
    items: [
      { id: "overview", label: "Executive Dashboard", icon: BarChart3 },
      { id: "health", label: "Content Health Audit", icon: Activity, badge: 38 },
    ],
  },
  {
    groupLabel: "CONTENT WORKFLOWS",
    items: [
      { id: "places", label: "Places GIS Manager", icon: MapPin, badge: 12 },
      { id: "routes", label: "Routes GIS Editor", icon: RouteIcon },
      { id: "media", label: "Media Library (DAM)", icon: FolderKanban },
      { id: "cms", label: "Visual CMS & Stories", icon: Layout },
    ],
  },
  {
    groupLabel: "COMMUNITY WORKFLOWS",
    items: [
      { id: "users", label: "Users & Roles (RBAC)", icon: Users },
      { id: "moderation", label: "Moderation Queue", icon: ShieldAlert, badge: 5 },
    ],
  },
  {
    groupLabel: "INTELLIGENCE WORKFLOWS",
    items: [
      { id: "ai", label: "AI Operations", icon: Sparkles },
      { id: "weather", label: "Weather Operations", icon: CloudRain, badge: 2 },
      { id: "analytics", label: "Platform Analytics", icon: Activity },
    ],
  },
  {
    groupLabel: "PLATFORM CONTROL",
    items: [{ id: "settings", label: "Platform Settings", icon: Settings }],
  },
];

function OperationsWorkspacePage() {
  const searchParams: any = useSearch({ strict: false });
  const initialTab = searchParams?.tab || "health";

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const sessionUser = getCurrentAuthUser();
    setCurrentUser(sessionUser);
    setIsLoaded(true);
  }, []);

  const handleSignOut = () => {
    clearAuthSession();
    window.location.href = "/login";
  };

  // RBAC ACCESS GUARD:
  // If not authenticated or role is 'explorer' / 'beta_tester', DENY ACCESS to /ops!
  const isUnauthorized =
    isLoaded &&
    (!currentUser || currentUser.role === "explorer" || currentUser.role === "beta_tester");

  if (!isLoaded) {
    return (
      <AppShell>
        <div className="min-h-[60vh] flex items-center justify-center font-mono text-slate-400 text-xs">
          Verifying RBAC Permissions...
        </div>
      </AppShell>
    );
  }

  if (isUnauthorized) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md px-4 pt-36 pb-24 font-sans">
          <div className="bg-[#121821] border border-rose-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-5 text-white relative overflow-hidden">
            <div className="inline-flex size-16 place-items-center rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Lock className="size-8 text-rose-400" />
            </div>

            <div>
              <span className="px-3 py-1 bg-rose-500/20 text-rose-400 font-mono text-[10px] font-bold rounded-full border border-rose-500/30 uppercase">
                403 Access Denied (RBAC Restricted)
              </span>
              <h2 className="text-xl font-black text-white mt-2">
                Operations Center Restricted
              </h2>
              <p className="text-xs text-slate-400 mt-2 font-mono leading-relaxed">
                Your account ({currentUser?.email || "Guest"}) is assigned the role{" "}
                <span className="text-emerald-400 font-bold uppercase">{currentUser?.role || "GUEST"}</span>.
              </p>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                The Operations Command Center is restricted to authorized platform managers and administrators.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link to="/">
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs rounded-xl">
                  <ArrowLeft className="size-4 mr-1.5" /> Return to Explorer App
                </Button>
              </Link>

              <button
                onClick={handleSignOut}
                className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="size-3.5" /> Sign In with Admin Account
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  const user = currentUser!;

  return (
    <AppShell>
      <div className="mx-auto max-w-[1440px] px-4 pt-28 pb-16 sm:px-7 sm:pt-36 font-sans">
        {/* Executive Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-[#121821] border border-white/15 rounded-3xl p-6 shadow-2xl text-white">
          <div className="flex items-center gap-4">
            <div className="relative size-14 rounded-2xl bg-emerald-500 text-black font-black text-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              {user.avatar}
              <span className="absolute bottom-0 right-0 size-3.5 rounded-full bg-emerald-400 ring-2 ring-[#121821]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">{user.name}</h1>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold rounded-full uppercase border border-emerald-500/30">
                  🟢 {user.role.replace("_", " ")}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-3 font-mono">
                <span>Session Active ({user.email})</span>
                <span>• Permissions Active</span>
                <span className="text-emerald-400">● 38 District Data Health Audit Active</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-xl">
              <Download className="size-3.5 mr-1" /> Backup Platform Database
            </Button>
          </div>
        </div>

        {/* Workspace Layout Grid */}
        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          {/* Operations Sidebar */}
          <aside className="bg-[#121821] border border-white/15 rounded-3xl p-4 shadow-2xl text-white h-fit space-y-5">
            {FINAL_OPERATIONS_GROUPS.map((group) => (
              <div key={group.groupLabel} className="space-y-1">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                  {group.groupLabel}
                </p>
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-bold transition text-left ${
                      activeTab === item.id
                        ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="size-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full font-mono ${
                          activeTab === item.id ? "bg-black/20 text-black" : "bg-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ))}

            <div className="pt-4 border-t border-white/10 px-3">
              <button onClick={handleSignOut} className="text-xs text-rose-400 font-bold hover:underline flex items-center gap-1.5 cursor-pointer">
                Sign Out →
              </button>
            </div>
          </aside>

          {/* Main Workspaces Container */}
          <main className="space-y-6">
            {/* WORKSPACE: CONTENT HEALTH DASHBOARD */}
            {activeTab === "health" && <ContentHealthModule />}

            {/* WORKSPACE: EXECUTIVE DASHBOARD */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                  {[
                    { label: "Today's Explorers", val: "8,214", icon: Users, color: "text-emerald-400" },
                    { label: "Trips Planned", val: "1,244", icon: Compass, color: "text-amber-400" },
                    { label: "Routes Opened", val: "4,881", icon: RouteIcon, color: "text-blue-400" },
                    { label: "Bookmarks Today", val: "712", icon: Bookmark, color: "text-purple-400" },
                    { label: "Photos Uploaded", val: "384", icon: FolderKanban, color: "text-teal-400" },
                    { label: "Reviews Moderated", val: "197", icon: CheckCircle2, color: "text-rose-400" },
                  ].map((m) => (
                    <div key={m.label} className="bg-[#121821] border border-white/15 rounded-2xl p-4 shadow-xl text-white">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="text-[10px] font-mono font-bold uppercase truncate">{m.label}</span>
                        <m.icon className={`size-4 ${m.color}`} />
                      </div>
                      <p className="text-2xl font-black text-white">{m.val}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-[#121821] border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold flex items-center gap-2">
                      <Activity className="size-5 text-emerald-400" /> Executive Platform Stream
                    </h3>
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                      <Radio className="size-3 animate-pulse" /> Live Telemetry
                    </span>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    {[
                      { time: "09:25 AM", action: "Monsoon Flood Alert issued for Nilgiris & Pykara Basin", color: "border-rose-500/40 text-rose-300" },
                      { time: "09:12 AM", action: "Route Manager updated: Valparai Sholayar Loop (40 Hairpins)", color: "border-blue-500/40 text-blue-300" },
                      { time: "09:01 AM", action: "Place Manager verified node: Agaya Gangai Secret Basin", color: "border-emerald-500/40 text-emerald-300" },
                    ].map((item) => (
                      <div key={item.time + item.action} className={`p-3 bg-white/5 border ${item.color} rounded-2xl flex items-start justify-between gap-2`}>
                        <div>
                          <span className="text-slate-400 font-bold mr-2">[{item.time}]</span>
                          <span className="text-white">{item.action}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CONTENT WORKFLOWS */}
            {activeTab === "places" && <PlacesManagementModule />}
            {activeTab === "routes" && <RoutesManagementModule />}
            {activeTab === "media" && <MediaLibraryModule />}
            {activeTab === "cms" && <CMSBuilderModule />}

            {/* COMMUNITY WORKFLOWS */}
            {activeTab === "moderation" && <CommunityModerationModule />}
            {activeTab === "users" && (
              <div className="bg-[#121821] border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-6 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users className="size-5 text-emerald-400" /> Complete RBAC User Directory
                </h2>
              </div>
            )}

            {/* INTELLIGENCE WORKFLOWS */}
            {activeTab === "ai" && <AIOperationsModule />}
            {activeTab === "weather" && <WeatherOperationsModule />}
            {activeTab === "analytics" && (
              <div className="bg-[#121821] border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-6 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Activity className="size-5 text-emerald-400" /> Platform Search & District Heatmaps
                </h2>
              </div>
            )}

            {/* PLATFORM CONTROL */}
            {activeTab === "settings" && (
              <div className="bg-[#121821] border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-6 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Settings className="size-5 text-emerald-400" /> System Settings & API Keys
                </h2>
              </div>
            )}
          </main>
        </div>
      </div>
    </AppShell>
  );
}
