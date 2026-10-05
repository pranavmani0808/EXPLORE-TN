import React, { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, ChevronLeft, MapPin, Sparkles } from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";

export interface DestinationHub {
  name: string;
  activitiesCount: string;
  image: string;
  route: string;
  tagline: string;
}

export interface IconicAttraction {
  id: string;
  title: string;
  district: string;
  activities: string;
  image: string;
  category: string;
  slug: string;
}

// 1. "Things to do wherever you're going" - Top Row Destinations
export const DESTINATION_HUBS: DestinationHub[] = [
  {
    name: "Ooty",
    activitiesCount: "52 activities",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
    route: "/districts/the-nilgiris",
    tagline: "Queen of Hill Stations, misty peaks & tea gardens",
  },
  {
    name: "Kodaikanal",
    activitiesCount: "44 activities",
    image: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=600&q=80",
    route: "/districts/dindigul",
    tagline: "Princess of Hills, star-shaped lake & pine forests",
  },
  {
    name: "Madurai",
    activitiesCount: "68 activities",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80",
    route: "/districts/madurai",
    tagline: "Thoonga Nagaram, ancient gopurams & food legends",
  },
  {
    name: "Rameswaram",
    activitiesCount: "36 activities",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80",
    route: "/districts/ramanathapuram",
    tagline: "Pamban Bridge, Dhanushkodi ghost town & island shores",
  },
  {
    name: "Mahabalipuram",
    activitiesCount: "29 activities",
    image: "https://images.unsplash.com/photo-1600100397608-f010f444f434?auto=format&fit=crop&w=600&q=80",
    route: "/districts/chengalpattu",
    tagline: "UNESCO rock sculptures & coastal shore temple",
  },
  {
    name: "Thanjavur",
    activitiesCount: "41 activities",
    image: "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=600&q=80",
    route: "/districts/thanjavur",
    tagline: "Chola heartland & the architectural wonder Big Temple",
  },
];

// 2. "Attractions you can't miss" - Bottom Row Iconic Spots with Carousel
export const ICONIC_ATTRACTIONS: IconicAttraction[] = [
  {
    id: "meenakshi",
    title: "Meenakshi Amman Temple",
    district: "Madurai",
    activities: "38 experiences",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=900&q=80",
    category: "temples",
    slug: "meenakshi-amman-temple",
  },
  {
    id: "brihadisvara",
    title: "Brihadisvara Big Temple",
    district: "Thanjavur",
    activities: "42 experiences",
    image: "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=900&q=80",
    category: "heritage",
    slug: "thanjavur-city",
  },
  {
    id: "dhanushkodi",
    title: "Dhanushkodi Ghost Town",
    district: "Rameswaram",
    activities: "24 experiences",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
    category: "beaches",
    slug: "mahabalipuram",
  },
  {
    id: "nilgiri-railway",
    title: "Nilgiri Mountain Railway",
    district: "Ooty",
    activities: "19 experiences",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80",
    category: "hills",
    slug: "kodaikanal",
  },
  {
    id: "hogenakkal",
    title: "Hogenakkal Niagara Falls",
    district: "Dharmapuri",
    activities: "27 experiences",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
    category: "waterfalls",
    slug: "theni",
  },
  {
    id: "shore-temple",
    title: "Shore Temple & Pancha Rathas",
    district: "Mahabalipuram",
    activities: "31 experiences",
    image: "https://images.unsplash.com/photo-1600100397608-f010f444f434?auto=format&fit=crop&w=900&q=80",
    category: "heritage",
    slug: "mahabalipuram",
  },
];

export function ThingsToDoSection() {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 320;
      carouselRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 font-sans">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* ROW 1: Things to do wherever you're going                   */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="mb-14">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
            Things to do wherever you're going
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Handpicked activities, secret trails, and regional hubs across Tamil Nadu
          </p>
        </div>

        {/* 6 Square Portrait Tiles Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5 sm:gap-4">
          {DESTINATION_HUBS.map((hub) => (
            <Link
              key={hub.name}
              to={hub.route}
              className="group block focus:outline-none"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-md transition-all duration-300 group-hover:scale-[1.03] group-hover:border-emerald-500/50 group-hover:shadow-xl">
                <SafeImage
                  src={hub.image}
                  alt={hub.name}
                  category="hills"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
              </div>
              <div className="mt-2.5">
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {hub.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* ROW 2: Attractions you can't miss                           */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="relative">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
              Attractions you can't miss
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-zinc-400">
              Must-experience destinations, ancient wonders, and breathtaking natural sites
            </p>
          </div>

          {/* Desktop Navigation Controls */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollCarousel("left")}
              aria-label="Scroll left"
              className="grid size-9 place-items-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-emerald-500 hover:text-white transition shadow cursor-pointer"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollCarousel("right")}
              aria-label="Scroll right"
              className="grid size-9 place-items-center rounded-full border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black transition shadow cursor-pointer"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Carousel */}
        <div
          ref={carouselRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {ICONIC_ATTRACTIONS.map((attraction) => (
            <Link
              key={attraction.id}
              to="/place/$slug"
              params={{ slug: attraction.slug }}
              className="group flex-shrink-0 w-[260px] sm:w-[280px] md:w-[310px] snap-start focus:outline-none"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-md transition-all duration-300 group-hover:scale-[1.02] group-hover:border-emerald-500/50 group-hover:shadow-2xl">
                <SafeImage
                  src={attraction.image}
                  alt={attraction.title}
                  category={attraction.category}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-md bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-mono text-zinc-300 border border-white/10">
                  <MapPin className="size-2.5 text-emerald-400" />
                  {attraction.district}
                </span>
              </div>
              <div className="mt-2.5">
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug">
                  {attraction.title}
                </h3>
                <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                  {attraction.activities}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
