import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Plus, Check, MapPin, Star, Sparkles, X, Compass, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Skiper76Item {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  image: string;
  rating?: number;
  address?: string;
  highlights?: string[];
  swatches?: { label: string; color: string; imageFilter?: string }[];
}

interface Skiper76Props {
  items: Skiper76Item[];
  districtName?: string;
  onFocusSpot?: (spotId: string) => void;
  className?: string;
}

export function Skiper76Showcase({ items, districtName = "Tamil Nadu", onFocusSpot, className }: Skiper76Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSwatchIndex, setSelectedSwatchIndex] = useState(0);

  // Clamp active index
  const activeItem = items[activeIndex] || items[0];

  useEffect(() => {
    // Reset swatch index when changing items
    setSelectedSwatchIndex(0);
  }, [activeIndex]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  if (!items || items.length === 0) return null;

  const activeSwatch = activeItem.swatches?.[selectedSwatchIndex] || {
    label: "Default View",
    color: "#eab308",
    imageFilter: "none",
  };

  return (
    <div
      className={cn(
        "relative z-10 w-full rounded-3xl bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 p-6 md:p-10 shadow-2xl overflow-hidden transition-all",
        className
      )}
    >
      {/* Background Decorative Gradient Grid */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute -top-32 -right-32 size-[500px] rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 size-[500px] rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="relative z-10 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6 max-w-7xl mx-auto w-full">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
              <Sparkles className="size-3.5 text-amber-400 animate-pulse" />
              Apple-Style Skiper76 Spotlight Showcase
            </span>
            <span className="text-xs text-zinc-500">
              {districtName} · Featured Destinations
            </span>
          </div>
          <h3 className="mt-2 font-display text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Explore {districtName}&apos;s Iconic Places & Architectural Legends
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400 max-w-3xl">
            Interactive visual feature showcase. Select any spot to reveal architectural details, color themes, and location highlights.
          </p>
        </div>

        {/* Counter */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 px-4 py-2 text-xs font-mono text-amber-400">
            <span className="font-bold text-white">0{activeIndex + 1}</span> / 0{items.length}
          </div>
        </div>
      </div>

      {/* 3-COLUMN FULL PAGE WIDE LAYOUT GRID */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch max-w-7xl mx-auto w-full">
        
        {/* ------------------------------------------------------------------ */}
        {/* 1. LEFT PART (3.5 COLS): ICON PLACE LIST & ARROWS                  */}
        {/* ------------------------------------------------------------------ */}
        <div className="lg:col-span-4 xl:col-span-3.5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Destinations Catalog
            </span>
            {/* Up / Down Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous item"
                className="grid size-8 place-items-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-300 transition hover:border-amber-500/50 hover:bg-zinc-800 hover:text-amber-400 active:scale-95"
              >
                <ChevronUp className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next item"
                className="grid size-8 place-items-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-300 transition hover:border-amber-500/50 hover:bg-zinc-800 hover:text-amber-400 active:scale-95"
              >
                <ChevronDown className="size-4" />
              </button>
            </div>
          </div>

          {/* Vertical Feature Pills List */}
          <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[480px] pr-1 scrollbar-none">
            {items.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-semibold transition-all duration-300 text-left",
                    isActive
                      ? "bg-zinc-900 text-white border border-amber-500/50 ring-1 ring-amber-500/20 shadow-lg"
                      : "bg-zinc-900/60 text-zinc-400 border border-zinc-800 hover:bg-zinc-800/80 hover:text-zinc-200"
                  )}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span
                      className={cn(
                        "grid size-6 place-items-center rounded-full transition-colors text-[11px] shrink-0",
                        isActive
                          ? "bg-amber-500 text-zinc-950 font-bold"
                          : "bg-zinc-800 text-zinc-400"
                      )}
                    >
                      {isActive ? <Check className="size-3.5 stroke-[3]" /> : <Plus className="size-3.5" />}
                    </span>
                    <span className="truncate">{item.title}</span>
                  </div>

                  <span className="text-[10px] text-zinc-500 font-mono shrink-0 ml-2">
                    {item.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* 2. MIDDLE PART (4 COLS): ICON PLACE DESCRIPTION & DETAILS CARD    */}
        {/* ------------------------------------------------------------------ */}
        <div className="lg:col-span-4 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeItem.id}
              initial={{ opacity: 0, x: -15, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 15, scale: 0.97 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="size-full rounded-3xl border border-zinc-700/60 bg-zinc-900/90 p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-zinc-800/80 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                      {activeItem.category}
                    </span>
                    <h4 className="font-display font-black text-xl text-white leading-tight">
                      {activeItem.title}
                    </h4>
                    <p className="text-xs text-amber-300 font-semibold mt-1">
                      {activeItem.subtitle}
                    </p>
                  </div>

                  {activeItem.rating && (
                    <div className="flex items-center gap-1 rounded-lg bg-zinc-950 px-2.5 py-1 text-xs font-bold text-amber-400 border border-zinc-800 shrink-0">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      {activeItem.rating}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h5 className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider">Spot Description</h5>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {activeItem.description}
                  </p>
                </div>

                {activeItem.highlights && activeItem.highlights.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                    <h5 className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider">Must-See Highlights</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {activeItem.highlights.map((h, hIdx) => (
                        <span key={hIdx} className="rounded-lg bg-zinc-800/80 px-2.5 py-1 text-[11px] font-medium text-zinc-200 border border-zinc-700/60">
                          ✨ {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Swatches / Color Perspective Toggles */}
              {activeItem.swatches && activeItem.swatches.length > 0 && (
                <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-zinc-400 block">
                      View Palette
                    </span>
                    <span className="text-xs font-bold text-amber-400">
                      {activeSwatch.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeItem.swatches.map((swatch, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => setSelectedSwatchIndex(sIdx)}
                        title={swatch.label}
                        className={cn(
                          "size-6 rounded-full transition-transform border-2",
                          selectedSwatchIndex === sIdx
                            ? "scale-125 border-white ring-2 ring-amber-500/50"
                            : "border-transparent opacity-70 hover:opacity-100 hover:scale-110"
                        )}
                        style={{ backgroundColor: swatch.color }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* 3. RIGHT PART (4.5 COLS): ICON PLACE IMAGE SHOWCASE                */}
        {/* ------------------------------------------------------------------ */}
        <div className="lg:col-span-4 xl:col-span-4.5 flex flex-col">
          <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl h-[420px] lg:h-full min-h-[440px] group size-full">
            
            {/* Animated Showcase Image */}
            <AnimatePresence mode="wait">
              <motion.img
                key={`${activeItem.id}-${selectedSwatchIndex}`}
                src={activeItem.image}
                alt={activeItem.title}
                initial={{ opacity: 0, scale: 1.06, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: activeSwatch.imageFilter || "none" }}
                exit={{ opacity: 0, scale: 0.97, filter: "blur(4px)" }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className="size-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
            </AnimatePresence>

            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/60 via-transparent to-transparent pointer-events-none" />

            {/* Top Bar Badges */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-950/80 px-3 py-1 text-xs font-bold text-amber-300 border border-zinc-800 backdrop-blur-md">
                <Compass className="size-3.5 text-amber-400" />
                {activeItem.category}
              </span>

              {activeItem.address && (
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-zinc-950/80 px-3 py-1 text-[11px] font-semibold text-zinc-300 border border-zinc-800 backdrop-blur-md">
                  <MapPin className="size-3 text-emerald-400" />
                  {activeItem.address}
                </span>
              )}
            </div>

            {/* Bottom Info Bar & Focus Button */}
            <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-950/90 border border-zinc-800/90 p-4 rounded-2xl backdrop-blur-md">
              <div>
                <h5 className="font-display font-bold text-sm text-white flex items-center gap-2">
                  <span>{activeItem.title}</span>
                  <span className="text-[10px] text-amber-400 font-mono">• {activeSwatch.label}</span>
                </h5>
                <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                  {activeItem.subtitle}
                </p>
              </div>

              {onFocusSpot && (
                <button
                  type="button"
                  onClick={() => onFocusSpot(activeItem.id)}
                  className="shrink-0 flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-zinc-950 transition hover:bg-amber-400 active:scale-95 shadow-lg"
                >
                  <span>Focus on Map</span>
                  <ExternalLink className="size-3.5" />
                </button>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
