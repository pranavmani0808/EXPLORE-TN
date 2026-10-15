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
        "relative z-10 w-full rounded-3xl bg-white border border-sky-100 p-6 md:p-10 shadow-xl overflow-hidden transition-all",
        className
      )}
    >
      {/* Background Decorative Gradient Grid */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute -top-32 -right-32 size-[500px] rounded-full bg-sky-200/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 size-[500px] rounded-full bg-blue-100/30 blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="relative z-10 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 max-w-7xl mx-auto w-full">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 border border-sky-200">
              <Sparkles className="size-3.5 text-sky-600 animate-pulse" />
              Apple-Style Skiper76 Spotlight Showcase
            </span>
            <span className="text-xs text-slate-500">
              {districtName} · Featured Destinations
            </span>
          </div>
          <h3 className="mt-2 font-display text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Explore {districtName}&apos;s Iconic Places & Architectural Legends
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-3xl">
            Interactive visual feature showcase. Select any spot to reveal architectural details, color themes, and location highlights.
          </p>
        </div>

        {/* Counter */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-mono text-sky-700">
            <span className="font-bold text-slate-900">0{activeIndex + 1}</span> / 0{items.length}
          </div>
        </div>
      </div>

      {/* 3-COLUMN FULL PAGE WIDE LAYOUT GRID */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch max-w-7xl mx-auto w-full">
        
        {/* ------------------------------------------------------------------ */}
        {/* 1. LEFT PART (3.5 COLS): ICON PLACE LIST & ARROWS                  */}
        {/* ------------------------------------------------------------------ */}
        <div className="lg:col-span-4 xl:col-span-3.5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
              Destinations Catalog
            </span>
            {/* Up / Down Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous item"
                className="grid size-8 place-items-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-sky-300 hover:bg-white hover:text-sky-700 active:scale-95"
              >
                <ChevronUp className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next item"
                className="grid size-8 place-items-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-sky-300 hover:bg-white hover:text-sky-700 active:scale-95"
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
                      ? "bg-sky-50 text-sky-950 border border-sky-300 ring-2 ring-sky-500/10 shadow-sm"
                      : "bg-slate-50/70 text-slate-600 border border-slate-200 hover:bg-white hover:text-slate-900"
                  )}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span
                      className={cn(
                        "grid size-6 place-items-center rounded-full transition-colors text-[11px] shrink-0",
                        isActive
                          ? "bg-sky-600 text-white font-bold"
                          : "bg-slate-200 text-slate-500"
                      )}
                    >
                      {isActive ? <Check className="size-3.5 stroke-[3]" /> : <Plus className="size-3.5" />}
                    </span>
                    <span className="truncate">{item.title}</span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
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
              className="size-full rounded-3xl border border-sky-100 bg-slate-50/70 p-6 shadow-md backdrop-blur-md flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-slate-200/80 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block mb-1">
                      {activeItem.category}
                    </span>
                    <h4 className="font-display font-black text-xl text-slate-900 leading-tight">
                      {activeItem.title}
                    </h4>
                    <p className="text-xs text-sky-700 font-semibold mt-1">
                      {activeItem.subtitle}
                    </p>
                  </div>

                  {activeItem.rating && (
                    <div className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-amber-600 border border-slate-200 shrink-0 shadow-xs">
                      <Star className="size-3.5 fill-amber-500 text-amber-500" />
                      {activeItem.rating}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h5 className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Spot Description</h5>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {activeItem.description}
                  </p>
                </div>

                {activeItem.highlights && activeItem.highlights.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-200/80">
                    <h5 className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Must-See Highlights</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {activeItem.highlights.map((h, hIdx) => (
                        <span key={hIdx} className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 border border-slate-200 shadow-xs">
                          ✨ {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Swatches / Color Perspective Toggles */}
              {activeItem.swatches && activeItem.swatches.length > 0 && (
                <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">
                      View Palette
                    </span>
                    <span className="text-xs font-bold text-sky-700">
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
                            ? "scale-125 border-sky-600 ring-2 ring-sky-500/30"
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
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xl h-[420px] lg:h-full min-h-[440px] group size-full">
            
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
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

            {/* Top Bar Badges */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-sky-800 border border-slate-200 backdrop-blur-md shadow-xs">
                <Compass className="size-3.5 text-sky-600" />
                {activeItem.category}
              </span>

              {activeItem.address && (
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200 backdrop-blur-md shadow-xs">
                  <MapPin className="size-3 text-sky-600" />
                  {activeItem.address}
                </span>
              )}
            </div>

            {/* Bottom Info Bar & Focus Button */}
            <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/95 border border-sky-100 p-4 rounded-2xl backdrop-blur-md shadow-lg">
              <div>
                <h5 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                  <span>{activeItem.title}</span>
                  <span className="text-[10px] text-sky-700 font-mono">• {activeSwatch.label}</span>
                </h5>
                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                  {activeItem.subtitle}
                </p>
              </div>

              {onFocusSpot && (
                <button
                  type="button"
                  onClick={() => onFocusSpot(activeItem.id)}
                  className="shrink-0 flex items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-sky-500 active:scale-95 shadow-md"
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
