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
  Mic,
  Server,
  Flame,
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
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { ProfileMenu } from "@/components/site/profile-menu";
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

// Explore Dropdown Content Items
const EXPLORE_CATEGORIES = [
  { to: "/explore", label: "All Places", icon: Compass },
  { to: "/explore", search: "?category=adventure", label: "Adventures", icon: Footprints },
  { to: "/explore", search: "?category=mountain&trekking=true", label: "Trekking", icon: Mountain },
  { to: "/explore", search: "?category=waterfall", label: "Waterfalls", icon: CloudRain },
  { to: "/explore", search: "?category=mountain", label: "Hills & Viewpoints", icon: Mountain },
  { to: "/explore", search: "?category=coastal", label: "Beaches", icon: Waves },
  { to: "/explore", search: "?category=temple", label: "Temples", icon: Landmark },
  { to: "/explore", search: "?category=lake", label: "Lakes", icon: Waves },
  { to: "/explore", search: "?category=heritage", label: "Heritage", icon: Landmark },
  { to: "/explore", search: "?category=food", label: "Food", icon: Utensils },
  { to: "/explore", search: "?tag=hidden", label: "Hidden Places", icon: Sparkles },
  { to: "/explore", search: "?tag=rural", label: "Rural Experiences", icon: Trees },
];

