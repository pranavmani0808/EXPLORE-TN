import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Settings,
  Bookmark,
  Compass,
  Sparkles,
  Bell,
  Download,
  HelpCircle,
  MessageSquare,
  Moon,
  Sun,
  Globe,
  MapPin,
  Shield,
  LogOut,
  ChevronRight,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileMenuProps {
  dark: boolean;
  toggleTheme: () => void;
}

export function ProfileMenu({ dark, toggleTheme }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mapStyle, setMapStyle] = useState<"dark" | "satellite">("dark");
  const [language, setLanguage] = useState<"English" | "Tamil">("English");

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 150);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const toggleMobile = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const stats = [
    { label: "Distance", value: "5,200 km" },
    { label: "Saved", value: "43 Places" },
    { label: "Trips", value: "18 Completed" },
  ];

  const mainActions = [
    { label: "Profile", icon: User, to: "/profile" },
    { label: "Collections", icon: Bookmark, to: "/explore" },
    { label: "Explorer Passport", icon: Compass, to: "/profile" },
    { label: "AI Expeditions", icon: Sparkles, to: "/planner" },
    { label: "Notifications", icon: Bell, to: "/profile" },
    { label: "Offline Maps", icon: Download, to: "/explore" },
    { label: "Help & Guides", icon: HelpCircle, to: "/community" },
    { label: "Feedback", icon: MessageSquare, to: "/community" },
  ];

  return (
    <div
      className="relative z-50 inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Micro-interactive Avatar Trigger */}
      <motion.button
        type="button"
        onClick={toggleMobile}
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 350, damping: 20 }}
        className="relative grid size-11 place-items-center rounded-full bg-emerald-500 text-black font-extrabold text-sm shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/40 cursor-pointer focus:outline-none"
        aria-label="User Profile Menu"
        aria-expanded={isOpen}
      >
        <span>AK</span>
        <span className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-400 ring-2 ring-[#10141A]" />
      </motion.button>

      {/* Floating Glass Profile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-full mt-3 w-[320px] origin-top-right rounded-[22px] bg-[#10141A]/72 p-[14px] backdrop-blur-[30px] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.45)] text-white font-sans overflow-hidden"
          >
            {/* Header: User Info & Level Progress */}
            <div className="rounded-2xl bg-white/5 p-3.5 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="relative size-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-black font-black flex items-center justify-center text-lg shadow-md shrink-0">
                  AK
                  <span className="absolute -top-1 -right-1 size-3 rounded-full bg-emerald-400 ring-2 ring-[#10141A]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display font-extrabold text-sm text-white truncate">Arun Kumar</h3>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/30 shrink-0">
                      PRO
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                    <Award className="size-3 text-emerald-400" /> Ghat Conqueror
                  </p>
                </div>
              </div>

              {/* Level Progress Bar */}
              <div className="mt-3.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 mb-1">
                  <span>Level 18</span>
                  <span className="text-emerald-400 font-bold">82%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm" />
                </div>
                <p className="mt-1.5 text-[10px] text-slate-400 font-mono">14 Districts Explored • 2,400 XP to Lvl 19</p>
              </div>

              {/* Statistic Chips Grid */}
              <div className="mt-3 grid grid-cols-3 gap-1.5 text-center pt-2.5 border-t border-white/10">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-xl bg-white/5 p-1.5 border border-white/5">
                    <p className="text-[11px] font-black text-white">{s.value}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-mono">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions List */}
            <div className="mt-3 space-y-0.5">
              {mainActions.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 transition-all hover:bg-emerald-500/15 hover:text-white"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <item.icon className="size-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-[3px] group-hover:text-emerald-400" />
                    <span className="truncate transition-transform duration-200 group-hover:translate-x-[2px]">{item.label}</span>
                  </div>
                  <ChevronRight className="size-3.5 text-slate-500 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-emerald-400" />
                </Link>
              ))}
            </div>

            {/* Account Preferences Divider Section */}
            <div className="my-2.5 border-t border-white/10 pt-2 space-y-1">
              {/* Dark Mode Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {dark ? <Moon className="size-4 text-emerald-400" /> : <Sun className="size-4 text-amber-400" />}
                  <span>Appearance</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{dark ? "Dark" : "Light"}</span>
              </button>

              {/* Language Selector */}
              <button
                type="button"
                onClick={() => setLanguage((l) => (l === "English" ? "Tamil" : "English"))}
                className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="size-4 text-emerald-400" />
                  <span>Language</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{language}</span>
              </button>

              {/* Map Engine Theme */}
              <button
                type="button"
                onClick={() => setMapStyle((m) => (m === "dark" ? "satellite" : "dark"))}
                className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="size-4 text-emerald-400" />
                  <span>Map Tiles</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 capitalize">{mapStyle}</span>
              </button>
            </div>

            {/* Bottom Logout Button */}
            <div className="pt-1.5 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  alert("Logged out of ExplorerTN");
                }}
                className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 transition-all hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]"
              >
                <div className="flex items-center gap-2.5">
                  <LogOut className="size-4 text-rose-400" />
                  <span>Log Out</span>
                </div>
                <ChevronRight className="size-3.5 text-rose-400/60" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
