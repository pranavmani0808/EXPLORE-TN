import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
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
  LogOut,
  ChevronRight,
  LogIn,
  UserPlus,
  Settings,
  Lock,
  Award,
} from "lucide-react";
import { getCurrentAuthUser, clearAuthSession, subscribeToAuthChanges, UserProfile, isAdminUser } from "@/lib/auth-rbac";
import { useAuthGuard } from "@/lib/auth-guard-context";
import { LayoutDashboard, Shield } from "lucide-react";

interface ProfileMenuProps {
  dark: boolean;
  toggleTheme: () => void;
}

export function ProfileMenu({ dark, toggleTheme }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user: authGuardUser, openAuthModal, logout: authGuardLogout } = useAuthGuard();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentAuthUser());

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Keep local state in sync with auth-rbac and AuthGuardContext
    setCurrentUser(authGuardUser || getCurrentAuthUser());

    const unsubscribe = subscribeToAuthChanges((updatedUser) => {
      setCurrentUser(updatedUser);
    });

    return () => {
      unsubscribe();
    };
  }, [authGuardUser, isOpen]);

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
    setIsOpen(false);
    if (typeof window !== "undefined") {
      window.location.replace("/");
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // If user is NOT signed in, render Account Icon trigger & dropdown popover
  if (!currentUser) {
    return (
      <div
        className="relative z-50 inline-block font-sans"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Account Icon Navbar Button */}
        <motion.button
          type="button"
          onClick={toggleMobile}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-sky-300 hover:text-sky-700 transition cursor-pointer shadow-sm"
          aria-label="Account Settings & Profile"
          title="Account & Explorer Profile"
        >
          <div className="grid size-7 place-items-center rounded-full bg-sky-100 text-sky-600 border border-sky-200">
            <User className="size-4" />
          </div>
          <span className="hidden sm:inline font-semibold text-slate-700">Account</span>
          <ChevronRight className={`size-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-90 text-sky-600" : ""}`} />
        </motion.button>

        {/* Floating Account Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute right-0 top-full mt-2.5 w-[300px] origin-top-right rounded-[22px] bg-white p-4 backdrop-blur-2xl border border-sky-100 shadow-2xl text-slate-800 overflow-hidden space-y-3 z-50"
            >
              {/* Account Banner */}
              <div className="rounded-2xl bg-gradient-to-r from-sky-100 via-sky-50 to-blue-50 p-3 border border-sky-200">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-sky-500 text-white font-black shadow-md">
                    <User className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">Explorer Account</h4>
                    <p className="text-[10px] text-slate-500">Save trips, custom routes & preferences</p>
                  </div>
                </div>
              </div>

              {/* Sign In & Sign Up Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    openAuthModal("Sign in to save your trip plans, preferences, and personal collections.");
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer"
                >
                  <LogIn className="size-3.5 text-sky-600" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    openAuthModal("Create an account to save your personalized AI route plans and unlock trails.");
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-sky-500 px-3 py-2.5 text-xs font-extrabold text-white hover:bg-sky-600 transition cursor-pointer shadow-md shadow-sky-500/20"
                >
                  <UserPlus className="size-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>

              {/* Account Direct Links */}
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <Link
                  to="/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Settings className="size-4 text-sky-600" />
                    <span>Explorer Account Settings</span>
                  </div>
                  <ChevronRight className="size-3.5 text-slate-400" />
                </Link>

                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="size-4 text-sky-600" />
                    <span>Tamil Nadu Explorer Identity</span>
                  </div>
                  <ChevronRight className="size-3.5 text-slate-400" />
                </Link>

                <Link
                  to="/planner"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="size-4 text-sky-600" />
                    <span>AI Trip Planner</span>
                  </div>
                  <ChevronRight className="size-3.5 text-slate-400" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
    { label: "Explorer Passport & Profile", icon: User, to: "/profile", badge: "Level 4" },
    { label: "My Badges & Milestones", icon: Award, to: "/profile" },
    { label: "Saved Places & Collections", icon: Bookmark, to: "/saved" },
    { label: "My Created Itineraries", icon: Sparkles, to: "/planner" },
    { label: "Account Security & Password", icon: Lock, to: "/settings?tab=security" },
    { label: "Help & Traveler Support", icon: HelpCircle, to: "/support" },
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
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 350, damping: 20 }}
        className="relative grid size-10 place-items-center rounded-full bg-sky-500 text-white font-black text-xs shadow-md shadow-sky-500/20 ring-2 ring-sky-500/30 cursor-pointer focus:outline-none shrink-0"
        aria-label="User Profile Menu"
        aria-expanded={isOpen}
      >
        <span>{initials}</span>
        <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-sky-400 ring-2 ring-white" />
      </motion.button>

      {/* Floating Glass Profile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-full mt-3 w-[320px] origin-top-right rounded-[22px] bg-white p-[14px] backdrop-blur-[30px] border border-sky-100 shadow-[0_20px_50px_rgba(2,132,199,0.12)] text-slate-900 overflow-hidden"
          >
            {/* Authenticated User Header */}
            <div className="rounded-2xl bg-sky-50/60 p-3.5 border border-sky-100">
              <div className="flex items-center gap-3">
                <div className="relative size-12 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 text-white font-black flex items-center justify-center text-lg shadow-md shrink-0">
                  {initials}
                  <span className="absolute -top-1 -right-1 size-3 rounded-full bg-sky-500 ring-2 ring-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm text-slate-900 truncate">{currentUser.name}</h3>
                    <span className="px-2 py-0.5 bg-sky-100 text-sky-700 text-[9px] font-mono font-bold rounded-full border border-sky-200 shrink-0 uppercase">
                      {currentUser.role.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 truncate mt-0.5">{currentUser.email}</p>
                </div>
              </div>
            </div>

            {/* Role-Based Admin Access Link */}
            {isAdminUser(currentUser) && (
              <div className="mt-2">
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-extrabold bg-sky-50 text-sky-700 border border-sky-200 transition-all hover:bg-sky-500 hover:text-white shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="size-4 shrink-0" />
                    <span>Admin Dashboard</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-sky-600 text-white px-1.5 py-0.5 rounded font-black">
                    CONTROL
                  </span>
                </Link>
              </div>
            )}

            {/* Quick Actions List */}
            <div className="mt-3 space-y-0.5">
              {mainActions.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 transition-all hover:bg-sky-50 hover:text-sky-700"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <item.icon className="size-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-[3px] group-hover:text-sky-600" />
                    <span className="truncate transition-transform duration-200 group-hover:translate-x-[2px]">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.badge && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-sky-100 text-sky-700 border border-sky-200">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="size-3.5 text-slate-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-sky-600" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Preferences Divider */}
            <div className="my-2.5 border-t border-slate-200 dark:border-white/10 pt-2 space-y-1">
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  {dark ? <Moon className="size-4 text-emerald-400" /> : <Sun className="size-4 text-amber-500" />}
                  <span>Appearance</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{dark ? "Dark" : "Light"}</span>
              </button>
            </div>

            {/* Log Out Button */}
            <div className="pt-1.5 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={handleLogOut}
                className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/15 hover:text-rose-700 dark:hover:text-rose-300 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <LogOut className="size-4 text-rose-600 dark:text-rose-400" />
                  <span>Log Out</span>
                </div>
                <ChevronRight className="size-3.5 text-rose-500/60" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
