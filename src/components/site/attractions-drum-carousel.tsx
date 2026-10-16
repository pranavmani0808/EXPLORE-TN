import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronUp, ChevronDown, MapPin, Compass, ArrowUpRight } from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";
import type { IconicAttraction } from "./things-to-do-section";

interface AttractionsDrumCarouselProps {
  attractions: IconicAttraction[];
  onActiveChange?: (index: number) => void;
  fullScreenSticky?: boolean;
}

export function AttractionsDrumCarousel({
  attractions,
  onActiveChange,
  fullScreenSticky = true,
}: AttractionsDrumCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragProgress, setDragProgress] = useState(0); // -1 to 1 during drag
  const [isDragging, setIsDragging] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const sectionWrapRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const currentDragDelta = useRef(0);
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

  // Page scroll tracking: When sectionWrapRef enters viewport, scrub through items based on scroll progress
  useEffect(() => {
    if (!fullScreenSticky) return;

    let ticking = false;
    const handleScroll = () => {
      if (!sectionWrapRef.current) return;
      if (ticking) return;

      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        if (!sectionWrapRef.current) return;

        const rect = sectionWrapRef.current.getBoundingClientRect();
        const totalScrollable = rect.height - window.innerHeight;

        if (totalScrollable <= 0) return;

        // When rect.top is 0 or negative up to -totalScrollable
        const scrolled = -rect.top;
        if (scrolled >= 0 && scrolled <= totalScrollable) {
          const rawProgress = scrolled / totalScrollable; // 0 to 1
          const targetIndex = Math.min(
            total - 1,
            Math.max(0, Math.floor(rawProgress * total))
          );
          setActiveIndex((prev) => {
            if (prev !== targetIndex) {
              onActiveChange?.(targetIndex);
              return targetIndex;
            }
            return prev;
          });
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fullScreenSticky, total, onActiveChange]);

  // Pointer drag events for smooth 3D drum rolling
  const handlePointerDown = (e: React.PointerEvent) => {
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
      ref={sectionWrapRef}
      className={
        fullScreenSticky
          ? "relative h-[200vh] w-full"
          : "relative w-full py-4 select-none outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 rounded-3xl"
      }
    >
      <div
        className={
          fullScreenSticky
            ? "sticky top-0 h-screen w-full flex flex-col justify-between pt-20 pb-6 px-4 sm:px-8 overflow-hidden select-none bg-gradient-to-b from-slate-50/80 via-white to-slate-50/90 dark:from-slate-950/80 dark:via-slate-900 dark:to-slate-950"
            : "relative w-full"
        }
        role="region"
        aria-roledescription="carousel"
        aria-label="Attractions you can't miss 3D Carousel"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* Full-screen Section Header when sticky */}
        {fullScreenSticky && (
          <div className="mx-auto w-full max-w-6xl pt-1 pb-1 flex items-end justify-between z-40">
            <div>
              <div className="inline-flex items-center gap-2 mb-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 text-xs font-semibold border border-sky-200/60 dark:border-sky-800/50">
                <Compass className="size-3.5 text-sky-600 dark:text-sky-400" />
                <span>Iconic Heritage & Nature</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
                Attractions you can't miss
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Scroll to rotate through Tamil Nadu's timeless wonders
              </p>
            </div>

            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-sky-600 dark:text-sky-400">
                Full-screen 3D Motion Reel
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-sans">
                Scroll page or use controls to cycle
              </span>
            </div>
          </div>
        )}

        {/* Main 3D Drum Stage - Expanded to full height */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`relative ${
            fullScreenSticky
              ? "flex-1 min-h-[380px] sm:min-h-[460px] md:min-h-[540px]"
              : "h-[440px] sm:h-[480px] md:h-[520px]"
          } w-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing`}
          style={{
            perspective: prefersReducedMotion ? "none" : "1200px",
            perspectiveOrigin: "center center",
          }}
        >
          {/* Subtle decorative vertical axis track line */}
          <div className="absolute inset-y-0 w-px bg-gradient-to-b from-transparent via-sky-300/40 to-transparent dark:via-white/10 pointer-events-none" />

          {/* 3D Drum Cards */}
          {attractions.map((attraction, index) => {
            const dist = getDistance(index);
            const isCenter = Math.abs(dist) < 0.35;
            const isVisible = Math.abs(dist) <= 2.2;

            if (!isVisible) {
              return (
                <div key={attraction.id} className="sr-only">
                  <Link to="/place/$slug" params={{ slug: attraction.slug }}>
                    {attraction.title} - {attraction.district}
                  </Link>
                </div>
              );
            }

            // Compute 3D cylinder transformation values
            const rotX = prefersReducedMotion ? 0 : dist * 28;
            const translateY = dist * (fullScreenSticky ? 160 : 140);
            const translateZ = prefersReducedMotion ? 0 : -Math.abs(dist) * 125;
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
                className={`absolute w-[88%] sm:w-[540px] md:w-[680px] lg:w-[760px] aspect-[16/10] max-h-[420px] rounded-2xl sm:rounded-3xl shadow-xl transition-shadow duration-300 ${
                  isCenter
                    ? "shadow-2xl shadow-sky-950/20 ring-2 ring-sky-400/60 cursor-pointer"
                    : "cursor-pointer hover:opacity-90"
                }`}
              >
                {/* Inner card link */}
                <Link
                  to="/place/$slug"
                  params={{ slug: attraction.slug }}
                  onClick={(e) => {
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

                  {/* Center "EXPLORE" Action Badge */}
                  {isCenter && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-md text-white font-mono text-xs sm:text-sm font-bold tracking-widest uppercase border border-white/40 shadow-xl group-hover:scale-110 group-hover:bg-white group-hover:text-slate-950 transition-all duration-300">
                        Explore
                        <ArrowUpRight className="size-4 stroke-[2.5]" />
                      </span>
                    </div>
                  )}

                  {/* District Badge */}
                  <div className="absolute top-4 left-4 sm:top-5 sm:left-5 z-10">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md px-3 py-1.5 text-xs font-mono font-bold text-slate-900 border border-slate-200/80 shadow-md">
                      <MapPin className="size-3.5 text-sky-600" />
                      {attraction.district}
                    </span>
                  </div>

                  {/* Category & Status */}
                  <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-10">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/60 backdrop-blur-md px-3 py-1.5 text-xs font-sans font-medium text-white/90 border border-white/10 uppercase tracking-wider">
                      <Compass className="size-3 text-sky-400" />
                      {attraction.category}
                    </span>
                  </div>

                  {/* Bottom Title & Details */}
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 z-10 flex flex-col justify-end">
                    <h3 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md group-hover:text-sky-300 transition-colors font-display line-clamp-1">
                      {attraction.title}
                    </h3>
                    <div className="flex items-center justify-between mt-1 sm:mt-2 text-xs sm:text-sm text-slate-300">
                      <span className="font-sans font-medium opacity-90">{attraction.activities}</span>
                      <span className="text-xs font-mono opacity-80 text-sky-300">Click to view details</span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}

          {/* Ambient Top & Bottom fade ramps for infinite cylinder feeling */}
          <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-background via-background/60 to-transparent pointer-events-none z-30" />
          <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none z-30" />
        </div>

        {/* Controller & Indicators Footer */}
        <div className="mx-auto w-full max-w-6xl pb-2 pt-1 flex items-center justify-between z-40">
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
                      ? "w-7 h-1.5 bg-sky-600"
                      : "w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400 dark:bg-white/20"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous attraction (roll up)"
              className="grid size-9 sm:size-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:text-sky-600 dark:bg-slate-900 dark:border-white/10 dark:text-slate-200 transition shadow-sm cursor-pointer"
            >
              <ChevronUp className="size-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next attraction (roll down)"
              className="grid size-9 sm:size-10 place-items-center rounded-full border border-sky-200 bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-400 transition shadow-sm cursor-pointer"
            >
              <ChevronDown className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
