import React, { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/site/app-shell";
import { getEventBySlug, getEventsList } from "@/lib/data/events-data";
import { EventDiscoveryCard } from "@/components/events/event-discovery-card";
import { saveUserBooking, getSavedEventIds, saveEventToUser, removeSavedEvent } from "@/lib/events-state-manager";
import { useAuthGuard } from "@/lib/auth-guard-context";
import { toast } from "sonner";
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
  CheckCircle2,
  AlertCircle,
  Compass,
  Building,
  Phone,
  Mail,
  Car,
  Utensils,
  Hotel,
  Info,
  Calendar,
  X
} from "lucide-react";

export const Route = createFileRoute("/events/$slug")({
  loader: ({ params }) => {
    const event = getEventBySlug(params.slug);
    if (!event) throw notFound();
    return { event };
  },
  head: ({ loaderData }) => {
    const event = loaderData?.event;
    if (!event) return { meta: [{ title: "Event — ExploreTN" }] };
    return {
      meta: [
        { title: `${event.title} — ExploreTN Events` },
        { name: "description", content: event.shortDescription },
        { property: "og:title", content: event.title },
        { property: "og:description", content: event.shortDescription },
        { property: "og:image", content: event.coverImage },
      ],
    };
  },
  component: EventDetailPage,
});

