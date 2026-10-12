import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Clock, Flame, Sparkles, MapPin, Server, Mic, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { places, categories } from "@/data/places";
import { fetchAutocompleteSuggestions, BackendSearchSuggestion } from "@/lib/api";

const quickSuggestions = [
  { label: "Ooty", queryText: "Ooty", icon: "🏔️", targetArea: "Ooty" },
  { label: "Rameswaram", queryText: "Rameswaram", icon: "🌊", targetArea: "Rameswaram" },
  { label: "Waterfalls", queryText: "Waterfalls", icon: "💧", targetArea: "Tamil Nadu" },
  { label: "Temples", queryText: "Temples", icon: "🛕", targetArea: "Madurai" },
];

const trendingSpots = [
  { label: "Kolli Hills 70 Hairpins", type: "offroad", icon: "📍", targetArea: "Kolli Hills" },
  { label: "Hogenakkal Falls", type: "waterfalls", icon: "🌊", targetArea: "Dharmapuri" },
  { label: "Valparai Sholayar Ride", type: "offroad", icon: "🏍️", targetArea: "Valparai" },
  { label: "Dhanushkodi Ghost Town", type: "beaches", icon: "🏖️", targetArea: "Rameswaram" },
];

const recentSearches = ["Chennai", "Ooty", "Kodaikanal"];

const aiSuggestions = [
  { label: "Weekend Ride", blurb: "Best 2-day loop passes", targetArea: "Valparai" },
  { label: "Waterfalls near me", blurb: "Monsoon cascades within 100 km", targetArea: "Dharmapuri" },
  { label: "Hidden Tea Estates", blurb: "Offbeat ridge trails in Nilgiris", targetArea: "Nilgiris" },
];

export function SearchPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [backendSuggestions, setBackendSuggestions] = useState<BackendSearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

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

  const isMac = typeof navigator !== "undefined" && /Mac/i.test(navigator.platform || "");

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
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white/95 backdrop-blur-[24px] border border-sky-200 shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-slate-900 z-10"
        >
          {/* Spotlight Search Header Input */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 bg-slate-50">
            <Search className="size-5 text-sky-600 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search waterfalls, routes, tea estates, districts..."
              className="w-full bg-transparent text-base font-medium text-slate-900 placeholder-[#A1A8B3] focus:outline-none"
              autoFocus
            />
            <kbd className="hidden md:inline-flex items-center rounded bg-white/10 px-2 py-0.5 text-[10px] font-mono text-slate-600 border border-slate-200">
              {isMac ? "⌘K" : "Ctrl K"}
            </kbd>
            <div className="flex items-center gap-2">
              <Mic className="size-5 text-[#A1A8B3] hover:text-sky-600 cursor-pointer transition-colors" />
              <button
                onClick={() => onOpenChange(false)}
                className="size-7 grid place-items-center rounded-full bg-white/10 text-slate-600 hover:text-slate-900 hover:bg-white/20 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Spotlight Content Body */}
          <div className="max-h-[65vh] overflow-y-auto p-5 space-y-6">
            {/* Quick Suggestions before typing */}
            {!query.trim() && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-sky-600 mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-sky-600" /> Quick Suggestions
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickSuggestions.map((qs) => (
                    <button
                      key={qs.label}
                      onClick={() => {
                        onOpenChange(false);
                        navigate({ to: "/routes", search: { area: qs.targetArea } });
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-xs font-bold text-emerald-300 hover:bg-sky-500/20 hover:border-sky-500/50 transition cursor-pointer"
                    >
                      <span>{qs.icon}</span>
                      <span>{qs.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Live Backend Search Results if Query Present */}
            {query.trim() && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-mono font-bold uppercase tracking-wider text-sky-600 flex items-center gap-2">
                    <Server className="size-3.5" /> LIVE BACKEND SEARCH RESULTS
                  </p>
                  <span className="text-[10px] font-mono text-slate-500">{backendSuggestions.length} Matches Found</span>
                </div>

                {isSearching ? (
                  <p className="text-xs text-sky-600 font-mono py-4 text-center animate-pulse">
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
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white/10 hover:border-sky-500/30 transition gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <MapPin className="size-4 text-sky-600 shrink-0" />
                              <span className="font-bold text-sm text-slate-900">{s.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 pl-6">
                              <span>{s.district}, {s.state || "Tamil Nadu"}</span>
                              <span>•</span>
                              <span className="text-sky-600 font-medium">{categories.slice(0, 3).join(" • ")}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pl-6 sm:pl-0">
                            <Link
                              to={`/place/$slug`}
                              params={{ slug }}
                              onClick={() => onOpenChange(false)}
                              className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-600 font-bold text-xs border border-sky-500/30 transition"
                            >
                              View Details
                            </Link>
                            <button
                              onClick={() => {
                                onOpenChange(false);
                                navigate({ to: "/routes", search: { area: s.district || s.name } });
                              }}
                              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs transition cursor-pointer"
                            >
                              View on Map
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-2 bg-slate-50 rounded-2xl border border-slate-200">
                    <p className="text-sm font-semibold text-slate-600">No canonical places found matching "{query}"</p>
                    <p className="text-xs text-slate-500">
                      Try searching for <span className="text-sky-600 font-mono">"vallichunai"</span>, <span className="text-sky-600 font-mono">"piranmalai"</span>, <span className="text-sky-600 font-mono">"mathoor"</span>, or <span className="text-sky-600 font-mono">"sivaganga"</span>.
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
                    <button
                      key={spot.label}
                      type="button"
                      onClick={() => {
                        onOpenChange(false);
                        navigate({ to: "/routes", search: { area: spot.targetArea } });
                      }}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white/10 hover:border-sky-500/40 transition cursor-pointer group text-left w-full"
                    >
                      <span className="text-lg">{spot.icon}</span>
                      <span className="font-semibold text-sm text-slate-200 group-hover:text-slate-900">{spot.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {!query.trim() && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#A1A8B3] mb-3 flex items-center gap-2">
                  <Clock className="size-4 text-sky-600" /> Recent
                </p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((rec) => (
                    <button
                      key={rec}
                      type="button"
                      onClick={() => {
                        onOpenChange(false);
                        navigate({ to: "/routes", search: { area: rec } });
                      }}
                      className="px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/10 hover:border-sky-500/40 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Clock className="size-3 text-slate-500" /> {rec}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Suggestions */}
            {!query.trim() && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#A1A8B3] mb-3 flex items-center gap-2">
                  <Sparkles className="size-4 text-sky-600" /> AI Suggestions
                </p>
                <div className="space-y-2">
                  {aiSuggestions.map((sug) => (
                    <button
                      key={sug.label}
                      type="button"
                      onClick={() => {
                        onOpenChange(false);
                        navigate({ to: "/routes", search: { area: sug.targetArea } });
                      }}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 hover:border-sky-500/40 transition cursor-pointer text-left w-full"
                    >
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="size-4 text-sky-600 shrink-0" />
                        <div>
                          <p className="font-bold text-sm text-slate-900">{sug.label}</p>
                          <p className="text-xs text-slate-500">{sug.blurb}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-sky-600">Explore →</span>
                    </button>
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
