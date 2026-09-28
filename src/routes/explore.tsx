import { useState, useEffect, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Compass,
  Map,
  Search,
  Filter,
  Star,
  MapPin,
  ArrowRight,
  Mountain,
  Waves,
  Landmark,
  CloudRain,
  Footprints,
  Utensils,
  Sparkles,
  Trees,
  SlidersHorizontal,
  Sun,
  Flame,
  Camera,
  Layers,
  ChevronRight,
} from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import { getApiBaseUrl } from "@/lib/api-client/config";
import { PlaceApiRepository } from "@/lib/api-client/places";
import { CANONICAL_PLACES } from "@/lib/data/canonical-places";
import { DEFAULT_ARUPADAI_VEEDU_TEMPLES } from "@/data/places";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/explore")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      category: (search.category as string) || "",
    };
  },
  head: () => ({
    meta: [
      { title: "Explore Tamil Nadu by Experience — ExplorerTN" },
      {
        name: "description",
        content:
          "Explore Tamil Nadu by experience: Arupadai Veedu, Waterfalls, Trekking, Beaches, Hills, Lakes, Heritage, Food & Offbeat Places.",
      },
    ],
  }),
  component: ExploreByExperiencePage,
});

interface PlaceItem {
  id: string;
  slug: string;
  name: string;
  display_name?: string;
  district: string;
  state?: string;
  category: string;
  subcategory?: string;
  categories?: string[];
  tagline?: string;
  description?: string;
  latitude: number;
  longitude: number;
  image?: string;
  imageUrl?: string;
  rating?: number;
  verified?: boolean;
  is_trekking?: boolean;
  difficulty?: string;
  tags?: string[];
}

interface CategoryTile {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  bgGradient: string;
  badgeColor: string;
}

