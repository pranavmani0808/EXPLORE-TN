import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronUp, ChevronDown, MapPin, Compass, ArrowUpRight } from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";
import type { IconicAttraction } from "./things-to-do-section";

interface AttractionsDrumCarouselProps {
  attractions: IconicAttraction[];
  onActiveChange?: (index: number) => void;
}

export function AttractionsDrumCarousel({
  attractions,
  onActiveChange,
}: AttractionsDrumCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragProgress, setDragProgress] = useState(0); // -1 to 1 during drag
  const [isDragging, setIsDragging] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const currentDragDelta = useRef(0);
  const wheelLockRef = useRef(false);
  const total = attractions.length;

  // Check for prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const goToIndex = useCallback(
    (index: number) => {
      const normalized = ((index % total) + total) % total;
      setActiveIndex(normalized);
      onActiveChange?.(normalized);
    },
    [total, onActiveChange]
  );

  const handleNext = useCallback(() => {
    goToIndex(activeIndex + 1);
  }, [activeIndex, goToIndex]);

  const handlePrev = useCallback(() => {
    goToIndex(activeIndex - 1);
  }, [activeIndex, goToIndex]);

  // Pointer drag events for smooth 3D drum rolling
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only primary button
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartY.current = e.clientY;
    currentDragDelta.current = 0;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaY = e.clientY - dragStartY.current;
    currentDragDelta.current = deltaY;
    // Map ~180px drag to 1 full item transition
    const progress = Math.max(-1.2, Math.min(1.2, -deltaY / 180));
    setDragProgress(progress);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }

    const deltaY = currentDragDelta.current;
    if (deltaY < -40) {
      handleNext();
    } else if (deltaY > 40) {
      handlePrev();
    }
    setDragProgress(0);
    currentDragDelta.current = 0;
  };

  // Wheel handling over carousel
  const handleWheel = (e: React.WheelEvent) => {
    if (wheelLockRef.current) return;
    if (Math.abs(e.deltaY) < 20) return;

    wheelLockRef.current = true;
    if (e.deltaY > 0) {
      handleNext();
    } else {
      handlePrev();
    }

    setTimeout(() => {
      wheelLockRef.current = false;
    }, 380);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrev();
    }
  };

  // Calculate circular distance between active item and target item
  const getDistance = (index: number) => {
    let diff = index - (activeIndex + dragProgress);
    while (diff > total / 2) diff -= total;
    while (diff < -total / 2) diff += total;
    return diff;
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Attractions you can't miss 3D Carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="relative w-full py-4 select-none outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 rounded-3xl"
    >
      {/* Main 3D Drum Stage */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className="relative h-[440px] sm:h-[480px] md:h-[520px] w-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        style={{
          perspective: prefersReducedMotion ? "none" : "1100px",
          perspectiveOrigin: "center center",
        }}
      >
        {/* Subtle decorative vertical axis track line */}
        <div className="absolute inset-y-0 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent dark:via-white/10 pointer-events-none" />

        {/* 3D Drum Cards */}
        {attractions.map((attraction, index) => {
          const dist = getDistance(index);
          const isCenter = Math.abs(dist) < 0.35;
          const isVisible = Math.abs(dist) <= 2.2;

          if (!isVisible) {
            // Keep offscreen elements hidden but mounted for DOM link integrity
            return (
              <div key={attraction.id} className="sr-only">
                <Link to="/place/$slug" params={{ slug: attraction.slug }}>
                  {attraction.title} - {attraction.district}
                </Link>
              </div>
            );
          }

          // Compute 3D cylinder transformation values
          const rotX = prefersReducedMotion ? 0 : dist * 28; // Negative/positive tilt
          const translateY = dist * 140; // Vertical displacement
          const translateZ = prefersReducedMotion ? 0 : -Math.abs(dist) * 115; // Depth curve
          const scale = 1 - Math.min(Math.abs(dist) * 0.12, 0.32);
          const opacity = Math.max(0.15, 1 - Math.abs(dist) * 0.38);
          const zIndex = Math.round(100 - Math.abs(dist) * 20);
          const darknessOverlay = Math.min(0.68, Math.abs(dist) * 0.42);

          return (
            <div
              key={attraction.id}
              onClick={() => {
                if (!isCenter) {
                  goToIndex(index);
                }
              }}
              style={{
                transform: `translate3d(0, ${translateY}px, ${translateZ}px) rotateX(${rotX}deg) scale(${scale})`,
                opacity,
                zIndex,
                transition: isDragging
                  ? "none"
                  : "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease",
                transformStyle: "preserve-3d",
              }}
              className={`absolute w-[86%] sm:w-[480px] md:w-[580px] aspect-[16/10] max-h-[340px] rounded-2xl sm:rounded-3xl shadow-xl transition-shadow duration-300 ${
                isCenter
                  ? "shadow-2xl shadow-sky-950/15 ring-2 ring-sky-500/40 cursor-pointer"
                  : "cursor-pointer hover:opacity-90"
              }`}
            >
              {/* Inner card link */}
              <Link
                to="/place/$slug"
                params={{ slug: attraction.slug }}
                onClick={(e) => {
                  // If clicking a tilted card, rotate it to center first instead of navigating immediately
                  if (!isCenter) {
                    e.preventDefault();
                    goToIndex(index);
                  }
                }}
                className="relative block size-full overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-900 group focus:outline-none"
              >
                {/* Background Attraction Image */}
                <SafeImage
                  src={attraction.image}
                  alt={attraction.title}
                  category={attraction.category}
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Cylindrical depth shadow overlay */}
                <div
                  className="absolute inset-0 bg-slate-950 transition-opacity pointer-events-none"
                  style={{ opacity: darknessOverlay }}
                />

                {/* Vignette & Ambient Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-black/20" />

                {/* Center "EXPLORE" Action Badge (Mark Clennon reel inspired center callout) */}
                {isCenter && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white font-mono text-xs font-bold tracking-widest uppercase border border-white/40 shadow-lg group-hover:scale-110 group-hover:bg-white group-hover:text-slate-950 transition-all duration-300">
                      Explore
                      <ArrowUpRight className="size-3.5 stroke-[2.5]" />
                    </span>
                  </div>
                )}

                {/* District Badge */}
                <div className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 z-10">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-md px-2.5 py-1 text-[11px] font-mono font-bold text-slate-900 border border-slate-200/80 shadow-md">
                    <MapPin className="size-3 text-sky-600" />
                    {attraction.district}
                  </span>
                </div>

                {/* Category & Status */}
                <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-10">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-sans font-medium text-white/90 border border-white/10 uppercase tracking-wider">
                    <Compass className="size-2.5 text-sky-400" />
                    {attraction.category}
                  </span>
                </div>

                {/* Bottom Title & Details */}
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 z-10 flex flex-col justify-end">
                  <h3 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight drop-shadow-md group-hover:text-sky-300 transition-colors font-display line-clamp-1">
                    {attraction.title}
                  </h3>
                  <div className="flex items-center justify-between mt-1 sm:mt-1.5 text-xs text-slate-300">
                    <span className="font-sans font-medium opacity-90">{attraction.activities}</span>
                    <span className="text-[11px] font-mono opacity-75">Click to view details</span>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}

        {/* Ambient Top & Bottom fade ramps for infinite cylinder feeling */}
        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-background via-background/60 to-transparent pointer-events-none z-30" />
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none z-30" />
      </div>

      {/* Controller & Indicators Footer */}
      <div className="mt-3 flex items-center justify-between px-2 sm:px-4">
        {/* Active attraction index & title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="font-bold text-sky-600 text-sm">
              {String(activeIndex + 1).padStart(2, "0")}
            </span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-500">{String(total).padStart(2, "0")}</span>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-white/15" />

          <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px] sm:max-w-xs">
            {attractions[activeIndex]?.title}
          </p>
        </div>

        {/* Vertical Drum Controls & Navigation */}
        <div className="flex items-center gap-2">
          {/* Quick Step Indicators */}
          <div className="hidden sm:flex items-center gap-1.5 mr-2">
            {attractions.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goToIndex(i)}
                aria-label={`Go to attraction ${i + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  i === activeIndex
                    ? "w-6 h-1.5 bg-sky-600"
                    : "w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400 dark:bg-white/20"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous attraction (roll up)"
            className="grid size-8 sm:size-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:text-sky-600 dark:bg-slate-900 dark:border-white/10 dark:text-slate-200 transition shadow-sm cursor-pointer"
          >
            <ChevronUp className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next attraction (roll down)"
            className="grid size-8 sm:size-9 place-items-center rounded-full border border-sky-200 bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-400 transition shadow-sm cursor-pointer"
          >
            <ChevronDown className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
