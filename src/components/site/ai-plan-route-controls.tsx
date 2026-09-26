import React from "react";
import { Sparkles, PlusCircle, Umbrella, Landmark, Scissors, Clock, SlidersHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIPlanRouteControlsProps {
  onAction: (action: string, prompt?: string) => void;
  isLoading?: boolean;
}

const CONTROL_ACTIONS = [
  { action: "add_hidden", label: "More Hidden Places", icon: Sparkles, color: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  { action: "add_beaches", label: "More Beaches", icon: Umbrella, color: "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  { action: "add_temples", label: "More Temples", icon: Landmark, color: "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30" },
  { action: "shorten_driving", label: "Shorten Route", icon: Scissors, color: "bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30" },
  { action: "relaxed_pace", label: "Relaxed Pace", icon: Clock, color: "bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border-purple-500/30" }
];

export const AIPlanRouteControls: React.FC<AIPlanRouteControlsProps> = ({
  onAction,
  isLoading = false
}) => {
  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl text-white space-y-3 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Interactive AI Route Controls
          </h4>
        </div>
        <span className="text-[11px] text-slate-400">
          Recalculates route, distance, travel time & map polylines live
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {CONTROL_ACTIONS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => onAction(item.action)}
              className={`text-xs font-semibold px-3 py-1.5 h-8 rounded-xl border transition-all ${item.color}`}
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              ) : (
                <Icon className="w-3.5 h-3.5 mr-1.5" />
              )}
              <span>{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
