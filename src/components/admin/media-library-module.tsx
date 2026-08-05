import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FolderKanban,
  Upload,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Tag,
  MapPin,
  Eye,
  Trash2,
  Sparkles,
  FileImage,
  Video,
  Info,
  Maximize2,
  Copy,
  Layers,
  ShieldCheck,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  type: "photo" | "video" | "drone" | "360";
  size: string;
  resolution: string;
  format: "WebP" | "AVIF" | "MP4" | "JPG";
  uploadedBy: string;
  uploadedAt: string;
  exifGps: { lat: number; lng: number; locationName: string };
  aiTags: string[];
  usedIn: { type: string; title: string }[];
  duplicateWarning?: string;
  status: "Verified" | "Pending" | "Flagged";
}

const initialMediaAssets: MediaAsset[] = [
  {
    id: "media-1",
    filename: "kolli_agaya_gangai_drone.webp",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
    type: "drone",
    size: "2.3 MB",
    resolution: "3840 x 2160 (4K)",
    format: "WebP",
    uploadedBy: "RiderKarthik",
    uploadedAt: "2026-08-03 10:15 AM",
    exifGps: { lat: 11.2721, lng: 78.3412, locationName: "Kolli Hills, Namakkal" },
    aiTags: ["Waterfalls", "Mountain Basin", "Drone View", "Monsoon Flow"],
    usedIn: [
      { type: "Place", title: "Kolli Hills 70 Hairpins" },
      { type: "Route", title: "Salem → Kolli Hills Loop" },
      { type: "Story", title: "Top 10 Waterfall Runs in TN" },
    ],
    status: "Verified",
  },
  {
    id: "media-2",
    filename: "valparai_tea_estate_fog.webp",
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
    type: "photo",
    size: "1.8 MB",
    resolution: "2560 x 1440",
    format: "WebP",
    uploadedBy: "Deepa Sundaram",
    uploadedAt: "2026-08-02 04:20 PM",
    exifGps: { lat: 10.3262, lng: 76.9554, locationName: "Valparai Plateau, Coimbatore" },
    aiTags: ["Tea Estate", "Mist & Fog", "Ghat Road", "Scenic Viewpoint"],
    usedIn: [
      { type: "Place", title: "Valparai Tea Gardens" },
      { type: "Route", title: "Coimbatore → Valparai Climb" },
    ],
    status: "Verified",
  },
  {
    id: "media-3",
    filename: "suruli_falls_monsoon_stream.mp4",
    url: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&q=80",
    type: "video",
    size: "42.5 MB",
    resolution: "1920 x 1080 (1080p)",
    format: "MP4",
    uploadedBy: "TamilExplorer_TN",
    uploadedAt: "Today 08:30 AM",
    exifGps: { lat: 9.6644, lng: 77.2912, locationName: "Suruli Falls, Theni" },
    aiTags: ["Suruli Falls", "Monsoon Discharge", "Video Reel"],
    usedIn: [{ type: "Place", title: "Suruli Secret Basin" }],
    duplicateWarning: "Similar file found: suruli_basin_v2.mp4 (94% match)",
    status: "Pending",
  },
];