export function FloatingNav({ onSearch }: { onSearch?: () => void }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [exploreMenuOpen, setExploreMenuOpen] = useState(false);
  const [isBackendLive, setIsBackendLive] = useState(false);
  const { dark, toggle } = useTheme();

  const menuTimeoutRef = useRef<any>(null);

  const pathname = location.pathname;

  // Active check for Explore hierarchy
  const isExploreActive =
    pathname === "/explore" ||
    pathname === "/discover" ||
    pathname === "/madurai" ||
    pathname === "/theni" ||
    pathname === "/hills-of-tn" ||
    pathname === "/western-ghats" ||
    pathname === "/coastal-heritage" ||
    pathname === "/hill-escapes";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    checkBackendHealth().then((isOnline) => setIsBackendLive(isOnline));
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleMouseEnterExplore = () => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setExploreMenuOpen(true);
  };

  const handleMouseLeaveExplore = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setExploreMenuOpen(false);
    }, 150);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-7 sm:pt-6 font-sans">
      <nav
        className={cn(
          "mx-auto flex h-[72px] max-w-[1400px] items-center justify-between gap-6 rounded-full px-7 transition-all duration-300 backdrop-blur-[24px]",
          scrolled
            ? "bg-white/90 dark:bg-[#121821]/85 border border-slate-200 dark:border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
            : "bg-white/80 dark:bg-[#121821]/72 border border-slate-200 dark:border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
        )}
        aria-label="Main Navigation"
      >
        {/* Left: Brand Logo & API Status */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/" className="flex items-center gap-2.5" aria-label="ExplorerTN home">
            <span className="grid size-10 place-items-center rounded-2xl bg-emerald-600 dark:bg-emerald-500 text-white dark:text-black font-black shadow-lg shadow-emerald-500/20">
              <Compass className="size-6 text-white dark:text-black" aria-hidden />
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              Explorer<span className="text-emerald-600 dark:text-emerald-400">TN</span>
            </span>
          </Link>

          {isBackendLive && (
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs rounded-full font-mono font-bold">
              <Server className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>API Live</span>
            </div>
          )}
        </div>

        {/* Center: Primary Navigation */}
        <div className="hidden items-center gap-1.5 lg:flex">
          {/* 1. Explore Popover Menu */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnterExplore}
            onMouseLeave={handleMouseLeaveExplore}
          >
            <Link
              to="/explore"
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white",
                isExploreActive
                  ? "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/30"
                  : "text-slate-600 dark:text-[#A1A8B3]",
              )}
            >
              <Compass className="size-4" />
              <span>Explore</span>
              <ChevronDown className={`size-3.5 transition-transform ${exploreMenuOpen ? "rotate-180 text-emerald-400" : ""}`} />
            </Link>

            {/* Explore Hover/Click Dropdown Popover */}
            <AnimatePresence>
              {exploreMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="absolute top-full left-0 mt-3 w-[520px] rounded-3xl border border-slate-200 dark:border-white/15 bg-white/95 dark:bg-[#121821]/95 backdrop-blur-2xl p-5 shadow-2xl z-50 text-slate-900 dark:text-white"
                >
                  <div>
                    <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-1">
                      <Compass className="size-3" /> DISCOVER TAMIL NADU
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {EXPLORE_CATEGORIES.map((c) => {
                        const Icon = c.icon;
                        return (
                          <Link
                            key={c.label}
                            to={c.to}
                            onClick={() => setExploreMenuOpen(false)}
                            className="flex items-center gap-2 p-2.5 rounded-2xl border border-transparent hover:border-emerald-500/20 hover:bg-emerald-500/5 transition text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400"
                          >
                            <Icon className="size-4 text-emerald-500 shrink-0" />
                            <span className="truncate">{c.label}</span>
                          </Link>
                        );
                      })}
                    </div>

                    <div className="mt-4 border-t border-slate-200 dark:border-white/10 pt-3">
                      <Link
                        to="/discover"
                        onClick={() => setExploreMenuOpen(false)}
                        className="flex items-center justify-between w-full p-3 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold text-xs hover:bg-emerald-500/20 transition group"
                      >
                        <span className="flex items-center gap-2">
                          <Map className="size-4 text-emerald-500" />
                          <span>🗺️ Explore on Interactive Map</span>
                        </span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">→</span>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. Routes */}
          <Link
            to="/routes"
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-slate-600 dark:text-[#A1A8B3] transition-all hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
            activeProps={{ className: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/30" }}
          >
            <Route className="size-4" />
            <span>Routes</span>
          </Link>

          {/* 3. Adventures */}
          <Link
            to="/adventures"
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-slate-600 dark:text-[#A1A8B3] transition-all hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
            activeProps={{ className: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/30" }}
          >
            <Footprints className="size-4" />
            <span>Adventures</span>
          </Link>

          {/* 4. AI Planner */}
          <Link
            to="/planner"
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-slate-600 dark:text-[#A1A8B3] transition-all hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
            activeProps={{ className: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/30" }}
          >
            <Sparkles className="size-4 text-emerald-500" />
            <span>AI Planner</span>
          </Link>

          {/* 5. Community */}
          <Link
            to="/community"
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-slate-600 dark:text-[#A1A8B3] transition-all hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
            activeProps={{ className: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/30" }}
          >
            <Users className="size-4" />
            <span>Community</span>
          </Link>
        </div>

        {/* Right Section: Search Bar & Profile Controls */}
        <div className="flex items-center gap-3 ml-auto shrink-0">
          {/* Search Bar */}
          <motion.button
            type="button"
            onClick={onSearch}
            initial={{ width: 240 }}
            whileHover={{ width: 300 }}
            whileFocus={{ width: 300 }}
            transition={{ type: "spring", stiffness: 250, damping: 24 }}
            className="hidden md:flex h-[46px] items-center justify-between gap-3 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121821]/72 px-4 backdrop-blur-[24px] shadow-sm transition-all hover:border-emerald-500/50 hover:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] cursor-pointer group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Search className="size-4 text-slate-400 dark:text-[#A1A8B3] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shrink-0" aria-hidden />
              <span className="truncate text-xs font-medium text-slate-500 dark:text-[#A1A8B3] group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                Search places & routes...
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <kbd className="inline-flex items-center rounded-md border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:text-[#A1A8B3]">
                ⌘ K
              </kbd>
            </div>
          </motion.button>

          {/* Mobile Search Button */}
          <button
            type="button"
            onClick={onSearch}
            className="flex md:hidden size-10 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121821]/72 backdrop-blur-[24px] text-slate-600 dark:text-[#A1A8B3] hover:text-slate-900 dark:hover:text-white"
            aria-label="Search"
          >
            <Search className="size-4" />
          </button>

          {/* Utility Controls & Profile Menu */}
          <div className="hidden items-center gap-2 sm:flex">
            {isAdminUser(getCurrentAuthUser()) && (
              <Link
                to="/admin"
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs rounded-full font-mono font-bold hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-black transition"
              >
                <Shield className="size-3.5" />
                <span>Admin</span>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full size-10 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121821]/50 text-slate-600 dark:text-[#A1A8B3] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 shadow-sm"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full size-10 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121821]/50 text-slate-600 dark:text-[#A1A8B3] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 shadow-sm cursor-pointer"
              onClick={toggle}
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-slate-700" />}
            </Button>

            <ProfileMenu dark={dark} toggleTheme={toggle} />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden rounded-full size-10 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121821]/50"
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
        <div className="mx-auto mt-3 max-w-[1400px] rounded-3xl p-5 lg:hidden border border-slate-200 dark:border-white/15 shadow-2xl bg-white/95 dark:bg-[#121821]/95 backdrop-blur-[24px] text-slate-900 dark:text-white space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Primary Navigation */}
          <div>
            <div className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
              Primary Navigation
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { to: "/explore", label: "Explore", icon: Map },
                { to: "/routes", label: "Routes", icon: Route },
                { to: "/adventures", label: "Adventures", icon: Footprints },
                { to: "/planner", label: "AI Planner", icon: Sparkles },
                { to: "/community", label: "Community", icon: Users },
              ].map((l) => {
                const Icon = l.icon;
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10"
                    activeProps={{ className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" }}
                  >
                    <Icon className="size-4 text-emerald-500" />
                    <span>{l.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <hr className="border-slate-200 dark:border-white/10" />

          {/* Discover Collections */}
          <div>
            <div className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
              Discover Destinations
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {DISCOVER_COLLECTIONS.map((c) => {
                const Icon = c.icon;
                return (
                  <Link
                    key={c.to}
                    to={c.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                  >
                    <Icon className="size-3.5 text-emerald-500" />
                    <span>{c.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <hr className="border-slate-200 dark:border-white/10" />

          {/* Experiences */}
          <div>
            <div className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
              Experiences
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {EXPERIENCE_ITEMS.map((exp) => {
                const Icon = exp.icon;
                return (
                  <Link
                    key={exp.label}
                    to={exp.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-1.5 p-2 rounded-xl text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                  >
                    <Icon className="size-3.5 text-emerald-500" />
                    <span>{exp.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <hr className="border-slate-200 dark:border-white/10" />

          <button
            type="button"
            onClick={toggle}
            className="flex w-full items-center justify-between rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/5"
          >
            <span className="flex items-center gap-2">
              {dark ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-slate-700" />}
              {dark ? "Light mode" : "Dark mode"}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Toggle</span>
          </button>
        </div>
      )}
    </header>
  );
}

export function MobileTabBar() {
  const location = useLocation();
  const pathname = location.pathname;

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
      className="fixed inset-x-3 bottom-3 z-50 flex items-center justify-around rounded-2xl px-2 py-2 sm:hidden bg-white/90 dark:bg-[#121821]/90 backdrop-blur-[24px] border border-slate-200 dark:border-white/15 shadow-lg"
      aria-label="Mobile Bottom Bar"
    >
      {[
        { to: "/", label: "Home", icon: Compass, isActive: pathname === "/" },
        { to: "/explore", label: "Explore", icon: Map, isActive: isExploreActive },
        { to: "/routes", label: "Routes", icon: Route, isActive: pathname === "/routes" },
        { to: "/planner", label: "AI Planner", icon: Sparkles, isActive: pathname === "/planner" },
        { to: "/community", label: "Community", icon: Users, isActive: pathname === "/community" },
      ].map((l) => {
        const Icon = l.icon;
        return (
          <Link
            key={l.to}
            to={l.to}
            className={cn(
              "flex min-h-11 min-w-16 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-[11px] font-medium transition-colors",
              l.isActive
                ? "text-emerald-600 dark:text-emerald-400 font-bold"
                : "text-slate-600 dark:text-muted-foreground",
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
