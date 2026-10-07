import React from "react";
import { Link } from "@tanstack/react-router";
import { ExploreTNEvent } from "@/lib/types/events";
import {
  CalendarDays,
  MapPin,
  Clock,
  Users,
  ShieldCheck,
  Bookmark,
  Share2,
  Sparkles,
  ArrowRight,
  Ticket,
  Compass
} from "lucide-react";
import { getSavedEventIds, saveEventToUser, removeSavedEvent } from "@/lib/events-state-manager";
import { toast } from "sonner";

interface EventDiscoveryCardProps {
  event: ExploreTNEvent;
  onSelect?: (event: ExploreTNEvent) => void;
  className?: string;
}

export const EventDiscoveryCard: React.FC<EventDiscoveryCardProps> = ({
  event,
  className = ""
}) => {
  const [isSaved, setIsSaved] = React.useState(false);

  React.useEffect(() => {
    const saved = getSavedEventIds();
    setIsSaved(saved.includes(event.id));

    const handleUpdate = () => {
      setIsSaved(getSavedEventIds().includes(event.id));
    };
    window.addEventListener("etn_saved_events_updated", handleUpdate);
    return () => window.removeEventListener("etn_saved_events_updated", handleUpdate);
  }, [event.id]);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaved) {
      removeSavedEvent(event.id);
      toast.success(`Removed "${event.title}" from saved events`);
    } else {
      saveEventToUser(event.id);
      toast.success(`Saved "${event.title}" to your ExploreTN bucket list! 🎫`);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/events/${event.slug}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      toast.success("Event link copied to clipboard!");
    }
  };

  // Determine contextual CTA label and style
  const getCtaDetails = () => {
    switch (event.accessType) {
      case "GROUP_TRIP":
        return {
          label: "Join Trip",
          color: "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black",
          badge: "🧳 Group Expedition"
        };
      case "TICKET_REQUIRED":
        return {
          label: "Get Tickets",
          color: "bg-teal-500 hover:bg-teal-400 text-zinc-950 font-black",
          badge: "🎟️ Tickets Available"
        };
      case "REGISTRATION_REQUIRED":
        return {
          label: "Register",
          color: "bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black",
          badge: "✍️ Registration Open"
        };
      case "FREE":
        if (event.category === "festivals") {
          return {
            label: "Explore Festival",
            color: "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 font-bold",
            badge: "🪔 Public Festival"
          };
        }
        if (event.category === "seasonal") {
          return {
            label: "Explore Season",
            color: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 font-bold",
            badge: "🎄 Seasonal Travel"
          };
        }
        return {
          label: "View Event",
          color: "bg-zinc-800 hover:bg-zinc-700 text-white font-bold border border-zinc-700",
          badge: "🟢 Free Entry"
        };
      default:
        return {
          label: "View Experience",
          color: "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold",
          badge: "Experience"
        };
    }
  };

  const cta = getCtaDetails();

  return (
    <Link
      to={`/events/${event.slug}` as any}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-900 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-950/30 hover:-translate-y-1 ${className}`}
    >
      <div>
        {/* Cover Image Container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
          <img
            src={event.coverImage}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

          {/* Top Bar Badges */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-950/80 border border-zinc-700/80 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 backdrop-blur-md shadow-md">
              <span>{event.categoryIcon}</span>
              <span>{event.categoryLabel}</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleShare}
                className="size-8 rounded-full bg-zinc-950/80 border border-zinc-700/80 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 backdrop-blur-md transition cursor-pointer"
                title="Share event"
              >
                <Share2 className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={handleToggleSave}
                className={`size-8 rounded-full border flex items-center justify-center backdrop-blur-md transition cursor-pointer ${
                  isSaved
                    ? "bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md shadow-emerald-500/30"
                    : "bg-zinc-950/80 text-zinc-300 border-zinc-700/80 hover:text-white hover:bg-zinc-800"
                }`}
                title={isSaved ? "Saved" : "Save to bucket list"}
              >
                <Bookmark className={`size-3.5 ${isSaved ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>

          {/* Bottom Overlay Badges */}
          <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-2 text-xs">
            <span className="font-mono text-xs font-bold text-white bg-zinc-950/90 border border-emerald-500/30 px-2.5 py-1 rounded-lg backdrop-blur-md">
              {event.priceDisplay}
            </span>

            {event.groupTrip && (
              <span className="text-[11px] font-semibold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded-md backdrop-blur-md">
                {event.groupTrip.joinedCount}/{event.groupTrip.totalSeats} Joined
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-3">
          {/* Title and verification */}
          <div>
            <div className="flex items-center gap-1.5 mb-1 text-[11px] text-zinc-400">
              <MapPin className="size-3.5 text-emerald-400 shrink-0" />
              <span className="font-semibold text-zinc-200">{event.locationName}</span>
              <span>•</span>
              <span className="text-zinc-400">{event.district} District</span>
            </div>

            <h3 className="font-display font-bold text-base sm:text-lg text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
              {event.title}
            </h3>
          </div>

          {/* Short description */}
          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
            {event.shortDescription}
          </p>

          {/* Route or timing info */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-zinc-300 font-mono">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-emerald-400" />
              <span>{event.startDate}</span>
            </div>
            {event.timeText && (
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-zinc-400" />
                <span className="text-zinc-400 truncate max-w-[160px]">{event.timeText}</span>
              </div>
            )}
          </div>

          {/* Group trip route summary pill if present */}
          {event.groupTrip && (
            <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-emerald-400/90 font-medium flex items-center gap-2">
              <Compass className="size-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{event.groupTrip.routeSummary}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Organizer & Action CTA */}
      <div className="p-4 sm:p-5 pt-0 border-t border-zinc-800/60 mt-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={event.organizer.logo}
            alt={event.organizer.name}
            className="size-6 rounded-full object-cover border border-zinc-700 shrink-0"
          />
          <div className="truncate">
            <p className="text-[11px] font-semibold text-zinc-300 truncate flex items-center gap-1">
              <span>{event.organizer.name}</span>
              {event.organizer.verified && (
                <ShieldCheck className="size-3 text-emerald-400 shrink-0" />
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          className={`px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer ${cta.color}`}
        >
          <span>{cta.label}</span>
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </Link>
  );
};
