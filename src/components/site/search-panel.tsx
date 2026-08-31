import { useMemo, useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Search, Clock, Flame, Sparkles, MapPin, Server, Mic, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { places, categories } from "@/data/places";
import { fetchAutocompleteSuggestions, BackendSearchSuggestion } from "@/lib/api";

const trendingSpots = [
  { label: "Kolli Hills 70 Hairpins", type: "offroad", icon: "📍" },
  { label: "Hogenakkal Falls", type: "waterfalls", icon: "🌊" },
  { label: "Valparai Sholayar Ride", type: "offroad", icon: "🏍️" },
  { label: "Dhanushkodi Ghost Town", type: "beaches", icon: "🏖️" },
];

const recentSearches = ["Chennai", "Ooty", "Kodaikanal"];

const aiSuggestions = [
  { label: "Weekend Ride", blurb: "Best 2-day loop passes" },
  { label: "Waterfalls near me", blurb: "Monsoon cascades within 100 km" },
  { label: "Hidden Tea Estates", blurb: "Offbeat ridge trails in Nilgiris" },
];

export function SearchPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [query, setQuery] = useState("");
  const [backendSuggestions, setBackendSuggestions] = useState<BackendSearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setBackendSuggestions([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(() => {
      fetchAutocompleteSuggestions(query).then((suggestions) => {
        setBackendSuggestions(suggestions);
        setIsSearching(false);
      }).catch(() => {
        setIsSearching(false);
      });
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
        {/* Backdrop click listener */}
        <div className="absolute inset-0" onClick={() => onOpenChange(false)} />

        {/* Apple Spotlight Floating Glass Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-[#121821]/90 backdrop-blur-[24px] border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-white z-10"
        >
          {/* Spotlight Search Header Input */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 bg-white/5">
            <Search className="size-5 text-emerald-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search waterfalls, routes, tea estates, districts..."
              className="w-full bg-transparent text-base font-medium text-white placeholder-[#A1A8B3] focus:outline-none"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <Mic className="size-5 text-[#A1A8B3] hover:text-emerald-400 cursor-pointer transition-colors" />
              <button
                onClick={() => onOpenChange(false)}
                className="size-7 grid place-items-center rounded-full bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Spotlight Content Body */}
          <div className="max-h-[65vh] overflow-y-auto p-5 space-y-6">
            {/* Live Backend Search Results if Query Present */}
            {query.trim() && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <Server className="size-3.5" /> LIVE BACKEND SEARCH RESULTS
                  </p>
                  <span className="text-[10px] font-mono text-slate-400">{backendSuggestions.length} Matches Found</span>
                </div>

                {isSearching ? (
                  <p className="text-xs text-emerald-400 font-mono py-4 text-center animate-pulse">
                    Searching canonical database for "{query}"...
                  </p>
                ) : backendSuggestions.length > 0 ? (
                  <div className="space-y-2">
                    {backendSuggestions.map((s) => {
                      const slug = s.slug || s.id;
                      const categories = (s.categories || [s.category]).map(c => c.charAt(0).toUpperCase() + c.slice(1));

                      return (
                        <div
                          key={s.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <MapPin className="size-4 text-emerald-400 shrink-0" />
                              <span className="font-bold text-sm text-white">{s.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400 pl-6">
                              <span>{s.district}, {s.state || "Tamil Nadu"}</span>
                              <span>•</span>
                              <span className="text-emerald-400 font-medium">{categories.slice(0, 3).join(" • ")}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pl-6 sm:pl-0">
                            <Link
                              to={`/place/$slug`}
                              params={{ slug }}
                              onClick={() => onOpenChange(false)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold text-xs border border-emerald-500/30 transition"
                            >
                              View Details
                            </Link>
                            <Link
                              to="/discover"
                              onClick={() => onOpenChange(false)}
                              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs transition"
                            >
                              View on Map
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-2 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-sm font-semibold text-slate-300">No canonical places found matching "{query}"</p>
                    <p className="text-xs text-slate-400">
                      Try searching for <span className="text-emerald-400 font-mono">"vallichunai"</span>, <span className="text-emerald-400 font-mono">"piranmalai"</span>, <span className="text-emerald-400 font-mono">"mathoor"</span>, or <span className="text-emerald-400 font-mono">"sivaganga"</span>.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Trending Section */}
            {!query.trim() && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#A1A8B3] mb-3 flex items-center gap-2">
                  <Flame className="size-4 text-amber-400" /> Trending Spots
                </p>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {trendingSpots.map((spot) => (
                    <div
                      key={spot.label}
                      onClick={() => onOpenChange(false)}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/40 transition cursor-pointer group"
                    >
                      <span className="text-lg">{spot.icon}</span>
                      <span className="font-semibold text-sm text-slate-200 group-hover:text-white">{spot.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {!query.trim() && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#A1A8B3] mb-3 flex items-center gap-2">
                  <Clock className="size-4 text-emerald-400" /> Recent
                </p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((rec) => (
                    <button
                      key={rec}
                      onClick={() => onOpenChange(false)}
                      className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 hover:border-emerald-500/40 transition flex items-center gap-1.5"
                    >
                      <Clock className="size-3 text-slate-400" /> {rec}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Suggestions */}
            {!query.trim() && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#A1A8B3] mb-3 flex items-center gap-2">
                  <Sparkles className="size-4 text-emerald-400" /> AI Suggestions
                </p>
                <div className="space-y-2">
                  {aiSuggestions.map((sug) => (
                    <div
                      key={sug.label}
                      onClick={() => onOpenChange(false)}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="size-4 text-emerald-400 shrink-0" />
                        <div>
                          <p className="font-bold text-sm text-white">{sug.label}</p>
                          <p className="text-xs text-slate-400">{sug.blurb}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">Explore →</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
