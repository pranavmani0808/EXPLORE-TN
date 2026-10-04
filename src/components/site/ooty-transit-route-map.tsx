import React, { useState } from "react";
import {
  Compass,
  Navigation,
  Train,
  MapPin,
  Clock,
  Sparkles,
  Mountain,
  Trees,
  Footprints,
  Info,
  Car,
  ChevronRight,
  Filter
} from "lucide-react";
import {
  OOTY_ROUTE_SPINE_STATIONS,
  OOTY_ROUTE_MAP_BRANCHES,
  OotyRouteBranchSpot,
  OotySpineStation
} from "@/lib/data/ooty-guide-data";

export function OotyTransitRouteMap() {
  const [selectedHub, setSelectedHub] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeSpot, setActiveSpot] = useState<OotyRouteBranchSpot | null>(null);

  const filteredSpots = OOTY_ROUTE_MAP_BRANCHES.filter((s) => {
    const hubMatch = selectedHub === "all" || s.connectedHub === selectedHub;
    const catMatch = selectedCategory === "all" || s.category === selectedCategory;
    return hubMatch && catMatch;
  });

  const categories = [
    { key: "all", label: "All Spots", icon: "📍" },
    { key: "viewpoint", label: "Viewpoints", icon: "🌄" },
    { key: "garden", label: "Gardens & Parks", icon: "🌸" },
    { key: "lake", label: "Lakes & Boating", icon: "🚤" },
    { key: "heritage", label: "Heritage & Railway", icon: "🏛️" },
    { key: "wildlife", label: "Wildlife & Forests", icon: "🐅" },
    { key: "activity", label: "Activities & Spots", icon: "🏇" },
  ];

  return (
    <div className="w-full rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950/40 p-6 md:p-10 shadow-2xl space-y-8 text-slate-200">
      {/* 1. Header Banner: Exact Title from Infographic with Clean Modern Vibe */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
            <span>🚂</span> UNESCO Heritage Transit Spine & Distances
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight font-display">
            EXPLORE OOTY
          </h2>
          <p className="text-base font-semibold text-emerald-300/90 tracking-widest uppercase">
            Route Map & Distance Guide
          </p>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Main mountain highway spine starting from Mettupalayam (Coimbatore) ascending through Kallar and Ketti to Ooty Bus Stand & Railway Station, continuing towards Gudalur, Mudumalai & Mysuru.
          </p>
        </div>

        {/* Quick Quick Stat Chips */}
        <div className="flex flex-wrap sm:flex-nowrap gap-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-center min-w-[110px]">
            <p className="text-[10px] uppercase font-mono text-slate-400">Total Waypoints</p>
            <p className="text-xl font-black text-emerald-400">{OOTY_ROUTE_MAP_BRANCHES.length} Spots</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-center min-w-[110px]">
            <p className="text-[10px] uppercase font-mono text-slate-400">Ghat Elevation</p>
            <p className="text-xl font-black text-sky-400">2,240m MSL</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-center min-w-[110px]">
            <p className="text-[10px] uppercase font-mono text-slate-400">Hairpin Bends</p>
            <p className="text-xl font-black text-amber-400">36 Curves</p>
          </div>
        </div>
      </div>

      {/* 2. Interactive Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedCategory(c.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                selectedCategory === c.key
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                  : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <span>{c.icon}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Filter className="w-3.5 h-3.5 text-emerald-400" />
          <span>Showing {filteredSpots.length} mapped branch stops</span>
        </div>
      </div>

      {/* 3. The Vertical Route Map & Transit Spine (Interactive Schematic Tree) */}
      <div className="relative rounded-3xl border border-slate-800/90 bg-slate-950/90 p-4 sm:p-8 overflow-hidden backdrop-blur-xl">
        {/* Background Subtle Mountain & Misty Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Central Highway / Railway Spine Line */}
        <div className="relative max-w-4xl mx-auto space-y-12">
          
          {/* Top Starting Point: Coimbatore (Mettupalayam) */}
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30">
              <span>🟢</span> START OF GHAT CORRIDOR
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
              COIMBATORE (METTUPALAYAM)
            </h3>
            <p className="text-xs text-slate-400 font-mono">Elevation: 325m MSL • Foothills Junction & Toy Train Origin</p>
            <div className="w-5 h-5 rounded-full border-4 border-emerald-400 bg-slate-950 mt-3 shadow-md" />
            <div className="w-1 h-12 bg-gradient-to-b from-emerald-400 to-emerald-600" />
          </div>

          {/* Sub-station: Kallar (12 KM) */}
          <div className="flex flex-col items-center text-center relative z-10 -my-6">
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-full shadow-md">
              <span className="text-xs font-bold text-white">KALLAR</span>
              <span className="text-[11px] font-mono text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                12 KM
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Start of 36 Ghat Hairpin Bends & Burliar slopes</p>
            <div className="w-1 h-16 bg-gradient-to-b from-emerald-600 to-sky-500" />
          </div>

          {/* SECTION 1: METTUPALAYAM TO KETTI SECTOR BRANCHES */}
          <div className="relative py-2">
            <div className="text-center mb-6">
              <span className="px-3 py-1 rounded-lg bg-sky-950/70 border border-sky-500/30 text-sky-300 font-mono text-[11px] uppercase">
                🌲 Kallar – Coonoor – Ketti Sector
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
              {/* Left Side: Valley & Coonoor Viewpoints */}
              <div className="space-y-3">
                <p className="text-[11px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Navigation className="w-3 h-3 text-sky-400 rotate-180" /> Left Mountain Branches:
                </p>
                {OOTY_ROUTE_MAP_BRANCHES.filter(b => b.connectedHub === "mettupalayam-ketti" && b.side === "left").map((spot) => (
                  <div
                    key={spot.name}
                    onClick={() => setActiveSpot(spot)}
                    className="cursor-pointer group flex items-center justify-between p-3.5 rounded-2xl border border-slate-800 bg-slate-900/70 hover:border-sky-500/50 hover:bg-slate-900 transition-all duration-200"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                          {spot.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{spot.description}</p>
                    </div>
                    <span className="shrink-0 ml-3 px-2.5 py-1 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 font-mono text-xs font-bold">
                      {spot.distanceDisplay}
                    </span>
                  </div>
                ))}
              </div>

              {/* Right Side: Downs, Pine Forest, Lovedale */}
              <div className="space-y-3">
                <p className="text-[11px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Navigation className="w-3 h-3 text-emerald-400" /> Right Forest & Meadows Branches:
                </p>
                {OOTY_ROUTE_MAP_BRANCHES.filter(b => b.connectedHub === "mettupalayam-ketti" && b.side === "right").map((spot) => (
                  <div
                    key={spot.name}
                    onClick={() => setActiveSpot(spot)}
                    className="cursor-pointer group flex items-center justify-between p-3.5 rounded-2xl border border-slate-800 bg-slate-900/70 hover:border-emerald-500/50 hover:bg-slate-900 transition-all duration-200"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {spot.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{spot.description}</p>
                    </div>
                    <span className="shrink-0 ml-3 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold">
                      {spot.distanceDisplay}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Central Vertical Connector */}
            <div className="flex justify-center my-6">
              <div className="w-1 h-16 bg-gradient-to-b from-sky-500 to-indigo-500" />
            </div>
          </div>

          {/* Sub-station: KETTI */}
          <div className="flex flex-col items-center text-center relative z-10 -my-4">
            <div className="flex items-center gap-3 bg-indigo-950 border border-indigo-500/40 px-5 py-2 rounded-full shadow-lg">
              <span className="text-sm font-extrabold text-white">KETTI VALLEY INTERCHANGE</span>
              <span className="text-[11px] font-mono text-indigo-300">2,150m MSL</span>
            </div>
            
            {/* Ketti Local branches: Shooting Spot & Horse Ride */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              {OOTY_ROUTE_MAP_BRANCHES.filter(b => b.connectedHub === "ooty-ketti").map(spot => (
                <div
                  key={spot.name}
                  onClick={() => setActiveSpot(spot)}
                  className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-400 text-xs text-slate-300"
                >
                  <MapPin className="w-3 h-3 text-indigo-400" />
                  <span className="font-semibold">{spot.name}</span>
                  <span className="font-mono text-[10px] text-amber-400 font-bold">({spot.distanceDisplay})</span>
                </div>
              ))}
            </div>

            <div className="w-1 h-16 bg-gradient-to-b from-indigo-500 to-amber-500 mt-4" />
          </div>

          {/* Central Major Hub: OOTY BUS STAND (Nerve Centre) */}
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="w-10 h-10 rounded-full border-4 border-amber-400 bg-amber-500/20 flex items-center justify-center text-amber-300 shadow-xl shadow-amber-500/20 mb-2">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg">
              <span>⭐</span> CENTRAL TRANSIT HUB
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">
              OOTY BUS STAND
            </h3>
            <p className="text-xs text-slate-400 font-mono">Elevation: 2,240m MSL • Central Node for Town Attractions</p>

            {/* Ooty Town Core Attractions Star Cluster (Right branches from Bus Stand) */}
            <div className="w-full mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-left">
              {OOTY_ROUTE_MAP_BRANCHES.filter(b => b.connectedHub === "ooty-bus-stand").map((spot) => (
                <div
                  key={spot.name}
                  onClick={() => setActiveSpot(spot)}
                  className="cursor-pointer group p-3.5 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-amber-400/50 hover:bg-slate-900 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        {spot.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-bold">
                        {spot.distanceDisplay}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{spot.description}</p>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-2 flex items-center gap-1 font-mono">
                    <span>From Ooty Bus Stand</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-1 h-14 bg-gradient-to-b from-amber-500 to-rose-500 mt-6" />
          </div>

          {/* Heritage Railway Node: OOTY RAILWAY STATION */}
          <div className="flex flex-col items-center text-center relative z-10 -my-4">
            <div className="flex items-center gap-3 bg-slate-900 border border-rose-500/40 px-5 py-2 rounded-full shadow-md">
              <Train className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-extrabold text-white">OOTY RAILWAY STATION</span>
              <span className="text-[11px] font-mono text-rose-300 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                1.5 KM
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">UNESCO Mountain Toy Train Terminus • 2,210m MSL</p>

            <div className="w-1 h-16 bg-gradient-to-b from-rose-500 to-emerald-500 mt-4" />
          </div>

          {/* SECTION 2: COONOOR SPUR & GUDALUR HIGHWAY BRANCHES */}
          <div className="relative py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Coonoor Town & Temple Spur */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🍊</span> Coonoor & Burliar Spur
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Southeastern Sector</span>
                </div>

                {OOTY_ROUTE_MAP_BRANCHES.filter(b => b.connectedHub === "coonoor-spur").map((spot) => (
                  <div
                    key={spot.name}
                    onClick={() => setActiveSpot(spot)}
                    className="cursor-pointer group flex items-center justify-between p-3.5 rounded-2xl border border-slate-800 bg-slate-900/70 hover:border-amber-400/50 hover:bg-slate-900 transition-all duration-200"
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        {spot.name}
                      </span>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{spot.description}</p>
                    </div>
                    <span className="shrink-0 ml-3 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-xs font-bold">
                      {spot.distanceDisplay}
                    </span>
                  </div>
                ))}
              </div>

              {/* West / Gudalur Highway Sector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🌊</span> Pykara, Avalanche & Mudumalai
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Northwest Highway</span>
                </div>

                {OOTY_ROUTE_MAP_BRANCHES.filter(b => b.connectedHub === "ooty-gudalur").map((spot) => (
                  <div
                    key={spot.name}
                    onClick={() => setActiveSpot(spot)}
                    className="cursor-pointer group flex items-center justify-between p-3.5 rounded-2xl border border-slate-800 bg-slate-900/70 hover:border-emerald-400/50 hover:bg-slate-900 transition-all duration-200"
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {spot.name}
                      </span>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{spot.description}</p>
                    </div>
                    <span className="shrink-0 ml-3 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-xs font-bold">
                      {spot.distanceDisplay}
                    </span>
                  </div>
                ))}
              </div>

            </div>

            <div className="flex justify-center my-6">
              <div className="w-1 h-14 bg-gradient-to-b from-emerald-500 to-teal-400" />
            </div>
          </div>

          {/* Bottom Destination: GUDALUR & MYSURU (BANDIPUR) */}
          <div className="flex flex-col items-center text-center relative z-10 pt-2">
            <div className="w-5 h-5 rounded-full border-4 border-teal-400 bg-slate-950 mb-3 shadow-md" />
            <h3 className="text-xl sm:text-2xl font-black text-white">
              GUDALUR
            </h3>
            <p className="text-xs text-slate-400 font-mono">Gateway to Mudumalai Tiger Reserve & Kerala Border</p>
            
            <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
              <span>⬇️</span>
              <span>CONTINUES TOWARDS: </span>
              <span className="text-teal-300 font-bold">MYSURU (BANDIPUR TIGER RESERVE)</span>
            </div>
          </div>

        </div>

        {/* 4. Heritage Mountain Steam Toy Train Footer Graphic */}
        {/* Recreating the iconic blue steam train of the Nilgiri Mountain Railway without watermarks */}
        <div className="relative mt-12 pt-8 border-t border-slate-800/80">
          <div className="relative overflow-hidden rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-300 font-mono text-xs font-bold">
                <span>🚂</span> UNESCO World Heritage Train #56136
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-white">
                Nilgiri Mountain Railway Steam Express
              </h4>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Operating since 1908 on the Swiss Abt Rack & Pinion mechanism. Ascending 46 km through 16 mountain tunnels, 250 stone viaduct bridges, and dense evergreen tea slopes.
              </p>
            </div>

            {/* Stylized Mountain Steam Locomotive SVG Art */}
            <div className="shrink-0 flex items-center gap-3 bg-black/40 border border-white/10 px-5 py-4 rounded-2xl backdrop-blur-md">
              <div className="text-4xl animate-bounce-subtle">🚂</div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white">Mettupalayam ➔ Ooty</p>
                <p className="text-[11px] text-amber-400 font-mono">07:10 AM Daily Departure</p>
                <p className="text-[10px] text-slate-400">Advance IRCTC Booking Recommended</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 5. Selected Spot Quick Glance Card */}
      {activeSpot && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/40 flex items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-lg">
              📍
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h5 className="text-sm font-bold text-white">{activeSpot.name}</h5>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold">
                  {activeSpot.distanceDisplay}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{activeSpot.description}</p>
            </div>
          </div>

          <button
            onClick={() => setActiveSpot(null)}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
