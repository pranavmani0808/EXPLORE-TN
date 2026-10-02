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
  Plus,
  Check,
  Route as RouteIcon,
} from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import { PlaceApiRepository } from "@/lib/api-client/places";
import { CANONICAL_PLACES, ExplorerPlace } from "@/lib/data/canonical-places";
import { DEFAULT_ARUPADAI_VEEDU_TEMPLES, getPlace, type Place } from "@/data/places";
import { cn } from "@/lib/utils";
import { TripRouteBuilderPanel } from "@/components/site/trip-route-builder-panel";
import { PlaceQuickDetailsModal } from "@/components/site/place-quick-details-modal";

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
  // Client-side fallback mapping helper
  const getFallbackPlaces = (): PlaceItem[] =>
    CANONICAL_PLACES.map((p) => ({
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

  const [places, setPlaces] = useState<PlaceItem[]>(getFallbackPlaces);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("arupadai");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");

  // Persistent Route Builder Stops State
  const STORAGE_KEY = "explore_tn_user_trip_route";

  const [routeStops, setRouteStops] = useState<ExplorerPlace[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const [selectedModalPlace, setSelectedModalPlace] = useState<Place | null>(null);

  // Sync routeStops with localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(routeStops));
      } catch {}
    }
  }, [routeStops]);

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
      } else if (cat !== null) {
        const normalized = (cat || "").toLowerCase().trim();
        if (normalized === "" || normalized === "arupadai" || normalized === "murugan" || normalized === "arupadaiveedu") setSelectedCategory("arupadai");
        else if (normalized === "mountain" || normalized === "hills" || normalized === "hill-escapes") setSelectedCategory("hills");
        else if (normalized === "coastal" || normalized === "beaches") setSelectedCategory("beaches");
        else if (normalized === "heritage-temples" || normalized === "temples" || normalized === "temple") setSelectedCategory("temple");
        else if (normalized === "waterfalls" || normalized === "falls" || normalized === "waterfall") setSelectedCategory("waterfall");
        else if (normalized === "culinary" || normalized === "food") setSelectedCategory("food");
        else if (normalized === "wildlife" || normalized === "nature" || normalized === "forest") setSelectedCategory("nature");
        else if (validCategoryIds.includes(normalized)) setSelectedCategory(normalized);
        else setSelectedCategory("arupadai");
      } else if (tag && validCategoryIds.includes(tag.toLowerCase())) {
        setSelectedCategory(tag.toLowerCase());
      }
    }
  }, []);

  useEffect(() => {
    async function loadPlaces() {
      try {
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
        }
      } catch {
        // Retain fallback places
      }
    }
    loadPlaces();
  }, []);

  // Toggle Add / Remove place to route
  const handleTogglePlaceToRoute = (place: any) => {
    const matchedCanonical = CANONICAL_PLACES.find(
      (cp) => cp.id === place.id || cp.slug === place.slug
    ) || {
      id: place.id || place.slug,
      canonicalName: place.name || place.display_name,
      name: place.name || place.display_name,
      slug: place.slug || place.id,
      district: place.district || "Tamil Nadu",
      state: "Tamil Nadu",
      country: "India",
      latitude: place.latitude || 11.1085,
      longitude: place.longitude || 78.3379,
      categories: [place.category || "heritage"],
      primaryCategory: place.category || "heritage",
      tagline: place.tagline || "",
      description: place.description || "",
      image: place.image || place.imageUrl || "",
      rating: place.rating || 4.8,
      verified: true,
      tags: place.tags || [],
    };

    const isAlreadyAdded = routeStops.some((s) => s.id === matchedCanonical.id || s.slug === matchedCanonical.slug);

    if (isAlreadyAdded) {
      setRouteStops((prev) => prev.filter((s) => s.id !== matchedCanonical.id && s.slug !== matchedCanonical.slug));
    } else {
      setRouteStops((prev) => [...prev, matchedCanonical as ExplorerPlace]);
      setIsPanelOpen(true);
    }
  };

  const handleRemoveStop = (placeId: string) => {
    setRouteStops((prev) => prev.filter((s) => s.id !== placeId && s.slug !== placeId));
  };

  const handleReorderStops = (newStops: ExplorerPlace[]) => {
    setRouteStops(newStops);
  };

  const handleClearRoute = () => {
    setRouteStops([]);
  };

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

  const selectedCategoryTile = useMemo(() => {
    return CATEGORY_TILES.find((t) => t.id === selectedCategory) || CATEGORY_TILES[0];
  }, [selectedCategory]);

  return (
    <AppShell className="bg-[#09090b]">
      {/* Page Header */}
      <div className="relative border-b border-zinc-800/80 bg-[#09090b]/80 pt-20 pb-8 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
                <Compass className="size-3.5" /> EXPLORE TAMIL NADU BY EXPERIENCE
              </span>
              <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl tracking-tight">
                Curated Experiences & Destinations
              </h1>
              <p className="mt-1 text-sm text-zinc-400 max-w-2xl">
                Discover canonical places grouped by theme. Click <strong className="text-emerald-400">+ Add to Map</strong> on any place to build your interactive trip route.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/routes"
                className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
              >
                <RouteIcon className="size-3.5" />
                <span>Plan Route</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR: Experience Categories */}
          <aside className="lg:col-span-3 space-y-4">
            <div className="rounded-3xl bg-zinc-900/90 border border-zinc-800 p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between px-1">
                <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                  Experience Categories
                </p>
                <span className="text-[10px] font-mono font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  {places.length + 6} Places
                </span>
              </div>

              {/* Category List Items */}
              <div className="space-y-1.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1 custom-scrollbar">
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
                          "size-8 rounded-xl flex items-center justify-center shrink-0 transition-colors",
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
                        "text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ml-2",
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
            </div>
          </aside>

          {/* MAIN EXPLORE + TRIP ROUTE WORKSPACE */}
          <div className={cn("transition-all duration-500 grid gap-6", isPanelOpen ? "lg:col-span-9 grid-cols-1 xl:grid-cols-12" : "lg:col-span-9 grid-cols-1")}>
            
            {/* Explore Cards Grid Column */}
            <section className={cn("space-y-6 transition-all duration-300", isPanelOpen ? "xl:col-span-7" : "col-span-1")}>
              {/* Category Header & Filters Toolbar */}
              <div className="transform-gpu rounded-3xl bg-zinc-900/95 border border-zinc-800 p-5 sm:p-6 shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
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
                    <div className="relative w-full sm:w-56">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search category..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>

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

                {/* Cards Grid */}
                {categoryFilteredPlaces.length === 0 ? (
                  <div className="text-center py-12 bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6 max-w-md mx-auto space-y-3">
                    <div className="inline-flex p-3 rounded-full bg-amber-500/10 text-amber-400">
                      <SlidersHorizontal className="size-6" />
                    </div>
                    <h3 className="text-base font-bold text-white">No destinations found</h3>
                    <p className="text-xs text-zinc-400">
                      No places match your criteria. Reset filters to explore more places.
                    </p>
                    <Button size="sm" onClick={() => { setSearchQuery(""); setSelectedDistrict("All Districts"); }} className="bg-amber-400 text-zinc-950 font-bold text-xs">
                      Reset Filters
                    </Button>
                  </div>
                ) : (
                  <div className={cn("grid gap-5", isPanelOpen ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3")}>
                    {categoryFilteredPlaces.map((p, idx) => {
                      const img = p.imageUrl || p.image || "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80";
                      const isAdded = routeStops.some((s) => s.id === p.id || s.slug === p.slug);

                      return (
                        <motion.div
                          key={p.id || p.slug}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "group transform-gpu rounded-2xl border bg-zinc-950/90 overflow-hidden shadow-md transition-all duration-300 flex flex-col justify-between",
                            isAdded ? "border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.15)]" : "border-zinc-800 hover:border-amber-500/40"
                          )}
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
                              
                              {/* Sequence Badge if Added */}
                              {isAdded && (
                                <div className="absolute top-3 left-3 bg-emerald-400 text-zinc-950 font-black text-xs px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                                  <Check className="size-3.5 stroke-[3]" />
                                  <span>In Your Trip</span>
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

                          {/* Footer Action Buttons */}
                          <div className="p-4 pt-0 flex items-center gap-2 border-t border-zinc-800/60 mt-2 pt-2">
                            <button
                              onClick={() => handleTogglePlaceToRoute(p)}
                              className={cn(
                                "flex-1 py-2 px-3 rounded-xl font-extrabold text-xs transition border flex items-center justify-center gap-1.5 cursor-pointer",
                                isAdded
                                  ? "bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md shadow-emerald-500/20 hover:bg-emerald-400"
                                  : "bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border-zinc-800 hover:border-emerald-500/30"
                              )}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="size-3.5 stroke-[3]" />
                                  <span>✓ Added</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="size-3.5 stroke-[3]" />
                                  <span>+ Add to Map</span>
                                </>
                              )}
                            </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const legacyPlace = getPlace(p.slug || p.id) || {
                                    slug: p.slug || p.id,
                                    name: p.name || p.display_name || p.id,
                                    district: p.district || "Tamil Nadu",
                                    category: p.category || "hills",
                                    image: img,
                                    tagline: p.tagline || "",
                                    story: p.description || "",
                                    rating: p.rating || 4.8,
                                    reviews: p.reviewsCount || 120,
                                    difficulty: "Easy",
                                    bestSeason: "Year-round",
                                    roadCondition: "State Highway",
                                    parking: "Available",
                                    entryFee: "Free",
                                    timings: "Open daily",
                                    safety: "Safe",
                                    weather: "24°C",
                                    tips: [],
                                    nearbyFood: [],
                                    nearbyFuel: [],
                                    x: 0,
                                    y: 0,
                                    coords: [p.latitude || 10.1, p.longitude || 77.5],
                                    latitude: p.latitude || 10.1,
                                    longitude: p.longitude || 77.5,
                                  };
                                  setSelectedModalPlace(legacyPlace as Place);
                                }}
                                className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-300 transition border border-zinc-800 cursor-pointer"
                              >
                                Details
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>

              {/* Right Workspace: Trip Route Builder Panel */}
              {isPanelOpen && (
                <aside className="xl:col-span-5 sticky top-24 h-[calc(100vh-120px)] transition-all duration-500">
                  <TripRouteBuilderPanel
                    stops={routeStops}
                    onRemoveStop={handleRemoveStop}
                    onReorderStops={handleReorderStops}
                    onClearRoute={handleClearRoute}
                    onClose={() => setIsPanelOpen(false)}
                  />
                </aside>
              )}

            </div>

          </div>
        </div>

        {/* Floating My Route Button (Bottom-Right) when Panel is Closed */}
        {!isPanelOpen && routeStops.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={() => setIsPanelOpen(true)}
            className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 text-zinc-950 font-black text-xs shadow-2xl shadow-emerald-500/30 border border-emerald-300 hover:scale-105 transition flex items-center gap-2.5 cursor-pointer"
          >
            <Map className="size-4" />
            <span>🗺 My Route · {routeStops.length} {routeStops.length === 1 ? "stop" : "stops"}</span>
          </motion.button>
        )}

        {/* Place Quick Details Modal */}
        <PlaceQuickDetailsModal
          place={selectedModalPlace}
          isOpen={!!selectedModalPlace}
          onClose={() => setSelectedModalPlace(null)}
          onToggleTrip={(targetP) => handleTogglePlaceToRoute(targetP)}
          isAddedToTrip={selectedModalPlace ? routeStops.some((s) => s.slug === selectedModalPlace.slug || s.id === selectedModalPlace.slug) : false}
        />
      </AppShell>
    );
  }
