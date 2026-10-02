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
import { PlannerApiRepository } from "@/lib/api-client/planner";
import { cn } from "@/lib/utils";
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

function ArupadaiVeeduTrailPage() {
  const navigate = useNavigate();
  const [addedTrips, setAddedTrips] = useState<Record<string, boolean>>({});
  const [osrmRoutePoints, setOsrmRoutePoints] = useState<Array<[number, number]>>([]);
  const [selectedStopIndex, setSelectedStopIndex] = useState<number>(0);
  const [mapCenter, setMapCenter] = useState<[number, number]>([10.5, 78.5]);
  const [mapZoom, setMapZoom] = useState<number>(7);

  const handleSelectStop = (index: number) => {
    setSelectedStopIndex(index);
    const temple = arupadaiVeeduTemples[index];
    if (temple && temple.coords) {
      setMapCenter(temple.coords);
      setMapZoom(11);
    }
  };

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

  // Fetch real multi-waypoint OSRM road geometry connecting shrines sequentially 1 -> 2 -> 3 -> 4 -> 5 -> 6
  useEffect(() => {
    let active = true;

    async function fetchTrailRoute() {
      try {
        const waypointsStr = arupadaiVeeduTemples
          .map((t) => `${t.longitude},${t.latitude}`)
          .join(";");
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${waypointsStr}?overview=full&geometries=geojson`;
        const response = await fetch(osrmUrl);
        if (response.ok) {
          const json = await response.json();
          const coords = json.routes?.[0]?.geometry?.coordinates;
          if (active && coords && Array.isArray(coords) && coords.length > 0) {
            const pts: Array<[number, number]> = coords.map(([lng, lat]: [number, number]) => [lat, lng]);
            setOsrmRoutePoints(pts);
            return;
          }
        }
      } catch (err) {
        console.warn("OSRM direct multi-waypoint fetch notice, fallback to static sequential points", err);
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
          src={arupadaiVeeduTemples[2]?.image || arupadaiVeeduTemples[0]?.image}
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

      {/* Main Content Container with Split 2-Column Trail Map & Shrines Navigator */}
      <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6">
        {/* Interactive Mapcn.dev Route Map Section */}
        <div className="mb-14 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-mono font-bold text-amber-400">
                  Sequential Road Route 1 → 6
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  ~1,200 km Total Circuit
                </span>
              </div>
              <h2 className="text-2xl font-black text-white font-display mt-1">Interactive Trail Map & Route Navigator</h2>
            </div>
            <Button onClick={handlePlanWithAI} variant="outline" size="sm" className="rounded-xl border-amber-500/30 text-amber-300 hover:bg-amber-500/10">
              <Sparkles className="mr-1.5 size-3.5 text-amber-400" /> Optimize Route in Trip Copilot
            </Button>
          </div>

          {/* 2-COLUMN SPLIT LAYOUT (LEFT: STOP DETAILS NAVIGATOR / RIGHT: INTERACTIVE MAP) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* LEFT SIDE COLUMN: STOP DETAILS LIST (1 to 6) */}
            <div className="lg:col-span-4 flex flex-col rounded-3xl border border-zinc-800 bg-zinc-900/90 p-4 shadow-2xl space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="grid size-7 place-items-center rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs">
                    #1-6
                  </span>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Route Shrines Navigator</h3>
                    <p className="text-[10px] text-zinc-400">Click any stop to focus map pin</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMapCenter([10.5, 78.5]);
                    setMapZoom(7);
                  }}
                  className="text-[11px] font-semibold text-zinc-400 hover:text-amber-400 transition"
                >
                  Reset Map View ↺
                </button>
              </div>

              {/* Stops List (1 to 6) */}
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 scrollbar-none no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {arupadaiVeeduTemples.map((temple, idx) => {
                  const isSelected = selectedStopIndex === idx;
                  return (
                    <button
                      key={temple.slug}
                      onClick={() => handleSelectStop(idx)}
                      className={cn(
                        "w-full text-left p-3 rounded-2xl border transition-all duration-200 flex items-start gap-3 cursor-pointer group",
                        isSelected
                          ? "bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/40 text-white shadow-lg"
                          : "bg-zinc-950/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900"
                      )}
                    >
                      {/* Numbered Badge */}
                      <span className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-xl text-xs font-black transition-colors mt-0.5",
                        isSelected
                          ? "bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20"
                          : "bg-zinc-800 text-amber-400 border border-zinc-700 group-hover:bg-amber-500/20"
                      )}>
                        {idx + 1}
                      </span>

                      {/* Stop Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className={cn("text-xs font-extrabold truncate", isSelected ? "text-amber-300" : "text-white group-hover:text-amber-300")}>
                            {temple.name}
                          </h4>
                          <span className="text-[10px] font-mono text-amber-400 font-bold shrink-0">
                            ★ {temple.rating}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 truncate mt-0.5">{temple.district} District</p>
                        <p className="text-[11px] text-zinc-300 line-clamp-1 mt-1 font-medium">{temple.tagline}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT SIDE WORKSPACE: MAP CANVAS */}
            <div className="lg:col-span-8 rounded-3xl border border-amber-500/20 bg-zinc-950 p-2 shadow-2xl relative overflow-hidden flex flex-col justify-between">
              <Map center={mapCenter} zoom={mapZoom} style="dark" className="h-[520px] w-full rounded-2xl border-0">
                <MapControls position="top-right" />

                {/* Render Animated OSRM Multi-Waypoint Road Route Line */}
                {displayRoutePoints.length > 1 && (
                  <MapRoute coordinates={displayRoutePoints} animated color="#f59e0b" weight={4} />
                )}

                {/* Render All 6 Temple Markers */}
                {arupadaiVeeduTemples.map((temple, idx) => {
                  const isSelected = selectedStopIndex === idx;
                  return (
                    <MapMarker key={temple.slug} latitude={temple.coords![0]} longitude={temple.coords![1]}>
                      <MarkerContent>
                        <button
                          onClick={() => handleSelectStop(idx)}
                          className={cn(
                            "flex size-7 items-center justify-center rounded-full font-black text-xs transition-transform shadow-lg cursor-pointer",
                            isSelected
                              ? "bg-amber-400 text-zinc-950 scale-125 ring-4 ring-amber-400/50"
                              : "bg-amber-500 text-zinc-950 hover:scale-110 ring-2 ring-zinc-950"
                          )}
                        >
                          {idx + 1}
                        </button>
                      </MarkerContent>
                      <MarkerTooltip>{temple.tagline}</MarkerTooltip>
                      <MarkerPopup title={temple.name} rating={temple.rating}>
                        <p className="text-xs text-muted-foreground">{temple.district} District · Stop #{idx + 1}</p>
                        <Button asChild size="sm" className="mt-2 w-full rounded-lg text-[11px]">
                          <Link to="/place/$slug" params={{ slug: temple.slug }}>
                            View Place Details
                          </Link>
                        </Button>
                      </MarkerPopup>
                    </MapMarker>
                  );
                })}
              </Map>
            </div>
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
