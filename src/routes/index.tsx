import { useState, useRef } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Search,
  ArrowRight,
  Compass,
  Mountain,
  Sparkles,
  MapPin,
  Maximize2,
  Check,
  Landmark,
  CloudRain,
  Waves,
  Utensils,
  Footprints,
  Trees,
  Star,
  Map as MapIcon,
  Route as RouteIcon,
  ShieldAlert,
  Info,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Bell,
  Activity,
} from "lucide-react";
import heroImg from "@/assets/hero-ghats.jpg";
import { AppShell } from "@/components/site/app-shell";
import { GoogleMapHero } from "@/components/site/google-map-hero";
import { DedicatedMapModal } from "@/components/site/dedicated-map-modal";
import { PlaceCard } from "@/components/site/place-card";
import { SearchPanel } from "@/components/site/search-panel";
import { Button } from "@/components/ui/button";
import { places } from "@/data/places";
import { PeakTravelGuide } from "@/components/site/peak-travel-guide";
import { ThingsToDoSection, AttractionsYouCantMissSection } from "@/components/site/things-to-do-section";
import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
import {
  CURATED_SIGNATURE_TRAILS,
  ExpandableTrailCard,
} from "@/components/site/expandable-interest-cards";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ExploreTN — Explore Tamil Nadu. Beyond the usual." },
      {
        name: "description",
        content:
          "Discover heritage trails, hill escapes, and coastal journeys across Tamil Nadu. Build a trip around what you love.",
      },
      { property: "og:title", content: "ExploreTN — Explore Tamil Nadu. Beyond the usual." },
      {
        property: "og:description",
        content: "Discover heritage trails, hill escapes, and coastal journeys across Tamil Nadu.",
      },
    ],
  }),
  component: Index,
});

import { getCategoryLabel } from "@/lib/categoryLabels";
import type { Place } from "@/data/places";

// Explore by Interest Categories (Original Popz Design Spec)
const INTEREST_CATEGORIES = [
  {
    slug: "heritage-temples",
    categoryParam: "heritage-temples",
    title: "Heritage & Temples",
    icon: Landmark,
    count: "480+ Places",
    bg: "from-sky-50 to-white",
    border: "border-sky-100",
    text: "text-sky-600",
  },
  {
    slug: "hill-escapes",
    categoryParam: "hill-escapes",
    title: "Hill Escapes",
    icon: Mountain,
    count: "120+ Viewpoints",
    bg: "from-blue-50 to-white",
    border: "border-sky-100",
    text: "text-sky-600",
  },
  {
    slug: "waterfalls",
    categoryParam: "waterfalls",
    title: "Waterfalls & Streams",
    icon: CloudRain,
    count: "85+ Waterfalls",
    bg: "from-sky-100/60 to-white",
    border: "border-sky-200",
    text: "text-sky-600",
  },
  {
    slug: "coastal",
    categoryParam: "coastal",
    title: "Coastal Journeys",
    icon: Waves,
    count: "140 km Coast",
    bg: "from-cyan-50 to-white",
    border: "border-cyan-100",
    text: "text-cyan-600",
  },
  {
    slug: "culinary",
    categoryParam: "culinary",
    title: "Culinary Trails",
    icon: Utensils,
    count: "90+ Local Spots",
    bg: "from-amber-50 to-white",
    border: "border-amber-100",
    text: "text-amber-600",
  },
  {
    slug: "wildlife",
    categoryParam: "wildlife",
    title: "Forest & Wildlife",
    icon: Trees,
    count: "32 Trails",
    bg: "from-emerald-50 to-white",
    border: "border-emerald-100",
    text: "text-emerald-600",
  },
];

