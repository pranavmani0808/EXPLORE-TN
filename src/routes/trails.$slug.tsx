import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Compass,
  MapPin,
  Navigation,
  ArrowRight,
  Clock,
  Sparkles,
  Flame,
  Trees,
  Waves,
  Mountain,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import { CANONICAL_PLACES, ExplorerPlace } from "@/lib/data/canonical-places";

export interface TrailData {
  slug: string;
  title: string;
  subtitle: string;
  badge: string;
  distance: string;
  duration: string;
  difficulty: "Easy" | "Moderate" | "Challenging";
  bestSeason: string;
  description: string;
  highlights: string[];
  stops: { name: string; district: string; slug: string; description: string; latitude: number; longitude: number }[];
}

const TRAIL_CATALOG: Record<string, TrailData> = {
  "western-ghats-70-hairpin": {
    slug: "western-ghats-70-hairpin",
    title: "Western Ghats 70-Hairpin Pass Road Trip",
    subtitle: "Thakkaram to Valparai & Meghamalai cloud estate highways",
    badge: "Ghat Highway",
    distance: "460 km",
    duration: "2 Days",
    difficulty: "Challenging",
    bestSeason: "September to March",
    description:
      "A breathtaking mountain road trip navigating 70 hairpin curves through the Western Ghats shola cloud forests, tea plantations, and waterfalls.",
    highlights: [
      "70 Hairpin curves through Kolli & Valparai hills",
      "Highland tea estate vistas & mist viewpoints",
      "Wild elephant corridor transit rules",
      "Cool mountain climate & fresh air"
    ],
    stops: [
      { name: "Valparai 40-Hairpins", district: "Coimbatore", slug: "coimbatore", description: "Scenic tea valley pass", latitude: 10.3262, longitude: 76.9554 },
      { name: "Suruli Waterfalls", district: "Theni", slug: "theni", description: "150ft mountain cascade", latitude: 9.6644, longitude: 77.2711 },
      { name: "Kodaikanal Lake & Sholas", district: "Dindigul", slug: "kodaikanal", description: "Highland lake & pine forest", latitude: 10.2381, longitude: 77.4892 },
      { name: "Doddabetta Peak", district: "The Nilgiris", slug: "ooty", description: "Highest peak in Nilgiris", latitude: 11.4005, longitude: 76.7352 }
    ]
  },
  "coromandel-coastal": {
    slug: "coromandel-coastal",
    title: "Coromandel Coastal & Temple Ocean Highway",
    subtitle: "Scenic coastal stretch connecting Mahabalipuram, Pondicherry & Rameswaram",
    badge: "Coastal Drive",
    distance: "580 km",
    duration: "3 Days",
    difficulty: "Easy",
    bestSeason: "October to February",
    description:
      "Drive along the East Coast Road (ECR) bordering the Bay of Bengal, passing 7th-century UNESCO stone monuments, French colonial avenues, and sea temples.",
    highlights: [
      "ECR sea-view driving route along Bay of Bengal",
      "UNESCO Shore Temple stone reliefs in Mahabalipuram",
      "Pamban Sea Bridge & Dhanushkodi ghost town beach",
      "Fresh coastal seafood & ocean breezes"
    ],
    stops: [
      { name: "Mahabalipuram Coastal Heritage", district: "Chengalpattu", slug: "mahabalipuram", description: "7th-century UNESCO monuments", latitude: 12.6269, longitude: 80.1927 },
      { name: "Marina Beach Promenade", district: "Chennai", slug: "chennai", description: "13km urban sea beach", latitude: 13.0499, longitude: 80.2824 },
      { name: "Mathoor Hanging Aqueduct", district: "Kanyakumari", slug: "mathoor-aqueduct", description: "Asia's highest canal aqueduct", latitude: 8.3283, longitude: 77.3197 }
    ]
  }
};

export const Route = createFileRoute("/trails/$slug")({
  head: ({ params }) => {
    const trail = TRAIL_CATALOG[params.slug] || { title: "Travel Trail — ExplorerTN" };
    return {
      meta: [
        { title: `${trail.title} | ExplorerTN` },
        { name: "description", content: trail.subtitle || trail.description }
      ]
    };
  },
  component: TrailPage
});

function TrailPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const trail = TRAIL_CATALOG[slug] || {
    slug,
    title: slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    subtitle: "Curated road circuit across Tamil Nadu",
    badge: "Scenic Trail",
    distance: "400+ km",
    duration: "2-3 Days",
    difficulty: "Moderate",
    bestSeason: "Year-round",
    description: "Explore curated scenic stops, highway passes, and cultural highlights.",
    highlights: ["Scenic highway transit", "Local food stops", "Verified coordinates"],
    stops: [
      { name: "Destination Stop 1", district: "Tamil Nadu", slug: "explore", description: "Scenic gateway", latitude: 10.5, longitude: 78.5 }
    ]
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 pt-28 space-y-8 font-sans text-foreground">
        {/* Header Hero */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
              {trail.badge}
            </span>
            <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
              <span>🛣️ {trail.distance}</span>
              <span>⏱️ {trail.duration}</span>
              <span>🔥 {trail.difficulty}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-foreground tracking-tight">
              {trail.title}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">{trail.subtitle}</p>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">{trail.description}</p>

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border/60">
            <Button
              onClick={() => navigate({ to: "/planner" })}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              <Sparkles className="mr-2 size-4" /> Custom Plan This Trail
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/routes">Back to All Routes</Link>
            </Button>
          </div>
        </div>

        {/* Trail Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {trail.highlights.map((h, idx) => (
            <div key={idx} className="rounded-2xl border border-border bg-card p-4 space-y-2">
              <CheckCircle2 className="size-5 text-emerald-500" />
              <p className="text-xs font-semibold text-foreground">{h}</p>
            </div>
          ))}
        </div>

        {/* Stops Catalog */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-serif text-foreground flex items-center gap-2">
            <MapPin className="size-5 text-emerald-500" /> Trail Itinerary & Key Stops
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trail.stops.map((stop, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card p-5 space-y-3 hover:border-emerald-500/40 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-zinc-800 text-emerald-400 font-mono text-[10px] font-bold">
                    Stop #{i + 1}
                  </span>
                  <span className="text-xs text-muted-foreground">{stop.district} District</span>
                </div>
                <h3 className="text-lg font-bold text-foreground">{stop.name}</h3>
                <p className="text-xs text-muted-foreground">{stop.description}</p>
                <Link
                  to="/place/$slug"
                  params={{ slug: stop.slug }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500 hover:text-emerald-400"
                >
                  View Stop Details <ArrowRight className="size-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
