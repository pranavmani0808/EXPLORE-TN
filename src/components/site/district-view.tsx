import { useState, useMemo, useRef, useEffect } from "react";
import { DistrictData, DistrictCategoryKey, DistrictSpot } from "@/lib/data/districts";
import { DistrictExplorerMap } from "@/components/site/district-explorer-map";
import MaskedHeading from "@/components/ui/masked-heading";
import { Skiper76Showcase, Skiper76Item } from "@/components/ui/skiper76";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Star,
  Clock,
  Search,
  Utensils,
  ShoppingBag,
  Landmark,
  Compass,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Map,
  ArrowRight,
  Dot,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { getHillDestinationIntelligence } from "@/lib/data/hill-region-intelligence";
import {
  DestinationHillIntelligenceCard,
  MapFacilityLayerToggle,
  MapFacilityFilterState,
} from "@/components/site/hill-region-intelligence-components";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface DistrictViewProps {
  district: DistrictData;
}

const CATEGORY_TABS: { key: DistrictCategoryKey; label: string; icon: string }[] = [
  { key: "all", label: "All Spots", icon: "📍" },
  { key: "temples", label: "Temples", icon: "🛕" },
  { key: "tourist-spots", label: "Tourist Spots", icon: "🏛️" },
  { key: "food-spots", label: "Food Spots", icon: "🍲" },
  { key: "thrift-streets", label: "Thrift Streets", icon: "🛍️" },
];

