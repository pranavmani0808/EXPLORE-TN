import React from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  MapPin,
  Calendar,
  Car,
  Users,
  Compass,
  CheckCircle2,
  Clock,
  ChevronRight,
  Award,
  Umbrella,
  Camera,
  Landmark,
  Eye,
  Navigation,
  PlusCircle,
  Loader2,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface StopItem {
  order: number;
  day_number: number;
  place_id: string;
  name: string;
  slug: string;
  category: string;
  lat: number;
  lng: number;
  district?: string;
  image_url?: string;
  distance_from_prev_km: number;
  duration_from_prev_mins: number;
  recommended_visit_mins: number;
  rationale: string;
  opening_hours: string;
  access_status: string;
  provenance?: {
    source: string;
    confidence: number;
    verified: boolean;
  };
}

interface AIRecommendationCard {
  id: string;
  title: string;
  category: string;
  icon: string;
  detourText: string;
  reason: string;
}

interface AIPlanSidebarProps {
  tripTitle?: string;
  subtitle?: string;
  originName?: string;
  destName?: string;
  durationDays?: number;
  travelMode?: string;
  stopsCount?: number;
  preferences?: string[];
  stops?: StopItem[];
  recommendations?: AIRecommendationCard[];
  selectedStopId?: string | null;
  onSelectStop?: (stopId: string) => void;
  onAddRecommendation?: (recId: string) => void;
  isAddingRec?: boolean;
}

const DEFAULT_PREFERENCES = ["Beaches", "Temples", "Hidden Places", "Heritage", "Photography"];

const DEFAULT_RECOMMENDATIONS: AIRecommendationCard[] = [
  { id: "rec-1", title: "Manapad Coastal Dune", category: "Hidden Gem", icon: "💎", detourText: "12 min detour from route", reason: "Perfect for your beach & hidden places preference" },
  { id: "rec-2", title: "Kottilpadu Beach", category: "Beach", icon: "🏖", detourText: "8 min detour from route", reason: "Best visited around sunset for coastal views" },
  { id: "rec-3", title: "Suchindram Temple Chariot", category: "Heritage", icon: "🛕", detourText: "On-route stop", reason: "Matches your temple architecture interest" },
  { id: "rec-4", title: "Famous Jigarthanda Shop", category: "Local Food", icon: "🍜", detourText: "2 min detour in Madurai", reason: "Recommended refreshing local dessert" }
];

