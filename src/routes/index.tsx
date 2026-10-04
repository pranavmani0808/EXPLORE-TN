import { useState } from "react";
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
} from "lucide-react";
import heroImg from "@/assets/hero-ghats.jpg";
import { AppShell } from "@/components/site/app-shell";
import { GoogleMapHero } from "@/components/site/google-map-hero";
import { DedicatedMapModal } from "@/components/site/dedicated-map-modal";
import { PlaceCard } from "@/components/site/place-card";
import { SearchPanel } from "@/components/site/search-panel";
import { Button } from "@/components/ui/button";
import { places } from "@/data/places";
import { KolamDivider } from "@/components/site/kolam-divider";
import { PeakTravelGuide } from "@/components/site/peak-travel-guide";

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

// Category Interest Tiles (Popz Design Section 2)
const INTEREST_CATEGORIES = [
  { slug: "heritage-temples", categoryParam: "heritage-temples", title: "Heritage & Temples", icon: Landmark, count: "480+ Places", bg: "from-amber-500/20 to-amber-700/10", border: "border-amber-500/30", text: "text-amber-400" },
  { slug: "hill-escapes", categoryParam: "hill-escapes", title: "Hill Escapes", icon: Mountain, count: "120+ Viewpoints", bg: "from-emerald-500/20 to-emerald-700/10", border: "border-emerald-500/30", text: "text-emerald-400" },
  { slug: "waterfalls", categoryParam: "waterfalls", title: "Waterfalls & Streams", icon: CloudRain, count: "85+ Waterfalls", bg: "from-sky-500/20 to-sky-700/10", border: "border-sky-500/30", text: "text-sky-400" },
  { slug: "coastal", categoryParam: "coastal", title: "Coastal Journeys", icon: Waves, count: "140 km Coast", bg: "from-cyan-500/20 to-cyan-700/10", border: "border-cyan-500/30", text: "text-cyan-400" },
  { slug: "culinary", categoryParam: "culinary", title: "Culinary Trails", icon: Utensils, count: "90+ Local Spots", bg: "from-orange-500/20 to-orange-700/10", border: "border-orange-500/30", text: "text-orange-400" },
  { slug: "wildlife", categoryParam: "wildlife", title: "Forest & Wildlife", icon: Trees, count: "32 Trails", bg: "from-green-500/20 to-green-700/10", border: "border-green-500/30", text: "text-green-400" },
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

  const handleAddToTrip = (slug: string) => {
    setAddedTrips((prev) => ({ ...prev, [slug]: true }));
  };

  const featuredPlaces = FEATURED_SLUGS.map(
    (slug) => places.find((p) => p.slug === slug)
  ).filter(Boolean) as Place[];

  return (
    <AppShell className="bg-[#09090b]">
      {/* Fixed Background Image Backdrop */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.img
          src={heroImg}
          alt="Misty Western Ghats fixed background backdrop"
          width={1920}
          height={1200}
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.55 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          className="size-full object-cover filter brightness-90 saturate-110"
        />
        {/* Subtle Dark Vignette Overlay for rich backdrop visibility and high readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/40 via-[#09090b]/70 to-[#09090b]/90" />
      </div>

      <SearchPanel open={searchOpen} onOpenChange={setSearchOpen} />

      <DedicatedMapModal
        isOpen={isDedicatedMapOpen}
        onClose={() => setIsDedicatedMapOpen(false)}
      />

      <div className="relative z-10">
        {/* SECTION 1: HERO & SEARCH (Popz Design Spec) */}
        <section className="relative min-h-[82vh] overflow-hidden bg-transparent pt-24 sm:pt-32">
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="group relative inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-300 backdrop-blur-md cursor-help"
            >
              <Compass className="size-3.5 text-amber-400" />
              <span>1,240 places · 38 districts · checked by locals</span>
              <Info className="size-3 text-amber-400/80 hover:text-amber-300 transition" />
              {/* Interactive Info Tooltip */}
              <div className="absolute top-full left-0 mt-2 hidden w-80 rounded-2xl border border-zinc-700 bg-zinc-900/98 p-3 text-[11px] text-zinc-300 shadow-2xl group-hover:block z-30">
                <p className="font-bold text-amber-300 mb-1">Local Verification Protocol</p>
                Coordinates, parking locations, entry fees, and opening hours are verified against local contributor reports and official district records.
              </div>
            </motion.div>

            {/* Popz Design Hero Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mt-6 font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl leading-[1.05]"
            >
              Explore Tamil Nadu.
              <br />
              <span className="text-emerald-400">Beyond the usual.</span>
            </motion.h1>

            {/* Popz Design Hero Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-5 max-w-2xl text-base text-zinc-300 sm:text-lg leading-relaxed font-normal"
            >
              Discover heritage trails, hill escapes, and coastal journeys. Build a trip around what you love.
            </motion.p>

            {/* Popz Design Visitor Search Field */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-8 flex max-w-xl items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/95 p-2 shadow-2xl backdrop-blur-md"
            >
              <Search className="ml-3 size-5 text-zinc-400 shrink-0" />
              <input
                type="text"
                readOnly
                onClick={() => setSearchOpen(true)}
                placeholder="Search places, districts, or trails..."
                className="w-full bg-transparent px-2 text-sm text-zinc-100 placeholder:text-zinc-400 focus:outline-none cursor-pointer"
              />
              <kbd className="hidden md:inline-flex items-center rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-400 border border-zinc-700 shrink-0">
                {typeof navigator !== "undefined" && /Mac/i.test(navigator.platform || "") ? "⌘K" : "Ctrl K"}
              </kbd>
              <Button
                onClick={() => setSearchOpen(true)}
                className="rounded-full bg-emerald-500 px-6 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition self-stretch h-auto py-2.5"
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
                className="flex items-center gap-2 rounded-full bg-emerald-500 px-7 py-3 text-sm font-extrabold text-zinc-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
              >
                <Sparkles className="size-4 text-zinc-950 fill-zinc-950" />
                <span>Plan Route</span>
                <ArrowRight className="size-4" />
              </Link>

              <Link
                to="/explore"
                className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/90 px-7 py-3 text-sm font-bold text-zinc-100 hover:border-zinc-500 hover:bg-zinc-800 transition"
              >
                <span>Browse places</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <KolamDivider />

      {/* SECTION 2: EXPLORE BY INTEREST (Popz Design Spec) */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Explore by Interest</h2>
          <p className="mt-1 text-sm text-zinc-400">Curated collections based on travel themes across Tamil Nadu</p>
        </div>

        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
          {INTEREST_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                to="/explore"
                search={{ category: cat.categoryParam }}
                className={`group flex flex-col justify-between rounded-2xl border ${cat.border} bg-gradient-to-br ${cat.bg} p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl min-h-[140px]`}
              >
                <span className={`grid size-11 place-items-center rounded-xl bg-zinc-950/80 border ${cat.border} ${cat.text} shrink-0`}>
                  <Icon className="size-5" />
                </span>
                <div className="mt-3">
                  <h3 className="text-xs sm:text-sm font-bold text-zinc-100 group-hover:text-emerald-400 transition leading-snug">{cat.title}</h3>
                  <p className="mt-1 text-[11px] text-zinc-400 font-mono">{cat.count}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <KolamDivider />

      {/* SECTION 3: FEATURED PLACES (Popz Design Spec: 3-column grid, photo-first) */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Featured Destinations</h2>
            <p className="mt-1 text-sm text-zinc-400">Must-visit places with verified coordinates and practical details</p>
          </div>
          <Link
            to="/explore"
            className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300"
          >
            <span>View All Places</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* 3-Column Responsive Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredPlaces.map((place) => (
            <PlaceCard
              key={place.id || place.slug}
              place={place}
              onAddToTrip={handleAddToTrip}
              isAdded={addedTrips[place.slug]}
            />
          ))}
        </div>
      </section>

      <KolamDivider />

      {/* SECTION 4: DISCOVER BY DISTRICT (Popz Design Spec) */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Discover by District</h2>
            <p className="mt-1 text-sm text-zinc-400">Explore places grouped by district region and culture</p>
          </div>
          <Link
            to="/districts"
            className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300"
          >
            <span>Explore Districts</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DISTRICT_HIGHLIGHTS.map((dist) => (
            <Link
              key={dist.name}
              to={dist.route}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-xl transition-all duration-300 hover:border-emerald-500/50 hover:shadow-2xl"
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
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition">{dist.name}</h3>
                    <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-mono text-emerald-400 border border-zinc-700">
                      {dist.spots} Spots
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400 line-clamp-2">{dist.title}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <KolamDivider />

      {/* SECTION 5: SIGNATURE EDITORIAL TRAILS (Popz Design Spec) */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Signature Travel Trails</h2>
          <p className="mt-1 text-sm text-zinc-400">Curated themed circuits with road distance and verified itineraries</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {SIGNATURE_TRAILS.map((trail) => (
            <div
              key={trail.title}
              className={`flex flex-col justify-between rounded-3xl border border-zinc-800 bg-gradient-to-b ${trail.bg} p-6 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all h-full`}
            >
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-300">
                      <span>{trail.icon}</span>
                      <span>{trail.badge}</span>
                    </span>
                    <span className="rounded-full bg-zinc-900/90 border border-zinc-700/80 px-2.5 py-0.5 text-xs font-mono text-emerald-400 font-bold">
                      {trail.difficulty}
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-lg font-bold text-white leading-snug group-hover:text-emerald-300 transition-colors">
                    {trail.title}
                  </h3>
                  <p className="mt-2 text-xs text-zinc-300 leading-relaxed">{trail.subtitle}</p>
                </div>

                {/* Additional Metadata Pills */}
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-mono text-zinc-400">
                  <span className="rounded-lg bg-zinc-900/80 px-2.5 py-1 border border-zinc-800">
                    🗓️ {trail.bestSeason}
                  </span>
                  <span className="rounded-lg bg-zinc-900/80 px-2.5 py-1 border border-zinc-800">
                    📍 {trail.stops} Stops
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 font-mono text-zinc-400">
                  <span>🛣️ {trail.distance}</span>
                  <span>⏱️ {trail.duration}</span>
                </div>
                <Link
                  to={trail.link}
                  className="flex items-center gap-1 font-bold text-emerald-400 hover:text-emerald-300 transition-colors min-h-[36px] items-center"
                >
                  <span>View Trail</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <KolamDivider />

      {/* SECTION 6: MAP PREVIEW (Popz Design Spec: Non-wheel-hijacking lightweight preview) */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Interactive Map Explorer</h2>
            <p className="mt-1 text-sm text-zinc-400">Discover places geographically across all districts of Tamil Nadu</p>
          </div>
          <Link
            to="/explore"
            className="flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition"
          >
            <MapIcon className="size-3.5" />
            <span>Open Map Explorer</span>
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-zinc-800 shadow-2xl">
          <GoogleMapHero GOOGLE_MAPS_KEY={""} onOpenDedicatedMap={() => setIsDedicatedMapOpen(true)} />
        </div>
      </section>

      <KolamDivider />

      {/* SECTION 7: TRIP PLANNER SPOTLIGHT (Popz Design Spec) */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-zinc-800 bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-950 p-8 md:p-12 shadow-2xl flex flex-col lg:flex-row items-stretch justify-between gap-8">
          <div className="max-w-xl flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-400">
                <Sparkles className="size-3.5" /> AI Trip Copilot
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">Plan your custom trip in seconds</h2>
              <p className="mt-3 text-sm text-zinc-300 leading-relaxed">
                Tell us your starting point, interests, and budget. Our planner builds an itinerary with real road distances, fuel estimates, elevation profiles, and day-by-day schedules.
              </p>

              {/* Required Inputs List */}
              <div className="mt-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 p-3.5 text-xs text-zinc-400 flex flex-wrap items-center gap-2">
                <span className="font-bold text-emerald-400 text-xs tracking-wider">Required inputs:</span>
                <span>Starting Point</span> · <span>Travel Interests</span> · <span>Budget Level</span> · <span>Trip Duration & Dates</span>
              </div>
            </div>

            <div className="mt-8">
              <Link
                to="/planner"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-3.5 text-sm font-extrabold text-zinc-950 hover:bg-emerald-400 transition shadow-xl shadow-emerald-500/20"
              >
                <span>Try the trip planner</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          {/* Static Sample Itinerary Output Card */}
          <div className="w-full lg:w-96 rounded-2xl border border-emerald-500/30 bg-zinc-950/90 p-5 shadow-xl flex flex-col justify-between space-y-4 shrink-0">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 text-xs font-mono font-bold">
                SAMPLE ITINERARY PREVIEW
              </span>
              <span className="text-xs font-bold text-amber-400">3 Days</span>
            </div>

            <div>
              <h3 className="font-display font-bold text-base text-white">Chennai → Madurai Heritage Loop</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Optimized for history, local cuisine & scenic stops</p>
            </div>

            <div className="space-y-2.5 text-xs text-zinc-300 border-y border-zinc-800/80 py-3">
              <div className="flex items-start gap-2">
                <span className="grid size-5 shrink-0 place-items-center rounded bg-emerald-500/20 text-xs font-bold text-emerald-400">D1</span>
                <div><p className="font-bold text-white">Shore Temple & Pondicherry</p><p className="text-xs text-zinc-400">French Quarter walk & beach promenade</p></div>
              </div>
              <div className="flex items-start gap-2">
                <span className="grid size-5 shrink-0 place-items-center rounded bg-emerald-500/20 text-xs font-bold text-emerald-400">D2</span>
                <div><p className="font-bold text-white">Chola Big Temple, Thanjavur</p><p className="text-xs text-zinc-400">Great Living Chola architecture & palace</p></div>
              </div>
              <div className="flex items-start gap-2">
                <span className="grid size-5 shrink-0 place-items-center rounded bg-emerald-500/20 text-xs font-bold text-emerald-400">D3</span>
                <div><p className="font-bold text-white">Meenakshi Temple & Jigarthanda</p><p className="text-xs text-zinc-400">Nayak heritage walk & legendary street food</p></div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pt-1">
              <span>🛣️ 480 km</span>
              <span>⛽ ~₹3,400 fuel</span>
              <span>🏛️ 12 Spots</span>
            </div>
          </div>
        </div>
      </section>

      <KolamDivider />

      {/* SECTION 8: TRAVEL GUIDANCE (Popz Design Spec) */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <PeakTravelGuide />
      </section>

      {/* SECTION 9: FOOTER (Popz Design Spec: Clear attribution + subtle admin link) */}
      <footer className="border-t border-zinc-800 bg-[#09090b] text-zinc-400 py-12 mt-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-white text-base">Explore<span className="text-emerald-400">TN</span></span>
            <span>· Your guide to Tamil Nadu, beyond the usual.</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-zinc-400">
            <Link to="/explore" className="hover:text-white transition">Places</Link>
            <Link to="/routes" className="hover:text-white transition">Routes</Link>
            <Link to="/community" className="hover:text-white transition">Guides</Link>
            <Link to="/legal/privacy" className="hover:text-white transition">Privacy</Link>
            <Link to="/legal/terms" className="hover:text-white transition">Terms</Link>
          </div>
        </div>
      </footer>
      </div>
    </AppShell>
  );
}
