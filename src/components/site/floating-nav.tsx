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
  LogIn,
  Settings,
  ShieldAlert,
  MapPin,
  Lock,
  Globe,
  CreditCard,
  HelpCircle,
  Bot,
  UserPlus,
  LogOut,
  Award,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { Button } from "@/components/ui/button";
import { Notification2, type TeamUpdate } from "@/components/ui/notification-2";
import { DistrictsMegaModal } from "@/components/site/districts-mega-modal";
import { cn } from "@/lib/utils";
import { checkBackendHealth } from "@/lib/api";
import { getCurrentAuthUser, isAdminUser, clearAuthSession, subscribeToAuthChanges, UserProfile } from "@/lib/auth-rbac";
import { useAuthGuard } from "@/lib/auth-guard-context";

function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    // Clear any previous dark mode preference to maintain crisp white and light blue
    localStorage.removeItem("etn-theme");
    document.documentElement.classList.remove("dark");
  }, []);
  const toggle = () => {
    // Keep it light
    document.documentElement.classList.remove("dark");
  };
  return { dark: false, toggle };
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
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const settingsTimeoutRef = useRef<any>(null);

  const { user: authGuardUser, openAuthModal, logout: authGuardLogout } = useAuthGuard();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentAuthUser());

  useEffect(() => {
    setCurrentUser(authGuardUser || getCurrentAuthUser());
    const unsubscribe = subscribeToAuthChanges((updatedUser) => {
      setCurrentUser(updatedUser);
    });
    return () => {
      unsubscribe();
    };
  }, [authGuardUser]);

  const handleMouseEnterSettings = () => {
    if (settingsTimeoutRef.current) clearTimeout(settingsTimeoutRef.current);
    setSettingsMenuOpen(true);
  };

  const handleMouseLeaveSettings = () => {
    settingsTimeoutRef.current = setTimeout(() => {
      setSettingsMenuOpen(false);
    }, 200);
  };

  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    };
    if (notificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationOpen]);

  const explorerNotifications: TeamUpdate[] = [
    {
      id: "tn-1",
      type: "alert",
      priority: "urgent",
      author: {
        name: "Nilgiris Ghat Patrol",
        initials: "NG",
        avatar: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=120&q=80",
      },
      project: "Kallar Ghat Road",
      message: "Heavy mist & hairpin bend advisory between Mettupalayam and Coonoor",
      detail: "Speed limit restricted to 30 km/h. Both lanes operational with continuous escort patrols.",
      timestamp: "5m ago",
      isUnread: true,
      isMention: false,
    },
    {
      id: "tn-2",
      type: "deploy",
      priority: "normal",
      author: {
        name: "ExploreTN AI",
        initials: "AI",
        avatar: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=120&q=80",
      },
      project: "Circuit Planner",
      message: "New 3-Day Western Ghats Monsoon Trail generated for your wishlist",
      detail: "Includes Courtallam Main Falls, Manimuthar dam canopy walk, and Kalakkad sanctuary pass.",
      timestamp: "45m ago",
      isUnread: true,
      isMention: true,
    },
    {
      id: "tn-3",
      type: "team",
      priority: "normal",
      author: {
        name: "Madurai Guides",
        initials: "MG",
        avatar: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=120&q=80",
      },
      project: "Meenakshi Temple",
      message: "Chithirai Festival special morning darshan slots opened for travelers",
      timestamp: "2h ago",
      isUnread: true,
      isMention: false,
    },
    {
      id: "tn-4",
      type: "doc",
      priority: "low",
      author: {
        name: "Shore Heritage",
        initials: "SH",
        avatar: "https://images.unsplash.com/photo-1600100397608-f010f444f434?auto=format&fit=crop&w=120&q=80",
      },
      project: "Mahabalipuram",
      message: "New audio guide updated for Arjuna's Penance & Five Rathas",
      timestamp: "Yesterday",
      isUnread: false,
      isMention: false,
    },
  ];

  const handleLogOut = async () => {
    try {
      const { supabase } = await import("@/lib/supabase-client");
      await supabase.auth.signOut().catch(() => null);
    } catch {
      // ignore
    }
    clearAuthSession();
    setCurrentUser(null);
    authGuardLogout();
    setSettingsMenuOpen(false);
    if (typeof window !== "undefined") {
      window.location.replace("/");
    }
  };

  const initials = currentUser?.name
    ? currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "EX";

  if (isAdminRoute) {
    return (
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-7 sm:pt-5 font-sans">
        <nav
          className="mx-auto flex h-[70px] max-w-[1400px] items-center justify-between gap-5 rounded-full px-6 transition-all duration-300 backdrop-blur-[24px] bg-white/95 border border-sky-100 shadow-[0_12px_40px_rgba(15,23,42,0.1)]"
          aria-label="Admin Navigation"
        >
          {/* Left: Brand Logo & Admin Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/admin" className="flex items-center gap-2.5" aria-label="ExploreTN Admin Home">
              <span className="grid size-10 place-items-center rounded-2xl bg-sky-500 text-white font-black shadow-md shadow-sky-500/25">
                <Shield className="size-6 text-white" aria-hidden />
              </span>
              <span className="font-display text-xl font-extrabold tracking-tight text-slate-900">
                Explore<span className="text-sky-600">TN</span>
              </span>
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-[11px] font-mono font-bold text-sky-700">
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

          {/* Right: Exit to Public Site & Settings */}
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
            <Link
              to="/settings"
              className="flex items-center justify-center size-9 rounded-full border border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:text-white hover:border-zinc-700 transition shrink-0"
              title="Settings & Controls"
            >
              <Settings className="size-4" />
            </Link>
          </div>
        </nav>
      </header>
    );
  }

  const isHomePage = pathname === "/";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-4 font-sans">
        <div className="mx-auto flex max-w-[1440px] items-center justify-center">
          {/* Floating Navbar Pill (Navigation5 Design) */}
          <nav
            className={cn(
              "flex h-16 w-full max-w-7xl items-center justify-between gap-3 sm:gap-4 rounded-full border pl-5 sm:pl-7 pr-8 sm:pr-10 transition-all duration-300",
              scrolled
                ? "border-sky-200/80 bg-white/95 shadow-[0_12px_40px_rgba(2,132,199,0.1)] backdrop-blur-xl"
                : "border-white/30 bg-white/20 shadow-sm backdrop-blur-md"
            )}
            aria-label="Main Navigation"
          >
            {/* Logo Section - Left Aligned */}
            <div className="flex items-center gap-2 shrink-0">
              <Link to="/" className="flex items-center gap-2.5" aria-label="ExploreTN home">
                <span className="grid size-9 place-items-center rounded-xl bg-sky-500 text-white font-black shadow-md shadow-sky-500/25">
                  <Compass className="size-5 text-white" aria-hidden />
                </span>
                <span className="text-xl font-bold tracking-tight text-slate-900 font-display">
                  Explore<span className="text-sky-500">TN</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation with Continuous Tabs Animation */}
            <div className="hidden lg:block">
              <LayoutGroup id="explore-tn-navbar-tabs">
                <nav
                  className={cn(
                    "relative flex items-center gap-1 p-1 rounded-full border transition-all duration-300",
                    !scrolled
                      ? "border-white/30 bg-white/20 shadow-none backdrop-blur-xs"
                      : "border-slate-200/80 bg-slate-50/70 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.02),inset_0_1px_0_rgba(255,255,255,0.9),0_2px_8px_rgba(2,132,199,0.04)]"
                  )}
                >
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
                        "relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors duration-200 outline-none cursor-pointer shrink-0 select-none",
                        isDestinationsActive ? "text-white font-bold" : "text-slate-600 hover:text-slate-900"
                      )}
                    >
                      {isDestinationsActive && (
                        <motion.div
                          layoutId="explore-tn-active-pill"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 30,
                            mass: 0.9,
                          }}
                          className="absolute inset-0 rounded-full bg-sky-500 shadow-sm"
                        />
                      )}
                      <Landmark className={cn("size-3.5 relative z-10 shrink-0", isDestinationsActive ? "text-white" : "text-sky-600")} />
                      <span className="relative z-10 whitespace-nowrap">{lang === "ta" ? "மாவட்டங்கள்" : "Destinations"}</span>
                      <ChevronDown className={cn("size-3 relative z-10 shrink-0 transition-transform", destMenuOpen ? "rotate-180" : "", isDestinationsActive ? "text-white" : "text-slate-400")} />
                    </button>

                    {/* Mega Destinations Dropdown Popover */}
                    <AnimatePresence>
                      {destMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 w-[840px] rounded-3xl border border-sky-100 bg-white/98 backdrop-blur-2xl p-6 shadow-2xl z-50 text-slate-800"
                        >
                          {/* Header Banner: Best Places for October & Trending Spots */}
                          <div className="mb-4 rounded-2xl bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border border-sky-200 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/15 text-sky-700 border border-sky-300 flex items-center gap-1">
                                  <Sparkles className="size-3 text-sky-600" /> Best for October & Trending
                                </span>
                                <span className="text-xs font-bold text-slate-700">
                                  Post-Monsoon Seasonal Picks
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  setDestMenuOpen(false);
                                  setDistrictsModalOpen(true);
                                }}
                                className="flex items-center gap-1.5 rounded-xl bg-sky-500 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-sky-600 transition shadow-md shadow-sky-500/20"
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
                                className="group p-2.5 rounded-xl bg-white border border-sky-100 shadow-sm hover:border-sky-300 transition flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm">🌿</span>
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-100 text-sky-700">Oct Top Hill</span>
                                  </div>
                                  <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-sky-600 mt-1">Ooty (Nilgiris)</h4>
                                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">Doddabetta, Toy Train & Pykara</p>
                                </div>
                              </Link>

                              <Link
                                to="/districts/$districtSlug"
                                params={{ districtSlug: "dindigul" }}
                                onClick={() => setDestMenuOpen(false)}
                                className="group p-2.5 rounded-xl bg-white border border-sky-100 shadow-sm hover:border-sky-300 transition flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm">⛰️</span>
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-100 text-sky-700">Cool Mist</span>
                                  </div>
                                  <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-sky-600 mt-1">Kodaikanal</h4>
                                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">Star Lake & Pillar Rocks</p>
                                </div>
                              </Link>

                              <Link
                                to="/districts/$districtSlug"
                                params={{ districtSlug: "dharmapuri" }}
                                onClick={() => setDestMenuOpen(false)}
                                className="group p-2.5 rounded-xl bg-white border border-sky-100 shadow-sm hover:border-sky-300 transition flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm">💧</span>
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700">Cascades</span>
                                  </div>
                                  <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-sky-600 mt-1">Hogenakkal Falls</h4>
                                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">Kaveri Coracle Rafting</p>
                                </div>
                              </Link>

                              <Link
                                to="/districts/$districtSlug"
                                params={{ districtSlug: "madurai" }}
                                onClick={() => setDestMenuOpen(false)}
                                className="group p-2.5 rounded-xl bg-white border border-sky-100 shadow-sm hover:border-sky-300 transition flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm">🛕</span>
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">Culture & Spot</span>
                                  </div>
                                  <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-sky-600 mt-1">Madurai Heritage</h4>
                                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">Meenakshi Amman & Nayak Palace</p>
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
                                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-sky-700">
                                      <Icon className="size-3.5 text-sky-600" />
                                      <span>{cat.title}</span>
                                    </span>
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-mono text-slate-500">
                                      {cat.badge}
                                    </span>
                                  </div>

                                  <div className="flex flex-col gap-1 mt-1">
                                    {cat.items.map((item) => (
                                      <Link
                                        key={item.label}
                                        to={item.to}
                                        onClick={() => setDestMenuOpen(false)}
                                        className="group flex flex-col rounded-xl p-2 hover:bg-sky-50 transition"
                                      >
                                        <span className="text-xs font-bold text-slate-800 group-hover:text-sky-600 transition-colors flex items-center justify-between">
                                          <span>{item.label}</span>
                                          <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-sky-600">→</span>
                                        </span>
                                        <span className="text-[10px] text-slate-500 truncate mt-0.5">{item.subtitle}</span>
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
                    className={cn(
                      "relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors duration-200 outline-none shrink-0 select-none",
                      pathname === "/explore" ? "text-white font-bold" : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    {pathname === "/explore" && (
                      <motion.div
                        layoutId="explore-tn-active-pill"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                          mass: 0.9,
                        }}
                        className="absolute inset-0 rounded-full bg-sky-500 shadow-sm"
                      />
                    )}
                    <Map className={cn("size-3.5 relative z-10 shrink-0", pathname === "/explore" ? "text-white" : "text-sky-600")} />
                    <span className="relative z-10">{lang === "ta" ? "வரைபட உலா" : "Map Explorer"}</span>
                  </Link>

                  {/* 3. Trails & Routes */}
                  <Link
                    to="/routes"
                    className={cn(
                      "relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors duration-200 outline-none shrink-0 select-none",
                      pathname === "/routes" ? "text-white font-bold" : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    {pathname === "/routes" && (
                      <motion.div
                        layoutId="explore-tn-active-pill"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                          mass: 0.9,
                        }}
                        className="absolute inset-0 rounded-full bg-sky-500 shadow-sm"
                      />
                    )}
                    <Route className={cn("size-3.5 relative z-10 shrink-0", pathname === "/routes" ? "text-white" : "text-sky-600")} />
                    <span className="relative z-10">{lang === "ta" ? "பயணப் பாதைகள்" : "Trails & Routes"}</span>
                  </Link>

                  {/* 4. Travel Guides */}
                  <Link
                    to="/community"
                    className={cn(
                      "relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors duration-200 outline-none shrink-0 select-none",
                      pathname === "/community" ? "text-white font-bold" : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    {pathname === "/community" && (
                      <motion.div
                        layoutId="explore-tn-active-pill"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                          mass: 0.9,
                        }}
                        className="absolute inset-0 rounded-full bg-sky-500 shadow-sm"
                      />
                    )}
                    <Users className={cn("size-3.5 relative z-10 shrink-0", pathname === "/community" ? "text-white" : "text-slate-500")} />
                    <span className="relative z-10">{lang === "ta" ? "வழிகாட்டிகள்" : "Travel Guides"}</span>
                  </Link>

                  {/* 5. Events & Festivals */}
                  <Link
                    to="/events"
                    className={cn(
                      "relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors duration-200 outline-none shrink-0 select-none",
                      pathname === "/events" ? "text-white font-bold" : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    {pathname === "/events" && (
                      <motion.div
                        layoutId="explore-tn-active-pill"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                          mass: 0.9,
                        }}
                        className="absolute inset-0 rounded-full bg-sky-500 shadow-sm"
                      />
                    )}
                    <CalendarDays className={cn("size-3.5 relative z-10 shrink-0", pathname === "/events" ? "text-white" : "text-sky-600")} />
                    <span className="relative z-10">{lang === "ta" ? "நிகழ்வுகள்" : "Events"}</span>
                  </Link>
                </nav>
              </LayoutGroup>
            </div>

        {/* Right Utility Section & Primary Action CTA */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search Trigger Button */}
          <button
            type="button"
            onClick={onSearch}
            className={cn(
              "hidden xl:flex h-9 items-center gap-2 rounded-full border px-3 text-xs transition cursor-pointer shrink-0",
              !scrolled
                ? "border-white/30 bg-white/20 text-slate-700 hover:bg-white/40"
                : "border-slate-200 bg-slate-50 text-slate-500 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
            )}
          >
            <Search className="size-3.5 text-slate-500" />
            <span className="font-medium">{lang === "ta" ? "தேடுக..." : "Search..."}</span>
            <kbd className={cn("rounded px-1.5 py-0.5 text-[10px] font-mono border", !scrolled ? "bg-white/60 text-slate-600 border-white/50" : "bg-white text-slate-500 border-slate-200")}>
              {typeof navigator !== "undefined" && /Mac/i.test(navigator.platform || "") ? "⌘K" : "Ctrl K"}
            </kbd>
          </button>

          {/* Language Switcher Toggle (தமிழ் / English) */}
          <button
            type="button"
            onClick={toggleLanguage}
            className={cn(
              "hidden sm:flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold transition shrink-0 cursor-pointer",
              !scrolled
                ? "border-white/30 bg-white/20 text-sky-800 hover:bg-white/40"
                : "border-sky-100 bg-sky-50 text-sky-700 hover:bg-sky-100"
            )}
            title="Switch Language / மொழியை மாற்றுக"
          >
            <Languages className="size-3 text-sky-600" />
            <span>{lang === "en" ? "தமிழ்" : "EN"}</span>
          </button>

          {/* Plan Route Button */}
          <Link
            to="/routes"
            className="hidden md:flex items-center gap-1.5 rounded-full bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-extrabold text-white transition shadow-sm shadow-sky-600/20 shrink-0"
          >
            <Route className="size-3.5" />
            <span>{lang === "ta" ? "திட்டமிடு" : "Plan Route"}</span>
          </Link>

          {/* Saved Places Icon */}
          <Link
            to="/saved"
            className={cn(
              "hidden sm:flex items-center justify-center size-9 rounded-full border transition shrink-0 shadow-sm cursor-pointer",
              !scrolled
                ? "border-white/30 bg-white/20 text-slate-700 hover:bg-white/40 hover:text-sky-600"
                : pathname === "/saved"
                ? "border-sky-300 bg-sky-50 text-sky-600 ring-2 ring-sky-500/20"
                : "border-slate-200 bg-white text-slate-600 hover:text-sky-600 hover:border-sky-300 hover:bg-sky-50"
            )}
            title={lang === "ta" ? "சேமித்த இடங்கள்" : "Saved Places"}
          >
            <Bookmark className="size-4" />
          </Link>

          {/* Notification Bell Icon & Popover (Notification-2) */}
          <div ref={notificationRef} className="relative hidden sm:inline-block">
            <button
              type="button"
              onClick={() => setNotificationOpen((prev) => !prev)}
              className={cn(
                "relative flex items-center justify-center size-9 rounded-full border transition shrink-0 shadow-sm cursor-pointer",
                !scrolled
                  ? "border-white/30 bg-white/20 text-slate-700 hover:bg-white/40 hover:text-sky-600"
                  : notificationOpen
                  ? "border-sky-300 bg-sky-50 text-sky-600 ring-2 ring-sky-500/20"
                  : "border-slate-200 bg-white text-slate-600 hover:text-sky-600 hover:border-sky-300 hover:bg-sky-50"
              )}
              title="Travel Alerts & Notifications"
              aria-label="Travel Alerts & Notifications"
            >
              <Bell className="size-4" />
              {/* Unread indicator pulse badge */}
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-sky-500 ring-2 ring-white animate-pulse" />
            </button>

            {/* Notification2 Dropdown Menu */}
            <AnimatePresence>
              {notificationOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-full mt-2.5 w-[380px] sm:w-[410px] z-50 shadow-2xl rounded-3xl"
                >
                  <Notification2
                    heading="Tamil Nadu Updates"
                    updates={explorerNotifications}
                    className="p-0"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Account Settings Mega Icon & Dropdown */}
          <div
            className="relative hidden md:inline-block"
            onMouseEnter={handleMouseEnterSettings}
            onMouseLeave={handleMouseLeaveSettings}
          >
            <Link
              to="/settings"
              className={cn(
                "flex items-center justify-center size-9 rounded-full border transition shrink-0 shadow-sm cursor-pointer",
                !scrolled
                  ? "border-white/30 bg-white/20 text-slate-700 hover:bg-white/40 hover:text-sky-600"
                  : pathname.startsWith("/settings") || settingsMenuOpen
                  ? "border-sky-300 bg-sky-50 text-sky-600 ring-2 ring-sky-500/20"
                  : "border-slate-200 bg-white text-slate-600 hover:text-sky-600 hover:border-sky-300 hover:bg-sky-50"
              )}
              title="Settings & Controls"
              aria-label="Settings & Controls"
            >
              <Settings className="size-4 text-slate-600 hover:text-sky-600 transition" />
            </Link>

            {/* Settings Mega Dropdown Popover */}
            <AnimatePresence>
              {settingsMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-full mt-2.5 w-[580px] rounded-3xl border border-sky-100 bg-white/98 backdrop-blur-2xl p-5 shadow-2xl z-50 text-slate-800"
                >
                  {/* Top Header: User Identity / Account Banner */}
                  {currentUser ? (
                    <div className="rounded-2xl bg-gradient-to-r from-sky-50/80 via-white to-sky-50/50 p-3.5 border border-sky-100 mb-3.5 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative size-11 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 text-white font-black flex items-center justify-center text-sm shadow-md shrink-0">
                            {initials}
                            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-400 ring-2 ring-white" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm text-slate-900 truncate">{currentUser.name}</h4>
                              <span className="px-2 py-0.5 bg-sky-100 text-sky-700 text-[9px] font-mono font-bold rounded-full border border-sky-200 shrink-0 uppercase">
                                {currentUser.role?.replace("_", " ") || "EXPLORER"}
                              </span>
                            </div>
                            <p className="text-[11px] font-mono text-slate-500 truncate mt-0.5">{currentUser.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            to="/settings"
                            onClick={() => setSettingsMenuOpen(false)}
                            className="text-[11px] font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-full border border-sky-200 transition"
                          >
                            Full Settings →
                          </Link>
                          <button
                            type="button"
                            onClick={handleLogOut}
                            className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-full border border-rose-200 transition cursor-pointer"
                            title="Log Out"
                          >
                            <LogOut className="size-3.5 text-rose-500" />
                            <span>Log Out</span>
                          </button>
                        </div>
                      </div>

                      {/* Admin Quick Jump if super_admin / admin */}
                      {isAdminUser(currentUser) && (
                        <div className="mt-2.5 pt-2 border-t border-sky-100/80">
                          <Link
                            to="/admin"
                            onClick={() => setSettingsMenuOpen(false)}
                            className="flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-extrabold bg-sky-500 text-white hover:bg-sky-600 transition shadow-xs"
                          >
                            <div className="flex items-center gap-2">
                              <LayoutDashboard className="size-3.5" />
                              <span>Go to Admin Dashboard</span>
                            </div>
                            <span className="text-[9px] font-mono uppercase bg-white/20 text-white px-1.5 py-0.5 rounded font-black">
                              CONTROL
                            </span>
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-gradient-to-r from-sky-100 via-sky-50 to-blue-50 p-3.5 border border-sky-200 mb-3.5 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="grid size-10 place-items-center rounded-xl bg-sky-500 text-white font-black shadow-md">
                            <User className="size-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900">Explorer Account</h4>
                            <p className="text-[10px] text-slate-500">Save trips, custom routes & sync preferences</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSettingsMenuOpen(false);
                              openAuthModal("Sign in to save your trip plans, preferences, and personal collections.");
                            }}
                            className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-xs"
                          >
                            <LogIn className="size-3.5 text-sky-600" />
                            <span>Sign In</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSettingsMenuOpen(false);
                              openAuthModal("Create an account to save your personalized AI route plans and unlock trails.");
                            }}
                            className="flex items-center gap-1.5 rounded-xl bg-sky-500 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-sky-600 transition cursor-pointer shadow-md shadow-sky-500/20"
                          >
                            <UserPlus className="size-3.5" />
                            <span>Sign Up</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Settings 2-Column Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Column 1: PROFILE, IDENTITY & TRAVEL ENGINE */}
                    <div className="space-y-4">
                      {/* IDENTITY & EXPLORER PASSPORT */}
                      <div>
                        <div className="px-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          EXPLORER PROFILE & PASSPORT
                        </div>
                        <div className="space-y-0.5">
                          <Link
                            to="/settings"
                            search={{ tab: "profile" }}
                            onClick={() => setSettingsMenuOpen(false)}
                            className="flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                          >
                            <div className="flex items-center gap-2.5">
                              <User className="size-3.5 text-sky-600" />
                              <span>Explorer Passport & Bio</span>
                            </div>
                            <span className="text-[9px] font-mono font-bold bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-full border border-sky-200">
                              Level 4
                            </span>
                          </Link>
                          <Link
                            to="/profile"
                            onClick={() => setSettingsMenuOpen(false)}
                            className="flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                          >
                            <div className="flex items-center gap-2.5">
                              <Award className="size-3.5 text-amber-500" />
                              <span>My Badges & Milestones</span>
                            </div>
                            <ChevronRight className="size-3 text-slate-400" />
                          </Link>
                          <Link
                            to="/settings"
                            search={{ tab: "preferences" }}
                            onClick={() => setSettingsMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                          >
                            <Compass className="size-3.5 text-sky-600" />
                            <span>Travel Style & Base Location</span>
                          </Link>
                          <Link
                            to="/saved"
                            onClick={() => setSettingsMenuOpen(false)}
                            className="flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                          >
                            <div className="flex items-center gap-2.5">
                              <Bookmark className="size-3.5 text-sky-600" />
                              <span>Saved Places & Collections</span>
                            </div>
                            <ChevronRight className="size-3 text-slate-400" />
                          </Link>
                        </div>
                      </div>

                      {/* TRAVEL ENGINE PREFERENCES */}
                      <div>
                        <div className="px-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          TRAVEL ENGINE PREFERENCES
                        </div>
                        <div className="space-y-0.5">
                          <Link
                            to="/settings"
                            search={{ tab: "ai_planner" }}
                            onClick={() => setSettingsMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                          >
                            <Bot className="size-3.5 text-sky-600" />
                            <span>AI Planner & Route Engine</span>
                          </Link>
                          <Link
                            to="/settings"
                            search={{ tab: "trips_routes" }}
                            onClick={() => setSettingsMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                          >
                            <Route className="size-3.5 text-sky-600" />
                            <span>Offline Route Downloads</span>
                          </Link>
                          <Link
                            to="/settings"
                            search={{ tab: "map_prefs" }}
                            onClick={() => setSettingsMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                          >
                            <Map className="size-3.5 text-sky-600" />
                            <span>Map Layers (3D & Satellite)</span>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: SAFETY & PRIVACY, APP & OTHER */}
                    <div className="space-y-4">
                      {/* SAFETY & PRIVACY */}
                      <div>
                        <div className="px-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          SAFETY & SECURITY
                        </div>
                        <div className="space-y-0.5">
                          <Link
                            to="/settings"
                            search={{ tab: "security" }}
                            onClick={() => setSettingsMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                          >
                            <Lock className="size-3.5 text-sky-600" />
                            <span>Account Security & Password</span>
                          </Link>
                          <Link
                            to="/settings"
                            search={{ tab: "safety_alerts" }}
                            onClick={() => setSettingsMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                          >
                            <ShieldAlert className="size-3.5 text-rose-500" />
                            <span>Safety Alerts & Ghats</span>
                          </Link>
                          <Link
                            to="/settings"
                            search={{ tab: "location_privacy" }}
                            onClick={() => setSettingsMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                          >
                            <MapPin className="size-3.5 text-sky-600" />
                            <span>Location & Privacy</span>
                          </Link>
                        </div>
                      </div>

                      {/* APP & OTHER */}
                      <div>
                        <div className="px-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          APP & SUPPORT
                        </div>
                        <div className="space-y-0.5">
                          <Link
                            to="/settings"
                            search={{ tab: "notifications" }}
                            onClick={() => setSettingsMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                          >
                            <Bell className="size-3.5 text-sky-600" />
                            <span>Notifications</span>
                          </Link>
                          <Link
                            to="/settings"
                            search={{ tab: "language_region" }}
                            onClick={() => setSettingsMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                          >
                            <Globe className="size-3.5 text-sky-600" />
                            <span>Language & Region</span>
                          </Link>
                          <Link
                            to="/settings"
                            search={{ tab: "connected_accounts" }}
                            onClick={() => setSettingsMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                          >
                            <CreditCard className="size-3.5 text-sky-600" />
                            <span>Payments & Accounts</span>
                          </Link>
                          <Link
                            to="/support"
                            onClick={() => setSettingsMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                          >
                            <HelpCircle className="size-3.5 text-sky-600" />
                            <span>Help & Traveler Support</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden rounded-full size-9 border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
            onClick={() => setOpen((o) => !o)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </nav>
    </div>

      {/* Structured Mobile Drawer */}
      {open && (
        <div className="mx-auto mt-3 max-w-[1400px] rounded-3xl p-5 lg:hidden border border-slate-200 bg-white/98 backdrop-blur-2xl text-slate-900 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
          <div className="text-[10px] font-mono font-bold text-sky-600 uppercase tracking-wider mb-2">
            {lang === "ta" ? "பயண வழிசெலுத்தல்" : "TRAVEL NAVIGATION"}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/madurai"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 hover:border-sky-300"
            >
              <Landmark className="size-4 text-sky-600" />
              <span>{lang === "ta" ? "மாவட்டங்கள்" : "Destinations"}</span>
            </Link>
            <Link
              to="/explore"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 hover:border-sky-300"
            >
              <Map className="size-4 text-sky-600" />
              <span>{lang === "ta" ? "வரைபட உலா" : "Map Explorer"}</span>
            </Link>
            <Link
              to="/routes"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 hover:border-sky-300"
            >
              <Route className="size-4 text-sky-600" />
              <span>{lang === "ta" ? "பயணப் பாதைகள்" : "Trails & Routes"}</span>
            </Link>
            <Link
              to="/community"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 hover:border-sky-300"
            >
              <Users className="size-4 text-slate-500" />
              <span>{lang === "ta" ? "வழிகாட்டிகள்" : "Travel Guides"}</span>
            </Link>
            <Link
              to="/events"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 hover:border-sky-300"
            >
              <CalendarDays className="size-4 text-sky-600" />
              <span>{lang === "ta" ? "நிகழ்வுகள் & திருவிழாக்கள்" : "Events"}</span>
            </Link>
            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 col-span-2"
            >
              <Settings className="size-4 text-sky-600" />
              <span>{lang === "ta" ? "கணக்கு அமைப்புகள் & கட்டுப்பாடுகள்" : "Account Settings & Preferences"}</span>
            </Link>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 pt-3">
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-2 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700 hover:bg-sky-100 transition"
            >
              <Languages className="size-4 text-sky-600" />
              <span>{lang === "en" ? "தமிழ் பதிப்பு" : "English Version"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setDistrictsModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-slate-100 border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
            >
              <Grid className="size-3.5 text-slate-600" />
              <span>{lang === "ta" ? "38 மாவட்டங்கள்" : "38 Districts"}</span>
            </button>

            <Link
              to="/routes"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-xs font-extrabold text-white shadow-sm shadow-sky-600/20"
            >
              <Route className="size-3.5" />
              <span>{lang === "ta" ? "திட்டமிடு" : "Plan Route"}</span>
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
  const { user, openAuthModal } = useAuthGuard();

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
      className="fixed inset-x-3 bottom-3 z-50 flex items-center justify-around rounded-2xl px-2 py-2 sm:hidden bg-white/95 backdrop-blur-[24px] border border-sky-100 shadow-xl text-slate-600"
      aria-label="Mobile Bottom Bar"
    >
      {[
        { to: "/", label: "Home", icon: Compass, isActive: pathname === "/" },
        { to: "/explore", label: "Explore", icon: Map, isActive: isExploreActive },
        { to: "/routes", label: "Routes", icon: Route, isActive: pathname === "/routes" },
        { to: "/planner", label: "AI Planner", icon: Sparkles, isActive: pathname === "/planner" },
      ].map((l) => {
        const Icon = l.icon;
        return (
          <Link
            key={l.to}
            to={l.to}
            className={cn(
              "flex min-h-11 min-w-16 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-[11px] font-medium transition-colors",
              l.isActive
                ? "text-sky-600 font-bold"
                : "text-slate-500 hover:text-sky-600",
            )}
          >
            <Icon className="size-5" aria-hidden />
            {l.label}
          </Link>
        );
      })}

      {/* Account / Login Tab */}
      <button
        type="button"
        onClick={() => {
          if (!user) {
            openAuthModal("Sign in to access your personal profile, trips, and custom explorer preferences.");
          } else {
            window.location.href = "/settings";
          }
        }}
        className={cn(
          "flex min-h-11 min-w-16 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer",
          pathname === "/settings"
            ? "text-sky-600 font-bold"
            : "text-slate-500 hover:text-sky-600"
        )}
      >
        {user ? (
          <User className="size-5" aria-hidden />
        ) : (
          <LogIn className="size-5 text-sky-600" aria-hidden />
        )}
        <span>{user ? "Account" : "Log In"}</span>
      </button>
    </nav>
  );
}
