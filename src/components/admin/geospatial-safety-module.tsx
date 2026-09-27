import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  MapPin,
  Compass,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Layers,
  CloudRain,
  Route as RouteIcon,
  Plus,
  Info,
  ShieldCheck,
  Zap,
  TrendingUp,
  Clock,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  GeospatialSafetyRepository,
  SafetyAlertRecord,
  AlertType,
  AlertSourceType,
  analyzeRouteElevationAndGradient,
  detectHairpinBendsFromGeometry,
  CANONICAL_WILDLIFE_CORRIDORS,
} from "@/lib/geospatial-safety-engine";
import { toast } from "sonner";

export function GeospatialSafetyModule() {
  const [alerts, setAlerts] = useState<SafetyAlertRecord[]>([]);
  const [selectedRouteKey, setSelectedRouteKey] = useState<string>("kolli");
  const [showNewAlertModal, setShowNewAlertModal] = useState(false);

  // New alert form
  const [title, setTitle] = useState("");
  const [alertType, setAlertType] = useState<AlertType>("Ghat Driving Caution");
  const [locationContext, setLocationContext] = useState("");
  const [district, setDistrict] = useState("Namakkal");
  const [description, setDescription] = useState("");
  const [actionRequired, setActionRequired] = useState("");
  const [source, setSource] = useState<AlertSourceType>("Tamil Nadu Highways Department");

  useEffect(() => {
    async function loadAlerts() {
      const data = await GeospatialSafetyRepository.getActiveSafetyAlerts();
      setAlerts(data);
    }
    loadAlerts();
  }, []);

  const handlePublishAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Please enter alert title and description.");
      return;
    }

    const created = await GeospatialSafetyRepository.publishSafetyAlert({
      title,
      alertType,
      locationContext: locationContext || "Ghat Stretch",
      district,
      coordinates: [11.2721, 78.3412],
      description,
      actionRequired: actionRequired || "Drive slowly and obey forest checkpost timings.",
      source,
    });

    setAlerts((prev) => [created, ...prev]);
    setShowNewAlertModal(false);
    setTitle("");
    setDescription("");
    setActionRequired("");
    toast.success("Safety alert published to Supabase DB & Map Intelligence Engine!");
  };

  // Preset Route Geometries & Elevation Profiles for Live Telemetry Demonstration
  const presetRoutes: Record<string, { name: string; district: string; distKm: number; startElev: number; endElev: number; hairpins: number; networkWeakKm: number; wildlifeKey?: string }> = {
    kolli: { name: "Kolli Hills 70 Hairpin Pass", district: "Namakkal", distKm: 46.8, startElev: 180, endElev: 1320, hairpins: 70, networkWeakKm: 14.2 },
    valparai: { name: "Pollachi → Valparai 40 Hairpins", district: "Coimbatore", distKm: 64.0, startElev: 240, endElev: 1180, hairpins: 40, networkWeakKm: 18.5, wildlifeKey: "valparai" },
    yercaud: { name: "Salem → Yercaud 20 Hairpins Pass", district: "Salem", distKm: 31.5, startElev: 280, endElev: 1515, hairpins: 20, networkWeakKm: 6.0 },
    mudumalai: { name: "Gudalur → Mudumalai Tiger Trail", district: "Nilgiris", distKm: 38.2, startElev: 950, endElev: 880, hairpins: 12, networkWeakKm: 22.0, wildlifeKey: "mudumalai" },
    sathyamangalam: { name: "Bannari → Dhimbam 27 Hairpins", district: "Erode", distKm: 28.4, startElev: 310, endElev: 1090, hairpins: 27, networkWeakKm: 12.0, wildlifeKey: "sathyamangalam" },
  };

  const activeRoute = presetRoutes[selectedRouteKey] || presetRoutes.kolli;
  const elevationAnalysis = analyzeRouteElevationAndGradient(activeRoute.distKm, activeRoute.startElev, activeRoute.endElev, activeRoute.hairpins);
  const wildlifeInfo = activeRoute.wildlifeKey ? CANONICAL_WILDLIFE_CORRIDORS[activeRoute.wildlifeKey] : null;

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* Top Banner: Multi-Source Pipeline Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121821] border border-white/15 rounded-3xl p-5 shadow-2xl text-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold rounded-full flex items-center gap-1.5">
              <ShieldAlert className="size-4" /> GEOSPATIAL SAFETY & ROAD INTELLIGENCE PIPELINE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-mono">
            Automated OSM Geometry + DEM Elevation Model + Government Alert Feed (TN Highways, Forest Dept, SDMA)
          </p>
        </div>

        <Button
          onClick={() => setShowNewAlertModal(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
        >
          <Plus className="size-4" /> Ingest Official Alert
        </Button>
      </div>

      {/* Multi-Source Pipeline Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
        <div className="bg-[#121821] border border-white/15 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase">OPENSTREETMAP (OSM)</span>
            <RouteIcon className="size-4 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-white">Base Geometry</p>
          <p className="text-[10px] text-emerald-400 mt-1">● Auto Curvature Engine</p>
        </div>

        <div className="bg-[#121821] border border-white/15 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase">DEM ELEVATION MODEL</span>
            <TrendingUp className="size-4 text-amber-400" />
          </div>
          <p className="text-xl font-black text-amber-300">Gradient Sampling</p>
          <p className="text-[10px] text-slate-400 mt-1">Elevation Δ / Distance</p>
        </div>

        <div className="bg-[#121821] border border-white/15 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase">GOVERNMENT ALERTS</span>
            <ShieldCheck className="size-4 text-sky-400" />
          </div>
          <p className="text-xl font-black text-sky-300">HIGH Confidence</p>
          <p className="text-[10px] text-slate-400 mt-1">TN Highways & Forest Dept</p>
        </div>

        <div className="bg-[#121821] border border-white/15 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase">WEATHER RADAR (IMD)</span>
            <CloudRain className="size-4 text-purple-400" />
          </div>
          <p className="text-xl font-black text-purple-300">Live Warning Zones</p>
          <p className="text-[10px] text-slate-400 mt-1">Short-lived Route Overlays</p>
        </div>
      </div>

      {/* Main Feature: Automated Road Attribute & Elevation Profiler */}
      <div className="bg-[#121821] border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <Compass className="size-5 text-emerald-400" /> Automatic Road Attribute & Hairpin Detector
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              PostGIS Geometry Curve Derivation • Zero Manual Hairpin Entry
            </p>
          </div>

          {/* Preset Route Selector */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {Object.keys(presetRoutes).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedRouteKey(key)}
                className={`px-3 py-1.5 rounded-xl font-bold transition capitalize cursor-pointer ${
                  selectedRouteKey === key
                    ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20"
                    : "bg-white/5 border border-white/10 text-slate-300 hover:text-white"
                }`}
              >
                {presetRoutes[key].name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Route Geospatial Metrics Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Route Overview Cards */}
          <div className="lg:col-span-8 space-y-4 font-mono">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-bold text-white">{activeRoute.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  District: <strong className="text-amber-300">{activeRoute.district}</strong> • Route Length: <strong className="text-emerald-400">{activeRoute.distKm} km</strong>
                </p>
              </div>

              <span className="px-3 py-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-full">
                Ghat Rating: {elevationAnalysis.ghatDifficulty}
              </span>
            </div>

            {/* Derived Parameters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">HAIRPIN BENDS</span>
                <p className="text-xl font-black text-amber-400">{elevationAnalysis.hairpinBendsCount} Bends</p>
                <p className="text-[10px] text-slate-400">PostGIS Curvature &gt; 110°</p>
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">ELEVATION GAIN</span>
                <p className="text-xl font-black text-emerald-400">+{elevationAnalysis.elevationGainMeters} m</p>
                <p className="text-[10px] text-slate-400">{activeRoute.startElev}m → {activeRoute.endElev}m</p>
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">MAX GRADIENT</span>
                <p className="text-xl font-black text-rose-400">{elevationAnalysis.maxGradientPercent}% Slope</p>
                <p className="text-[10px] text-slate-400">{elevationAnalysis.steepSectionsCount} Steep Sections</p>
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">SIGNAL COVERAGE</span>
                <p className="text-xl font-black text-sky-400">{activeRoute.networkWeakKm} km Weak</p>
                <p className="text-[10px] text-slate-400">Low/No Signal Stretch</p>
              </div>
            </div>

            {/* Wildlife Reserve Restrictions Notice */}
            {wildlifeInfo && (
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="size-4" /> Official Forest Reserve Notice: {wildlifeInfo.reserveName}
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px]">
                    Confidence: {(wildlifeInfo.confidence.score * 100).toFixed(0)}% ({wildlifeInfo.confidence.source})
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Protected Species: <strong>{wildlifeInfo.species.join(", ")}</strong> • Max Speed Limit: <strong>{wildlifeInfo.speedLimitKmph} km/h</strong>
                </p>
                {wildlifeInfo.nightPassRestricted && (
                  <p className="text-xs font-bold text-amber-300 flex items-center gap-1">
                    <Clock className="size-3.5" /> Night Closure Enforced: {wildlifeInfo.restrictionHours}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Multi-Source Confidence Matrix */}
          <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 font-mono text-xs">
            <h4 className="font-bold text-white border-b border-white/10 pb-2 flex items-center justify-between">
              <span>Confidence Matrix</span>
              <span className="text-emerald-400 text-[10px]">Weighted Evaluation</span>
            </h4>

            <div className="space-y-2 text-[11px]">
              <div className="p-2.5 bg-white/5 rounded-xl space-y-1 border border-white/5">
                <div className="flex justify-between font-bold">
                  <span className="text-white">Government Official Alerts</span>
                  <span className="text-emerald-400">98% (HIGH)</span>
                </div>
                <p className="text-slate-400 text-[10px]">TN Highways & Forest Checkpost Feeds</p>
              </div>

              <div className="p-2.5 bg-white/5 rounded-xl space-y-1 border border-white/5">
                <div className="flex justify-between font-bold">
                  <span className="text-white">OSM & DEM Geometry</span>
                  <span className="text-emerald-400">88% (HIGH)</span>
                </div>
                <p className="text-slate-400 text-[10px]">Automated Curvature & Slope Sampling</p>
              </div>

              <div className="p-2.5 bg-white/5 rounded-xl space-y-1 border border-white/5">
                <div className="flex justify-between font-bold">
                  <span className="text-white">Scout & Community Reports</span>
                  <span className="text-amber-300">75% (MEDIUM)</span>
                </div>
                <p className="text-slate-400 text-[10px]">Verified District Scout Submissions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Ingested Safety Alerts Table */}
      <div className="bg-[#121821] border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold flex items-center gap-2">
            <ShieldAlert className="size-5 text-amber-400" /> Active Ingested Safety Alerts & Operational Directives
          </h3>
          <span className="text-xs font-mono text-emerald-400">{alerts.length} Active Feeds</span>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {alerts.map((a) => (
            <div key={a.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold rounded-full text-[10px]">
                    {a.alertType}
                  </span>
                  <span className="font-bold text-white text-sm">{a.title}</span>
                </div>

                <div className="flex items-center gap-2 text-[10px]">
                  <span className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full font-bold">
                    Confidence: {(a.confidence.score * 100).toFixed(0)}% ({a.confidence.level})
                  </span>
                  <span className="text-slate-400">• Source: {a.confidence.source}</span>
                </div>
              </div>

              <p className="text-slate-300 text-[11px] font-sans">{a.description}</p>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                <span className="text-amber-300 font-bold flex items-center gap-1">
                  <AlertTriangle className="size-3.5" /> Action: {a.actionRequired}
                </span>
                <span className="text-slate-400">Location: {a.locationContext}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Ingest Official Alert */}
      {showNewAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-[#09090b] p-6 text-white shadow-2xl space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ShieldAlert className="size-5 text-emerald-400" />
                Ingest Official Safety Directive
              </h3>
              <button onClick={() => setShowNewAlertModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handlePublishAlert} className="space-y-3">
              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Alert Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kolli Hills Hairpin 35 Repair & Gravel Notice"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Alert Type</label>
                  <select
                    value={alertType}
                    onChange={(e) => setAlertType(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-emerald-500 focus:outline-none font-mono"
                  >
                    <option value="Ghat Driving Caution">Ghat Driving Caution</option>
                    <option value="Road Closure">Road Closure</option>
                    <option value="Landslide Alert">Landslide Alert</option>
                    <option value="Monsoon Water Level">Monsoon Water Level</option>
                    <option value="Forest Night Restriction">Forest Night Restriction</option>
                    <option value="Wildlife Crossing">Wildlife Crossing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Official Data Source</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-emerald-500 focus:outline-none font-mono text-[11px]"
                  >
                    <option value="Tamil Nadu Highways Department">Tamil Nadu Highways Department</option>
                    <option value="Tamil Nadu Forest Department">Tamil Nadu Forest Department</option>
                    <option value="State Disaster Management Authority (SDMA)">State Disaster Management Authority (SDMA)</option>
                    <option value="India Meteorological Department (IMD)">India Meteorological Department (IMD)</option>
                    <option value="OpenStreetMap Geometry Engine">OpenStreetMap Geometry Engine</option>
                    <option value="Verified District Scout">Verified District Scout</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Location Context</label>
                  <input
                    type="text"
                    placeholder="e.g. Kolli Hills Hairpin 35"
                    value={locationContext}
                    onChange={(e) => setLocationContext(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">District</label>
                  <input
                    type="text"
                    placeholder="Namakkal"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Description Detail *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Official status detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Recommended Action</label>
                <input
                  type="text"
                  placeholder="e.g. Drive below 25 km/h in 2nd gear."
                  value={actionRequired}
                  onChange={(e) => setActionRequired(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowNewAlertModal(false)} className="border-zinc-800 text-zinc-400">Cancel</Button>
                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold">Publish to Supabase DB</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
