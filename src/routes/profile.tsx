import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Bookmark, Camera, MapPin, Route as RouteIcon, Star, LogIn, UserPlus } from "lucide-react";
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
      { title: "Your explorer profile — ExplorerTN" },
      {
        name: "description",
        content: "Explorer level, visited places, saved routes, badges and your personal Tamil Nadu exploration map.",
      },
      { property: "og:title", content: "Your explorer profile — ExplorerTN" },
      { property: "og:description", content: "Track visited places, saved routes and badges across Tamil Nadu." },
    ],
  }),
  component: ProfilePage,
});

const stats = [
  { icon: MapPin, label: "Places visited", value: "14" },
  { icon: RouteIcon, label: "Routes ridden", value: "6" },
  { icon: Camera, label: "Photos shared", value: "28" },
  { icon: Star, label: "Reviews", value: "9" },
];

const badges = ["Ghat Rider", "Monsoon Chaser", "Temple Trail", "Sunrise Club", "Coastal Loop"];

function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setCurrentUser(getCurrentAuthUser());
  }, []);

  const user = currentUser || {
    name: "Guest Explorer",
    email: "Unauthenticated Visitor",
    avatar: "GE",
    role: "explorer" as const,
    rank: "Traveler",
    districtCount: 1,
  };

  const initials = user.avatar || (user.name ? user.name.slice(0, 2).toUpperCase() : "EX");

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 sm:pt-36 font-sans">
        {/* Dynamic Profile Header */}
        <div className="glass flex flex-wrap items-center gap-6 rounded-4xl p-6 shadow-elevate sm:p-8">
          <span className="grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 font-black text-2xl text-black shadow-lg shadow-emerald-500/20">
            {initials}
          </span>
          <div className="min-w-52 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold text-white">{user.name}</h1>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold rounded-full uppercase border border-emerald-500/30">
                {user.role.replace("_", " ")}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              {user.email} • {user.rank} • {user.districtCount} District Explored
            </p>
            <div className="mt-4 max-w-sm">
              <div className="mb-1 flex justify-between text-xs font-mono text-slate-300">
                <span>Level 7</span>
                <span className="text-emerald-400 font-bold">2,400 / 3,000 XP</span>
              </div>
              <Progress value={80} className="h-2 bg-white/10" />
            </div>
          </div>

          {!currentUser && (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button size="sm" className="bg-emerald-500 text-black font-extrabold text-xs rounded-2xl">
                  <LogIn className="size-4 mr-1" /> Sign In to Save Trips
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-3xl border border-white/10 bg-[#121821] p-5 shadow-xl text-white">
              <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wide text-slate-400">
                <s.icon className="size-3.5 text-emerald-400" aria-hidden /> {s.label}
              </p>
              <p className="mt-2 font-black text-3xl text-white">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Layout Grid */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="glass rounded-4xl p-6 border border-white/10 bg-[#121821] text-white">
            <p className="mb-4 text-sm font-bold flex items-center gap-2">
              <MapPin className="size-4 text-emerald-400" /> Your Exploration Map
            </p>
            <TamilNaduMap compact />
          </div>
          <div className="space-y-6">
            <div className="glass rounded-4xl p-6 border border-white/10 bg-[#121821] text-white">
              <p className="mb-4 flex items-center gap-2 text-sm font-bold">
                <Award className="size-4 text-amber-400" aria-hidden /> Passport Badges & Achievements
              </p>
              <div className="flex flex-wrap gap-2">
                {badges.map((b) => (
                  <span key={b} className="rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 px-3 py-2 text-xs font-mono font-bold">
                    🏆 {b}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
                <Bookmark className="size-4 text-emerald-400" aria-hidden /> Saved Destinations & Wishlist
              </p>
              <div className="grid gap-6 sm:grid-cols-2">
                {places.slice(1, 3).map((p) => (
                  <PlaceCard key={p.slug} place={p} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
