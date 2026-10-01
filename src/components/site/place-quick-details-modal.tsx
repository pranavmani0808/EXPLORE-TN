import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  MapPin,
  Car,
  Bike,
  Bus,
  ParkingCircle,
  Clock,
  Calendar,
  Utensils,
  Bath,
  Ticket,
  Star,
  Map,
  Plus,
  Check,
  Navigation,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Info,
  Footprints,
  Coffee,
  Route as RouteIcon,
  Store,
  Layers,
} from "lucide-react";
import type { Place } from "@/data/places";
import { getPlaceTravelIntelligence } from "@/lib/data/travel-intelligence";
import { getPoiHillIntelligence } from "@/lib/data/hill-region-intelligence";
import { getCategoryLabel } from "@/lib/categoryLabels";
import { Button } from "@/components/ui/button";

export interface PlaceQuickDetailsModalProps {
  place: Place | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleTrip?: (place: Place) => void;
  isAddedToTrip?: boolean;
}

export function PlaceQuickDetailsModal({
  place,
  isOpen,
  onClose,
  onToggleTrip,
  isAddedToTrip = false,
}: PlaceQuickDetailsModalProps) {
  if (!place || !isOpen) return null;

  const intel = getPlaceTravelIntelligence(place.slug);
  const hillIntel = getPoiHillIntelligence(place.slug);

  const isWaterfall =
    place.category === "waterfalls" ||
    place.category.includes("waterfall") ||
    hillIntel?.category === "waterfall";
  const isBeach =
    place.category === "beaches" ||
    place.category.includes("beach") ||
    hillIntel?.category === "beach";
  const isLake =
    place.category === "hills" && place.name.toLowerCase().includes("lake") ||
    hillIntel?.category === "lake";
  const isWaterBody = isWaterfall || isBeach || isLake;

  const isViewPoint =
    place.category === "photography" ||
    place.category === "hills" ||
    place.category === "sunrise" ||
    place.category === "sunset" ||
    hillIntel?.category === "viewpoint";

  const isTemple =
    place.category === "spiritual" ||
    place.category === "temples" ||
    hillIntel?.category === "temple";

  // Format Location String cleanly (e.g. "Kodaikanal, Dindigul District")
  const locationString = place.name.toLowerCase().includes(place.district.toLowerCase())
    ? `${place.name}, Tamil Nadu`
    : `${place.name}, ${place.district} District`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl text-zinc-100 font-sans"
          >
            {/* Header Hero Image */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-900">
              <img
                src={place.image}
                alt={place.name}
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-zinc-950/80 text-zinc-300 hover:text-white hover:bg-zinc-900 border border-zinc-700 transition cursor-pointer"
              >
                <X className="size-5" />
              </button>

              {/* Top Badges */}
              <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                  {getCategoryLabel(place.category)}
                </span>
                {place.rating && (
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 backdrop-blur-md flex items-center gap-1">
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                    <span>{place.rating} ({place.reviews || 120})</span>
                  </span>
                )}
              </div>

              {/* Title & Location Header inside Image bottom */}
              <div className="absolute bottom-4 left-4 right-4 space-y-1">
                <p className="flex items-center gap-1.5 text-xs font-bold text-amber-400 font-mono">
                  <MapPin className="size-3.5 text-amber-400 shrink-0" />
                  <span>{locationString}</span>
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-tight leading-tight">
                  {place.name}
                </h2>
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="p-5 sm:p-7 space-y-6">
              {/* Tagline / Story */}
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800/80">
                {place.tagline || place.story}
              </p>

              {/* 🅿️ VEHICLE PARKING BREAKDOWN (CAR, BIKE, VAN, BUS) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <ParkingCircle className="size-4 text-emerald-400" /> Vehicle Parking Availability
                  </h3>
                  {intel.parking.parkingFeeDetails && (
                    <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                      💰 {intel.parking.parkingFeeDetails}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* Car Parking */}
                  <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400">
                      <Car className="size-3.5 text-blue-400 shrink-0" />
                      <span>Car</span>
                    </div>
                    <p className="text-xs font-bold text-white">
                      {intel.parking.carParking}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      {intel.parking.capacityCars || "50+ Capacity"}
                    </p>
                  </div>

                  {/* Bike Parking */}
                  <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400">
                      <Bike className="size-3.5 text-emerald-400 shrink-0" />
                      <span>Bike</span>
                    </div>
                    <p className="text-xs font-bold text-white">
                      {intel.parking.bikeParking}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      {intel.parking.capacityBikes || "150+ Capacity"}
                    </p>
                  </div>

                  {/* Van / Traveller Parking */}
                  <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400">
                      <Bus className="size-3.5 text-purple-400 shrink-0" />
                      <span>Van / Traveller</span>
                    </div>
                    <p className="text-xs font-bold text-white">
                      {intel.parking.vanParking || "Available"}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      {intel.parking.capacityVans || "Tourist Van Bay"}
                    </p>
                  </div>

                  {/* Tourist Bus Parking */}
                  <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400">
                      <Bus className="size-3.5 text-amber-400 shrink-0" />
                      <span>Tourist Bus</span>
                    </div>
                    <p className="text-xs font-bold text-white">
                      {intel.parking.busParking || (isWaterfall ? "Limited" : "Available")}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      {intel.parking.capacityBuses || "Gate Bus Stand"}
                    </p>
                  </div>
                </div>

                {intel.parking.parkingNotes && (
                  <p className="text-[11px] text-zinc-400 bg-zinc-900/40 p-2.5 rounded-xl border border-zinc-800/60 font-mono">
                    📍 <strong className="text-zinc-300">Distance & Advisory:</strong> {intel.parking.parkingNotes} ({intel.parking.parkingDistance})
                  </p>
                )}
              </div>

              {/* ⏰ TIMINGS & BEST TIME TO VISIT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400">
                    <Clock className="size-4" />
                    <span>Operating Hours / Timings</span>
                  </div>
                  <p className="text-xs font-bold text-white pt-1">
                    {place.timings || intel.beforeYouGo.timings}
                  </p>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Ticket/Entry: {place.entryFee || intel.beforeYouGo.entryFeeDetails}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
                    <Calendar className="size-4" />
                    <span>Best Time to Visit</span>
                  </div>
                  <p className="text-xs font-bold text-white pt-1">
                    {intel.beforeYouGo.bestTimeToArrive}
                  </p>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Best Season: {place.bestSeason || "Year-round"}
                  </p>
                </div>
              </div>

              {/* 🚽 BATHROOM & 🍿 FOOD SHOP AVAILABILITY HIGHLIGHTS (CATEGORY SPECIFIC) */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="size-4 text-emerald-400" /> On-Site Facilities & Amenities
                </h3>

                <div className="space-y-2.5">
                  {/* Restroom & Changing Rooms (Highlighted for Falls, Beach, Lake) */}
                  <div className={`p-4 rounded-2xl border ${
                    isWaterBody
                      ? "bg-blue-500/10 border-blue-500/30 text-blue-200"
                      : "bg-zinc-900 border-zinc-800 text-zinc-200"
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
                        <Bath className="size-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            Bathroom & Changing Facilities
                          </span>
                          {isWaterBody && (
                            <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/40">
                              ESSENTIAL FOR WATER SPOTS
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-300 leading-snug">
                          {intel.facilities.restrooms.details}
                        </p>
                        {intel.facilities.restrooms.changingRoomsAvailable && (
                          <p className="text-[11px] font-bold text-emerald-400 font-mono pt-0.5">
                            ✓ Dedicated dress changing stalls available
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Food Shops & Refreshment Stalls (Highlighted for View Points) */}
                  <div className={`p-4 rounded-2xl border ${
                    isViewPoint
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                      : "bg-zinc-900 border-zinc-800 text-zinc-200"
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                        <Store className="size-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            Food Shops & Refreshment Availability
                          </span>
                          {isViewPoint && (
                            <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                              VANTAGE POINT STALLS
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-300 leading-snug">
                          {intel.facilities.foodShops.details}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Temple / Spiritual Guidelines */}
                  {isTemple && intel.beforeYouGo.dressCodeEtiquette && (
                    <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-200 space-y-1">
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Footprints className="size-4 text-purple-400" /> Temple Dress Code & Etiquette
                      </p>
                      <p className="text-xs text-zinc-300">
                        {intel.beforeYouGo.dressCodeEtiquette}
                      </p>
                    </div>
                  )}

                  {/* Road Condition Badge */}
                  <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <RouteIcon className="size-4 text-emerald-400 shrink-0" />
                      <span className="text-zinc-300 font-medium">
                        Road Access: <strong className="text-white">{intel.roadCondition.roadType}</strong> ({intel.roadCondition.condition})
                      </span>
                    </div>
                    {intel.hillGhatSafety.isHillGhatRoad && (
                      <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                        🏔️ {intel.hillGhatSafety.hairpinBends || 12} Hairpin Bends
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* FOOTER ACTIONS ROW */}
              <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center gap-3">
                {onToggleTrip && (
                  <Button
                    onClick={() => onToggleTrip(place)}
                    className={`w-full sm:w-auto flex-1 h-11 rounded-2xl font-black text-xs transition cursor-pointer ${
                      isAddedToTrip
                        ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
                        : "bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-zinc-700"
                    }`}
                  >
                    {isAddedToTrip ? (
                      <>
                        <Check className="size-4 mr-1.5 stroke-[3]" /> Added to Map Trip
                      </>
                    ) : (
                      <>
                        <Plus className="size-4 mr-1.5 stroke-[3]" /> Add to Map Trip
                      </>
                    )}
                  </Button>
                )}

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.district}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto h-11 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-bold inline-flex items-center justify-center gap-2 transition"
                >
                  <Navigation className="size-3.5 text-emerald-400" />
                  <span>Navigate</span>
                </a>

                <Link
                  to="/place/$slug"
                  params={{ slug: place.slug }}
                  className="w-full sm:w-auto h-11 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold inline-flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20"
                >
                  <span>Open Full Guide</span>
                  <ExternalLink className="size-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
