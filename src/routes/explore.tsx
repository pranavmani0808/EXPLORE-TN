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
  ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import { getApiBaseUrl } from "@/lib/api-client/config";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore All Places — ExplorerTN" },
      {
        name: "description",
        content:
          "Discover places, adventures & hidden experiences across all 38 districts of Tamil Nadu.",
      },
    ],
  }),
  component: ExploreAllPlacesPage,
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

const CATEGORY_PILLS = [
  { id: "all", label: "All", icon: Compass },
  { id: "places", label: "Places", icon: MapPin },
  { id: "adventure", label: "Adventures", icon: Footprints },
  { id: "trekking", label: "Trekking", icon: Mountain },
  { id: "waterfall", label: "Waterfalls", icon: CloudRain },
  { id: "hills", label: "Hills", icon: Mountain },
  { id: "beaches", label: "Beaches", icon: Waves },
  { id: "lake", label: "Lakes", icon: Waves },
  { id: "temple", label: "Temples", icon: Landmark },
  { id: "heritage", label: "Heritage", icon: Landmark },
  { id: "food", label: "Food", icon: Utensils },
  { id: "hidden", label: "Hidden", icon: Sparkles },
  { id: "rural", label: "Rural", icon: Trees },
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

function ExploreAllPlacesPage() {
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");

  // Read URL query params on mount if navigated via dropdown
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get("category");
      const isTrek = params.get("trekking");
      const tag = params.get("tag");

      if (isTrek === "true") {
        setActiveCategory("trekking");
      } else if (cat) {
        if (cat === "mountain") setActiveCategory("hills");
        else if (cat === "coastal") setActiveCategory("beaches");
        else setActiveCategory(cat);
      } else if (tag) {
        setActiveCategory(tag);
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
          setPlaces(env.data || []);
        }
      } catch (err) {
        console.error("Failed to load real backend places:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPlaces();
  }, []);

  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      // Category filter logic
      if (activeCategory === "places") {
        // All canonical places
      } else if (activeCategory === "adventure") {
        if (p.category !== "adventure" && !p.tags?.includes("adventure") && !p.is_trekking) return false;
      } else if (activeCategory === "trekking") {
        if (!p.is_trekking && p.subcategory !== "trekking" && p.subcategory !== "short_trek" && !p.tags?.includes("trekking")) return false;
      } else if (activeCategory === "waterfall") {
        if (p.category !== "waterfall" && p.subcategory !== "waterfall" && !p.name.toLowerCase().includes("fall") && !p.name.toLowerCase().includes("aruvi")) return false;
      } else if (activeCategory === "hills") {
        if (p.category !== "mountain" && p.subcategory !== "viewpoint" && !p.name.toLowerCase().includes("hill") && !p.name.toLowerCase().includes("peak")) return false;
      } else if (activeCategory === "beaches") {
        if (p.category !== "coastal" && p.subcategory !== "beach" && !p.name.toLowerCase().includes("beach")) return false;
      } else if (activeCategory === "lake") {
        if (p.category !== "lake" && p.subcategory !== "lake" && !p.name.toLowerCase().includes("lake") && !p.name.toLowerCase().includes("dam") && !p.name.toLowerCase().includes("lagoon")) return false;
      } else if (activeCategory === "temple") {
        if (p.category !== "temple" && p.subcategory !== "temple" && !p.name.toLowerCase().includes("temple") && !p.name.toLowerCase().includes("kovil")) return false;
      } else if (activeCategory === "heritage") {
        if (p.category !== "heritage" && p.subcategory !== "heritage" && p.subcategory !== "fort" && !p.tags?.includes("heritage")) return false;
      } else if (activeCategory === "food") {
        if (p.category !== "food" && p.subcategory !== "food" && !p.tags?.includes("food")) return false;
      } else if (activeCategory === "hidden") {
        if (p.rating && p.rating < 4.8 && !p.tags?.includes("hidden") && !p.tags?.includes("locality_unverified_lake") && !p.tags?.includes("rural_tourism")) return false;
      } else if (activeCategory === "rural") {
        if (p.subcategory !== "rural_tourism" && !p.tags?.includes("rural_tourism") && !p.tags?.includes("countryside")) return false;
      }

      // District filter logic
      if (selectedDistrict !== "All Districts") {
        if (p.district.toLowerCase() !== selectedDistrict.toLowerCase()) return false;
      }

      // Search query logic
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchDist = p.district.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        const matchTag = p.tagline?.toLowerCase().includes(q);
        if (!matchName && !matchDist && !matchCat && !matchTag) return false;
      }

      return true;
    });
  }, [places, activeCategory, selectedDistrict, searchQuery]);

  const getCategoryBadge = (p: PlaceItem) => {
    if (p.is_trekking || p.subcategory === "trekking") return { label: "⛰ Trekking", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" };
    if (p.category === "waterfall" || p.subcategory === "short_trek") return { label: "💧 Waterfall", color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20" };
    if (p.category === "heritage" || p.subcategory === "fort") return { label: "🌉 Heritage", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
    if (p.category === "coastal" || p.subcategory === "beach") return { label: "🏖 Beach", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" };
    if (p.category === "temple") return { label: "🛕 Temple", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20" };
    if (p.category === "mountain") return { label: "⛰ Hill Station", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" };
    if (p.subcategory === "rural_tourism") return { label: "🌾 Rural Experience", color: "bg-lime-500/10 text-lime-600 dark:text-lime-400 border-lime-500/20" };
    return { label: `📍 ${p.category.toUpperCase()}`, color: "bg-primary/10 text-primary border-primary/20" };
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-background font-sans text-foreground pb-20">
        {/* Header Section */}
        <div className="relative border-b border-border bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pt-28 pb-10 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold mb-3 border border-emerald-500/20">
                <Compass className="size-3.5" /> EXPLORE TAMIL NADU
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold font-serif tracking-tight text-foreground">
                Explore Tamil Nadu
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mt-2 max-w-2xl">
                Discover places, adventures & hidden experiences across all 38 districts.
              </p>
            </div>

            {/* Spatial Map Action Banner */}
            <Link
              to="/discover"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xl shadow-emerald-600/20 transition group shrink-0"
            >
              <Map className="size-4" />
              <span>Launch Interactive Spatial Map</span>
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Filter Pills Bar & Search Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORY_PILLS.map((pill) => {
              const Icon = pill.icon;
              const isActive = activeCategory === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => setActiveCategory(pill.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition border ${
                    isActive
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                      : "bg-card text-muted-foreground border-border hover:border-emerald-500/30 hover:text-foreground"
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Bar & District Dropdown */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border p-3 rounded-2xl shadow-sm">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by place name, district, or keyword..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Filter className="size-3.5" />
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-border bg-background text-xs font-bold text-foreground focus:outline-none"
                >
                  {TN_DISTRICTS.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20 whitespace-nowrap">
                {filteredPlaces.length} Places Found
              </div>
            </div>
          </div>
        </div>

        {/* Real-Data Card Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="h-72 rounded-3xl bg-card border border-border animate-pulse" />
              ))}
            </div>
          ) : filteredPlaces.length === 0 ? (
            <div className="text-center py-20 bg-card border border-border rounded-3xl p-8 max-w-xl mx-auto space-y-4">
              <div className="inline-flex p-4 rounded-full bg-amber-500/10 text-amber-500">
                <SlidersHorizontal className="size-8" />
              </div>
              <h3 className="text-xl font-bold font-serif text-foreground">No places match your filter</h3>
              <p className="text-sm text-muted-foreground">
                Try selecting a different category, clearing search terms, or choosing "All Districts".
              </p>
              <Button onClick={() => { setActiveCategory("all"); setSearchQuery(""); setSelectedDistrict("All Districts"); }}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPlaces.map((p) => {
                const badge = getCategoryBadge(p);
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
                      {/* Image Header */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                        <img
                          src={img}
                          alt={p.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                        {/* Top Category Badge */}
                        <div className="absolute top-3 left-3">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-md ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>

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
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="p-5 pt-0 flex items-center gap-2 border-t border-border/50 mt-4 pt-3">
                      <Link
                        to={`/place/$slug`}
                        params={{ slug: p.slug || p.id }}
                        className="flex-1 text-center py-2 px-3 rounded-xl bg-accent/50 hover:bg-accent text-xs font-bold text-foreground transition"
                      >
                        Details
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
