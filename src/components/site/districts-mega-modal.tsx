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

type CategoryFilter = "all" | "trending" | "october" | "hills" | "temples" | "beaches" | "ghats" | "heritage";

export function DistrictsMegaModal({ isOpen, onClose, lang = "en" }: DistrictsMegaModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");

  const allDistricts = useMemo(() => getAllDistrictsDetailed(), []);

  useGSAP(
    () => {
      if (!isOpen || !modalRef.current) return;
      const cards = modalRef.current.querySelectorAll(".gsap-district-card");
      if (!cards || cards.length === 0) return;

      // Ensure all 38 district cards are immediately 100% visible with zero scroll delay or opacity hiding
      gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
    },
    { scope: modalRef, dependencies: [isOpen, activeCategory, searchQuery] }
  );

  const filteredDistricts = useMemo(() => {
    return allDistricts.filter((d) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.slug.toLowerCase().includes(q) ||
        d.region.toLowerCase().includes(q) ||
        d.tagline.toLowerCase().includes(q) ||
        d.overview.famousFor.some((f) => f.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (activeCategory === "trending") {
        return (
          d.slug === "the-nilgiris" ||
          d.slug === "dindigul" ||
          d.slug === "madurai" ||
          d.slug === "dharmapuri" ||
          d.slug === "tenkasi" ||
          d.slug === "coimbatore" ||
          d.slug === "ramanathapuram" ||
          d.slug === "thanjavur"
        );
      }

      if (activeCategory === "october") {
        return (
          d.slug === "the-nilgiris" ||
          d.slug === "dindigul" ||
          d.slug === "dharmapuri" ||
          d.slug === "salem" ||
          d.slug === "theni" ||
          d.slug === "tenkasi" ||
          d.slug === "namakkal"
        );
      }

      if (activeCategory === "hills") {
        return (
          d.slug === "the-nilgiris" ||
          d.slug === "dindigul" ||
          d.slug === "theni" ||
          d.slug === "salem" ||
          d.slug === "tirupathur" ||
          d.slug === "namakkal" ||
          d.slug === "kallakurichi"
        );
      }

      if (activeCategory === "temples") {
        return (
          d.slug === "madurai" ||
          d.slug === "thanjavur" ||
          d.slug === "ramanathapuram" ||
          d.slug === "tiruvannamalai" ||
          d.slug === "kancheepuram" ||
          d.slug === "tiruchirappalli" ||
          d.slug === "tiruvarur" ||
          d.slug === "virudhunagar"
        );
      }

      if (activeCategory === "beaches") {
        return (
          d.slug === "chennai" ||
          d.slug === "chengalpattu" ||
          d.slug === "kanniyakumari" ||
          d.slug === "ramanathapuram" ||
          d.slug === "thoothukudi" ||
          d.slug === "nagapattinam" ||
          d.slug === "cuddalore"
        );
      }

      if (activeCategory === "ghats") {
        return (
          d.region.toLowerCase().includes("ghats") ||
          d.slug === "the-nilgiris" ||
          d.slug === "dindigul" ||
          d.slug === "theni" ||
          d.slug === "tenkasi" ||
          d.slug === "coimbatore"
        );
      }

      if (activeCategory === "heritage") {
        return (
          d.slug === "sivaganga" ||
          d.slug === "thanjavur" ||
          d.slug === "pudukkottai" ||
          d.slug === "ariyalur" ||
          d.slug === "viluppuram" ||
          d.slug === "vellore"
        );
      }

      return true;
    });
  }, [allDistricts, searchQuery, activeCategory]);

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
                    {lang === "ta" ? "தமிழ்நாட்டின் 38 மாவட்டங்கள்" : "All 38 Districts of Tamil Nadu"}
                  </h2>
                  <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-0.5 text-xs font-mono font-bold text-amber-400">
                    38 {lang === "ta" ? "மாவட்டங்கள்" : "Districts"}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {lang === "ta"
                    ? "கோவில்கள், மலைவாசஸ்தலங்கள், கடற்கரைகள் மற்றும் பாரம்பரிய இடங்கள் கொண்ட தமிழ்நாட்டின் மாவட்ட உலா."
                    : "Search or browse complete spot catalogs across every district in Tamil Nadu."}
                </p>
              </div>
            </div>

            {/* Search Input & Close Button */}
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 md:w-96">
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder={lang === "ta" ? "மாவட்டங்களைத் தேடுக..." : "Search district, region or spot..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
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

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="grid size-10 place-items-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
                aria-label="Close districts modal"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Category Filter Chips Bar */}
          <div className="mx-auto mt-4 flex max-w-[1500px] items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { key: "trending", label: lang === "ta" ? "🔥 பிரபலமான இடங்கள்" : "🔥 Trending Spots", icon: Sparkles },
              { key: "october", label: lang === "ta" ? "📅 அக்டோபர் மாத உலா" : "📅 Best for October", icon: Sparkles },
              { key: "all", label: lang === "ta" ? "அனைத்து 38" : "All 38 Districts & Culture", icon: Compass },
              { key: "hills", label: lang === "ta" ? "மலைவாசல் ⛰️" : "Hill Stations ⛰️", icon: Mountain },
              { key: "temples", label: lang === "ta" ? "கோவில்கள் 🛕" : "Heritage Temples 🛕", icon: Landmark },
              { key: "beaches", label: lang === "ta" ? "கடற்கரைகள் 🏖️" : "Beaches & Coast 🏖️", icon: Waves },
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
        </div>

        {/* Modal Main Body - Clean 4-Column Grid */}
        <div className="relative flex-1 overflow-hidden p-6 sm:p-8">
          {filteredDistricts.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center p-12">
              <Search className="size-12 text-zinc-600 mb-4" />
              <h3 className="text-lg font-bold text-white mb-1">No districts found</h3>
              <p className="text-xs text-zinc-400 max-w-sm">
                We couldn't find any district matching "{searchQuery}". Try searching for "Madurai", "Ooty", "Temple", or "Waterfall".
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
            /* Structured 4-Column Static Grid View */
            <div className="districts-scroll-container h-full overflow-y-auto pr-2">
              <div className="mx-auto max-w-[1500px] grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-12">
                {filteredDistricts.map((district) => (
                  <DistrictGridCard key={district.slug} district={district} onClose={onClose} />
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
              Click any district card to open its full spot explorer catalog
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 font-mono text-[11px] text-zinc-400">
            <span>ExploreTN Heritage Spatial GIS</span>
            <span>38 Districts Live</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Single District Card for Grid View
function DistrictGridCard({ district, onClose }: { district: DistrictData; onClose: () => void }) {
  return (
    <Link
      to="/districts/$districtSlug"
      params={{ districtSlug: district.slug }}
      onClick={onClose}
      className="gsap-district-card group relative flex flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-[#18181b] p-4 transition-all duration-300 hover:border-amber-400/60 hover:shadow-xl hover:-translate-y-1"
    >
      <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-zinc-900">
        <img
          src={district.heroImage}
          alt={district.name}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-transparent to-transparent" />
        
        {/* Region Tag */}
        <span className="absolute top-3 left-3 rounded-full bg-zinc-950/85 backdrop-blur-md border border-zinc-800 px-3 py-1 text-[10px] font-extrabold text-amber-400">
          {district.region}
        </span>

        {/* Spots Count Badge */}
        <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-amber-400 font-black px-2.5 py-1 text-[10px] text-zinc-950 shadow-md">
          <Sparkles className="size-3 fill-zinc-950" />
          {district.spots.length} Spots
        </span>
      </div>

      <div className="mt-3.5 flex flex-1 flex-col justify-between">
        <div>
          <h3 className="font-display text-lg font-black text-white group-hover:text-amber-300 transition-colors tracking-tight">
            {district.name}
          </h3>
          <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">{district.tagline}</p>

          {/* Famous Spots Highlights Pills */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {district.overview.famousFor.slice(0, 2).map((item, i) => (
              <span key={i} className="rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs font-bold text-amber-400 pt-3 border-t border-zinc-800/80 group-hover:text-amber-300">
          <span>View District Page</span>
          <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
