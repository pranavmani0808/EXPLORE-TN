import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Search, ArrowRight, Compass, Mountain, Sparkles, MapPin, Maximize2, Flame, Plus, Check } from "lucide-react";
import heroImg from "@/assets/hero-ghats.jpg";
import { AppShell } from "@/components/site/app-shell";
import { GoogleMapHero } from "@/components/site/google-map-hero";
import { DedicatedMapModal } from "@/components/site/dedicated-map-modal";
import { PlaceCard } from "@/components/site/place-card";
import { AdventureCard } from "@/components/site/adventure-card";
import { AdventureDetailModal } from "@/components/site/adventure-detail-modal";
import { SearchPanel } from "@/components/site/search-panel";
import { Button } from "@/components/ui/button";
import { categories, places, scenicRoute, arupadaiVeeduTemples } from "@/data/places";
import { adventureActivities, AdventureActivity } from "@/data/adventures";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ExplorerTN — Discover hidden Tamil Nadu" },
      {
        name: "description",
        content:
          "Map-first discovery of Tamil Nadu: hidden waterfalls, ghat road rides, temple trails, Arupadai Veedu sacred circuit, food crawls, viewpoints and weekend escapes.",
      },
      { property: "og:title", content: "ExplorerTN — Discover hidden Tamil Nadu" },
      {
        property: "og:description",
        content: "Hidden waterfalls, scenic ghat roads, Arupadai Veedu temple trails and food routes across Tamil Nadu.",
      },
    ],
  }),
  component: Index,
});

const suggestions = [
  "Arupadai Veedu trip",
  "Weekend bike ride",
  "Hidden waterfalls",
  "Best food in Madurai",
  "Temples near Thanjavur",
  "Sunrise trekking",
];

