import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ArrowUpRight, Sparkles } from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";

export interface InterestCategoryData {
  slug: string;
  categoryParam: string;
  title: string;
  count: string;
  tagline: string;
  tags: string[];
  description: string;
  image: string;
  categoryType: string;
}

export const CURATED_INTERESTS: InterestCategoryData[] = [
  {
    slug: "heritage-temples",
    categoryParam: "heritage-temples",
    title: "Heritage & Temples",
    count: "480+ Places",
    tagline: "Living Dravidian architecture, sacred stone carvings & towering gopurams.",
    tags: ["Chola Wonders", "Gopurams", "UNESCO Heritage"],
    description:
      "Explore millennia-old granite sanctuaries, thousand-pillar corridors, and sacred temple festivals across Madurai, Thanjavur, and Rameswaram.",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=900&q=80",
    categoryType: "temples",
  },
  {
    slug: "hill-escapes",
    categoryParam: "hill-escapes",
    title: "Hill Escapes",
    count: "120+ Viewpoints",
    tagline: "Misty pine forests, cool mountain air & colonial heritage rail routes.",
    tags: ["Nilgiri Hills", "Tea Estates", "Peak Viewpoints"],
    description:
      "Ascend into the clouds of Ooty, Coonoor, Kodaikanal, and Yercaud. Walk through rolling tea gardens and breathe crisp alpine mountain breezes.",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80",
    categoryType: "hills",
  },
  {
    slug: "waterfalls",
    categoryParam: "waterfalls",
    title: "Waterfalls & Streams",
    count: "85+ Waterfalls",
    tagline: "Rushing therapeutic river streams, forest plunges & coracle rides.",
    tags: ["Coracle Rides", "Forest Cascades", "Monsoon Trails"],
    description:
      "Feel the spray of the Niagara of India at Hogenakkal, rejuvenating medicinal herbal falls at Courtallam, and hidden jungle plunges in Theni.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
    categoryType: "waterfalls",
  },
  {
    slug: "coastal",
    categoryParam: "coastal",
    title: "Coastal Journeys",
    count: "140 km Coast",
    tagline: "Pristine ocean horizons, temple shores & legendary coastal drives.",
    tags: ["Ghost Town", "Shore Temples", "Ocean Highways"],
    description:
      "Ride across the Pamban sea bridge, touch the confluence of three oceans at Kanniyakumari, and walk windswept shores of Dhanushkodi.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
    categoryType: "beaches",
  },
  {
    slug: "culinary",
    categoryParam: "culinary",
    title: "Culinary Trails",
    count: "90+ Local Spots",
    tagline: "Spicy Chettinad feasts, Madurai night food & aromatic filter coffee.",
    tags: ["Chettinad Feasts", "Filter Kaapi", "Street Food"],
    description:
      "Savor generational spice blends in heritage Chettinad mansions, frothy Madurai jigarthanda, and authentic coastal seafood along the Bay of Bengal.",
    image: "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=900&q=80",
    categoryType: "heritage",
  },
  {
    slug: "wildlife",
    categoryParam: "wildlife",
    title: "Forest & Wildlife",
    count: "32 Trails",
    tagline: "Untamed elephant corridors, cloud-forest sanctuaries & tiger reserves.",
    tags: ["Mudumalai Reserve", "Western Ghats", "Elephant Corridors"],
    description:
      "Safari through the UNESCO Western Ghats biodiversity hotspot, spot wild herds in Anamalai, and discover sanctuary wetlands.",
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=900&q=80",
    categoryType: "wildlife",
  },
];

