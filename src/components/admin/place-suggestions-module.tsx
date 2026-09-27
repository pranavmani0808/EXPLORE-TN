import React, { useState } from "react";
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

const INITIAL_SUGGESTIONS: SuggestedPlaceItem[] = [
  {
    id: "sug-1",
    name: "Valparai 40-Hairpins Sunset Point",
    district: "Coimbatore",
    category: "hills",
    submittedBy: "GhatRider_Vimal",
    scoutBadge: "Level 18 Western Ghats Scout",
    latitude: 10.327,
    longitude: 76.9554,
    tagline: "Unobstructed sunset viewpoint overlooking tea valley ghats",
    description: "Located at hairpin bend 28 on Pollachi-Valparai road. Features tea garden panoramic view and parking cove.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    submittedAt: "15 mins ago",
    status: "Pending",
  },
  {
    id: "sug-2",
    name: "Suruli Upper Forest Stream Cascade",
    district: "Theni",
    category: "waterfalls",
    submittedBy: "Deepa_NatureScout",
    scoutBadge: "Verified District Editor",
    latitude: 9.684,
    longitude: 77.2915,
    tagline: "Hidden 3-tier cascade inside Suruli forest reserve",
    description: "Located 1.5 km upstream from Suruli main falls. Requires 25-minute jungle walk along marked stream trail.",
    image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1000&q=80",
    submittedAt: "40 mins ago",
    status: "Pending",
  },
  {
    id: "sug-3",
    name: "Punnainallur Mariamman Temple",
    district: "Thanjavur",
    category: "temples",
    submittedBy: "Heritage_Karthik",
    scoutBadge: "Chola Architecture Specialist",
    latitude: 10.785,
    longitude: 79.182,
    tagline: "300-Year-Old Chola Nayak mud idol shrine near Thanjavur",
    description: "Historic shrine built by Venkoji Maharaja. Famous for white stone gopuram and medicinal earth idol.",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
    submittedAt: "2 hours ago",
    status: "Pending",
  },
  {
    id: "sug-4",
    name: "Silver Beach Promenade Sunset Point",
    district: "Cuddalore",
    category: "beaches",
    submittedBy: "CoastLine_Suresh",
    scoutBadge: "Coromandel Trail Scout",
    latitude: 11.748,
    longitude: 79.779,
    tagline: "Second longest natural beach in Tamil Nadu",
    description: "Clean golden sand coast with lighthouse view and sea promenade walkway.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    submittedAt: "Yesterday",
    status: "Pending",
  },
];

export function PlaceSuggestionsModule({ onPlaceApproved }: { onPlaceApproved?: () => void }) {
  const [suggestions, setSuggestions] = useState<SuggestedPlaceItem[]>(INITIAL_SUGGESTIONS);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const handleApprove = async (s: SuggestedPlaceItem) => {
    // Save directly to Supabase DB & Memory Cache
    const created = await SupabaseDatabaseRepository.createPlace({
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

    setSuggestions((prev) =>
      prev.map((item) => (item.id === s.id ? { ...item, status: "Approved" } : item))
    );

    toast.success(`Approved "${s.name}"! Published live to Supabase DB & User Web Pages.`);
    if (onPlaceApproved) onPlaceApproved();
  };

  const handleReject = (id: string, name: string) => {
    setSuggestions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "Rejected" } : item))
    );
    toast.error(`Rejected "${name}" submission.`);
  };

  const filtered = suggestions.filter((s) =>
    activeCategory === "All" ? true : s.category.toLowerCase() === activeCategory.toLowerCase()
  );

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* Category Filter Chips */}
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

        <div className="text-xs font-mono text-emerald-400">
          ● {suggestions.filter((s) => s.status === "Pending").length} Pending Scout Suggestions
        </div>
      </div>

      {/* Grid of Location Suggestions */}
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
    </div>
  );
}