// District Highlights (Popz Design Section 4)
const DISTRICT_HIGHLIGHTS = [
  { name: "Madurai", title: "Cultural Capital & Meenakshi Temple", spots: 42, image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80", route: "/districts/madurai" },
  { name: "Kodaikanal", title: "Princess of Hill Stations & Lakes", spots: 28, image: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=800&q=80", route: "/districts/dindigul" },
  { name: "Theni", title: "Cardamom Valleys & Cloud Mountain Treks", spots: 24, image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80", route: "/districts/theni" },
  { name: "Nilgiris (Ooty)", title: "Tea Estates & Misty Peak Railways", spots: 36, image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80", route: "/districts/the-nilgiris" },
  { name: "Thanjavur", title: "Chola Architecture & Great Temples", spots: 31, image: "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=800&q=80", route: "/districts/thanjavur" },
  { name: "Kanyakumari", title: "Tricontinental Sunset & Sea Confluence", spots: 19, image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80", route: "/districts/kanniyakumari" },
];

// Signature Editorial Trails (Popz Design Section 5)
const SIGNATURE_TRAILS = [
  {
    title: "Arupadai Veedu Sacred Pilgrimage Circuit",
    subtitle: "The 6 Holy Abodes of Lord Murugan spanning Thiruthani to Thiruchendur",
    distance: "1,240 km",
    duration: "5 Days",
    stops: 6,
    difficulty: "Moderate",
    bestSeason: "Oct – Mar",
    icon: "🛕",
    bg: "from-amber-950/60 to-zinc-950",
    badge: "Heritage Pilgrimage",
    link: "/trails/arupadai-veedu",
  },
  {
    title: "Pancha Bhoota Sthalams (Five Elements Circuit)",
    subtitle: "The 5 Sacred Shiva Temples embodying Earth, Water, Fire, Air & Space",
    distance: "740 km",
    duration: "3–4 Days",
    stops: 5,
    difficulty: "Easy",
    bestSeason: "Oct – Mar",
    icon: "🔱",
    bg: "from-orange-950/60 to-zinc-950",
    badge: "Sacred Elemental Circuit",
    link: "/trails/pancha-bhoota",
  },
  {
    title: "Western Ghats 70-Hairpin Pass Road Trip",
    subtitle: "Thakkaram to Valparai and Meghamalai cloud estate highways",
    distance: "460 km",
    duration: "2 Days",
    stops: 14,
    difficulty: "Challenging",
    bestSeason: "Jul – Feb",
    icon: "🏍️",
    bg: "from-emerald-950/60 to-zinc-950",
    badge: "Ghat Highway",
    link: "/trails/western-ghats-70-hairpin",
  },
  {
    title: "Coromandel Coastal & Temple Ocean Highway",
    subtitle: "Scenic coastal stretch connecting Mahabalipuram, Pondicherry & Rameswaram",
    distance: "580 km",
    duration: "3 Days",
    stops: 18,
    difficulty: "Easy",
    bestSeason: "Nov – Feb",
    icon: "🌊",
    bg: "from-cyan-950/60 to-zinc-950",
    badge: "Coastal Drive",
    link: "/trails/coromandel-coastal",
  },
  {
    title: "UNESCO Nilgiri Mountain Toy Train Heritage Trail",
    subtitle: "Mettupalayam (foothills) to Coonoor & Ooty (2,203m) via historic steam rack & pinion grade",
    distance: "46 km",
    duration: "4h 45m",
    stops: 9,
    difficulty: "Easy",
    bestSeason: "Sep – May",
    icon: "🚂",
    bg: "from-amber-950/60 to-zinc-950",
    badge: "UNESCO Heritage Rail",
    link: "/trails/nilgiri-mountain-railway",
  },
  {
    title: "Pamban Sea Bridge & Ocean Rail Corridor",
    subtitle: "Madurai to Mandapam, Pamban Cantilever Sea Span & Rameswaram Island",
    distance: "161 km",
    duration: "3h 30m",
    stops: 6,
    difficulty: "Easy",
    bestSeason: "Oct – Mar",
    icon: "🌉",
    bg: "from-blue-950/60 to-zinc-950",
    badge: "Ocean Rail Trail",
    link: "/trails/pamban-ocean-rail-corridor",
  },
  {
    title: "Cauvery Delta Chola Heritage Rail Trail",
    subtitle: "Chennai Egmore to Villupuram, Chidambaram, Kumbakonam & Thanjavur Big Temple",
    distance: "338 km",
    duration: "6 Hours",
    stops: 7,
    difficulty: "Easy",
    bestSeason: "Oct – Mar",
    icon: "🏛️",
    bg: "from-emerald-950/60 to-zinc-950",
    badge: "Chola Mainline Rail",
    link: "/trails/cauvery-delta-heritage-rail",
  },
];

const FEATURED_SLUGS = [
  "meenakshi-amman-temple",
  "kodaikanal",
  "mahabalipuram",
  "theni",
  "famous-jigarthanda",
  "thanjavur-city",
];

function Index() {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [isDedicatedMapOpen, setIsDedicatedMapOpen] = useState(false);
  const [addedTrips, setAddedTrips] = useState<Record<string, boolean>>({});
  const trailsScrollRef = useRef<HTMLDivElement>(null);

  const scrollTrails = (direction: "left" | "right") => {
    if (trailsScrollRef.current) {
      const scrollAmount = 380;
      trailsScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleAddToTrip = (slug: string) => {
    setAddedTrips((prev) => ({ ...prev, [slug]: true }));
  };

  const featuredPlaces = FEATURED_SLUGS.map(
    (slug) => places.find((p) => p.slug === slug)
  ).filter(Boolean) as Place[];

  return (
    <AppShell className="bg-slate-50">
      {/* Background Subtle Gradient & Light Backdrop */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.img
          src={heroImg}
          alt="Scenic Western Ghats backdrop"
          width={1920}
          height={1200}
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.18 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          className="size-full object-cover filter brightness-110 saturate-120"
        />
        {/* Soft Sky & Crisp White Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-100/60 via-white/80 to-slate-50" />
      </div>

      <SearchPanel open={searchOpen} onOpenChange={setSearchOpen} />

      <DedicatedMapModal
        isOpen={isDedicatedMapOpen}
        onClose={() => setIsDedicatedMapOpen(false)}
      />

      <div className="relative z-10">
        {/* SECTION 1: HERO & SEARCH (Airbnb / Popz Design Spec) */}
        <section className="relative min-h-[70vh] overflow-hidden bg-transparent pt-20 sm:pt-28">
          <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-14">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="group relative inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50/90 px-4 py-1.5 text-xs font-bold text-sky-800 backdrop-blur-md cursor-help shadow-sm"
            >
              <Compass className="size-3.5 text-sky-600" />
              <span>1,240 places · 38 districts · checked by locals</span>
              <Info className="size-3 text-sky-500 hover:text-sky-700 transition" />
              {/* Interactive Info Tooltip */}
              <div className="absolute top-full left-0 mt-2 hidden w-80 rounded-2xl border border-sky-100 bg-white p-3 text-[11px] text-slate-600 shadow-2xl group-hover:block z-30">
                <p className="font-bold text-sky-900 mb-1">Local Verification Protocol</p>
                Coordinates, parking locations, entry fees, and opening hours are verified against local contributor reports and official district records.
              </div>
            </motion.div>

            {/* Popz Design Hero Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mt-6 font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl md:text-7xl leading-[1.05]"
            >
              Explore Tamil Nadu.
              <br />
              <span className="text-sky-500">Beyond the usual.</span>
            </motion.h1>

            {/* Popz Design Hero Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-5 max-w-2xl text-base text-slate-600 sm:text-lg leading-relaxed font-normal"
            >
              Discover heritage trails, hill escapes, and coastal journeys. Build a trip around what you love.
            </motion.p>

            {/* Airbnb Style Large Search Pill */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-8 flex max-w-xl items-center gap-2 rounded-full border border-sky-100 bg-white p-2 shadow-xl hover:shadow-2xl transition backdrop-blur-md"
            >
              <Search className="ml-3 size-5 text-sky-500 shrink-0" />
              <input
                type="text"
                readOnly
                onClick={() => setSearchOpen(true)}
                placeholder="Search places, districts, or trails..."
                className="w-full bg-transparent px-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none cursor-pointer"
              />
              <kbd className="hidden md:inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-500 border border-slate-200 shrink-0">
                {typeof navigator !== "undefined" && /Mac/i.test(navigator.platform || "") ? "⌘K" : "Ctrl K"}
              </kbd>
              <Button
                onClick={() => setSearchOpen(true)}
                className="rounded-full bg-sky-500 px-6 text-xs font-bold text-white hover:bg-sky-600 transition self-stretch h-auto py-2.5 shadow-md shadow-sky-500/20"
              >
                Search
              </Button>
            </motion.div>

            {/* Popz Design Primary & Secondary CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Link
                to="/routes"
                className="flex items-center gap-2 rounded-full bg-sky-500 px-7 py-3 text-sm font-extrabold text-white hover:bg-sky-600 transition shadow-lg shadow-sky-500/20"
              >
                <Navigation className="size-4 text-white fill-white" />
                <span>Plan Route</span>
                <ArrowRight className="size-4" />
              </Link>

              <Link
                to="/explore"
                className="flex items-center gap-2 rounded-full border border-sky-200 bg-white px-7 py-3 text-sm font-bold text-slate-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 transition shadow-sm"
              >
                <span>Browse places</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* THINGS TO DO WHEREVER YOU'RE GOING */}
      <ThingsToDoSection />

      {/* ATTRACTIONS YOU CAN'T MISS (Full-Screen Sticky 3D Cylinder Reel) */}
      <AttractionsYouCantMissSection />

      {/* SECTION 2: EXPLORE BY INTEREST (Classic 6-Category Cards) */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                Curated Themes
              </span>
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold text-slate-900 sm:text-3xl">Explore by Interest</h2>
            <p className="mt-1 text-sm text-slate-500">Curated collections based on travel themes across Tamil Nadu</p>
          </div>
          <Link
            to="/explore"
            className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700"
          >
            <span>All Categories</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {INTEREST_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                to="/explore"
                search={{ category: cat.categoryParam }}
                className={`group flex flex-col justify-between rounded-2xl border ${cat.border} bg-gradient-to-br ${cat.bg} p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-sky-300 shadow-sm`}
              >
                <span className={`grid size-10 place-items-center rounded-xl bg-white/90 border ${cat.border} ${cat.text} shadow-sm group-hover:scale-105 transition-transform`}>
                  <Icon className="size-5" />
                </span>
                <div className="mt-6">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition">{cat.title}</h3>
                  <p className="mt-0.5 text-[11px] font-mono text-slate-500">{cat.count}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: FEATURED DESTINATIONS UNEVEN BENTO GRID */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                Top Rated Spots
              </span>
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold text-slate-900 sm:text-3xl">Featured Destinations</h2>
            <p className="mt-1 text-sm text-slate-500">Iconic landmarks, sacred temple towers, and tranquil hill stations across Tamil Nadu</p>
          </div>
          <Link
            to="/explore"
            className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700"
          >
            <span>View All Places</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* Uneven Bento Grid: Asymmetrical card arrangement with full photo cover */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-12 auto-rows-[minmax(190px,auto)]">
          {/* Hero Place 1 (Large / Tall Anchor - spans 8 cols, 2 rows): Meenakshi Amman Kovil */}
          <Link
            to="/place/$slug"
            params={{ slug: "meenakshi-amman-temple" }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl p-7 text-white shadow-xl md:col-span-8 md:row-span-2 min-h-[460px] border border-slate-700/60 transition-all hover:border-sky-400/80 hover:shadow-2xl"
          >
            <img
              src="https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1400&q=85"
              alt="Meenakshi Amman Kovil, Madurai"
              className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/30" />

            {/* Top Badges */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/20 border border-sky-400/40 px-3.5 py-1 text-xs font-mono font-bold text-sky-200 backdrop-blur-md">
                🏛️ SACRED HERITAGE CIRCUIT
              </span>
              <div className="flex items-center gap-2 rounded-2xl bg-slate-950/80 border border-white/15 px-3 py-1.5 backdrop-blur-md shadow-lg">
                <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                  <Star className="size-3.5 fill-amber-400" /> 4.9
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-xs font-mono font-bold text-sky-300">Madurai</span>
              </div>
            </div>

            {/* Bottom Place Info */}
            <div className="relative z-10 pt-6">
              <div className="flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-300">
                      #1 TOP DESTINATION
                    </span>
                    <span className="text-xs text-slate-300 font-mono">14 Towering Gopurams</span>
                  </div>
                  <h3 className="mt-1 text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-white tracking-tight group-hover:text-sky-300 transition-colors drop-shadow-md">
                    Meenakshi Amman Kovil
                  </h3>
                  <p className="mt-2 text-sm text-slate-200 line-clamp-3 leading-relaxed max-w-xl font-medium">
                    Historic 2,500-year-old temple city heart with sacred Golden Lotus Tank, thousand-pillar mandapam, and world-renowned Dravidian sculpted gopurams dedicated to Goddess Meenakshi.
                  </p>
                </div>
                <div className="flex size-12 rounded-full bg-white/10 group-hover:bg-sky-400 group-hover:text-slate-950 items-center justify-center transition shrink-0 ml-4 border border-white/20 shadow-lg">
                  <ArrowRight className="size-5" />
                </div>
              </div>
            </div>
          </Link>

          {/* Place 2 (Upper Compact - spans 4 cols): Kodaikanal Lake */}
          <Link
            to="/place/$slug"
            params={{ slug: "kodaikanal" }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 text-white shadow-xl md:col-span-4 min-h-[220px] border border-slate-700/60 transition-all hover:border-sky-400/80 hover:shadow-2xl"
          >
            <img
              src="https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1200&q=85"
              alt="Kodaikanal Lake and Misty Hills"
              className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/30" />

            <div className="relative z-10 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/20 border border-sky-400/40 px-3 py-0.5 text-xs font-mono font-bold text-sky-200 backdrop-blur-md">
                🌲 HIGHLAND RETREAT
              </span>
              <div className="flex items-center gap-1.5 rounded-xl bg-slate-950/80 border border-white/15 px-2.5 py-1 backdrop-blur-md text-xs font-bold text-sky-300">
                Dindigul
              </div>
            </div>

            <div className="relative z-10 pt-4">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-300">
                Princess of Hill Stations
              </span>
              <h3 className="mt-0.5 text-xl font-bold font-display text-white group-hover:text-sky-300 transition-colors drop-shadow-md">
                Kodaikanal Lake & Sholas
              </h3>
              <p className="mt-1 text-xs text-slate-200 line-clamp-2 leading-relaxed">
                Star-shaped highland lake nestled among ancient pine forests and misty cloud viewpoints.
              </p>
            </div>
          </Link>

          {/* Place 3 (Middle Compact - spans 4 cols): Valli Chunai Falls */}
          <Link
            to="/place/$slug"
            params={{ slug: "valli-chunai-falls" }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 text-white shadow-xl md:col-span-4 min-h-[220px] border border-slate-700/60 transition-all hover:border-sky-400/80 hover:shadow-2xl"
          >
            <img
              src="https://images.unsplash.com/photo-1434394354979-a235cd36269d?auto=format&fit=crop&w=1000&q=85"
              alt="Valli Chunai Falls"
              className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/30" />

            <div className="relative z-10 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 px-3 py-0.5 text-xs font-mono font-bold text-cyan-200 backdrop-blur-md">
                🌊 FOREST CASCADE
              </span>
              <div className="flex items-center gap-1.5 rounded-xl bg-slate-950/80 border border-white/15 px-2.5 py-1 backdrop-blur-md text-xs font-bold text-sky-300">
                Kanyakumari
              </div>
            </div>

            <div className="relative z-10 pt-4">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-300">
                Western Ghats Trail
              </span>
              <h3 className="mt-0.5 text-xl font-bold font-display text-white group-hover:text-sky-300 transition-colors drop-shadow-md">
                Valli Chunai Falls
              </h3>
              <p className="mt-1 text-xs text-slate-200 line-clamp-2 leading-relaxed">
                Hidden natural waterfall cascading through rocks and lush forest trails in the southern ranges.
              </p>
            </div>
          </Link>

          {/* Place 4 (Lower Medium - spans 5 cols): Thanjavur Brihadisvara Temple */}
          <Link
            to="/place/$slug"
            params={{ slug: "thanjavur" }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 text-white shadow-xl md:col-span-5 min-h-[260px] border border-slate-700/60 transition-all hover:border-sky-400/80 hover:shadow-2xl"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Thanjavur_2.jpg/1280px-Thanjavur_2.jpg"
              alt="Thanjavur Brihadisvara Temple"
              className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/30" />

            <div className="relative z-10 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/20 border border-sky-400/40 px-3 py-0.5 text-xs font-mono font-bold text-sky-200 backdrop-blur-md">
                🏛️ GREAT LIVING CHOLA TEMPLE
              </span>
              <div className="flex items-center gap-1.5 rounded-xl bg-slate-950/80 border border-white/15 px-2.5 py-1 backdrop-blur-md text-xs font-bold text-sky-300">
                Thanjavur
              </div>
            </div>

            <div className="relative z-10 pt-4">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-300">
                    Granite Architectural Marvel
                  </span>
                  <h3 className="mt-0.5 text-xl sm:text-2xl font-bold font-display text-white group-hover:text-sky-300 transition-colors drop-shadow-md">
                    Brihadisvara Temple
                  </h3>
                  <p className="mt-1 text-xs text-slate-200 line-clamp-2 leading-relaxed">
                    11th-century monumental temple crowned with an 80-tonne granite monolithic dome and ancient fresco murals.
                  </p>
                </div>
                <div className="flex size-10 rounded-full bg-white/10 group-hover:bg-sky-400 group-hover:text-slate-950 items-center justify-center transition shrink-0 ml-3 border border-white/20 shadow-lg">
                  <ArrowRight className="size-4" />
                </div>
              </div>
            </div>
          </Link>

          {/* Place 5 (Lower Wide - spans 7 cols): Mahabalipuram Shore Temple */}
          <Link
            to="/place/$slug"
            params={{ slug: "mahabalipuram" }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 text-white shadow-xl md:col-span-7 min-h-[260px] border border-slate-700/60 transition-all hover:border-sky-400/80 hover:shadow-2xl"
          >
            <img
              src="https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=85"
              alt="Mahabalipuram UNESCO Shore Temple and Coast"
              className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/30" />

            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/20 border border-sky-400/40 px-3 py-0.5 text-xs font-mono font-bold text-sky-200 backdrop-blur-md">
                🏛️ UNESCO WORLD HERITAGE · COASTAL DRIVE
              </span>
              <div className="flex items-center gap-2 rounded-xl bg-slate-950/80 border border-white/15 px-2.5 py-1 backdrop-blur-md shadow-lg">
                <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                  <Star className="size-3 fill-amber-400" /> 4.9
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-xs font-mono font-bold text-sky-300">Chengalpattu</span>
              </div>
            </div>

            <div className="relative z-10 pt-4">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-300">
                    Coastal Heritage
                  </span>
                  <h3 className="mt-0.5 text-xl sm:text-2xl font-bold font-display text-white group-hover:text-sky-300 transition-colors drop-shadow-md">
                    Mahabalipuram Shore Temple
                  </h3>
                  <p className="mt-1 text-xs text-slate-200 line-clamp-2 leading-relaxed max-w-lg">
                    7th-century monolithic rock-cut Dravidian temples and stone sculptures carved overlooking crashing Bay of Bengal ocean waves.
                  </p>
                </div>
                <div className="flex size-10 rounded-full bg-white/10 group-hover:bg-sky-400 group-hover:text-slate-950 items-center justify-center transition shrink-0 ml-3 border border-white/20 shadow-lg">
                  <ArrowRight className="size-4" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* SECTION 4: DISCOVER BY DISTRICT (Popz Design Spec) */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">Discover by District</h2>
            <p className="mt-1 text-sm text-slate-500">Explore places grouped by district region and culture</p>
          </div>
          <Link
            to="/districts"
            className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700"
          >
            <span>Explore Districts</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <AnimatedGroup
          preset="blur-slide"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {DISTRICT_HIGHLIGHTS.map((dist) => (
            <Link
              key={dist.name}
              to={dist.route}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm transition-all duration-300 hover:border-sky-300 hover:shadow-xl"
            >
              <div className="h-48 w-full overflow-hidden">
                <img
                  src={dist.image}
                  alt={dist.name}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition">{dist.name}</h3>
                    <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-mono font-bold text-sky-700 border border-sky-200">
                      {dist.spots} Spots
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">{dist.title}</p>
                </div>
              </div>
            </Link>
          ))}
        </AnimatedGroup>
      </section>

      {/* SECTION 5: SIGNATURE TRAVEL TRAILS (Expandable Card Experience) */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-200/60">
              <Sparkles className="size-3.5 text-sky-600" />
              <span>Curated Circuits</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">Signature Travel Trails</h2>
            <p className="mt-1 text-sm text-slate-500">Curated themed circuits with road distance and verified itineraries — click arrow to expand details</p>
          </div>

          <Link
            to="/routes"
            className="flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 transition"
          >
            <span>View All Trails</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* Grid of Expandable Trail Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 items-start">
          {CURATED_SIGNATURE_TRAILS.map((trail) => (
            <ExpandableTrailCard key={trail.slug} trail={trail} />
          ))}
        </div>
      </section>

      {/* SECTION 6: MAP PREVIEW (Popz Design Spec: Non-wheel-hijacking lightweight preview) */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">Interactive Map Explorer</h2>
            <p className="mt-1 text-sm text-slate-500">Discover places geographically across all districts of Tamil Nadu</p>
          </div>
          <Link
            to="/explore"
            className="flex items-center gap-2 rounded-full bg-sky-500 px-5 py-2 text-xs font-bold text-white hover:bg-sky-600 transition shadow-md shadow-sky-500/20"
          >
            <MapIcon className="size-3.5" />
            <span>Open Map Explorer</span>
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-sky-100 shadow-xl bg-white">
          <GoogleMapHero GOOGLE_MAPS_KEY={""} onOpenDedicatedMap={() => setIsDedicatedMapOpen(true)} />
        </div>
      </section>

      {/* SECTION 7: TRIP PLANNER SPOTLIGHT (Popz Design Spec) */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="rounded-3xl border border-sky-100 bg-white p-8 md:p-12 shadow-xl flex flex-col lg:flex-row items-stretch justify-between gap-8">
          <div className="max-w-xl flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200 px-3.5 py-1 text-xs font-bold text-sky-700">
                <Navigation className="size-3.5 text-sky-600" /> Smart Route Planner
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold text-slate-900 sm:text-4xl">Plan your custom trip in seconds</h2>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Tell us your starting point, interests, and budget. Our planner builds an itinerary with real road distances, fuel estimates, elevation profiles, and day-by-day schedules.
              </p>

              {/* Required Inputs List */}
              <div className="mt-6 rounded-2xl bg-sky-50/70 border border-sky-100 p-3.5 text-xs text-slate-600 flex flex-wrap items-center gap-2">
                <span className="font-bold text-sky-700 text-xs tracking-wider">Required inputs:</span>
                <span>Starting Point</span> · <span>Travel Interests</span> · <span>Budget Level</span> · <span>Trip Duration & Dates</span>
              </div>
            </div>

            <div className="mt-8">
              <Link
                to="/planner"
                className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-8 py-3.5 text-sm font-extrabold text-white hover:bg-sky-600 transition shadow-xl shadow-sky-500/20"
              >
                <span>Try the trip planner</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          {/* Static Sample Itinerary Output Card */}
          <div className="w-full lg:w-96 rounded-2xl border border-sky-200 bg-sky-50/50 p-5 shadow-sm flex flex-col justify-between space-y-4 shrink-0">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <span className="rounded-full bg-sky-100 text-sky-700 border border-sky-200 px-2.5 py-1 text-xs font-mono font-bold">
                SAMPLE ITINERARY PREVIEW
              </span>
              <span className="text-xs font-bold text-amber-600">3 Days</span>
            </div>

            <div>
              <h3 className="font-display font-bold text-base text-slate-900">Chennai → Madurai Heritage Loop</h3>
              <p className="text-xs text-slate-500 mt-0.5">Optimized for history, local cuisine & scenic stops</p>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 border-y border-sky-100 py-3">
              <div className="flex items-start gap-2">
                <span className="grid size-5 shrink-0 place-items-center rounded bg-sky-200 text-xs font-bold text-sky-800">D1</span>
                <div><p className="font-bold text-slate-900">Shore Temple & Pondicherry</p><p className="text-xs text-slate-500">French Quarter walk & beach promenade</p></div>
              </div>
              <div className="flex items-start gap-2">
                <span className="grid size-5 shrink-0 place-items-center rounded bg-sky-200 text-xs font-bold text-sky-800">D2</span>
                <div><p className="font-bold text-slate-900">Chola Big Temple, Thanjavur</p><p className="text-xs text-slate-500">Great Living Chola architecture & palace</p></div>
              </div>
              <div className="flex items-start gap-2">
                <span className="grid size-5 shrink-0 place-items-center rounded bg-sky-200 text-xs font-bold text-sky-800">D3</span>
                <div><p className="font-bold text-slate-900">Meenakshi Temple & Jigarthanda</p><p className="text-xs text-slate-500">Nayak heritage walk & legendary street food</p></div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-1">
              <span>🛣️ 480 km</span>
              <span>⛽ ~₹3,400 fuel</span>
              <span>🏛️ 12 Spots</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: TRAVEL GUIDANCE (Popz Design Spec) */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <PeakTravelGuide />
      </section>

      </div>
    </AppShell>
  );
}
