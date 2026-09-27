import { useState } from "react";
import { motion } from "motion/react";
import {
  CloudSun,
  ShieldCheck,
  Clock,
  Footprints,
  Eye,
  Wind,
  Droplets,
  Users,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Route as RouteIcon,
  Compass,
  Car,
  Bike,
  Coins,
  Shirt,
  Camera,
  Ticket,
  Lightbulb,
  Signal,
  Bus,
  Wrench,
  Fuel,
  Info,
  ChevronRight,
  SlidersHorizontal,
  Navigation,
  ExternalLink,
  Waves,
  Mountain,
  Utensils,
  Coffee,
  Hospital,
  ShoppingBag,
  Bath,
  FileCheck,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HillDestinationIntelligence,
  PoiHillIntelligence,
  RouteHillIntelligence,
  DataVerificationBadge,
  getHillDestinationIntelligence,
  getPoiHillIntelligence,
} from "@/lib/data/hill-region-intelligence";

// ---------------------------------------------------------
// 1. DATA TRUST & VERIFICATION BADGE COMPONENT
// ---------------------------------------------------------
export function DataTrustBadge({ verification }: { verification: DataVerificationBadge }) {
  const statusColor =
    verification.status === "official"
      ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
      : verification.status === "verified"
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      : verification.status === "community"
      ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
      : verification.status === "estimated"
      ? "bg-zinc-500/15 text-zinc-300 border-zinc-500/30"
      : "bg-rose-500/15 text-rose-400 border-rose-500/30";

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-mono font-bold ${statusColor}`}>
      <span>{verification.label}</span>
      <span className="opacity-60">•</span>
      <span className="opacity-80">{verification.lastUpdated}</span>
    </div>
  );
}

// ---------------------------------------------------------
// 2. DESTINATION-LEVEL HILL INTELLIGENCE CARD (REGION OVERVIEW)
// ---------------------------------------------------------
export function DestinationHillIntelligenceCard({ intel }: { intel: HillDestinationIntelligence }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-xl space-y-6 font-sans">
      {/* Title & Trust Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              REGION HILL INTELLIGENCE
            </span>
            <DataTrustBadge verification={intel.verification} />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground mt-1.5">
            {intel.destinationName}
          </h2>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 font-mono">
            <MapPin className="size-3 text-emerald-500" /> {intel.district} · Regional Overview
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 px-3 py-1 font-mono text-xs font-bold">
            {intel.accessibility}
          </Badge>
        </div>
      </div>

      {/* Weather & Road Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Live Weather */}
        <div className="p-4 rounded-2xl bg-accent/30 border border-border/40 space-y-2">
          <p className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
            <CloudSun className="size-3.5 text-amber-400" /> Weather & Temperature
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-display text-foreground">{intel.weather.temperatureC}°C</span>
            <span className="text-xs font-semibold text-muted-foreground">{intel.weather.condition}</span>
          </div>
          <p className="text-[11px] text-muted-foreground font-mono">
            Humidity: {intel.weather.humidityPercent}% · Wind: {intel.weather.windSpeedKmh} km/h
          </p>
        </div>

        {/* Visibility & Rain */}
        <div className="p-4 rounded-2xl bg-accent/30 border border-border/40 space-y-2">
          <p className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
            <Eye className="size-3.5 text-cyan-400" /> Visibility & Rain
          </p>
          <p className="text-sm font-bold text-foreground">{intel.weather.visibility}</p>
          <p className="text-[11px] text-muted-foreground font-mono">Rain: {intel.weather.rainCondition}</p>
        </div>

        {/* General & Hill Road Status */}
        <div className="p-4 rounded-2xl bg-accent/30 border border-border/40 space-y-2">
          <p className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
            <RouteIcon className="size-3.5 text-emerald-500" /> Hill-Road Condition
          </p>
          <p className="text-sm font-bold text-foreground">{intel.roadStatus.hillRoadCondition}</p>
          <p className="text-[11px] text-muted-foreground font-mono">Ghat Quality: {intel.roadStatus.generalRoadCondition}</p>
        </div>

        {/* Network & Crowd */}
        <div className="p-4 rounded-2xl bg-accent/30 border border-border/40 space-y-2">
          <p className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
            <Signal className="size-3.5 text-indigo-400" /> Network & Crowd Level
          </p>
          <p className="text-sm font-bold text-foreground">Crowd: {intel.crowdLevel}</p>
          <p className="text-[11px] text-muted-foreground font-mono">
            Airtel {intel.networkAvailability.airtel} · Jio {intel.networkAvailability.jio}
          </p>
        </div>
      </div>

      {/* Safety Advisory Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs">
        <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-amber-500 uppercase tracking-wider font-mono">Regional Hill Safety Advisory</p>
          <p className="text-foreground mt-0.5 leading-relaxed">{intel.safetyAdvisory}</p>
          <p className="text-muted-foreground font-mono text-[11px] mt-1">{intel.roadStatus.nightAdvisory}</p>
        </div>
      </div>

      {/* Mapped Regional Places Summary */}
      <div className="p-4 rounded-2xl bg-accent/20 border border-border/40 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-mono font-bold text-muted-foreground uppercase tracking-wider">
          Mapped Places in {intel.destinationName}:
        </span>
        <div className="flex flex-wrap gap-3 font-mono font-bold text-foreground">
          <span className="bg-background px-2.5 py-1 rounded-xl border border-border/40">🏛️ {intel.mappedCounts.touristPlaces} Attractions</span>
          <span className="bg-background px-2.5 py-1 rounded-xl border border-border/40">🌄 {intel.mappedCounts.viewpoints} Viewpoints</span>
          <span className="bg-background px-2.5 py-1 rounded-xl border border-border/40">💦 {intel.mappedCounts.waterfalls} Waterfalls</span>
          <span className="bg-background px-2.5 py-1 rounded-xl border border-border/40">🥾 {intel.mappedCounts.trekkingRoutes} Trek Trails</span>
          <span className="bg-background px-2.5 py-1 rounded-xl border border-border/40">⛽ {intel.mappedCounts.essentialServices} Essential Facilities</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// 3. CONTEXTUAL POI INTELLIGENCE CARD (CATEGORY SPECIFIC)
// ---------------------------------------------------------
export function ContextualPoiIntelligenceCard({ poi }: { poi: PoiHillIntelligence }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-xl space-y-6 font-sans">
      {/* Title & Category Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              {poi.category.toUpperCase()} SPECIFIC INTELLIGENCE
            </span>
            <DataTrustBadge verification={poi.verification} />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground mt-1.5">{poi.name}</h2>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            Access: <strong className="text-emerald-400">{poi.accessStatus}</strong> · Road: <strong>{poi.roadCondition}</strong>
          </p>
        </div>

        <div className="text-right font-mono text-xs text-muted-foreground">
          <span className="text-amber-400 font-bold">{poi.currentWeather}</span>
          <p className="mt-0.5">{poi.mobileNetwork}</p>
        </div>
      </div>

      {/* 💦 WATERFALL SPECIFIC INTELLIGENCE */}
      {poi.category === "waterfall" && (
        <div className="space-y-4">
          {poi.waterfallSpecs && (
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Waves className="size-6 text-cyan-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-foreground">Water Flow: <span className="text-cyan-400">{poi.waterfallSpecs.waterFlowCondition}</span></p>
                  <p className="text-xs text-muted-foreground mt-0.5">{poi.waterfallSpecs.depthAdvisory}</p>
                </div>
              </div>

              <span className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono border shrink-0 ${poi.waterfallSpecs.bathingAllowed ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-rose-500/15 text-rose-400 border-rose-500/30"}`}>
                {poi.waterfallSpecs.bathingAllowed ? "✓ Bathing Permitted" : "⚠️ Bathing Restricted"}
              </span>
            </div>
          )}

          {/* Parking & Facilities Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-2xl bg-accent/30 border border-border/40 space-y-1">
              <p className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase text-muted-foreground">
                <Car className="size-3.5 text-blue-400" /> Car Parking
              </p>
              <p className="text-sm font-bold text-foreground">{poi.parking.carParking}</p>
              <p className="text-[11px] text-muted-foreground font-mono">{poi.parking.distanceFromAttraction}</p>
            </div>

            <div className="p-4 rounded-2xl bg-accent/30 border border-border/40 space-y-1">
              <p className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase text-muted-foreground">
                <Bike className="size-3.5 text-emerald-400" /> Bike Parking
              </p>
              <p className="text-sm font-bold text-foreground">{poi.parking.bikeParking}</p>
              <p className="text-[11px] text-muted-foreground font-mono">{poi.parking.parkingFee || "Free"}</p>
            </div>

            <div className="p-4 rounded-2xl bg-accent/30 border border-border/40 space-y-1">
              <p className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase text-muted-foreground">
                <Bath className="size-3.5 text-purple-400" /> Restroom & Changing
              </p>
              <p className="text-xs font-bold text-foreground">
                Restroom: {poi.facilities.restroom.available ? "Available" : "Not Available"}
              </p>
              <p className="text-[11px] text-muted-foreground font-mono">
                Changing Room: {poi.facilities.changingRoom?.available ? "Available" : "None"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-accent/30 border border-border/40 space-y-1">
              <p className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase text-muted-foreground">
                <Utensils className="size-3.5 text-amber-400" /> Food & Water
              </p>
              <p className="text-xs font-bold text-foreground">
                Food Stalls: {poi.facilities.foodStalls.available ? "Available" : "None"}
              </p>
              <p className="text-[11px] text-muted-foreground font-mono">
                Drinking Water: {poi.facilities.drinkingWater.available ? "Available" : "Carry Water"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 🌄 VIEWPOINT SPECIFIC INTELLIGENCE */}
      {poi.category === "viewpoint" && (
        <div className="space-y-4">
          {poi.viewpointSpecs && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Eye className="size-6 text-amber-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-foreground">Visibility: <span className="text-amber-400">{poi.viewpointSpecs.visibilityGrade}</span></p>
                  <p className="text-xs text-muted-foreground mt-0.5">Best window: <strong>{poi.viewpointSpecs.bestViewingPeriod}</strong></p>
                </div>
              </div>

              <Badge variant="outline" className="bg-amber-500/15 text-amber-300 border-amber-500/30 shrink-0 font-mono text-xs">
                👥 Crowd Level: {poi.crowdLevel}
              </Badge>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="p-4 rounded-2xl bg-accent/30 border border-border/40 space-y-1">
              <p className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase text-muted-foreground">
                <Car className="size-3.5 text-blue-400" /> Parking & Walk
              </p>
              <p className="text-xs font-bold text-foreground">Car & Bike Parking Available</p>
              <p className="text-[11px] text-muted-foreground font-mono">{poi.facilities.walkingDistance}</p>
            </div>

            <div className="p-4 rounded-2xl bg-accent/30 border border-border/40 space-y-1">
              <p className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase text-muted-foreground">
                <Coffee className="size-3.5 text-amber-400" /> Nearby Stalls
              </p>
              <p className="text-xs text-foreground font-medium">
                {poi.facilities.teaCoffeeShops?.details || "Tea & snack stalls available"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-accent/30 border border-border/40 space-y-1">
              <p className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase text-muted-foreground">
                <Camera className="size-3.5 text-indigo-400" /> Photography Spot
              </p>
              <p className="text-xs text-foreground font-medium">
                {poi.facilities.photographyArea?.details || "Panoramic cliff valley views"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 🥾 TREKKING / TRAIL SPECIFIC INTELLIGENCE */}
      {poi.category === "trek" && poi.trekSpecs && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Footprints className="size-5 text-indigo-400" />
                <h4 className="text-sm font-bold text-foreground">Trail Technical Profile</h4>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-indigo-600 text-white font-mono text-xs font-bold">
                  ⚠️ Difficulty: {poi.trekSpecs.difficulty}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-background/60 border border-indigo-500/20">
                <span className="text-muted-foreground">Distance:</span>
                <p className="text-sm font-bold text-foreground mt-0.5">{poi.trekSpecs.distanceKm} km</p>
              </div>
              <div className="p-3 rounded-xl bg-background/60 border border-indigo-500/20">
                <span className="text-muted-foreground">Duration:</span>
                <p className="text-sm font-bold text-foreground mt-0.5">{poi.trekSpecs.durationHrs}</p>
              </div>
              <div className="p-3 rounded-xl bg-background/60 border border-indigo-500/20">
                <span className="text-muted-foreground">Elevation:</span>
                <p className="text-sm font-bold text-foreground mt-0.5">{poi.trekSpecs.elevationMeters} m MSL</p>
              </div>
              <div className="p-3 rounded-xl bg-background/60 border border-indigo-500/20">
                <span className="text-muted-foreground">Permit:</span>
                <p className="text-sm font-bold text-amber-400 mt-0.5">{poi.trekSpecs.permitRequired ? "Required" : "Free Entry"}</p>
              </div>
            </div>
          </div>

          {/* Pre-Trek Essentials Warning */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2 text-xs">
            <p className="font-bold text-amber-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="size-4" /> Before You Start Trekking
            </p>
            <ul className="space-y-1 text-muted-foreground">
              <li>💧 <strong>Water:</strong> {poi.trekSpecs.waterSourceOnTrail ? "Natural stream on trail" : "NO water on trail; carry 2L per person."}</li>
              <li>🚻 <strong>Restroom:</strong> Last restroom at {poi.trekSpecs.lastRestroomBeforeTrek}.</li>
              <li>📶 <strong>Network:</strong> {poi.mobileNetwork}</li>
              {poi.trekSpecs.permitDetails && <li>🎟️ <strong>Permit:</strong> {poi.trekSpecs.permitDetails}</li>}
            </ul>
          </div>
        </div>
      )}

      {/* Safety Advisories List */}
      {poi.safetyAdvisories.length > 0 && (
        <div className="p-4 rounded-2xl bg-accent/20 border border-border/40 space-y-2 text-xs">
          <p className="font-bold font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-amber-400" /> Specific POI Safety & Etiquette Rules
          </p>
          <ul className="space-y-1 text-muted-foreground">
            {poi.safetyAdvisories.map((adv, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>{adv}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Last Available Essential Service Indicator */}
      {poi.lastAvailableEssentialService && (
        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-300 flex items-center gap-2">
          <Fuel className="size-4 text-blue-400 shrink-0" />
          <span>{poi.lastAvailableEssentialService}</span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------
// 4. ROUTE INTELLIGENCE & REMOTE STRETCH CARD
// ---------------------------------------------------------
export function RouteHillIntelligenceCard({ route }: { route: RouteHillIntelligence }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-xl space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
            LONG HILL JOURNEY ROUTE INTELLIGENCE
          </span>
          <h2 className="text-2xl font-bold font-display text-foreground mt-1.5">
            {route.origin} → {route.destination}
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            Total Distance: <strong>{route.totalDistanceKm} km</strong> · Est. Driving Time: <strong>{route.estimatedDuration}</strong>
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-300">
          🏔️ Hill Entry Point: <strong className="text-foreground">{route.hillEntryPoint.name}</strong> ({route.hillEntryPoint.distanceFromOriginKm} km)
        </div>
      </div>

      {/* ⚠️ REMOTE STRETCH & LAST AVAILABLE SERVICES WARNING */}
      {route.remoteStretches.map((stretch, idx) => (
        <div key={idx} className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-500 shrink-0" />
            <h3 className="text-sm font-extrabold font-mono uppercase text-amber-500 tracking-wider">
              ⚠️ REMOTE HILL STRETCH AHEAD ({stretch.distanceKm} KM)
            </h3>
          </div>

          <p className="text-xs text-foreground font-semibold">
            {stretch.stretchName} (KM {stretch.startKm} – KM {stretch.endKm})
          </p>

          <div className="space-y-1 text-xs text-muted-foreground">
            {stretch.warnings.map((w, wIdx) => (
              <p key={wIdx} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>{w}</span>
              </p>
            ))}
          </div>

          {/* Last Available Services Box */}
          <div className="p-4 rounded-2xl bg-background/70 border border-amber-500/20 space-y-2">
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
              LAST AVAILABLE SERVICES BEFORE REMOTE HILL CLIMB
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono text-center">
              <div className="p-2 rounded-xl bg-accent/40 border border-border/40">
                <p className="text-muted-foreground text-[10px]">⛽ Fuel</p>
                <p className="font-bold text-foreground">{stretch.lastAvailableServices.fuelKm} km</p>
              </div>
              <div className="p-2 rounded-xl bg-accent/40 border border-border/40">
                <p className="text-muted-foreground text-[10px]">🍴 Food</p>
                <p className="font-bold text-foreground">{stretch.lastAvailableServices.foodKm} km</p>
              </div>
              <div className="p-2 rounded-xl bg-accent/40 border border-border/40">
                <p className="text-muted-foreground text-[10px]">🚻 Restroom</p>
                <p className="font-bold text-foreground">{stretch.lastAvailableServices.restroomKm} km</p>
              </div>
              <div className="p-2 rounded-xl bg-accent/40 border border-border/40">
                <p className="text-muted-foreground text-[10px]">🏥 Medical</p>
                <p className="font-bold text-foreground">{stretch.lastAvailableServices.medicalKm} km</p>
              </div>
              <div className="p-2 rounded-xl bg-accent/40 border border-border/40 col-span-2 sm:col-span-1">
                <p className="text-muted-foreground text-[10px]">🛒 Essentials</p>
                <p className="font-bold text-foreground">{stretch.lastAvailableServices.essentialsKm} km</p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Prioritized Stopping Points along Route */}
      <div className="space-y-3">
        <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
          Recommended High-Quality Highway Stops & Rest Areas
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {route.stoppingPoints.map((stop) => (
            <div key={stop.id} className="p-3.5 rounded-2xl bg-accent/30 border border-border/40 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">{stop.name}</span>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  {stop.distanceFromStartKm} km
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">{stop.notes}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// 5. TRIP READINESS CHECKLIST CARD FOR AI PLANNER
// ---------------------------------------------------------
export function TripReadinessCard({ checklist }: { checklist: string[] }) {
  return (
    <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-6 shadow-xl space-y-4 font-sans">
      <div className="flex items-center gap-2">
        <Award className="size-5 text-emerald-400" />
        <h3 className="text-lg font-bold font-display text-foreground">
          TRIP READINESS & HILL ADVISORY CHECKLIST
        </h3>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 text-xs">
        {checklist.map((item, idx) => (
          <div key={idx} className="p-3 rounded-2xl bg-background/70 border border-emerald-500/20 flex items-start gap-2.5">
            <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="text-foreground font-medium">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// 6. MAP FACILITY LAYER TOGGLE CONTROL
// ---------------------------------------------------------
export interface MapFacilityFilterState {
  parking: boolean;
  food: boolean;
  fuel: boolean;
  restroom: boolean;
  medical: boolean;
  hotels: boolean;
  shops: boolean;
  water: boolean;
  network: boolean;
}

export function MapFacilityLayerToggle({
  state,
  onChange,
}: {
  state: MapFacilityFilterState;
  onChange: (newState: MapFacilityFilterState) => void;
}) {
  const toggles: { key: keyof MapFacilityFilterState; label: string; icon: string }[] = [
    { key: "parking", label: "Parking", icon: "🅿️" },
    { key: "food", label: "Food", icon: "🍴" },
    { key: "fuel", label: "Fuel", icon: "⛽" },
    { key: "restroom", label: "Restrooms", icon: "🚻" },
    { key: "medical", label: "Medical", icon: "🏥" },
    { key: "hotels", label: "Hotels", icon: "🏨" },
    { key: "shops", label: "Shops", icon: "🛒" },
    { key: "water", label: "Water", icon: "💧" },
    { key: "network", label: "Network", icon: "📶" },
  ];

  const toggleItem = (key: keyof MapFacilityFilterState) => {
    onChange({ ...state, [key]: !state[key] });
  };

  return (
    <div className="p-3 rounded-2xl bg-background/90 backdrop-blur-md border border-border shadow-xl space-y-2 font-sans">
      <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <SlidersHorizontal className="size-3 text-emerald-500" /> Interactive Map Facilities Overlays
      </p>
      <div className="flex flex-wrap gap-1.5">
        {toggles.map((t) => {
          const isActive = state[t.key];
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => toggleItem(t.key)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                isActive
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-accent/40 text-muted-foreground hover:text-foreground border-border/40"
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
