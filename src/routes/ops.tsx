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
  Database,
  Clock,
  UserCheck,
} from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import { UserRole, UserProfile, getCurrentAuthUser, clearAuthSession } from "@/lib/auth-rbac";
import { ExecutiveSaaSCommandCenter } from "@/components/admin/executive-saas-command-center";
import { PlacesManagementModule } from "@/components/admin/places-management-module";
import { RoutesManagementModule } from "@/components/admin/routes-management-module";
import { MediaLibraryModule } from "@/components/admin/media-library-module";
import { CMSBuilderModule } from "@/components/admin/cms-builder-module";
import { CommunityModerationModule } from "@/components/admin/community-moderation-module";
import { WeatherOperationsModule } from "@/components/admin/weather-operations-module";
import { AIOperationsModule } from "@/components/admin/ai-operations-module";
import { ContentHealthModule } from "@/components/admin/content-health-module";
import { getLiveDashboardMetrics, DashboardMetrics } from "@/lib/dashboard-telemetry";

export const Route = createFileRoute("/ops")({
  head: () => ({
    meta: [
      { title: "ExplorerTN Operations Command Center" },
      {
        name: "description",
        content: "Truthful Operations Command Center for ExplorerTN. Platform Health, Action Queue, Live Audit Trail, Telemetry, and Role-Based Access Control.",
      },
    ],
  }),
  component: OperationsWorkspacePage,
});

interface SidebarGroup {
  groupLabel: string;
  items: { id: string; label: string; icon: any; getBadge?: (m: DashboardMetrics) => string | undefined; roles?: UserRole[] }[];
}

const SAAS_OPERATIONS_GROUPS: SidebarGroup[] = [
  {
    groupLabel: "DASHBOARD",
    items: [
      { id: "overview", label: "Executive Dashboard", icon: BarChart3, roles: ["super_admin", "place_manager", "route_manager", "community_manager"] },
      { id: "health", label: "Content Health Audit", icon: Activity, getBadge: (m) => m.totalPlaces > 0 ? `${m.totalPlaces}` : undefined, roles: ["super_admin", "place_manager"] },
    ],
  },
  {
    groupLabel: "CONTENT WORKFLOWS",
    items: [
      { id: "places", label: "Places GIS Manager", icon: MapPin, getBadge: (m) => m.pendingPlaces > 0 ? `${m.pendingPlaces} Pending` : undefined, roles: ["super_admin", "place_manager"] },
      { id: "routes", label: "Routes GIS Editor", icon: RouteIcon, getBadge: (m) => m.draftRoutes > 0 ? `${m.draftRoutes} Drafts` : undefined, roles: ["super_admin", "route_manager"] },
      { id: "media", label: "Media Library (DAM)", icon: FolderKanban, getBadge: (m) => m.mediaAssets > 0 ? `${m.mediaAssets} Uploads` : undefined, roles: ["super_admin", "place_manager"] },
      { id: "cms", label: "Visual CMS & Stories", icon: Layout, roles: ["super_admin"] },
    ],
  },
  {
    groupLabel: "COMMUNITY WORKFLOWS",
    items: [
      { id: "users", label: "Users & Roles (RBAC)", icon: Users, roles: ["super_admin"] },
      { id: "moderation", label: "Moderation Queue", icon: ShieldAlert, getBadge: (m) => m.pendingReviews > 0 ? `${m.pendingReviews} Reports` : undefined, roles: ["super_admin", "community_manager"] },
    ],
  },
  {
    groupLabel: "INTELLIGENCE WORKFLOWS",
    items: [
      { id: "ai", label: "AI Operations", icon: Sparkles, roles: ["super_admin"] },
      { id: "weather", label: "Weather Operations", icon: CloudRain, getBadge: (m) => m.weatherAlerts > 0 ? `${m.weatherAlerts} Active` : undefined, roles: ["super_admin", "route_manager"] },
      { id: "analytics", label: "Platform Analytics", icon: Activity, roles: ["super_admin"] },
    ],
  },
  {
    groupLabel: "PLATFORM CONTROL",
    items: [{ id: "settings", label: "Platform Settings", icon: Settings, roles: ["super_admin"] }],
  },
];

