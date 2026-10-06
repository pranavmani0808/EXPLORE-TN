import { useState, useEffect, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Bookmark,
  Trash2,
  Compass,
  MapPin,
  Route as RouteIcon,
  Navigation,
  Sparkles,
  ExternalLink,
  Search,
  Filter,
  ArrowRight,
  Share2,
  Check,
  Calendar,
  Mountain,
  Landmark,
  Waves,
  Trees,
  Utensils,
  Layers,
} from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import {
  getSavedPlaces,
  removeSavedPlace,
  getSavedRoutes,
  removeSavedRoute,
  SavedPlaceItem,
  SavedRouteItem,
} from "@/lib/explorer-gamification";
import { toast } from "sonner";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved Places & Collections — ExplorerTN" },
      {
        name: "description",
        content:
          "Manage and view all your saved destinations, hill stations, temples, waterfalls, and custom expedition routes across Tamil Nadu.",
      },
      { property: "og:title", content: "Saved Places & Collections — ExplorerTN" },
      {
        property: "og:description",
        content: "View your bookmarked places and saved travel itineraries across Tamil Nadu.",
      },
    ],
  }),
  component: SavedPlacesPage,
});

const CATEGORY_TABS = [
  { id: "all", label: "All Places", icon: Layers },
  { id: "hills", label: "Hills & Mountains", icon: Mountain },
  { id: "temples", label: "Temples & Spiritual", icon: Landmark },
  { id: "waterfalls", label: "Waterfalls", icon: Waves },
  { id: "beaches", label: "Beaches & Coastal", icon: Trees },
  { id: "food", label: "Food Trails", icon: Utensils },
];

