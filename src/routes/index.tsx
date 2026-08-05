import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Search, ArrowRight, Compass, Mountain, Sparkles, MapPin, Maximize2 } from "lucide-react";
import heroImg from "@/assets/hero-ghats.jpg";
import { AppShell } from "@/components/site/app-shell";
import { GoogleMapHero } from "@/components/site/google-map-hero";
import { DedicatedMapModal } from "@/components/site/dedicated-map-modal";
import { PlaceCard } from "@/components/site/place-card";
import { SearchPanel } from "@/components/site/search-panel";
import { Button } from "@/components/ui/button";
import { categories, places, scenicRoute } from "@/data/places";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ExplorerTN — Discover hidden Tamil Nadu" },
      {
        name: "description",
        content:
          "Map-first discovery of Tamil Nadu: hidden waterfalls, ghat road rides, temple trails, food crawls, viewpoints and weekend escapes.",
      },
      { property: "og:title", content: "ExplorerTN — Discover hidden Tamil Nadu" },
      {
        property: "og:description",
        content: "Hidden waterfalls, scenic ghat roads, temple trails and food routes across Tamil Nadu.",
      },
    ],
  }),
  component: Index,
});

const suggestions = [
  "Weekend bike ride",
  "Hidden waterfalls",
  "Best food in Madurai",
  "Temples near Thanjavur",
  "Sunrise trekking",
  "Photography spots",
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [isDedicatedMapOpen, setIsDedicatedMapOpen] = useState(false);
  const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  return (
    <AppShell>
      <SearchPanel open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Dedicated 100% Fullscreen Map Viewport Modal */}
      <DedicatedMapModal
        isOpen={isDedicatedMapOpen}
        onClose={() => setIsDedicatedMapOpen(false)}
      />

      {/* Hero Header */}
      <section className="relative min-h-[85vh] overflow-hidden">
        <motion.img
          src={heroImg}
          alt="Misty Western Ghats at sunrise in Tamil Nadu"
          width={1920}
          height={1200}
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: "easeOut" }}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-background/78" />
        <div className="absolute inset-0 bg-fade-bottom" />

        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-32 sm:px-6 sm:pt-40">
          <div className="max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium tracking-wide"
            >
              <Compass className="size-3.5 text-primary" aria-hidden /> Map-First Spatial Platform · 1,240 places · 38 districts
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="mt-6 text-5xl font-extrabold leading-[0.95] sm:text-7xl"
            >
              Tamil Nadu,
              <br />
              <span className="text-gradient font-black">off the map.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.7 }}
              className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg"
            >
              Hidden waterfalls, seventy-hairpin ghat roads, midnight food trails and ridge-top sunrises —
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
                className="glass-strong flex w-full max-w-xl items-center gap-3 rounded-2xl px-5 py-4 text-left shadow-elevate transition-shadow hover:shadow-glow"
              >
                <Search className="size-5 text-primary" aria-hidden />
                <span className="flex-1 text-sm text-muted-foreground sm:text-base">
                  Where do you want to disappear this weekend?
                </span>
                <span className="hidden rounded-lg border border-border px-2 py-1 text-xs text-muted-foreground sm:block">
                  ⌘K
                </span>
              </button>

              <div className="mt-4 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSearchOpen(true)}
                    className="glass rounded-full px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Prominent Google Map Feature Section on Home Page */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-emerald-400" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Core Map Experience</span>
            </div>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Interactive Spatial Explorer</h2>
            <p className="mt-1 text-sm text-muted-foreground">The heart of ExplorerTN — click pins, filter layers, and discover trails.</p>
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
                to="/explore"
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

      {/* Hidden gems */}
      <Section title="Hidden gems" subtitle="Places locals know and maps forget.">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PlaceCard place={places[7]!} size="lg" />
          </div>
          <div className="grid gap-6">
            <PlaceCard place={places[6]!} />
            <PlaceCard place={places[4]!} />
          </div>
        </div>
      </Section>

      {/* Scenic route teaser */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="glass-strong grid gap-8 overflow-hidden rounded-4xl p-6 shadow-elevate sm:p-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Route Explorer</p>
              <h2 className="mt-3 text-3xl font-bold sm:text-5xl">{scenicRoute.name}</h2>
              <p className="mt-4 text-muted-foreground">{scenicRoute.summary}</p>
              <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  ["Distance", scenicRoute.totalDistance],
                  ["Riding", scenicRoute.totalTime],
                  ["Fuel", scenicRoute.fuelEstimate],
                  ["Season", scenicRoute.bestSeason],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-2xl border border-border bg-card/50 p-3">
                    <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</dt>
                    <dd className="mt-1 font-display text-sm font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
              <Button asChild size="lg" className="mt-6 rounded-xl">
                <Link to="/routes">
                  Ride the timeline <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {scenicRoute.stops.slice(1, 5).map((s) => (
                <div key={s.name} className="overflow-hidden rounded-3xl border border-border bg-card">
                  <img src={s.image} alt={s.name} loading="lazy" className="h-28 w-full object-cover" />
                  <div className="p-3">
                    <p className="font-display text-sm font-semibold">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.distance} · {s.weather}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Community */}
      <Section
        title="Travel stories"
        subtitle="Journals, photo dumps and community picks from the road."
        action={
          <Button asChild variant="ghost" className="rounded-xl">
            <Link to="/community">
              Open feed <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {places.slice(3, 6).map((p) => (
            <PlaceCard key={p.slug} place={p} />
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