export const AIPlanSidebar: React.FC<AIPlanSidebarProps> = ({
  tripTitle,
  subtitle = "A personalized journey through temples, beaches, hidden gems and heritage.",
  originName = "Madurai",
  destName = "Kanyakumari",
  durationDays = 2,
  travelMode = "Car Road Trip",
  stopsCount = 5,
  preferences = DEFAULT_PREFERENCES,
  stops = [],
  recommendations = DEFAULT_RECOMMENDATIONS,
  selectedStopId,
  onSelectStop,
  onAddRecommendation,
  isAddingRec = false
}) => {
  const routeHeading = `${originName} → ${destName}`;

  return (
    <div className="w-full bg-[#11161d] rounded-3xl border border-white/10 p-6 shadow-2xl space-y-6 flex flex-col text-white">
      
      {/* 1. Header & Breadcrumb */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <span>Your Trip</span>
          <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-emerald-400 font-bold">AI Route Plan</span>
        </div>

        <div>
          <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
            {routeHeading}
          </h2>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mt-1">
            <span>{durationDays} Days</span>
            <span>•</span>
            <span>{travelMode}</span>
            <span>•</span>
            <span>{stops.length || stopsCount} Stops</span>
          </div>
        </div>

        {/* Why AI Chose This Trip */}
        <div className="p-3.5 bg-gradient-to-r from-emerald-950/90 via-slate-900 to-teal-950 border border-emerald-500/30 rounded-2xl space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Why AI Chose This Trip</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            "Based on your interest in {preferences.join(", ").toLowerCase()} while keeping driving practical."
          </p>
        </div>

        {/* AI Preference Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {preferences.map((pref, i) => (
            <span key={i} className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/30 font-semibold">
              {pref}
            </span>
          ))}
        </div>
      </div>

      {/* 2. Your Journey Vertical Timeline */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-emerald-400" /> Your Journey Timeline
        </h4>

        <div className="space-y-4 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-white/10 pl-9">
          {stops.map((stop, idx) => {
            const isSelected = selectedStopId === stop.place_id || selectedStopId === stop.slug;
            const prevStopName = idx > 0 ? stops[idx - 1].name : originName;

            const hours = Math.floor(stop.duration_from_prev_mins / 60);
            const mins = stop.duration_from_prev_mins % 60;
            const timeStr = `${hours > 0 ? `${hours}h ` : ""}${mins}m`;

            return (
              <motion.div
                key={stop.place_id || idx}
                id={`timeline-stop-${stop.place_id || stop.slug}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onSelectStop && onSelectStop(stop.place_id || stop.slug)}
                className={cn(
                  "relative p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5",
                  isSelected
                    ? "bg-emerald-500/15 border-emerald-400 text-white shadow-xl ring-2 ring-emerald-500/30"
                    : "bg-white/5 border-white/10 hover:border-emerald-500/40 text-slate-200"
                )}
              >
                {/* Connecting Circle Marker Dot */}
                <div
                  className={cn(
                    "absolute -left-9 top-4 w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] ring-4 ring-[#11161d] shadow-md",
                    isSelected ? "bg-emerald-400 text-slate-950" : "bg-slate-800 text-emerald-400 border border-emerald-500/40"
                  )}
                >
                  {stop.order || idx + 1}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                    DAY {stop.day_number || 1}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-semibold">{stop.category}</span>
                </div>

                {/* Place Thumbnail & Name */}
                <div className="flex items-start gap-3">
                  {stop.image_url ? (
                    <img
                      src={stop.image_url}
                      alt={stop.name}
                      className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0 shadow-sm"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-xl shrink-0">
                      📍
                    </div>
                  )}

                  <div className="space-y-0.5">
                    <h5 className="font-extrabold text-sm text-white leading-snug">{stop.name}</h5>
                    <div className="text-[11px] text-slate-400">{stop.district || "Tamil Nadu"}</div>
                  </div>
                </div>

                {/* Segment Travel Info from Previous Stop */}
                {stop.duration_from_prev_mins > 0 && (
                  <div className="px-3 py-1.5 bg-slate-900/80 rounded-xl border border-emerald-500/20 text-[11px] text-slate-300 flex items-center gap-1.5 font-mono">
                    <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>🚗 From {prevStopName}: <strong className="text-emerald-300">{timeStr} · {stop.distance_from_prev_km} km</strong></span>
                  </div>
                )}

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {stop.rationale}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
                  <span className="text-slate-400">
                    Recommended visit: <strong className="text-white">{Math.floor(stop.recommended_visit_mins / 60) > 0 ? `${Math.floor(stop.recommended_visit_mins / 60)}h ` : ""}{stop.recommended_visit_mins % 60}m</strong>
                  </span>

                  <a
                    href={`/place/${stop.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline transition-all cursor-pointer"
                  >
                    <span>View Place</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 3. ✨ AI Recommendations Section with + Add to Trip Buttons */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> ✨ AI Recommendations
        </h4>

        <div className="space-y-2.5">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-3.5 bg-emerald-950/30 border border-emerald-500/25 rounded-2xl flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span>{rec.icon}</span>
                  <span className="font-extrabold text-white text-sm">{rec.title}</span>
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold">{rec.detourText}</div>
                <p className="text-[11px] text-slate-300">{rec.reason}</p>
              </div>

              <Button
                size="sm"
                disabled={isAddingRec}
                onClick={() => onAddRecommendation && onAddRecommendation(rec.id)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] px-2.5 py-1 h-7 rounded-xl shrink-0 cursor-pointer"
              >
                {isAddingRec ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <PlusCircle className="w-3 h-3 mr-1" />
                    <span>+ Add to Trip</span>
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