const CATEGORY_TILES: CategoryTile[] = [
  {
    id: "arupadai",
    title: "Arupadai Veedu (Six Abodes)",
    subtitle: "Six sacred Murugan shrines across Tamil Nadu",
    icon: Flame,
    color: "text-amber-400",
    bgGradient: "from-amber-500/15 via-amber-500/5 to-transparent border-amber-500/40",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  },
  {
    id: "waterfall",
    title: "Waterfalls & Falls",
    subtitle: "Cascades, pools & herbal falls",
    icon: CloudRain,
    color: "text-cyan-400",
    bgGradient: "from-cyan-500/10 via-cyan-500/5 to-transparent border-cyan-500/30",
    badgeColor: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  },
  {
    id: "trekking",
    title: "Trekking & Hiking",
    subtitle: "Craggy peaks, trails & hill forts",
    icon: Mountain,
    color: "text-amber-400",
    bgGradient: "from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/30",
    badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  {
    id: "beaches",
    title: "Beaches & Coastline",
    subtitle: "Bay of Bengal & surfing points",
    icon: Waves,
    color: "text-blue-400",
    bgGradient: "from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/30",
    badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  {
    id: "hills",
    title: "Hills & Mountains",
    subtitle: "Nilgiris, Western Ghats & view passes",
    icon: Mountain,
    color: "text-emerald-400",
    bgGradient: "from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/30",
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  {
    id: "lake",
    title: "Lakes & Dams",
    subtitle: "Reservoirs, lagoons & backwaters",
    icon: Waves,
    color: "text-sky-400",
    bgGradient: "from-sky-500/10 via-sky-500/5 to-transparent border-sky-500/30",
    badgeColor: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  },
  {
    id: "nature",
    title: "Nature & Forests",
    subtitle: "Mangroves, reserves & wildlife",
    icon: Trees,
    color: "text-green-400",
    bgGradient: "from-green-500/10 via-green-500/5 to-transparent border-green-500/30",
    badgeColor: "bg-green-500/15 text-green-400 border-green-500/30",
  },
  {
    id: "temple",
    title: "Temples & Shrines",
    subtitle: "Pancha Bhoota & Chola architectural marvels",
    icon: Landmark,
    color: "text-orange-400",
    bgGradient: "from-orange-500/10 via-orange-500/5 to-transparent border-orange-500/30",
    badgeColor: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  },
  {
    id: "heritage",
    title: "Heritage & Historical",
    subtitle: "UNESCO stone monuments, forts & aqueducts",
    icon: Landmark,
    color: "text-purple-400",
    bgGradient: "from-purple-500/10 via-purple-500/5 to-transparent border-purple-500/30",
    badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  },
  {
    id: "adventure",
    title: "Adventure Activities",
    subtitle: "Coracle rides, dune surfing & cable cars",
    icon: Footprints,
    color: "text-rose-400",
    bgGradient: "from-rose-500/10 via-rose-500/5 to-transparent border-rose-500/30",
    badgeColor: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  },
  {
    id: "food",
    title: "Food & Local Experiences",
    subtitle: "Madurai street food, Jigarthanda & Halwa",
    icon: Utensils,
    color: "text-amber-300",
    bgGradient: "from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/30",
    badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  {
    id: "rural",
    title: "Villages & Rural",
    subtitle: "Agrarian countryside, paddy fields & ponds",
    icon: Trees,
    color: "text-lime-400",
    bgGradient: "from-lime-500/10 via-lime-500/5 to-transparent border-lime-500/30",
    badgeColor: "bg-lime-500/15 text-lime-400 border-lime-500/30",
  },
  {
    id: "viewpoint",
    title: "Viewpoints & Sunsets",
    subtitle: "High elevation ridge points & confluences",
    icon: Sun,
    color: "text-yellow-400",
    bgGradient: "from-yellow-500/10 via-yellow-500/5 to-transparent border-yellow-500/30",
    badgeColor: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  },
  {
    id: "hidden",
    title: "Hidden & Offbeat",
    subtitle: "Lesser-known cascades & quiet spots",
    icon: Sparkles,
    color: "text-teal-400",
    bgGradient: "from-teal-500/10 via-teal-500/5 to-transparent border-teal-500/30",
    badgeColor: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  },
];

const TN_DISTRICTS = [
  "All Districts",
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri",
  "Dindigul", "Erode", "Kallakurichi", "Kancheepuram", "Kanyakumari", "Karur",
  "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris",
  "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga",
  "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
  "Tirupattur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore",
  "Villupuram", "Virudhunagar"
];

function ExploreByExperiencePage() {
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("arupadai");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");

  // Read URL query params on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get("category");
      const isTrek = params.get("trekking");
      const tag = params.get("tag");

      const validCategoryIds = CATEGORY_TILES.map((t) => t.id);

      if (isTrek === "true") {
        setSelectedCategory("trekking");
      } else if (cat) {
        const normalized = cat.toLowerCase();
        if (normalized === "arupadai" || normalized === "murugan" || normalized === "arupadaiveedu") setSelectedCategory("arupadai");
        else if (normalized === "mountain" || normalized === "hills" || normalized === "hill-escapes") setSelectedCategory("hills");
        else if (normalized === "coastal" || normalized === "beaches") setSelectedCategory("beaches");
        else if (normalized === "heritage-temples" || normalized === "temples" || normalized === "temple") setSelectedCategory("temple");
        else if (normalized === "waterfalls" || normalized === "falls" || normalized === "waterfall") setSelectedCategory("waterfall");
        else if (normalized === "culinary" || normalized === "food") setSelectedCategory("food");
        else if (normalized === "wildlife" || normalized === "nature" || normalized === "forest") setSelectedCategory("nature");
        else if (validCategoryIds.includes(normalized)) setSelectedCategory(normalized);
        else setSelectedCategory("all");
      } else if (tag && validCategoryIds.includes(tag.toLowerCase())) {
        setSelectedCategory(tag.toLowerCase());
      }
    }
  }, []);

  useEffect(() => {
    async function loadPlaces() {
      try {
        setLoading(true);
        const data = await PlaceApiRepository.fetchPlaces();
        if (data && data.length > 0) {
          setPlaces(data.map((p: any) => ({
            id: p.id || p.slug,
            slug: p.slug,
            name: p.name || p.canonicalName,
            display_name: p.canonicalName || p.name,
            district: p.district,
            state: p.state || "Tamil Nadu",
            category: p.category ? p.category.toLowerCase() : "heritage",
            subcategory: p.subcategories?.[0] || p.category,
            categories: p.tags || [p.category],
            tagline: p.tagline || "",
            description: p.description || "",
            latitude: p.latitude,
            longitude: p.longitude,
            rating: p.rating || 4.8,
            reviewsCount: p.review_count || 120,
            image: p.image_url || p.image || "https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80",
            verified: p.is_verified ?? true,
          })));
          setLoading(false);
          return;
        }
      } catch {
        // Fallback
      }

      // Fallback to client-side CANONICAL_PLACES registry
      const fallbackPlaces: PlaceItem[] = CANONICAL_PLACES.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name || p.canonicalName,
        display_name: p.canonicalName,
        district: p.district,
        state: p.state,
        category: p.primaryCategory,
        subcategory: p.categories[1] || p.primaryCategory,
        categories: p.categories,
        tagline: p.tagline,
        description: p.description,
        latitude: p.latitude,
        longitude: p.longitude,
        image: p.image,
        rating: p.rating || 4.8,
        verified: p.verified,
        is_trekking: p.categories.includes("trekking"),
        tags: p.tags,
      }));

      setPlaces(fallbackPlaces);
      setLoading(false);
    }
    loadPlaces();
  }, []);

  // Helper: compute category count
  const getCategoryCount = (tileId: string) => {
    if (tileId === "arupadai") return 6;

    return places.filter((p) => {
      if (!p) return false;
      const cats = p.categories || [];
      const primaryCat = (p.category || "").toLowerCase();
      const subCat = (p.subcategory || "").toLowerCase();
      const nameLower = (p.name || "").toLowerCase();
      const tagsStr = (p.tags || []).join(" ").toLowerCase();

      if (tileId === "waterfall") {
        return cats.includes("waterfall") || cats.includes("waterfalls") || primaryCat === "waterfall" || primaryCat === "waterfalls" || subCat === "waterfall" || nameLower.includes("fall") || nameLower.includes("aruvi");
      }
      if (tileId === "trekking") {
        return cats.includes("trekking") || p.is_trekking || primaryCat === "trekking" || subCat === "trekking" || (nameLower.includes("trek") && !cats.includes("hills"));
      }
      if (tileId === "beaches") {
        return cats.includes("beaches") || cats.includes("coastal") || primaryCat === "beaches" || primaryCat === "coastal" || subCat === "beach" || nameLower.includes("beach");
      }
      if (tileId === "hills") {
        return cats.includes("hills") || cats.includes("mountains") || primaryCat === "hills" || primaryCat === "mountains" || (subCat === "viewpoint" && !cats.includes("heritage"));
      }
      if (tileId === "lake") {
        return cats.includes("lake") || cats.includes("dams") || primaryCat === "lake" || primaryCat === "dams" || subCat === "lake" || nameLower.includes("lake") || nameLower.includes("dam");
      }
      if (tileId === "nature") {
        return cats.includes("nature") || cats.includes("wildlife") || primaryCat === "nature" || primaryCat === "wildlife";
      }
      if (tileId === "temple") {
        return (cats.includes("temples") || primaryCat === "temples") && !cats.includes("heritage");
      }
      if (tileId === "heritage") {
        return cats.includes("heritage") || primaryCat === "heritage" || subCat === "fort" || subCat === "palace" || nameLower.includes("fort");
      }
      if (tileId === "adventure") {
        return cats.includes("adventure") || primaryCat === "adventure" || (tagsStr.includes("adventure") && !cats.includes("heritage"));
      }
      if (tileId === "food") {
        return cats.includes("food") || primaryCat === "food" || tagsStr.includes("food");
      }
      if (tileId === "rural") {
        return cats.includes("rural") || subCat === "rural_tourism";
      }
      if (tileId === "viewpoint") {
        return cats.includes("viewpoint") && !cats.includes("hills");
      }
      if (tileId === "hidden") {
        return cats.includes("offroad") || (p.rating && p.rating < 4.8) || p.verified === false;
      }
      return cats.includes(tileId) || primaryCat === tileId;
    }).length;
  };

  // Filter places based on selected category
  const categoryFilteredPlaces = useMemo(() => {
    if (selectedCategory === "arupadai") {
      return DEFAULT_ARUPADAI_VEEDU_TEMPLES.map((t) => ({
        id: t.slug,
        slug: t.slug,
        name: t.name,
        district: t.district,
        category: "arupadai",
        tagline: t.tagline,
        description: t.story,
        latitude: t.latitude,
        longitude: t.longitude,
        image: t.image,
        rating: t.rating,
        verified: true,
      }));
    }

    return places.filter((p) => {
      if (!p) return false;
      const cats = p.categories || [];
      const primaryCat = (p.category || "").toLowerCase();
      const subCat = (p.subcategory || "").toLowerCase();
      const tagsStr = (p.tags || []).join(" ").toLowerCase();
      const nameLower = (p.name || "").toLowerCase();

      let matchCategory = false;

      if (selectedCategory === "waterfall") {
        matchCategory = cats.includes("waterfall") || cats.includes("waterfalls") || primaryCat === "waterfall" || primaryCat === "waterfalls" || subCat === "waterfall" || nameLower.includes("fall") || nameLower.includes("aruvi");
      } else if (selectedCategory === "trekking") {
        matchCategory = cats.includes("trekking") || p.is_trekking || primaryCat === "trekking" || subCat === "trekking" || (nameLower.includes("trek") && !cats.includes("hills"));
      } else if (selectedCategory === "beaches") {
        matchCategory = cats.includes("beaches") || cats.includes("coastal") || primaryCat === "beaches" || primaryCat === "coastal" || subCat === "beach" || nameLower.includes("beach");
      } else if (selectedCategory === "hills") {
        matchCategory = cats.includes("hills") || cats.includes("mountains") || primaryCat === "hills" || primaryCat === "mountains" || (subCat === "viewpoint" && !cats.includes("heritage"));
      } else if (selectedCategory === "lake") {
        matchCategory = cats.includes("lake") || cats.includes("dams") || primaryCat === "lake" || primaryCat === "dams" || subCat === "lake" || nameLower.includes("lake") || nameLower.includes("dam");
      } else if (selectedCategory === "nature") {
        matchCategory = cats.includes("nature") || cats.includes("wildlife") || primaryCat === "nature" || primaryCat === "wildlife";
      } else if (selectedCategory === "temple") {
        matchCategory = (cats.includes("temples") || primaryCat === "temples") && !cats.includes("heritage");
      } else if (selectedCategory === "heritage") {
        matchCategory = cats.includes("heritage") || primaryCat === "heritage" || subCat === "fort" || subCat === "palace" || nameLower.includes("fort");
      } else if (selectedCategory === "adventure") {
        matchCategory = cats.includes("adventure") || primaryCat === "adventure" || (tagsStr.includes("adventure") && !cats.includes("heritage"));
      } else if (selectedCategory === "food") {
        matchCategory = cats.includes("food") || primaryCat === "food" || tagsStr.includes("food");
      } else if (selectedCategory === "rural") {
        matchCategory = cats.includes("rural") || subCat === "rural_tourism";
      } else if (selectedCategory === "viewpoint") {
        matchCategory = cats.includes("viewpoint") && !cats.includes("hills");
      } else if (selectedCategory === "hidden") {
        matchCategory = cats.includes("offroad") || (p.rating && p.rating < 4.8) || p.verified === false;
      } else {
        matchCategory = true;
      }

      // District Filter
      if (selectedDistrict !== "All Districts") {
        if ((p.district || "").toLowerCase() !== selectedDistrict.toLowerCase()) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (p.name || "").toLowerCase().includes(q);
        const matchDist = (p.district || "").toLowerCase().includes(q);
        const matchCat = (p.category || "").toLowerCase().includes(q);
        const matchTag = (p.tagline || "").toLowerCase().includes(q);
        if (!matchName && !matchDist && !matchCat && !matchTag) return false;
      }

      return matchCategory;
    });
  }, [places, selectedCategory, selectedDistrict, searchQuery]);

  const selectedCategoryTile = CATEGORY_TILES.find((t) => t.id === selectedCategory) || CATEGORY_TILES[0];

  return (
    <AppShell>
      <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 pb-24">
        {/* Top Hero Banner */}
        <div className="relative border-b border-zinc-800/80 bg-gradient-to-b from-amber-500/10 via-zinc-950 to-zinc-950 pt-28 pb-10 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-300 font-mono text-xs font-bold border border-amber-500/20">
              <Compass className="size-4 text-amber-400" /> EXPLORE TAMIL NADU BY EXPERIENCE
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-display">
              Discover Tamil Nadu Your Way
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto">
              Explore canonical destinations grouped by experience: Arupadai Veedu, waterfalls, hill treks, coastal beaches, heritage aqueducts & rural villages.
            </p>
          </div>
        </div>

        {/* SPLIT LAYOUT: LEFT SIDE NAVBAR & RIGHT WORKSPACE */}
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 md:px-8 pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* LEFT SIDE NAVBAR (Experience Categories Stepper / Sidebar) */}
            <aside className="lg:col-span-4 xl:col-span-3 sticky top-24 space-y-4">
              <div className="transform-gpu rounded-3xl bg-zinc-900/95 border border-zinc-800 p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                      EXPERIENCE CATEGORIES
                    </span>
                    <h2 className="text-sm font-bold text-white">Left Side Navbar</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedCategory && selectedCategory !== "all" && (
                      <button
                        onClick={() => setSelectedCategory("all")}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-mono font-bold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20"
                      >
                        Clear filter ✕
                      </button>
                    )}
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                      {places.length + 6} Places Live
                    </span>
                  </div>
                </div>

                {/* Category List Items */}
                <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
                  {CATEGORY_TILES.map((tile) => {
                    const isSelected = selectedCategory === tile.id;
                    const count = getCategoryCount(tile.id);
                    const Icon = tile.icon;

                    return (
                      <button
                        key={tile.id}
                        onClick={() => setSelectedCategory(tile.id)}
                        className={cn(
                          "w-full text-left flex items-center justify-between p-3 rounded-2xl transition-all duration-200 border group cursor-pointer",
                          isSelected
                            ? "bg-amber-500/15 border-amber-500/50 text-white shadow-[0_0_20px_rgba(251,191,36,0.15)]"
                            : "bg-zinc-950/40 border-zinc-800/80 text-zinc-300 hover:bg-zinc-800/40 hover:border-zinc-700"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn(
                            "size-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                            isSelected ? "bg-amber-400 text-zinc-950 font-bold shadow-md shadow-amber-500/20" : "bg-zinc-800 " + tile.color
                          )}>
                            <Icon className="size-4" />
                          </div>
                          <div className="min-w-0">
                            <p className={cn("text-xs font-bold truncate", isSelected ? "text-amber-300" : "text-zinc-200 group-hover:text-amber-300")}>
                              {tile.title}
                            </p>
                            <p className="text-[10px] text-zinc-400 truncate">
                              {tile.subtitle}
                            </p>
                          </div>
                        </div>

                        <span className={cn(
                          "text-xs font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ml-2",
                          isSelected
                            ? "bg-amber-400 text-zinc-950"
                            : count > 0
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-zinc-800 text-zinc-500"
                        )}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Spatial Map Exploration Button */}
                <div className="pt-3 border-t border-zinc-800">
                  <Link
                    to="/trails/arupadai-veedu"
                    className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-extrabold text-xs shadow-lg shadow-amber-500/10 hover:brightness-110 transition flex items-center justify-center gap-2"
                  >
                    <Flame className="size-4" />
                    <span>Open Arupadai Veedu Circuit</span>
                  </Link>
                </div>
              </div>
            </aside>

            {/* RIGHT WORKSPACE (Filtered Results & Search Toolbar) */}
            <section className="lg:col-span-8 xl:col-span-9 space-y-6">
              {/* Category Header & Filters Toolbar */}
              <div className="transform-gpu rounded-3xl bg-zinc-900/95 border border-zinc-800 p-6 shadow-2xl space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs font-bold px-3 py-1 rounded-full border", selectedCategoryTile.badgeColor)}>
                        {selectedCategoryTile.title}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">
                        {categoryFilteredPlaces.length} matching places
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight font-display mt-2">
                      {selectedCategoryTile.title}
                    </h2>
                  </div>

                  {/* Filter Toolbar */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    {/* Search Box */}
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search in this category..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    {/* District Dropdown */}
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full sm:w-auto px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-xs font-bold text-zinc-200 focus:outline-none"
                    >
                      {TN_DISTRICTS.map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Special Banner for Arupadai Veedu */}
                {selectedCategory === "arupadai" && (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-extrabold text-amber-300 flex items-center gap-2">
                        <Flame className="size-4" />
                        <span>Six Sacred Abodes of Lord Murugan (ஆறுபடை வீடுகள்)</span>
                      </h4>
                      <p className="text-xs text-zinc-300">
                        Complete 1,200 km sacred pilgrimage circuit across Thiruttani, Swamimalai, Palani, Pazhamudircholai, Thirupparankundram & Tiruchendur.
                      </p>
                    </div>
                    <Link
                      to="/trails/arupadai-veedu"
                      className="px-4 py-2 rounded-xl bg-amber-400 text-zinc-950 font-extrabold text-xs shrink-0 hover:bg-amber-300 shadow-md shadow-amber-500/20"
                    >
                      View 1,200km OSRM Road Map →
                    </Link>
                  </div>
                )}

                {/* Cards Grid */}
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <div key={n} className="h-64 rounded-2xl bg-zinc-950 border border-zinc-800 animate-pulse" />
                    ))}
                  </div>
                ) : categoryFilteredPlaces.length === 0 ? (
                  <div className="text-center py-12 bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6 max-w-md mx-auto space-y-3">
                    <div className="inline-flex p-3 rounded-full bg-amber-500/10 text-amber-400">
                      <SlidersHorizontal className="size-6" />
                    </div>
                    <h3 className="text-base font-bold text-white">No destinations found</h3>
                    <p className="text-xs text-zinc-400">
                      No places match your criteria in {selectedCategoryTile.title}. Try resetting your district filter or search query.
                    </p>
                    <Button size="sm" onClick={() => { setSearchQuery(""); setSelectedDistrict("All Districts"); }} className="bg-amber-400 text-zinc-950 font-bold text-xs">
                      Reset Filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {categoryFilteredPlaces.map((p, idx) => {
                      const img = p.imageUrl || p.image || "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80";

                      return (
                        <motion.div
                          key={p.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="group transform-gpu rounded-2xl border border-zinc-800 bg-zinc-950/90 overflow-hidden shadow-md hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between"
                        >
                          <div>
                            {/* Image Preview */}
                            <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
                              <img
                                src={img}
                                alt={p.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                              
                              {/* Order Badge if Arupadai */}
                              {selectedCategory === "arupadai" && (
                                <div className="absolute top-3 left-3 bg-amber-400 text-zinc-950 font-black text-xs px-2.5 py-1 rounded-full shadow-md">
                                  Abode #{idx + 1}
                                </div>
                              )}

                              <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-zinc-950/80 backdrop-blur-md px-2.5 py-0.5 rounded-full text-xs font-bold text-amber-400 border border-zinc-800">
                                <Star className="size-3 fill-amber-400 text-amber-400" />
                                <span>{p.rating || 4.8}</span>
                              </div>
                            </div>

                            {/* Body Content */}
                            <div className="p-4 space-y-1.5">
                              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-semibold">
                                <MapPin className="size-3 text-amber-400 shrink-0" />
                                <span>{p.district} District</span>
                              </div>
                              <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                                {p.name}
                              </h3>
                              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                                {p.tagline || p.description}
                              </p>
                            </div>
                          </div>

                          {/* Footer Actions */}
                          <div className="p-4 pt-0 flex items-center gap-2 border-t border-zinc-800/60 mt-2 pt-2">
                            <Link
                              to={`/place/$slug`}
                              params={{ slug: p.slug || p.id }}
                              className="flex-1 text-center py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-200 transition border border-zinc-800"
                            >
                              Explore Details
                            </Link>
                            <Link
                              to="/trails/arupadai-veedu"
                              className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition border border-amber-500/30 flex items-center gap-1 text-xs font-bold"
                              title="View Trail Map"
                            >
                              <Map className="size-3.5" />
                              <span>Trail</span>
                            </Link>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

          </div>
        </div>
      </div>
    </AppShell>
  );
}