export function MediaLibraryModule() {
  const [mediaList, setMediaList] = useState<MediaAsset[]>(initialMediaAssets);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(initialMediaAssets[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isUploading, setIsUploading] = useState(false);

  const filteredMedia = mediaList.filter((m) => {
    const matchesSearch =
      m.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.aiTags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === "all" || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleSimulatedUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      const newAsset: MediaAsset = {
        id: `media-${Date.now()}`,
        filename: "agaya_gangai_drone_view.webp",
        url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
        type: "drone",
        size: "3.1 MB",
        resolution: "3840 x 2160 (4K)",
        format: "WebP",
        uploadedBy: "Arun Kumar (Super Admin)",
        uploadedAt: "Just now",
        exifGps: { lat: 11.2750, lng: 78.3420, locationName: "Namakkal Plateau" },
        aiTags: ["Gemini Vision Tagged", "Aerial Drone", "High Basin", "Waterfalls"],
        usedIn: [{ type: "Place", title: "Agaya Gangai Basin" }],
        status: "Verified",
      };
      setMediaList([newAsset, ...mediaList]);
      setSelectedAsset(newAsset);
      setIsUploading(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* DAM Header & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121821] border border-white/15 rounded-3xl p-5 shadow-2xl text-white">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold rounded-full flex items-center gap-1.5">
            <FolderKanban className="size-4" /> DIGITAL ASSET MANAGEMENT (DAM)
          </span>

          <div className="relative w-64">
            <Search className="absolute left-3.5 top-2.5 size-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets or AI tags..."
              className="w-full bg-[#0B0F14] border border-white/15 rounded-2xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#0B0F14] border border-white/15 text-xs text-white rounded-2xl px-3 py-2 focus:outline-none"
          >
            <option value="all">All Media Types</option>
            <option value="photo">Photos</option>
            <option value="drone">Drone Footage</option>
            <option value="video">Videos</option>
          </select>
        </div>

        <Button
          onClick={handleSimulatedUpload}
          disabled={isUploading}
          className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-500/20"
        >
          <Upload className="size-4 mr-1" /> {isUploading ? "Auto-Tagging with Gemini..." : "+ Upload & Auto-Tag"}
        </Button>
      </div>

      {/* Main Grid & Image Inspector */}
      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* Media Assets Grid */}
        <div className="bg-[#121821] border border-white/15 rounded-3xl p-5 shadow-2xl text-white">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredMedia.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedAsset(m)}
                className={`relative group rounded-2xl overflow-hidden border transition cursor-pointer bg-white/5 ${
                  selectedAsset?.id === m.id ? "border-emerald-400 ring-2 ring-emerald-500/40" : "border-white/10 hover:border-white/30"
                }`}
              >
                <img src={m.url} alt={m.filename} className="w-full h-36 object-cover group-hover:scale-105 transition duration-300" />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded-full text-[9px] font-mono font-bold text-white uppercase">
                  {m.type}
                </div>
                <div className="p-2.5">
                  <p className="font-bold text-xs text-white truncate">{m.filename}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{m.size} • {m.format}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Media Asset Inspector Drawer */}
        {selectedAsset && (
          <div className="bg-[#121821] border border-white/15 rounded-3xl p-5 shadow-2xl text-white space-y-4 sticky top-28 h-fit">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-mono uppercase">
                {selectedAsset.type} ASSET
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">● {selectedAsset.status}</span>
            </div>

            <img src={selectedAsset.url} alt={selectedAsset.filename} className="w-full h-44 rounded-2xl object-cover" />

            <div>
              <p className="font-extrabold text-sm text-white">{selectedAsset.filename}</p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedAsset.resolution} • {selectedAsset.size}</p>
            </div>

            {/* EXIF GPS Location Validation */}
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1 font-mono text-xs">
              <p className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                <MapPin className="size-3" /> EXIF GPS Location Verified
              </p>
              <p className="font-bold text-white">{selectedAsset.exifGps.locationName}</p>
              <p className="text-[10px] text-slate-400">{selectedAsset.exifGps.lat}° N, {selectedAsset.exifGps.lng}° E</p>
            </div>

            {/* Gemini Vision AI Auto-Tags */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono text-slate-400 font-bold uppercase flex items-center gap-1">
                <Sparkles className="size-3 text-emerald-400" /> Gemini Vision Auto-Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedAsset.aiTags.map((tag) => (
                  <span key={tag} className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold rounded-lg">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Media Usage References */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono text-slate-400 font-bold uppercase">USED IN ({selectedAsset.usedIn.length} PLACES/ROUTES)</p>
              <div className="space-y-1 font-mono text-xs">
                {selectedAsset.usedIn.map((u) => (
                  <div key={u.title} className="p-2 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                    <span className="text-slate-200 font-bold truncate">{u.title}</span>
                    <span className="text-[10px] text-emerald-400">{u.type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delete Warning if used */}
            <Button
              onClick={() => setMediaList((prev) => prev.filter((x) => x.id !== selectedAsset.id))}
              variant="outline"
              className="w-full border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-bold rounded-xl"
            >
              <Trash2 className="size-4 mr-1" /> Delete Media Asset
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
