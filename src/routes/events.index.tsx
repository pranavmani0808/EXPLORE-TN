import React, { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/site/app-shell";
import { getEventsList } from "@/lib/data/events-data";
import { EventCategory, ExploreTNEvent } from "@/lib/types/events";
import { EventDiscoveryCard } from "@/components/events/event-discovery-card";
import { EventDiscoveryMap } from "@/components/events/event-discovery-map";
import { FestivalCalendarSection } from "@/components/events/festival-calendar-section";
import { SuggestFestivalModal } from "@/components/events/suggest-festival-modal";
import {
  CalendarDays,
  Search,
  MapPin,
  SlidersHorizontal,
  Compass,
  X,
  Sparkles,
  Map,
  List,
  Calendar,
  PlusCircle,
  AlertTriangle,
  ArrowRight
} from "lucide-react";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "Discover Events, Festivals & Group Trips — ExploreTN" },
      {
        name: "description",
        content:
          "Find trips, concerts, festivals, marathons, cultural celebrations, workshops and experiences happening across Tamil Nadu.",
      },
      {
        property: "og:title",
        content: "Discover What's Happening Across Tamil Nadu — ExploreTN",
      },
      {
        property: "og:description",
        content:
          "Explore Tamil Nadu not only by places, but by experiences happening across Tamil Nadu.",
      },
    ],
  }),
  component: EventsPage,
});

const CATEGORIES: Array<{ id: EventCategory | "all"; label: string; icon: string }> = [
  { id: "all", label: "All Experiences", icon: "✨" },
  { id: "trips", label: "Group Trips", icon: "🧳" },
  { id: "music", label: "Music & Concerts", icon: "🎵" },
  { id: "festivals", label: "Festivals", icon: "🪔" },
  { id: "sports", label: "Sports & Marathons", icon: "🏃" },
  { id: "awareness", label: "Awareness & Social", icon: "❤️" },
  { id: "environment", label: "Environment", icon: "🌱" },
  { id: "culture", label: "Culture & Arts", icon: "🎭" },
  { id: "workshops", label: "Workshops", icon: "🎓" },
  { id: "business", label: "Business & Networking", icon: "💼" },
  { id: "photography", label: "Photography", icon: "📸" },
  { id: "food", label: "Food", icon: "🍴" },
  { id: "wellness", label: "Wellness", icon: "🧘" },
  { id: "auto", label: "Auto & Travel Meets", icon: "🏍️" },
  { id: "family", label: "Family", icon: "👨‍👩‍👧" },
  { id: "seasonal", label: "Seasonal Celebrations", icon: "🎄" },
];

const LOCATIONS = [
  "All Tamil Nadu",
  "Chennai",
  "Madurai",
  "Coimbatore",
  "Ooty",
  "Kodaikanal",
  "Salem",
  "Tiruchirappalli",
  "Tirunelveli",
  "Nagercoil",
  "Kanyakumari",
  "Tiruvannamalai",
  "Namakkal"
];

