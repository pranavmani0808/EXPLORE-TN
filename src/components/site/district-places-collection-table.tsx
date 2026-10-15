import React, { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Compass,
  MapPin,
  Utensils,
  Mountain,
  Droplets,
  Waves,
  Search,
  ChevronRight,
  ExternalLink,
  Star,
  Clock,
  Sparkles,
  Table as TableIcon,
  Filter
} from "lucide-react";
import { DistrictData, DistrictSpot } from "@/lib/data/districts";

interface DistrictPlacesCollectionTableProps {
  district: DistrictData;
  spots?: DistrictSpot[];
  onSelectSpot?: (spot: DistrictSpot) => void;
}

type CollectionCategoryFilter = "all" | "tourist-spots" | "food-spots" | "temples" | "hills" | "falls" | "beaches";

export function DistrictPlacesCollectionTable({
  district,
  spots,
  onSelectSpot
}: DistrictPlacesCollectionTableProps) {
  const activeSpots = spots || district.spots || [];
  const [selectedCategory, setSelectedCategory] = useState<CollectionCategoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Categories count
  const categoryStats = useMemo(() => {
    return {
      all: activeSpots.length,
      tourist: activeSpots.filter((s) => s.category === "tourist-spots").length,
      food: activeSpots.filter((s) => s.category === "food-spots").length,
      temples: activeSpots.filter((s) => s.category === "temples").length,
      hills: activeSpots.filter((s) => s.category === "hills").length,
      falls: activeSpots.filter((s) => s.category === "falls").length,
      beaches: activeSpots.filter((s) => s.category === "beaches").length,
    };
  }, [activeSpots]);

  // Filtered rows
  const filteredSpots = useMemo(() => {
    return activeSpots.filter((s) => {
      const matchesCategory = selectedCategory === "all" || s.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q) ||
        s.categoryLabel.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.highlights.some((h) => h.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [district.spots, selectedCategory, searchQuery]);

  const getCategoryBadge = (category: DistrictSpot["category"], label: string) => {
    switch (category) {
      case "tourist-spots":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">🏛️ Tourist Spot</span>;
      case "food-spots":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">🍲 Food & Sweets</span>;
      case "temples":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">🛕 Temple</span>;
      case "hills":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">⛰️ Hills & Forest</span>;
      case "falls":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">💦 Waterfalls</span>;
      case "beaches":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">🌊 Beach & Shore</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300">{label}</span>;
    }
  };

  return (
    <div className="w-full space-y-6 pt-10 border-t border-slate-200 my-10 text-slate-800">
      {/* Table Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-600">
              <TableIcon className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {district.name} Places Collection Table
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-xs font-mono font-bold">
              {district.spots.length} Places Mapped
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Categorized database table of tourist spots, iconic foods, temples, hill ranges, and water bodies across {district.name}, synced with Supabase collections.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${district.name} collection...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 shadow-xs"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            selectedCategory === "all"
              ? "bg-sky-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          All Places ({categoryStats.all})
        </button>

        {categoryStats.tourist > 0 && (
          <button
            onClick={() => setSelectedCategory("tourist-spots")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === "tourist-spots"
                ? "bg-sky-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            🏛️ Tourist Spots ({categoryStats.tourist})
          </button>
        )}

        {categoryStats.food > 0 && (
          <button
            onClick={() => setSelectedCategory("food-spots")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === "food-spots"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            🍲 Food & Sweets ({categoryStats.food})
          </button>
        )}

        {categoryStats.temples > 0 && (
          <button
            onClick={() => setSelectedCategory("temples")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === "temples"
                ? "bg-orange-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            🛕 Temples ({categoryStats.temples})
          </button>
        )}

        {categoryStats.hills > 0 && (
          <button
            onClick={() => setSelectedCategory("hills")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === "hills"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            ⛰️ Hills & Forests ({categoryStats.hills})
          </button>
        )}

        {categoryStats.falls > 0 && (
          <button
            onClick={() => setSelectedCategory("falls")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === "falls"
                ? "bg-cyan-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            💦 Waterfalls & Dams ({categoryStats.falls})
          </button>
        )}

        {categoryStats.beaches > 0 && (
          <button
            onClick={() => setSelectedCategory("beaches")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === "beaches"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            🌊 Beaches ({categoryStats.beaches})
          </button>
        )}
      </div>

      {/* Structured Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-mono uppercase text-slate-500">
                <th className="py-3.5 px-4">Place / Spot Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Key Highlights / Must-Try</th>
                <th className="py-3.5 px-4 hidden lg:table-cell">Timings & Access</th>
                <th className="py-3.5 px-4 text-right">Rating</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSpots.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No places found matching the current search or category filter.
                  </td>
                </tr>
              ) : (
                filteredSpots.map((spot, idx) => (
                  <tr
                    key={spot.id}
                    className="hover:bg-sky-50/50 transition-colors group cursor-pointer"
                    onClick={() => onSelectSpot && onSelectSpot(spot)}
                  >
                    {/* Place Name & Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={spot.image}
                          alt={spot.name}
                          className="size-11 rounded-xl object-cover shrink-0 border border-slate-200 group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-1">
                            {spot.name}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-1 max-w-[220px]">
                            {spot.tagline}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getCategoryBadge(spot.category, spot.categoryLabel)}
                    </td>

                    {/* Highlights / Must Try */}
                    <td className="py-3 px-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {spot.mustTry && spot.mustTry.length > 0
                          ? spot.mustTry.slice(0, 2).map((item, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-medium">
                                ⭐ {item}
                              </span>
                            ))
                          : spot.highlights.slice(0, 2).map((h, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-100 text-[10px] font-medium">
                                ✓ {h}
                              </span>
                            ))}
                      </div>
                    </td>

                    {/* Timings */}
                    <td className="py-3 px-4 hidden lg:table-cell text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Clock className="size-3 text-amber-600 shrink-0" />
                        <span className="truncate max-w-[150px]">{spot.timings}</span>
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="size-3 fill-amber-500 text-amber-500" />
                        <span>{spot.rating}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({spot.reviewsCount >= 1000 ? `${(spot.reviewsCount / 1000).toFixed(1)}k` : spot.reviewsCount})
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectSpot) onSelectSpot(spot);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-600 hover:text-white text-sky-700 text-[11px] font-semibold border border-sky-200 transition-all inline-flex items-center gap-1"
                      >
                        <span>Focus</span>
                        <ChevronRight className="size-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
