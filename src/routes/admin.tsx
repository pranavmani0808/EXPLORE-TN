import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Globe,
  MapPin,
  Hotel,
  Utensils,
  PartyPopper,
  Map,
  Bot,
  Users,
  BarChart3,
  FileText,
  Settings as SettingsIcon,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  Search,
  Filter,
  ShieldCheck,
  Activity,
  Layers,
  ArrowUpRight,
  Database,
  ExternalLink,
  Eye,
  Edit,
  Trash2,
  Check,
  AlertTriangle,
  Play,
  Square,
  Clock,
  Sparkles,
  Tag,
  Compass,
  Star,
  Mountain,
  Zap,
  Sliders,
  Bell,
  SearchCode,
  FileCheck,
  Table as TableIcon
} from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import {
  AdminDashboardApiRepository,
  AdminDashboardMetrics,
  DestinationDetail,
  AttractionDetail,
  HotelDetail,
  RestaurantDetail,
  EventDetail,
  CrawlerSource,
  CrawlerJob,
  CrawledDataDiff,
  AdminUserRole,
  AdminAnalytics,
  ContentCmsSection,
  AdminSettings,
  AuditLogEntry,
  EntityPerformance
} from "@/lib/api/admin-dashboard-api";
import { getCurrentAuthUser, isAdminUser } from "@/lib/auth-rbac";
import { toast } from "sonner";
import { HelpCircle, TrendingUp } from "lucide-react";

// Import Specialized Operations Modules
import { PlacesManagementModule } from "@/components/admin/places-management-module";
import { RoutesManagementModule } from "@/components/admin/routes-management-module";
import { AIOperationsModule } from "@/components/admin/ai-operations-module";
import { MediaLibraryModule } from "@/components/admin/media-library-module";
import { CommunityModerationModule } from "@/components/admin/community-moderation-module";
import { ContentHealthModule } from "@/components/admin/content-health-module";
import { CMSBuilderModule } from "@/components/admin/cms-builder-module";
import { ExecutiveSaaSCommandCenter } from "@/components/admin/executive-saas-command-center";
import { UserQueriesSupportModule } from "@/components/admin/user-queries-module";
import { PlaceSuggestionsModule } from "@/components/admin/place-suggestions-module";
import { WeeklyDigestModule } from "@/components/admin/weekly-digest-module";
import { GeospatialSafetyModule } from "@/components/admin/geospatial-safety-module";
import { KodaiPoiManagementModule } from "@/components/admin/kodai-poi-management-module";
import { SecurityDashboardModule } from "@/components/admin/security-dashboard";
import { DistrictPlacesAdminModule } from "@/components/admin/district-places-admin-module";
import { CategoriesManagementModule } from "@/components/admin/categories-management-module";
import { UserManagementModal } from "@/components/admin/entity-management-modals";
import { getLiveDashboardMetrics, DashboardMetrics } from "@/lib/dashboard-telemetry";
import { TAMIL_NADU_DISTRICTS } from "@/lib/data/tamil-nadu-districts";
import { getAnalyticsEvents } from "@/lib/explorer-activity";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Explore TN — Travel Intelligence CMS & Geospatial Operations Center" },
      {
        name: "description",
        content: "Explore TN Travel Intelligence CMS: Geospatial Map Operations, Content Quality Center, AI Controls & Web Crawler Suite.",
      },
    ],
  }),
  component: AdminOperationsCenter,
});

export type AdminSection =
  | "dashboard"
  | "destinations"
  | "district_places"
  | "kodai_pois"
  | "place_suggestions"
  | "map_intelligence"
  | "categories"
  | "routes"
  | "activities"
  | "events"
  | "ai_planner"
  | "ai_config"
  | "data_quality"
  | "users"
  | "user_queries"
  | "reviews"
  | "media_library"
  | "articles"
  | "search_analytics"
  | "analytics"
  | "weekly_digest"
  | "audit"
  | "notifications"
  | "settings"
  | "system_health"
  | "security";