function OperationsWorkspacePage() {
  const searchParams: any = useSearch({ strict: false });
  const initialTab = searchParams?.tab || "overview";

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const sessionUser = getCurrentAuthUser();
    setCurrentUser(sessionUser);
    getLiveDashboardMetrics().then((res) => {
      setMetrics(res.metrics);
      setIsLoaded(true);
    });
  }, []);

  const handleSignOut = () => {
    clearAuthSession();
    window.location.href = "/login";
  };

  // RBAC ACCESS GUARD:
  const isUnauthorized =
    isLoaded &&
    (!currentUser || currentUser.role === "explorer" || currentUser.role === "beta_tester");

  if (!isLoaded) {
    return (
      <AppShell>
        <div className="min-h-[60vh] flex items-center justify-center font-mono text-slate-500 text-xs">
          Verifying Telemetry API & RBAC Session...
        </div>
      </AppShell>
    );
  }

  if (isUnauthorized) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md px-4 pt-36 pb-24 font-sans">
          <div className="bg-white dark:bg-[#121821] border border-rose-500/30 rounded-3xl p-8 shadow-xl text-center space-y-5 text-slate-900 dark:text-white relative overflow-hidden">
            <div className="inline-flex size-16 place-items-center rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500">
              <Lock className="size-8 text-rose-500" />
            </div>

            <div>
              <span className="px-3 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono text-[10px] font-bold rounded-full border border-rose-500/30 uppercase">
                403 Access Denied (RBAC Restricted)
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
                Operations Center Restricted
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono leading-relaxed">
                Your account ({currentUser?.email || "Guest"}) is assigned the role{" "}
                <span className="text-emerald-700 dark:text-emerald-400 font-bold uppercase">{currentUser?.role || "GUEST"}</span>.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
                The Operations Command Center is restricted to authorized platform managers and administrators.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link to="/">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white dark:text-black font-extrabold text-xs rounded-xl">
                  <ArrowLeft className="size-4 mr-1.5" /> Return to Explorer App
                </Button>
              </Link>

              <button
                onClick={handleSignOut}
                className="w-full py-2.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="size-3.5" /> Sign In with Admin Credentials
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  const user = currentUser!;

  // Role Scoped Items Filter:
  const allowedGroups = SAAS_OPERATIONS_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.roles || item.roles.includes(user.role)),
  })).filter((group) => group.items.length > 0);

  return (
    <AppShell>
      <div className="mx-auto max-w-[1440px] px-4 pt-28 pb-16 sm:px-7 sm:pt-36 font-sans">
        {/* Executive Real Telemetry Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white dark:bg-[#121821] border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-sm text-slate-900 dark:text-white">
          <div className="flex items-center gap-4">
            <div className="relative size-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white dark:text-black font-black text-xl flex items-center justify-center shadow-md shrink-0">
              {user.avatar}
              <span className="absolute bottom-0 right-0 size-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#121821]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Logged in as</span>
                <h1 className="text-lg font-black text-slate-900 dark:text-white">{user.name}</h1>
                <span className="px-2.5 py-0.5 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-mono text-[10px] font-bold rounded-full uppercase border border-emerald-500/30">
                  {user.role.replace("_", " ")}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3 font-mono">
                <span>Email: {user.email}</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">● Truthful Database Telemetry Active</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setActiveTab("overview")}
              className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white dark:text-black font-bold text-xs rounded-xl cursor-pointer"
            >
              <BarChart3 className="size-3.5 mr-1" /> Operations Command Center
            </Button>
          </div>
        </div>

        {/* Workspace Layout Grid */}
        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          {/* Operations Sidebar */}
          <aside className="bg-white dark:bg-[#121821] border border-slate-200 dark:border-white/15 rounded-3xl p-4 shadow-sm text-slate-900 dark:text-white h-fit space-y-5">
            {allowedGroups.map((group) => (
              <div key={group.groupLabel} className="space-y-1">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 px-3 py-1">
                  {group.groupLabel}
                </p>
                {group.items.map((item) => {
                  const badgeText = metrics && item.getBadge ? item.getBadge(metrics) : undefined;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-bold transition text-left cursor-pointer ${
                        activeTab === item.id
                          ? "bg-emerald-600 dark:bg-emerald-500 text-white dark:text-black shadow-md"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="size-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {badgeText && (
                        <span
                          className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full font-mono ${
                            activeTab === item.id
                              ? "bg-black/20 text-white dark:text-black"
                              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {badgeText}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            <div className="pt-4 border-t border-slate-200 dark:border-white/10 px-3">
              <button onClick={handleSignOut} className="text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline flex items-center gap-1.5 cursor-pointer">
                Sign Out →
              </button>
            </div>
          </aside>

          {/* Main Workspaces Container */}
          <main className="space-y-6">
            {/* WORKSPACE: SAAS EXECUTIVE COMMAND CENTER */}
            {activeTab === "overview" && <ExecutiveSaaSCommandCenter onNavigateTab={setActiveTab} />}

            {/* WORKSPACE: CONTENT HEALTH DASHBOARD */}
            {activeTab === "health" && <ContentHealthModule />}

            {/* CONTENT WORKFLOWS */}
            {activeTab === "places" && <PlacesManagementModule />}
            {activeTab === "routes" && <RoutesManagementModule />}
            {activeTab === "media" && <MediaLibraryModule />}
            {activeTab === "cms" && <CMSBuilderModule />}

            {/* COMMUNITY WORKFLOWS */}
            {activeTab === "moderation" && <CommunityModerationModule />}
            {activeTab === "users" && (
              <div className="bg-white dark:bg-[#121821] border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-sm text-slate-900 dark:text-white space-y-6 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users className="size-5 text-emerald-600 dark:text-emerald-400" /> Complete RBAC User Directory
                </h2>
              </div>
            )}

            {/* INTELLIGENCE WORKFLOWS */}
            {activeTab === "ai" && <AIOperationsModule />}
            {activeTab === "weather" && <WeatherOperationsModule />}
            {activeTab === "analytics" && (
              <div className="bg-white dark:bg-[#121821] border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-sm text-slate-900 dark:text-white space-y-6 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Activity className="size-5 text-emerald-600 dark:text-emerald-400" /> Platform Search & District Heatmaps
                </h2>
              </div>
            )}

            {/* PLATFORM CONTROL */}
            {activeTab === "settings" && (
              <div className="bg-white dark:bg-[#121821] border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-sm text-slate-900 dark:text-white space-y-6 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Settings className="size-5 text-emerald-600 dark:text-emerald-400" /> System Settings & API Keys
                </h2>
              </div>
            )}
          </main>
        </div>
      </div>
    </AppShell>
  );
}
