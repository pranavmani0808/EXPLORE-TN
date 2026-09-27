import React, { useState, useEffect } from "react";
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
import { SupabaseDatabaseRepository, SupabasePlaceRecord } from "@/lib/supabase-database";
import { toast } from "sonner";

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

export function MediaLibraryModule() {
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    async function loadMediaFromDB() {
      const places: SupabasePlaceRecord[] = await SupabaseDatabaseRepository.getPublicPlaces();
      const assets: MediaAsset[] = places
        .filter((p) => p.image_url)
        .map((p, idx) => ({
          id: `media-${p.id || idx}`,
          filename: `${p.slug || p.name.toLowerCase().replace(/ /g, "_")}.jpg`,
          url: p.image_url || "",
          type: "photo" as const,
          size: "1.4 MB",
          resolution: "2048 x 1536",
          format: "JPG" as const,
          uploadedBy: p.created_by || "System Admin",
          uploadedAt: p.created_at ? new Date(p.created_at).toLocaleDateString() : "Database Asset",
          exifGps: { lat: p.latitude, lng: p.longitude, locationName: `${p.name}, ${p.district}` },
          aiTags: [p.category, p.district, "Supabase Verified"],
          usedIn: [{ type: "Place", title: p.name }],
          status: "Verified" as const,
        }));

      setMediaList(assets);
      if (assets.length > 0) setSelectedAsset(assets[0]);
    }
    loadMediaFromDB();
  }, []);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Image CDN URL copied to clipboard!");
  };

  const filtered = mediaList.filter((m) => {
    const matchesSearch =
      m.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.exifGps.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.aiTags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === "all" || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121821] border border-white/15 rounded-3xl p-5 shadow-2xl text-white">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold rounded-full flex items-center gap-1.5">
            <FolderKanban className="size-4" /> MEDIA ASSET LIBRARY (SUPABASE DB)
          </span>
          <span className="text-xs font-mono text-slate-400">{mediaList.length} Verified Media Files</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-3 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search media files by place name, district, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#121821] border border-white/15 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          {["all", "photo", "drone", "video"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl font-bold capitalize transition ${
                typeFilter === t ? "bg-emerald-500 text-black" : "bg-[#121821] text-slate-300 border border-white/10"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Media Grid */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-1">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedAsset(item)}
              className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition ${
                selectedAsset?.id === item.id
                  ? "border-emerald-500 ring-2 ring-emerald-500/30"
                  : "border-white/10 bg-[#121821] hover:border-white/30"
              }`}
            >
              <div className="aspect-video relative bg-slate-900 overflow-hidden">
                <img src={item.url} alt={item.filename} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded-md text-[10px] font-mono text-emerald-400 uppercase">
                  {item.type}
                </span>
              </div>
              <div className="p-3 space-y-1">
                <p className="text-xs font-bold text-white truncate font-mono">{item.filename}</p>
                <p className="text-[10px] text-slate-400 truncate">{item.exifGps.locationName}</p>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 border border-dashed border-white/10 rounded-3xl text-slate-400 text-xs font-mono">
              No media assets match search criteria.
            </div>
          )}
        </div>

        {/* Selected Asset Inspector */}
        <div className="lg:col-span-4 bg-[#121821] border border-white/15 rounded-3xl p-5 shadow-2xl text-white space-y-4">
          {selectedAsset ? (
            <>
              <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 bg-slate-900 relative">
                <img src={selectedAsset.url} alt={selectedAsset.filename} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <h4 className="font-bold text-white text-sm break-all">{selectedAsset.filename}</h4>
                  <p className="text-[10px] text-emerald-400 mt-0.5">{selectedAsset.exifGps.locationName}</p>
                </div>

                <div className="p-3 bg-white/5 rounded-2xl space-y-1.5 text-[11px]">
                  <div className="flex justify-between"><span className="text-slate-400">Format & Res:</span><span className="text-white">{selectedAsset.format} • {selectedAsset.resolution}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Uploaded By:</span><span className="text-white">{selectedAsset.uploadedBy}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">GPS Coordinates:</span><span className="text-emerald-400">{selectedAsset.exifGps.lat.toFixed(4)}, {selectedAsset.exifGps.lng.toFixed(4)}</span></div>
                </div>

                <Button
                  onClick={() => handleCopyUrl(selectedAsset.url)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Copy className="size-3.5" /> Copy Asset CDN URL
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-500 text-xs font-mono">
              Select a media asset to inspect details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
