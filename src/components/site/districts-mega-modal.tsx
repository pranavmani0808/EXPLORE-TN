import { useState, useMemo, useRef, useEffect } from "react";
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
  SlidersHorizontal,
  Star,
  Building2,
  ChevronDown
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { getAllDistrictsDetailed } from "@/lib/data/districts";
import { CANONICAL_PLACES } from "@/lib/data/canonical-places";
import { cn } from "@/lib/utils";
import { RegionalTravelDiscovery } from "./regional-travel-discovery";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface DistrictsMegaModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: "en" | "ta";
}

type CategoryFilter = "all" | "trending" | "october" | "hills" | "temples" | "beaches" | "shopping" | "ghats" | "heritage";
type ViewMode = "spots" | "regional";
type SortOption = "rating" | "name" | "district";

const DEFAULT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80";

export function DistrictsMegaModal({ isOpen, onClose, lang = "en" }: DistrictsMegaModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("spots");

  const searchInputRef = useRef<HTMLInputElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  // Trap focus & handle Escape key for accessibility (WCAG 2.1.1, 2.1.2, 2.4.3)
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;
    const timer = setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      } else if (modalRef.current) {
        modalRef.current.focus();
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const visibleFocusable = Array.from(focusableElements).filter(
          (el) => !el.hasAttribute("disabled") && el.offsetParent !== null
        );

        if (visibleFocusable.length === 0) return;

        const firstElement = visibleFocusable[0];
        const lastElement = visibleFocusable[visibleFocusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocusedElementRef.current && typeof previouslyFocusedElementRef.current.focus === "function") {
        previouslyFocusedElementRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  useGSAP(
    () => {
      if (!isOpen || !modalRef.current) return;
      const cards = modalRef.current.querySelectorAll(".gsap-district-card");
      if (!cards || cards.length === 0) return;
      gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
    },
    { scope: modalRef, dependencies: [isOpen, activeCategory, searchQuery, selectedDistrict, sortBy, viewMode] }
  );

  // Strictly deduplicated list of all spots across Tamil Nadu
  const allSpots = useMemo(() => {
    const seenSlugs = new Set<string>();
    const uniqueSpots: any[] = [];

    for (const p of CANONICAL_PLACES) {
      const uniqueKey = (p.slug || p.id || p.canonicalName || "").toLowerCase().trim();
      if (!uniqueKey || seenSlugs.has(uniqueKey)) continue;
      seenSlugs.add(uniqueKey);

      uniqueSpots.push({
        id: p.id || p.slug,
        name: p.canonicalName || p.name,
        district: p.district || "Tamil Nadu",
        category: (p.primaryCategory || "attraction").toUpperCase(),
        primaryCategory: (p.primaryCategory || "attraction").toLowerCase(),
        tagline: p.tagline || `Famous destination spot in ${p.district}`,
        image: p.image || DEFAULT_FALLBACK_IMAGE,
        rating: p.rating || 4.7,
        tags: p.tags || [],
        slug: p.slug,
      });
    }
    return uniqueSpots;
  }, []);

  // Extract list of unique districts for the district filter dropdown
  const availableDistricts = useMemo(() => {
    const set = new Set<string>();
    allSpots.forEach((s) => {
      if (s.district) set.add(s.district);
    });
    return Array.from(set).sort();
  }, [allSpots]);

  // Filter and sort spots
  const filteredSpots = useMemo(() => {
    let result = allSpots.filter((s) => {
      // Search query filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q) ||
        s.tags.some((t: string) => t.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // District filter
      if (selectedDistrict !== "all" && s.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
        return false;
      }

      // Category filter
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
        return (
          s.district.toLowerCase().includes("nilgiris") ||
          s.district.toLowerCase().includes("dindigul") ||
          s.district.toLowerCase().includes("coimbatore") ||
          s.district.toLowerCase().includes("tenkasi") ||
          s.district.toLowerCase().includes("theni")
        );
      }

      if (activeCategory === "heritage") {
        return s.primaryCategory.includes("heritage") || s.slug.includes("fort") || s.slug.includes("palace");
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "district") return a.district.localeCompare(b.district);
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [allSpots, searchQuery, activeCategory, selectedDistrict, sortBy]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="districts-modal-title"
        tabIndex={-1}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col bg-[#09090b]/98 backdrop-blur-2xl text-white overflow-hidden font-sans outline-none"
      >
        {/* Top Header Controls - Compact & Modern */}
        <div className="shrink-0 border-b border-zinc-800 bg-[#09090b]/95 px-4 py-3 sm:px-8">
          <div className="mx-auto flex max-w-[1500px] flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Title & Badge */}
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-md">
                <Compass className="size-5 text-amber-400" aria-hidden="true" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 id="districts-modal-title" className="font-display text-lg sm:text-xl font-extrabold text-white tracking-tight">
                    {lang === "ta" ? "தமிழ்நாடு சுற்றுலா இடங்கள்" : "Explore Places & Famous Spots"}
                  </h2>
                  <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-mono font-bold text-amber-400">
                    {filteredSpots.length} {lang === "ta" ? "இடங்கள்" : "Spots"}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300">
                  {lang === "ta"
                    ? "குற்றாலம், சுருளி, மீனாட்சி அம்மன் கோவில் போன்ற தமிழ்நாட்டின் சிறந்த தலங்கள்."
                    : "Discover tourist spots, waterfalls, hill stations, and heritage places across Tamil Nadu."}
                </p>
              </div>
            </div>

            {/* Action Bar & Controls */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Mode Switcher */}
              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-xl" role="group" aria-label="View mode">
                <button
                  type="button"
                  aria-pressed={viewMode === "spots"}
                  onClick={() => setViewMode("spots")}
                  className={cn(
                    "px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-400",
                    viewMode === "spots"
                      ? "bg-amber-400 text-zinc-950 font-black shadow"
                      : "text-zinc-300 hover:text-white"
                  )}
                >
                  <Compass className="size-3.5" aria-hidden="true" />
                  <span>All Spots</span>
                </button>
                <button
                  type="button"
                  aria-pressed={viewMode === "regional"}
                  onClick={() => setViewMode("regional")}
                  className={cn(
                    "px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400",
                    viewMode === "regional"
                      ? "bg-emerald-500 text-slate-950 font-black shadow"
                      : "text-zinc-300 hover:text-white"
                  )}
                >
                  <Compass className="size-3.5" aria-hidden="true" />
                  <span>Regional Travel Hubs</span>
                </button>
              </div>

              {/* Search Bar */}
              {viewMode === "spots" && (
                <div className="relative flex-1 md:w-64">
                  <label htmlFor="spot-search-input" className="sr-only">
                    {lang === "ta" ? "இடங்களைத் தேடுக" : "Search spots"}
                  </label>
                  <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-300" aria-hidden="true" />
                  <input
                    ref={searchInputRef}
                    id="spot-search-input"
                    type="search"
                    aria-label={lang === "ta" ? "இடங்களைத் தேடுக" : "Search spots"}
                    placeholder={lang === "ta" ? "இடங்களைத் தேடுக..." : "Search spot, district, tags..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-full border border-zinc-800 bg-zinc-900/80 pl-9 pr-7 py-1.5 min-h-[36px] text-xs text-white placeholder-zinc-500 focus:border-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600 transition"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear spot search"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-white p-1"
                    >
                      <X className="size-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              )}

              {/* Advanced Options Toggle Button */}
              {viewMode === "spots" && (
                <button
                  type="button"
                  aria-expanded={showAdvanced}
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl border text-xs font-bold transition cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400",
                    showAdvanced || selectedDistrict !== "all" || sortBy !== "rating"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm"
                      : "bg-zinc-900 text-zinc-200 border-zinc-700 hover:border-zinc-600 hover:text-white"
                  )}
                >
                  <SlidersHorizontal className="size-3.5 text-emerald-400" aria-hidden="true" />
                  <span>{lang === "ta" ? "மேம்பட்ட வடிகட்டி" : "Advanced Options"}</span>
                  {(selectedDistrict !== "all" || sortBy !== "rating") && (
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" aria-hidden="true" />
                  )}
                </button>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="grid size-9 sm:size-10 min-w-[36px] min-h-[36px] place-items-center rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800 hover:text-white transition cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-400"
                aria-label="Close spots modal"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Advanced Options Panel */}
          {viewMode === "spots" && showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mx-auto mt-3 max-w-[1500px] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/95 p-3 sm:p-4 text-xs"
            >
              <div className="flex flex-wrap items-center gap-4">
                {/* District Selector */}
                <div className="flex items-center gap-2">
                  <label htmlFor="modal-district-select" className="font-bold text-amber-400 flex items-center gap-1">
                    <Building2 className="size-3.5" aria-hidden="true" /> District:
                  </label>
                  <select
                    id="modal-district-select"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-1.5 min-h-[36px] text-xs text-white focus:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
                  >
                    <option value="all">📍 All 38 Districts</option>
                    {availableDistricts.map((d) => (
                      <option key={d} value={d}>
                        {d} District
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Order */}
                <div className="flex items-center gap-2">
                  <label htmlFor="modal-sort-select" className="font-bold text-emerald-400 flex items-center gap-1">
                    <Filter className="size-3.5" aria-hidden="true" /> Sort By:
                  </label>
                  <select
                    id="modal-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-1.5 min-h-[36px] text-xs text-white focus:border-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 cursor-pointer"
                  >
                    <option value="rating">★ Highest Rating</option>
                    <option value="name">🔤 Name (A-Z)</option>
                    <option value="district">📍 District Wise</option>
                  </select>
                </div>

                {/* Reset Filters */}
                {(selectedDistrict !== "all" || sortBy !== "rating" || searchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDistrict("all");
                      setSortBy("rating");
                      setSearchQuery("");
                      setActiveCategory("all");
                    }}
                    className="ml-auto text-amber-400 hover:underline text-xs font-bold py-1 min-h-[36px]"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Category Filter Chips Bar */}
          {viewMode === "spots" && (
            <div
              role="toolbar"
              aria-label="Spot category filters"
              className="mx-auto mt-3 flex max-w-[1500px] items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none"
            >
              {[
                { key: "all", label: lang === "ta" ? "அனைத்து இடங்கள்" : "All Famous Spots", icon: Compass },
                { key: "trending", label: lang === "ta" ? "🔥 பிரபலமானவை" : "🔥 Trending Spots", icon: Sparkles },
                { key: "october", label: lang === "ta" ? "📅 அக்டோபர் உலா" : "📅 Best for October", icon: Sparkles },
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
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveCategory(cat.key as CategoryFilter)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 min-h-[36px] text-xs font-bold shrink-0 transition border cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-400",
                      isActive
                        ? "bg-amber-400 text-zinc-950 border-amber-300 font-extrabold shadow"
                        : "bg-zinc-900/90 text-zinc-200 border-zinc-700 hover:border-zinc-500 hover:text-white"
                    )}
                  >
                    <Icon className={cn("size-3.5", isActive ? "text-zinc-950" : "text-amber-400")} aria-hidden="true" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Main Body */}
        <div className="relative flex-1 overflow-hidden p-4 sm:p-6">
          {viewMode === "regional" ? (
            <div className="h-full overflow-y-auto pr-1">
              <RegionalTravelDiscovery
                onSelectPlaceForPlanner={(place, origin) => {
                  onClose();
                  if (typeof window !== "undefined") {
                    window.location.href = `/routes?destination=${encodeURIComponent(place.canonicalName)}&origin=${encodeURIComponent(origin.name)}`;
                  }
                }}
              />
            </div>
          ) : filteredSpots.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center p-12">
              <Search className="size-10 text-zinc-600 mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No matching spots found</h3>
              <p className="text-xs text-zinc-400 max-w-sm">
                We couldn't find any spot matching your criteria. Try adjusting your district or search keywords.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDistrict("all");
                  setActiveCategory("all");
                }}
                className="mt-4 rounded-xl bg-amber-400 px-4 py-1.5 text-xs font-bold text-zinc-950 hover:bg-amber-300 transition"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            /* Compact Modern Spot Grid View */
            <div className="districts-scroll-container h-full overflow-y-auto pr-2">
              <div className="mx-auto max-w-[1500px] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-10">
                {filteredSpots.map((spot) => (
                  <SpotGridCard key={spot.id} spot={spot} onClose={onClose} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Compact Footer Bar */}
        <div className="shrink-0 border-t border-zinc-800 bg-[#09090b]/95 px-6 py-2.5 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="inline-block size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-zinc-300 text-[11px] sm:text-xs">
              Click any spot card to open its trip planning & route details
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 font-mono text-[11px] text-zinc-400">
            <span>ExploreTN Spatial GIS</span>
            <span className="text-amber-400 font-bold">{filteredSpots.length} Spots Available</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Single Compact Spot Card with Fallback Image Handler
function SpotGridCard({ spot, onClose }: { spot: any; onClose: () => void }) {
  const [imgSrc, setImgSrc] = useState<string>(spot.image || DEFAULT_FALLBACK_IMAGE);

  return (
    <Link
      to="/routes"
      search={{ destination: spot.name }}
      onClick={onClose}
      aria-label={`${spot.name}, ${spot.district} District — Plan Route to Spot`}
      className="gsap-district-card group relative flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] p-3.5 transition-all duration-300 hover:border-emerald-400/60 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-0.5 cursor-pointer min-h-[44px] min-w-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
    >
      <div className="relative h-36 w-full overflow-hidden rounded-xl bg-zinc-900 shrink-0">
        <img
          src={imgSrc}
          alt={spot.name ? `${spot.name} in ${spot.district}` : "Destination thumbnail"}
          onError={() => setImgSrc(DEFAULT_FALLBACK_IMAGE)}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-transparent to-transparent opacity-80" aria-hidden="true" />

        {/* Category Badge */}
        <span className="absolute top-2.5 left-2.5 rounded-md bg-zinc-950/90 backdrop-blur-md border border-zinc-700/80 px-2 py-0.5 text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">
          {spot.category || "ATTRACTION"}
        </span>

        {/* District Badge */}
        <span className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-md bg-amber-400 font-black px-2 py-0.5 text-[11px] text-zinc-950 shadow-sm">
          <MapPin className="size-3 fill-zinc-950" aria-hidden="true" />
          {spot.district}
        </span>
      </div>

      <div className="mt-3 flex flex-1 flex-col justify-between">
        <div>
          <h3 className="font-display text-sm font-extrabold text-white group-hover:text-emerald-300 transition-colors tracking-tight line-clamp-1 group-focus-within:line-clamp-none">
            {spot.name}
          </h3>
          <p className="text-[11px] text-zinc-300 line-clamp-2 group-focus-within:line-clamp-none mt-1 leading-snug">
            {spot.tagline}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1 text-[11px]">
            <span className="rounded-md bg-zinc-900 border border-zinc-800 px-2 py-0.5 font-semibold text-zinc-200">
              <span className="sr-only">Location: </span>📍 {spot.district}
            </span>
            <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 font-bold text-emerald-300 flex items-center gap-0.5">
              <Star className="size-3 fill-emerald-400 text-emerald-400" aria-hidden="true" />
              <span className="sr-only">Rating: </span>{spot.rating}
            </span>
          </div>
        </div>

        <div className="mt-3.5 flex items-center justify-between text-xs font-bold text-emerald-400 pt-2.5 border-t border-zinc-800/80 group-hover:text-emerald-300">
          <span>Plan Route to Spot</span>
          <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}
