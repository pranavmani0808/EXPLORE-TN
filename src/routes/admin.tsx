import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
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
  XCircle,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  AlertTriangle,
  Compass,
  Activity,
  Layers,
  Server,
  Edit,
  Trash2,
  Eye,
  Settings,
  Shield,
  FileText,
  Clock,
  ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import { places as initialPlaces, Place } from "@/data/places";
import { checkBackendHealth } from "@/lib/api";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "ExplorerTN Operations Center — Super Admin & Management" },
      {
        name: "description",
        content: "Operations Center for ExplorerTN. Place Manager, Route Manager, Community Moderation, AI Telemetry, and Weather Alerts.",
      },
    ],
  }),
  component: AdminOperationsCenter,
});

type UserRole =
  | "Super Admin"
  | "Place Manager"
  | "Route Manager"
  | "Community Moderator"
  | "AI Manager"
  | "Weather & Telemetry";

type AdminTab =
  | "overview"
  | "places"
  | "routes"
  | "community"
  | "ai"
  | "weather"
  | "analytics"
  | "cms";

function AdminOperationsCenter() {
  const [activeRole, setActiveRole] = useState<UserRole>("Super Admin");
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [isBackendLive, setIsBackendLive] = useState(false);
  const [placeList, setPlaceList] = useState<Place[]>(initialPlaces);
  const [searchQuery, setSearchQuery] = useState("");
  const [newPlaceModalOpen, setNewPlaceModalOpen] = useState(false);

  // New Place Form State
  const [newPlace, setNewPlace] = useState({
    name: "",
    district: "Theni",
    category: "waterfalls" as const,
    tagline: "",
    elevation: "3,400 ft",
    lat: "10.2381",
    lng: "77.4892",
    waterFlow: "High Discharge",
    roadCondition: "Tarred, narrow 4km",
    difficulty: "Easy" as const,
    verified: true,
  });

  useEffect(() => {
    checkBackendHealth().then((online) => setIsBackendLive(online));
  }, []);

  const filteredPlaces = placeList.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlace.name) return;

    const created: Place = {
      slug: newPlace.name.toLowerCase().replace(/\s+/g, "-"),
      name: newPlace.name,
      district: newPlace.district,
      category: newPlace.category,
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
      tagline: newPlace.tagline || "Newly verified spatial node",
      story: "Verified by ExplorerTN Operations Center.",
      rating: 4.8,
      reviews: 1,
      distanceFromChennai: "420 km",
      difficulty: newPlace.difficulty,
      bestSeason: "Year round",
      roadCondition: newPlace.roadCondition,
      parking: "Free parking",
      entryFee: "Free",
      timings: "6:00 AM - 6:00 PM",
      safety: "Safe, verified trail",
      weather: "22°C · Clear",
      tips: ["Carry water", "Check weather before start"],
      nearbyFood: ["Local mess"],
      nearbyFuel: ["IOC Station 5km"],
      x: 40,
      y: 50,
    };

    setPlaceList([created, ...placeList]);
    setNewPlaceModalOpen(false);
    setNewPlace({
      name: "",
      district: "Theni",
      category: "waterfalls",
      tagline: "",
      elevation: "3,400 ft",
      lat: "10.2381",
      lng: "77.4892",
      waterFlow: "High Discharge",
      roadCondition: "Tarred, narrow 4km",
      difficulty: "Easy",
      verified: true,
    });
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] px-4 pt-28 pb-16 sm:px-7 sm:pt-36 font-sans">
        {/* Operations Center Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-[#121821] border border-white/15 rounded-3xl p-5 sm:p-7 shadow-2xl">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold rounded-full flex items-center gap-1.5">
                <Activity className="size-3.5 text-emerald-400 animate-pulse" />
                OPERATIONS CENTER v4.0
              </span>
              {isBackendLive && (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-mono font-bold rounded-full flex items-center gap-1.5">
                  <Server className="size-3.5 text-blue-400" />
                  FastAPI Gateway Active (8000)
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Explorer<span className="text-gradient">TN</span> Command Portal
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Role-Based Access Control • Spatial Data CMS • AI Telemetry • Weather Dispatch
            </p>
          </div>

          {/* RBAC Role Selector Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-400 mr-1">Active RBAC Role:</span>
            {(
              [
                "Super Admin",
                "Place Manager",
                "Route Manager",
                "Community Moderator",
                "AI Manager",
                "Weather & Telemetry",
              ] as UserRole[]
            ).map((role) => (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  activeRole === role
                    ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                    : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Shield className="size-3.5" /> {role}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-4">
          {[
            { id: "overview", label: "Super Admin Overview", icon: BarChart3 },
            { id: "places", label: "Place Manager", icon: MapPin },
            { id: "routes", label: "Route Manager", icon: RouteIcon },
            { id: "community", label: "Community Moderation", icon: Users },
            { id: "ai", label: "AI Expeditions", icon: Sparkles },
            { id: "weather", label: "Weather & Telemetry", icon: CloudRain },
            { id: "analytics", label: "Analytics & Heatmaps", icon: Activity },
            { id: "cms", label: "Content & Media CMS", icon: FolderKanban },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`px-4 py-2.5 rounded-full text-xs font-extrabold flex items-center gap-2 transition ${
                activeTab === tab.id
                  ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                  : "bg-[#121821]/80 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <tab.icon className="size-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: SUPER ADMIN OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Stat Counters Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Verified Places", val: placeList.length.toString(), change: "+12 this week", icon: MapPin },
                { label: "Active Explorers", val: "14,280", change: "+18% growth", icon: Users },
                { label: "AI Requests Today", val: "3,890", change: "99.8% success", icon: Sparkles },
                { label: "Weather Alerts Live", val: "2 Active", change: "Monsoon Watch", icon: CloudRain },
              ].map((s) => (
                <div key={s.label} className="bg-[#121821] border border-white/15 rounded-3xl p-5 shadow-2xl text-white">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-mono font-bold uppercase">{s.label}</span>
                    <s.icon className="size-5 text-emerald-400" />
                  </div>
                  <p className="text-3xl font-black text-white">{s.val}</p>
                  <p className="text-[11px] font-mono text-emerald-400 mt-1">{s.change}</p>
                </div>
              ))}
            </div>

            {/* Live Operational Feeds */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Recent Verification Queue */}
              <div className="bg-[#121821] border border-white/15 rounded-3xl p-6 shadow-2xl text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-emerald-400" /> Pending Spot Verification Queue
                  </h3>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    3 Pending Review
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    { name: "Agaya Gangai Secret Basin", district: "Namakkal", submitter: "RiderKarthik", type: "Waterfalls" },
                    { name: "Megamalai Highwavys Peak", district: "Theni", submitter: "TrailSeeker_TN", type: "Offroad" },
                    { name: "Kambam Valley Sunrise Ridge", district: "Theni", submitter: "Anand_V", type: "Sunrise Point" },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-2xl">
                      <div>
                        <p className="text-sm font-bold text-white">{item.name}</p>
                        <p className="text-xs text-slate-400">{item.district} • Submitter: {item.submitter}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-xl transition">
                          Approve
                        </button>
                        <button className="px-3 py-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs rounded-xl transition">
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Telemetry & Logs */}
              <div className="bg-[#121821] border border-white/15 rounded-3xl p-6 shadow-2xl text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <Activity className="size-5 text-emerald-400" /> Live System Telemetry
                  </h3>
                  <span className="text-xs font-mono text-slate-400">PostGIS Spatial Engine</span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 bg-[#0B0F14] border border-white/10 rounded-2xl text-emerald-400">
                    [09:02:14] PostGIS Spatial Query: 240 POIs fetched in 12ms
                  </div>
                  <div className="p-3 bg-[#0B0F14] border border-white/10 rounded-2xl text-blue-400">
                    [09:01:50] Gemini 1.5 Pro AI Planner: Itinerary generated for "Kodaikanal 2-day Ghat Pass"
                  </div>
                  <div className="p-3 bg-[#0B0F14] border border-white/10 rounded-2xl text-amber-400">
                    [08:58:30] Weather Alert Triggered: Heavy Monsoon Runoff at Hogenakkal Basin
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PLACE MANAGER */}
        {activeTab === "places" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121821] border border-white/15 rounded-3xl p-5 shadow-2xl text-white">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-3 size-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search places by name, district, category..."
                  className="w-full bg-[#0B0F14] border border-white/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <Button
                onClick={() => setNewPlaceModalOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs rounded-2xl px-5 py-3 shadow-lg shadow-emerald-500/20"
              >
                <Plus className="size-4 mr-1" /> Add New Spatial Place
              </Button>
            </div>

            {/* Places Table */}
            <div className="bg-[#121821] border border-white/15 rounded-3xl overflow-hidden shadow-2xl text-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-mono">
                      <th className="p-4">PLACE NAME</th>
                      <th className="p-4">DISTRICT</th>
                      <th className="p-4">CATEGORY</th>
                      <th className="p-4">RATING</th>
                      <th className="p-4">ROAD CONDITION</th>
                      <th className="p-4">STATUS</th>
                      <th className="p-4 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredPlaces.map((p) => (
                      <tr key={p.slug} className="hover:bg-white/5 transition">
                        <td className="p-4 font-bold text-white flex items-center gap-2">
                          <img src={p.image} alt={p.name} className="size-8 rounded-xl object-cover" />
                          <span>{p.name}</span>
                        </td>
                        <td className="p-4 text-slate-300">{p.district}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-full font-bold uppercase text-[10px]">
                            {p.category}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-amber-400">★ {p.rating}</td>
                        <td className="p-4 text-slate-400">{p.roadCondition}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-full font-mono text-[10px]">
                            VERIFIED
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to="/place/$slug"
                              params={{ slug: p.slug }}
                              className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl transition"
                            >
                              <Eye className="size-4" />
                            </Link>
                            <button className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl transition">
                              <Edit className="size-4" />
                            </button>
                            <button
                              onClick={() => setPlaceList(placeList.filter((x) => x.slug !== p.slug))}
                              className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ROUTE MANAGER */}
        {activeTab === "routes" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-[#121821] border border-white/15 rounded-3xl p-6 shadow-2xl text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <RouteIcon className="size-5 text-emerald-400" /> Digital Route & GPX Asset Manager
                </h3>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs rounded-xl">
                  <Upload className="size-4 mr-1" /> Import GPX / KML File
                </Button>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { name: "Chennai → Kodaikanal Ghat Run", distance: "520 km", hairpins: "20 Hairpins", status: "Published" },
                  { name: "Coimbatore → Valparai Climb", distance: "105 km", hairpins: "40 Hairpins", status: "Published" },
                  { name: "Salem → Kolli Hills Loop", distance: "75 km", hairpins: "70 Hairpins", status: "Verified" },
                ].map((r) => (
                  <div key={r.name} className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <p className="font-bold text-sm text-white">{r.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{r.distance} • {r.hairpins}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 font-mono text-[10px] rounded-full">
                        {r.status}
                      </span>
                      <button className="text-xs text-emerald-400 font-bold hover:underline">Edit Polyline →</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: COMMUNITY MODERATION */}
        {activeTab === "community" && (
          <div className="bg-[#121821] border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-4 animate-in fade-in duration-300">
            <h3 className="text-base font-bold flex items-center gap-2">
              <ShieldAlert className="size-5 text-emerald-400" /> Community Moderation & Reports Queue
            </h3>

            <div className="space-y-3">
              {[
                { user: "RiderKarthik", action: "Submitted Photo Dump for Suruli Falls", time: "10 mins ago", status: "Pending Review" },
                { user: "TamilExplorer", action: "Reported Incorrect Parking Fee at Hogenakkal", time: "45 mins ago", status: "Needs Audit" },
              ].map((c) => (
                <div key={c.user} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <div>
                    <p className="font-bold text-sm text-white">{c.user}</p>
                    <p className="text-xs text-slate-400">{c.action} • {c.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-emerald-500 text-black font-bold text-xs rounded-xl">Approve</button>
                    <button className="px-3 py-1.5 bg-rose-500/20 text-rose-400 font-bold text-xs rounded-xl">Dismiss</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: AI MANAGER */}
        {activeTab === "ai" && (
          <div className="bg-[#121821] border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-4 animate-in fade-in duration-300">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Sparkles className="size-5 text-emerald-400" /> Gemini AI Prompt & Token Telemetry
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-xs text-slate-400 font-mono">TOKEN USAGE TODAY</p>
                <p className="text-2xl font-black text-white mt-1">428,900 Tokens</p>
                <p className="text-[10px] text-emerald-400 font-mono mt-0.5">Est. Cost: $0.14</p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-xs text-slate-400 font-mono">AVG LATENCY</p>
                <p className="text-2xl font-black text-white mt-1">412 ms</p>
                <p className="text-[10px] text-emerald-400 font-mono mt-0.5">FastAPI Cache Active</p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-xs text-slate-400 font-mono">PROMPT SUCCESS RATE</p>
                <p className="text-2xl font-black text-white mt-1">99.8%</p>
                <p className="text-[10px] text-emerald-400 font-mono mt-0.5">0 Fallbacks Triggered</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: WEATHER TELEMETRY */}
        {activeTab === "weather" && (
          <div className="bg-[#121821] border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-4 animate-in fade-in duration-300">
            <h3 className="text-base font-bold flex items-center gap-2">
              <CloudRain className="size-5 text-emerald-400" /> Live Monsoon & Waterflow Telemetry Dispatch
            </h3>

            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs font-mono flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-white">⚠️ Monsoon High Water Discharge Watch: Agaya Gangai</p>
                <p className="mt-0.5">Heavy rainfall recorded in Namakkal plateau. Visitors advised against entering lower pool basin.</p>
              </div>
              <button className="px-3 py-1.5 bg-amber-500 text-black font-bold text-xs rounded-xl shrink-0">
                Dispatch Explorer Alert
              </button>
            </div>
          </div>
        )}

        {/* ADD PLACE MODAL */}
        {newPlaceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-xl bg-[#121821] border border-white/15 rounded-3xl p-6 shadow-2xl text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Plus className="size-5 text-emerald-400" /> Add New Spatial Place Node
                </h3>
                <button onClick={() => setNewPlaceModalOpen(false)} className="text-slate-400 hover:text-white">
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddPlace} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">PLACE NAME</label>
                  <input
                    type="text"
                    value={newPlace.name}
                    onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
                    placeholder="e.g. Kumbakkarai Falls Upper Basin"
                    className="w-full bg-[#0B0F14] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">DISTRICT</label>
                    <input
                      type="text"
                      value={newPlace.district}
                      onChange={(e) => setNewPlace({ ...newPlace, district: e.target.value })}
                      className="w-full bg-[#0B0F14] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">CATEGORY</label>
                    <select
                      value={newPlace.category}
                      onChange={(e) => setNewPlace({ ...newPlace, category: e.target.value as any })}
                      className="w-full bg-[#0B0F14] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-400"
                    >
                      <option value="waterfalls">Waterfalls</option>
                      <option value="temples">Temples</option>
                      <option value="hills">Hill Stations</option>
                      <option value="food">Food Trails</option>
                      <option value="beaches">Beaches</option>
                      <option value="offroad">Scenic & Offroad</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono mb-1">TAGLINE / STORY</label>
                  <input
                    type="text"
                    value={newPlace.tagline}
                    onChange={(e) => setNewPlace({ ...newPlace, tagline: e.target.value })}
                    placeholder="Short description of the spot..."
                    className="w-full bg-[#0B0F14] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setNewPlaceModalOpen(false)}
                    className="px-4 py-2 bg-white/10 text-white rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold rounded-xl shadow-lg shadow-emerald-500/20"
                  >
                    Save & Publish Node
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
