import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Compass, Map, Route, Sparkles, Users, Bell, Search, Menu, Sun, Moon, Mic, Server, Flame, Mountain, Landmark } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ProfileMenu } from "@/components/site/profile-menu";
import { cn } from "@/lib/utils";
import { checkBackendHealth } from "@/lib/api";

const links = [
  { to: "/explore", label: "Explore", icon: Map },
  { to: "/routes", label: "Routes", icon: Route },
  { to: "/western-ghats", label: "Western Ghats", icon: Mountain },
  { to: "/madurai", label: "Madurai", icon: Landmark },
  { to: "/hill-escapes", label: "Hills", icon: Mountain },
  { to: "/coastal-heritage", label: "Coastal", icon: Compass },
  { to: "/theni", label: "Theni", icon: Flame },
  { to: "/planner", label: "AI Planner", icon: Sparkles },
];

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

export function FloatingNav({ onSearch }: { onSearch?: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [isBackendLive, setIsBackendLive] = useState(false);
  const { dark, toggle } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    checkBackendHealth().then((isOnline) => setIsBackendLive(isOnline));
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

        {/* Center: Navigation Links */}
        <div className="hidden items-center gap-2 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 dark:text-[#A1A8B3] transition-all hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
              activeProps={{ className: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/30" }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right Section: Search Bar & Profile Hover Menu */}
        <div className="flex items-center gap-3 ml-auto shrink-0">
          {/* Search Bar */}
          <motion.button
            type="button"
            onClick={onSearch}
            initial={{ width: 280 }}
            whileHover={{ width: 360 }}
            whileFocus={{ width: 360 }}
            transition={{ type: "spring", stiffness: 250, damping: 24 }}
            className="hidden md:flex h-[52px] items-center justify-between gap-3 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121821]/72 px-4 backdrop-blur-[24px] shadow-sm transition-all hover:border-emerald-500/50 hover:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Search className="size-5 text-slate-400 dark:text-[#A1A8B3] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shrink-0" aria-hidden />
              <span className="truncate text-sm font-medium text-slate-500 dark:text-[#A1A8B3] group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                Search waterfalls, routes, tea estates...
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <kbd className="inline-flex items-center rounded-lg border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-white/5 px-2 py-0.5 text-xs font-mono text-slate-500 dark:text-[#A1A8B3]">
                ⌘ K
              </kbd>
              <Mic className="size-4 text-slate-400 dark:text-[#A1A8B3] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-opacity" />
            </div>
          </motion.button>

          {/* Mobile Search Button */}
          <button
            type="button"
            onClick={onSearch}
            className="flex md:hidden size-11 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121821]/72 backdrop-blur-[24px] text-slate-600 dark:text-[#A1A8B3] hover:text-slate-900 dark:hover:text-white"
            aria-label="Search"
          >
            <Search className="size-5" />
          </button>

          {/* Controls & Profile Menu */}
          <div className="hidden items-center gap-2 sm:flex">
            <Button variant="ghost" size="icon" className="rounded-full size-11 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121821]/50 text-slate-600 dark:text-[#A1A8B3] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 shadow-sm" aria-label="Notifications">
              <Bell className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full size-11 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121821]/50 text-slate-600 dark:text-[#A1A8B3] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 shadow-sm" onClick={toggle} aria-label="Toggle theme">
              {dark ? <Sun className="size-5 text-amber-400" /> : <Moon className="size-5 text-slate-700" />}
            </Button>

            <ProfileMenu dark={dark} toggleTheme={toggle} />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden rounded-full size-11 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121821]/50"
            onClick={() => setOpen((o) => !o)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {open && (
        <div className="mx-auto mt-3 max-w-[1400px] rounded-3xl p-4 lg:hidden border border-slate-200 dark:border-white/15 shadow-xl bg-white/95 dark:bg-[#121821]/95 backdrop-blur-[24px] text-slate-900 dark:text-white">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-bold text-slate-600 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
              activeProps={{ className: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" }}
            >
              <l.icon className="size-5" aria-hidden />
              {l.label}
            </Link>
          ))}
          <button
            onClick={toggle}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-base font-bold text-slate-600 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            {dark ? "Light mode" : "Dark mode"}
          </button>
        </div>
      )}
    </header>
  );
}

export function MobileTabBar() {
  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-50 flex items-center justify-around rounded-2xl px-2 py-2 sm:hidden bg-white/90 dark:bg-[#121821]/90 backdrop-blur-[24px] border border-slate-200 dark:border-white/15 shadow-lg"
      aria-label="Mobile"
    >
      {[{ to: "/", label: "Home", icon: Compass }, ...links.slice(0, 3)].map((l) => (
        <Link
          key={l.to}
          to={l.to}
          className="flex min-h-11 min-w-16 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-muted-foreground"
          activeProps={{ className: "text-emerald-600 dark:text-emerald-400 font-bold" }}
        >
          <l.icon className="size-5" aria-hidden />
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
