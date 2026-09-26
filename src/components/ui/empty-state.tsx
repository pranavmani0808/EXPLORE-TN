import { MapPin, SearchX, Inbox, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  type?: "search" | "saved_trips" | "generic";
  title?: string;
  description?: string;
  onReset?: () => void;
  resetLabel?: string;
}

export function EmptyState({
  type = "generic",
  title,
  description,
  onReset,
  resetLabel = "Clear Filters & Retry",
}: EmptyStateProps) {
  const getIcon = () => {
    switch (type) {
      case "search":
        return <SearchX className="size-10 text-slate-400" />;
      case "saved_trips":
        return <MapPin className="size-10 text-emerald-400" />;
      default:
        return <Inbox className="size-10 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 my-6">
      <div className="p-4 rounded-full bg-slate-800/80 border border-slate-700/50">
        {getIcon()}
      </div>
      <div className="space-y-1.5 max-w-sm">
        <h3 className="font-extrabold text-base text-white">
          {title || (type === "search" ? "No Places or Trails Found" : "No Items Available")}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          {description ||
            (type === "search"
              ? "We couldn't find any results matching your search filters. Try adjusting keywords or clearing category tags."
              : "You haven't saved any custom routes or places yet.")}
        </p>
      </div>
      {onReset && (
        <Button
          onClick={onReset}
          size="sm"
          variant="outline"
          className="border-slate-700 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-2"
        >
          <RefreshCw className="size-3.5" /> {resetLabel}
        </Button>
      )}
    </div>
  );
}
