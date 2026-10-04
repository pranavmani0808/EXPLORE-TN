import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Sun,
  Cloud,
  Thermometer,
  Calendar,
  Utensils,
  Car,
  Compass,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Plane,
  Train,
  Bus,
  Lightbulb,
  ExternalLink,
  Info
} from "lucide-react";
import {
  KODAI_SEASON_GUIDES,
  KODAI_OVERALL_BEST_WINDOW,
  KODAI_FOOD_SPOTS,
  KODAI_TRANSIT_OPTIONS,
  KODAI_MUST_VISIT_PLACES_SUMMARY,
  KodaiSeasonGuide,
  KodaiFoodSpot,
  KodaiTransitOption,
  KodaiMustVisitPlaceSummary
} from "@/lib/data/kodaikanal-guide-data";

export function KodaiFoodAndTravelGuide() {
  const [activeTab, setActiveTab] = useState<"must-visit" | "food" | "seasons" | "transit">("must-visit");

  return (
    <div className="w-full space-y-6 pt-8 border-t border-slate-800 text-slate-200">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/60 via-slate-900 to-teal-950/40 p-6 md:p-8 backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold uppercase tracking-wider">
              <span>☕</span> Princess of Hill Stations — Curated Attractions, Dining & Seasons
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Kodaikanal Complete Travel Directory
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Curated on-ground guide covering 27 top scenic spots (Coaker's Walk, Bryant Park, Pillar Rocks, Star Lake, Guna Caves, Silver Cascade, Moir Point, Pine Forest, Green Valley, Dolphin's Nose, Echo Point, Poondi, Kilavarai, Polur Falls, Mannavanur, Poombarai, Escape Route to Vattavada, Vilpatti, Pannaikadu, Chettiar Park, Perumalmalai, Pachamalai, Berijam, Kurinji & Kuzhanthai Velappar Temples, and Vattakanal Falls), plus dining & seasonal travel.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
            <div className="flex items-center gap-2.5 px-2">
              <span className="text-2xl">🌟</span>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Best Window</p>
                <p className="text-xs font-bold text-amber-300">{KODAI_OVERALL_BEST_WINDOW.window}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none mt-8 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab("must-visit")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "must-visit"
                ? "bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/25"
                : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span>⛰️</span> 27 Must-Visit Spots ({KODAI_MUST_VISIT_PLACES_SUMMARY.length})
          </button>

          <button
            onClick={() => setActiveTab("food")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "food"
                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span>🍽️</span> 7 Top Food Spots & Cafes ({KODAI_FOOD_SPOTS.length})
          </button>

          <button
            onClick={() => setActiveTab("seasons")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "seasons"
                ? "bg-teal-500 text-white shadow-lg shadow-teal-500/25"
                : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span>🌸</span> Best Time to Visit (3 Seasons)
          </button>

          <button
            onClick={() => setActiveTab("transit")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "transit"
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span>🚌</span> Public Transit (Air / Train / Bus)
          </button>
        </div>
      </div>

      {/* TAB 0: 27 MUST-VISIT PLACES */}
      {activeTab === "must-visit" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>🌟</span> 27 Must-Visit Attractions Across Kodaikanal
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Lakes, waterfalls, high summits, ancient megalithic dolmens, flower parks & historic escape routes
              </p>
            </div>
            <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              {KODAI_MUST_VISIT_PLACES_SUMMARY.length} Verified Spots
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {KODAI_MUST_VISIT_PLACES_SUMMARY.map((place) => (
              <div
                key={place.slug}
                className="group relative flex flex-col justify-between p-4 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-emerald-500/50 hover:bg-slate-900 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      #{place.rank}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      {place.elevation} MSL
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xl">{place.icon}</span>
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {place.name}
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block mt-1">
                    {place.category}
                  </span>

                  <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                    {place.tagline}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{place.timings}</span>
                  </div>
                  <span className="text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                    Explore →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 1: 7 FOOD SPOTS */}
      {activeTab === "food" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>🍽️</span> 7 Must-Try Dining Venues in Kodaikanal
              </h3>
              <p className="text-xs text-slate-400 mt-1">Colonial luxury, artisanal molten hot chocolates, scenic lakeview grills, and Pan-Asian bowls</p>
            </div>
            <span className="text-xs text-amber-400 font-mono bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Verified Kodai Flavors
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {KODAI_FOOD_SPOTS.map((spot) => (
              <div
                key={spot.slug}
                className="group relative flex flex-col rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-amber-500/40 hover:bg-slate-900 transition-all duration-300 overflow-hidden"
              >
                <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                  <img
                    src={spot.image}
                    alt={spot.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />
                  
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white font-mono text-xs font-bold flex items-center gap-1.5">
                    <span className="text-amber-400">#{spot.rank}</span>
                    <span>{spot.typeIcon} {spot.category}</span>
                  </div>

                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <span className="font-semibold text-amber-300">★ {spot.rating}</span>
                    <span className="text-slate-300 text-[11px]">Cost: {spot.approxCostForTwo}</span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                      {spot.name}
                    </h4>
                    <p className="text-xs text-amber-400/90 font-medium mt-0.5 line-clamp-1">
                      {spot.tagline}
                    </p>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {spot.description}
                    </p>
                  </div>

                  {/* Specialties */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                    <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Signature Specialties:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {spot.specialties.map((item, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{spot.timings}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span className="truncate max-w-[120px]">{spot.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SEASONS */}
      {activeTab === "seasons" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Recommended Travel Window</span>
                <h3 className="text-2xl font-black text-white mt-1">
                  Overall Best: {KODAI_OVERALL_BEST_WINDOW.window}
                </h3>
                <p className="text-sm text-slate-300 mt-1">
                  {KODAI_OVERALL_BEST_WINDOW.tagline}
                </p>
              </div>
              <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                💡 <span className="font-semibold">{KODAI_OVERALL_BEST_WINDOW.recommendation}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {KODAI_SEASON_GUIDES.map((season) => (
              <div
                key={season.seasonKey}
                className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden flex flex-col"
              >
                <div className="relative h-44 w-full bg-slate-950">
                  <img
                    src={season.image}
                    alt={season.seasonTitle}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${season.badgeColor}`}>
                      {season.badge}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-4 right-4">
                    <h4 className="text-lg font-bold text-white">{season.seasonTitle}</h4>
                    <p className="text-xs text-slate-300 font-mono mt-0.5">{season.months} • {season.weather.temp}</p>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {season.description}
                  </p>

                  <div className="space-y-2">
                    <p className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">Top Activities & Experiences:</p>
                    <ul className="space-y-1.5">
                      {season.activities.map((act, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-emerald-400 mt-0.5">✦</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Conditions:</span>
                      <span className="text-slate-200 font-medium">{season.weather.condition}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>What to Pack:</span>
                      <span className="text-amber-300 font-medium">{season.weather.clothing}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TRANSIT */}
      {activeTab === "transit" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🚌</span> How to Reach Kodaikanal by Public Transit
            </h3>
            <span className="text-xs text-slate-400">Air via Madurai, Train via Kodai Road/Palani & Buses</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {KODAI_TRANSIT_OPTIONS.map((opt) => (
              <div
                key={opt.mode}
                className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30">
                      {opt.icon}
                    </span>
                    <div>
                      <h4 className="text-base font-bold text-white">{opt.title}</h4>
                      <p className="text-[11px] text-indigo-400 font-mono mt-0.5">Recommended transit</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                    🛣️ {opt.route}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {opt.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-800">
                  <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Transit Tips:</p>
                  {opt.tips.map((tip, i) => (
                    <div key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5">ℹ️</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
