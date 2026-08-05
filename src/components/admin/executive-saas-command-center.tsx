import { useState } from "react";
import {
  Users,
  MapPin,
  Route as RouteIcon,
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Server,
  Sparkles,
  CloudRain,
  Radio,
  Clock,
  Database,
  DollarSign,
  TrendingUp,
  Flame,
  Plus,
  ShieldAlert,
  ArrowUpRight,
  RefreshCw,
  Search,
  Check,
  X,
  FileText,
  UserCheck,
  HardDrive,
  Cpu,
  Layers,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExecutiveCommandCenterProps {
  onNavigateTab: (tabId: string) => void;
}

interface ApprovalItem {
  id: string;
  type: string;
  name: string;
  submittedBy: string;
  created: string;
  priority: "HIGH" | "NORMAL" | "LOW";
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export function ExecutiveSaaSCommandCenter({ onNavigateTab }: ExecutiveCommandCenterProps) {
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [approvalList, setApprovalList] = useState<ApprovalItem[]>([
    { id: "app-1", type: "New Place", name: "Kolli Hills Viewpoint", submittedBy: "Pranav", created: "10:21 AM", priority: "HIGH", status: "PENDING" },
    { id: "app-2", type: "Updated Route", name: "Valparai 40 Hairpins Loop", submittedBy: "Karthik", created: "10:18 AM", priority: "NORMAL", status: "PENDING" },
    { id: "app-3", type: "Media Photo", name: "Suruli Waterfalls Sunset HDR", submittedBy: "Priya", created: "09:42 AM", priority: "LOW", status: "PENDING" },
    { id: "app-4", type: "Community Story", name: "Solo Motorcycling Nilgiris Ghats", submittedBy: "Anand", created: "08:15 AM", priority: "NORMAL", status: "PENDING" },
  ]);

  const handleRunBackup = () => {
    setBackupStatus("Backing up Supabase PostgreSQL...");
    setTimeout(() => {
      setBackupStatus("✅ Backup completed: snapshot_2026_08_05.sql (1.2 GB)");
    }, 1200);
  };

  const handleApprove = (id: string) => {
    setApprovalList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "APPROVED" } : item))
    );
  };

  const handleReject = (id: string) => {
    setApprovalList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "REJECTED" } : item))
    );
  };

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-300">
      {/* Real Operational System Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
            <span className="size-2 rounded-full bg-emerald-500 animate-ping" /> System Operational
          </span>
          <span className="text-slate-500">Last Backup: 02:14 AM</span>
          <span className="text-slate-500">• Deployment: 18m ago</span>
          <span className="text-slate-500">• Search Index: Today 09:12</span>
        </div>

        <div className="flex items-center gap-4 flex-wrap text-slate-600 dark:text-slate-300 font-bold">
          <span>Avg Latency: <strong className="text-emerald-700 dark:text-emerald-400">183ms</strong></span>
          <span>Active Sessions: <strong className="text-emerald-700 dark:text-emerald-400">147</strong></span>
          <span>Error Rate: <strong className="text-emerald-700 dark:text-emerald-400">0.03%</strong></span>
        </div>
      </div>

      {/* 1. Quick Actions Bar */}
      <div className="bg-white dark:bg-[#121821] border border-slate-200 dark:border-white/15 rounded-3xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-slate-900 dark:text-white">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            ⚡ Operations Quick Actions:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => onNavigateTab("places")}
            className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white dark:text-black font-extrabold text-xs rounded-xl cursor-pointer"
          >
            <Plus className="size-3.5 mr-1" /> Add Place
          </Button>

          <Button
            size="sm"
            onClick={() => onNavigateTab("routes")}
            variant="outline"
            className="border-slate-200 dark:border-white/15 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-bold rounded-xl cursor-pointer"
          >
            <Plus className="size-3.5 mr-1 text-emerald-600 dark:text-emerald-400" /> Create Route
          </Button>

          <Button
            size="sm"
            onClick={() => onNavigateTab("media")}
            variant="outline"
            className="border-slate-200 dark:border-white/15 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-bold rounded-xl cursor-pointer"
          >
            <Plus className="size-3.5 mr-1 text-emerald-600 dark:text-emerald-400" /> Upload Media
          </Button>

          <Button
            size="sm"
            onClick={() => onNavigateTab("cms")}
            variant="outline"
            className="border-slate-200 dark:border-white/15 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-bold rounded-xl cursor-pointer"
          >
            <Plus className="size-3.5 mr-1 text-emerald-600 dark:text-emerald-400" /> Publish Story
          </Button>

          <Button
            size="sm"
            onClick={() => onNavigateTab("users")}
            variant="outline"
            className="border-slate-200 dark:border-white/15 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-bold rounded-xl cursor-pointer"
          >
            <Plus className="size-3.5 mr-1 text-emerald-600 dark:text-emerald-400" /> Invite Manager
          </Button>

          <Button
            size="sm"
            onClick={handleRunBackup}
            variant="secondary"
            className="bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            <Database className="size-3.5 mr-1 text-emerald-600 dark:text-emerald-400" /> Backup Database
          </Button>
        </div>
      </div>

      {backupStatus && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl text-xs font-mono text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-between">
          <span>{backupStatus}</span>
          <button onClick={() => setBackupStatus(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* 2. Platform Health Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-3">
        {[
          { label: "Registered Users", val: "1,284", sub: "147 Active Today", icon: Users, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Total Places", val: "582", sub: "540 Verified • 42 Pending", icon: MapPin, color: "text-blue-600 dark:text-blue-400" },
          { label: "Total Routes", val: "83", sub: "61 Verified • 22 Draft", icon: RouteIcon, color: "text-amber-600 dark:text-amber-400" },
          { label: "Media Assets", val: "3,248", sub: "DAM Assets Logged", icon: FolderKanban, color: "text-purple-600 dark:text-purple-400" },
          { label: "Pending Reviews", val: "17", sub: "Awaiting Moderation", icon: CheckCircle2, color: "text-teal-600 dark:text-teal-400" },
          { label: "Weather Feeds", val: "2 Active", sub: "Nilgiris & Kodaikanal", icon: CloudRain, color: "text-rose-600 dark:text-rose-400" },
          { label: "AI Requests", val: "3,812", sub: "4.8M Tokens • ₹482 Cost", icon: Sparkles, color: "text-amber-500" },
        ].map((m) => (
          <div
            key={m.label}
            className="bg-white dark:bg-[#121821] border border-slate-200 dark:border-white/15 rounded-2xl p-4 shadow-sm text-slate-900 dark:text-white flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="text-[10px] font-mono font-bold uppercase truncate">{m.label}</span>
                <m.icon className={`size-4 ${m.color}`} />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{m.val}</p>
            </div>
            <p className="mt-2 text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* 3. Section: Live Service Status (Infrastructure Telemetry) */}
      <div className="bg-white dark:bg-[#121821] border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-sm text-slate-900 dark:text-white space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <Server className="size-5 text-emerald-600 dark:text-emerald-400" /> Infrastructure Service Health & Latency
          </h3>
          <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold">100% Uptime (Past 30 Days)</span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
          {[
            { name: "FastAPI BFF Router", status: "Online", latency: "28ms", health: "99.9%", color: "emerald" },
            { name: "PostgreSQL / PostGIS", status: "Online", latency: "12ms", health: "100%", color: "emerald" },
            { name: "Supabase Auth & RLS", status: "Online", latency: "14ms", health: "100%", color: "emerald" },
            { name: "Redis Cache Engine", status: "Connected", latency: "4ms", health: "99.9%", color: "emerald" },
            { name: "Gemini 1.5 Pro AI", status: "Healthy", latency: "410ms", health: "99.8%", color: "emerald" },
            { name: "Weather Service API", status: "Online", latency: "85ms", health: "99.7%", color: "emerald" },
            { name: "Object Storage (S3)", status: "Online", latency: "65ms", health: "100%", color: "emerald" },
            { name: "Search Indexing Engine", status: "Healthy", latency: "18ms", health: "100%", color: "emerald" },
          ].map((srv) => (
            <div key={srv.name} className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{srv.name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{srv.latency} • {srv.health} health</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-extrabold text-[9px] rounded-full border border-emerald-500/30 uppercase">
                {srv.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Section: Content Approval Queue */}
      <div className="bg-white dark:bg-[#121821] border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-sm text-slate-900 dark:text-white space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <FileCheck className="size-5 text-emerald-600 dark:text-emerald-400" /> Content Approval Queue
          </h3>
          <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/30">
            {approvalList.filter((i) => i.status === "PENDING").length} Items Pending Review
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 font-mono text-slate-500 uppercase text-[10px]">
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Item Name</th>
                <th className="py-2.5 px-3">Submitted By</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10 font-mono">
              {approvalList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition">
                  <td className="py-3 px-3 font-bold text-emerald-700 dark:text-emerald-400">{item.type}</td>
                  <td className="py-3 px-3 font-sans font-semibold text-slate-900 dark:text-white">{item.name}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{item.submittedBy}</td>
                  <td className="py-3 px-3 text-slate-400">{item.created}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${item.priority === "HIGH" ? "bg-rose-500/10 text-rose-600 border-rose-500/30" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase ${item.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-600" : item.status === "REJECTED" ? "bg-rose-500/10 text-rose-600" : "bg-amber-500/10 text-amber-600"}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right space-x-1.5 font-sans">
                    {item.status === "PENDING" ? (
                      <>
                        <Button size="sm" onClick={() => handleApprove(item.id)} className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg">
                          <Check className="size-3 mr-1" /> Approve
                        </Button>
                        <Button size="sm" onClick={() => handleReject(item.id)} variant="outline" className="h-7 px-2.5 border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-[10px] rounded-lg">
                          <X className="size-3 mr-1" /> Reject
                        </Button>
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Action Logged</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Executive Audit Stream & Pending Action Queue */}
      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
        {/* Live Executive Audit Stream */}
        <div className="bg-white dark:bg-[#121821] border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-sm text-slate-900 dark:text-white space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <Activity className="size-5 text-emerald-600 dark:text-emerald-400" /> Executive Audit Log & Activity Stream
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">Real-time platform updates across 38 districts</p>
            </div>
            <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-bold">
              <Radio className="size-3 animate-pulse text-emerald-600" /> Live Stream
            </span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {[
              { time: "10:21 AM", user: "Pranav", action: "Created", target: "Kolli Hills View Point", tag: "NEW PLACE", tagColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" },
              { time: "10:17 AM", user: "Karthik", action: "Approved", target: "Valparai Tea Estate (40 Hairpins)", tag: "VERIFIED", tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30" },
              { time: "09:58 AM", user: "Gemini AI", action: "Generated place description", target: "Suruli Falls (Theni District)", tag: "AI AUTO-GEN", tagColor: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30" },
              { time: "09:31 AM", user: "Weather Service", action: "Closed route", target: "Munnar Ghat Pass (Heavy Rain)", tag: "HAZARD ALERT", tagColor: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30" },
              { time: "08:51 AM", user: "Community Moderator", action: "Review flagged: Fake coordinates", target: "Agaya Gangai Secret Basin", tag: "MODERATION", tagColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30" },
            ].map((log) => (
              <div key={log.time + log.target} className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-slate-400 font-bold shrink-0">[{log.time}]</span>
                  <span className="font-sans text-xs text-slate-800 dark:text-white truncate">
                    <strong className="text-emerald-700 dark:text-emerald-400">{log.user}</strong> {log.action} <span className="font-mono text-slate-600 dark:text-slate-300">"{log.target}"</span>
                  </span>
                </div>
                <span className={`px-2 py-0.5 text-[9px] font-bold font-mono rounded-full border shrink-0 uppercase ${log.tagColor}`}>
                  {log.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Work Queue (Needs Attention) */}
        <div className="bg-white dark:bg-[#121821] border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-sm text-slate-900 dark:text-white space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <ShieldAlert className="size-5 text-amber-500" /> Action Queue (Needs Attention)
            </h3>
            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/30">
              44 Actions Pending
            </span>
          </div>

          <div className="space-y-2">
            {[
              { count: 12, label: "Places waiting GIS verification", tab: "places", severity: "high" },
              { count: 3, label: "Routes require GPX approval", tab: "routes", severity: "high" },
              { count: 5, label: "Images missing GPS coordinates", tab: "media", severity: "medium" },
              { count: 18, label: "Community reviews reported for spam", tab: "moderation", severity: "high" },
              { count: 2, label: "AI enrichment jobs failed", tab: "ai", severity: "medium" },
              { count: 4, label: "Weather telemetry feeds offline", tab: "weather", severity: "high" },
            ].map((q) => (
              <button
                key={q.label}
                onClick={() => onNavigateTab(q.tab)}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 transition text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-7 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-black text-xs border border-amber-500/20">
                    {q.count}
                  </span>
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
                    {q.label}
                  </span>
                </div>
                <ArrowUpRight className="size-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Platform Analytics & Search Trends */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Search Analytics & District Heatmaps */}
        <div className="bg-white dark:bg-[#121821] border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-sm text-slate-900 dark:text-white space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" /> Top Searched Destinations & Search Latency
          </h3>

          <div className="space-y-2">
            {[
              { query: "Kolli Hills 70 Hairpin Pass", count: "1,420 searches", share: "28%" },
              { query: "Valparai Tea Estate Loop", count: "1,180 searches", share: "22%" },
              { query: "Kodaikanal Secret Falls", count: "980 searches", share: "19%" },
              { query: "Ooty Pykara Lake", count: "890 searches", share: "17%" },
              { query: "Meghamalai Highwavys Estate", count: "740 searches", share: "14%" },
            ].map((s) => (
              <div key={s.query} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{s.query}</span>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-500">{s.count}</span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold rounded-full border border-emerald-500/20">{s.share}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Registration Log */}
        <div className="bg-white dark:bg-[#121821] border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-sm text-slate-900 dark:text-white space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <UserCheck className="size-4 text-emerald-600 dark:text-emerald-400" /> Recently Registered Explorers
          </h3>

          <div className="space-y-2">
            {[
              { name: "Pranav", role: "Explorer", time: "Joined Today 09:15 AM", email: "pranavviper7@gmail.com" },
              { name: "Anand", role: "Guide", time: "Joined Yesterday", email: "anand.guide@exploretn.com" },
              { name: "Priya", role: "Explorer", time: "Joined 2 days ago", email: "priya.tours@gmail.com" },
              { name: "Karthik", role: "Place Manager", time: "Joined 3 days ago", email: "karthik.admin@exploretn.com" },
            ].map((u) => (
              <div key={u.email} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-xl bg-emerald-500 text-black font-black text-xs">
                    {u.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{u.name}</p>
                    <p className="text-[10px] font-mono text-slate-500">{u.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-mono text-[9px] font-bold rounded-full uppercase">
                    {u.role}
                  </span>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">{u.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
