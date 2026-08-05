import React, { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Clock,
  MessageSquare,
  History,
  ShieldCheck,
  Fuel,
  Utensils,
  Car,
  DollarSign,
  Sun,
  AlertTriangle,
  FileSpreadsheet,
  Check,
  X,
  Compass,
} from "lucide-react";
import { places as initialPlaces, Place, CategoryId } from "@/data/places";
import { Button } from "@/components/ui/button";
import { createPlaceNodeBackend, generatePlaceDescriptionAI, uploadMediaAssetPipeline } from "@/lib/api";

export interface PlaceAuditLog {
  id: string;
  who: string;
  what: string;
  when: string;
  ip: string;
}

export interface PlaceComment {
  id: string;
  user: string;
  role: string;
  comment: string;
  time: string;
}

export interface ExtendedPlace extends Place {
  status: "Draft" | "Pending" | "Verified" | "Featured" | "Rejected";
  createdBy: string;
  updatedAt: string;
  lat: number;
  lng: number;
  elevation: string;
  taluk: string;
  village: string;
  auditLogs: PlaceAuditLog[];
  comments: PlaceComment[];
  nearbyPlaces: { name: string; distance: string; type: string }[];
}

const initialExtendedPlaces: ExtendedPlace[] = initialPlaces.map((p, idx) => ({
  ...p,
  status: idx % 2 === 0 ? "Verified" : "Featured",
  createdBy: idx % 2 === 0 ? "Karthik Raja (Place Manager)" : "Arun Kumar (Super Admin)",
  updatedAt: `2026-08-0${(idx % 4) + 1} 09:15 AM`,
  lat: 13.2 - (p.y / 100) * 4.8,
  lng: 76.5 + (p.x / 100) * 3.8,
  elevation: `${2400 + idx * 350} ft`,
  taluk: `${p.district} North`,
  village: `${p.name} Village`,
  auditLogs: [
    { id: "log-1", who: "Arun Kumar", what: "Created spatial node", when: "2026-08-01 08:30 AM", ip: "192.168.1.1" },
    { id: "log-2", who: "Karthik Raja", what: "Updated road condition telemetry", when: "2026-08-03 10:15 AM", ip: "192.168.1.4" },
  ],
  comments: [
    { id: "c-1", user: "Karthik Raja", role: "Place Manager", comment: "Verified entrance parking lot and ticket counter.", time: "Yesterday 4:20 PM" },
    { id: "c-2", user: "Deepa Sundaram", role: "Route Manager", comment: "Road approach has minor gravel patch near hairpin 4.", time: "Today 8:45 AM" },
  ],
  nearbyPlaces: [
    { name: "Agaya Gangai Waterfalls", distance: "4.2 km", type: "Waterfalls" },
    { name: "IOC Karavalli Fuel Station", distance: "7.8 km", type: "Fuel" },
    { name: "Sri Amman Mess", distance: "2.1 km", type: "Food" },
  ],
}));