function SavedPlacesPage() {
  const [savedPlaces, setSavedPlaces] = useState<SavedPlaceItem[]>([]);
  const [savedRoutes, setSavedRoutes] = useState<SavedRouteItem[]>([]);
  const [activeTab, setActiveTab] = useState<"places" | "routes">("places");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = () => {
    setSavedPlaces(getSavedPlaces());
    setSavedRoutes(getSavedRoutes());
  };

  useEffect(() => {
    loadData();

    const handlePlacesUpdate = () => {
      setSavedPlaces(getSavedPlaces());
    };
    const handleRoutesUpdate = () => {
      setSavedRoutes(getSavedRoutes());
    };

    window.addEventListener("etn_saved_places_updated", handlePlacesUpdate);
    window.addEventListener("etn_saved_routes_updated", handleRoutesUpdate);

    return () => {
      window.removeEventListener("etn_saved_places_updated", handlePlacesUpdate);
      window.removeEventListener("etn_saved_routes_updated", handleRoutesUpdate);
    };
  }, []);

  const handleRemovePlace = (place: SavedPlaceItem) => {
    removeSavedPlace(place.id);
    toast.success(`Removed "${place.name}" from saved places`);
  };

  const handleRemoveRoute = (route: SavedRouteItem) => {
    removeSavedRoute(route.id);
    toast.success(`Removed "${route.title}" from saved trips`);
  };

  const handleSharePlace = async (place: SavedPlaceItem) => {
    const slug = place.id.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const shareUrl = `${window.location.origin}/place/${slug}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(place.id);
      toast.success("Place link copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  // Distinct districts from saved places for filter dropdown
  const availableDistricts = useMemo(() => {
    const set = new Set<string>();
    savedPlaces.forEach((p) => {
      if (p.district) set.add(p.district.trim());
    });
    return Array.from(set).sort();
  }, [savedPlaces]);

  // Filtered places
  const filteredPlaces = useMemo(() => {
    return savedPlaces.filter((place) => {
      const matchesSearch =
        searchQuery === "" ||
        place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDistrict =
        selectedDistrict === "all" ||
        place.district.toLowerCase() === selectedDistrict.toLowerCase();

      let matchesCategory = true;
      if (selectedCategory !== "all") {
        const cat = place.category.toLowerCase();
        if (selectedCategory === "hills") {
          matchesCategory = cat.includes("hill") || cat.includes("mountain");
        } else if (selectedCategory === "temples") {
          matchesCategory = cat.includes("temple") || cat.includes("spiritual");
        } else if (selectedCategory === "waterfalls") {
          matchesCategory = cat.includes("waterfall") || cat.includes("fall");
        } else if (selectedCategory === "beaches") {
          matchesCategory = cat.includes("beach") || cat.includes("coast");
        } else if (selectedCategory === "food") {
          matchesCategory = cat.includes("food") || cat.includes("cuisine");
        } else {
          matchesCategory = cat.includes(selectedCategory);
        }
      }

      return matchesSearch && matchesDistrict && matchesCategory;
    });
  }, [savedPlaces, searchQuery, selectedDistrict, selectedCategory]);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 pb-28 pt-28 sm:px-6 sm:pt-36 font-sans">
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-[32px] border border-slate-200 dark:border-white/10 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-zinc-950 p-6 sm:p-10 text-white shadow-2xl backdrop-blur-xl mb-8">
          <div className="absolute -right-16 -top-16 size-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3.5 py-1 text-xs font-mono font-bold text-emerald-400 mb-3">
                <Bookmark className="size-3.5 fill-emerald-400 text-emerald-400" />
                <span>SAVED COLLECTIONS</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Your Saved Places & Trails
              </h1>
              <p className="mt-2 max-w-xl text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Access your bookmarked Tamil Nadu destinations, hill viewpoints, temples, and custom road trip itineraries in one unified place.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/explore">
                <Button
                  size="sm"
                  className="rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <Compass className="size-4 mr-1.5" />
                  Explore More Places
                </Button>
              </Link>
              <Link to="/routes">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-2xl border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-xs px-4 py-2.5 backdrop-blur-md cursor-pointer"
                >
                  <RouteIcon className="size-4 mr-1.5 text-emerald-400" />
                  Plan Route
                </Button>
              </Link>
            </div>
          </div>

          {/* Sub-Tabs: Saved Places vs Custom Routes */}
          <div className="relative z-10 flex items-center gap-2 mt-8 border-b border-white/10 pb-4">
            <button
              type="button"
              onClick={() => setActiveTab("places")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "places"
                  ? "bg-emerald-500 text-slate-950 shadow-md font-black"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Bookmark className="size-4" />
              <span>Saved Places</span>
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === "places"
                    ? "bg-slate-950/20 text-slate-950"
                    : "bg-white/10 text-slate-300"
                }`}
              >
                {savedPlaces.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("routes")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "routes"
                  ? "bg-emerald-500 text-slate-950 shadow-md font-black"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <RouteIcon className="size-4" />
              <span>Saved Routes & Trips</span>
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === "routes"
                    ? "bg-slate-950/20 text-slate-950"
                    : "bg-white/10 text-slate-300"
                }`}
              >
                {savedRoutes.length}
              </span>
            </button>
          </div>
        </div>

        {/* TAB 1: SAVED PLACES */}
        {activeTab === "places" && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#121821] p-4 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 size-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search saved destinations by name, district, or category..."
                  className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-900/80 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {availableDistricts.length > 0 && (
                <div className="flex items-center gap-2 shrink-0">
                  <Filter className="size-3.5 text-slate-400" />
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-900/80 px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="all">All Districts ({availableDistricts.length})</option>
                    {availableDistricts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Category Quick Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORY_TABS.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-emerald-600 dark:bg-emerald-500 text-white dark:text-black font-extrabold shadow-sm"
                        : "bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-emerald-500/40"
                    }`}
                  >
                    <Icon className="size-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Results Grid / Empty State */}
            {filteredPlaces.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121821] p-12 text-center shadow-sm space-y-4">
                <div className="inline-flex size-16 place-items-center rounded-3xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <Bookmark className="size-8" />
                </div>
                <div className="max-w-md mx-auto">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {savedPlaces.length === 0
                      ? "No saved places yet"
                      : "No destinations match your filter"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {savedPlaces.length === 0
                      ? "Bookmark your favorite hill stations, waterfalls, and temples across Tamil Nadu while exploring to curate your personal bucket list."
                      : "Try adjusting your search terms or clearing the district filter."}
                  </p>
                </div>
                {savedPlaces.length === 0 ? (
                  <Link to="/explore">
                    <Button className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white dark:text-black font-black text-xs px-5 py-2.5 shadow-md">
                      <Compass className="size-4 mr-2" />
                      Explore Tamil Nadu Places
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setSelectedDistrict("all");
                    }}
                    className="rounded-2xl text-xs font-bold"
                  >
                    Reset Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPlaces.map((place) => {
                  const slug = place.id.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                  return (
                    <motion.div
                      key={place.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121821] shadow-sm hover:shadow-xl transition-all duration-300 hover:border-emerald-500/40"
                    >
                      {/* Image Thumbnail Header */}
                      <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
                        <img
                          src={
                            place.imageUrl ||
                            "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80"
                          }
                          alt={place.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Category & District Tags */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                          <span className="rounded-full bg-emerald-500/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-mono font-black text-slate-950 uppercase shadow">
                            {place.category || "Place"}
                          </span>
                          <span className="rounded-full bg-black/60 backdrop-blur-md border border-white/20 px-2.5 py-1 text-[10px] font-mono font-bold text-white shadow">
                            {place.district}
                          </span>
                        </div>

                        {/* Top Action Icons: Remove & Share */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSharePlace(place)}
                            className="p-2 rounded-xl bg-black/60 backdrop-blur-md text-white hover:text-emerald-400 hover:bg-black/80 transition cursor-pointer"
                            title="Share place link"
                          >
                            {copiedId === place.id ? (
                              <Check className="size-3.5 text-emerald-400" />
                            ) : (
                              <Share2 className="size-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemovePlace(place)}
                            className="p-2 rounded-xl bg-black/60 backdrop-blur-md text-slate-300 hover:text-rose-400 hover:bg-black/80 transition cursor-pointer"
                            title="Remove from saved"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>

                        {/* Bottom Name inside image */}
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="text-base font-black text-white leading-tight drop-shadow-sm group-hover:text-emerald-300 transition-colors">
                            {place.name}
                          </h3>
                        </div>
                      </div>

                      {/* Card Content & CTAs */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-white dark:bg-[#121821]">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3.5 text-emerald-500" />
                            {place.district}, TN
                          </span>
                          {place.rating && (
                            <span className="flex items-center gap-1 font-bold text-amber-500">
                              ★ {place.rating}
                            </span>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-white/10 font-sans">
                          <Link to="/place/$slug" params={{ slug }}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full rounded-xl text-xs font-bold border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer"
                            >
                              Details
                              <ExternalLink className="size-3 ml-1.5 opacity-60" />
                            </Button>
                          </Link>

                          <Link
                            to="/routes"
                            search={{ destination: place.name }}
                          >
                            <Button
                              size="sm"
                              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white dark:text-black font-extrabold text-xs shadow-sm cursor-pointer"
                            >
                              <Navigation className="size-3 mr-1" />
                              Route
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SAVED ROUTES & TRIPS */}
        {activeTab === "routes" && (
          <div className="space-y-6">
            {savedRoutes.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121821] p-12 text-center shadow-sm space-y-4">
                <div className="inline-flex size-16 place-items-center rounded-3xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <RouteIcon className="size-8" />
                </div>
                <div className="max-w-md mx-auto">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    No saved routes or itineraries
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Build custom multi-stop road trips or generate full itineraries with AI Trip Planner to save them here for offline reference.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Link to="/routes">
                    <Button className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white dark:text-black font-black text-xs px-5 py-2.5">
                      <RouteIcon className="size-4 mr-2" />
                      Plan Road Trip Route
                    </Button>
                  </Link>
                  <Link to="/planner">
                    <Button
                      variant="outline"
                      className="rounded-2xl border-slate-200 dark:border-white/15 text-xs font-bold px-4 py-2.5"
                    >
                      <Sparkles className="size-4 mr-1.5 text-emerald-500" />
                      AI Trip Planner
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedRoutes.map((route) => (
                  <div
                    key={route.id}
                    className="p-5 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121821] shadow-sm flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/20 mb-2">
                          <RouteIcon className="size-3" />
                          <span>{route.status}</span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {route.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1 flex items-center gap-2">
                          <span>{route.stops} Stops</span>
                          {route.district && <span>• {route.district}</span>}
                          {route.date && <span>• {route.date}</span>}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveRoute(route)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Remove route"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
                      <Link
                        to="/routes"
                        search={{ destination: route.title }}
                        className="flex-1"
                      >
                        <Button
                          size="sm"
                          className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white dark:text-black font-extrabold text-xs"
                        >
                          <Navigation className="size-3 mr-1.5" />
                          Open in Fullscreen Map
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
