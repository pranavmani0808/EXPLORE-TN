import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Compass, Map, Route, Sparkles, Users, Bell, Search, Menu, Sun, Moon, Mic, Server } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ProfileMenu } from "@/components/site/profile-menu";
import { cn } from "@/lib/utils";
import { checkBackendHealth } from "@/lib/api";

const links = [
  { to: "/explore", label: "Explore", icon: Map },
  { to: "/routes", label: "Routes", icon: Route },
  { to: "/planner", label: "AI Planner", icon: Sparkles },
  { to: "/community", label: "Community", icon: Users },
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
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-7 sm:pt-6">
      <nav
        className={cn(
          "mx-auto flex h-[72px] max-w-[1400px] items-center justify-between gap-6 rounded-full px-7 transition-all duration-300",
          scrolled
            ? "bg-[#121821]/85 backdrop-blur-[24px] border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
            : "bg-[#121821]/72 backdrop-blur-[24px] border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
        )}
        aria-label="Main Navigation"
      >
        {/* Left: Brand Logo & API Status */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/" className="flex items-center gap-2.5" aria-label="ExplorerTN home">
            <span className="grid size-10 place-items-center rounded-2xl bg-emerald-500 text-black font-black shadow-lg shadow-emerald-500/20">
              <Compass className="size-6 text-black" aria-hidden />
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-white">
              Explorer<span className="text-gradient">TN</span>
            </span>
          </Link>

          {isBackendLive && (
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs rounded-full font-mono">
              <Server className="size-3.5 text-emerald-400" />
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
              className="rounded-full px-4 py-2 text-sm font-semibold text-[#A1A8B3] transition-all hover:bg-white/10 hover:text-white"
              activeProps={{ className: "bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30" }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right Section: Apple Spotlight Search Bar & Profile Hover Menu */}
        <div className="flex items-center gap-3 ml-auto shrink-0">
          {/* Framer Motion Spring Expandable Search Bar */}
          <motion.button
            type="button"
            onClick={onSearch}
            initial={{ width: 280 }}
            whileHover={{ width: 360 }}
            whileFocus={{ width: 360 }}
            transition={{ type: "spring", stiffness: 250, damping: 24 }}
            className="hidden md:flex h-[54px] items-center justify-between gap-3 rounded-full border border-white/10 bg-[#121821]/72 px-4 backdrop-blur-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-all hover:border-emerald-500/45 hover:shadow-[0_0_0_4px_rgba(16,185,129,0.08)] cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Search className="size-5 text-[#A1A8B3] opacity-65 group-hover:text-emerald-400 group-hover:opacity-100 transition-colors shrink-0" aria-hidden />
              <span className="truncate text-[15px] font-medium text-[#A1A8B3] group-hover:text-white transition-colors">
                Search waterfalls, routes, tea estates...
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <kbd className="inline-flex items-center rounded-lg border border-white/15 bg-white/5 px-2 py-0.5 text-xs font-mono text-[#A1A8B3]">
                ⌘ K
              </kbd>
              <Mic className="size-4 text-[#A1A8B3] opacity-60 group-hover:text-emerald-400 hover:opacity-100 transition-opacity" />
            </div>
          </motion.button>

          {/* Mobile Search Button Fallback */}
          <button
            type="button"
            onClick={onSearch}
            className="flex md:hidden size-11 items-center justify-center rounded-full border border-white/10 bg-[#121821]/72 backdrop-blur-[24px] text-[#A1A8B3] hover:text-white"
            aria-label="Search"
          >
            <Search className="size-5" />
          </button>

          {/* User Controls & Premium Profile Hover Menu */}
          <div className="hidden items-center gap-2 sm:flex">
            <Button variant="ghost" size="icon" className="rounded-full size-11 border border-white/10 bg-[#121821]/50 text-[#A1A8B3] hover:text-white hover:border-white/20" aria-label="Notifications">
              <Bell className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full size-11 border border-white/10 bg-[#121821]/50 text-[#A1A8B3] hover:text-white hover:border-white/20" onClick={toggle} aria-label="Toggle theme">
              {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </Button>

            {/* Apple x Linear x Notion Profile Hover Menu */}
            <ProfileMenu dark={dark} toggleTheme={toggle} />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden rounded-full size-11 border border-white/10 bg-[#121821]/50"
            onClick={() => setOpen((o) => !o)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      {open && (
        <div className="glass-strong mx-auto mt-3 max-w-[1400px] rounded-3xl p-4 lg:hidden border border-white/15 shadow-2xl bg-[#121821]/95 backdrop-blur-[24px]">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-bold text-muted-foreground hover:bg-white/10 hover:text-white"
              activeProps={{ className: "bg-emerald-500/20 text-emerald-400" }}
            >
              <l.icon className="size-5" aria-hidden />
              {l.label}
            </Link>
          ))}
          <button
            onClick={toggle}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-base font-bold text-muted-foreground hover:bg-white/10 hover:text-white"
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
      className="glass-strong fixed inset-x-3 bottom-3 z-50 flex items-center justify-around rounded-2xl px-2 py-2 sm:hidden bg-[#121821]/90 backdrop-blur-[24px] border border-white/15"
      aria-label="Mobile"
    >
      {[{ to: "/", label: "Home", icon: Compass }, ...links.slice(0, 3)].map((l) => (
        <Link
          key={l.to}
          to={l.to}
          className="flex min-h-11 min-w-16 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-[11px] font-medium text-muted-foreground"
          activeProps={{ className: "text-emerald-400 font-bold" }}
        >
          <l.icon className="size-5" aria-hidden />
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
