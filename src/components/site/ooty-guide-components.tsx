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
  OOTY_SEASON_GUIDES,
  OOTY_OVERALL_BEST_WINDOW,
  OOTY_FOOD_SPOTS,
  OOTY_MUST_VISIT_PLACES,
  OOTY_TRANSIT_OPTIONS,
  OOTY_TRAVEL_TIPS,
  OotySeasonGuide,
  OotyFoodSpot,
  OotyMustVisitPlace,
  OotyTransitOption,
  OotyTravelTip
} from "@/lib/data/ooty-guide-data";

export function OotyComprehensiveGuide() {
  const [activeTab, setActiveTab] = useState<"must-visit" | "food" | "seasons" | "transit" | "tips">("must-visit");

  return (
    <div className="w-full space-y-8 pt-8 border-t border-slate-800 text-slate-200">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-950/60 via-slate-900 to-indigo-950/40 p-6 md:p-8 backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-semibold uppercase tracking-wider">
              <span>🌲</span> Queen of Hill Stations — Complete Nilgiris Directory
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Ooty Complete Travel & Culinary Guide
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Curated from on-ground traveler insights: 12 must-visit tourist landmarks, 5 top food spots & cafes, 4 seasonal weather guides, transit connections, and essential travel tips.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
            <div className="flex items-center gap-2.5 px-2">
              <span className="text-2xl">🌟</span>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Best Window</p>
                <p className="text-xs font-bold text-amber-300">{OOTY_OVERALL_BEST_WINDOW.window}</p>
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
                ? "bg-sky-500 text-white shadow-lg shadow-sky-500/25"
                : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span>⛰️</span> 12 Must-Visit Places ({OOTY_MUST_VISIT_PLACES.length})
          </button>

          <button
            onClick={() => setActiveTab("food")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "food"
                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span>🍽️</span> Top Food Spots & Cafes ({OOTY_FOOD_SPOTS.length})
          </button>

          <button
            onClick={() => setActiveTab("seasons")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "seasons"
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span>🌸</span> Best Time to Visit (4 Seasons)
          </button>

          <button
            onClick={() => setActiveTab("transit")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "transit"
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span>🚂</span> Public Transit (Air / Train / Bus)
          </button>

          <button
            onClick={() => setActiveTab("tips")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "tips"
                ? "bg-pink-500 text-white shadow-lg shadow-pink-500/25"
                : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span>💡</span> 8 Smart Travel Tips
          </button>
        </div>
      </div>

      {/* TAB 1: 12 MUST-VISIT PLACES */}
      {activeTab === "must-visit" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🌟</span> Top 12 Attractions in Ooty
            </h3>
            <span className="text-xs text-slate-400">Complete scenic circuit</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {OOTY_MUST_VISIT_PLACES.map((place) => (
              <div
                key={place.id}
                className="group relative flex flex-col rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-sky-500/40 hover:bg-slate-900 transition-all duration-300 overflow-hidden"
              >
                {/* Image */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                  <img
                    src={place.image}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />
                  
                  {/* Rank badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white font-mono text-xs font-bold flex items-center gap-1.5">
                    <span className="text-amber-400">#{place.rank}</span>
                    <span>{place.category}</span>
                  </div>

                  {/* Elevation */}
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-sky-500/20 backdrop-blur-md border border-sky-500/30 text-sky-300 font-mono text-[11px]">
                    {place.elevation}m MSL
                  </div>

                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <span className="font-semibold text-amber-300">★ {place.rating}</span>
                    <span className="text-slate-300 text-[11px]">({place.reviewsCount.toLocaleString()} reviews)</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                      {place.name}
                    </h4>
                    <p className="text-xs text-sky-400/90 font-medium mt-0.5 line-clamp-1">
                      {place.tagline}
                    </p>
                    <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                      {place.description}
                    </p>
                  </div>

                  {/* Highlights tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
                    {place.highlights.map((h, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                        ✓ {h}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{place.timings}</span>
                    </div>
                    <span className="text-emerald-400 font-medium">{place.entryFee}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: TOP FOOD SPOTS */}
      {activeTab === "food" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>🍽️</span> 5 Must-Try Food Spots & Cafes in Ooty
              </h3>
              <p className="text-xs text-slate-400 mt-1">Colonial glasshouses, blue mountain cafes, sizzlers, pure vegetarian & artisan bakeries</p>
            </div>
            <span className="text-xs text-amber-400 font-mono bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Foodie Verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {OOTY_FOOD_SPOTS.map((spot) => (
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
                    <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Must Try Specialties:</p>
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

      {/* TAB 3: 4 SEASONS GUIDE */}
      {activeTab === "seasons" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Recommended Travel Window</span>
                <h3 className="text-2xl font-black text-white mt-1">
                  Overall Best: {OOTY_OVERALL_BEST_WINDOW.window}
                </h3>
                <p className="text-sm text-slate-300 mt-1">
                  {OOTY_OVERALL_BEST_WINDOW.tagline}
                </p>
              </div>
              <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                💡 <span className="font-semibold">{OOTY_OVERALL_BEST_WINDOW.recommendation}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {OOTY_SEASON_GUIDES.map((season) => (
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

      {/* TAB 4: PUBLIC TRANSIT OPTIONS */}
      {activeTab === "transit" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🚂</span> How to Reach Ooty by Public Transit
            </h3>
            <span className="text-xs text-slate-400">Flight, Toy Train & Road Connections</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {OOTY_TRANSIT_OPTIONS.map((opt) => (
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
                      <span className="text-sky-400 mt-0.5">ℹ️</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: 8 SMART TRAVEL TIPS */}
      {activeTab === "tips" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>💡</span> 8 Smart Ooty Travel Tips
            </h3>
            <span className="text-xs text-slate-400">Essential on-ground checklist</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {OOTY_TRAVEL_TIPS.map((tip) => (
              <div
                key={tip.step}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col justify-between hover:border-pink-500/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{tip.icon}</span>
                    <span className="text-xs font-mono font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-md border border-pink-500/20">
                      Tip #{tip.step}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{tip.title}</h4>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {tip.advice}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <p className="text-[11px] text-pink-300/90 font-medium">
                    ⚡ {tip.actionableHint}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
