import React, { useState } from "react";
import { X, Sparkles, MapPin, Calendar, Car, Users, Wallet, Compass, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AIPlanCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegenerate: (params: {
    origin: string;
    destination: string;
    days: number;
    categories: string[];
    travel_mode: string;
    budget: string;
  }) => void;
  isLoading?: boolean;
}

const CATEGORIES_OPTIONS = [
  "Beaches", "Temples", "Hidden Places", "Waterfalls", "Heritage", "Hills", "Food", "Wildlife", "Forts"
];

export const AIPlanCustomizeModal: React.FC<AIPlanCustomizeModalProps> = ({
  isOpen,
  onClose,
  onRegenerate,
  isLoading = false
}) => {
  const [origin, setOrigin] = useState("Madurai");
  const [destination, setDestination] = useState("Kanyakumari");
  const [days, setDays] = useState(2);
  const [selectedCats, setSelectedCats] = useState<string[]>(["Beaches", "Temples", "Hidden Places", "Heritage"]);
  const [travelMode, setTravelMode] = useState("Car Road Trip");
  const [budget, setBudget] = useState("moderate");

  if (!isOpen) return null;

  const toggleCategory = (cat: string) => {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegenerate({
      origin: origin.trim() || "Madurai",
      destination: destination.trim() || "Kanyakumari",
      days,
      categories: selectedCats,
      travel_mode: travelMode,
      budget
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-xl bg-[#11161d] border border-white/10 rounded-3xl p-6 shadow-2xl text-white space-y-5 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Customize Your ExploreTN AI Trip</h3>
              <p className="text-xs text-slate-400">Personalize destination, days, travel style, and interests</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Controls */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Origin Location
              </label>
              <Input
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. Madurai"
                className="bg-slate-900 border-slate-700 text-white text-xs py-2 h-9"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" /> Target Destination
              </label>
              <Input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Kanyakumari"
                className="bg-slate-900 border-slate-700 text-white text-xs py-2 h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Duration
              </label>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-2 h-9 focus:outline-none focus:border-emerald-500"
              >
                {[1, 2, 3, 4, 5, 7, 10].map((d) => (
                  <option key={d} value={d}>
                    {d} {d === 1 ? "Day Trip" : "Days"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-teal-400" /> Travel Mode
              </label>
              <select
                value={travelMode}
                onChange={(e) => setTravelMode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-2 h-9 focus:outline-none focus:border-emerald-500"
              >
                <option value="Car Road Trip">Car Road Trip</option>
                <option value="Motorcycle Ghat Run">Motorcycle Ghat Run</option>
                <option value="Public Transit Bus">Public Transit Bus</option>
                <option value="Walking / Trekking">Walking / Trekking</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-purple-400" /> Preferred Category Interests
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {CATEGORIES_OPTIONS.map((cat) => {
                const isSel = selectedCats.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSel
                        ? "bg-emerald-500 text-slate-950 shadow-md border border-emerald-400"
                        : "bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl px-5 py-2.5 shadow-lg shadow-emerald-500/20"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              ) : (
                <Sparkles className="w-4 h-4 mr-1.5" />
              )}
              <span>Regenerate AI Itinerary</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
