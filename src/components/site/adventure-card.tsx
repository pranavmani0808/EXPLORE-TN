import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { MapPin, Clock, Tag, Sparkles, ArrowRight, Info, Eye } from "lucide-react";
import { AdventureActivity } from "@/data/adventures";
import { Button } from "@/components/ui/button";

const categoryIcons: Record<string, string> = {
  "Air Adventures": "🪂",
  "Water Adventures": "🤿",
  "Mountain Adventures": "⛰️",
  "Snow Adventures": "⛷️",
  "Extreme Adventures": "⚡",
};

const difficultyColors: Record<string, string> = {
  Easy: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  Moderate: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  Advanced: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  Extreme: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
};

export function AdventureCard({
  activity,
  onSelect,
}: {
  activity: AdventureActivity;
  onSelect?: (activity: AdventureActivity) => void;
}) {
  const [imgSrc, setImgSrc] = useState(activity.image);
  const [hasError, setHasError] = useState(false);

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(activity.fallbackImage);
    }
  };

  const plannerPrompt = `Plan a ${activity.name} trip to ${activity.destination}, ${activity.state}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121821]/80 backdrop-blur-[16px] shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-emerald-500/40"
    >
      {/* Cover Image Container (Clickable for Modal) */}
      <div
        onClick={() => onSelect && onSelect(activity)}
        className="relative h-60 w-full overflow-hidden bg-slate-900 cursor-pointer"
      >
        <img
          src={imgSrc}
          alt={`${activity.name} at ${activity.destination}, ${activity.state}`}
          loading="lazy"
          onError={handleImageError}
          className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md border border-white/15">
            <span>{categoryIcons[activity.category] || "🧭"}</span>
            <span>{activity.category}</span>
          </span>
        </div>

        <div className="absolute right-4 top-4">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold border backdrop-blur-md ${
              difficultyColors[activity.difficulty] || difficultyColors.Moderate
            }`}
          >
            {activity.difficulty}
          </span>
        </div>

        {/* Destination overlay on bottom of image */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
            <MapPin className="size-3.5 text-emerald-400 shrink-0" />
            <span className="font-semibold text-white truncate">
              {activity.destination}, {activity.state}
            </span>
          </div>
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
            {activity.bestSeason}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3
          onClick={() => onSelect && onSelect(activity)}
          className="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors cursor-pointer"
        >
          {activity.name}
        </h3>

        <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-muted-foreground line-clamp-2">
          {activity.description}
        </p>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {activity.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md bg-slate-100 dark:bg-white/5 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-5">
          {/* Metadata Row */}
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/10 pt-3 text-xs text-slate-500 dark:text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="size-3.5 text-slate-400" />
              <span>{activity.duration}</span>
            </div>
            <div className="font-bold text-slate-900 dark:text-white">
              {activity.estimatedPrice}
            </div>
          </div>

          {/* Action CTA Buttons */}
          <div className="mt-4 grid grid-cols-12 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onSelect && onSelect(activity)}
              className="col-span-5 rounded-2xl border-slate-200 dark:border-white/15 text-xs font-bold py-5 hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center gap-1"
            >
              <Eye className="size-3.5" />
              <span>Details</span>
            </Button>

            <Link
              to="/planner"
              search={{ prompt: plannerPrompt }}
              className="col-span-7"
            >
              <Button
                variant="default"
                className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-5 text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="size-3.5" />
                <span>Plan Trip</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
