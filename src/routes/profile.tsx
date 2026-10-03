import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  Bookmark,
  Camera,
  MapPin,
  Route as RouteIcon,
  Star,
  LogIn,
  Compass,
  ArrowRight,
  Sparkles,
  Lock,
  CheckCircle2,
  Search,
  Shield,
  Check,
  Key,
  RefreshCw,
  AlertCircle,
  LayoutDashboard,
} from "lucide-react";
import { motion } from "motion/react";
import { AppShell } from "@/components/site/app-shell";
import { TamilNaduMap } from "@/components/site/tamil-nadu-map";
import { PlaceCard } from "@/components/site/place-card";
import { places } from "@/data/places";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { getCurrentAuthUser, subscribeToAuthChanges, UserProfile, isAdminUser } from "@/lib/auth-rbac";
import { getUserVisits, getCommunityContributions, PlaceVisit } from "@/lib/explorer-activity";
import { useAuthGuard } from "@/lib/auth-guard-context";
import { supabase } from "@/lib/supabase-client";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Explorer Profile — ExplorerTN" },
      {
        name: "description",
        content: "Track your Tamil Nadu exploration level, unlocked badges, saved routes, and travel achievements.",
      },
      { property: "og:title", content: "Your Explorer Profile — ExplorerTN" },
      { property: "og:description", content: "Track visited places, saved routes and badges across Tamil Nadu." },
    ],
  }),
  component: ProfilePage,
});

const TN_38_DISTRICTS = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri",
  "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur",
  "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris",
  "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga",
  "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
  "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore",
  "Viluppuram", "Virudhunagar"
];

