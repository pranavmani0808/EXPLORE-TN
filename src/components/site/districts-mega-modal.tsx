import { useState, useMemo, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Search,
  MapPin,
  Sparkles,
  Mountain,
  Landmark,
  Waves,
  Trees,
  Compass,
  ArrowRight,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { getAllDistrictsDetailed, DistrictData } from "@/lib/data/districts";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface DistrictsMegaModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: "en" | "ta";
}

import { RegionalTravelDiscovery } from "./regional-travel-discovery";

type CategoryFilter = "all" | "trending" | "october" | "hills" | "temples" | "beaches" | "shopping" | "ghats" | "heritage";
type ViewMode = "spots" | "regional";

export function DistrictsMegaModal({ isOpen, onClose, lang = "en" }: DistrictsMegaModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("spots");

  const allDistricts = useMemo(() => getAllDistrictsDetailed(), []);

  useGSAP(
    () => {
      if (!isOpen || !modalRef.current) return;
      const cards = modalRef.current.querySelectorAll(".gsap-district-card");
      if (!cards || cards.length === 0) return;

      // Ensure all 38 district cards are immediately 100% visible with zero scroll delay or opacity hiding
      gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
    },
    { scope: modalRef, dependencies: [isOpen, activeCategory, searchQuery, viewMode] }
  );

  const allSpots = useMemo(() => {
    return CANONICAL_PLACES.map((p) => ({
      id: p.id || p.slug,
      name: p.canonicalName || p.name,
      district: p.district,
      category: (p.primaryCategory || "attraction").toUpperCase(),
      primaryCategory: (p.primaryCategory || "attraction").toLowerCase(),
      tagline: p.tagline || `Famous destination spot in ${p.district}`,
      image: p.image || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80",
      rating: p.rating || 4.7,
      tags: p.tags || [],
      slug: p.slug,
    }));
  }, []);

  const filteredSpots = useMemo(() => {
    return allSpots.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (activeCategory === "trending") {
        return (
          s.slug.includes("falls") ||
          s.slug.includes("ooty") ||
          s.slug.includes("kodai") ||
          s.slug.includes("meenakshi") ||
          s.slug.includes("hogenakkal") ||
          s.rating >= 4.7
        );
      }

      if (activeCategory === "october") {
        return (
          s.primaryCategory.includes("waterfall") ||
          s.primaryCategory.includes("hill") ||
          s.slug.includes("falls") ||
          s.slug.includes("ooty") ||
          s.slug.includes("kodai") ||
          s.slug.includes("pykara")
        );
      }

      if (activeCategory === "hills") {
        return s.primaryCategory.includes("hill") || s.primaryCategory.includes("mountain") || s.tags.includes("peak") || s.slug.includes("ooty") || s.slug.includes("kodai");
      }

      if (activeCategory === "temples") {
        return s.primaryCategory.includes("temple") || s.primaryCategory.includes("heritage") || s.tags.includes("temple");
      }

      if (activeCategory === "beaches") {
        return s.primaryCategory.includes("beach") || s.primaryCategory.includes("coastal") || s.tags.includes("beach");
      }

      if (activeCategory === "shopping") {
        return s.primaryCategory.includes("shopping") || s.tags.includes("shopping") || s.tags.includes("street-shopping");
      }

      if (activeCategory === "ghats") {
        return s.district.toLowerCase().includes("nilgiris") || s.district.toLowerCase().includes("dindigul") || s.district.toLowerCase().includes("coimbatore") || s.district.toLowerCase().includes("tenkasi") || s.district.toLowerCase().includes("theni");
      }

      if (activeCategory === "heritage") {
        return s.primaryCategory.includes("heritage") || s.slug.includes("fort") || s.slug.includes("palace");
      }

      return true;
    });
  }, [allSpots, searchQuery, activeCategory]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col bg-[#09090b]/98 backdrop-blur-2xl text-white overflow-hidden font-sans"
      >
        {/* Top Header & Controls */}
        <div className="shrink-0 border-b border-zinc-800 bg-[#09090b]/90 px-6 py-4 sm:px-10">
          <div className="mx-auto flex max-w-[1500px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Title & Badge */}
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10">
                <Compass className="size-6 text-amber-400" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-2xl font-extrabold text-white tracking-tight">
                    {lang === "ta" ? "தமிழ்நாடு சுற்றுலா இடங்கள்" : "Explore Places & Famous Spots"}
                  </h2>
                  <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-0.5 text-xs font-mono font-bold text-amber-400">
                    {filteredSpots.length} {lang === "ta" ? "இடங்கள்" : "Spots"}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {lang === "ta"
                    ? "குற்றாலம் அருவி, சுருளி அருவி, மீனாட்சி அம்மன் கோவில் போன்ற தமிழ்நாட்டின் சிறந்த தலங்கள்."
                    : "Individual tourist spots, waterfalls, hill peaks, and heritage places across Tamil Nadu."}
                </p>
              </div>
            </div>

            {/* Search Input & Mode Switcher & Close Button */}
            <div className="flex flex-wrap items-center gap-3">
              {/* View Mode Switcher */}
              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setViewMode("spots")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer",
                    viewMode === "spots"
                      ? "bg-amber-400 text-zinc-950 shadow font-black"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  <Compass className="size-3.5" />
                  <span>All Spots</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("regional")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer",
                    viewMode === "regional"
                      ? "bg-emerald-500 text-slate-950 shadow font-black"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  <Compass className="size-3.5" />
                  <span>Regional Travel Hubs</span>
                </button>
              </div>

              {/* Search Bar (Only shown in spots mode) */}
              {viewMode === "spots" && (
                <div className="relative flex-1 md:w-80">
                  <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder={lang === "ta" ? "இடங்களைத் தேடுக (எ.கா: குற்றாலம் அருவி)..." : "Search spot name (e.g. Courtallam, Suruli Falls, Ooty)..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="grid size-10 place-items-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
                aria-label="Close spots modal"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Category Filter Chips Bar (Shown in spots mode only) */}
          {viewMode === "spots" && (
            <div className="mx-auto mt-4 flex max-w-[1500px] items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { key: "trending", label: lang === "ta" ? "🔥 பிரபலமான இடங்கள்" : "🔥 Trending Spots", icon: Sparkles },
                { key: "october", label: lang === "ta" ? "📅 அக்டோபர் மாத உலா" : "📅 Best for October", icon: Sparkles },
                { key: "all", label: lang === "ta" ? "அனைத்து இடங்கள்" : "All Famous Spots", icon: Compass },
                { key: "hills", label: lang === "ta" ? "மலைவாசல் ⛰️" : "Hill Stations ⛰️", icon: Mountain },
                { key: "temples", label: lang === "ta" ? "கோவில்கள் 🛕" : "Heritage Temples 🛕", icon: Landmark },
                { key: "beaches", label: lang === "ta" ? "கடற்கரைகள் 🏖️" : "Beaches & Coast 🏖️", icon: Waves },
                { key: "shopping", label: lang === "ta" ? "வாங்குமிடம் 🛍️" : "Shopping & Bazaars 🛍️", icon: Sparkles },
                { key: "ghats", label: lang === "ta" ? "மேற்குத் தொடர்ச்சி 🌲" : "Western Ghats 🌲", icon: Trees },
                { key: "heritage", label: lang === "ta" ? "பாரம்பரியம் 🏰" : "Palaces & Forts 🏰", icon: Sparkles },
              ].map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key as CategoryFilter)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold shrink-0 transition border cursor-pointer",
                      isActive
                        ? "bg-amber-400 text-zinc-950 border-amber-300 font-extrabold shadow-md shadow-amber-500/20"
                        : "bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white"
                    )}
                  >
                    <Icon className={cn("size-3.5", isActive ? "text-zinc-950" : "text-amber-400")} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Main Body */}
        <div className="relative flex-1 overflow-hidden p-6 sm:p-8">
          {viewMode === "regional" ? (
            <div className="h-full overflow-y-auto pr-1">
              <RegionalTravelDiscovery
                initialOriginId="coimbatore"
                onSelectPlaceForPlanner={(place, origin) => {
                  onClose();
                  if (typeof window !== "undefined") {
                    window.location.href = `/planner?destination=${encodeURIComponent(place.canonicalName)}&origin=${encodeURIComponent(origin.name)}`;
                  }
                }}
              />
            </div>
          ) : filteredSpots.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center p-12">
              <Search className="size-12 text-zinc-600 mb-4" />
              <h3 className="text-lg font-bold text-white mb-1">No spots found</h3>
              <p className="text-xs text-zinc-400 max-w-sm">
                We couldn't find any spot matching "{searchQuery}". Try searching for "Courtallam", "Suruli", "Ooty", "Temple", or "Waterfall".
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="mt-4 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-300 transition"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            /* Structured 4-Column Spot Grid View */
            <div className="districts-scroll-container h-full overflow-y-auto pr-2">
              <div className="mx-auto max-w-[1500px] grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-12">
                {filteredSpots.map((spot) => (
                  <SpotGridCard key={spot.id} spot={spot} onClose={onClose} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="shrink-0 border-t border-zinc-800 bg-[#09090b]/90 px-6 py-3 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="inline-block size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-zinc-300">
              Click any spot card to open its trip planning & route details
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 font-mono text-[11px] text-zinc-400">
            <span>ExploreTN Spatial GIS</span>
            <span>{filteredSpots.length} Spots Active</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

import { CANONICAL_PLACES } from "@/lib/data/canonical-places";

// Single Individual Spot Card
function SpotGridCard({ spot, onClose }: { spot: any; onClose: () => void }) {
  return (
    <Link
      to="/planner"
      search={{ destination: spot.name }}
      onClick={onClose}
      className="gsap-district-card group relative flex flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-[#18181b] p-4 transition-all duration-300 hover:border-emerald-400/60 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
    >
      <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-zinc-900">
        <img
          src={spot.image}
          alt={spot.name}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-transparent to-transparent" />

        {/* Category Tag */}
        <span className="absolute top-3 left-3 rounded-full bg-zinc-950/85 backdrop-blur-md border border-zinc-800 px-3 py-1 text-[10px] font-extrabold text-emerald-400 uppercase">
          {spot.category || "ATTRACTION"}
        </span>

        {/* District Tag */}
        <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-amber-400 font-black px-2.5 py-1 text-[10px] text-zinc-950 shadow-md">
          <MapPin className="size-3 fill-zinc-950" />
          {spot.district}
        </span>
      </div>

      <div className="mt-3.5 flex flex-1 flex-col justify-between">
        <div>
          <h3 className="font-display text-base font-black text-white group-hover:text-emerald-300 transition-colors tracking-tight">
            {spot.name}
          </h3>
          <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">{spot.tagline}</p>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <span className="rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
              📍 {spot.district} District
            </span>
            <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
              ★ {spot.rating}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs font-bold text-emerald-400 pt-3 border-t border-zinc-800/80 group-hover:text-emerald-300">
          <span>Plan Trip to Spot</span>
          <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