function EventDetailPage() {
  const { event } = Route.useLoaderData();
  const { user } = useAuthGuard();

  const [isSaved, setIsSaved] = useState(() => getSavedEventIds().includes(event.id));
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [ticketCount, setTicketCount] = useState(1);
  const [userName, setUserName] = useState(user?.name || "");
  const [userEmail, setUserEmail] = useState(user?.email || "");
  const [userPhone, setUserPhone] = useState("");
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);

  const relatedEvents = getEventsList()
    .filter((e) => e.id !== event.id && (e.category === event.category || e.district === event.district))
    .slice(0, 3);

  const handleToggleSave = () => {
    if (isSaved) {
      removeSavedEvent(event.id);
      setIsSaved(false);
      toast.success(`Removed from saved experiences`);
    } else {
      saveEventToUser(event.id);
      setIsSaved(true);
      toast.success(`Saved "${event.title}" to your ExploreTN bucket list!`);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      toast.success("Event link copied to clipboard!");
    }
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) {
      toast.error("Please fill in your name and email.");
      return;
    }

    const pricePerUnit = event.priceNumber || 0;
    const totalAmount = pricePerUnit * ticketCount;

    saveUserBooking({
      id: `bk-${Date.now()}`,
      eventId: event.id,
      eventTitle: event.title,
      eventSlug: event.slug,
      userId: user?.id || "guest",
      userName: userName.trim(),
      userEmail: userEmail.trim(),
      userPhone: userPhone.trim(),
      bookingType: event.accessType === "GROUP_TRIP" ? "TRIP_SEAT" : "TICKET",
      numberOfSeats: ticketCount,
      totalAmount,
      bookedAt: new Date().toISOString(),
      status: "CONFIRMED"
    });

    setIsBookingSuccess(true);
    toast.success(
      event.accessType === "GROUP_TRIP"
        ? `Joined group trip to ${event.locationName}! 🎉`
        : `Booking confirmed for ${event.title}! 🎉`
    );
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans pb-24">
        {/* HERO BANNER SECTION */}
        <section className="relative w-full h-[360px] sm:h-[460px] overflow-hidden bg-zinc-950">
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-zinc-950/60 to-transparent" />

          {/* Breadcrumb & Actions */}
          <div className="absolute top-6 inset-x-4 sm:inset-x-8 max-w-7xl mx-auto flex items-center justify-between z-10">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-950/80 border border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white backdrop-blur-md transition"
            >
              ← Back to Events
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="size-9 rounded-full bg-zinc-950/80 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white backdrop-blur-md transition cursor-pointer"
                title="Share event"
              >
                <Share2 className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleToggleSave}
                className={`size-9 rounded-full border flex items-center justify-center backdrop-blur-md transition cursor-pointer ${
                  isSaved
                    ? "bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md shadow-emerald-500/30"
                    : "bg-zinc-950/80 text-zinc-300 border-zinc-700 hover:text-white"
                }`}
                title={isSaved ? "Saved" : "Save to bucket list"}
              >
                <Bookmark className={`size-4 ${isSaved ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>

          {/* Hero Bottom Meta */}
          <div className="absolute bottom-6 inset-x-4 sm:inset-x-8 max-w-7xl mx-auto z-10 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <span>{event.categoryIcon}</span>
                <span>{event.categoryLabel}</span>
              </span>

              {event.isExploreTnVerified && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-semibold backdrop-blur-md">
                  <ShieldCheck className="size-3.5 text-teal-400" />
                  ExploreTN Verified
                </span>
              )}

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-900/80 text-zinc-300 border border-zinc-700 text-xs font-mono backdrop-blur-md">
                {event.priceDisplay}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-display text-white tracking-tight drop-shadow-lg">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-zinc-300 font-medium">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4 text-emerald-400" />
                {event.locationName}, {event.district} District
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4 text-emerald-400" />
                {event.startDate} {event.endDate ? `– ${event.endDate}` : ""}
              </span>
              {event.timeText && (
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4 text-zinc-400" />
                  {event.timeText}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* MAIN DETAIL GRID */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT 2 COLUMNS: CONTENT & SECTIONS */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview Section */}
            <section className="space-y-4 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 p-6 sm:p-8">
              <h2 className="font-display font-bold text-xl text-white">About the Experience</h2>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                {event.fullDescription}
              </p>
            </section>

            {/* GROUP TRIP SPECIALIZED SECTION */}
            {event.groupTrip && (
              <section className="space-y-6 rounded-3xl bg-zinc-900/60 border border-emerald-500/30 p-6 sm:p-8">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 font-mono">
                      Curated Road Expedition
                    </span>
                    <h2 className="font-display font-bold text-xl text-white">
                      Group Trip Itinerary & Inclusions
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-zinc-400">Capacity</span>
                    <p className="text-sm font-bold text-emerald-400">
                      {event.groupTrip.joinedCount} / {event.groupTrip.totalSeats} Joined
                    </p>
                  </div>
                </div>

                {/* Day-by-day Itinerary */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Day-by-Day Schedule
                  </h3>
                  {event.groupTrip.itinerary.map((day) => (
                    <div
                      key={day.day}
                      className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-zinc-950 text-xs font-black">
                          DAY {day.day}
                        </span>
                        <h4 className="font-bold text-sm text-white">{day.title}</h4>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">{day.description}</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {day.highlights.map((h, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-lg bg-zinc-900 text-[11px] text-emerald-300 border border-zinc-800"
                          >
                            ✓ {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Inclusions & Exclusions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/20 space-y-2">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      What's Included
                    </h4>
                    <ul className="text-xs text-zinc-300 space-y-1.5">
                      {event.groupTrip.inclusions.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-950 border border-rose-500/20 space-y-2">
                    <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                      Not Included
                    </h4>
                    <ul className="text-xs text-zinc-400 space-y-1.5">
                      {event.groupTrip.exclusions.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-rose-400 font-bold shrink-0">✕</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Transit & Stay Specs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-300 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                  <div className="space-y-1">
                    <span className="text-zinc-500 font-semibold">🚍 Transportation:</span>
                    <p className="font-medium text-white">{event.groupTrip.transportation}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-zinc-500 font-semibold">🏨 Accommodation:</span>
                    <p className="font-medium text-white">{event.groupTrip.accommodation}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-zinc-500 font-semibold">📍 Assembly Point:</span>
                    <p className="font-medium text-white">{event.groupTrip.meetingPoint}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-zinc-500 font-semibold">⚠️ Cancellation:</span>
                    <p className="font-medium text-zinc-400">{event.groupTrip.cancellationPolicy}</p>
                  </div>
                </div>
              </section>
            )}

            {/* FESTIVAL DEEP DIVE SECTION */}
            {event.festival && (
              <section className="space-y-6 rounded-3xl bg-zinc-900/60 border border-amber-500/30 p-6 sm:p-8">
                <div className="border-b border-zinc-800 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 font-mono">
                    Living Tamil Heritage
                  </span>
                  <h2 className="font-display font-bold text-xl text-white">
                    Cultural Significance & Travel Guide
                  </h2>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    History & Lore
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {event.festival.history}
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Major Rituals & Processions
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {event.festival.majorActivities.map((act, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 flex items-center gap-2"
                      >
                        <Sparkles className="size-3.5 text-amber-400 shrink-0" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="size-4" /> Best Spots to Experience the Festival
                  </h4>
                  <ul className="text-xs text-zinc-300 space-y-1">
                    {event.festival.bestPlacesToExperience.map((spot, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span>📍</span>
                        <span>{spot}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Traveler Tips for Festival Season
                  </h4>
                  <ul className="text-xs text-zinc-300 space-y-1.5">
                    {event.festival.travelTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold shrink-0">✓</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* SEASONAL CELEBRATION SPECIALIZED SECTION */}
            {event.seasonal && (
              <section className="space-y-6 rounded-3xl bg-zinc-900/60 border border-teal-500/30 p-6 sm:p-8">
                <div className="border-b border-zinc-800 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400 font-mono">
                    Seasonal Destination Guide
                  </span>
                  <h2 className="font-display font-bold text-xl text-white">
                    Festive Street Routes, Lights & Local Cuisine
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                    <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                      Illuminated Churches & Streets
                    </h4>
                    <ul className="text-xs text-zinc-300 space-y-1.5">
                      {event.seasonal.festiveStreetsAndChurches.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span>✨</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Festive Local Flavors
                    </h4>
                    <ul className="text-xs text-zinc-300 space-y-1.5">
                      {event.seasonal.localFoodHighlights.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span>🍰</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            )}

            {/* Connected ExploreTN Destination Bar */}
            {event.districtSlug && (
              <section className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-zinc-950 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 font-mono">
                    ExploreTN Destination Integration
                  </span>
                  <h4 className="font-display font-bold text-base text-white">
                    Visiting {event.district} for this event?
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Discover handpicked waterfalls, viewpoints, hotels & street food across {event.district} District.
                  </p>
                </div>
                <Link
                  to={`/districts/$districtSlug` as any}
                  params={{ districtSlug: event.districtSlug }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition"
                >
                  <span>Explore {event.district} Guide</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </section>
            )}
          </div>

          {/* RIGHT COLUMN: STICKY BOOKING / REGISTRATION SIDEBAR */}
          <div className="space-y-6">
            <div className="sticky top-28 rounded-3xl bg-zinc-900/90 border border-zinc-800 p-6 sm:p-7 space-y-6 shadow-2xl backdrop-blur-xl">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Access & Participation
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-black text-white font-mono">
                    {event.priceDisplay}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {event.isFree ? "Public Admission" : "Per Explorer"}
                  </span>
                </div>
              </div>

              {/* Status & Available Seats */}
              <div className="space-y-2 pt-2 border-t border-zinc-800 text-xs">
                {event.totalCapacity && (
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>Available Capacity:</span>
                    <strong className="text-white font-mono">
                      {event.availableSeats ?? event.totalCapacity} / {event.totalCapacity}
                    </strong>
                  </div>
                )}
                <div className="flex items-center justify-between text-zinc-300">
                  <span>Location:</span>
                  <span className="text-emerald-400 font-semibold">{event.district} District</span>
                </div>
              </div>

              {/* Action Button */}
              <div>
                {event.isFree ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleToggleSave();
                    }}
                    className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                  >
                    <Bookmark className="size-4" />
                    <span>{isSaved ? "Saved to Bucket List ✓" : "Add to My Festival Bucket List"}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(true)}
                    className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                  >
                    <Sparkles className="size-4" />
                    <span>
                      {event.accessType === "GROUP_TRIP"
                        ? "Join Group Trip Now"
                        : event.accessType === "REGISTRATION_REQUIRED"
                        ? "Register for Event"
                        : "Book Tickets"}
                    </span>
                  </button>
                )}
              </div>

              {/* Organizer Profile Card */}
              <div className="pt-4 border-t border-zinc-800/80 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Organized By
                </span>
                <div className="flex items-start gap-3">
                  <img
                    src={event.organizer.logo}
                    alt={event.organizer.name}
                    className="size-11 rounded-2xl object-cover border border-zinc-700 shrink-0"
                  />
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-bold text-sm text-white flex items-center gap-1.5">
                      <span className="truncate">{event.organizer.name}</span>
                      {event.organizer.verified && (
                        <ShieldCheck className="size-3.5 text-emerald-400 shrink-0" />
                      )}
                    </p>
                    <p className="text-xs text-zinc-400 leading-snug line-clamp-2">
                      {event.organizer.description}
                    </p>
                  </div>
                </div>

                {event.organizer.totalEventsHosted && (
                  <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono pt-1">
                    <span>★ {event.organizer.rating || 4.9} Rating</span>
                    <span>•</span>
                    <span>{event.organizer.totalEventsHosted} Hosted</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RELATED EVENTS SECTION */}
        {relatedEvents.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-16 space-y-6">
            <h2 className="font-display font-bold text-2xl text-white">
              More Experiences in {event.district} & Tamil Nadu
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedEvents.map((rel) => (
                <EventDiscoveryCard key={rel.id} event={rel} />
              ))}
            </div>
          </section>
        )}

        {/* BOOKING / REGISTRATION POPUP MODAL */}
        {showBookingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div
              className="w-full max-w-md bg-[#0f172a] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  setShowBookingModal(false);
                  setIsBookingSuccess(false);
                }}
                className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="size-5" />
              </button>

              {isBookingSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <CheckCircle2 className="size-14 text-emerald-400 mx-auto" />
                  <h3 className="font-display font-bold text-xl text-white">Booking Confirmed!</h3>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    You have successfully secured your spot for <strong>{event.title}</strong>. A confirmation summary has been saved to your ExploreTN account profile.
                  </p>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-emerald-500/20 text-xs text-emerald-300 font-mono">
                    Booking ID: ETN-{Math.floor(100000 + Math.random() * 900000)}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBookingModal(false);
                      setIsBookingSuccess(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase">
                      Confirm Participation
                    </span>
                    <h3 className="font-display font-bold text-xl text-white mt-1">
                      {event.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      {event.startDate} • {event.locationName}
                    </p>
                  </div>

                  <form onSubmit={handleConfirmBooking} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-zinc-300 font-semibold mb-1">
                        Number of Travelers / Seats
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                          className="size-8 rounded-lg bg-zinc-800 border border-zinc-700 text-white font-bold"
                        >
                          -
                        </button>
                        <span className="font-mono text-base font-bold text-white w-8 text-center">
                          {ticketCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => setTicketCount(ticketCount + 1)}
                          className="size-8 rounded-lg bg-zinc-800 border border-zinc-700 text-white font-bold"
                        >
                          +
                        </button>
                        {event.priceNumber && (
                          <span className="ml-auto text-sm font-bold text-emerald-400 font-mono">
                            Total: ₹{(event.priceNumber * ticketCount).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-zinc-300 font-semibold mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Your Name"
                        className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-emerald-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-300 font-semibold mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-emerald-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-300 font-semibold mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-emerald-400 focus:outline-none"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition shadow-lg shadow-emerald-500/20"
                      >
                        Confirm & Reserve ({ticketCount} {ticketCount === 1 ? "Seat" : "Seats"})
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
