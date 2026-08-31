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
  Camera,
  Layers,
  ChevronRight,
} from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import { getApiBaseUrl } from "@/lib/api-client/config";
import { CANONICAL_PLACES } from "@/lib/data/canonical-places";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore Tamil Nadu by Experience — ExplorerTN" },
      {
        name: "description",
        content:
          "Explore Tamil Nadu by experience: Waterfalls, Trekking, Beaches, Hills, Lakes, Heritage, Food, Hidden Places & Rural Experiences.",
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
  const [selectedCategory, setSelectedCategory] = useState<string>("waterfall");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");

  // Read URL query params on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get("category");
      const isTrek = params.get("trekking");
      const tag = params.get("tag");

      if (isTrek === "true") {
        setSelectedCategory("trekking");
      } else if (cat) {
        if (cat === "mountain") setSelectedCategory("hills");
        else if (cat === "coastal") setSelectedCategory("beaches");
        else setSelectedCategory(cat);
      } else if (tag) {
        setSelectedCategory(tag);
      }
    }
  }, []);

  useEffect(() => {
    async function loadPlaces() {
      try {
        setLoading(true);
        const res = await fetch(`${getApiBaseUrl()}/api/v1/places`);
        if (res.ok) {
          const env = await res.json();
          if (env.data && env.data.length > 0) {
            setPlaces(env.data);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Failed to fetch backend places, utilizing canonical registry fallback:", err);
      }

      // Instant Fallback to client-side CANONICAL_PLACES registry (24+ verified destinations)
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

  // Filter places based on selected category (checking primary AND multi-categories array)
  const categoryFilteredPlaces = useMemo(() => {
    return places.filter((p) => {
      if (!p) return false;
      const cats = p.categories || [];
      const primaryCat = (p.category || "").toLowerCase();
      const subCat = (p.subcategory || "").toLowerCase();
      const tagsStr = str(p.tags || []).toLowerCase();
      const nameLower = (p.name || "").toLowerCase();

      let matchCategory = false;

      if (selectedCategory === "waterfall") {
        matchCategory = cats.includes("waterfall") || primaryCat === "waterfall" || subCat === "waterfall" || nameLower.includes("fall") || nameLower.includes("aruvi");
      } else if (selectedCategory === "trekking") {
        matchCategory = cats.includes("trekking") || p.is_trekking || primaryCat === "mountain" || subCat === "trekking" || nameLower.includes("trek");
      } else if (selectedCategory === "beaches") {
        matchCategory = cats.includes("beaches") || cats.includes("coastal") || primaryCat === "coastal" || subCat === "beach" || nameLower.includes("beach");
      } else if (selectedCategory === "hills") {
        matchCategory = cats.includes("hills") || primaryCat === "mountain" || subCat === "viewpoint" || nameLower.includes("hill") || nameLower.includes("peak");
      } else if (selectedCategory === "lake") {
        matchCategory = cats.includes("lake") || primaryCat === "lake" || subCat === "lake" || nameLower.includes("lake") || nameLower.includes("dam") || nameLower.includes("lagoon");
      } else if (selectedCategory === "nature") {
        matchCategory = cats.includes("nature") || primaryCat === "wildlife" || primaryCat === "forest" || subCat === "mangrove";
      } else if (selectedCategory === "temple") {
        matchCategory = cats.includes("temple") || primaryCat === "temple" || subCat === "temple" || nameLower.includes("temple") || nameLower.includes("kovil");
      } else if (selectedCategory === "heritage") {
        matchCategory = cats.includes("heritage") || primaryCat === "heritage" || subCat === "fort" || subCat === "palace" || nameLower.includes("fort") || nameLower.includes("aqueduct");
      } else if (selectedCategory === "adventure") {
        matchCategory = cats.includes("adventure") || primaryCat === "adventure" || p.is_trekking || tagsStr.includes("adventure");
      } else if (selectedCategory === "food") {
        matchCategory = cats.includes("food") || primaryCat === "food" || tagsStr.includes("food");
      } else if (selectedCategory === "rural") {
        matchCategory = cats.includes("rural") || subCat === "rural_tourism" || tagsStr.includes("rural");
      } else if (selectedCategory === "viewpoint") {
        matchCategory = cats.includes("viewpoint") || subCat === "viewpoint" || tagsStr.includes("viewpoint");
      } else if (selectedCategory === "hidden") {
        matchCategory = cats.includes("hidden") || (p.rating && p.rating < 4.8) || tagsStr.includes("hidden") || p.verified === false;
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
      <div className="min-h-screen bg-background font-sans text-foreground pb-24">
        {/* Hero Section */}
        <div className="relative border-b border-border bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pt-28 pb-10 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20">
              <Compass className="size-4 text-emerald-500" /> EXPLORE TAMIL NADU
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold font-serif tracking-tight text-foreground">
              Discover Tamil Nadu Your Way
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore canonical destinations grouped by experience: waterfalls, hill treks, coastal beaches, heritage aqueducts & rural villages.
            </p>
          </div>
        </div>

        {/* 🧭 Visual Category Grid Tiles */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold font-serif text-foreground">Explore by Experience Category</h2>
              <p className="text-xs text-muted-foreground">Select a category to filter destinations across Tamil Nadu</p>
            </div>
            <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              {places.length} Real Destinations Live
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {CATEGORY_TILES.map((tile) => {
              const Icon = tile.icon;
              const isSelected = selectedCategory === tile.id;
              const count = places.filter((p) => {
                if (!p) return false;
                const cats = p.categories || [];
                const catLower = (p.category || "").toLowerCase();
                const nameLower = (p.name || "").toLowerCase();
                if (tile.id === "waterfall") return cats.includes("waterfall") || catLower === "waterfall" || nameLower.includes("fall");
                if (tile.id === "trekking") return cats.includes("trekking") || p.is_trekking || catLower === "mountain";
                if (tile.id === "beaches") return cats.includes("beaches") || catLower === "coastal";
                if (tile.id === "hills") return cats.includes("hills") || catLower === "mountain";
                if (tile.id === "lake") return cats.includes("lake") || catLower === "lake";
                if (tile.id === "heritage") return cats.includes("heritage") || catLower === "heritage";
                if (tile.id === "temple") return cats.includes("temple") || catLower === "temple";
                if (tile.id === "rural") return cats.includes("rural") || p.subcategory === "rural_tourism";
                if (tile.id === "hidden") return cats.includes("hidden") || p.verified === false;
                return cats.includes(tile.id) || catLower === tile.id;
              }).length;

              return (
                <button
                  key={tile.id}
                  onClick={() => setSelectedCategory(tile.id)}
                  className={`p-4 rounded-3xl border text-left transition-all duration-300 flex flex-col justify-between h-32 group ${
                    isSelected
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20 scale-[1.02]"
                      : `bg-card border-border hover:border-emerald-500/40 hover:bg-emerald-500/5`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`p-2 rounded-2xl ${isSelected ? "bg-white/20 text-white" : "bg-accent/60 " + tile.color}`}>
                      <Icon className="size-5" />
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-accent text-muted-foreground"}`}>
                      {count}
                    </span>
                  </div>

                  <div>
                    <h3 className={`text-xs font-bold line-clamp-1 ${isSelected ? "text-white" : "text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400"}`}>
                      {tile.title}
                    </h3>
                    <p className={`text-[10px] line-clamp-1 mt-0.5 ${isSelected ? "text-white/80" : "text-muted-foreground"}`}>
                      {tile.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Secondary Action: Interactive Map Banner */}
          <div className="mt-8 p-5 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/15 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="p-3 rounded-2xl bg-emerald-600 text-white shadow-md">
                <Map className="size-6" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-foreground">Prefer spatial exploration?</h3>
                <p className="text-xs text-muted-foreground">Launch our 100% full-screen interactive Leaflet map with GIS node hierarchy.</p>
              </div>
            </div>
            <Link
              to="/discover"
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center gap-2 shrink-0"
            >
              <span>🗺️ Explore on Interactive Map</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* Category Experience Results Header & Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${selectedCategoryTile.badgeColor}`}>
                  {selectedCategoryTile.title}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {categoryFilteredPlaces.length} matching places
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-foreground mt-2">
                {selectedCategoryTile.title} in Tamil Nadu
              </h2>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search Box */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in this category..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {/* District Filter Dropdown */}
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 rounded-xl border border-border bg-card text-xs font-bold text-foreground focus:outline-none"
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
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="h-72 rounded-3xl bg-card border border-border animate-pulse" />
              ))}
            </div>
          ) : categoryFilteredPlaces.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-3xl p-8 max-w-md mx-auto space-y-4">
              <div className="inline-flex p-4 rounded-full bg-amber-500/10 text-amber-500">
                <SlidersHorizontal className="size-8" />
              </div>
              <h3 className="text-lg font-bold font-serif text-foreground">No destinations found</h3>
              <p className="text-xs text-muted-foreground">
                No places match your search criteria in {selectedCategoryTile.title}. Try clearing district filters or search keywords.
              </p>
              <Button size="sm" onClick={() => { setSearchQuery(""); setSelectedDistrict("All Districts"); }}>
                Reset Search Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoryFilteredPlaces.map((p) => {
                const img = p.imageUrl || p.image || "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80";

                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="group rounded-3xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Preview */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                        <img
                          src={img}
                          alt={p.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                        {/* Rating Overlay */}
                        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-amber-400 border border-white/10">
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                          <span>{p.rating || 4.8}</span>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-5 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                          <MapPin className="size-3.5 text-emerald-500 shrink-0" />
                          <span>{p.district} District</span>
                          {p.state && p.state !== "Tamil Nadu" && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold">
                              {p.state}
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-bold font-serif text-foreground line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {p.name}
                        </h3>

                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {p.tagline || p.description}
                        </p>

                        {/* Multi-category tags badge row */}
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {p.categories?.slice(0, 3).map((catTag) => (
                            <span
                              key={catTag}
                              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-accent/60 text-muted-foreground border border-border/50 uppercase"
                            >
                              {catTag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-5 pt-0 flex items-center gap-2 border-t border-border/50 mt-3 pt-3">
                      <Link
                        to={`/place/$slug`}
                        params={{ slug: p.slug || p.id }}
                        className="flex-1 text-center py-2 px-3 rounded-xl bg-accent/50 hover:bg-accent text-xs font-bold text-foreground transition"
                      >
                        Explore Details
                      </Link>
                      <Link
                        to="/discover"
                        className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition border border-emerald-500/30 flex items-center gap-1 text-xs font-bold"
                        title="View on Interactive Map"
                      >
                        <Map className="size-4" />
                        <span className="hidden sm:inline">Map</span>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function str(val: any): string {
  if (Array.isArray(val)) return val.join(" ");
  return String(val || "");
}
