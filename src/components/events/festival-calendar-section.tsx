import React, { useState } from "react";
import { FESTIVAL_CALENDAR_MONTHS } from "@/lib/data/events-data";
import { Link } from "@tanstack/react-router";
import { CalendarDays, Sparkles, ChevronRight, Compass } from "lucide-react";

export const FestivalCalendarSection: React.FC = () => {
  const currentMonthIdx = new Date().getMonth() + 1; // 1-12
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthIdx);

  const activeMonthData = FESTIVAL_CALENDAR_MONTHS.find((m) => m.monthIndex === selectedMonth) || FESTIVAL_CALENDAR_MONTHS[0];

  return (
    <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-zinc-950 via-zinc-900/90 to-zinc-950 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="size-3.5 text-amber-400" />
            <span>Year-Round Heritage Calendar</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
            Tamil Nadu Festival Calendar
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Discover annual cultural celebrations, temple chariot festivals, music seasons, and harvest rituals by Tamil month and season.
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs text-zinc-500 font-mono">12 Months • All 38 Districts</span>
        </div>
      </div>

      {/* Horizontal Month Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {FESTIVAL_CALENDAR_MONTHS.map((m) => {
          const isSelected = selectedMonth === m.monthIndex;
          const isCurrent = m.monthIndex === currentMonthIdx;

          return (
            <button
              key={m.monthIndex}
              type="button"
              onClick={() => setSelectedMonth(m.monthIndex)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex flex-col items-center min-w-[80px] border ${
                isSelected
                  ? "bg-amber-400 text-zinc-950 border-amber-300 shadow-lg shadow-amber-400/20 scale-105"
                  : "bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:border-amber-500/40 hover:text-white"
              }`}
            >
              <span className="tracking-tight">{m.monthName}</span>
              <span className={`text-[10px] font-mono opacity-80 ${isSelected ? "text-zinc-900" : "text-amber-400/80"}`}>
                {m.tamilMonth.split(" ")[0]}
              </span>
              {isCurrent && !isSelected && (
                <span className="size-1.5 rounded-full bg-emerald-400 mt-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Month Highlight Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 sm:p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 backdrop-blur-sm">
        <div className="space-y-2 md:col-span-1 border-b md:border-b-0 md:border-r border-zinc-800/80 pb-4 md:pb-0 md:pr-4">
          <div className="text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
            {activeMonthData.tamilMonth}
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
            {activeMonthData.monthName} Celebrations
          </h3>
          <p className="text-xs text-amber-200/90 font-medium">
            Season: {activeMonthData.seasonName}
          </p>
          <p className="text-xs text-zinc-400 leading-relaxed pt-1">
            {activeMonthData.description}
          </p>
        </div>

        <div className="md:col-span-2 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Compass className="size-3.5 text-amber-400" /> Major Festivals & Celebrations
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeMonthData.featuredFestivals.map((fest, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800/80 hover:border-amber-500/40 transition flex items-center justify-between group"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                    {fest}
                  </span>
                  <p className="text-[10px] text-zinc-400">Tamil Nadu Cultural Experience</p>
                </div>
                <Sparkles className="size-3.5 text-amber-400/60 group-hover:text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
            ))}
          </div>

          <div className="pt-2 text-[11px] text-zinc-400 font-mono">
            * Note: Exact dates for annual temple festivals vary each year based on the traditional Tamil Panchangam and lunar alignment.
          </div>
        </div>
      </div>
    </div>
  );
};
