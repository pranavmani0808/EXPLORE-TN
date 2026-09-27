import React, { useState } from "react";
import { Sparkles, Compass, MapPin, Calendar, Filter, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AITravelPlannerInputProps {
  onSearch: (params: {
    query: string;
    origin?: string;
    destination?: string;
    days?: number;
    categories?: string[];
  }) => void;
  isLoading?: boolean;
}

const PROMPT_SUGGESTIONS = [
  "Plan a trip from Madurai to Kanyakumari",
  "Kanyakumari hidden places & beaches",
  "2 day trip from Chennai to Pondicherry",
  "Best waterfalls near Coimbatore",
  "Heritage temples around Thanjavur"
];

export const AITravelPlannerInput: React.FC<AITravelPlannerInputProps> = ({
  onSearch,
  isLoading = false
}) => {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch({
      query: query.trim(),
      origin: origin.trim() || undefined,
      destination: destination.trim() || undefined,
      days: days || 1
    });
  };

  const handleChipClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch({ query: suggestion, days });
  };

  return (
    <div className="w-full bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-6 rounded-2xl shadow-xl border border-emerald-500/20 text-white space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-400/30 text-emerald-400">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
            ExploreTN AI Travel Intelligence Engine
          </h2>
          <p className="text-xs text-slate-300">
            Powered by Gemini AI, PostGIS spatial queries, and live road routing
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 'Plan a 2 day trip from Madurai to Kanyakumari'..."
            className="w-full bg-slate-800/90 border-slate-700 text-white placeholder-slate-400 rounded-xl px-4 py-3 text-xs sm:text-sm focus:border-emerald-500 focus:ring-emerald-500/20 h-11"
          />
          <div className="flex items-center gap-2 justify-end shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="text-slate-300 hover:text-white hover:bg-slate-700/50 h-11 px-3 border border-slate-700/80 rounded-xl"
            >
              <Filter className="w-4 h-4 mr-1" />
              <span className="text-xs">Filters</span>
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-5 h-11 rounded-xl transition-all shadow-md shadow-emerald-500/20"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1.5" />
                  <span>Plan</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-emerald-400" /> Prompts:
          </span>
          {PROMPT_SUGGESTIONS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleChipClick(chip)}
              className="text-xs bg-slate-800/70 hover:bg-emerald-950/80 text-emerald-300 hover:text-emerald-200 border border-emerald-500/20 px-3 py-1 rounded-full transition-all"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Optional Expanded Filter Controls */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300">
            <div>
              <label className="block text-slate-400 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Origin City
              </label>
              <Input
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. Madurai"
                className="bg-slate-800 border-slate-700 text-white text-xs py-1.5 h-8"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-400" /> Destination
              </label>
              <Input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Kanyakumari"
                className="bg-slate-800 border-slate-700 text-white text-xs py-1.5 h-8"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Duration (Days)
              </label>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-md p-1.5 h-8 focus:outline-none focus:border-emerald-500"
              >
                {[1, 2, 3, 4, 5, 7, 10].map((d) => (
                  <option key={d} value={d}>
                    {d} {d === 1 ? "Day" : "Days"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
