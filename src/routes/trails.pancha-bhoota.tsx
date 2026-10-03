import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  MapPin,
  Navigation,
  ArrowRight,
  Plus,
  Check,
  Calendar,
  Sparkles,
  Route as RouteIcon,
  Flame,
  Droplets,
  Wind,
  Globe,
  SunMedium,
} from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import { panchaBhootaTemples, DEFAULT_PANCHA_BHOOTA_TEMPLES, type Place } from "@/data/places";
import { cn } from "@/lib/utils";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
  MapControls,
  MapRoute,
} from "@/components/ui/map";

export const Route = createFileRoute("/trails/pancha-bhoota")({
  head: () => ({
    meta: [
      { title: "Pancha Bhoota Sthalams Trail — Five Sacred Elemental Shiva Temples | ExplorerTN" },
      {
        name: "description",
        content:
          "Explore the five sacred Shiva temples embodying the fundamental elements of nature: Earth (Kanchipuram), Water (Thiruvanaikaval), Fire (Tiruvannamalai), Air (Srikalahasti), and Space (Chidambaram).",
      },
      { property: "og:title", content: "Pancha Bhoota Sthalams Trail — ExplorerTN" },
      {
        property: "og:description",
        content:
          "Embark on the sacred Five Elements circuit across Tamil Nadu and Srikalahasti with interactive road routing and spiritual highlights.",
      },
    ],
  }),
  component: PanchaBhootaTrailPage,
});

