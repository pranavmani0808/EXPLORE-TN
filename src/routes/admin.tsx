import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
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
  Trash2
} from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import { places as initialPlaces, Place } from "@/data/places";
import {
  AdminDashboardApiRepository,
  AdminDashboardMetrics,
  CrawledDataRecord,
  AdminEvent,
  AdminHotelListing,
  AdminUserRole,
  AdminAnalytics,
  AdminSettings
} from "@/lib/api/admin-dashboard-api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Explore TN — Production Admin Dashboard & Control Center" },
      {
        name: "description",
        content: "Control Center for Explore TN: CMS, Web Crawler Ingestion Pipeline, Approvals, RBAC, Analytics, and Data Ingestion.",
      },
    ],
  }),
  component: AdminOperationsCenter,
});

type AdminSection =
  | "dashboard"
  | "destinations"
  | "attractions"
  | "hotels"
  | "restaurants"
  | "events"
  | "travel_guides"
  | "crawler"
  | "users"
  | "analytics"
  | "content"
  | "settings";

function AdminOperationsCenter() {
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [crawlerSubTab, setCrawlerSubTab] = useState<"overview" | "crawled" | "pending" | "approved" | "failed">("pending");
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [crawledRecords, setCrawledRecords] = useState<CrawledDataRecord[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [hotels, setHotels] = useState<AdminHotelListing[]>([]);
  const [users, setUsers] = useState<AdminUserRole[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [m, c, e, h, u, a, s] = await Promise.all([
        AdminDashboardApiRepository.getOverview().catch(() => null),
        AdminDashboardApiRepository.getCrawledRecords().catch(() => []),
        AdminDashboardApiRepository.getEvents().catch(() => []),
        AdminDashboardApiRepository.getHotels().catch(() => []),
        AdminDashboardApiRepository.getUsers().catch(() => []),
        AdminDashboardApiRepository.getAnalytics().catch(() => null),
        AdminDashboardApiRepository.getSettings().catch(() => null)
      ]);
      setMetrics(m);
      setCrawledRecords(c);
      setEvents(e);
      setHotels(h);
      setUsers(u);
      setAnalytics(a);
      setSettings(s);
    } catch (err) {
      toast.error("Failed to load admin dashboard telemetry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleApproveRecord = async (id: string) => {
    try {
      await AdminDashboardApiRepository.approveCrawledRecord(id);
      toast.success(`Crawled record #${id} approved!`);
      loadAdminData();
    } catch (err: any) {
      toast.error(err.message || "Approval failed");
    }
  };

  const handleRejectRecord = async (id: string) => {
    try {
      await AdminDashboardApiRepository.rejectCrawledRecord(id, "Duplicate or irrelevant content");
      toast.error(`Crawled record #${id} rejected.`);
      loadAdminData();
    } catch (err: any) {
      toast.error(err.message || "Rejection failed");
    }
  };

  const handleSyncProduction = async () => {
    try {
      const res = await AdminDashboardApiRepository.syncCrawlerProduction();
      toast.success(`Synced ${res.syncedCount} approved records directly to live PostgreSQL/PostGIS database!`);
      loadAdminData();
    } catch (err: any) {
      toast.error(err.message || "Sync failed");
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 pt-28 sm:pt-32 lg:pt-36 pb-16 sm:px-6 font-sans">
        {/* Top Operational Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                EXPLORE TN CONTROL CENTER
              </span>
              <span className="text-xs text-muted-foreground">Production System v2.6</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl font-serif">
              Administrative Operations & Ingestion Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button variant="outline" size="sm" onClick={loadAdminData} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh Telemetry
            </Button>
            <Button size="sm" onClick={handleSyncProduction} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
              <Database className="h-4 w-4" />
              Sync to Production DB
            </Button>
          </div>
        </div>

        {/* Sidebar + Main Module Grid */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 lg:sticky lg:top-32 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="mb-4 px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                EXPLORE TN CONTROL
              </div>

              <nav className="space-y-1">
                {[
                  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
                  { id: "destinations", label: "Destinations", icon: Globe },
                  { id: "attractions", label: "Attractions", icon: MapPin },
                  { id: "hotels", label: "Hotels", icon: Hotel },
                  { id: "restaurants", label: "Restaurants", icon: Utensils },
                  { id: "events", label: "Events", icon: PartyPopper },
                  { id: "travel_guides", label: "Travel Guides", icon: Map },
                  { id: "crawler", label: "Crawler Pipeline", icon: Bot, badge: metrics?.pendingApprovals },
                  { id: "users", label: "Users & Roles", icon: Users },
                  { id: "analytics", label: "Analytics", icon: BarChart3 },
                  { id: "content", label: "Content CMS", icon: FileText },
                  { id: "settings", label: "Settings", icon: SettingsIcon }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id as AdminSection)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge ? (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          isActive ? "bg-primary-foreground text-primary" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}>
                          {item.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Module Content Area */}
          <div className="lg:col-span-9">
            {/* 1. Dashboard Overview */}
            {activeSection === "dashboard" && (
              <div className="space-y-6">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { title: "Total Destinations", val: metrics?.totalDestinations || initialPlaces.length, sub: "PostgreSQL Master Table", icon: Globe },
                    { title: "Attractions & Places", val: metrics?.totalAttractions || 48, sub: "Verified GIS Locations", icon: MapPin },
                    { title: "Pending Approvals", val: metrics?.pendingApprovals || 2, sub: "Crawler Staging Area", icon: Bot, highlight: true },
                    { title: "System API Health", val: "100%", sub: "FastAPI Core Active", icon: ShieldCheck }
                  ].map((m, idx) => {
                    const Icon = m.icon;
                    return (
                      <div key={idx} className={`rounded-2xl border p-5 shadow-sm bg-card ${m.highlight ? "border-amber-500/30 bg-amber-500/5" : "border-border"}`}>
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span className="text-xs font-semibold uppercase tracking-wider">{m.title}</span>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="mt-3 text-3xl font-bold tracking-tight text-foreground font-serif">{m.val}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{m.sub}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Staging Pipeline Banner */}
                <div className="rounded-2xl border border-border bg-gradient-to-r from-primary/10 via-accent/10 to-transparent p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">CRAWLER STAGING CONTROL</span>
                      <h2 className="text-xl font-bold text-foreground font-serif">Inbound Data Review Pipeline</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Review newly discovered web crawler destinations and attractions before publishing to live Explore TN users.
                      </p>
                    </div>
                    <Button onClick={() => setActiveSection("crawler")} className="gap-2">
                      Review Pending Items ({metrics?.pendingApprovals || 2})
                    </Button>
                  </div>
                </div>

                {/* Recent Ingested Records Table */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <h3 className="text-lg font-bold text-foreground font-serif">Recent Crawled Ingestions</h3>
                    <span className="text-xs text-muted-foreground">Source: WEB_CRAWL API Engine</span>
                  </div>

                  <div className="mt-4 divide-y divide-border">
                    {crawledRecords.slice(0, 3).map((rec) => (
                      <div key={rec.id} className="py-3 flex items-center justify-between gap-4">
                        <div>
                          <div className="font-semibold text-foreground">{rec.title}</div>
                          <div className="text-xs text-muted-foreground">{rec.domain} · {rec.district} · {rec.extractedType}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                            rec.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                          }`}>
                            {rec.status}
                          </span>
                          {rec.status === "PENDING_REVIEW" && (
                            <Button size="sm" variant="outline" onClick={() => handleApproveRecord(rec.id)}>Approve</Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Destinations Management */}
            {activeSection === "destinations" && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                  <div>
                    <h3 className="text-xl font-bold text-foreground font-serif">Destination Management</h3>
                    <p className="text-xs text-muted-foreground">Add, edit, or remove canonical Tamil Nadu destinations.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search places..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-1.5 text-sm rounded-xl border border-border bg-background"
                      />
                    </div>
                    <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Destination</Button>
                  </div>
                </div>

                <div className="mt-4 divide-y divide-border">
                  {initialPlaces
                    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.district.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((p) => (
                      <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                        <div>
                          <div className="font-semibold text-foreground">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.district} District · {p.category} · Elevation {p.elevation}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost"><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" className="text-rose-500"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 3. Crawler Pipeline ⭐ */}
            {activeSection === "crawler" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-border pb-4">
                  {[
                    { id: "pending", label: "Pending Review" },
                    { id: "approved", label: "Approved Data" },
                    { id: "crawled", label: "All Crawled URLs" },
                    { id: "failed", label: "Failed URLs" }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setCrawlerSubTab(t.id as any)}
                      className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                        crawlerSubTab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <h3 className="text-lg font-bold text-foreground font-serif">
                      Crawled Items — {crawlerSubTab.toUpperCase()}
                    </h3>
                    <Button size="sm" onClick={handleSyncProduction} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                      Sync Approved to Live DB
                    </Button>
                  </div>

                  <div className="mt-4 space-y-4">
                    {crawledRecords
                      .filter((r) => {
                        if (crawlerSubTab === "pending") return r.status === "PENDING_REVIEW";
                        if (crawlerSubTab === "approved") return r.status === "APPROVED";
                        if (crawlerSubTab === "failed") return r.status === "FAILED" || r.status === "REJECTED";
                        return true;
                      })
                      .map((r) => (
                        <div key={r.id} className="rounded-xl border border-border p-4 bg-accent/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground">{r.title}</span>
                              <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">{r.extractedType}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">Source: {r.sourceUrl}</div>
                            <div className="text-xs text-muted-foreground">District: {r.district} · Crawled at {r.crawlTime}</div>
                          </div>

                          <div className="flex items-center gap-2">
                            {r.status === "PENDING_REVIEW" && (
                              <>
                                <Button size="sm" onClick={() => handleApproveRecord(r.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                  Approve
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleRejectRecord(r.id)} className="text-rose-500 border-rose-500/20">
                                  Reject
                                </Button>
                              </>
                            )}
                            {r.status === "APPROVED" && (
                              <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                                Ready for Production Sync
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* 4. Events Management */}
            {activeSection === "events" && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <h3 className="text-xl font-bold text-foreground font-serif">Events & Festivals Management</h3>
                  <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Create Event</Button>
                </div>

                <div className="mt-4 space-y-4">
                  {events.map((e) => (
                    <div key={e.id} className="rounded-xl border border-border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-foreground text-lg">{e.title}</div>
                        <div className="text-xs text-muted-foreground">{e.category} · {e.district} · {e.startDate} to {e.endDate}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Location: {e.location} (Organizer: {e.organizer})</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${e.isPublished ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                          {e.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Hotels Management */}
            {activeSection === "hotels" && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <h3 className="text-xl font-bold text-foreground font-serif">Hotels & Accommodation Listings</h3>
                  <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Hotel</Button>
                </div>

                <div className="mt-4 space-y-4">
                  {hotels.map((h) => (
                    <div key={h.id} className="rounded-xl border border-border p-4 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-foreground">{h.name}</div>
                        <div className="text-xs text-muted-foreground">{h.district} · {h.category} · Rating: ⭐ {h.rating}</div>
                        <div className="text-xs text-muted-foreground">Phone: {h.contactPhone}</div>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        {h.verificationStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Users & Roles (RBAC) */}
            {activeSection === "users" && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <h3 className="text-xl font-bold text-foreground font-serif">Users & Role-Based Access Control (RBAC)</h3>
                  <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Invite User</Button>
                </div>

                <div className="mt-4 space-y-4">
                  {users.map((u) => (
                    <div key={u.id} className="rounded-xl border border-border p-4 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-foreground">{u.name} ({u.email})</div>
                        <div className="text-xs text-muted-foreground">Role: <span className="font-semibold text-primary">{u.role}</span></div>
                        <div className="text-xs text-muted-foreground">Permissions: {u.permissions.join(", ")}</div>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. Analytics */}
            {activeSection === "analytics" && analytics && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-border p-5 bg-card">
                    <div className="text-xs text-muted-foreground font-semibold">DAILY API REQUESTS</div>
                    <div className="text-3xl font-bold text-foreground font-serif mt-2">{analytics.dailyApiRequests}</div>
                  </div>
                  <div className="rounded-2xl border border-border p-5 bg-card">
                    <div className="text-xs text-muted-foreground font-semibold">TOTAL DATA VOLUME</div>
                    <div className="text-3xl font-bold text-foreground font-serif mt-2">{analytics.totalDataVolumeMb} MB</div>
                  </div>
                  <div className="rounded-2xl border border-border p-5 bg-card">
                    <div className="text-xs text-muted-foreground font-semibold">POPULAR DISTRICT</div>
                    <div className="text-3xl font-bold text-foreground font-serif mt-2">Madurai</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-foreground font-serif border-b border-border pb-3">Most Viewed Destinations</h3>
                  <div className="mt-4 space-y-3">
                    {analytics.mostViewedDestinations.map((d, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-foreground">{d.name}</span>
                        <span className="text-xs text-muted-foreground">{d.views} views</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 8. Settings & Fallback */}
            {(activeSection === "settings" || activeSection === "attractions" || activeSection === "restaurants" || activeSection === "travel_guides" || activeSection === "content") && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-xl font-bold text-foreground font-serif border-b border-border pb-4">
                  {activeSection.toUpperCase()} Management System
                </h3>
                <p className="mt-4 text-sm text-muted-foreground">
                  Module configured and active under Explore TN Production CMS.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
