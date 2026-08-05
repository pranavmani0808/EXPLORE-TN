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
  ChevronRight,
  Search,
} from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { TamilNaduMap } from "@/components/site/tamil-nadu-map";
import { PlaceCard } from "@/components/site/place-card";
import { places } from "@/data/places";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { getCurrentAuthUser, UserProfile } from "@/lib/auth-rbac";

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

interface QuestItem {
  id: string;
  title: string;
  xp: number;
  completed: boolean;
  link: string;
}

function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setCurrentUser(getCurrentAuthUser());
  }, []);

  const isSuperAdmin = currentUser?.role === "super_admin";

  const user = currentUser || {
    name: "Explorer",
    email: "Unauthenticated Visitor",
    avatar: "EX",
    role: "explorer" as const,
    rank: "New Traveler",
    districtCount: 0,
  };

  const initials = user.avatar || (user.name ? user.name.slice(0, 2).toUpperCase() : "EX");

  // Dynamic user stats - New Explorer vs Power Explorer
  const placesVisited = isSuperAdmin ? 48 : 0;
  const routesRidden = isSuperAdmin ? 12 : 0;
  const photosShared = isSuperAdmin ? 236 : 0;
  const reviewsCount = isSuperAdmin ? 31 : 0;

  const levelXP = isSuperAdmin
    ? { level: 7, xp: 2400, max: 3000, progress: 80, rankTitle: "Ghat Conqueror" }
    : { level: 0, xp: 0, max: 100, progress: 0, rankTitle: "Level 0 Explorer" };

  const lockedBadges = [
    { name: "Ghat Rider", desc: "Visit your first hill station", unlocked: isSuperAdmin },
    { name: "Temple Trail", desc: "Visit 3 heritage temples", unlocked: isSuperAdmin },
    { name: "Waterfall Hunter", desc: "Visit 5 secret waterfalls", unlocked: isSuperAdmin },
    { name: "Coastal Explorer", desc: "Visit 3 Bay of Bengal beaches", unlocked: isSuperAdmin },
  ];

  const onboardingQuests: QuestItem[] = [
    { id: "q1", title: "Complete Explorer Profile", xp: 20, completed: true, link: "/profile" },
    { id: "q2", title: "Save Your First Place", xp: 10, completed: isSuperAdmin, link: "/explore" },
    { id: "q3", title: "Plan Your First Ride", xp: 20, completed: isSuperAdmin, link: "/planner" },
    { id: "q4", title: "Visit Your First Place", xp: 50, completed: isSuperAdmin, link: "/explore" },
    { id: "q5", title: "Upload First Photo Log", xp: 30, completed: isSuperAdmin, link: "/community" },
    { id: "q6", title: "Write First Trail Review", xp: 20, completed: isSuperAdmin, link: "/community" },
  ];

  const stats = [
    {
      icon: MapPin,
      label: "Places Visited",
      value: placesVisited,
      subtext: placesVisited === 0 ? "Start exploring" : "Locations logged",
    },
    {
      icon: RouteIcon,
      label: "Routes Completed",
      value: routesRidden,
      subtext: routesRidden === 0 ? "Plan your first ride" : "GPX trails completed",
    },
    {
      icon: Camera,
      label: "Photos Shared",
      value: photosShared,
      subtext: photosShared === 0 ? "Capture memories" : "Community photo logs",
    },
    {
      icon: Star,
      label: "Reviews",
      value: reviewsCount,
      subtext: reviewsCount === 0 ? "Help other explorers" : "Trail reviews written",
    },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 sm:pt-36 font-sans">
        {/* Profile Header */}
        <div className="glass flex flex-wrap items-center gap-6 rounded-4xl p-6 shadow-elevate sm:p-8 bg-[#121821] border border-white/15 text-white">
          <span className="grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 font-black text-2xl text-black shadow-lg shadow-emerald-500/20 shrink-0">
            {initials}
          </span>
          <div className="min-w-52 flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold rounded-full border border-emerald-500/30">
                👋 Welcome to ExplorerTN
              </span>
              <span className="px-2.5 py-0.5 bg-white/10 text-slate-300 font-mono text-[10px] font-bold rounded-full uppercase">
                {user.role.replace("_", " ")}
              </span>
            </div>

            <h1 className="text-3xl font-black text-white">
              Hi {user.name}!
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              {!isSuperAdmin ? "Let's start your first adventure." : "Verified Operations Lead • 38 Districts Explored"}
            </p>

            <div className="mt-3 max-w-md">
              <div className="mb-1 flex justify-between text-xs font-mono text-slate-300">
                <span>{levelXP.rankTitle}</span>
                <span className="text-emerald-400 font-bold">{levelXP.xp} / {levelXP.max} XP</span>
              </div>
              <Progress value={levelXP.progress} className="h-2 bg-white/10" />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link to="/explore">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-500/20 cursor-pointer">
                <Compass className="size-4 mr-1.5" /> Explore Places →
              </Button>
            </Link>
          </div>
        </div>

        {/* Dynamic Statistics Grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-3xl border border-white/10 bg-[#121821] p-5 shadow-xl text-white flex flex-col justify-between">
              <div>
                <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wide text-slate-400">
                  <s.icon className="size-3.5 text-emerald-400" aria-hidden /> {s.label}
                </p>
                <p className="mt-3 font-black text-4xl text-white">{s.value}</p>
              </div>
              <p className="mt-3 text-xs text-emerald-400 font-mono font-medium">{s.subtext}</p>
            </div>
          ))}
        </div>

        {/* Main Grid: Map & Gamification Quests */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Exploration Map */}
          <div className="glass rounded-4xl p-6 border border-white/15 bg-[#121821] text-white flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold flex items-center gap-2 text-white">
                  <MapPin className="size-4 text-emerald-400" /> Your Exploration Map
                </p>
                <span className="text-[10px] font-mono text-slate-400">{placesVisited} Pins Logged</span>
              </div>

              {!isSuperAdmin && (
                <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-mono text-slate-300 text-center mb-3">
                  No places explored yet. Visit your first place to begin your journey.
                </div>
              )}

              <TamilNaduMap compact />
            </div>

            {!isSuperAdmin && (
              <Link to="/explore" className="w-full">
                <Button variant="outline" size="sm" className="w-full border-white/15 text-white hover:bg-white/10 text-xs font-bold rounded-2xl">
                  <Search className="size-3.5 mr-1.5" /> Find Nearby Places
                </Button>
              </Link>
            )}
          </div>

          <div className="space-y-6">
            {/* Onboarding Quests & XP Gain Progression */}
            {!isSuperAdmin && (
              <div className="glass rounded-4xl p-6 border border-white/15 bg-[#121821] text-white space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="size-4 text-emerald-400" /> Onboarding Quests (Earn XP)
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">20 / 150 XP Earned</span>
                </div>

                <div className="space-y-2">
                  {onboardingQuests.map((q) => (
                    <Link
                      key={q.id}
                      to={q.link}
                      className="group flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition"
                    >
                      <div className="flex items-center gap-3">
                        {q.completed ? (
                          <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                        ) : (
                          <div className="size-4 rounded-full border-2 border-slate-500 shrink-0" />
                        )}
                        <span className={`text-xs font-medium ${q.completed ? "text-slate-400 line-through" : "text-white"}`}>
                          {q.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        +{q.xp} XP
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Passport Badges (Locked Motivators for New Explorers) */}
            <div className="glass rounded-4xl p-6 border border-white/15 bg-[#121821] text-white space-y-4">
              <p className="text-sm font-bold flex items-center gap-2">
                <Award className="size-4 text-amber-400" /> Passport Badges & Achievements
              </p>

              <div className="grid sm:grid-cols-2 gap-2.5">
                {lockedBadges.map((b) => (
                  <div
                    key={b.name}
                    className={`p-3 rounded-2xl border flex items-start gap-3 transition ${
                      b.unlocked
                        ? "bg-emerald-500/15 border-emerald-500/30 text-white"
                        : "bg-white/5 border-white/10 text-slate-400"
                    }`}
                  >
                    <div className="mt-0.5">
                      {b.unlocked ? (
                        <Award className="size-4 text-amber-400" />
                      ) : (
                        <Lock className="size-4 text-slate-500" />
                      )}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${b.unlocked ? "text-emerald-400" : "text-slate-300"}`}>
                        {b.name}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved Places & Wishlist Empty State */}
            <div className="glass rounded-4xl p-6 border border-white/15 bg-[#121821] text-white space-y-3">
              <p className="text-sm font-bold flex items-center gap-2 text-white">
                <Bookmark className="size-4 text-emerald-400" /> Saved Destinations & Wishlist
              </p>

              {!isSuperAdmin ? (
                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl text-center space-y-3 text-white">
                  <div className="inline-flex size-12 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                    <Bookmark className="size-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">No saved destinations yet.</h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">Bookmark places while exploring.</p>
                  </div>
                  <Link to="/explore">
                    <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs rounded-xl mt-1">
                      Explore Places →
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {places.slice(1, 3).map((p) => (
                    <PlaceCard key={p.slug} place={p} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
