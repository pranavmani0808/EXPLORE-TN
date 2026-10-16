import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, Compass, Sparkles, MapPin } from "lucide-react";
import type { IconicAttraction } from "./things-to-do-section";

interface HeroWordReelProps {
  attractions: IconicAttraction[];
}

export function HeroWordReelSection({ attractions }: HeroWordReelProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = attractions.length;
  const current = attractions[activeIndex] || attractions[0];

  const goToIndex = useCallback(
    (index: number) => {
      const normalized = ((index % total) + total) % total;
      setActiveIndex(normalized);
    },
    [total]
  );

  const handleNext = useCallback(() => {
    goToIndex(activeIndex + 1);
  }, [activeIndex, goToIndex]);

  const handlePrev = useCallback(() => {
    goToIndex(activeIndex - 1);
  }, [activeIndex, goToIndex]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrev();
    }
  };

  // Wheel listener over the pill dock
  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) > 20) {
      if (e.deltaY > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  // Clean short display title for the giant cutout word effect
  const getShortTitle = (title: string, district: string) => {
    // If title has temple, hills, falls, take prominent word
    if (district === "Madurai") return "Madurai";
    if (district === "Thanjavur") return "Thanjavur";
    if (district === "Rameswaram") return "Dhanushkodi";
    if (district === "Ooty") return "Nilgiris";
    if (district === "Dharmapuri") return "Hogenakkal";
    if (district === "Mahabalipuram") return "Mamallapuram";
    return district;
  };

  return (
    <section className="relative w-full py-10 sm:py-14 select-none outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 bg-gradient-to-b from-slate-50/80 via-white to-slate-50/90 dark:from-slate-950/80 dark:via-slate-900 dark:to-slate-950 border-y border-sky-100/60 dark:border-white/5">
      <div
        className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* Section Header */}
        <div className="pt-1 pb-4 flex items-end justify-between z-40">
          <div>
            <div className="inline-flex items-center gap-2 mb-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 text-xs font-semibold border border-sky-200/60 dark:border-sky-800/50">
              <Compass className="size-3.5 text-sky-600 dark:text-sky-400" />
              <span>Iconic Heritage & Nature</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
              Attractions you can't miss
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Select or hover thumbnail icons to experience Tamil Nadu's timeless wonders
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-sky-600 dark:text-sky-400">
              Cinematic Spotlight
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-sans">
              Click thumbnails or use arrows to cycle
            </span>
          </div>
        </div>

        {/* Main Hero Card Canvas */}
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/8.5] md:aspect-[21/9] max-h-[560px] min-h-[380px] sm:min-h-[460px] md:min-h-[500px] rounded-3xl sm:rounded-[36px] overflow-hidden shadow-2xl border border-slate-800/60 bg-slate-950 flex items-center justify-center">
          {/* Animated Background Hero Image cross-fade */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 size-full"
            >
              <img
                src={current.image}
                alt={current.title}
                className="size-full object-cover"
              />
              {/* Cinematic Vignette Gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-slate-950/40 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-slate-950/60 pointer-events-none" />
            </motion.div>
          </AnimatePresence>

          {/* Top Left Tag: CARD indicator pill like in the reference image */}
          <div className="absolute top-5 left-5 sm:top-6 sm:left-6 z-20 flex items-center gap-2">
            <span className="rounded-full bg-slate-950/70 border border-white/20 px-3.5 py-1 text-[11px] font-mono font-bold uppercase tracking-widest text-white backdrop-blur-md shadow-lg">
              CARD
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/30 border border-sky-400/40 px-3 py-1 text-xs font-bold text-sky-200 backdrop-blur-md">
              <MapPin className="size-3 text-sky-300" />
              {current.district}
            </span>
          </div>

          {/* Top Right Explore CTA Button */}
          <div className="absolute top-5 right-5 sm:top-6 sm:right-6 z-20">
            <Link
              to="/place/$slug"
              params={{ slug: current.slug }}
              className="inline-flex items-center gap-2 rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-950 border border-white/40 px-4 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-bold backdrop-blur-md transition-all duration-300 shadow-xl group"
            >
              <span>Explore</span>
              <ArrowUpRight className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {/* GIANT CENTER TYPOGRAPHY EFFECT ("Harbour" style in user image) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 px-4">
            <AnimatePresence mode="wait">
              <motion.h1
                key={current.id}
                initial={{ opacity: 0, y: 15, scale: 0.96 }}
                animate={{ opacity: 0.9, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="font-display font-extrabold text-white text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-center drop-shadow-[0_8px_24px_rgba(0,0,0,0.85)] max-w-5xl leading-none select-none opacity-85"
                style={{
                  letterSpacing: "-0.03em",
                }}
              >
                {getShortTitle(current.title, current.district)}
              </motion.h1>
            </AnimatePresence>
          </div>

          {/* FLOATING VERTICAL THUMBNAIL PILL DOCK (Exact recreation of user reference image) */}
          <div
            onWheel={handleWheel}
            className="absolute z-30 flex flex-col items-center gap-2 p-1.5 sm:p-2 rounded-3xl sm:rounded-[28px] bg-slate-950/75 border border-white/20 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] cursor-pointer"
          >
            {attractions.map((attraction, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={attraction.id}
                  onClick={() => goToIndex(idx)}
                  aria-label={`Select ${attraction.title}`}
                  className={`group relative size-10 sm:size-12 md:size-14 rounded-2xl sm:rounded-[20px] overflow-hidden transition-all duration-300 focus:outline-none ${
                    isActive
                      ? "ring-2 ring-white scale-110 shadow-2xl z-10"
                      : "opacity-45 hover:opacity-85 hover:scale-105"
                  }`}
                >
                  <img
                    src={attraction.image}
                    alt={attraction.title}
                    className="size-full object-cover"
                    loading="lazy"
                  />
                  {/* Subtle hover gradient */}
                  <div
                    className={`absolute inset-0 transition-opacity ${
                      isActive ? "bg-transparent" : "bg-slate-950/30 group-hover:bg-transparent"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Bottom Card Caption & Title Bar */}
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-3 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent pointer-events-none">
            <div className="pointer-events-auto">
              <div className="inline-flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
                  {current.category}
                </span>
                <span className="text-white/40">·</span>
                <span className="text-xs font-mono text-slate-300">
                  {current.activities}
                </span>
              </div>
              <h3 className="text-xl sm:text-3xl font-extrabold text-white font-display drop-shadow-md">
                {current.title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-300">
                {String(activeIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
