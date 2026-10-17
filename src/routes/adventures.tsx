import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Search, Compass, Flame, Filter, SlidersHorizontal, Sparkles } from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { AdventureCard } from "@/components/site/adventure-card";
import { AdventureDetailModal } from "@/components/site/adventure-detail-modal";
import { adventureActivities, adventureCategories, AdventureActivity, AdventureCategory, AdventureDifficulty } from "@/data/adventures";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/adventures")({
  head: () => ({
    meta: [
      { title: "Adventure Activities in India — ExplorerTN" },
      {
        name: "description",
        content:
          "Discover top 10 adventure activities across India: Paragliding in Bir Billing, Scuba Diving in Andaman, Skydiving in Mysore, River Rafting in Rishikesh, and Surfing in Goa.",
      },
      { property: "og:title", content: "Adventure Activities in India — ExplorerTN" },
      {
        property: "og:description",
        content: "Discover and plan extreme air, water, mountain, and snow adventures across India.",
      },
    ],
  }),
  component: AdventuresPage,
});

function AdventuresPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AdventureCategory>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"popularity" | "name">("popularity");
  const [activeModalActivity, setActiveModalActivity] = useState<AdventureActivity | null>(null);

  const filteredActivities = useMemo(() => {
    return adventureActivities
      .filter((activity) => {
        // 1. Search Query Filter
        const query = searchQuery ? searchQuery.toLowerCase().trim() : "";
        const matchesQuery =
          !query ||
          activity.name.toLowerCase().includes(query) ||
          activity.destination.toLowerCase().includes(query) ||
          activity.state.toLowerCase().includes(query) ||
          activity.category.toLowerCase().includes(query) ||
          activity.tags.some((t) => t.toLowerCase().includes(query));

        // 2. Category Filter
        const matchesCategory =
          selectedCategory === "All" || activity.category === selectedCategory;

        // 3. Difficulty Filter
        const matchesDifficulty =
          selectedDifficulty === "All" || activity.difficulty === selectedDifficulty;

        return matchesQuery && matchesCategory && matchesDifficulty;
      })
      .sort((a, b) => {
        if (sortBy === "popularity") {
          return b.popularityScore - a.popularityScore;
        }
        return a.name.localeCompare(b.name);
      });
  }, [searchQuery, selectedCategory, selectedDifficulty, sortBy]);

  return (
    <AppShell>
      {/* Detail Modal Overlay */}
      <AdventureDetailModal
        activity={activeModalActivity}
        onClose={() => setActiveModalActivity(null)}
      />

      {/* Hero Header Section */}
      <section className="relative overflow-hidden pt-28 pb-12 sm:pt-36 sm:pb-16 bg-gradient-to-b from-sky-50 via-white to-slate-50 border-b border-sky-100">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100/50 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/95 px-4 py-1.5 text-xs font-bold text-sky-700 shadow-sm"
            >
              <Flame className="size-4 text-sky-600" />
              <span>19 Curated Adventure Expeditions in Tamil Nadu & India</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-900 font-display"
            >
              Adventure Activities <br />
              <span className="bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent font-black">
                in Tamil Nadu & India
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed"
            >
              Explore top outdoor thrills: Scuba diving in Rameswaram, paragliding in Yelagiri, 70 hairpin off-roading in Kolli Hills, surfing at Kovalam Chennai, Mudumalai wildlife safaris, and high-altitude treks. Click any adventure to view full GPS coordinates, gear requirements, how to reach, and safety protocols.
            </motion.p>
          </div>

          {/* Search & Filter Controls */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-12 gap-3 pt-6 border-t border-slate-200">
            {/* Search Input */}
            <div className="relative sm:col-span-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search activity or destination (e.g. Bir Billing, Skydiving, Goa)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 rounded-2xl bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500 shadow-sm"
              />
            </div>

            {/* Difficulty Selector */}
            <div className="sm:col-span-3">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full h-12 rounded-2xl bg-white border border-slate-200 px-4 text-sm text-slate-800 focus:border-sky-500 focus:ring-sky-500 font-medium shadow-sm"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Moderate">Moderate</option>
                <option value="Advanced">Advanced</option>
                <option value="Extreme">Extreme</option>
              </select>
            </div>

            {/* Sort Selector */}
            <div className="sm:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "popularity" | "name")}
                className="w-full h-12 rounded-2xl bg-white border border-slate-200 px-4 text-sm text-slate-800 focus:border-sky-500 focus:ring-sky-500 font-medium shadow-sm"
              >
                <option value="popularity">Sort: Most Popular</option>
                <option value="name">Sort: Name (A–Z)</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-4 flex flex-wrap items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {adventureCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-sky-600 text-white font-bold shadow-md shadow-sky-600/20"
                    : "bg-white hover:bg-sky-50 text-slate-700 border border-slate-200 shadow-sm"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Grid Content */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-500 dark:text-muted-foreground">
            Showing <span className="text-slate-900 dark:text-white font-bold">{filteredActivities.length}</span> adventure activities
          </p>
          {(searchQuery || selectedCategory !== "All" || selectedDifficulty !== "All") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSelectedDifficulty("All");
              }}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {filteredActivities.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredActivities.map((activity) => (
              <AdventureCard
                key={activity.id}
                activity={activity}
                onSelect={(act) => setActiveModalActivity(act)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 dark:border-white/15 p-12 text-center">
            <Compass className="mx-auto size-12 text-slate-400 mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No adventure activities found</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-muted-foreground">
              Try adjusting your search criteria or category filter.
            </p>
          </div>
        )}
      </section>
    </AppShell>
  );
}
