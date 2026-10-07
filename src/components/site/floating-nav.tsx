import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Compass,
  Map,
  Route,
  Sparkles,
  Users,
  Bell,
  Search,
  Menu,
  Sun,
  Moon,
  Mountain,
  Landmark,
  ChevronDown,
  Waves,
  Utensils,
  Footprints,
  Trees,
  CloudRain,
  X,
  Shield,
  Bookmark,
  Languages,
  Grid,
  ArrowRight,
  Star,
  Home,
  User,
  CalendarDays,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { ProfileMenu } from "@/components/site/profile-menu";
import { DistrictsMegaModal } from "@/components/site/districts-mega-modal";
import { cn } from "@/lib/utils";
import { checkBackendHealth } from "@/lib/api";
import { getCurrentAuthUser, isAdminUser } from "@/lib/auth-rbac";

function useTheme() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const stored = localStorage.getItem("etn-theme");
    const isDark = stored ? stored === "dark" : true;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  const toggle = () => {
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("etn-theme", next ? "dark" : "light");
      return next;
    });
  };
  return { dark, toggle };
}

// Structured Destination Categories for Hover Menu
const DESTINATION_CATEGORIES = [
  {
    title: "Popular Districts",
    icon: Landmark,
    badge: "38 Available",
    items: [
      { to: "/districts/madurai", label: "Madurai District", subtitle: "Temple City & Nayak Heritage" },
      { to: "/districts/chennai", label: "Chennai District", subtitle: "Capital City & Marina Coast" },
      { to: "/districts/the-nilgiris", label: "The Nilgiris (Ooty)", subtitle: "Queen of Hill Stations" },
      { to: "/districts/dindigul", label: "Dindigul (Kodaikanal)", subtitle: "Princess of Hills & Biryani" },
      { to: "/districts/thanjavur", label: "Thanjavur District", subtitle: "Chola Big Temple & Art" },
      { to: "/districts/ramanathapuram", label: "Rameswaram District", subtitle: "Island Temple & Pamban" },
    ],
  },
  {
    title: "Hill Stations & Ghats",
    icon: Mountain,
    badge: "Cool Escapes",
    items: [
      { to: "/districts/the-nilgiris", label: "Ooty & Coonoor", subtitle: "Toy Train & Tea Gardens" },
      { to: "/districts/dindigul", label: "Kodaikanal Hills", subtitle: "Pine Forests & Star Lake" },
      { to: "/districts/theni", label: "Meghamalai Highwavys", subtitle: "Cloud Mountains & Tea" },
      { to: "/districts/salem", label: "Yercaud Loop Road", subtitle: "Shevaroy Hills & Coffee" },
      { to: "/districts/namakkal", label: "Kolli Hills 70 Curves", subtitle: "Hairpin Drive & Agaya Gangai" },
      { to: "/districts/tirupathur", label: "Yelagiri Hills", subtitle: "Swamimalai Trek & Lake" },
    ],
  },
  {
    title: "Heritage & Temples",
    icon: Landmark,
    badge: "Sacred Sites",
    items: [
      { to: "/madurai", label: "Meenakshi Amman Temple", subtitle: "14 Painted Towers & Sculptures" },
      { to: "/districts/thanjavur", label: "Brihadeeswarar Big Temple", subtitle: "1000-Yr Chola Architecture" },
      { to: "/districts/ramanathapuram", label: "Rameswaram Temple", subtitle: "22 Holy Wells & Ocean Corridor" },
      { to: "/districts/tiruvannamalai", label: "Annamalaiyar Temple", subtitle: "Sacred Fire Lingam & Giri Trail" },
      { to: "/districts/kancheepuram", label: "Kanchipuram Silk & Shrine", subtitle: "City of 1000 Temples" },
      { to: "/districts/tiruchirappalli", label: "Srirangam Ranganathar", subtitle: "Largest Functioning Temple" },
    ],
  },
  {
    title: "Waterfalls & Beaches",
    icon: Waves,
    badge: "Nature Havens",
    items: [
      { to: "/districts/dharmapuri", label: "Hogenakkal Falls", subtitle: "Niagara of South India" },
      { to: "/districts/tenkasi", label: "Courtallam Falls", subtitle: "Herbal Spa Waterfalls" },
      { to: "/districts/kanniyakumari", label: "Kanniyakumari Coast", subtitle: "3-Ocean Confluence Sunrise" },
      { to: "/districts/chengalpattu", label: "Mahabalipuram Shore", subtitle: "UNESCO Stone Reliefs & Beach" },
      { to: "/districts/thoothukudi", label: "Roche Park & Coast", subtitle: "Pearl City Sea Promenade" },
      { to: "/districts/nagapattinam", label: "Velankanni Beach", subtitle: "White Basilica Promenade" },
    ],
  },
];