export function DistrictView({ district }: DistrictViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const spotScrollRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DistrictCategoryKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSpotId, setActiveSpotId] = useState<string | null>(null);

  const hillDestinationIntel = getHillDestinationIntelligence(district.slug);
  const [facilityFilters, setFacilityFilters] = useState<MapFacilityFilterState>({
    parking: true,
    food: true,
    fuel: true,
    restroom: false,
    medical: false,
    hotels: false,
    shops: false,
    water: false,
    network: false,
  });

  const handleScrollLeft = () => {
    if (spotScrollRef.current) {
      spotScrollRef.current.scrollBy({ left: -420, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (spotScrollRef.current) {
      spotScrollRef.current.scrollBy({ left: 420, behavior: "smooth" });
    }
  };

  useEffect(() => {
    setIsMounted(true);
    // Reset active spot when changing districts
    if (district.spots.length > 0) {
      setActiveSpotId(district.spots[0].id);
    }
  }, [district]);

  // Filter spots based on category & search query
  const filteredSpots = useMemo(() => {
    return district.spots.filter((spot) => {
      const matchesCategory = selectedCategory === "all" || spot.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.highlights.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (spot.mustTry && spot.mustTry.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase())));

      return matchesCategory && matchesSearch;
    });
  }, [district.spots, selectedCategory, searchQuery]);

  const counts = useMemo(() => {
    return {
      temples: district.spots.filter((s) => s.category === "temples").length,
      tourist: district.spots.filter((s) => s.category === "tourist-spots").length,
      food: district.spots.filter((s) => s.category === "food-spots").length,
      thrift: district.spots.filter((s) => s.category === "thrift-streets").length,
    };
  }, [district.spots]);

  // Transform district spots for Skiper76 Apple-style showcase
  const skiperItems: Skiper76Item[] = useMemo(() => {
    return district.spots.map((spot) => ({
      id: spot.id,
      title: spot.name,
      subtitle: spot.tagline,
      category: spot.categoryLabel,
      description: spot.description,
      image: spot.image,
      rating: spot.rating,
      address: spot.address,
      highlights: spot.highlights,
      swatches: [
        { label: "Golden Hour", color: "#f59e0b", imageFilter: "contrast(1.08) saturate(1.15)" },
        { label: "Night Illumination", color: "#3b82f6", imageFilter: "brightness(0.9) contrast(1.15) hue-rotate(15deg)" },
        { label: "Heritage View", color: "#10b981", imageFilter: "sepia(0.2) contrast(1.05)" },
      ],
    }));
  }, [district.spots]);

  // GSAP Entrance & Scroll Animations (Instant text readability & no scroll delays)
  useGSAP(
    () => {
      // 1. Subtle smooth entrance for hero elements without opacity delays
      gsap.from(".gsap-hero-center-badge", { y: -8, duration: 0.4, ease: "power2.out" });
      gsap.from(".gsap-hero-center-card", { y: 10, duration: 0.4, ease: "power2.out" });

      // 2. Ensure all spot cards and sections are immediately fully visible
      gsap.set(".gsap-spot-card, #district-map-section, .gsap-spotlight-box", {
        opacity: 1,
        y: 0,
        x: 0,
      });
    },
    { scope: containerRef, dependencies: [district, selectedCategory, searchQuery] }
  );

  const handleSpotFocus = (spot: DistrictSpot) => {
    setActiveSpotId(spot.id);

    // Pulse animation on map element when focused
    const mapElem = document.getElementById("sticky-district-map");
    if (mapElem) {
      gsap.fromTo(
        mapElem,
        { scale: 0.99 },
        { scale: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  };

  const handleCategoryTabClick = (key: DistrictCategoryKey, e: React.MouseEvent) => {
    setSelectedCategory(key);
    gsap.fromTo(
      e.currentTarget,
      { scale: 0.92 },
      { scale: 1, duration: 0.4, ease: "elastic.out(1.2, 0.4)" }
    );
  };

  return (
    <div ref={containerRef} className="relative min-h-screen bg-zinc-950 text-foreground font-sans overflow-x-hidden">
      {/* ============================================================ */}
      {/* FIXED FULL-PAGE BACKGROUND HERO IMAGE LAYER                   */}
      {/* ============================================================ */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={district.heroImage}
          alt={`${district.name} Fixed Background`}
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80";
          }}
          className="h-full w-full object-cover object-center opacity-30 scale-105 filter brightness-90 contrast-105 saturate-110"
        />
        {/* Multi-stage Luxury Gradient & Dot Grid Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/85 to-zinc-950/95" />
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px] opacity-15" />
      </div>

      <div className="relative z-10">
        {/* ============================================================ */}
        {/* 1. TOP HERO TITLE BLOCK                                      */}
        {/* ============================================================ */}
        <div className="relative overflow-hidden bg-transparent pt-28 pb-12 text-left">
        {/* Visible Background Hero Image Layer with Right-Side Showcase Gradient */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={district.heroImage}
            alt={`${district.name} Hero`}
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80";
            }}
            className="gsap-hero-bg h-full w-full object-cover object-right sm:object-center opacity-90 scale-105 filter brightness-95 contrast-105 saturate-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-950/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-transparent to-background" />
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(90deg,white,rgba(255,255,255,0.2))]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl space-y-4 text-left">
            {/* Left-Aligned Badges */}
            <div className="flex flex-wrap items-center justify-start gap-2.5">
              <Badge variant="secondary" className="gsap-hero-center-badge bg-amber-500/20 text-amber-300 border-amber-500/40 uppercase text-xs tracking-wider font-extrabold px-4 py-1.5 backdrop-blur-md">
                <Compass className="mr-1.5 size-4 text-amber-400" />
                {district.region} · District Guide
              </Badge>
              <Badge variant="outline" className="gsap-hero-center-badge text-zinc-200 border-zinc-700 bg-zinc-900/80 backdrop-blur-md text-xs font-semibold px-4 py-1.5">
                📅 Best Time: {district.overview.bestTimeToVisit}
              </Badge>
            </div>

            {/* Left-Aligned Title Block */}
            <div className="gsap-hero-center-title space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-amber-300 tracking-tight leading-none drop-shadow-2xl font-display">
                {district.name}
              </h1>
              <div className="py-1">
                <MaskedHeading
                  text={district.title}
                  tag="h2"
                  src={district.heroImage}
                  reveal="none"
                  trigger="mount"
                  fillScale={1.35}
                  parallax={30}
                  drift={16}
                  align="left"
                  textScale={0.065}
                  brightness={1.8}
                  saturation={1.3}
                  className="font-display font-black tracking-tight uppercase drop-shadow-[0_2px_10px_rgba(251,191,36,0.3)] filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. SPLIT SECTION (LEFT: DISTRICT OVERVIEW / RIGHT: STICKY MAP) */}
      {/* ============================================================ */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN (7 COLS): RICH DISTRICT DESCRIPTION & OVERVIEW */}
          <div className="lg:col-span-7 space-y-6">
            {/* 🏔️ DESTINATION-LEVEL HILL INTELLIGENCE (IF HILL REGION) */}
            {hillDestinationIntel && (
              <DestinationHillIntelligenceCard intel={hillDestinationIntel} />
            )}

            <div className="gsap-hero-center-card bg-zinc-900/90 border border-amber-500/40 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md space-y-5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">District Overview</h3>
                <p className="mt-1 text-lg sm:text-xl font-extrabold text-white leading-relaxed">
                  {district.tagline}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-zinc-800/80">
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                  <Landmark className="size-4 text-amber-400" />
                  <span>Heritage & History</span>
                </h4>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {district.overview.history}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-zinc-800/80">
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="size-4 text-emerald-400" />
                  <span>Culture & Craft Legacy</span>
                </h4>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {district.overview.culture}
                </p>
              </div>

              {/* Nicknames */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-zinc-400">Nicknames:</span>
                {district.overview.nicknames.map((nickname, nIdx) => (
                  <Badge key={nIdx} variant="outline" className="bg-zinc-800/80 border-zinc-700 text-zinc-200 text-xs">
                    {nickname}
                  </Badge>
                ))}
              </div>

              {/* Stat Pills */}
              <div className="flex flex-wrap items-center justify-start gap-3 pt-3 border-t border-zinc-800/80">
                <div className="gsap-stat-pill rounded-full border border-amber-500/30 bg-zinc-900/90 px-4 py-1.5 text-xs font-bold text-amber-300 flex items-center gap-1.5 backdrop-blur-md">
                  <Landmark className="size-3.5 text-amber-400" />
                  <span>{counts.temples} Temples</span>
                </div>
                <div className="gsap-stat-pill rounded-full border border-emerald-500/30 bg-zinc-900/90 px-4 py-1.5 text-xs font-bold text-emerald-400 flex items-center gap-1.5 backdrop-blur-md">
                  <Sparkles className="size-3.5 text-emerald-400" />
                  <span>{counts.tourist} Tourist Spots</span>
                </div>
                <div className="gsap-stat-pill rounded-full border border-orange-500/30 bg-zinc-900/90 px-4 py-1.5 text-xs font-bold text-orange-400 flex items-center gap-1.5 backdrop-blur-md">
                  <Utensils className="size-3.5 text-orange-400" />
                  <span>{counts.food} Food Legends</span>
                </div>
                <div className="gsap-stat-pill rounded-full border border-purple-500/30 bg-zinc-900/90 px-4 py-1.5 text-xs font-bold text-purple-300 flex items-center gap-1.5 backdrop-blur-md">
                  <ShoppingBag className="size-3.5 text-purple-300" />
                  <span>{counts.thrift} Bazaars</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (5 COLS): STICKY BOUNDARY-LOCKED MAP */}
          <div className="lg:col-span-5 sticky top-[140px] space-y-4">
            <div id="district-map-section" className="transform-gpu rounded-3xl border border-zinc-800 bg-zinc-900/95 p-4 shadow-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="grid size-7 place-items-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold">
                    <Map className="size-4" />
                  </span>
                  <div>
                    <h4 className="font-display font-bold text-sm text-white">{district.name} Boundary Map</h4>
                    <p className="text-[10px] text-zinc-400">Centered at [{district.centerCoords.join(", ")}]</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px]">
                  Live GIS Pins
                </Badge>
              </div>

              {/* Interactive Facility Layer Toggles */}
              <MapFacilityLayerToggle state={facilityFilters} onChange={setFacilityFilters} />

              {/* Leaflet Map Frame */}
              <div className="h-[440px] w-full rounded-2xl overflow-hidden border border-zinc-800 relative">
                {isMounted ? (
                  <DistrictExplorerMap
                    spots={district.spots}
                    centerCoords={district.centerCoords}
                    defaultZoom={district.defaultZoom}
                    selectedCategory={selectedCategory}
                    activeSpotId={activeSpotId}
                    onSelectSpot={(spot) => spot && setActiveSpotId(spot.id)}
                    facilityFilters={facilityFilters}
                    className="size-full"
                  />
                ) : (
                  <div className="size-full bg-zinc-950 flex items-center justify-center text-zinc-500 font-mono text-xs">
                    Loading {district.name} Boundary Map...
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                <span>📍 Boundary Locked</span>
                <span className="text-amber-400 font-semibold">{district.spots.length} Spots Mapped</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. FILTER & SEARCH CONTROL BAR                                */}
      {/* ============================================================ */}
      <div className="sticky top-[75px] z-30 py-2.5 my-2 pointer-events-none">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pointer-events-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/80 p-3 shadow-2xl">
            {/* Category Filter Tabs */}
            <div className="flex w-full sm:w-auto items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {CATEGORY_TABS.map((tab) => {
                const isActive = selectedCategory === tab.key;
                return (
                  <Button
                    key={tab.key}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={(e) => handleCategoryTabClick(tab.key, e)}
                    className={`rounded-full text-xs font-medium shrink-0 transition-all ${
                      isActive
                        ? "bg-amber-500 text-zinc-950 font-extrabold hover:bg-amber-400 shadow-md"
                        : "border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    <span className="mr-1.5">{tab.icon}</span>
                    {tab.label}
                  </Button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={`Search ${district.name} spots, landmarks...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 rounded-full bg-zinc-900/90 border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus-visible:ring-amber-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. DISTRICT SPOTS CATALOG LIST                                */}
      {/* ============================================================ */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div>
            <h3 className="font-display text-2xl font-bold text-white flex items-center gap-2">
              <span>{selectedCategory === "all" ? `All ${district.name} Spots` : CATEGORY_TABS.find((t) => t.key === selectedCategory)?.label}</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Scroll horizontally or click focus button to center any spot on the map
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs">
              {filteredSpots.length} Spots Active
            </Badge>
            {/* Left & Right Horizontal Scroll Navigation Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleScrollLeft}
                aria-label="Scroll left"
                className="grid size-8 place-items-center rounded-xl border border-zinc-800 bg-zinc-900/90 text-zinc-300 hover:border-amber-500/50 hover:bg-zinc-800 hover:text-amber-400 transition active:scale-95 shadow-md"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleScrollRight}
                aria-label="Scroll right"
                className="grid size-8 place-items-center rounded-xl border border-zinc-800 bg-zinc-900/90 text-zinc-300 hover:border-amber-500/50 hover:bg-zinc-800 hover:text-amber-400 transition active:scale-95 shadow-md"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {filteredSpots.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-800 p-12 text-center">
            <Compass className="mx-auto size-10 text-zinc-600 mb-3 animate-spin-slow" />
            <h4 className="font-bold text-base text-zinc-300">No Spots Found</h4>
            <p className="mt-1 text-xs text-zinc-400">No {district.name} spots match your search query.</p>
            <Button
              size="sm"
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="mt-4 bg-amber-500 text-zinc-950 hover:bg-amber-400 text-xs font-bold rounded-xl"
            >
              Reset Spot Filters
            </Button>
          </div>
        ) : (
          <div
            ref={spotScrollRef}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory py-2 pb-6 scrollbar-none scroll-smooth"
          >
            {filteredSpots.map((spot) => {
              const isSelected = activeSpotId === spot.id;
              return (
                <Card
                  key={spot.id}
                  onClick={() => handleSpotFocus(spot)}
                  className={`gsap-spot-card transform-gpu cursor-pointer overflow-hidden bg-zinc-900/95 border transition-all duration-300 shrink-0 w-[340px] sm:w-[400px] snap-start flex flex-col justify-between ${
                    isSelected
                      ? "border-emerald-500 ring-2 ring-emerald-500/30 shadow-2xl bg-zinc-900"
                      : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900"
                  }`}
                >
                  <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                    {/* Spot Image Thumbnail */}
                    <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-2xl bg-zinc-950">
                      <img
                        src={spot.image}
                        alt={spot.name}
                        className="size-full object-cover transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                      />
                      <Badge className="absolute top-2.5 left-2.5 bg-zinc-950/80 backdrop-blur-md text-amber-300 border-zinc-800 text-[10px] font-bold">
                        {spot.categoryLabel}
                      </Badge>
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-zinc-950/90 backdrop-blur-md px-2 py-0.5 rounded-md border border-zinc-800 text-xs font-bold text-amber-400">
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        {spot.rating}
                      </div>
                    </div>

                    {/* Spot Details Column */}
                    <div className="space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-display font-bold text-base text-white hover:text-emerald-400 transition-colors line-clamp-1">
                          {spot.name}
                        </h4>
                        <p className="text-xs text-amber-400/90 font-semibold mt-0.5 line-clamp-1">{spot.tagline}</p>
                        <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2 mt-1.5">{spot.description}</p>
                      </div>

                      {/* Address & Highlights */}
                      <div className="space-y-1 pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400">
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="size-3 text-emerald-400 shrink-0" />
                          <span className="truncate">{spot.address}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <Clock className="size-3 text-amber-400 shrink-0" />
                          <span className="truncate">{spot.timings}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex flex-wrap gap-1">
                          {spot.highlights.slice(0, 2).map((h, idx) => (
                            <span key={idx} className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">
                              {h}
                            </span>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpotFocus(spot);
                          }}
                          className={cn(
                            "flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition shrink-0",
                            isSelected
                              ? "bg-emerald-500 text-zinc-950"
                              : "bg-zinc-800 text-emerald-400 hover:bg-emerald-500 hover:text-zinc-950",
                          )}
                        >
                          <span>Focus on Map</span>
                          <ArrowRight className="size-3" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Skiper76 Apple-Style Interactive Feature Showcase */}
        <div className="mt-12">
          <Skiper76Showcase
            items={skiperItems}
            districtName={district.name}
            onFocusSpot={(spotId) => {
              setActiveSpotId(spotId);
              const mapElem = document.getElementById("district-map-section");
              if (mapElem) {
                mapElem.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }}
          />
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. SPOTLIGHT SECTIONS: CRAFTS, BAZAARS & FOOD TRAILS          */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden bg-transparent py-20">
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-purple-600/15 blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-amber-500/15 blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-emerald-500/5 blur-[180px] pointer-events-none" />
        
        {/* Subtle Radial Mesh Grid overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 space-y-14">
          
          {/* BAZAARS & CRAFTS SPOTLIGHT */}
          <div className="gsap-spotlight-box group relative overflow-hidden rounded-3xl border border-purple-500/40 bg-zinc-900/90 backdrop-blur-xl p-6 md:p-10 space-y-6 shadow-[0_0_60px_-15px_rgba(168,85,247,0.25)] transition-all hover:border-purple-500/60">
            {/* Background Texture Image Overlay */}
            <div 
              className="absolute inset-0 z-0 opacity-15 mix-blend-overlay bg-cover bg-center pointer-events-none transition-transform duration-1000 group-hover:scale-105" 
              style={{ backgroundImage: `url(${district.spots.find(s => s.category === 'thrift-streets')?.image || district.heroImage})` }} 
            />
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50 text-[10px] tracking-wider uppercase font-semibold px-3 py-1">
                  🛍️ {district.name} Shopping & Crafts
                </Badge>
                <h3 className="mt-3 font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {district.slug === "madurai"
                    ? "Madurai Famous Thrift Streets & Heritage Bazaars"
                    : `${district.name} Heritage Bazaars & Traditional Crafts`}
                </h3>
                <p className="mt-2 text-sm text-zinc-300 max-w-2xl leading-relaxed">
                  {district.tagline}. Discover local handlooms, specialty crafts, and traditional shopping lanes across {district.name}.
                </p>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5">
              {district.slug === "madurai" ? (
                <>
                  <div className="group/item relative overflow-hidden rounded-2xl border border-purple-500/20 bg-zinc-950/80 p-5 space-y-2.5 hover:border-purple-400/60 hover:bg-zinc-900/90 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                    <h4 className="font-display text-base font-bold text-purple-300 group-hover/item:text-purple-200 transition-colors">Puthu Mandapam Thrift Arcade</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      17th-century Nayak hall with 100+ tailors stitching custom apparel in 30 minutes, plus brass lamps and copper vessels.
                    </p>
                    <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1.5 pt-1">📍 Adjacent to Meenakshi Temple East Tower</span>
                  </div>
                  <div className="group/item relative overflow-hidden rounded-2xl border border-purple-500/20 bg-zinc-950/80 p-5 space-y-2.5 hover:border-purple-400/60 hover:bg-zinc-900/90 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                    <h4 className="font-display text-base font-bold text-purple-300 group-hover/item:text-purple-200 transition-colors">Vilakkuthoon Brassware Street</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Historic lamp column circle famous for bronze statues, traditional Kuthuvilakku lamps, and antique Madurai handicrafts.
                    </p>
                    <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1.5 pt-1">📍 Near East Veli Street</span>
                  </div>
                  <div className="group/item relative overflow-hidden rounded-2xl border border-purple-500/20 bg-zinc-950/80 p-5 space-y-2.5 hover:border-purple-400/60 hover:bg-zinc-900/90 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                    <h4 className="font-display text-base font-bold text-purple-300 group-hover/item:text-purple-200 transition-colors">Avani Moola & Town Hall Road</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Bustling wholesale textile markets specializing in authentic Madurai Sungudi cotton sarees, tie-dye silks, and spices.
                    </p>
                    <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1.5 pt-1">📍 Central Temple Concentric Street</span>
                  </div>
                </>
              ) : (
                district.spots.slice(0, 3).map((spot, idx) => (
                  <div key={idx} className="group/item relative overflow-hidden rounded-2xl border border-purple-500/20 bg-zinc-950/80 p-5 space-y-2.5 hover:border-purple-400/60 hover:bg-zinc-900/90 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                    <h4 className="font-display text-base font-bold text-purple-300 group-hover/item:text-purple-200 transition-colors">{spot.name}</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">{spot.tagline}</p>
                    <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1.5 pt-1">📍 {spot.address}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* FOOD TRAILS SPOTLIGHT */}
          <div className="gsap-spotlight-box group relative overflow-hidden rounded-3xl border border-amber-500/40 bg-zinc-900/90 backdrop-blur-xl p-6 md:p-10 space-y-6 shadow-[0_0_60px_-15px_rgba(245,158,11,0.25)] transition-all hover:border-amber-500/60">
            {/* Background Texture Image Overlay */}
            <div 
              className="absolute inset-0 z-0 opacity-15 mix-blend-overlay bg-cover bg-center pointer-events-none transition-transform duration-1000 group-hover:scale-105" 
              style={{ backgroundImage: `url(${district.spots.find(s => s.category === 'food-spots')?.image || district.heroImage})` }} 
            />
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/50 text-[10px] tracking-wider uppercase font-semibold px-3 py-1">
                  🍲 Culinary Highlights
                </Badge>
                <h3 className="mt-3 font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {district.slug === "madurai"
                    ? "Madurai 24/7 Iconic Street Food Experience"
                    : `${district.name} Signature Local Food Experience`}
                </h3>
                <p className="mt-2 text-sm text-zinc-300 max-w-2xl leading-relaxed">
                  {district.overview.culture}
                </p>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {district.overview.famousFor.map((item, idx) => (
                <div key={idx} className="group/item relative overflow-hidden rounded-2xl border border-amber-500/20 bg-zinc-950/80 p-5 space-y-2 hover:border-amber-400/60 hover:bg-zinc-900/90 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10">
                  <div className="text-2xl transform transition-transform group-hover/item:scale-110 duration-300">✨</div>
                  <h4 className="font-bold text-sm text-white group-hover/item:text-amber-200 transition-colors">{item}</h4>
                  <p className="text-[11px] text-zinc-400 leading-normal">Curated highlight of {district.name}.</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
);
}