function PanchaBhootaTrailPage() {
  const navigate = useNavigate();
  const [addedTrips, setAddedTrips] = useState<Record<string, boolean>>({});
  const [osrmRoutePoints, setOsrmRoutePoints] = useState<Array<[number, number]>>([]);
  const [selectedStopIndex, setSelectedStopIndex] = useState<number>(0);
  const [mapCenter, setMapCenter] = useState<[number, number]>([12.2, 79.2]);
  const [mapZoom, setMapZoom] = useState<number>(7);

  const handleSelectStop = (index: number) => {
    setSelectedStopIndex(index);
    const temple = panchaBhootaTemples[index];
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
      to: "/routes",
      search: {
        destination: "arunachaleswarar-temple",
      },
    });
  };

  // Static fallback pin coordinates
  const staticTempleCoords: Array<[number, number]> = panchaBhootaTemples
    .map((t) => t.coords)
    .filter((c): c is [number, number] => c !== undefined);

  // Fetch real multi-waypoint OSRM road geometry connecting the 5 shrines
  // Route order: Kanchipuram (Earth) -> Srikalahasti (Air) -> Tiruvannamalai (Fire) -> Chidambaram (Space) -> Thiruvanaikaval (Water)
  useEffect(() => {
    let active = true;

    async function fetchTrailRoute() {
      try {
        const waypointsStr = panchaBhootaTemples
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
          src={panchaBhootaTemples[2]?.image || "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1600&q=80"}
          alt="Pancha Bhoota Sthalams Trail - Five Sacred Shiva Temples"
          className="absolute inset-0 size-full object-cover object-center opacity-60 z-0"
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
              className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-slate-900/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-400 backdrop-blur-md shadow-md"
            >
              <Sparkles className="size-3.5 text-orange-400" /> Sacred Pancha Bhoota Elemental Circuit
            </motion.p>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-4xl font-extrabold leading-tight text-white sm:text-6xl tracking-tight"
            >
              PANCHA BHOOTA
              <br />
              <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent font-black">
                Five Sacred Elements
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-base font-medium leading-relaxed text-slate-200 sm:text-lg max-w-2xl"
            >
              Journey through the five sacred temples of Lord Shiva where the universe’s five fundamental elements are manifested: Earth (Prithvi), Water (Appu), Fire (Agni), Air (Vayu), and Space (Akasha).
            </motion.p>

            {/* Five Elements Pill Badges */}
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                🌍 Earth · Kanchipuram
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 border border-blue-500/30 text-blue-300">
                💧 Water · Thiruvanaikaval
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 border border-red-500/30 text-red-300">
                🔥 Fire · Tiruvannamalai
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                💨 Air · Srikalahasti
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 border border-purple-500/30 text-purple-300">
                🌌 Space · Chidambaram
              </span>
            </div>

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
                className="rounded-xl bg-orange-500 px-6 py-6 font-extrabold text-slate-950 hover:bg-orange-400 shadow-xl shadow-orange-500/25 transition-all"
              >
                <RouteIcon className="mr-2 size-4 text-slate-950" /> Plan Circuit on Map{" "}
                <ArrowRight className="ml-2 size-4 text-slate-950" />
              </Button>

              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/90 px-3.5 py-1.5 text-xs font-semibold text-slate-100 backdrop-blur-md shadow-sm">
                  <MapPin className="size-3.5 text-orange-400" /> 5 Elemental Shrines
                </span>
                <span className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/90 px-3.5 py-1.5 text-xs font-semibold text-slate-100 backdrop-blur-md shadow-sm">
                  <Navigation className="size-3.5 text-sky-400" /> ~740 km Circuit
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
        {/* Interactive Map Section */}
        <div className="mb-14 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-orange-500/15 border border-orange-500/30 px-3 py-1 text-xs font-mono font-bold text-orange-400">
                  Sequential Road Route 1 → 5
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  ~740 km Total Circuit
                </span>
              </div>
              <h2 className="text-2xl font-black text-white font-display mt-1">
                Interactive Elemental Circuit Map & Road Navigator
              </h2>
            </div>
            <Button
              onClick={handlePlanWithAI}
              variant="outline"
              size="sm"
              className="rounded-xl border-orange-500/30 text-orange-300 hover:bg-orange-500/10"
            >
              <RouteIcon className="mr-1.5 size-3.5 text-orange-400" /> Plan Route on Map
            </Button>
          </div>

          {/* 2-COLUMN SPLIT LAYOUT (LEFT: STOP DETAILS NAVIGATOR / RIGHT: INTERACTIVE MAP) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* LEFT SIDE COLUMN: STOP DETAILS LIST (1 to 5) */}
            <div className="lg:col-span-4 flex flex-col rounded-3xl border border-zinc-800 bg-zinc-900/90 p-4 shadow-2xl space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="grid size-7 place-items-center rounded-lg bg-orange-500/20 text-orange-400 font-bold text-xs">
                    #1-5
                  </span>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400">
                      Elemental Shrines Navigator
                    </h3>
                    <p className="text-[10px] text-zinc-400">Click any stop to focus map pin</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMapCenter([12.2, 79.2]);
                    setMapZoom(7);
                  }}
                  className="text-[11px] font-semibold text-zinc-400 hover:text-orange-400 transition"
                >
                  Reset Map View ↺
                </button>
              </div>

              {/* Stops List (1 to 5) */}
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 scrollbar-none no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {DEFAULT_PANCHA_BHOOTA_TEMPLES.map((temple, idx) => {
                  const isSelected = selectedStopIndex === idx;
                  return (
                    <button
                      key={temple.slug}
                      onClick={() => handleSelectStop(idx)}
                      className={cn(
                        "w-full text-left p-3 rounded-2xl border transition-all duration-200 flex items-start gap-3 cursor-pointer group",
                        isSelected
                          ? "bg-orange-500/15 border-orange-500/60 ring-1 ring-orange-500/40 text-white shadow-lg"
                          : "bg-zinc-950/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900"
                      )}
                    >
                      {/* Numbered / Element Badge */}
                      <span
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-xl text-xs font-black transition-colors mt-0.5",
                          isSelected
                            ? "bg-orange-400 text-zinc-950 shadow-md shadow-orange-500/20"
                            : "bg-zinc-800 text-orange-400 border border-zinc-700 group-hover:bg-orange-500/20"
                        )}
                      >
                        {idx + 1}
                      </span>

                      {/* Stop Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4
                            className={cn(
                              "text-xs font-extrabold truncate",
                              isSelected ? "text-orange-300" : "text-white group-hover:text-orange-300"
                            )}
                          >
                            {temple.name}
                          </h4>
                          <span className="text-[10px] font-mono text-orange-400 font-bold shrink-0">
                            ★ {temple.rating}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-bold text-amber-400">{temple.elementSymbol} {temple.element}</span>
                          <span className="text-[10px] text-zinc-400">· {temple.district}</span>
                        </div>
                        <p className="text-[11px] text-zinc-300 line-clamp-1 mt-1 font-medium">{temple.tagline}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT SIDE WORKSPACE: MAP CANVAS */}
            <div className="lg:col-span-8 rounded-3xl border border-orange-500/20 bg-zinc-950 p-2 shadow-2xl relative overflow-hidden flex flex-col justify-between">
              <Map center={mapCenter} zoom={mapZoom} style="dark" className="h-[520px] w-full rounded-2xl border-0">
                <MapControls position="top-right" />

                {/* Render Animated OSRM Multi-Waypoint Road Route Line */}
                {displayRoutePoints.length > 1 && (
                  <MapRoute coordinates={displayRoutePoints} animated color="#f97316" weight={4} />
                )}

                {/* Render All 5 Temple Markers */}
                {DEFAULT_PANCHA_BHOOTA_TEMPLES.map((temple, idx) => {
                  const isSelected = selectedStopIndex === idx;
                  return (
                    <MapMarker key={temple.slug} latitude={temple.coords[0]} longitude={temple.coords[1]}>
                      <MarkerContent>
                        <button
                          onClick={() => handleSelectStop(idx)}
                          className={cn(
                            "flex size-8 items-center justify-center rounded-full font-black text-xs transition-transform shadow-lg cursor-pointer",
                            isSelected
                              ? "bg-orange-400 text-zinc-950 scale-125 ring-4 ring-orange-400/50"
                              : "bg-orange-500 text-zinc-950 hover:scale-110 ring-2 ring-zinc-950"
                          )}
                        >
                          {temple.elementSymbol}
                        </button>
                      </MarkerContent>
                      <MarkerTooltip>{temple.name} — {temple.element}</MarkerTooltip>
                      <MarkerPopup title={temple.name} rating={temple.rating}>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-orange-400">{temple.element} ({temple.elementTamil})</p>
                          <p className="text-xs text-muted-foreground">{temple.district} District · Stop #{idx + 1}</p>
                          <Button asChild size="sm" className="mt-2 w-full rounded-lg text-[11px] bg-orange-500 text-black hover:bg-orange-400">
                            <Link to="/place/$slug" params={{ slug: temple.slug }}>
                              View Place Details
                            </Link>
                          </Button>
                        </div>
                      </MarkerPopup>
                    </MapMarker>
                  );
                })}
              </Map>
            </div>
          </div>
        </div>

        {/* Five Destination Cards in Canonical Trail Order */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-2xl font-bold">Explore All Five Elemental Sthalams</h2>
              <p className="text-sm text-muted-foreground">
                In canonical Pancha Bhoota order: Earth, Water, Fire, Air, and Space.
              </p>
            </div>
            <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
              5 Sacred Elemental Nodes
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {DEFAULT_PANCHA_BHOOTA_TEMPLES.map((temple, idx) => {
              const isAdded = addedTrips[temple.slug];
              return (
                <motion.div
                  key={temple.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-elevate transition-all hover:border-orange-500/40 hover:shadow-glow"
                >
                  {/* Position Order & Element Badge */}
                  <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1 text-xs font-bold text-orange-400 backdrop-blur-md border border-orange-500/30">
                      <span>{String(idx + 1).padStart(2, "0")}</span>
                      <span className="text-muted-foreground">/ 05</span>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-black/75 px-3 py-1 text-xs font-bold text-amber-300 backdrop-blur-md border border-amber-500/30">
                      <span>{temple.elementSymbol}</span>
                      <span>{temple.element}</span>
                    </div>
                  </div>

                  {/* Image Header */}
                  <div className="relative h-56 overflow-hidden">
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
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-orange-400" />
                        <span>{temple.district} District</span>
                      </div>
                      <span className="font-mono text-orange-400 font-bold">★ {temple.rating}</span>
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
                            : "rounded-xl text-xs bg-orange-500 text-black hover:bg-orange-600 font-semibold"
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
            <span className="grid size-12 place-items-center rounded-2xl bg-orange-500/20 text-orange-400 mx-auto text-xl">
              🔱
            </span>
            <h3 className="mt-4 text-2xl font-bold sm:text-3xl">Plan the Pancha Bhoota Route on Interactive Map</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Explore the five elemental Shiva temples with live road routing, turn-by-turn geometry, distance, and district checkpoints.
            </p>
            <Button
              onClick={handlePlanWithAI}
              size="lg"
              className="mt-6 rounded-xl bg-orange-500 text-black hover:bg-orange-600 font-bold px-8 shadow-lg shadow-orange-500/20"
            >
              <RouteIcon className="mr-2 size-4" /> Open Fullscreen Route Map <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
