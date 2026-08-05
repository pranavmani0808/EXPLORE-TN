import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
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
  LogOut,
  ChevronRight,
  Award,
  LogIn,
  UserPlus,
} from "lucide-react";
import { getCurrentAuthUser, clearAuthSession, UserProfile } from "@/lib/auth-rbac";

interface ProfileMenuProps {
  dark: boolean;
  toggleTheme: () => void;
}

export function ProfileMenu({ dark, toggleTheme }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [mapStyle, setMapStyle] = useState<"dark" | "satellite">("dark");
  const [language, setLanguage] = useState<"English" | "Tamil">("English");

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setCurrentUser(getCurrentAuthUser());
  }, [isOpen]);

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

  const handleLogOut = () => {
    clearAuthSession();
    setCurrentUser(null);
    setIsOpen(false);
    window.location.href = "/";
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // If user is NOT signed in, render Sign In / Sign Up buttons
  if (!currentUser) {
    return (
      <div className="flex items-center gap-2 font-sans">
        <Link
          to="/login"
          className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white rounded-full transition hover:bg-white/10 flex items-center gap-1.5"
        >
          <LogIn className="size-3.5" /> Sign In
        </Link>
        <Link
          to="/login"
          className="px-4 py-2 text-xs font-extrabold bg-emerald-500 hover:bg-emerald-600 text-black rounded-full shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5"
        >
          <UserPlus className="size-3.5" /> Sign Up
        </Link>
      </div>
    );
  }

  // If user IS signed in, render profile trigger & dropdown
  const initials = currentUser.name
    ? currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "EX";

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
      className="relative z-50 inline-block font-sans"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Dynamic User Avatar Trigger */}
      <motion.button
        type="button"
        onClick={toggleMobile}
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 350, damping: 20 }}
        className="relative grid size-11 place-items-center rounded-full bg-emerald-500 text-black font-black text-sm shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/40 cursor-pointer focus:outline-none"
        aria-label="User Profile Menu"
        aria-expanded={isOpen}
      >
        <span>{initials}</span>
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
            className="absolute right-0 top-full mt-3 w-[320px] origin-top-right rounded-[22px] bg-[#10141A]/90 p-[14px] backdrop-blur-[30px] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.45)] text-white overflow-hidden"
          >
            {/* Authenticated User Header */}
            <div className="rounded-2xl bg-white/5 p-3.5 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="relative size-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-black font-black flex items-center justify-center text-lg shadow-md shrink-0">
                  {initials}
                  <span className="absolute -top-1 -right-1 size-3 rounded-full bg-emerald-400 ring-2 ring-[#10141A]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm text-white truncate">{currentUser.name}</h3>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold rounded-full border border-emerald-500/30 shrink-0 uppercase">
                      {currentUser.role.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">{currentUser.email}</p>
                </div>
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

            {/* Preferences Divider */}
            <div className="my-2.5 border-t border-white/10 pt-2 space-y-1">
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
            </div>

            {/* Log Out Button */}
            <div className="pt-1.5 border-t border-white/10">
              <button
                type="button"
                onClick={handleLogOut}
                className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 transition-all cursor-pointer"
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