export function ExpandableInterestCard({ item }: { item: InterestCategoryData }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="group relative flex flex-col justify-between w-full bg-[#dbe0e5] dark:bg-slate-900/90 rounded-[32px] p-2.5 sm:p-3 shadow-md hover:shadow-xl border border-slate-300/60 dark:border-white/10 transition-all duration-500 ease-out"
      style={{
        boxShadow: isExpanded
          ? "0 20px 40px -10px rgba(0, 0, 0, 0.22), inset 0 1px 1px rgba(255, 255, 255, 0.7)"
          : "0 8px 24px -6px rgba(0, 0, 0, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.8)",
      }}
    >
      {/* Top Image Card */}
      <div className="relative w-full aspect-[16/11] rounded-[24px] overflow-hidden bg-slate-900 shadow-sm">
        <SafeImage
          src={item.image}
          alt={item.title}
          category={item.categoryType}
          className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Ambient Dark Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-black/10 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/95 dark:bg-slate-950/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-mono font-bold text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 shadow-sm">
            <Sparkles className="size-2.5 text-sky-600 dark:text-sky-400" />
            {item.count}
          </span>
        </div>

        {/* Bottom Content Over Image */}
        <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4 flex items-end justify-between gap-2 z-10">
          <div className="min-w-0 pr-1">
            <h3 className="text-white text-base sm:text-lg font-bold tracking-tight drop-shadow-md font-display truncate">
              {item.title}
            </h3>
            <p className="text-white/80 text-[11px] font-sans font-medium mt-0.5 line-clamp-1">
              Curated trail collection
            </p>
          </div>

          {/* Frosted Glass "View collection" Button (visible when expanded) */}
          <Link
            to="/explore"
            search={{ category: item.categoryParam }}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-semibold tracking-wide border border-white/30 backdrop-blur-md bg-white/20 hover:bg-white/35 transition-all duration-300 shadow-sm ${
              isExpanded
                ? "opacity-100 scale-100 pointer-events-auto translate-y-0"
                : "opacity-0 scale-90 pointer-events-none translate-y-1"
            }`}
          >
            <span>Explore</span>
            <ArrowUpRight className="size-3" />
          </Link>
        </div>
      </div>

      {/* Expandable Content Tray */}
      <div
        className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          maxHeight: isExpanded ? "280px" : "0px",
          opacity: isExpanded ? 1 : 0,
          transform: isExpanded ? "translateY(0)" : "translateY(8px)",
          pointerEvents: isExpanded ? "auto" : "none",
        }}
      >
        <div className="pt-3 pb-1 px-1.5 sm:px-2">
          {/* Subheading Tagline */}
          <p className="text-slate-800 dark:text-slate-200 text-xs sm:text-[13px] font-medium leading-snug">
            {item.tagline}
          </p>

          {/* Tag Pills */}
          <div className="flex items-center gap-1.5 mt-2.5 mb-2.5 flex-wrap">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-lg bg-black/6 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-[11px] font-semibold border border-black/5 dark:border-white/5"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Thin Divider */}
          <div className="h-px w-full bg-slate-400/25 dark:bg-white/10 my-2.5" />

          {/* Editorial Paragraph */}
          <p className="text-slate-600 dark:text-slate-400 text-[11px] sm:text-xs leading-relaxed font-sans line-clamp-3">
            {item.description}
          </p>
        </div>
      </div>

      {/* Expand / Collapse Chevron Toggle Button */}
      <div className="pt-1.5 pb-0.5 flex items-center justify-center">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? `Collapse ${item.title}` : `Expand ${item.title}`}
          className="group p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          <ChevronDown
            className={`size-4 text-slate-700 dark:text-slate-300 transition-transform duration-500 ease-out ${
              isExpanded ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

export interface SignatureTrailData {
  slug: string;
  link: string;
  title: string;
  subtitle: string;
  badge: string;
  distance: string;
  duration: string;
  stops: number;
  difficulty: string;
  bestSeason: string;
  tagline: string;
  tags: string[];
  description: string;
  image: string;
}

export const CURATED_SIGNATURE_TRAILS: SignatureTrailData[] = [
  {
    slug: "arupadai-veedu",
    link: "/trails/arupadai-veedu",
    title: "Arupadai Veedu Pilgrimage",
    subtitle: "The 6 Holy Abodes of Lord Murugan",
    badge: "Heritage Pilgrimage",
    distance: "1,240 km",
    duration: "5 Days",
    stops: 6,
    difficulty: "Moderate",
    bestSeason: "Oct – Mar",
    tagline: "Six sacred mountain, coastal and forest abodes spanning Thiruthani to Tiruchendur.",
    tags: ["6 Murugan Abodes", "Ghat Passes", "Sea Shore Temple"],
    description:
      "Journey across the complete devotional circuit of Lord Murugan: Tiruchendur's sea temple, Palani's granite hill shrine, Swamimalai, Thirupparankundram, Thiruthani, and Pazhamudircholai forest hill.",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "pancha-bhoota",
    link: "/trails/pancha-bhoota",
    title: "Pancha Bhoota Sthalams",
    subtitle: "Five Sacred Elemental Shiva Temples",
    badge: "Elemental Circuit",
    distance: "740 km",
    duration: "3–4 Days",
    stops: 5,
    difficulty: "Easy",
    bestSeason: "Oct – Mar",
    tagline: "Earth, Water, Fire, Air & Space sacred temples built by ancient Chola and Pallava kings.",
    tags: ["5 Cosmic Elements", "Chola Architecture", "Arunachala Hill"],
    description:
      "Explore the 5 elemental shrines: Earth at Kanchipuram, Water at Thiruvanaikaval, Fire at Tiruvannamalai Arunachaleswarar, Air at Srikalahasti, and Space at Chidambaram Nataraja Temple.",
    image: "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "western-ghats-70-hairpin",
    link: "/trails/western-ghats-70-hairpin",
    title: "Western Ghats 70-Hairpin Pass",
    subtitle: "Kolli Hills & Valparai Cloud Highway",
    badge: "Ghat Highway",
    distance: "460 km",
    duration: "2 Days",
    stops: 14,
    difficulty: "Challenging",
    bestSeason: "Jul – Feb",
    tagline: "70 continuous hairpin bends climbing into misty tea plantations and shola valleys.",
    tags: ["70 Hairpin Turns", "Tea Estates", "Shola Cloud Forests"],
    description:
      "Navigate one of India's most thrilling mountain driving circuits: 70 switchback hairpins ascending 1,300m into Kolli Hills, pristine waterfalls, and Valparai elephant corridors.",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "coromandel-coastal",
    link: "/trails/coromandel-coastal",
    title: "Coromandel Coastal Highway",
    subtitle: "Mahabalipuram to Dhanushkodi Ocean Drive",
    badge: "Coastal Drive",
    distance: "580 km",
    duration: "3 Days",
    stops: 18,
    difficulty: "Easy",
    bestSeason: "Nov – Feb",
    tagline: "East Coast Road vistas, UNESCO rock-cut shore temples, and the Pamban sea bridge.",
    tags: ["ECR Ocean Highway", "Pamban Bridge", "UNESCO Shore Temple"],
    description:
      "A scenic road expedition along the Bay of Bengal coastline passing French colonial avenues in Pondicherry, Mahabalipuram stone monolithic shrines, and the ghost town of Dhanushkodi.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  },
];

export function ExpandableTrailCard({ trail }: { trail: SignatureTrailData }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="group relative flex flex-col justify-between w-full bg-white dark:bg-slate-900 rounded-[28px] p-3 shadow-md hover:shadow-xl border border-sky-100 dark:border-slate-800 transition-all duration-300 ease-out"
      style={{
        boxShadow: isExpanded
          ? "0 20px 35px -10px rgba(14, 165, 233, 0.15), 0 4px 12px rgba(0, 0, 0, 0.05)"
          : "0 6px 20px -4px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.02)",
      }}
    >
      {/* Top Image Card */}
      <div className="relative w-full aspect-[16/11] rounded-[20px] overflow-hidden bg-slate-900 shadow-sm">
        <SafeImage
          src={trail.image}
          alt={trail.title}
          category="routes"
          className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Ambient Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-mono font-bold text-slate-800 dark:text-slate-200 border border-slate-200/80 shadow-sm">
            <Sparkles className="size-2.5 text-sky-600 dark:text-sky-400" />
            {trail.badge}
          </span>
          <span className="rounded-full bg-slate-900/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-mono text-sky-300 font-bold border border-white/15">
            {trail.difficulty}
          </span>
        </div>

        {/* Bottom Title & Action Over Image */}
        <div className="absolute inset-x-0 bottom-0 p-3 flex items-end justify-between gap-2 z-10">
          <div className="min-w-0 pr-1">
            <h3 className="text-white text-base font-bold tracking-tight drop-shadow-md font-display line-clamp-1">
              {trail.title}
            </h3>
            <p className="text-white/80 text-[11px] font-mono mt-0.5 line-clamp-1">
              {trail.stops} Places · {trail.distance}
            </p>
          </div>

          <Link
            to={trail.link}
            className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-white text-[11px] font-semibold border border-white/30 backdrop-blur-md bg-white/20 hover:bg-white/35 transition-all shadow-sm"
          >
            <span>View Trail</span>
            <ArrowUpRight className="size-3" />
          </Link>
        </div>
      </div>

      {/* Structured Stats Grid: Places, Distance, Best Season, Duration */}
      <div className="mt-3 grid grid-cols-2 gap-1.5 p-2 rounded-2xl bg-sky-50/70 dark:bg-slate-800/60 border border-sky-100 dark:border-slate-800 text-[11px]">
        <div className="flex items-center gap-1.5 px-1 text-slate-700 dark:text-slate-300">
          <span className="text-sky-600 font-bold">📍 Places:</span>
          <span className="font-semibold text-slate-900 dark:text-white">{trail.stops} stops</span>
        </div>
        <div className="flex items-center gap-1.5 px-1 text-slate-700 dark:text-slate-300">
          <span className="text-sky-600 font-bold">🛣️ Distance:</span>
          <span className="font-semibold text-slate-900 dark:text-white">{trail.distance}</span>
        </div>
        <div className="flex items-center gap-1.5 px-1 text-slate-700 dark:text-slate-300">
          <span className="text-sky-600 font-bold">🗓️ Best Time:</span>
          <span className="font-semibold text-slate-900 dark:text-white">{trail.bestSeason}</span>
        </div>
        <div className="flex items-center gap-1.5 px-1 text-slate-700 dark:text-slate-300">
          <span className="text-sky-600 font-bold">⏱️ Duration:</span>
          <span className="font-semibold text-slate-900 dark:text-white">{trail.duration}</span>
        </div>
      </div>

      {/* Clear Small Description */}
      <div className="mt-2.5 px-1">
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
          {trail.tagline}
        </p>
      </div>

      {/* Expandable Tray for Highlights & Detailed Overview */}
      <div
        className="overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          maxHeight: isExpanded ? "260px" : "0px",
          opacity: isExpanded ? 1 : 0,
          transform: isExpanded ? "translateY(0)" : "translateY(6px)",
          pointerEvents: isExpanded ? "auto" : "none",
        }}
      >
        <div className="pt-2 pb-1 px-1 border-t border-slate-100 dark:border-slate-800 mt-2.5">
          {/* Key Stops / Highlights */}
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            {trail.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 text-[10px] font-semibold border border-sky-100 dark:border-sky-800/40"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Full Itinerary Overview */}
          <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed line-clamp-3">
            {trail.description}
          </p>

          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Verified Itinerary</span>
            <Link to={trail.link} className="font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">
              <span>Full Route Guide</span>
              <ArrowUpRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Expand / Collapse Chevron Toggle Button */}
      <div className="pt-1.5 flex items-center justify-between px-1 border-t border-slate-100 dark:border-slate-800 mt-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          className="text-[11px] font-semibold text-slate-500 hover:text-sky-600 transition flex items-center gap-1 cursor-pointer"
        >
          <span>{isExpanded ? "Show Less" : "More Details"}</span>
          <ChevronDown
            className={`size-3.5 text-slate-500 transition-transform duration-300 ${
              isExpanded ? "rotate-180 text-sky-600" : "rotate-0"
            }`}
          />
        </button>

        <Link
          to={trail.link}
          className="text-[11px] font-bold text-sky-600 hover:text-sky-700 flex items-center gap-0.5"
        >
          <span>Explore Trail</span>
          <ArrowUpRight className="size-3" />
        </Link>
      </div>
    </div>
  );
}

export function ExpandableInterestSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 text-xs font-semibold border border-sky-200/60 dark:border-sky-800/50">
            <Sparkles className="size-3.5 text-sky-600 dark:text-sky-400" />
            <span>Interactive Theme Collections</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Explore by Interest
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Curated collections based on travel themes across Tamil Nadu — click arrow to expand details
          </p>
        </div>

        <Link
          to="/explore"
          className="flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 transition"
        >
          <span>Browse All Categories</span>
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      {/* Grid of Expandable Interest Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-start">
        {CURATED_INTERESTS.map((item) => (
          <ExpandableInterestCard key={item.slug} item={item} />
        ))}
      </div>
    </section>
  );
}
