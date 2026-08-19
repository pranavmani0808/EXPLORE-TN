import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  MapPin,
  Clock,
  Tag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Plane,
  Train,
  Car,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Award,
} from "lucide-react";
import { AdventureActivity } from "@/data/adventures";
import { Button } from "@/components/ui/button";
import { Map, MapMarker, MarkerContent, MarkerTooltip, MapControls } from "@/components/ui/map";

export function AdventureDetailModal({
  activity,
  onClose,
}: {
  activity: AdventureActivity | null;
  onClose: () => void;
}) {
  const [imgSrc, setImgSrc] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"overview" | "location" | "safety">("overview");

  if (!activity) return null;

  const currentImg = imgSrc || activity.image;
  const plannerPrompt = `Plan a ${activity.name} trip to ${activity.destination}, ${activity.state}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 font-sans overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#121821] text-slate-900 dark:text-white shadow-2xl scrollbar-thin"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 grid size-10 place-items-center rounded-full bg-slate-950/70 text-white backdrop-blur-md transition-all hover:bg-slate-950 hover:scale-110 border border-white/20"
            aria-label="Close modal"
          >
            <X className="size-5" />
          </button>

          {/* Hero Banner Header */}
          <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-slate-900">
            <img
              src={currentImg}
              alt={`${activity.name} at ${activity.destination}`}
              onError={() => setImgSrc(activity.fallbackImage)}
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            {/* Badges Overlay */}
            <div className="absolute top-6 left-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 text-slate-950 px-3.5 py-1 text-xs font-black shadow-lg">
                <Flame className="size-3.5" />
                {activity.category}
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-950/80 text-white border border-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md">
                {activity.difficulty}
              </span>
              {activity.altitude && (
                <span className="inline-flex items-center rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 text-xs font-bold backdrop-blur-md">
                  ⛰️ {activity.altitude}
                </span>
              )}
            </div>

            {/* Hero Text */}
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight drop-shadow-md">
                {activity.name}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-200">
                <span className="flex items-center gap-1.5 font-semibold">
                  <MapPin className="size-4 text-emerald-400 shrink-0" />
                  {activity.destination}, {activity.state}, {activity.country}
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Clock className="size-4 text-emerald-400 shrink-0" />
                  {activity.duration}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-xs">
            <div className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <div className="text-slate-400 font-medium">Est. Price</div>
              <div className="font-extrabold text-slate-900 dark:text-white text-sm mt-0.5">{activity.estimatedPrice}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <div className="text-slate-400 font-medium">Best Season</div>
              <div className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">{activity.bestSeason}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <div className="text-slate-400 font-medium">Popularity Score</div>
              <div className="font-extrabold text-amber-500 text-sm mt-0.5">⭐ {activity.popularityScore} / 100</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <div className="text-slate-400 font-medium">Category</div>
              <div className="font-extrabold text-indigo-400 text-sm mt-0.5">{activity.category}</div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-white/10 px-6 pt-4 gap-4 text-sm font-bold">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === "overview"
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-black"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Overview & Highlights
            </button>
            <button
              onClick={() => setActiveTab("location")}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === "location"
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-black"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Location & How to Reach
            </button>
            <button
              onClick={() => setActiveTab("safety")}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === "safety"
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-black"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Safety & Inclusions
            </button>
          </div>

          {/* Tab Body Content */}
          <div className="p-6 space-y-6">

            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">About the Experience</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {activity.fullDescription}
                  </p>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mb-3">Key Experience Highlights</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activity.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-200">
                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Experience Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {activity.tags.map((t) => (
                      <span key={t} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: LOCATION & MAP */}
            {activeTab === "location" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">Activity GPS Location</h4>
                  <p className="text-xs text-slate-500 dark:text-muted-foreground mb-3">
                    Exact coordinates: {activity.coordinates.lat.toFixed(4)}° N, {activity.coordinates.lng.toFixed(4)}° E ({activity.destination}, {activity.state})
                  </p>
                  
                  {/* Interactive Map Preview */}
                  <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-white/15 bg-slate-900 shadow-md">
                    <Map center={[activity.coordinates.lat, activity.coordinates.lng]} zoom={10} className="size-full">
                      <MapControls />
                      <MapMarker latitude={activity.coordinates.lat} longitude={activity.coordinates.lng}>
                        <MarkerContent>
                          <div className="grid size-9 place-items-center rounded-full bg-emerald-500 text-slate-950 font-black text-xs shadow-xl animate-bounce">
                            📍
                          </div>
                        </MarkerContent>
                        <MarkerTooltip>{activity.name} @ {activity.destination}</MarkerTooltip>
                      </MapMarker>
                    </Map>
                  </div>
                </div>

                {/* How to Reach */}
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mb-3">How to Reach</h4>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                      <Plane className="size-4 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">Nearest Airport: </span>
                        <span className="text-slate-600 dark:text-slate-300">{activity.howToReach.airport}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                      <Train className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">Nearest Railway: </span>
                        <span className="text-slate-600 dark:text-slate-300">{activity.howToReach.railway}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                      <Car className="size-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">Road Access: </span>
                        <span className="text-slate-600 dark:text-slate-300">{activity.howToReach.road}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: SAFETY & INCLUSIONS */}
            {activeTab === "safety" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mb-3">Safety Protocols & Gear</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activity.safetyEquipment.map((s, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-800 dark:text-emerald-300">
                        <ShieldCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mb-3">What's Included in Package</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activity.inclusions.map((inc, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200">
                        <Award className="size-4 text-amber-500 shrink-0" />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </div>

          {/* Modal Footer with AI Trip Copilot CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121821]/90 rounded-b-3xl">
            <div>
              <div className="text-xs text-slate-500 dark:text-muted-foreground font-medium">Estimated Package Rate</div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white">{activity.estimatedPrice}</div>
            </div>

            <Link
              to="/planner"
              search={{ prompt: plannerPrompt }}
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              <Button className="w-full sm:w-auto rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-6 shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 text-sm">
                <Sparkles className="size-4" />
                <span>Plan Adventure with AI Copilot</span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
