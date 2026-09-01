import { useState, useEffect, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
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
  ArrowLeft,
} from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import { getApiBaseUrl } from "@/lib/api-client/config";
import { CANONICAL_PLACES } from "@/lib/data/canonical-places";

export const Route = createFileRoute("/explore/$category")({
  head: ({ params }) => {
    const catKey = params.category?.toLowerCase() || "all";
    const catMeta = CATEGORY_MAP[catKey] || CATEGORY_MAP["all"];
    return {
      meta: [
        { title: `${catMeta.title} in Tamil Nadu — ExplorerTN` },
        { name: "description", content: catMeta.subtitle },
      ],
    };
  },
  component: CategoryExplorePage,
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

interface CategoryMeta {
  title: string;
  subtitle: string;
  icon: any;
  badgeColor: string;
  bannerGradient: string;
  defaultSeason: string;
  defaultDifficulty: string;
}

const CATEGORY_MAP: Record<string, CategoryMeta> = {
  falls: {
    title: "Falls & Waterfalls",
    subtitle: "Monsoon cascades, natural rock pools & forest waterfalls across Tamil Nadu",
    icon: CloudRain,
    badgeColor: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    bannerGradient: "from-cyan-500/10 via-cyan-500/5 to-transparent",
    defaultSeason: "Monsoon (Oct-Dec)",
    defaultDifficulty: "Easy to Moderate",
  },
  waterfalls: {
    title: "Falls & Waterfalls",
    subtitle: "Monsoon cascades, natural rock pools & forest waterfalls across Tamil Nadu",
    icon: CloudRain,
    badgeColor: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    bannerGradient: "from-cyan-500/10 via-cyan-500/5 to-transparent",
    defaultSeason: "Monsoon (Oct-Dec)",
    defaultDifficulty: "Easy to Moderate",
  },
  trekking: {
    title: "Trekking & Hiking",
    subtitle: "Craggy peak climbs, hill fort trails & Western Ghats ridge treks",
    icon: Mountain,
    badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    bannerGradient: "from-amber-500/10 via-amber-500/5 to-transparent",
    defaultSeason: "Winter (Nov-Feb)",
    defaultDifficulty: "Moderate to Hard",
  },
  beaches: {
    title: "Beaches & Coastline",
    subtitle: "Coromandel coast, Bay of Bengal shores, coastal forts & surfing beaches",
    icon: Waves,
    badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    bannerGradient: "from-blue-500/10 via-blue-500/5 to-transparent",
    defaultSeason: "Winter (Nov-Feb)",
    defaultDifficulty: "Easy",
  },
  hills: {
    title: "Hills & Mountains",
    subtitle: "Nilgiris, Kolli 70-hairpin passes, Kodaikanal & Western Ghats cloud forests",
    icon: Mountain,
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    bannerGradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    defaultSeason: "Year-Round",
    defaultDifficulty: "Moderate",
  },
  lakes: {
    title: "Lakes, Dams & Rivers",
    subtitle: "Reservoirs, brackish water lagoons, river bends & dam backwaters",
    icon: Waves,
    badgeColor: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    bannerGradient: "from-sky-500/10 via-sky-500/5 to-transparent",
    defaultSeason: "Post-Monsoon (Nov-Mar)",
    defaultDifficulty: "Easy",
  },
  nature: {
    title: "Nature & Forest Reserves",
    subtitle: "Biosphere reserves, elephant camps, mangroves & wildlife sanctuaries",
    icon: Trees,
    badgeColor: "bg-green-500/15 text-green-400 border-green-500/30",
    bannerGradient: "from-green-500/10 via-green-500/5 to-transparent",
    defaultSeason: "Winter (Oct-Mar)",
    defaultDifficulty: "Easy to Moderate",
  },
  temples: {
    title: "Temples & Sacred Shrines",
    subtitle: "Pancha Bhoota Stalam, Arupadai Veedu circuit & thousand-year Dravidian gopurams",
    icon: Landmark,
    badgeColor: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    bannerGradient: "from-orange-500/10 via-orange-500/5 to-transparent",
    defaultSeason: "Year-Round",
    defaultDifficulty: "Easy",
  },
  heritage: {
    title: "Heritage & Historical Monuments",
    subtitle: "UNESCO Pallava rock sculptures, Chola temples, hill citadels & hanging aqueducts",
    icon: Landmark,
    badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    bannerGradient: "from-purple-500/10 via-purple-500/5 to-transparent",
    defaultSeason: "Winter (Nov-Feb)",
    defaultDifficulty: "Easy to Moderate",
  },
  adventure: {
    title: "Adventure Activities",
    subtitle: "Coracle river rides, dune drives, mountain hairpins, ridge trekking & camping",
    icon: Footprints,
    badgeColor: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    bannerGradient: "from-rose-500/10 via-rose-500/5 to-transparent",
    defaultSeason: "Winter (Nov-Feb)",
    defaultDifficulty: "Moderate to Hard",
  },
  viewpoints: {
    title: "Viewpoints & Sunsets",
    subtitle: "High altitude observation points, sea confluences & sunrise crests",
    icon: Sun,
    badgeColor: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    bannerGradient: "from-yellow-500/10 via-yellow-500/5 to-transparent",
    defaultSeason: "Year-Round",
    defaultDifficulty: "Easy to Moderate",
  },
  food: {
    title: "Food & Local Culinary Trails",
    subtitle: "Madurai street food, Jigarthanda, Chettinad feasts & iconic tea shops",
    icon: Utensils,
    badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    bannerGradient: "from-amber-500/10 via-amber-500/5 to-transparent",
    defaultSeason: "Year-Round",
    defaultDifficulty: "Easy",
  },
  rural: {
    title: "Villages & Rural Experiences",
    subtitle: "Agrarian countryside, lotus ponds, rubber estates & traditional village trails",
    icon: Trees,
    badgeColor: "bg-lime-500/15 text-lime-400 border-lime-500/30",
    bannerGradient: "from-lime-500/10 via-lime-500/5 to-transparent",
    defaultSeason: "Monsoon to Winter",
    defaultDifficulty: "Easy",
  },
  hidden: {
    title: "Hidden & Offbeat Places",
    subtitle: "Secluded cascades, quiet countryside spots & lesser-known historical ruins",
    icon: Sparkles,
    badgeColor: "bg-teal-500/15 text-teal-400 border-teal-500/30",
    bannerGradient: "from-teal-500/10 via-teal-500/5 to-transparent",
    defaultSeason: "Year-Round",
    defaultDifficulty: "Easy to Moderate",
  },
  all: {
    title: "All Tamil Nadu Places",
    subtitle: "Canonical directory of all places, adventure spots & heritage sites across 38 districts",
    icon: Compass,
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    bannerGradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    defaultSeason: "Year-Round",
    defaultDifficulty: "All Difficulties",
  },
};

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

function CategoryExplorePage() {
  const { category } = Route.useParams();
  const catKey = (category || "all").toLowerCase();
  const catMeta = CATEGORY_MAP[catKey] || CATEGORY_MAP["all"];

  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All Difficulties");

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
        console.warn("Failed to fetch backend places, using canonical registry fallback:", err);
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

  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      if (!p) return false;
      const cats = p.categories || [];
      const primaryCat = (p.category || "").toLowerCase();
      const subCat = (p.subcategory || "").toLowerCase();
      const tagsStr = (p.tags || []).join(" ").toLowerCase();
      const nameLower = (p.name || "").toLowerCase();

      let matchCat = false;
      if (catKey === "falls" || catKey === "waterfalls") {
        matchCat = cats.includes("waterfall") || primaryCat === "waterfall" || subCat === "waterfall" || nameLower.includes("fall") || nameLower.includes("aruvi");
      } else if (catKey === "trekking") {
        matchCat = cats.includes("trekking") || p.is_trekking || primaryCat === "mountain" || subCat === "trekking" || nameLower.includes("trek");
      } else if (catKey === "beaches") {
        matchCat = cats.includes("beaches") || cats.includes("coastal") || primaryCat === "coastal" || subCat === "beach" || nameLower.includes("beach");
      } else if (catKey === "hills") {
        matchCat = cats.includes("hills") || primaryCat === "mountain" || subCat === "viewpoint" || nameLower.includes("hill") || nameLower.includes("peak");
      } else if (catKey === "lakes") {
        matchCat = cats.includes("lake") || primaryCat === "lake" || subCat === "lake" || nameLower.includes("lake") || nameLower.includes("dam") || nameLower.includes("lagoon");
      } else if (catKey === "nature") {
        matchCat = cats.includes("nature") || primaryCat === "wildlife" || primaryCat === "forest" || subCat === "mangrove";
      } else if (catKey === "temples") {
        matchCat = cats.includes("temple") || primaryCat === "temple" || subCat === "temple" || nameLower.includes("temple") || nameLower.includes("kovil");
      } else if (catKey === "heritage") {
        matchCat = cats.includes("heritage") || primaryCat === "heritage" || subCat === "fort" || subCat === "palace" || nameLower.includes("fort") || nameLower.includes("aqueduct");
      } else if (catKey === "adventure") {
        matchCat = cats.includes("adventure") || primaryCat === "adventure" || p.is_trekking || tagsStr.includes("adventure");
      } else if (catKey === "viewpoints") {
        matchCat = cats.includes("viewpoint") || subCat === "viewpoint" || tagsStr.includes("viewpoint");
      } else if (catKey === "food") {
        matchCat = cats.includes("food") || primaryCat === "food" || tagsStr.includes("food");
      } else if (catKey === "rural") {
        matchCat = cats.includes("rural") || subCat === "rural_tourism" || tagsStr.includes("rural");
      } else if (catKey === "hidden") {
        matchCat = cats.includes("hidden") || (p.rating && p.rating < 4.8) || tagsStr.includes("hidden") || p.verified === false;
      } else {
        matchCat = true;
      }

      // District Filter
      if (selectedDistrict !== "All Districts") {
        if ((p.district || "").toLowerCase() !== selectedDistrict.toLowerCase()) return false;
      }

      // Difficulty Filter
      if (selectedDifficulty !== "All Difficulties") {
        const diff = (p.difficulty || "Easy").toLowerCase();
        if (!diff.includes(selectedDifficulty.toLowerCase())) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (p.name || "").toLowerCase().includes(q);
        const matchDist = (p.district || "").toLowerCase().includes(q);
        const matchCatName = (p.category || "").toLowerCase().includes(q);
        const matchTag = (p.tagline || "").toLowerCase().includes(q);
        if (!matchName && !matchDist && !matchCatName && !matchTag) return false;
      }

      return matchCat;
    });
  }, [places, catKey, selectedDistrict, selectedDifficulty, searchQuery]);

  const IconComponent = catMeta.icon;

  return (
    <AppShell>
      <div className="min-h-screen bg-background font-sans text-foreground pb-24">
        {/* Banner Section */}
        <div className={`relative border-b border-border bg-gradient-to-b ${catMeta.bannerGradient} pt-28 pb-10 px-4 sm:px-8`}>
          <div className="max-w-7xl mx-auto space-y-4">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition mb-2"
            >
              <ArrowLeft className="size-3.5" /> Back to All Categories
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold mb-3 border ${catMeta.badgeColor}`}>
                  <IconComponent className="size-3.5" /> {catMeta.title.toUpperCase()}
                </div>
                <h1 className="text-3xl sm:text-5xl font-extrabold font-serif tracking-tight text-foreground">
                  {catMeta.title} in Tamil Nadu
                </h1>
                <p className="text-base text-muted-foreground mt-2 max-w-2xl">
                  {catMeta.subtitle}
                </p>
              </div>

              {/* Spatial Map Link */}
              <Link
                to="/discover"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xl shadow-emerald-600/20 transition group shrink-0"
              >
                <Map className="size-4" />
                <span>View {catMeta.title} on Map</span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-3xl shadow-sm">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search in ${catMeta.title}...`}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* District Filter Dropdown */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                <MapPin className="size-3.5 text-emerald-500" />
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

              {/* Difficulty Filter Dropdown */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                <Filter className="size-3.5 text-emerald-500" />
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-border bg-background text-xs font-bold text-foreground focus:outline-none"
                >
                  <option value="All Difficulties">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              {/* Match Counter */}
              <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20 whitespace-nowrap">
                {filteredPlaces.length} Destinations Found
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="h-72 rounded-3xl bg-card border border-border animate-pulse" />
              ))}
            </div>
          ) : filteredPlaces.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-3xl p-8 max-w-md mx-auto space-y-4">
              <div className="inline-flex p-4 rounded-full bg-amber-500/10 text-amber-500">
                <SlidersHorizontal className="size-8" />
              </div>
              <h3 className="text-lg font-bold font-serif text-foreground">No destinations found</h3>
              <p className="text-xs text-muted-foreground">
                No places match your criteria in {catMeta.title}. Try clearing district filters or search keywords.
              </p>
              <Button size="sm" onClick={() => { setSearchQuery(""); setSelectedDistrict("All Districts"); setSelectedDifficulty("All Difficulties"); }}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPlaces.map((p) => {
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

                        {/* Top Primary Badge */}
                        <div className="absolute top-3 left-3">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-md ${catMeta.badgeColor}`}>
                            {p.category ? p.category.toUpperCase() : "DESTINATION"}
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
                        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="size-3.5 text-emerald-500 shrink-0" />
                            <span>{p.district} District</span>
                          </div>
                          {p.difficulty && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-accent font-bold text-foreground">
                              {p.difficulty}
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