export function PlacesManagementModule() {
  const [placesList, setPlacesList] = useState<ExtendedPlace[]>(initialExtendedPlaces);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [inspectPlace, setInspectPlace] = useState<ExtendedPlace | null>(placesList[0]);
  const [activeInspectorTab, setActiveInspectorTab] = useState<"details" | "nearby" | "timeline" | "comments">("details");

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [newCommentText, setNewCommentText] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const [wizardData, setWizardData] = useState({
    name: "",
    slug: "",
    category: "waterfalls" as CategoryId,
    district: "Theni",
    taluk: "Periyakulam",
    village: "Kumbakkarai",
    lat: 10.2381,
    lng: 77.4892,
    elevation: "3,400 ft",
    description: "",
    bestSeason: "Oct – Mar",
    entryFee: "₹20",
    timings: "6:00 AM – 5:30 PM",
    roadCondition: "Tarred, narrow 3km",
    parking: "Paid lot ₹30",
    nearbyFuel: "IOC Station 5km",
    nearbyFood: "Local Halwa Stalls",
    heroImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
    status: "Verified" as const,
  });

  const filtered = placesList.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesDistrict = districtFilter === "all" || p.district === districtFilter;
    return matchesSearch && matchesStatus && matchesDistrict;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedPlaces = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedSlugs(paginatedPlaces.map((p) => p.slug));
    } else {
      setSelectedSlugs([]);
    }
  };

  const handleSelectOne = (slug: string) => {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleBulkVerify = () => {
    setPlacesList((prev) =>
      prev.map((p) => (selectedSlugs.includes(p.slug) ? { ...p, status: "Verified" } : p))
    );
    setSelectedSlugs([]);
  };

  const handleBulkDelete = () => {
    setPlacesList((prev) => prev.filter((p) => !selectedSlugs.includes(p.slug)));
    setSelectedSlugs([]);
  };

  const handleExportCSV = () => {
    const headers = "Name,District,Category,Status,Rating,Latitude,Longitude\n";
    const rows = filtered
      .map((p) => `"${p.name}","${p.district}","${p.category}","${p.status}",${p.rating},${p.lat},${p.lng}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `explorertn-places-export-${Date.now()}.csv`;
    a.click();
  };

  const handleWizardSubmit = async () => {
    const backendRes = await createPlaceNodeBackend({
      name: wizardData.name || "New Explorer Spot",
      district: wizardData.district,
      category: wizardData.category,
      coordinates: { latitude: wizardData.lat, longitude: wizardData.lng },
      heroImage: wizardData.heroImage,
    });

    const created: ExtendedPlace = {
      slug: wizardData.name.toLowerCase().replace(/\s+/g, "-") || `place-${Date.now()}`,
      name: wizardData.name || "New Explorer Spot",
      district: wizardData.district,
      category: wizardData.category,
      image: wizardData.heroImage,
      tagline: wizardData.description || "Newly added spatial place node",
      story: wizardData.description || "Verified by ExplorerTN Operations Center.",
      rating: 4.9,
      reviews: 1,
      distanceFromChennai: "480 km",
      difficulty: "Easy",
      bestSeason: wizardData.bestSeason,
      roadCondition: wizardData.roadCondition,
      parking: wizardData.parking,
      entryFee: wizardData.entryFee,
      timings: wizardData.timings,
      safety: "Verified safe",
      weather: "22°C · Clear",
      tips: ["Check timings before arrival"],
      nearbyFood: [wizardData.nearbyFood],
      nearbyFuel: [wizardData.nearbyFuel],
      x: 45,
      y: 55,
      status: wizardData.status,
      createdBy: "Arun Kumar (Super Admin)",
      updatedAt: "Just now",
      lat: wizardData.lat,
      lng: wizardData.lng,
      elevation: wizardData.elevation,
      taluk: wizardData.taluk,
      village: wizardData.village,
      auditLogs: [
        { id: `log-${Date.now()}`, who: "Arun Kumar", what: "Created place node & synced with PostGIS backend", when: "Just now", ip: "192.168.1.1" },
      ],
      comments: [
        { id: `c-${Date.now()}`, user: "Arun Kumar", role: "Super Admin", comment: "Synced live with PostGIS DB.", time: "Just now" },
      ],
      nearbyPlaces: [
        { name: "Nearest Fuel Station", distance: "3.5 km", type: "Fuel" },
        { name: "Local Highway Diner", distance: "1.8 km", type: "Food" },
      ],
    };

    setPlacesList([created, ...placesList]);
    setInspectPlace(created);
    setWizardOpen(false);
    setWizardStep(1);
  };

  const handleAIGenerateStory = async () => {
    setIsGeneratingAI(true);
    const result = await generatePlaceDescriptionAI(wizardData.name || "Waterfall Spot", wizardData.district);
    setWizardData((prev) => ({ ...prev, description: result.text }));
    setIsGeneratingAI(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploaded = await uploadMediaAssetPipeline(file);
    setWizardData((prev) => ({ ...prev, heroImage: uploaded.url }));
  };

  const handleAddComment = () => {
    if (!newCommentText.trim() || !inspectPlace) return;
    const newComment: PlaceComment = {
      id: `c-${Date.now()}`,
      user: "Arun Kumar",
      role: "Super Admin",
      comment: newCommentText,
      time: "Just now",
    };
    const updated = { ...inspectPlace, comments: [...inspectPlace.comments, newComment] };
    setInspectPlace(updated);
    setPlacesList((prev) => prev.map((p) => (p.slug === inspectPlace.slug ? updated : p)));
    setNewCommentText("");
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Places Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121821] border border-white/15 rounded-3xl p-5 shadow-2xl text-white">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3.5 top-2.5 size-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search places or districts..."
              className="w-full bg-[#0B0F14] border border-white/15 rounded-2xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 font-medium"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0B0F14] border border-white/15 text-xs text-white rounded-2xl px-3 py-2 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified</option>
            <option value="featured">Featured</option>
            <option value="pending">Pending</option>
          </select>

          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="bg-[#0B0F14] border border-white/15 text-xs text-white rounded-2xl px-3 py-2 focus:outline-none"
          >
            <option value="all">All Districts</option>
            <option value="Theni">Theni</option>
            <option value="Thanjavur">Thanjavur</option>
            <option value="Namakkal">Namakkal</option>
            <option value="Dindigul">Dindigul</option>
            <option value="Ramanathapuram">Ramanathapuram</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="border-white/15 text-white hover:bg-white/10 text-xs rounded-2xl font-bold"
          >
            <FileSpreadsheet className="size-4 mr-1 text-emerald-400" /> Export CSV
          </Button>

          <Button
            onClick={() => setWizardOpen(true)}
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-500/20"
          >
            <Plus className="size-4 mr-1" /> Add Place Wizard
          </Button>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedSlugs.length > 0 && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-emerald-300 font-mono">
          <span>{selectedSlugs.length} Place(s) Selected</span>
          <div className="flex items-center gap-2">
            <button onClick={handleBulkVerify} className="px-3 py-1.5 bg-emerald-500 text-black font-bold rounded-xl text-xs">
              Bulk Verify Selected
            </button>
            <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold rounded-xl text-xs">
              Bulk Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="bg-[#121821] border border-white/15 rounded-3xl overflow-hidden shadow-2xl text-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-mono">
                  <th className="p-4 w-10">
                    <input type="checkbox" onChange={handleSelectAll} className="rounded" />
                  </th>
                  <th className="p-4">HERO IMAGE & NAME</th>
                  <th className="p-4">DISTRICT</th>
                  <th className="p-4">CATEGORY</th>
                  <th className="p-4">STATUS</th>
                  <th className="p-4">RATING</th>
                  <th className="p-4">LAST UPDATED</th>
                  <th className="p-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {paginatedPlaces.map((p) => (
                  <tr
                    key={p.slug}
                    onClick={() => setInspectPlace(p)}
                    className={`hover:bg-white/5 transition cursor-pointer ${
                      inspectPlace?.slug === p.slug ? "bg-emerald-500/10" : ""
                    }`}
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedSlugs.includes(p.slug)}
                        onChange={() => handleSelectOne(p.slug)}
                        className="rounded"
                      />
                    </td>
                    <td className="p-4 font-bold text-white flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="size-10 rounded-xl object-cover shrink-0" />
                      <div>
                        <p className="font-bold text-sm text-white">{p.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{p.createdBy}</p>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300 font-medium">{p.district}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 font-bold uppercase text-[10px] rounded-full">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-bold ${
                          p.status === "Featured"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-amber-400 font-mono">★ {p.rating}</td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">{p.updatedAt}</td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to="/place/$slug"
                          params={{ slug: p.slug }}
                          className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl transition"
                        >
                          <Eye className="size-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setPlacesList((prev) => prev.filter((x) => x.slug !== p.slug));
                          }}
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

          <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Showing page {currentPage} of {totalPages || 1} ({filtered.length} Total Items)</span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-white/5 disabled:opacity-30 rounded-xl font-bold text-white flex items-center gap-1"
              >
                <ChevronLeft className="size-3.5" /> Previous
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 bg-white/5 disabled:opacity-30 rounded-xl font-bold text-white flex items-center gap-1"
              >
                Next <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* GIS Place Inspector Drawer */}
        {inspectPlace && (
          <div className="bg-[#121821] border border-white/15 rounded-3xl p-5 shadow-2xl text-white space-y-4 sticky top-28 h-fit">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full uppercase font-mono">
                {inspectPlace.category}
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="size-3.5" /> {inspectPlace.status}
              </span>
            </div>

            <img src={inspectPlace.image} alt={inspectPlace.name} className="w-full h-36 rounded-2xl object-cover" />

            <div>
              <h3 className="text-base font-black text-white">{inspectPlace.name}</h3>
              <p className="text-xs text-slate-400">{inspectPlace.district} • Taluk: {inspectPlace.taluk}</p>
            </div>

            <div className="flex border-b border-white/10 pb-2 gap-2 text-xs font-mono">
              {(["details", "nearby", "timeline", "comments"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveInspectorTab(t)}
                  className={`px-2.5 py-1 rounded-xl font-bold capitalize transition ${
                    activeInspectorTab === t ? "bg-emerald-500 text-black" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {activeInspectorTab === "details" && (
              <div className="space-y-3 text-xs font-mono animate-in fade-in duration-200">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[9px] text-slate-400">LATITUDE</p>
                    <p className="font-bold text-emerald-400">{inspectPlace.lat.toFixed(4)}° N</p>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[9px] text-slate-400">LONGITUDE</p>
                    <p className="font-bold text-emerald-400">{inspectPlace.lng.toFixed(4)}° E</p>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[9px] text-slate-400">ELEVATION</p>
                    <p className="font-bold text-white">{inspectPlace.elevation}</p>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[9px] text-slate-400">ENTRY FEE</p>
                    <p className="font-bold text-white">{inspectPlace.entryFee}</p>
                  </div>
                </div>
              </div>
            )}

            {activeInspectorTab === "nearby" && (
              <div className="space-y-2 text-xs font-mono animate-in fade-in duration-200">
                <p className="text-[10px] text-emerald-400 font-bold uppercase">PostGIS Proximity Engine (25km)</p>
                {inspectPlace.nearbyPlaces.map((np) => (
                  <div key={np.name} className="p-2.5 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{np.name}</p>
                      <p className="text-[10px] text-slate-400">{np.type}</p>
                    </div>
                    <span className="text-emerald-400 font-bold">{np.distance}</span>
                  </div>
                ))}
              </div>
            )}

            {activeInspectorTab === "timeline" && (
              <div className="space-y-2 text-xs font-mono animate-in fade-in duration-200 max-h-48 overflow-y-auto">
                <p className="text-[10px] text-emerald-400 font-bold uppercase">Revision History Audit Trail</p>
                {inspectPlace.auditLogs.map((log) => (
                  <div key={log.id} className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                    <p className="font-bold text-white">{log.what}</p>
                    <p className="text-[10px] text-slate-400">{log.who} • {log.when}</p>
                  </div>
                ))}
              </div>
            )}

            {activeInspectorTab === "comments" && (
              <div className="space-y-3 text-xs animate-in fade-in duration-200">
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {inspectPlace.comments.map((c) => (
                    <div key={c.id} className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="font-bold text-emerald-400">{c.user} ({c.role})</span>
                        <span className="text-slate-400">{c.time}</span>
                      </div>
                      <p className="text-slate-200 mt-1">{c.comment}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Add operational note..."
                    className="w-full bg-[#0B0F14] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                  <button onClick={handleAddComment} className="px-3 py-1.5 bg-emerald-500 text-black font-bold rounded-xl text-xs">
                    Post
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MULTI-STEP WIZARD MODAL */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-sans">
          <div className="relative w-full max-w-2xl bg-[#121821] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">6-STEP PLACE CREATION WIZARD</span>
                <h3 className="text-xl font-extrabold text-white">
                  Step {wizardStep} of 6: {
                    ["Basic Information", "Map Location & Coordinates", "Details & Timings", "Facilities & Access", "Media & Gallery", "Verification & Publish"][wizardStep - 1]
                  }
                </h3>
              </div>
              <button onClick={() => setWizardOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-6 gap-1.5 mb-6">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all ${
                    wizardStep >= s ? "bg-emerald-500 shadow-sm shadow-emerald-500/30" : "bg-white/10"
                  }`}
                />
              ))}
            </div>

            {wizardStep === 1 && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Place Name</label>
                  <input
                    type="text"
                    value={wizardData.name}
                    onChange={(e) => setWizardData({ ...wizardData, name: e.target.value })}
                    placeholder="e.g. Suruli Secret Waterfalls"
                    className="w-full bg-[#0B0F14] border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Category</label>
                    <select
                      value={wizardData.category}
                      onChange={(e) => setWizardData({ ...wizardData, category: e.target.value as CategoryId })}
                      className="w-full bg-[#0B0F14] border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-400"
                    >
                      <option value="waterfalls">Waterfalls</option>
                      <option value="temples">Temples</option>
                      <option value="hills">Hill Stations</option>
                      <option value="food">Food Trails</option>
                      <option value="beaches">Beaches</option>
                      <option value="offroad">Scenic & Offroad</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">District</label>
                    <input
                      type="text"
                      value={wizardData.district}
                      onChange={(e) => setWizardData({ ...wizardData, district: e.target.value })}
                      className="w-full bg-[#0B0F14] border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-4 text-xs font-mono">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 flex items-center justify-between">
                  <span>Interactive Map Picker: Drop pin & sync PostGIS coordinates</span>
                  <span className="font-bold">PostGIS Engine</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">LATITUDE</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={wizardData.lat}
                      onChange={(e) => setWizardData({ ...wizardData, lat: parseFloat(e.target.value) || 10.0 })}
                      className="w-full bg-[#0B0F14] border border-white/15 rounded-xl p-2.5 text-emerald-400 font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">LONGITUDE</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={wizardData.lng}
                      onChange={(e) => setWizardData({ ...wizardData, lng: parseFloat(e.target.value) || 77.0 })}
                      className="w-full bg-[#0B0F14] border border-white/15 rounded-xl p-2.5 text-emerald-400 font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">ELEVATION</label>
                    <input
                      type="text"
                      value={wizardData.elevation}
                      onChange={(e) => setWizardData({ ...wizardData, elevation: e.target.value })}
                      className="w-full bg-[#0B0F14] border border-white/15 rounded-xl p-2.5 text-white font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 font-bold">Story / Description</label>
                  <button
                    onClick={handleAIGenerateStory}
                    disabled={isGeneratingAI}
                    className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-bold rounded-xl flex items-center gap-1 hover:bg-emerald-500/30 transition"
                  >
                    <Sparkles className="size-3" /> {isGeneratingAI ? "Generating Gemini AI Guide..." : "Generate with Gemini AI"}
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={wizardData.description}
                  onChange={(e) => setWizardData({ ...wizardData, description: e.target.value })}
                  placeholder="Provide historical context and trail story..."
                  className="w-full bg-[#0B0F14] border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            )}

            {wizardStep === 5 && (
              <div className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 font-sans">Hero Image URL</label>
                  <input
                    type="text"
                    value={wizardData.heroImage}
                    onChange={(e) => setWizardData({ ...wizardData, heroImage: e.target.value })}
                    className="w-full bg-[#0B0F14] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>

                <label className="p-8 border-2 border-dashed border-white/20 rounded-2xl text-center bg-white/5 hover:bg-white/10 transition cursor-pointer block">
                  <Upload className="size-8 text-emerald-400 mx-auto mb-2" />
                  <p className="font-bold text-white font-sans">Upload Local Photo File (WebP Pipeline)</p>
                  <p className="text-[10px] text-slate-400 mt-1">Converts image to DataURL & extracts EXIF GPS</p>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            )}

            {wizardStep === 6 && (
              <div className="space-y-4 text-xs font-sans">
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex gap-3">
                  <img src={wizardData.heroImage} alt="Hero Preview" className="size-20 rounded-xl object-cover shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full uppercase font-mono">
                      {wizardData.category}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">{wizardData.name || "Untitled Place"}</h4>
                    <p className="text-xs text-slate-400">{wizardData.district} • {wizardData.elevation}</p>
                  </div>
                </div>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 font-mono text-[11px]">
                  ✓ Verified by Operations Center (Arun Kumar) • Synced to PostGIS Backend DB
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-6 font-mono text-xs">
              <button
                disabled={wizardStep === 1}
                onClick={() => setWizardStep((s) => Math.max(1, s - 1) as any)}
                className="px-4 py-2 bg-white/10 disabled:opacity-30 text-white font-bold rounded-xl flex items-center gap-1"
              >
                <ChevronLeft className="size-4" /> Back
              </button>

              {wizardStep < 6 ? (
                <button
                  onClick={() => setWizardStep((s) => Math.min(6, s + 1) as any)}
                  className="px-5 py-2 bg-emerald-500 text-black font-extrabold rounded-xl flex items-center gap-1 shadow-lg shadow-emerald-500/20"
                >
                  Next Step <ChevronRight className="size-4" />
                </button>
              ) : (
                <button
                  onClick={handleWizardSubmit}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-black rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1"
                >
                  <Check className="size-4" /> Save & Sync PostGIS Node
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
