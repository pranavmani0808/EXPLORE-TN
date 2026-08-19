import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Sparkles,
  MapPin,
  Navigation,
  ArrowRight,
  Plus,
  Check,
  Calendar,
  Flame,
} from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import { arupadaiVeeduTemples, type Place } from "@/data/places";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerLabel,
  MarkerPopup,
  MarkerTooltip,
  MapControls,
  MapRoute,
} from "@/components/ui/map";

export const Route = createFileRoute("/trails/arupadai-veedu")({
  head: () => ({
    meta: [
      { title: "Arupadai Veedu Trail — Six Sacred Abodes of Lord Murugan | ExplorerTN" },
      {
        name: "description",
        content:
          "Explore the six sacred Arupadai Veedu temples of Lord Murugan across Tamil Nadu: Thiruttani, Swamimalai, Palani, Tiruchendur, Pazhamudircholai, and Thirupparankundram.",
      },
      { property: "og:title", content: "Arupadai Veedu Trail — ExplorerTN" },
      {
        property: "og:description",
        content: "Journey through the six sacred abodes of Lord Murugan across Tamil Nadu with real road maps and AI planning.",
      },
    ],
  }),
  component: ArupadaiVeeduTrailPage,
});

export function ArupadaiVeeduTrailPage() {
  const navigate = useNavigate();
  const [addedTrips, setAddedTrips] = useState<Record<string, boolean>>({});
  const [osrmRoutePoints, setOsrmRoutePoints] = useState<Array<[number, number]>>([]);

  const handleAddToTrip = (slug: string) => {
    setAddedTrips((prev) => ({ ...prev, [slug]: true }));
  };

  const handlePlanWithAI = () => {
    navigate({
      to: "/planner",
    });
  };

  // Static fallback pin coordinates
  const staticTempleCoords: Array<[number, number]> = arupadaiVeeduTemples
    .map((t) => t.coords)
    .filter((c): c is [number, number] => c !== undefined);

  // Fetch real multi-waypoint OSRM road geometry from backend
  useEffect(() => {
    let active = true;

    async function fetchTrailRoute() {
      try {
        const res = await fetch("/api/v1/planner/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: "Plan an Arupadai Veedu trip" }),
        });
        if (!res.ok) return;
        const json = await res.json();
        const coords = json?.data?.route?.geometry?.coordinates;
        if (active && coords && Array.isArray(coords) && coords.length > 0) {
          // OSRM coordinates are [lng, lat], convert to [lat, lng] for Leaflet
          const pts: Array<[number, number]> = coords.map(([lng, lat]: [number, number]) => [lat, lng]);
          setOsrmRoutePoints(pts);
        }
      } catch (err) {
        console.warn("Could not load OSRM road route for trail map, fallback to pins", err);
      }
    }

    fetchTrailRoute();

    return () => {
      active = false;
    };
  }, []);

  const displayRoutePoints = osrmRoutePoints.length > 0 ? osrmRoutePoints : staticTempleCoords;

  return (
    <AppShell>
      {/* Premium Dark Hero Banner Section */}
      <section className="relative min-h-[65vh] w-full overflow-hidden bg-slate-950 text-white">
        {/* Layer 0: Background Temple Hero Image */}
        <img
          src={arupadaiVeeduTemples[2]!.image}
          alt="Arupadai Veedu Trail - Sacred Murugan Abodes"
          className="absolute inset-0 size-full object-cover object-center opacity-65 z-0"
        />

        {/* Layer 1: Dark Translucent Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/65 to-slate-950 z-1" />

        {/* Layer 2: Hero Content */}
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-6 sm:pt-36">
          <div className="max-w-3xl">
            {/* Sacred Circuit Badge */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-slate-900/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 backdrop-blur-md shadow-md"
            >
              <Flame className="size-3.5 text-amber-400" /> Sacred Tamil Nadu Circuit
            </motion.p>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-4xl font-extrabold leading-tight text-white sm:text-6xl tracking-tight"
            >
              ARUPADAI VEEDU
              <br />
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent font-black">
                Six Sacred Abodes
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-base font-medium leading-relaxed text-slate-200 sm:text-lg max-w-2xl"
            >
              Journey through the six sacred abodes of Lord Murugan across Tamil Nadu — from hilltops to sea shores.
            </motion.p>

            {/* CTA & Metadata Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-6"
            >
              <Button
                onClick={handlePlanWithAI}
                size="lg"
                className="rounded-xl bg-amber-500 px-6 py-6 font-extrabold text-slate-950 hover:bg-amber-400 shadow-xl shadow-amber-500/25 transition-all"
              >
                <Sparkles className="mr-2 size-4 text-slate-950" /> Plan this trail with AI{" "}
                <ArrowRight className="ml-2 size-4 text-slate-950" />
              </Button>

              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/90 px-3.5 py-1.5 text-xs font-semibold text-slate-100 backdrop-blur-md shadow-sm">
                  <MapPin className="size-3.5 text-emerald-400" /> 6 Sacred Shrines
                </span>
                <span className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/90 px-3.5 py-1.5 text-xs font-semibold text-slate-100 backdrop-blur-md shadow-sm">
                  <Navigation className="size-3.5 text-sky-400" /> ~1,200 km Circuit
                </span>
                <span className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/90 px-3.5 py-1.5 text-xs font-semibold text-slate-100 backdrop-blur-md shadow-sm">
                  <Calendar className="size-3.5 text-purple-400" /> Recommended: 3–4 Days
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content Container with Dark Background & Interactive Mapcn Dev Map */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* Interactive Mapcn.dev Route Map Section */}
        <div className="mb-14 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Interactive Trail Map</h2>
              <p className="text-sm text-muted-foreground">
                Mapcn.dev Leaflet tile map with real OSRM road route geometry & PostGIS coordinates.
              </p>
            </div>
            <Button onClick={handlePlanWithAI} variant="outline" size="sm" className="rounded-xl">
              <Sparkles className="mr-1.5 size-3.5 text-amber-400" /> Optimize Route in Trip Copilot
            </Button>
          </div>

          <div className="glass overflow-hidden rounded-3xl p-2 shadow-elevate border border-amber-500/20">
            <Map center={[10.5, 78.5]} zoom={7} style="dark" className="h-[420px] w-full rounded-2xl border-0">
              <MapControls position="top-right" />

              {/* Render Animated OSRM Multi-Waypoint Road Route Line */}
              {displayRoutePoints.length > 1 && (
                <MapRoute coordinates={displayRoutePoints} animated color="#f59e0b" weight={4} />
              )}

              {/* Render All 6 Temple Markers */}
              {arupadaiVeeduTemples.map((temple, idx) => (
                <MapMarker key={temple.slug} latitude={temple.coords![0]} longitude={temple.coords![1]}>
                  <MarkerContent>
                    <span className="flex size-6 items-center justify-center rounded-full bg-amber-500 font-bold text-[10px] text-black ring-4 ring-amber-500/40 shadow-lg">
                      {idx + 1}
                    </span>
                  </MarkerContent>
                  <MarkerLabel>{temple.name}</MarkerLabel>
                  <MarkerTooltip>{temple.tagline}</MarkerTooltip>
                  <MarkerPopup title={temple.name} rating={temple.rating}>
                    <p className="text-xs text-muted-foreground">{temple.district} District</p>
                    <Button asChild size="sm" className="mt-2 w-full rounded-lg text-[11px]">
                      <Link to="/place/$slug" params={{ slug: temple.slug }}>
                        View Place Details
                      </Link>
                    </Button>
                  </MarkerPopup>
                </MapMarker>
              ))}
            </Map>
          </div>
        </div>

        {/* Six Destination Cards in Canonical Trail Order */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-2xl font-bold">Explore All Six Sacred Destinations</h2>
              <p className="text-sm text-muted-foreground">
                In canonical Arupadai Veedu order across Tamil Nadu.
              </p>
            </div>
            <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
              6 Verified Place Nodes
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {arupadaiVeeduTemples.map((temple, idx) => {
              const isAdded = addedTrips[temple.slug];
              return (
                <motion.div
                  key={temple.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-elevate transition-all hover:border-amber-500/40 hover:shadow-glow"
                >
                  {/* Position Order Badge */}
                  <div className="absolute left-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-amber-400 backdrop-blur-md border border-amber-500/30">
                    <span>{String(idx + 1).padStart(2, "0")}</span>
                    <span className="text-muted-foreground">/ 06</span>
                  </div>

                  {/* Image Header */}
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={temple.image}
                      alt={temple.name}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  </div>

                  {/* Card Content */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="size-3.5 text-amber-400" />
                      <span>{temple.district} District</span>
                    </div>

                    <h3 className="mt-2 text-xl font-bold leading-snug">{temple.name}</h3>

                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                      {temple.tagline}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/50 pt-3">
                      <span>Timings: {temple.timings}</span>
                      <span className="font-semibold text-emerald-400">Verified Shrine</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-5 grid grid-cols-2 gap-2 pt-2">
                      <Button asChild variant="outline" size="sm" className="rounded-xl text-xs">
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
                            ? "rounded-xl text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "rounded-xl text-xs bg-amber-500 text-black hover:bg-amber-600 font-semibold"
                        }
                      >
                        {isAdded ? (
                          <>
                            <Check className="mr-1 size-3.5 text-emerald-400" /> Added
                          </>
                        ) : (
                          <>
                            <Plus className="mr-1 size-3.5" /> Add to Trip
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA Card */}
        <div className="mt-16 glass-strong rounded-4xl p-8 text-center shadow-elevate">
          <div className="mx-auto max-w-xl">
            <span className="grid size-12 place-items-center rounded-2xl bg-amber-500/20 text-amber-400 mx-auto">
              <Sparkles className="size-6" />
            </span>
            <h3 className="mt-4 text-2xl font-bold sm:text-3xl">Plan the Arupadai Veedu Trail with AI Copilot</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Let Trip Copilot optimize your route order from your starting location, calculate real OSRM riding ETAs, fuel math, and weather advisories.
            </p>
            <Button
              onClick={handlePlanWithAI}
              size="lg"
              className="mt-6 rounded-xl bg-amber-500 text-black hover:bg-amber-600 font-bold px-8 shadow-lg shadow-amber-500/20"
            >
              <Sparkles className="mr-2 size-4" /> Launch AI Copilot <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