function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "all">("all");
  const [selectedLocation, setSelectedLocation] = useState("All Tamil Nadu");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "weekend" | "month">("all");
  const [viewMode, setViewMode] = useState<"list" | "map" | "calendar">("list");
  const [showSuggestModal, setShowSuggestModal] = useState(false);

  const [allEvents, setAllEvents] = useState(() => getEventsList());

  React.useEffect(() => {
    const handleEventsChange = () => {
      setAllEvents(getEventsList());
    };
    window.addEventListener("etn_events_updated", handleEventsChange);
    return () => window.removeEventListener("etn_events_updated", handleEventsChange);
  }, []);

  // Filter events
  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      // Category filter
      if (selectedCategory !== "all" && event.category !== selectedCategory) {
        return false;
      }

      // Location filter
      if (selectedLocation !== "All Tamil Nadu") {
        const loc = selectedLocation.toLowerCase();
        const matchesLoc =
          event.locationName.toLowerCase().includes(loc) ||
          event.district.toLowerCase().includes(loc) ||
          (event.districtSlug && event.districtSlug.toLowerCase().includes(loc));
        if (!matchesLoc) return false;
      }

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = event.title.toLowerCase().includes(q);
        const matchesDesc = event.shortDescription.toLowerCase().includes(q) || event.fullDescription.toLowerCase().includes(q);
        const matchesDistrict = event.district.toLowerCase().includes(q);
        const matchesLocation = event.locationName.toLowerCase().includes(q);
        const matchesTags = event.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesDistrict && !matchesLocation && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [allEvents, selectedCategory, selectedLocation, searchQuery, dateFilter]);

  return (
    <AppShell>
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
        {/* HERO BANNER SECTION */}
        <section className="relative overflow-hidden border-b border-sky-100 bg-gradient-to-b from-sky-100/60 via-white to-slate-50 py-14 sm:py-20 px-4 sm:px-6">
          <div className="absolute top-0 right-1/4 size-96 rounded-full bg-sky-400/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 size-80 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-6xl mx-auto space-y-5 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 border border-sky-200 text-sky-800 text-xs font-bold uppercase tracking-wider shadow-sm">
              <Sparkles className="size-3.5 text-sky-600 animate-pulse" />
              <span>ExploreTN Experiences & Festivals Hub</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-display text-slate-900 tracking-tight leading-tight">
              Discover What's Happening <br className="hidden sm:inline" />
              <span className="text-sky-600">
                Across Tamil Nadu
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
              Find trips, concerts, festivals, marathons, cultural celebrations, workshops and experiences happening across Tamil Nadu. Explore not only by places, but by living moments.
            </p>

            {/* Quick Stats Pill */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm">
                <span className="size-2 rounded-full bg-sky-500" />
                <strong className="text-slate-900">{allEvents.length}</strong> Curated Experiences
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm">
                <span className="size-2 rounded-full bg-amber-500" />
                All 38 Districts Connected
              </span>
              <button
                type="button"
                onClick={() => setShowSuggestModal(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition cursor-pointer font-semibold shadow-sm"
              >
                <PlusCircle className="size-3.5" /> Suggest a Festival
              </button>
            </div>
          </div>
        </section>

        {/* CONTROLS BAR: SEARCH, LOCATION, VIEW TOGGLE */}
        <section className="sticky top-16 z-30 bg-white/95 backdrop-blur-xl border-b border-sky-100 py-3.5 px-4 sm:px-6 shadow-sm">
          <div className="max-w-7xl mx-auto space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="size-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search events, trips, festivals, music, marathons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {/* Location Dropdown */}
              <div className="flex items-center gap-2">
                <div className="relative shrink-0">
                  <MapPin className="size-3.5 text-sky-600 absolute left-3 top-3 pointer-events-none" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="pl-8 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer appearance-none"
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc} className="bg-white text-slate-900">
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* View Mode Toggle: List, Map, Calendar */}
                <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      viewMode === "list"
                        ? "bg-white text-sky-700 shadow-sm font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <List className="size-3.5" />
                    <span>Cards</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("map")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      viewMode === "map"
                        ? "bg-white text-sky-700 shadow-sm font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Map className="size-3.5" />
                    <span>Map View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("calendar")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      viewMode === "calendar"
                        ? "bg-white text-sky-700 shadow-sm font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Calendar className="size-3.5" />
                    <span>Festivals</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Horizontal Scrollable Category Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 border shrink-0 ${
                      isSelected
                        ? "bg-sky-500 text-white border-sky-400 font-extrabold shadow-sm shadow-sky-500/20"
                        : "bg-white text-slate-700 border-slate-200 hover:border-sky-300 hover:text-sky-700"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* MAIN BODY CONTENT */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-12">
          {/* MAP VIEW */}
          {viewMode === "map" && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
                    <MapPin className="size-5 text-emerald-400" />
                    Geospatial Event Discovery
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Click any marker to preview event details or open its full itinerary
                  </p>
                </div>
              </div>
              <EventDiscoveryMap events={filteredEvents} />
            </section>
          )}

          {/* CALENDAR VIEW */}
          {viewMode === "calendar" && (
            <section className="space-y-6">
              <FestivalCalendarSection />
            </section>
          )}

          {/* CARDS LIST VIEW */}
          {viewMode === "list" && (
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                  <span className="font-bold text-white text-sm">
                    {filteredEvents.length}
                  </span>
                  <span>Experiences Found</span>
                  {selectedLocation !== "All Tamil Nadu" && (
                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      in {selectedLocation}
                    </span>
                  )}
                  {selectedCategory !== "all" && (
                    <span className="bg-teal-500/10 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/20">
                      Category: {CATEGORIES.find((c) => c.id === selectedCategory)?.label}
                    </span>
                  )}
                </div>

                {(searchQuery || selectedCategory !== "all" || selectedLocation !== "All Tamil Nadu") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setSelectedLocation("All Tamil Nadu");
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                  >
                    <X className="size-3" /> Reset Filters
                  </button>
                )}
              </div>

              {filteredEvents.length === 0 ? (
                <div className="py-20 text-center space-y-4 bg-zinc-950/60 rounded-3xl border border-zinc-800/80 p-8">
                  <AlertTriangle className="size-12 text-amber-400 mx-auto opacity-75" />
                  <h3 className="font-display font-bold text-lg text-white">
                    No events or festivals found
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    We couldn't find any experiences matching your current filters. Try searching another district or resetting filters.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setSelectedLocation("All Tamil Nadu");
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30 transition"
                  >
                    View All Experiences
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event) => (
                    <EventDiscoveryCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ALWAYS AT BOTTOM: FESTIVAL CALENDAR HIGHLIGHT */}
          {viewMode !== "calendar" && (
            <section className="pt-8">
              <FestivalCalendarSection />
            </section>
          )}
        </main>

        {/* Suggest a Festival Modal */}
        <SuggestFestivalModal
          isOpen={showSuggestModal}
          onClose={() => setShowSuggestModal(false)}
        />
      </div>
    </AppShell>
  );
}
