import { createFileRoute } from "@tanstack/react-router";
import { Award, Bookmark, Camera, MapPin, Route as RouteIcon, Star } from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { TamilNaduMap } from "@/components/site/tamil-nadu-map";
import { PlaceCard } from "@/components/site/place-card";
import { places } from "@/data/places";
import { Progress } from "@/components/ui/progress";

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
  { icon: MapPin, label: "Places visited", value: "48" },
  { icon: RouteIcon, label: "Routes ridden", value: "12" },
  { icon: Camera, label: "Photos shared", value: "236" },
  { icon: Star, label: "Reviews", value: "31" },
];

const badges = ["Ghat Rider", "Monsoon Chaser", "Temple Trail", "Sunrise Club", "Off-road 500", "Coastal Loop"];

function ProfilePage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 sm:pt-36">
        <div className="glass flex flex-wrap items-center gap-6 rounded-4xl p-6 shadow-elevate sm:p-8">
          <span className="grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-forest to-ocean font-display text-2xl font-bold text-forest-foreground">
            AK
          </span>
          <div className="min-w-52 flex-1">
            <h1 className="text-3xl font-bold">Arun Kumar</h1>
            <p className="text-sm text-muted-foreground">Chennai · Explorer Level 7 · 1.2k followers</p>
            <div className="mt-4 max-w-sm">
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Level 7</span>
                <span>2,400 / 3,000 XP</span>
              </div>
              <Progress value={80} className="h-2" />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-3xl border border-border bg-card p-5">
              <p className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                <s.icon className="size-3.5 text-primary" aria-hidden /> {s.label}
              </p>
              <p className="mt-2 font-display text-3xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="glass rounded-4xl p-6">
            <p className="mb-4 text-sm font-medium">Your exploration map</p>
            <TamilNaduMap compact />
          </div>
          <div className="space-y-6">
            <div className="glass rounded-4xl p-6">
              <p className="mb-4 flex items-center gap-2 text-sm font-medium">
                <Award className="size-4 text-gold" aria-hidden /> Achievements
              </p>
              <div className="flex flex-wrap gap-2">
                {badges.map((b) => (
                  <span key={b} className="rounded-full border border-border bg-card px-3 py-2 text-xs font-medium">
                    {b}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-4 flex items-center gap-2 text-sm font-medium">
                <Bookmark className="size-4 text-primary" aria-hidden /> Wishlist
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