function ProfilePage() {
  const { openAuthModal } = useAuthGuard();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [visits, setVisits] = useState<PlaceVisit[]>([]);
  const [contributionsCount, setContributionsCount] = useState({ photos: 0, reviews: 0 });

  // Explorer Security & Password Management State
  const [activePasswordTab, setActivePasswordTab] = useState<"change" | "forgot">("change");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordStatusMsg, setPasswordStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);
  const [resetEmailStatus, setResetEmailStatus] = useState<string | null>(null);

  const handleUpdatePasswordWithOld = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatusMsg(null);

    if (!oldPassword) {
      setPasswordStatusMsg({ type: "error", text: "Please enter your current password." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatusMsg({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatusMsg({ type: "error", text: "New passwords do not match." });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      if (currentUser?.email) {
        // Verify old password by signing in
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: currentUser.email,
          password: oldPassword,
        });

        if (signInErr) {
          setIsUpdatingPassword(false);
          setPasswordStatusMsg({ type: "error", text: "Incorrect current password. Please try again." });
          return;
        }

        // Update to new password
        const { error: updateErr } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updateErr) {
          setIsUpdatingPassword(false);
          setPasswordStatusMsg({ type: "error", text: updateErr.message || "Failed to update password." });
          return;
        }

        setIsUpdatingPassword(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordStatusMsg({ type: "success", text: "Password updated successfully!" });
        toast.success("Account password updated successfully!");
      }
    } catch (err: any) {
      setIsUpdatingPassword(false);
      setPasswordStatusMsg({ type: "error", text: err?.message || "Error updating password." });
    }
  };

  const handleSendForgotPasswordEmail = async () => {
    if (!currentUser?.email) return;
    setIsSendingResetEmail(true);
    setResetEmailStatus(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(currentUser.email);
      if (error && !error.message.includes("fetch")) {
        console.warn("[Profile] Reset password error:", error.message);
      }
      setIsSendingResetEmail(false);
      setResetEmailStatus(`Password reset link sent to ${currentUser.email}. Check your inbox.`);
      toast.success("Reset link sent to your registered email!");
    } catch (err: any) {
      setIsSendingResetEmail(false);
      setResetEmailStatus("Failed to send reset email. Please try again later.");
    }
  };

  useEffect(() => {
    const activeUser = getCurrentAuthUser();
    setCurrentUser(activeUser);

    if (activeUser) {
      const userVisits = getUserVisits(activeUser.id);
      setVisits(userVisits);

      const allContribs = getCommunityContributions().filter((c) => c.userId === activeUser.id);
      setContributionsCount({
        photos: allContribs.filter((c) => c.type === "photo" && c.status === "APPROVED").length,
        reviews: allContribs.filter((c) => c.type === "review" && c.status === "APPROVED").length,
      });
    }

    const unsubscribe = subscribeToAuthChanges((updatedUser) => {
      setCurrentUser(updatedUser);
    });
    return () => unsubscribe();
  }, []);

  if (!currentUser) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl px-4 py-36 text-center font-sans">
          <div className="bg-[#121821] border border-white/15 rounded-3xl p-8 shadow-2xl text-white">
            <div className="inline-flex size-16 place-items-center rounded-2xl bg-emerald-500 text-black font-black mb-4">
              <Compass className="size-8 text-black" />
            </div>
            <h2 className="text-2xl font-black">Sign in to view your Explorer Passport</h2>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Track places visited across 38 districts, save custom routes, build itineraries, and sync your contributions.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button
                onClick={() => openAuthModal("Sign in to view your Explorer Passport.")}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-2xl px-6 py-2.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                Sign In to ExplorerTN
              </Button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  const user = currentUser;
  const initials = user.avatar || (user.name ? user.name.slice(0, 2).toUpperCase() : "EX");

  // Dynamic user stats derived ONLY from real user activity
  const placesVisited = visits.length;
  const districtsExploredSet = new Set(visits.map((v) => v.district));
  const districtsExploredCount = districtsExploredSet.size;

  const xpEarned = placesVisited * 50 + contributionsCount.photos * 30 + contributionsCount.reviews * 20;
  const levelNumber = Math.floor(xpEarned / 100);
  const rankTitle = levelNumber === 0 ? "Level 0 Explorer" : levelNumber < 5 ? "Trail Rider" : "Ghat Conqueror";

  const stats = [
    {
      icon: MapPin,
      label: "Places Visited",
      value: placesVisited,
      subtext: placesVisited === 0 ? "Start exploring" : `${placesVisited} Places Check-in`,
    },
    {
      icon: RouteIcon,
      label: "Districts Explored",
      value: districtsExploredCount,
      subtext: districtsExploredCount === 0 ? "Unlock district stamps" : `${districtsExploredCount} / 38 Districts`,
    },
    {
      icon: Camera,
      label: "Photos Shared",
      value: contributionsCount.photos,
      subtext: contributionsCount.photos === 0 ? "Capture memories" : "Approved Photo Logs",
    },
    {
      icon: Star,
      label: "Reviews Written",
      value: contributionsCount.reviews,
      subtext: contributionsCount.reviews === 0 ? "Help other explorers" : "Verified Trail Reviews",
    },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 sm:pt-36 font-sans">
        {/* Profile Header */}
        <div className="flex flex-wrap items-center gap-6 rounded-[28px] p-6 sm:p-8 bg-white dark:bg-[#121821] border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white shadow-sm dark:shadow-2xl">
          <span className="grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 font-black text-2xl text-white dark:text-black shadow-lg shadow-emerald-500/20 shrink-0">
            {initials}
          </span>
          <div className="min-w-52 flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-mono text-[11px] font-bold rounded-full border border-emerald-500/30 flex items-center gap-1">
                <Shield className="size-3 text-emerald-600 dark:text-emerald-400" /> Platform Role: {user.role.replace("_", " ").toUpperCase()}
              </span>

              <span className="px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono text-[11px] font-bold rounded-full border border-amber-500/30">
                🏕️ Explorer Rank: {rankTitle}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              Welcome to ExplorerTN, {user.name}!
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {placesVisited === 0 ? "Let's start your first adventure across Tamil Nadu." : `${districtsExploredCount} Districts Unlocked • ${xpEarned} XP Earned`}
            </p>

            <div className="mt-3 max-w-md">
              <div className="mb-1 flex justify-between text-xs font-mono text-slate-600 dark:text-slate-300">
                <span>{rankTitle}</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">{xpEarned % 100} / 100 XP</span>
              </div>
              <Progress value={xpEarned % 100} className="h-2 bg-slate-100 dark:bg-white/10" />
            </div>

            {/* Role-Based Admin Operations Banner */}
            {isAdminUser(user) && (
              <div className="mt-5 border-t border-slate-200 dark:border-white/10 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Shield className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">Admin Privileges Active</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    You have full operational authorization to the Explore TN Control Center & Crawler Ingestion Pipeline.
                  </p>
                </div>
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white dark:text-black font-extrabold text-xs shadow-md shadow-emerald-500/20 shrink-0 transition"
                >
                  <LayoutDashboard className="size-4" /> Open Admin Dashboard →
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link to="/explore">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white dark:text-black font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-500/20 cursor-pointer">
                <Compass className="size-4 mr-1.5" /> Explore Places →
              </Button>
            </Link>
          </div>
        </div>

        {/* Stat Cards Grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <motion.div
              key={s.label}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121821] p-6 shadow-sm text-slate-900 dark:text-white flex flex-col justify-between"
            >
              <div>
                <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <s.icon className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden /> {s.label}
                </p>
                <p className="mt-3 font-bold text-4xl text-slate-900 dark:text-white tracking-tight">{s.value}</p>
              </div>
              <p className="mt-3 text-xs text-emerald-700 dark:text-emerald-400 font-mono font-semibold">{s.subtext}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Grid: Explorer Passport & Saved Places */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Map Card */}
          <div className="rounded-4xl p-6 border border-slate-200 dark:border-white/15 bg-white dark:bg-[#121821] text-slate-900 dark:text-white shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <MapPin className="size-4 text-emerald-600 dark:text-emerald-400" /> Exploration Map
                </p>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{placesVisited} Pins Logged</span>
              </div>

              {placesVisited === 0 && (
                <div className="p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-mono text-slate-600 dark:text-slate-300 text-center mb-3">
                  No places explored yet. Click "I've Been Here" on destination pages to log visits.
                </div>
              )}

              <TamilNaduMap compact />
            </div>

            <Link to="/explore" className="w-full">
              <Button variant="outline" size="sm" className="w-full border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-transparent text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-bold rounded-2xl">
                <Search className="size-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" /> Find Nearby Places
              </Button>
            </Link>
          </div>

          <div className="space-y-6">
            {/* Explorer Passport Card */}
            <div className="rounded-4xl p-6 border border-slate-200 dark:border-white/15 bg-white dark:bg-[#121821] text-slate-900 dark:text-white shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <Award className="size-4 text-amber-500" /> Explorer Passport (38 Districts)
                </p>
                <span className="text-xs font-mono text-emerald-600 font-bold">{districtsExploredCount} / 38 Districts Unlocked</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                {TN_38_DISTRICTS.map((district) => {
                  const isUnlocked = districtsExploredSet.has(district);

                  return (
                    <div
                      key={district}
                      className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between transition ${
                        isUnlocked
                          ? "bg-emerald-50 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold"
                          : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400"
                      }`}
                    >
                      <span className="truncate">{district}</span>
                      {isUnlocked ? (
                        <Check className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <Lock className="size-3 text-slate-400 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Saved Destinations Card */}
            <div className="rounded-4xl p-6 border border-slate-200 dark:border-white/15 bg-white dark:bg-[#121821] text-slate-900 dark:text-white shadow-sm space-y-3">
              <p className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <Bookmark className="size-4 text-emerald-600 dark:text-emerald-400" /> Saved Destinations
              </p>

              <div className="p-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl text-center space-y-3">
                <div className="inline-flex size-12 place-items-center rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <Bookmark className="size-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">No saved destinations yet.</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">Bookmark places while exploring Tamil Nadu.</p>
                </div>
                <Link to="/explore">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white dark:text-black font-extrabold text-xs rounded-xl mt-1">
                    Explore Destinations →
                  </Button>
                </Link>
              </div>
            </div>

            {/* Explorer Controls: Account Security & Password Management Card */}
            <div className="rounded-4xl p-6 border border-slate-200 dark:border-white/15 bg-white dark:bg-[#121821] text-slate-900 dark:text-white shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <Lock className="size-4 text-emerald-600 dark:text-emerald-400" /> Explorer Controls & Password Security
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    Update your password using current credentials or request a recovery link.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  Auth Vault
                </span>
              </div>

              {/* Mode Tabs: Change Password vs Forgot Password */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-bold font-mono">
                <button
                  type="button"
                  onClick={() => { setActivePasswordTab("change"); setPasswordStatusMsg(null); setResetEmailStatus(null); }}
                  className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    activePasswordTab === "change"
                      ? "bg-emerald-500 text-black shadow-md font-black"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Key className="size-3.5" /> Change Password
                </button>
                <button
                  type="button"
                  onClick={() => { setActivePasswordTab("forgot"); setPasswordStatusMsg(null); setResetEmailStatus(null); }}
                  className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    activePasswordTab === "forgot"
                      ? "bg-emerald-500 text-black shadow-md font-black"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <RefreshCw className="size-3.5" /> Forgot Password
                </button>
              </div>

              {/* SECTION A: CHANGE PASSWORD USING OLD PASSWORD */}
              {activePasswordTab === "change" && (
                <form onSubmit={handleUpdatePasswordWithOld} className="space-y-3.5">
                  <div>
                    <label className="text-[11px] font-mono uppercase font-bold text-slate-600 dark:text-slate-300">
                      Current (Old) Password
                    </label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3.5 top-2.5 size-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full h-10 pl-10 pr-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-mono uppercase font-bold text-slate-600 dark:text-slate-300">
                        New Password
                      </label>
                      <div className="relative mt-1">
                        <Key className="absolute left-3.5 top-2.5 size-4 text-slate-400" />
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full h-10 pl-10 pr-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-mono uppercase font-bold text-slate-600 dark:text-slate-300">
                        Confirm New Password
                      </label>
                      <div className="relative mt-1">
                        <Key className="absolute left-3.5 top-2.5 size-4 text-slate-400" />
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat new password"
                          className="w-full h-10 pl-10 pr-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {passwordStatusMsg && (
                    <div
                      className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                        passwordStatusMsg.type === "success"
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {passwordStatusMsg.type === "success" ? (
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                      ) : (
                        <AlertCircle className="size-4 shrink-0 text-rose-500" />
                      )}
                      <span>{passwordStatusMsg.text}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-black font-black text-xs rounded-2xl shadow-md cursor-pointer"
                  >
                    {isUpdatingPassword ? "Verifying & Updating..." : "Update Password Using Old Password"}
                  </Button>
                </form>
              )}

              {/* SECTION B: FORGOT PASSWORD RECOVERY VIA EMAIL */}
              {activePasswordTab === "forgot" && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl space-y-2">
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-mono">
                      Logged in account email: <strong className="text-emerald-600 dark:text-emerald-400">{currentUser.email}</strong>
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      If you have forgotten your password or want to reset it without entering your old password, click below. A secure one-time password reset link will be dispatched to your email.
                    </p>
                  </div>

                  {resetEmailStatus && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                      <span>{resetEmailStatus}</span>
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={handleSendForgotPasswordEmail}
                    disabled={isSendingResetEmail}
                    className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-black font-black text-xs rounded-2xl shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Key className="size-4" />
                    <span>{isSendingResetEmail ? "Sending Reset Link..." : "Send Password Reset Link to Email"}</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