export function FloatingNav({ onSearch }: { onSearch?: () => void }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [destMenuOpen, setDestMenuOpen] = useState(false);
  const [districtsModalOpen, setDistrictsModalOpen] = useState(false);
  const [lang, setLang] = useState<"en" | "ta">("en");
  const [isBackendLive, setIsBackendLive] = useState(false);
  const { dark, toggle } = useTheme();

  const menuTimeoutRef = useRef<any>(null);
  const pathname = location.pathname;
  const isAdminRoute = pathname.startsWith("/admin");

  useEffect(() => {
    const storedLang = localStorage.getItem("etn-lang") as "en" | "ta";
    if (storedLang) setLang(storedLang);
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === "en" ? "ta" : "en";
    setLang(nextLang);
    localStorage.setItem("etn-lang", nextLang);
  };

  const isDestinationsActive =
    pathname === "/madurai" ||
    pathname.startsWith("/districts") ||
    pathname === "/theni" ||
    pathname === "/hills-of-tn" ||
    pathname === "/western-ghats" ||
    pathname === "/coastal-heritage";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    checkBackendHealth().then((isOnline) => setIsBackendLive(isOnline));
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleMouseEnterDest = () => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setDestMenuOpen(true);
  };

  const handleMouseLeaveDest = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setDestMenuOpen(false);
    }, 180);
  };

  if (isAdminRoute) {
    return (
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-7 sm:pt-5 font-sans">
        <nav
          className="mx-auto flex h-[70px] max-w-[1400px] items-center justify-between gap-5 rounded-full px-6 transition-all duration-300 backdrop-blur-[24px] bg-[#09090b]/90 border border-zinc-800 shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
          aria-label="Admin Navigation"
        >
          {/* Left: Brand Logo & Admin Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/admin" className="flex items-center gap-2.5" aria-label="ExploreTN Admin Home">
              <span className="grid size-10 place-items-center rounded-2xl bg-emerald-500 text-zinc-950 font-black shadow-lg shadow-emerald-500/25">
                <Shield className="size-6 text-zinc-950" aria-hidden />
              </span>
              <span className="font-display text-xl font-extrabold tracking-tight text-white">
                Explore<span className="text-emerald-400">TN</span>
              </span>
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 text-[11px] font-mono font-bold text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              ADMIN CONTROL CENTER
            </span>
          </div>

          {/* Center: Admin Control Badge */}
          <div className="hidden md:flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-1.5 text-xs font-mono text-zinc-400">
            <span className="text-emerald-400 font-bold">Role:</span>
            <span className="text-white font-semibold">SUPER_ADMIN</span>
            <span className="text-zinc-700">•</span>
            <span className="text-zinc-300">Geospatial Operations Center</span>
          </div>

          {/* Right: Exit to Public Site & Profile Menu */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/"
              className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs font-extrabold text-zinc-300 hover:text-white hover:border-zinc-700 hover:bg-zinc-800 transition"
              title="Return to Visitor Site"
            >
              <Compass className="size-4 text-emerald-400" />
              <span>Public Site</span>
              <ArrowRight className="size-3.5 text-zinc-400" />
            </Link>
            <ProfileMenu dark={dark} toggleTheme={toggle} />
          </div>
        </nav>
      </header>
    );
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-7 sm:pt-5 font-sans">
        <nav
          className={cn(
            "mx-auto flex h-[70px] max-w-[1400px] items-center justify-between gap-2 sm:gap-4 rounded-full px-4 sm:pl-6 sm:pr-8 transition-all duration-300 backdrop-blur-[24px]",
            scrolled
              ? "bg-[#09090b]/90 border border-zinc-800 shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
              : "bg-[#09090b]/75 border border-zinc-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
          )}
          aria-label="Main Navigation"
        >
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2.5" aria-label="ExploreTN home">
              <span className="grid size-10 place-items-center rounded-2xl bg-emerald-500 text-zinc-950 font-black shadow-lg shadow-emerald-500/25">
                <Compass className="size-6 text-zinc-950" aria-hidden />
              </span>
              <span className="font-display text-xl font-extrabold tracking-tight text-white">
                Explore<span className="text-emerald-400">TN</span>
              </span>
            </Link>
          </div>

          {/* Center: Main Visitor Navigation */}
          <div className="hidden items-center gap-2 lg:flex shrink-0">
            {/* 1. Destinations Dropdown */}
            <div
              className="relative"
              onMouseEnter={handleMouseEnterDest}
              onMouseLeave={handleMouseLeaveDest}
            >
              <button
                type="button"
                onClick={() => setDistrictsModalOpen(true)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all duration-200 hover:bg-zinc-800/80 hover:text-white hover:scale-[1.02] cursor-pointer shrink-0",
                  isDestinationsActive
                    ? "bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30"
                    : "text-zinc-300 border border-transparent hover:border-zinc-800/60",
                )}
              >
                <Landmark className="size-4 text-amber-400 shrink-0" />
                <span className="whitespace-nowrap">{lang === "ta" ? "மாவட்டங்கள்" : "Destinations"}</span>
                <ChevronDown className={`size-3.5 shrink-0 transition-transform ${destMenuOpen ? "rotate-180 text-emerald-400" : ""}`} />
              </button>

              {/* Mega Destinations Dropdown Popover */}
              <AnimatePresence>
                {destMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 w-[840px] rounded-3xl border border-zinc-800 bg-[#09090b]/98 backdrop-blur-2xl p-6 shadow-2xl z-50 text-white"
                  >
                    {/* Header Banner: Best Places for October & Trending Spots */}
                    <div className="mb-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-zinc-900 to-amber-950 border border-emerald-500/30 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <Sparkles className="size-3 text-emerald-400" /> Best for October & Trending
                          </span>
                          <span className="text-xs font-bold text-zinc-300">
                            Post-Monsoon Seasonal Picks
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setDestMenuOpen(false);
                            setDistrictsModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-extrabold text-zinc-950 hover:bg-emerald-400 transition shadow-md shadow-emerald-500/20"
                        >
                          <Grid className="size-3.5" />
                          <span>All 38 Districts & Culture</span>
                          <ArrowRight className="size-3.5" />
                        </button>
                      </div>

                      {/* Month-Based Top Spots Pills Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <Link
                          to="/districts/$districtSlug"
                          params={{ districtSlug: "the-nilgiris" }}
                          onClick={() => setDestMenuOpen(false)}
                          className="group p-2.5 rounded-xl bg-zinc-900/90 border border-emerald-500/30 hover:border-emerald-400 transition flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">🌿</span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300">Oct Top Hill</span>
                            </div>
                            <h4 className="text-xs font-extrabold text-white group-hover:text-emerald-400 mt-1">Ooty (Nilgiris)</h4>
                            <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">Doddabetta, Toy Train & Pykara</p>
                          </div>
                        </Link>

                        <Link
                          to="/districts/$districtSlug"
                          params={{ districtSlug: "dindigul" }}
                          onClick={() => setDestMenuOpen(false)}
                          className="group p-2.5 rounded-xl bg-zinc-900/90 border border-emerald-500/30 hover:border-emerald-400 transition flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">⛰️</span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300">Cool Mist</span>
                            </div>
                            <h4 className="text-xs font-extrabold text-white group-hover:text-emerald-400 mt-1">Kodaikanal</h4>
                            <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">Star Lake & Pillar Rocks</p>
                          </div>
                        </Link>

                        <Link
                          to="/districts/$districtSlug"
                          params={{ districtSlug: "dharmapuri" }}
                          onClick={() => setDestMenuOpen(false)}
                          className="group p-2.5 rounded-xl bg-zinc-900/90 border border-emerald-500/30 hover:border-emerald-400 transition flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">💧</span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300">Cascades</span>
                            </div>
                            <h4 className="text-xs font-extrabold text-white group-hover:text-emerald-400 mt-1">Hogenakkal Falls</h4>
                            <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">Kaveri Coracle Rafting</p>
                          </div>
                        </Link>

                        <Link
                          to="/districts/$districtSlug"
                          params={{ districtSlug: "madurai" }}
                          onClick={() => setDestMenuOpen(false)}
                          className="group p-2.5 rounded-xl bg-zinc-900/90 border border-amber-500/30 hover:border-amber-400 transition flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">🛕</span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300">Culture & Spot</span>
                            </div>
                            <h4 className="text-xs font-extrabold text-white group-hover:text-amber-300 mt-1">Madurai Heritage</h4>
                            <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">Meenakshi Amman & Nayak Palace</p>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Categorized 4-Column Grid */}
                    <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
                      {DESTINATION_CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <div key={cat.title} className="flex flex-col gap-2">
                            <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/80">
                              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                                <Icon className="size-3.5 text-amber-400" />
                                <span>{cat.title}</span>
                              </span>
                              <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[9px] font-mono text-zinc-400">
                                {cat.badge}
                              </span>
                            </div>

                            <div className="flex flex-col gap-1 mt-1">
                              {cat.items.map((item) => (
                                <Link
                                  key={item.label}
                                  to={item.to}
                                  onClick={() => setDestMenuOpen(false)}
                                  className="group flex flex-col rounded-xl p-2 hover:bg-zinc-900/90 transition"
                                >
                                  <span className="text-xs font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                                    <span>{item.label}</span>
                                    <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-emerald-400">→</span>
                                  </span>
                                  <span className="text-[10px] text-zinc-400 truncate mt-0.5">{item.subtitle}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          {/* 2. Map Explorer */}
          <Link
            to="/explore"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-zinc-300 whitespace-nowrap transition-all duration-200 hover:bg-zinc-800/80 hover:text-white hover:scale-[1.02] shrink-0 border border-transparent hover:border-zinc-800/60"
            activeProps={{ className: "bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30" }}
          >
            <Map className="size-4 text-emerald-400 shrink-0" />
            <span className="whitespace-nowrap">{lang === "ta" ? "வரைபட உலா" : "Map Explorer"}</span>
          </Link>

          {/* 3. Trails & Routes */}
          <Link
            to="/routes"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-zinc-300 whitespace-nowrap transition-all duration-200 hover:bg-zinc-800/80 hover:text-white hover:scale-[1.02] shrink-0 border border-transparent hover:border-zinc-800/60"
            activeProps={{ className: "bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30" }}
          >
            <Route className="size-4 text-emerald-400 shrink-0" />
            <span className="whitespace-nowrap">{lang === "ta" ? "பயணப் பாதைகள்" : "Trails & Routes"}</span>
          </Link>

          {/* 4. Travel Guides */}
          <Link
            to="/community"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-zinc-300 whitespace-nowrap transition-all duration-200 hover:bg-zinc-800/80 hover:text-white hover:scale-[1.02] shrink-0 border border-transparent hover:border-zinc-800/60"
            activeProps={{ className: "bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30" }}
          >
            <Users className="size-4 text-zinc-400 shrink-0" />
            <span className="whitespace-nowrap">{lang === "ta" ? "வழிகாட்டிகள்" : "Travel Guides"}</span>
          </Link>

          {/* 5. Events & Festivals */}
          <Link
            to="/events"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-zinc-300 whitespace-nowrap transition-all duration-200 hover:bg-zinc-800/80 hover:text-white hover:scale-[1.02] shrink-0 border border-transparent hover:border-zinc-800/60"
            activeProps={{ className: "bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30" }}
          >
            <CalendarDays className="size-4 text-emerald-400 shrink-0" />
            <span className="whitespace-nowrap">{lang === "ta" ? "நிகழ்வுகள் & திருவிழாக்கள்" : "Events"}</span>
          </Link>
        </div>

        {/* Right Utility Section & Primary Action CTA */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          {/* Search Trigger Button */}
          <button
            type="button"
            onClick={onSearch}
            className="hidden xl:flex h-[40px] items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-3.5 text-xs text-zinc-400 hover:border-zinc-700 hover:text-white transition cursor-pointer shrink-0"
          >
            <Search className="size-3.5 text-zinc-400" />
            <span className="font-medium">{lang === "ta" ? "தேடுக..." : "Search places..."}</span>
            <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
              {typeof navigator !== "undefined" && /Mac/i.test(navigator.platform || "") ? "⌘K" : "Ctrl K"}
            </kbd>
          </button>

          {/* Language Switcher Toggle (தமிழ் / English) */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="hidden sm:flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs font-bold text-amber-300 hover:border-amber-500/50 hover:bg-zinc-800 transition shrink-0"
            title="Switch Language / மொழியை மாற்றுக"
          >
            <Languages className="size-3.5 text-amber-400" />
            <span>{lang === "en" ? "தமிழ்" : "English"}</span>
          </button>

          {/* Saved Places */}
          <Link
            to="/saved"
            className="hidden sm:flex items-center justify-center size-10 rounded-full border border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:text-white hover:border-zinc-700 transition shrink-0"
            title={lang === "ta" ? "சேமித்த இடங்கள்" : "Saved Places"}
          >
            <Bookmark className="size-4 text-zinc-300" />
          </Link>

          {/* Visually Lighter Nav CTA Button: Plan Route */}
          <Link
            to="/routes"
            data-testid="desktop-plan-route-btn"
            className="hidden md:flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/60 transition backdrop-blur-md shrink-0"
          >
            <Route className="size-3.5 text-emerald-400" />
            <span>{lang === "ta" ? "பாதையைத் திட்டமிடு" : "Plan Route"}</span>
          </Link>

          {/* Account Icon & Profile Menu Dropdown */}
          <ProfileMenu dark={dark} toggleTheme={toggle} />

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden rounded-full size-10 border border-zinc-800 bg-zinc-900 text-zinc-300"
            onClick={() => setOpen((o) => !o)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </nav>

      {/* Structured Mobile Drawer */}
      {open && (
        <div className="mx-auto mt-3 max-w-[1400px] rounded-3xl p-5 lg:hidden border border-zinc-800 bg-[#09090b]/98 backdrop-blur-2xl text-white space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
          <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider mb-2">
            {lang === "ta" ? "பயண வழிசெலுத்தல்" : "TRAVEL NAVIGATION"}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/madurai"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-bold text-zinc-200 bg-zinc-900/80 border border-zinc-800"
            >
              <Landmark className="size-4 text-amber-400" />
              <span>{lang === "ta" ? "மாவட்டங்கள்" : "Destinations"}</span>
            </Link>
            <Link
              to="/explore"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-bold text-zinc-200 bg-zinc-900/80 border border-zinc-800"
            >
              <Map className="size-4 text-emerald-400" />
              <span>{lang === "ta" ? "வரைபட உலா" : "Map Explorer"}</span>
            </Link>
            <Link
              to="/routes"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-bold text-zinc-200 bg-zinc-900/80 border border-zinc-800"
            >
              <Route className="size-4 text-emerald-400" />
              <span>{lang === "ta" ? "பயணப் பாதைகள்" : "Trails & Routes"}</span>
            </Link>
            <Link
              to="/community"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-bold text-zinc-200 bg-zinc-900/80 border border-zinc-800"
            >
              <Users className="size-4 text-zinc-400" />
              <span>{lang === "ta" ? "வழிகாட்டிகள்" : "Travel Guides"}</span>
            </Link>
            <Link
              to="/events"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-bold text-emerald-300 bg-emerald-950/40 border border-emerald-500/30"
            >
              <CalendarDays className="size-4 text-emerald-400" />
              <span>{lang === "ta" ? "நிகழ்வுகள் & திருவிழாக்கள்" : "Events"}</span>
            </Link>
            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 col-span-2"
            >
              <User className="size-4 text-emerald-400" />
              <span>{lang === "ta" ? "கணக்கு அமைப்புகள் & சுயவிவரம்" : "Account Settings & Explorer Profile"}</span>
            </Link>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-bold text-amber-300"
            >
              <Languages className="size-4 text-amber-400" />
              <span>{lang === "en" ? "தமிழ் பதிப்பு" : "English Version"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setDistrictsModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs font-bold text-amber-400"
            >
              <Grid className="size-3.5" />
              <span>{lang === "ta" ? "38 மாவட்டங்கள்" : "38 Districts Stream"}</span>
            </button>

            <Link
              to="/routes"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-zinc-950"
            >
              <Route className="size-3.5" />
              <span>{lang === "ta" ? "பாதையைத் திட்டமிடு" : "Plan Route"}</span>
            </Link>
          </div>
        </div>
      )}

      {/* Full-Screen All 38 Districts Animated Marquee Stream Modal */}
      <DistrictsMegaModal
        isOpen={districtsModalOpen}
        onClose={() => setDistrictsModalOpen(false)}
        lang={lang}
      />
    </header>
    </>
  );
}

export function MobileTabBar() {
  const location = useLocation();
  const pathname = location.pathname;

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const isExploreActive =
    pathname === "/explore" ||
    pathname === "/madurai" ||
    pathname === "/theni" ||
    pathname === "/hills-of-tn" ||
    pathname === "/western-ghats" ||
    pathname === "/coastal-heritage" ||
    pathname === "/hill-escapes";

  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-50 flex items-center justify-around rounded-2xl px-2 py-2 sm:hidden bg-[#09090b]/90 backdrop-blur-[24px] border border-zinc-800 shadow-lg"
      aria-label="Mobile Bottom Bar"
    >
      {[
        { to: "/", label: "Home", icon: Compass, isActive: pathname === "/" },
        { to: "/explore", label: "Explore", icon: Map, isActive: isExploreActive },
        { to: "/routes", label: "Routes", icon: Route, isActive: pathname === "/routes" },
        { to: "/planner", label: "AI Planner", icon: Sparkles, isActive: pathname === "/planner" },
        { to: "/settings", label: "Account", icon: User, isActive: pathname === "/settings" },
      ].map((l) => {
        const Icon = l.icon;
        return (
          <Link
            key={l.to}
            to={l.to}
            className={cn(
              "flex min-h-11 min-w-16 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-[11px] font-medium transition-colors",
              l.isActive
                ? "text-emerald-400 font-bold"
                : "text-zinc-400",
            )}
          >
            <Icon className="size-5" aria-hidden />
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