function AdminOperationsCenter() {
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [crawlerSubTab, setCrawlerSubTab] = useState<"overview" | "sources" | "jobs" | "crawled" | "pending" | "approved" | "failed">("pending");
  const [attractionCategoryFilter, setAttractionCategoryFilter] = useState<string>("All");
  const [eventStatusFilter, setEventStatusFilter] = useState<string>("All");

  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [liveMetrics, setLiveMetrics] = useState<DashboardMetrics | null>(null);
  const [destinations, setDestinations] = useState<DestinationDetail[]>([]);
  const [attractions, setAttractions] = useState<AttractionDetail[]>([]);
  const [hotels, setHotels] = useState<HotelDetail[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantDetail[]>([]);
  const [events, setEvents] = useState<EventDetail[]>([]);
  const [crawlerSources, setCrawlerSources] = useState<CrawlerSource[]>([]);
  const [crawlerJobs, setCrawlerJobs] = useState<CrawlerJob[]>([]);
  const [crawlerDiffs, setCrawlerDiffs] = useState<CrawledDataDiff[]>([]);
  const [users, setUsers] = useState<AdminUserRole[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [cmsSections, setCmsSections] = useState<ContentCmsSection[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [newCatInput, setNewCatInput] = useState("");

  // Interactive Management States
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  
  // Activities state
  const [activitiesList, setActivitiesList] = useState([
    { id: "act-scuba-rameshwaram", title: "Scuba Diving in Rameswaram", cat: "Water Adventures", duration: "2–3 Hours", difficulty: "Easy" },
    { id: "act-paragliding-yelagiri", title: "Paragliding in Yelagiri", cat: "Air Adventures", duration: "1–2 Hours", difficulty: "Moderate" },
    { id: "act-offroad-kolli", title: "Off Roading & Ghat Driving in Kolli Hills", cat: "Extreme Adventures", duration: "Full Day", difficulty: "Challenging" },
    { id: "act-trek-agasthiyar", title: "Trek to Agasthiyar Falls (Papanasam)", cat: "Mountain Adventures", duration: "3 Hours", difficulty: "Easy" },
    { id: "act-rockclimbing-gingee", title: "Rock Climbing at Gingee Fort", cat: "Extreme Adventures", duration: "4 Hours", difficulty: "Challenging" },
    { id: "act-camping-kolli", title: "Wild Camping at Kolli Hills", cat: "Mountain Adventures", duration: "Overnight", difficulty: "Easy" },
    { id: "act-surfing-kovalam", title: "Surfing at Kovalam (Covelong Chennai)", cat: "Water Adventures", duration: "2 Hours", difficulty: "Moderate" },
    { id: "act-safari-mudumalai", title: "Wildlife Safari in Mudumalai", cat: "Extreme Adventures", duration: "3 Hours", difficulty: "Easy" },
    { id: "act-cave-sittanavasal", title: "Cave Exploring at Sittanavasal", cat: "Mountain Adventures", duration: "2 Hours", difficulty: "Easy" }
  ]);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [newActivityTitle, setNewActivityTitle] = useState("");
  const [newActivityCat, setNewActivityCat] = useState("Trekking");
  const [newActivityDuration, setNewActivityDuration] = useState("Half Day");
  const [newActivityDifficulty, setNewActivityDifficulty] = useState("Moderate");

  // Events state
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventCategory, setNewEventCategory] = useState("Cultural Festival");
  const [newEventVenue, setNewEventVenue] = useState("");
  const [newEventStartDate, setNewEventStartDate] = useState("2026-01-14");
  const [newEventEndDate, setNewEventEndDate] = useState("2026-01-17");

  // AI & System Configuration States
  const [aiModelEngine, setAiModelEngine] = useState(() => {
    return typeof window !== "undefined" ? localStorage.getItem("etn_ai_model") || "Google Gemini 1.5 Pro (Recommended)" : "Google Gemini 1.5 Pro (Recommended)";
  });
  const [aiSystemPrompt, setAiSystemPrompt] = useState(() => {
    return typeof window !== "undefined" ? localStorage.getItem("etn_ai_prompt") || "You are an expert Tamil Nadu Travel Intelligence Architect. Generate optimal travel routes adhering to real driving distances, district limits, and canonical opening hours." : "You are an expert Tamil Nadu Travel Intelligence Architect. Generate optimal travel routes adhering to real driving distances, district limits, and canonical opening hours.";
  });
  const [aiMaxDestinations, setAiMaxDestinations] = useState(15);
  const [aiMaxRouteLength, setAiMaxRouteLength] = useState(1200);

  const [platformName, setPlatformName] = useState(() => {
    return typeof window !== "undefined" ? localStorage.getItem("etn_platform_name") || "ExploreTN — Travel Intelligence Platform" : "ExploreTN — Travel Intelligence Platform";
  });
  const [mapEngineKey, setMapEngineKey] = useState("pk.eyJ1IjoicHJhbmF2IiwiYSI6ImNseXRzIn0");

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [m, d, a, h, r, e, cs, cj, cd, u, an, cm, s, aud] = await Promise.all([
        AdminDashboardApiRepository.getOverview().catch(() => null),
        AdminDashboardApiRepository.getDestinations().catch(() => []),
        AdminDashboardApiRepository.getAttractions().catch(() => []),
        AdminDashboardApiRepository.getHotels().catch(() => []),
        AdminDashboardApiRepository.getRestaurants().catch(() => []),
        AdminDashboardApiRepository.getEvents().catch(() => []),
        AdminDashboardApiRepository.getCrawlerSources().catch(() => []),
        AdminDashboardApiRepository.getCrawlerJobs().catch(() => []),
        AdminDashboardApiRepository.getCrawlerDiffs().catch(() => []),
        AdminDashboardApiRepository.getUsers().catch(() => []),
        AdminDashboardApiRepository.getAnalytics().catch(() => null),
        AdminDashboardApiRepository.getCmsSections().catch(() => []),
        AdminDashboardApiRepository.getSettings().catch(() => null),
        AdminDashboardApiRepository.getAuditLogs().catch(() => [])
      ]);
      setMetrics(m);
      setDestinations(d);
      setAttractions(a);
      setHotels(h);
      setRestaurants(r);
      setEvents(e);
      setCrawlerSources(cs);
      setCrawlerJobs(cj);
      setCrawlerDiffs(cd);
      setUsers(u);
      setAnalytics(an);
      setCmsSections(cm);
      setSettings(s);
      setAuditLogs(aud);

      // Load Truthful Supabase & LocalTelemetry Live Metrics
      const liveData = await getLiveDashboardMetrics().catch(() => null);
      if (liveData) {
        setLiveMetrics(liveData.metrics);
      }
    } catch (err) {
      toast.error("Failed to load management telemetry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = getCurrentAuthUser();
    if (!user || !isAdminUser(user)) {
      toast.error("Unauthorized Access: Admin privileges required.");
      window.location.href = "/login";
      return;
    }
    loadAdminData();
  }, []);

  return (
    <AppShell>
      <div className="mx-auto max-w-[1550px] px-4 pt-28 sm:pt-32 lg:pt-36 pb-16 sm:px-6 font-sans">
        {/* Header Control Bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                EXPLORETN TRAVEL INTELLIGENCE CMS
              </span>
              <span className="text-xs text-muted-foreground font-mono">v3.5 Control Center</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl font-serif">
              Geospatial Operations & Travel Intelligence Portal
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button variant="outline" size="sm" onClick={loadAdminData} className="gap-2 cursor-pointer">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh Telemetry
            </Button>
            <Button size="sm" onClick={() => setActiveSection("district_places")} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer">
              <Plus className="h-4 w-4" /> Add Place in District
            </Button>
          </div>
        </div>

        {/* Sidebar + Main Module Workspace Container */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 lg:sticky lg:top-32 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-5">
              
              {/* GROUP 1: OVERVIEW */}
              <div>
                <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">
                  📊 OVERVIEW
                </div>
                <button
                  onClick={() => setActiveSection("dashboard")}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                    activeSection === "dashboard"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Executive Dashboard</span>
                  </div>
                </button>
              </div>

              {/* GROUP 2: DISCOVERY & GEOGRAPHY */}
              <div>
                <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">
                  🗺️ DISCOVERY & GEOGRAPHY
                </div>
                <nav className="space-y-0.5">
                  {[
                    { id: "district_places", label: "District-Wise Tables (38)", icon: TableIcon, badge: "All 38 Districts" },
                    { id: "destinations", label: "Global Places Catalog", icon: Globe, count: destinations.length },
                    { id: "kodai_pois", label: "Kodaikanal POIs (30)", icon: Mountain, badge: "Kodai 30" },
                    { id: "place_suggestions", label: "Place Suggestions & Scout Reviews", icon: Sparkles, badge: "4 New" },
                    { id: "map_intelligence", label: "Map Intelligence & Bounds", icon: Map, badge: "GIS" },
                    { id: "categories", label: "Categories & Taxonomy", icon: Tag },
                    { id: "routes", label: "Routes & Road Trips", icon: Compass, count: 18 }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id as AdminSection)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? "bg-primary text-primary-foreground font-bold shadow-sm"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge ? (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            isActive ? "bg-primary-foreground text-primary" : "bg-emerald-500/10 text-emerald-600"
                          }`}>
                            {item.badge}
                          </span>
                        ) : item.count !== undefined ? (
                          <span className="text-[11px] text-muted-foreground font-mono">{item.count}</span>
                        ) : null}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* GROUP 3: ACTIVITIES & EXPERIENCES */}
              <div>
                <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">
                  🏔️ ACTIVITIES & EXPERIENCES
                </div>
                <nav className="space-y-0.5">
                  {[
                    { id: "activities", label: "Activities & Adventures", icon: Mountain, count: attractions.length },
                    { id: "events", label: "Events & Festivals", icon: PartyPopper, count: events.length }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id as AdminSection)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? "bg-primary text-primary-foreground font-bold shadow-sm"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.count !== undefined && (
                          <span className="text-[11px] text-muted-foreground font-mono">{item.count}</span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* GROUP 4: AI INTELLIGENCE */}
              <div>
                <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">
                  🤖 AI INTELLIGENCE
                </div>
                <nav className="space-y-0.5">
                  {[
                    { id: "ai_planner", label: "AI Planner Operations", icon: Bot, badge: "Telemetry" },
                    { id: "ai_config", label: "AI Configuration & Prompts", icon: Sliders }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id as AdminSection)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? "bg-primary text-primary-foreground font-bold shadow-sm"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="rounded-full bg-amber-500/10 text-amber-500 px-2 py-0.5 text-[10px] font-bold">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* GROUP 5: DATA INTEGRITY & QUALITY */}
              <div>
                <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">
                  🛡️ DATA QUALITY & INTEGRITY
                </div>
                <nav className="space-y-0.5">
                  {[
                    { id: "data_quality", label: "Data Quality Center", icon: FileCheck, count: destinations.length }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id as AdminSection)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? "bg-primary text-primary-foreground font-bold shadow-sm"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.count !== undefined ? (
                          <span className="text-[11px] text-muted-foreground font-mono">{item.count}</span>
                        ) : null}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* GROUP 6: COMMUNITY & MODERATION */}
              <div>
                <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">
                  👥 COMMUNITY & HELPDESK
                </div>
                <nav className="space-y-0.5">
                  {[
                    { id: "users", label: "Users & RBAC Matrix", icon: Users, count: users.length },
                    { id: "user_queries", label: "User Queries & Support Helpdesk", icon: HelpCircle, badge: "Helpdesk" },
                    { id: "reviews", label: "Reviews & Moderation", icon: Star, badge: "Moderation" }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id as AdminSection)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? "bg-primary text-primary-foreground font-bold shadow-sm"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge ? (
                          <span className="rounded-full bg-emerald-500/10 text-emerald-600 px-2 py-0.5 text-[10px] font-bold">{item.badge}</span>
                        ) : item.count !== undefined ? (
                          <span className="text-[11px] text-muted-foreground font-mono">{item.count}</span>
                        ) : null}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* GROUP 7: CONTENT & EDITORIAL */}
              <div>
                <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">
                  📸 CONTENT & EDITORIAL
                </div>
                <nav className="space-y-0.5">
                  {[
                    { id: "media_library", label: "Media Asset Library", icon: Layers, count: destinations.length },
                    { id: "articles", label: "Articles & Travel Guides", icon: FileText, count: cmsSections.length }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id as AdminSection)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? "bg-primary text-primary-foreground font-bold shadow-sm"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.count !== undefined && (
                          <span className="text-[11px] text-muted-foreground font-mono">{item.count}</span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* GROUP 8: ANALYTICS & REPORTS */}
              <div>
                <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">
                  📈 ANALYTICS & REPORTS
                </div>
                <nav className="space-y-0.5">
                  {[
                    { id: "weekly_digest", label: "Weekly Digest & Performance Reports", icon: TrendingUp, badge: "Active" },
                    { id: "search_analytics", label: "Search Management", icon: SearchCode },
                    { id: "analytics", label: "Platform Analytics", icon: BarChart3 }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id as AdminSection)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? "bg-primary text-primary-foreground font-bold shadow-sm"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* GROUP 9: SYSTEM & SECURITY */}
              <div>
                <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">
                  ⚙️ SYSTEM & SECURITY
                </div>
                <nav className="space-y-0.5">
                  {[
                    { id: "security", label: "CAIN Security Dashboard", icon: ShieldCheck, badge: "CAIN Layer" },
                    { id: "notifications", label: "Notifications Center", icon: Bell, badge: "12 Alerts" },
                    { id: "audit", label: "Audit Logs", icon: ShieldCheck, count: auditLogs.length },
                    { id: "settings", label: "System Settings", icon: SettingsIcon },
                    { id: "system_health", label: "System Health Monitor", icon: Activity, badge: "100%" }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id as AdminSection)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? "bg-primary text-primary-foreground font-bold shadow-sm"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge ? (
                          <span className="rounded-full bg-emerald-500/10 text-emerald-600 px-2 py-0.5 text-[10px] font-bold">
                            {item.badge}
                          </span>
                        ) : item.count !== undefined ? (
                          <span className="text-[11px] text-muted-foreground font-mono">{item.count}</span>
                        ) : null}
                      </button>
                    );
                  })}
                </nav>
              </div>

            </div>
          </div>

          {/* Main Content Workspace Area */}
          <div className="lg:col-span-9">

            {/* 1. DASHBOARD OVERVIEW */}
            {activeSection === "dashboard" && (
              <ExecutiveSaaSCommandCenter onNavigateTab={(tab) => setActiveSection(tab as AdminSection)} />
            )}

            {/* 2. DISTRICT-WISE PLACES TABLES (ALL 38 DISTRICTS) */}
            {activeSection === "district_places" && (
              <DistrictPlacesAdminModule />
            )}

            {/* 2a. GLOBAL PLACES CATALOG */}
            {activeSection === "destinations" && (
              <PlacesManagementModule />
            )}

            {/* 2b. KODAIKANAL POIS MANAGEMENT */}
            {activeSection === "kodai_pois" && (
              <KodaiPoiManagementModule />
            )}

            {/* 2b. PLACE SUGGESTIONS & SCOUT REVIEWS */}
            {activeSection === "place_suggestions" && (
              <PlaceSuggestionsModule onPlaceApproved={loadAdminData} />
            )}

            {/* 3. MAP INTELLIGENCE & GEOSPATIAL SAFETY PIPELINE */}
            {activeSection === "map_intelligence" && (
              <GeospatialSafetyModule />
            )}

            {/* 4. CATEGORIES & TAXONOMY HIERARCHY */}
            {activeSection === "categories" && (
              <CategoriesManagementModule />
            )}

            {/* 5. ROUTES & ROAD TRIPS */}
            {activeSection === "routes" && (
              <RoutesManagementModule />
            )}

            {/* 6. ACTIVITIES & ADVENTURES */}
            {/* 6. ACTIVITIES & ADVENTURES */}
            {activeSection === "activities" && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div>
                    <h3 className="text-xl font-bold text-foreground font-serif">Activities & Adventures</h3>
                    <p className="text-xs text-muted-foreground">Manage adventure trails, safaris, watersports, and outdoor excursions across Tamil Nadu.</p>
                  </div>
                  <Button size="sm" onClick={() => setShowAddActivityModal(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">
                    <Plus className="h-4 w-4" /> Add Activity
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activitiesList.map((act) => (
                    <div key={act.id} className="rounded-xl border border-border p-4 bg-background flex justify-between items-center">
                      <div>
                        <div className="font-bold text-sm text-foreground">{act.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{act.cat} · {act.duration} · {act.difficulty}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newTitle = prompt("Update Activity Name:", act.title);
                            if (newTitle && newTitle.trim()) {
                              setActivitiesList(prev => prev.map(a => a.id === act.id ? { ...a, title: newTitle.trim() } : a));
                              toast.success(`Updated activity: ${newTitle}`);
                            }
                          }}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-rose-500 hover:text-rose-700 hover:bg-rose-500/10"
                          onClick={() => {
                            if (confirm(`Remove activity "${act.title}"?`)) {
                              setActivitiesList(prev => prev.filter(a => a.id !== act.id));
                              toast.success("Activity removed successfully.");
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {showAddActivityModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-xl space-y-4">
                      <div className="flex justify-between items-center border-b border-border pb-3">
                        <h4 className="font-bold text-base text-foreground">Add New Adventure Activity</h4>
                        <button onClick={() => setShowAddActivityModal(false)} className="text-muted-foreground hover:text-foreground">
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!newActivityTitle.trim()) return;
                          const newAct = {
                            id: `act-${Date.now()}`,
                            title: newActivityTitle.trim(),
                            cat: newActivityCat,
                            duration: newActivityDuration,
                            difficulty: newActivityDifficulty
                          };
                          setActivitiesList(prev => [newAct, ...prev]);
                          setNewActivityTitle("");
                          setShowAddActivityModal(false);
                          toast.success(`Activity "${newAct.title}" published.`);
                        }}
                        className="space-y-3 text-xs"
                      >
                        <div>
                          <label className="block font-bold mb-1">Activity Title</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Yelagiri Paragliding Tandem Flight"
                            value={newActivityTitle}
                            onChange={(e) => setNewActivityTitle(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-border bg-background"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold mb-1">Category</label>
                            <select
                              value={newActivityCat}
                              onChange={(e) => setNewActivityCat(e.target.value)}
                              className="w-full p-2 rounded-xl border border-border bg-background"
                            >
                              <option>Trekking</option>
                              <option>Motorcycling</option>
                              <option>Watersports</option>
                              <option>Wildlife</option>
                              <option>Paragliding</option>
                              <option>Rock Climbing</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-bold mb-1">Difficulty</label>
                            <select
                              value={newActivityDifficulty}
                              onChange={(e) => setNewActivityDifficulty(e.target.value)}
                              className="w-full p-2 rounded-xl border border-border bg-background"
                            >
                              <option>Easy</option>
                              <option>Moderate</option>
                              <option>Challenging</option>
                              <option>Extreme</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block font-bold mb-1">Estimated Duration</label>
                          <input
                            type="text"
                            placeholder="e.g. 4 Hours / 1 Day"
                            value={newActivityDuration}
                            onChange={(e) => setNewActivityDuration(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-border bg-background"
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => setShowAddActivityModal(false)}>Cancel</Button>
                          <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">Save Activity</Button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 8. EVENTS & FESTIVALS */}
            {activeSection === "events" && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div>
                    <h3 className="text-xl font-bold text-foreground font-serif">Events & Cultural Festivals</h3>
                    <p className="text-xs text-muted-foreground">Manage festivals, temple celebrations, cultural carnivals, and food expos.</p>
                  </div>
                  <Button size="sm" onClick={() => setShowAddEventModal(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">
                    <Plus className="h-4 w-4" /> Create Event
                  </Button>
                </div>

                <div className="divide-y divide-border">
                  {events.map((e) => (
                    <div key={e.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-lg">{e.title}</span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">{e.category}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Venue: {e.venue} · Dates: {e.startDate} to {e.endDate}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const updatedVenue = prompt("Update Venue:", e.venue);
                            if (updatedVenue && updatedVenue.trim()) {
                              setEvents(prev => prev.map(ev => ev.id === e.id ? { ...ev, venue: updatedVenue.trim() } : ev));
                              toast.success(`Updated venue for ${e.title}`);
                            }
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-rose-500 hover:text-rose-700 hover:bg-rose-500/10"
                          onClick={() => {
                            if (confirm(`Delete event "${e.title}"?`)) {
                              setEvents(prev => prev.filter(ev => ev.id !== e.id));
                              toast.success("Event deleted successfully.");
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {showAddEventModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-xl space-y-4">
                      <div className="flex justify-between items-center border-b border-border pb-3">
                        <h4 className="font-bold text-base text-foreground">Create Cultural Event</h4>
                        <button onClick={() => setShowAddEventModal(false)} className="text-muted-foreground hover:text-foreground">
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!newEventTitle.trim()) return;
                          const newEv: EventDetail = {
                            id: `ev-${Date.now()}`,
                            title: newEventTitle.trim(),
                            category: newEventCategory,
                            venue: newEventVenue.trim() || "Tamil Nadu",
                            district: "Tamil Nadu",
                            startDate: newEventStartDate,
                            endDate: newEventEndDate,
                            startTime: "09:00",
                            endTime: "21:00",
                            location: newEventVenue.trim() || "Tamil Nadu",
                            organizer: "ExploreTN Tourism Council",
                            contact: "admin@exploretn.com",
                            ticketPrice: "Free Entry",
                            bookingUrl: "#",
                            imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800",
                            isRecurring: true,
                            status: "Upcoming",
                            isPublished: true,
                            description: "Official cultural festival celebration in Tamil Nadu."
                          };
                          setEvents(prev => [newEv, ...prev]);
                          setNewEventTitle("");
                          setNewEventVenue("");
                          setShowAddEventModal(false);
                          toast.success(`Event "${newEv.title}" created successfully.`);
                        }}
                        className="space-y-3 text-xs"
                      >
                        <div>
                          <label className="block font-bold mb-1">Event Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Pongal Harvest Carnival & Jallikattu"
                            value={newEventTitle}
                            onChange={(e) => setNewEventTitle(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-border bg-background"
                          />
                        </div>
                        <div>
                          <label className="block font-bold mb-1">Category</label>
                          <select
                            value={newEventCategory}
                            onChange={(e) => setNewEventCategory(e.target.value)}
                            className="w-full p-2 rounded-xl border border-border bg-background"
                          >
                            <option>Cultural Festival</option>
                            <option>Temple Festival</option>
                            <option>Carnival</option>
                            <option>Food Expo</option>
                            <option>Music & Dance</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold mb-1">Venue / District</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Alanganallur, Madurai"
                            value={newEventVenue}
                            onChange={(e) => setNewEventVenue(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-border bg-background"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold mb-1">Start Date</label>
                            <input
                              type="date"
                              value={newEventStartDate}
                              onChange={(e) => setNewEventStartDate(e.target.value)}
                              className="w-full p-2 rounded-xl border border-border bg-background"
                            />
                          </div>
                          <div>
                            <label className="block font-bold mb-1">End Date</label>
                            <input
                              type="date"
                              value={newEventEndDate}
                              onChange={(e) => setNewEventEndDate(e.target.value)}
                              className="w-full p-2 rounded-xl border border-border bg-background"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => setShowAddEventModal(false)}>Cancel</Button>
                          <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">Publish Event</Button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 9. AI PLANNER OPERATIONS */}
            {activeSection === "ai_planner" && (
              <AIOperationsModule />
            )}

            {/* 10. AI CONFIGURATION & PROMPTS */}
            {activeSection === "ai_config" && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
                <div className="border-b border-border pb-4">
                  <h3 className="text-xl font-bold text-foreground font-serif">AI Configuration & Prompt Templates</h3>
                  <p className="text-xs text-muted-foreground">Configure AI model parameters, generation constraints, and prompt engineering.</p>
                </div>

                <div className="space-y-4 max-w-2xl text-xs">
                  <div>
                    <label className="block font-bold text-foreground mb-1">Active GenAI Model Engine</label>
                    <select
                      value={aiModelEngine}
                      onChange={(e) => setAiModelEngine(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background p-2 text-foreground font-mono"
                    >
                      <option>Google Gemini 1.5 Pro (Recommended)</option>
                      <option>Google Gemini 1.5 Flash (Fast)</option>
                      <option>Claude 3.5 Sonnet</option>
                      <option>OpenAI GPT-4o</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-foreground mb-1">System Prompt Template</label>
                    <textarea
                      rows={5}
                      value={aiSystemPrompt}
                      onChange={(e) => setAiSystemPrompt(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background p-3 text-foreground font-mono text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-foreground mb-1">Max Destinations per Plan</label>
                      <input
                        type="number"
                        value={aiMaxDestinations}
                        onChange={(e) => setAiMaxDestinations(Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-background p-2 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-foreground mb-1">Max Route Length (km)</label>
                      <input
                        type="number"
                        value={aiMaxRouteLength}
                        onChange={(e) => setAiMaxRouteLength(Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-background p-2 font-mono"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        localStorage.setItem("etn_ai_model", aiModelEngine);
                        localStorage.setItem("etn_ai_prompt", aiSystemPrompt);
                      }
                      toast.success("AI Configuration saved successfully.");
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                  >
                    Save AI Configurations
                  </Button>
                </div>
              </div>
            )}



            {/* 12. DATA QUALITY CENTER */}
            {activeSection === "data_quality" && (
              <ContentHealthModule />
            )}

            {/* 13. USERS & RBAC MATRIX */}
            {activeSection === "users" && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div>
                    <h3 className="text-xl font-bold text-foreground font-serif">Users & RBAC Permission Matrix</h3>
                    <p className="text-xs text-muted-foreground">Manage user roles, admin access, and security permissions.</p>
                  </div>
                  <Button size="sm" onClick={() => setIsUserModalOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">
                    <Plus className="h-4 w-4" /> Add User
                  </Button>
                </div>

                <div className="divide-y divide-border">
                  {users.map((u) => (
                    <div key={u.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-foreground">{u.userName}</span>
                        <span className="text-muted-foreground ml-2">({u.email})</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">{u.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 13b. USER QUERIES & HELPDESK SUPPORT */}
            {activeSection === "user_queries" && (
              <UserQueriesSupportModule />
            )}

            {/* 14. REVIEWS & MODERATION */}
            {activeSection === "reviews" && (
              <CommunityModerationModule />
            )}

            {/* 15. MEDIA ASSET LIBRARY */}
            {activeSection === "media_library" && (
              <MediaLibraryModule />
            )}

            {/* 16. ARTICLES & TRAVEL GUIDES */}
            {activeSection === "articles" && (
              <CMSBuilderModule />
            )}

            {/* 17. SEARCH MANAGEMENT */}
            {activeSection === "search_analytics" && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
                <div className="border-b border-border pb-4">
                  <h3 className="text-xl font-bold text-foreground font-serif">Search Intelligence & Missing Content Analytics</h3>
                  <p className="text-xs text-muted-foreground">Analyze user search queries, trending keywords, and no-result searches.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-border p-4 bg-background space-y-3">
                    <h4 className="font-bold text-sm text-emerald-400">🔥 Top Searched Queries</h4>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between"><span>"Kodaikanal"</span><span className="font-bold">1,420 searches</span></div>
                      <div className="flex justify-between"><span>"Places near Madurai"</span><span className="font-bold">980 searches</span></div>
                      <div className="flex justify-between"><span>"Kanyakumari trip"</span><span className="font-bold">750 searches</span></div>
                      <div className="flex justify-between"><span>"Best waterfalls"</span><span className="font-bold">610 searches</span></div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border p-4 bg-background space-y-3">
                    <h4 className="font-bold text-sm text-amber-400">⚠ No-Result Searches (Content Opportunities)</h4>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between"><span>"Jigarthanda recipe spots"</span><span className="font-bold text-amber-500">140 queries</span></div>
                      <div className="flex justify-between"><span>"Dhanushkodi night camping"</span><span className="font-bold text-amber-500">95 queries</span></div>
                      <div className="flex justify-between"><span>"Yercaud secret view"</span><span className="font-bold text-amber-500">82 queries</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 18. PLATFORM ANALYTICS */}
            {activeSection === "analytics" && (() => {
              const events = getAnalyticsEvents();
              const placeViewsCount = events.filter((e) => e.eventType === "PLACE_OPENED").length;
              const routeOpensCount = events.filter((e) => e.eventType === "ROUTE_OPENED" || e.eventType === "NAVIGATION_STARTED").length;
              const searchesCount = events.filter((e) => e.eventType === "SEARCH_COMPLETED" || e.eventType === "SEARCH_STARTED").length;
              const savedPlacesCount = events.filter((e) => e.eventType === "PLACE_SAVED").length;

              const activeUsersCount = liveMetrics?.activeUsersToday || users.length || 1;
              const totalPlacesCount = destinations.length || liveMetrics?.totalPlaces || 0;
              const totalRoutesCount = liveMetrics?.totalRoutes || 18;

              return (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-emerald-500/10 text-emerald-500"><BarChart3 className="size-4" /></span>
                        <h3 className="text-xl font-bold text-foreground font-serif">Live Platform Analytics & Telemetry</h3>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Real-time dynamic traffic, user interactions, and catalog distribution across Tamil Nadu.</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 border border-emerald-500/20">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Live Feed
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 rounded-xl border border-border bg-background">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">ACTIVE USERS TODAY</div>
                      <div className="text-2xl font-black text-foreground mt-1 font-mono">{activeUsersCount}</div>
                      <div className="text-[11px] text-emerald-500 font-semibold mt-1">● Authenticated</div>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-background">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">REGISTERED PLACES</div>
                      <div className="text-2xl font-black text-foreground mt-1 font-mono">{totalPlacesCount}</div>
                      <div className="text-[11px] text-muted-foreground mt-1">38 Districts</div>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-background">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">LIVE PLACE OPENS</div>
                      <div className="text-2xl font-black text-foreground mt-1 font-mono">{placeViewsCount}</div>
                      <div className="text-[11px] text-muted-foreground mt-1">Explorer telemetry</div>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-background">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">CURATED ROUTES</div>
                      <div className="text-2xl font-black text-foreground mt-1 font-mono">{totalRoutesCount}</div>
                      <div className="text-[11px] text-muted-foreground mt-1">Road trips active</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="p-4 rounded-xl border border-border bg-background space-y-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">User Searches Logged</span>
                      <div className="text-xl font-bold font-mono text-foreground">{searchesCount}</div>
                      <p className="text-[11px] text-muted-foreground">Interactive search queries initiated by visitors.</p>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-background space-y-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Saved Places & Wishlist</span>
                      <div className="text-xl font-bold font-mono text-foreground">{savedPlacesCount}</div>
                      <p className="text-[11px] text-muted-foreground">Places bookmarked to explorer itineraries.</p>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-background space-y-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Route Navigations</span>
                      <div className="text-xl font-bold font-mono text-foreground">{routeOpensCount}</div>
                      <p className="text-[11px] text-muted-foreground">Trips loaded into interactive directions engine.</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 18b. WEEKLY DIGEST & PERFORMANCE REPORTS */}
            {activeSection === "weekly_digest" && (
              <WeeklyDigestModule />
            )}

            {/* 19. AUDIT LOGS */}
            {activeSection === "audit" && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <h3 className="text-xl font-bold text-foreground font-serif border-b border-border pb-3">Immutable Audit Log Trail</h3>
                <div className="divide-y divide-border">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-foreground">{log.action}</span>
                        <span className="text-muted-foreground ml-2">[{log.resource}]</span>
                      </div>
                      <span className="font-mono text-muted-foreground">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 20. NOTIFICATIONS CENTER */}
            {activeSection === "notifications" && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <h3 className="text-xl font-bold text-foreground font-serif border-b border-border pb-3 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-amber-500" /> Notifications Center
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 font-medium">🟠 Coordinates verified for 38 District Places</div>
                  <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-medium">🔵 User reviews and community submissions active</div>
                </div>
              </div>
            )}

            {/* 21. SYSTEM SETTINGS */}
            {activeSection === "settings" && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <h3 className="text-xl font-bold text-foreground font-serif border-b border-border pb-3">Global System Settings</h3>
                <div className="space-y-4 max-w-xl text-xs">
                  <div>
                    <label className="block font-bold text-foreground mb-1">Platform Name</label>
                    <input
                      type="text"
                      value={platformName}
                      onChange={(e) => setPlatformName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-border bg-background"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-foreground mb-1">Mapbox / Leaflet Map Engine Key</label>
                    <input
                      type="password"
                      value={mapEngineKey}
                      onChange={(e) => setMapEngineKey(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-border bg-background font-mono"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        localStorage.setItem("etn_platform_name", platformName);
                      }
                      toast.success("System settings updated successfully.");
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                  >
                    Save System Settings
                  </Button>
                </div>
              </div>
            )}

            {/* 22. SYSTEM HEALTH MONITOR */}
            {activeSection === "system_health" && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
                <div className="border-b border-border pb-4">
                  <h3 className="text-xl font-bold text-foreground font-serif flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-500" /> System Health & Latency Telemetry
                  </h3>
                  <p className="text-xs text-muted-foreground">Real-time status monitor of core microservices & API endpoints.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-center"><div className="font-bold text-emerald-400">API Gateway</div><div className="text-lg font-black text-white mt-1">🟢 24ms</div></div>
                  <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-center"><div className="font-bold text-emerald-400">Database</div><div className="text-lg font-black text-white mt-1">🟢 8ms</div></div>
                  <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-center"><div className="font-bold text-emerald-400">AI Engine</div><div className="text-lg font-black text-white mt-1">🟢 1.8s</div></div>
                  <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-center"><div className="font-bold text-emerald-400">Supabase Auth</div><div className="text-lg font-black text-white mt-1">🟢 Online</div></div>
                </div>
              </div>
            )}

            {/* 23. CAIN SECURITY DASHBOARD */}
            {activeSection === "security" && <SecurityDashboardModule />}

            {/* User Management & RBAC Modal */}
            <UserManagementModal
              isOpen={isUserModalOpen}
              onClose={() => {
                setIsUserModalOpen(false);
                loadAdminData();
              }}
            />

          </div>
        </div>
      </div>
    </AppShell>
  );
}
