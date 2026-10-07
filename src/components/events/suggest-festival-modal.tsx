import React, { useState } from "react";
import { saveFestivalSuggestion } from "@/lib/events-state-manager";
import { toast } from "sonner";
import { X, Sparkles, Send, CheckCircle2 } from "lucide-react";

interface SuggestFestivalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuggestFestivalModal: React.FC<SuggestFestivalModalProps> = ({
  isOpen,
  onClose
}) => {
  const [festivalName, setFestivalName] = useState("");
  const [district, setDistrict] = useState("Madurai");
  const [location, setLocation] = useState("");
  const [typicalMonth, setTypicalMonth] = useState("Chithirai (April-May)");
  const [description, setDescription] = useState("");
  const [culturalSignificance, setCulturalSignificance] = useState("");
  const [submitterName, setSubmitterName] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!festivalName.trim() || !description.trim()) {
      toast.error("Please provide the festival name and description.");
      return;
    }

    saveFestivalSuggestion({
      id: `fest-sugg-${Date.now()}`,
      festivalName: festivalName.trim(),
      district,
      location: location.trim() || district,
      typicalMonth,
      description: description.trim(),
      culturalSignificance: culturalSignificance.trim(),
      submitterName: submitterName.trim() || "Local Explorer",
      submitterEmail: submitterEmail.trim() || "explorer@exploretn.com",
      submittedAt: new Date().toISOString().split("T")[0],
      status: "PENDING_REVIEW"
    });

    setIsSubmitted(true);
    toast.success("Festival submitted for ExploreTN community verification!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#0f172a] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="size-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle2 className="size-14 text-emerald-400 mx-auto" />
            <h3 className="font-display font-bold text-xl text-white">Thank You, Explorer!</h3>
            <p className="text-xs text-zinc-300 max-w-sm mx-auto leading-relaxed">
              Your festival suggestion has been sent to the ExploreTN Heritage Curators team for verification. Once approved, it will appear on the public festival map and calendar.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 px-5 py-2 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs hover:bg-amber-300 transition"
            >
              Close Window
            </button>
          </div>
        ) : (
          <>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-1.5 border border-amber-500/30">
                <Sparkles className="size-3" /> Community Curation
              </div>
              <h3 className="font-display font-bold text-xl text-white">
                Suggest a Local Festival / Celebration
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Know a sacred village festival, chariot celebration, or regional cultural fair? Help fellow travelers discover it.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Festival / Event Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kulasekharapatnam Dussehra Carnival"
                  value={festivalName}
                  onChange={(e) => setFestivalName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">District</label>
                  <input
                    type="text"
                    placeholder="e.g. Thoothukudi"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Typical Month</label>
                  <input
                    type="text"
                    placeholder="e.g. October (Purattasi)"
                    value={typicalMonth}
                    onChange={(e) => setTypicalMonth(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Town / Specific Venue</label>
                <input
                  type="text"
                  placeholder="e.g. Mutharamman Temple, Kulasekharapatnam"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Description & Traditions *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the major rituals, dress codes, music, or best spots to witness it..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Your Name</label>
                  <input
                    type="text"
                    placeholder="Explorer Name"
                    value={submitterName}
                    onChange={(e) => setSubmitterName(e.target.value)}
                    className="w-full p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Your Email</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={submitterEmail}
                    onChange={(e) => setSubmitterEmail(e.target.value)}
                    className="w-full p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-400/20"
                >
                  <Send className="size-3.5" /> Submit for Review
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
