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
  Route as RouteIcon,
} from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/ui/safe-image";
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
      to: "/routes",
      search: {
        destination: "palani-murugan-temple",
      },
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
      {/* Light Sky & White Hero Banner Section */}
      <section className="relative min-h-[50vh] w-full overflow-hidden bg-gradient-to-b from-sky-50 via-white to-slate-50 border-b border-sky-100">
        {/* Layer 0: Background Temple Hero Image with subtle opacity */}
        <img
          src={arupadaiVeeduTemples[2]?.image || arupadaiVeeduTemples[0]?.image}
          alt="Arupadai Veedu Trail - Sacred Murugan Abodes"
          className="absolute inset-0 size-full object-cover object-center opacity-15 pointer-events-none"
        />

        {/* Ambient subtle sky overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-100/60 via-white/80 to-slate-50/90 pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-14 pt-20 sm:px-6 sm:pt-28">
          <div className="max-w-3xl">
            {/* Sacred Circuit Badge */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/95 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-700 shadow-sm"
            >
              <Flame className="size-3.5 text-amber-500" /> Sacred Tamil Nadu Circuit
            </motion.p>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-4xl font-extrabold leading-tight text-slate-900 sm:text-6xl tracking-tight font-display"
            >
              ARUPADAI VEEDU
              <br />
              <span className="bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent font-black">
                Six Sacred Abodes
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-base font-medium leading-relaxed text-slate-600 sm:text-lg max-w-2xl"
            >
              Journey through the six sacred abodes of Lord Murugan across Tamil Nadu — from hilltops to sea shores.
            </motion.p>

            {/* CTA & Metadata Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center"
            >
              <Button
                onClick={handlePlanWithAI}
                size="lg"
                className="rounded-2xl bg-sky-600 px-6 py-6 font-bold text-white hover:bg-sky-700 shadow-lg shadow-sky-600/20 transition-all cursor-pointer"
              >
                <RouteIcon className="mr-2 size-4 text-white" /> Plan Route on Map{" "}
                <ArrowRight className="ml-2 size-4 text-white" />
              </Button>

              <div className="flex flex-wrap items-center gap-2.5">
                <span className="flex items-center gap-1.5 rounded-full border border-sky-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                  <MapPin className="size-3.5 text-emerald-600" /> 6 Sacred Shrines
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-sky-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                  <Navigation className="size-3.5 text-sky-600" /> ~1,200 km Circuit
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-sky-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                  <Calendar className="size-3.5 text-indigo-600" /> Recommended: 3–4 Days
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content Container with Split 2-Column Trail Map & Shrines Navigator */}
      <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6">
        {/* Interactive Route Map Section */}
        <div className="mb-14 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-xs font-mono font-bold text-sky-700">
                  Sequential Road Route 1 → 6
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  ~1,200 km Total Circuit
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-display mt-1">
                Interactive Trail Map & Route Navigator
              </h2>
            </div>
            <Button
              onClick={handlePlanWithAI}
              variant="outline"
              size="sm"
              className="rounded-xl border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-800"
            >
              <RouteIcon className="mr-1.5 size-3.5 text-sky-600" /> Plan Route on Map
            </Button>
          </div>

          {/* 2-COLUMN SPLIT LAYOUT (LEFT: STOP DETAILS NAVIGATOR / RIGHT: INTERACTIVE MAP) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* LEFT SIDE COLUMN: STOP DETAILS LIST (1 to 6) */}
            <div className="lg:col-span-4 flex flex-col rounded-3xl border border-sky-100 bg-white p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="grid size-7 place-items-center rounded-lg bg-sky-100 text-sky-700 font-bold text-xs">
                    #1-6
                  </span>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Route Shrines Navigator</h3>
                    <p className="text-[10px] text-slate-500">Click any stop to focus map pin</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMapCenter([10.5, 78.5]);
                    setMapZoom(7);
                  }}
                  className="text-[11px] font-semibold text-slate-500 hover:text-sky-600 transition cursor-pointer"
                >
                  Reset View ↺
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
                          ? "bg-sky-50/90 border-sky-300 ring-2 ring-sky-400/30 text-slate-900 shadow-sm"
                          : "bg-white border-slate-200/80 text-slate-700 hover:border-sky-200 hover:bg-sky-50/40"
                      )}
                    >
                      {/* Numbered Badge */}
                      <span
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-xl text-xs font-black transition-colors mt-0.5",
                          isSelected
                            ? "bg-sky-600 text-white shadow-sm"
                            : "bg-sky-100 text-sky-700 border border-sky-200 group-hover:bg-sky-600 group-hover:text-white"
                        )}
                      >
                        {idx + 1}
                      </span>

                      {/* Stop Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4
                            className={cn(
                              "text-xs font-bold truncate",
                              isSelected ? "text-sky-900 font-extrabold" : "text-slate-900 group-hover:text-sky-600"
                            )}
                          >
                            {temple.name}
                          </h4>
                          <span className="text-[10px] font-mono text-amber-600 font-bold shrink-0">
                            ★ {temple.rating}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{temple.district} District</p>
                        <p className="text-[11px] text-slate-600 line-clamp-1 mt-1 font-medium">{temple.tagline}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT SIDE WORKSPACE: MAP CANVAS */}
            <div className="lg:col-span-8 rounded-3xl border border-sky-200/80 bg-white p-2 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <Map center={mapCenter} zoom={mapZoom} style="outdoors" className="h-[520px] w-full rounded-2xl border border-sky-100">
                <MapControls position="top-right" />

                {/* Render Animated OSRM Multi-Waypoint Road Route Line */}
                {displayRoutePoints.length > 1 && (
                  <MapRoute coordinates={displayRoutePoints} animated color="#0284c7" weight={4} />
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
                            "flex size-7 items-center justify-center rounded-full font-black text-xs transition-transform shadow-md cursor-pointer",
                            isSelected
                              ? "bg-sky-600 text-white scale-125 ring-4 ring-sky-300"
                              : "bg-sky-500 text-white hover:scale-110 ring-2 ring-white"
                          )}
                        >
                          {idx + 1}
                        </button>
                      </MarkerContent>
                      <MarkerTooltip>{temple.tagline}</MarkerTooltip>
                      <MarkerPopup title={temple.name} rating={temple.rating}>
                        <p className="text-xs text-slate-600">{temple.district} District · Stop #{idx + 1}</p>
                        <Button asChild size="sm" className="mt-2 w-full rounded-lg text-[11px] bg-sky-600 hover:bg-sky-700 text-white">
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
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">Explore All Six Sacred Destinations</h2>
              <p className="text-sm text-slate-500">
                In canonical Arupadai Veedu order across Tamil Nadu.
              </p>
            </div>
            <span className="rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-xs font-semibold text-sky-700">
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
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm transition-all duration-300 hover:border-sky-300 hover:shadow-lg"
                >
                  {/* Position Order Badge */}
                  <div className="absolute left-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-sky-700 backdrop-blur-md border border-sky-200 shadow-sm">
                    <span>{String(idx + 1).padStart(2, "0")}</span>
                    <span className="text-slate-400">/ 06</span>
                  </div>

                  {/* Image Header */}
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    <SafeImage
                      src={temple.image}
                      alt={temple.name}
                      category="temple"
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Card Content */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="size-3.5 text-sky-600" />
                      <span>{temple.district} District</span>
                    </div>

                    <h3 className="mt-2 text-lg font-bold text-slate-900 group-hover:text-sky-600 transition leading-snug">
                      {temple.name}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-xs text-slate-600 leading-relaxed">
                      {temple.tagline}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-3">
                      <span>Timings: {temple.timings}</span>
                      <span className="font-semibold text-emerald-600">Verified Shrine</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-5 grid grid-cols-2 gap-2 pt-2">
                      <Button asChild variant="outline" size="sm" className="rounded-xl text-xs border-sky-200 text-sky-700 hover:bg-sky-50">
                        <Link to="/place/$slug" params={{ slug: temple.slug }}>
                          View Place
                        </Link>
                      </Button>

                      <Button
                        onClick={() => handleAddToTrip(temple.slug)}
                        size="sm"
                        className={
                          isAdded
                            ? "rounded-xl text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "rounded-xl text-xs bg-sky-600 text-white hover:bg-sky-700 font-semibold shadow-sm"
                        }
                      >
                        {isAdded ? (
                          <>
                            <Check className="mr-1 size-3.5 text-emerald-600" /> Added
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
        <div className="mt-16 rounded-3xl bg-gradient-to-br from-sky-50 via-white to-sky-100/50 border border-sky-200 p-8 text-center shadow-sm">
          <div className="mx-auto max-w-xl">
            <span className="grid size-12 place-items-center rounded-2xl bg-sky-100 text-sky-600 mx-auto">
              <RouteIcon className="size-6" />
            </span>
            <h3 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl font-display">
              Plan the Arupadai Veedu Route on Interactive Map
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Explore the six sacred Murugan shrines with road routing, live turn-by-turn geometry, distance, and district checkpoints.
            </p>
            <Button
              onClick={handlePlanWithAI}
              size="lg"
              className="mt-6 rounded-2xl bg-sky-600 text-white hover:bg-sky-700 font-bold px-8 shadow-md shadow-sky-600/25"
            >
              <RouteIcon className="mr-2 size-4" /> Open Fullscreen Route Map <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
