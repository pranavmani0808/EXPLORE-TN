import React from "react";
import { Navigation, Clock, MapPin, Calendar, Heart, Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIPlanBottomBarProps {
  totalDistanceKm?: number;
  totalDurationMins?: number;
  destinationsCount?: number;
  durationDays?: number;
  onSaveTrip: () => void;
  onShareTrip: () => void;
  onDownloadPdf: () => void;
  isSaved?: boolean;
}

export const AIPlanBottomBar: React.FC<AIPlanBottomBarProps> = ({
  totalDistanceKm = 128,
  totalDurationMins = 255,
  destinationsCount = 5,
  durationDays = 2,
  onSaveTrip,
  onShareTrip,
  onDownloadPdf,
  isSaved = false
}) => {
  const hours = Math.floor(totalDurationMins / 60);
  const mins = totalDurationMins % 60;
  const timeFormatted = `${hours}h ${mins}m`;

  return (
    <div className="w-full bg-white dark:bg-[#11161d] border border-slate-200 dark:border-white/10 p-5 rounded-3xl shadow-lg flex flex-wrap items-center justify-between gap-4">
      {/* Metrics Summary */}
      <div className="flex flex-wrap items-center gap-6 sm:gap-8">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">Total Distance</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{totalDistanceKm} km</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">Total Travel Time</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{timeFormatted}</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">Destinations</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{destinationsCount} Places</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">Trip Duration</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{durationDays} Days</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        <Button
          type="button"
          onClick={onSaveTrip}
          className={`font-bold text-xs rounded-2xl px-4 py-2 transition-all flex items-center gap-1.5 ${
            isSaved
              ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
              : "bg-slate-900 dark:bg-white/10 text-white hover:bg-slate-800 dark:hover:bg-white/20"
          }`}
        >
          <Heart className={`w-4 h-4 ${isSaved ? "fill-white" : "text-rose-400"}`} />
          <span>{isSaved ? "Saved to Account" : "Save Trip"}</span>
        </Button>

        <Button
          type="button"
          onClick={onShareTrip}
          variant="outline"
          className="border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 font-bold text-xs rounded-2xl px-4 py-2"
        >
          <Share2 className="w-4 h-4 mr-1.5 text-cyan-500" />
          <span>Share Trip</span>
        </Button>

        <Button
          type="button"
          onClick={onDownloadPdf}
          variant="outline"
          className="border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 font-bold text-xs rounded-2xl px-4 py-2"
        >
          <Download className="w-4 h-4 mr-1.5 text-emerald-500" />
          <span>Download PDF</span>
        </Button>
      </div>
    </div>
  );
};