function Section({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold sm:text-4xl">{title}</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Index() {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [isDedicatedMapOpen, setIsDedicatedMapOpen] = useState(false);
  const [addedTrips, setAddedTrips] = useState<Record<string, boolean>>({});
  const [activeModalActivity, setActiveModalActivity] = useState<AdventureActivity | null>(null);
  const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  const handleAddToTrip = (slug: string) => {
    setAddedTrips((prev) => ({ ...prev, [slug]: true }));
  };

  return (
    <AppShell>
      <SearchPanel open={searchOpen} onOpenChange={setSearchOpen} />

      <AdventureDetailModal
        activity={activeModalActivity}
        onClose={() => setActiveModalActivity(null)}
      />

      {/* Dedicated 100% Fullscreen Map Viewport Modal */}
      <DedicatedMapModal
        isOpen={isDedicatedMapOpen}
        onClose={() => setIsDedicatedMapOpen(false)}
      />

      {/* Dark Mountain Hero Header with Atmospheric Transition */}
      <section className="relative min-h-[75vh] sm:min-h-[82vh] overflow-hidden bg-[#0B0F14]">
        <motion.img
          src={heroImg}
          alt="Misty Western Ghats at sunrise in Tamil Nadu"
          width={1920}
          height={1200}
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: "easeOut" }}
          className="absolute inset-0 size-full object-cover opacity-60"
        />
        {/* Dark Vignette & Top Tint Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F14]/85 via-[#0B0F14]/40 to-transparent" />

        {/* Layered Mountain Dissolve Fade Downward */}
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent via-[#031417]/85 to-[#0B0F14] pointer-events-none" />

        {/* Subtle Ambient Emerald/Teal Atmospheric Fog Glow */}
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[850px] h-[260px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-32 sm:px-6 sm:pt-40">
          <div className="max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium tracking-wide text-white border-white/10"
            >
              <Compass className="size-3.5 text-emerald-400" aria-hidden /> Map-First Spatial Platform · 1,240 places · 38 districts
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="mt-6 text-5xl font-extrabold leading-[0.95] sm:text-7xl text-white"
            >
              Tamil Nadu,
              <br />
              <span className="text-gradient font-black">off the map.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.7 }}
              className="mt-6 max-w-xl text-base text-slate-300 sm:text-lg"
            >
              Hidden waterfalls, seventy-hairpin ghat roads, Arupadai Veedu sacred temple trails, and midnight food crawls —
              mapped, verified and built for map-first spatial exploration.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.44, duration: 0.7 }}
              className="mt-8 font-sans"
            >
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="glass-strong flex w-full max-w-xl items-center gap-3 rounded-2xl px-5 py-4 text-left shadow-elevate transition-shadow hover:shadow-glow bg-[#121821]/85 border-white/15 text-white"
              >
                <Search className="size-5 text-emerald-400" aria-hidden />
                <span className="flex-1 text-sm text-slate-300 sm:text-base">
                  Where do you want to disappear this weekend?
                </span>
                <span className="hidden rounded-lg border border-white/20 bg-white/5 px-2 py-1 text-xs text-slate-300 sm:block">
                  ⌘K
                </span>
              </button>

              <div className="mt-4 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSearchOpen(true)}
                    className="glass rounded-full px-3.5 py-2 text-xs font-medium text-slate-300 transition-colors hover:text-white hover:border-emerald-500/40 bg-white/5 border-white/10"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Prominent Google Map Feature Section on Home Page — Seamless Dark Continuation */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-12 pt-4 sm:px-6 -mt-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-emerald-400" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Core Map Experience</span>
            </div>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl text-white">Interactive Spatial Explorer</h2>
            <p className="mt-1 text-sm text-slate-400">The heart of ExplorerTN — click pins, filter layers, and discover trails.</p>
          </div>

          <Button 
            onClick={() => setIsDedicatedMapOpen(true)} 
            size="lg" 
            className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold shadow-lg shadow-emerald-500/20"
          >
            <Maximize2 className="size-4 mr-1" /> Launch Full Screen Map <ArrowRight className="size-4 ml-1" />
          </Button>
        </div>

        <GoogleMapHero apiKey={GOOGLE_MAPS_KEY} />
      </section>

      {/* ================================================== */}
      {/* CURATED FEATURED TRAIL: ARUPADAI VEEDU TRAIL */}
      {/* ================================================== */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="glass-strong overflow-hidden rounded-4xl p-6 sm:p-10 shadow-elevate border border-amber-500/20">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-border/60 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="size-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                  EXPLORE SACRED TAMIL NADU
                </span>
              </div>
              <h2 className="mt-2 text-3xl font-extrabold sm:text-5xl">🛕 Arupadai Veedu Trail</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                Journey through the six sacred abodes of Lord Murugan across Tamil Nadu.
              </p>
            </div>

            <Button asChild size="lg" className="rounded-xl bg-amber-500 text-black hover:bg-amber-600 font-bold shadow-lg shadow-amber-500/20">
              <Link to="/trails/arupadai-veedu">
                Explore Trail <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>

          {/* Six Destination Cards */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {arupadaiVeeduTemples.map((temple, idx) => {
              const isAdded = addedTrips[temple.slug];
              return (
                <div
                  key={temple.slug}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-elevate transition-all hover:border-amber-500/40"
                >
                  <div className="absolute left-3 top-3 z-10 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-amber-400 backdrop-blur-md border border-amber-500/30">
                    {String(idx + 1).padStart(2, "0")} / 06
                  </div>

                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={temple.image}
                      alt={temple.name}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-[11px] font-semibold text-amber-400">{temple.district} District</p>
                    <h3 className="mt-1 font-display text-base font-bold">{temple.name}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{temple.tagline}</p>

                    <div className="mt-4 grid grid-cols-2 gap-2 pt-2 border-t border-border/40">
                      <Button asChild variant="outline" size="sm" className="rounded-xl text-[11px]">
                        <Link to="/place/$slug" params={{ slug: temple.slug }}>
                          View Place
                        </Link>
                      </Button>

                      <Button
                        onClick={() => handleAddToTrip(temple.slug)}
                        size="sm"
                        variant={isAdded ? "secondary" : "default"}
                        className={
                          isAdded
                            ? "rounded-xl text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "rounded-xl text-[11px] bg-amber-500 text-black hover:bg-amber-600 font-semibold"
                        }
                      >
                        {isAdded ? <Check className="mr-1 size-3 text-emerald-400" /> : <Plus className="mr-1 size-3" />}
                        {isAdded ? "Added" : "Add to Trip"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trending */}
      <Section
        title="Trending this week"
        subtitle="What explorers are riding to right now."
        action={
          <Button asChild variant="ghost" className="rounded-xl">
            <Link to="/explore">
              See all <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {places.slice(0, 3).map((p) => (
            <PlaceCard key={p.slug} place={p} />
          ))}
        </div>
      </Section>

      {/* Categories */}
      <Section title="Explore by obsession" subtitle="Twelve layers of Tamil Nadu, each with its own trail.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={c.id === "spiritual" ? "/trails/arupadai-veedu" : "/explore"}
                className="group relative block h-48 overflow-hidden rounded-3xl border border-border"
              >
                <img
                  src={c.image}
                  alt={c.label}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="font-display text-lg font-semibold">{c.label}</h3>
                  <p className="text-xs text-muted-foreground">{c.blurb}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Adventure Activities Section */}
      <Section
        title="⚡ Adventure Activities across India"
        subtitle="Paragliding, skydiving, river rafting, scuba diving and gondola rides — discover high-adrenaline experiences."
        action={
          <Button asChild variant="ghost" className="rounded-xl font-bold">
            <Link to="/adventures">
              Explore All 10 Adventures <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {adventureActivities.slice(0, 6).map((activity) => (
            <AdventureCard
              key={activity.id}
              activity={activity}
              onSelect={(act) => setActiveModalActivity(act)}
            />
          ))}
        </div>
      </Section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-10 text-sm text-muted-foreground sm:px-6">
          <p className="flex items-center gap-2">
            <Mountain className="size-4 text-primary" aria-hidden /> ExplorerTN — built for people who take the long way.
          </p>
          <p>© {new Date().getFullYear()} ExplorerTN</p>
        </div>
      </footer>
    </AppShell>
  );
}
