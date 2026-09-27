import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  CheckCircle2,
  XCircle,
  Sparkles,
  Mountain,
  Landmark,
  Waves,
  Utensils,
  Eye,
  Check,
  X,
  Compass,
  Star,
  ExternalLink,
  ShieldCheck,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SupabaseDatabaseRepository } from "@/lib/supabase-database";
import { toast } from "sonner";

export interface SuggestedPlaceItem {
  id: string;
  name: string;
  district: string;
  category: "hills" | "beaches" | "temples" | "waterfalls" | "food" | "hidden-spots" | "trending";
  submittedBy: string;
  scoutBadge: string;
  latitude: number;
  longitude: number;
  tagline: string;
  description: string;
  image: string;
  submittedAt: string;
  status: "Pending" | "Approved" | "Rejected";
}

export function PlaceSuggestionsModule({ onPlaceApproved }: { onPlaceApproved?: () => void }) {
  const [suggestions, setSuggestions] = useState<SuggestedPlaceItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [showNewModal, setShowNewModal] = useState(false);

  // Form states for new suggestion
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("Madurai");
  const [category, setCategory] = useState<SuggestedPlaceItem["category"]>("hills");
  const [submittedBy, setSubmittedBy] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("10.0000");
  const [lng, setLng] = useState("78.0000");
  const [imageUrl, setImageUrl] = useState("");

  const loadSuggestions = async () => {
    const data = await SupabaseDatabaseRepository.getPlaceSuggestions();
    setSuggestions(data);
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  const handleApprove = async (s: SuggestedPlaceItem) => {
    // 1. Create live record in Supabase DB places table
    await SupabaseDatabaseRepository.createPlace({
      name: s.name,
      district: s.district,
      category: s.category,
      primary_category: s.category,
      latitude: s.latitude,
      longitude: s.longitude,
      tagline: s.tagline,
      description: s.description,
      image_url: s.image,
      rating: 4.9,
      review_count: 1,
      is_verified: true,
      visibility: "public",
      status: "published",
      tags: [s.category, s.district.toLowerCase(), "suggested", "verified"],
    });

    // 2. Update status in Supabase DB place_suggestions table
    await SupabaseDatabaseRepository.updateSuggestionStatus(s.id, "Approved");

    setSuggestions((prev) =>
      prev.map((item) => (item.id === s.id ? { ...item, status: "Approved" } : item))
    );

    toast.success(`Approved "${s.name}"! Published live to Supabase DB & User Web Pages.`);
    if (onPlaceApproved) onPlaceApproved();
  };

  const handleReject = async (id: string, name: string) => {
    await SupabaseDatabaseRepository.updateSuggestionStatus(id, "Rejected");
    setSuggestions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "Rejected" } : item))
    );
    toast.error(`Rejected "${name}" submission.`);
  };

  const handleCreateSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !tagline.trim()) {
      toast.error("Please fill in place name and tagline.");
      return;
    }

    const created = await SupabaseDatabaseRepository.createPlaceSuggestion({
      name,
      district,
      category,
      submittedBy: submittedBy || "District Scout",
      latitude: parseFloat(lat) || 10.0,
      longitude: parseFloat(lng) || 78.0,
      tagline,
      description,
      image: imageUrl || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    });

    setSuggestions((prev) => [created, ...prev]);
    setShowNewModal(false);
    setName("");
    setTagline("");
    setDescription("");
    setImageUrl("");
    toast.success("Place suggestion submitted and saved to Supabase DB!");
  };

  const filtered = suggestions.filter((s) =>
    activeCategory === "All" ? true : s.category.toLowerCase() === activeCategory.toLowerCase()
  );

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* Category Filter Chips & Submit Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {["All", "hills", "beaches", "temples", "waterfalls", "hidden-spots"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition capitalize cursor-pointer ${
                activeCategory === cat
                  ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              {cat === "All" ? "All Suggestions" : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-emerald-400">
            ● {suggestions.filter((s) => s.status === "Pending").length} Pending Scout Suggestions
          </div>
          <Button
            onClick={() => setShowNewModal(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
          >
            <Plus className="size-4" /> Submit Scout Suggestion
          </Button>
        </div>
      </div>

      {/* Grid of Location Suggestions */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="flex flex-col justify-between rounded-3xl border border-zinc-800 bg-[#09090b]/90 p-5 backdrop-blur-2xl shadow-xl transition hover:border-zinc-700"
            >
              <div className="space-y-3">
                <div className="relative h-44 overflow-hidden rounded-2xl border border-zinc-800">
                  <img
                    src={s.image}
                    alt={s.name}
                    className="h-full w-full object-cover transition duration-300 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 rounded-full bg-zinc-950/80 backdrop-blur-md border border-zinc-800 px-3 py-1 text-[11px] font-mono font-bold text-emerald-400 capitalize">
                    {s.category}
                  </div>
                  <div className="absolute top-3 right-3 rounded-full bg-zinc-950/80 backdrop-blur-md border border-zinc-800 px-3 py-1 text-[11px] font-mono text-amber-400">
                    {s.district}
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-bold text-white leading-tight">{s.name}</h4>
                  <p className="mt-1 text-xs text-zinc-400 line-clamp-2">{s.tagline}</p>
                </div>

                <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Scout: <strong className="text-white">{s.submittedBy}</strong></span>
                    <span className="text-[10px] text-amber-400">{s.scoutBadge}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[11px] text-emerald-400">
                    <MapPin className="size-3" />
                    {s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                {s.status === "Pending" ? (
                  <>
                    <button
                      onClick={() => handleReject(s.id, s.name)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                    >
                      <X className="size-3.5" /> Reject
                    </button>
                    <Button
                      onClick={() => handleApprove(s)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-extrabold text-zinc-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20 cursor-pointer"
                    >
                      <Check className="size-4" /> Approve & Publish
                    </Button>
                  </>
                ) : (
                  <div className="w-full text-center text-xs font-mono font-bold py-1 text-emerald-400">
                    ✓ {s.status} to Primary Database
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed border-zinc-800 rounded-3xl bg-[#09090b]/60">
          <MapPin className="size-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-zinc-300">No pending place suggestions in database</p>
          <p className="text-xs text-zinc-500 mt-1 mb-4">Submissions from community scouts will appear here for 1-click approval.</p>
          <Button
            onClick={() => setShowNewModal(true)}
            variant="outline"
            className="text-xs border-zinc-700 text-zinc-300 hover:text-white"
          >
            <Plus className="size-4 mr-1.5 text-emerald-400" /> Submit New Scout Suggestion
          </Button>
        </div>
      )}

      {/* Modal: Create Scout Suggestion */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-[#09090b] p-6 text-white shadow-2xl space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <MapPin className="size-5 text-emerald-400" />
                Submit New Place Suggestion
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateSuggestion} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Place Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manjolai Tea Estate Viewpoint"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">District</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tirunelveli"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="hills">Hills & Mountains</option>
                    <option value="beaches">Beaches & Coastal</option>
                    <option value="temples">Temples & Heritage</option>
                    <option value="waterfalls">Waterfalls</option>
                    <option value="food">Food & Culinary</option>
                    <option value="hidden-spots">Hidden Spots</option>
                    <option value="trending">Trending Places</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Scout / Submitter Name</label>
                <input
                  type="text"
                  placeholder="e.g. GhatExplorer_Ravi"
                  value={submittedBy}
                  onChange={(e) => setSubmittedBy(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Short Tagline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Panoramic tea valley view at 1100m elevation"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Description Detail</label>
                <textarea
                  rows={3}
                  placeholder="Detailed description of place, road condition, opening hours..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Latitude</label>
                  <input
                    type="text"
                    placeholder="10.327"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Longitude</label>
                  <input
                    type="text"
                    placeholder="76.9554"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowNewModal(false)} className="border-zinc-800 text-zinc-400">Cancel</Button>
                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold">Save Suggestion to Supabase</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
