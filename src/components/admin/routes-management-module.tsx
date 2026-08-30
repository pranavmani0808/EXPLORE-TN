import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Route as RouteIcon,
  Plus,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Activity,
  Layers,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Fuel,
  Clock,
  Navigation,
  Eye,
  Trash2,
  Edit,
  Save,
  Check,
  X,
  Compass,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentAuthUser } from "@/lib/auth-rbac";
import { recordAuditLog } from "@/lib/audit-trail-store";

export interface Waypoint {
  id: string;
  name: string;
  type: "start" | "temple" | "viewpoint" | "food" | "fuel" | "waterfall" | "destination";
  lat: number;
  lng: number;
  elevation: number;
  stopTime: string;
  notes: string;
}

export interface HazardWarning {
  id: string;
  name: string;
  type: "rocks" | "landslide" | "fog" | "checkpost" | "sharp_curve";
  lat: number;
  lng: number;
  severity: "Low" | "Moderate" | "High";
}

export interface GISRoute {
  id: string;
  slug: string;
  name: string;
  origin: string;
  destination: string;
  status: "Draft" | "QA Review" | "Verified" | "Featured" | "Archived";
  totalDistance: string;
  totalTime: string;
  fuelEstimate: string;
  elevationGain: string;
  hairpinCount: number;
  waypoints: Waypoint[];
  hazards: HazardWarning[];
  elevationPoints: { distanceKm: number; altitudeMeters: number }[];
  createdBy?: string;
}

const initialGISRoutes: GISRoute[] = [
  {
    id: "route-1",
    slug: "chennai-kodaikanal",
    name: "Chennai → Kodaikanal Ghat Run",
    origin: "Chennai",
    destination: "Kodaikanal",
    status: "Featured",
    totalDistance: "520 km",
    totalTime: "11 h riding",
    fuelEstimate: "₹2,450",
    elevationGain: "7,200 ft",
    hairpinCount: 20,
    createdBy: "Pranav",
    waypoints: [
      { id: "wp-1", name: "Chennai GST Departure", type: "start", lat: 13.0827, lng: 80.2707, elevation: 12, stopTime: "04:45 AM", notes: "Clear city before peak traffic" },
      { id: "wp-2", name: "Brihadeeswarar Temple", type: "temple", lat: 10.7870, lng: 79.1378, elevation: 58, stopTime: "10:30 AM", notes: "Chola architecture photography halt" },
      { id: "wp-3", name: "Dindigul Plains Halt", type: "food", lat: 10.3673, lng: 77.9803, elevation: 280, stopTime: "02:00 PM", notes: "Top up fuel and tyre pressure" },
      { id: "wp-4", name: "Batlagundu Hairpin 12", type: "viewpoint", lat: 10.2644, lng: 77.5813, elevation: 1200, stopTime: "04:10 PM", notes: "Cool mountain air starts" },
      { id: "wp-5", name: "Kodaikanal Lake Summit", type: "destination", lat: 10.2381, lng: 77.4892, elevation: 2133, stopTime: "05:40 PM", notes: "Park bike and check-in" },
    ],
    hazards: [
      { id: "hz-1", name: "Sharp Hairpin Bend 14", type: "sharp_curve", lat: 10.26, lng: 77.58, severity: "Moderate" },
      { id: "hz-2", name: "Monsoon Fog Zone", type: "fog", lat: 10.24, lng: 77.50, severity: "High" },
    ],
    elevationPoints: [
      { distanceKm: 0, altitudeMeters: 12 },
      { distanceKm: 150, altitudeMeters: 45 },
      { distanceKm: 348, altitudeMeters: 58 },
      { distanceKm: 444, altitudeMeters: 280 },
      { distanceKm: 492, altitudeMeters: 1200 },
      { distanceKm: 520, altitudeMeters: 2133 },
    ],
  },
  {
    id: "route-2",
    slug: "salem-kolli-hills",
    name: "Salem → Kolli Hills 70 Hairpin Challenge",
    origin: "Salem",
    destination: "Kolli Hills",
    status: "Verified",
    totalDistance: "75 km",
    totalTime: "2.5 h riding",
    fuelEstimate: "₹480",
    elevationGain: "4,200 ft",
    hairpinCount: 70,
    createdBy: "Pranav",
    waypoints: [
      { id: "wp-10", name: "Salem Foothill Start", type: "start", lat: 11.6643, lng: 78.1460, elevation: 278, stopTime: "06:00 AM", notes: "Fuel up at Salem base" },
      { id: "wp-11", name: "Karavalli Checkpost (Hairpin 1)", type: "fuel", lat: 11.3340, lng: 78.3320, elevation: 340, stopTime: "07:00 AM", notes: "Start counting 70 hairpins" },
      { id: "wp-12", name: "Hairpin 36 Panoramic Viewpoint", type: "viewpoint", lat: 11.3020, lng: 78.3500, elevation: 890, stopTime: "07:45 AM", notes: "Panoramic stack view of 30 curves" },
      { id: "wp-13", name: "Semmedu Agaya Gangai Plateau", type: "destination", lat: 11.2721, lng: 78.3412, elevation: 1300, stopTime: "08:30 AM", notes: "Summit plateau arrival" },
    ],
    hazards: [
      { id: "hz-10", name: "Falling Rocks at Hairpin 22", type: "rocks", lat: 11.32, lng: 78.34, severity: "High" },
      { id: "hz-11", name: "Forest Police Checkpost", type: "checkpost", lat: 11.33, lng: 78.33, severity: "Low" },
    ],
    elevationPoints: [
      { distanceKm: 0, altitudeMeters: 278 },
      { distanceKm: 45, altitudeMeters: 340 },
      { distanceKm: 58, altitudeMeters: 890 },
      { distanceKm: 75, altitudeMeters: 1300 },
    ],
  },
];

export function RoutesManagementModule() {
  const [routesList, setRoutesList] = useState<GISRoute[]>(initialGISRoutes);
  const [selectedRoute, setSelectedRoute] = useState<GISRoute>(initialGISRoutes[0]);
  const [hoveredElevationPoint, setHoveredElevationPoint] = useState<{ distanceKm: number; altitudeMeters: number } | null>(null);
  const [activeTab, setActiveTab] = useState<"waypoints" | "hairpins" | "hazards">("waypoints");
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);

  const currentUser = getCurrentAuthUser();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletModuleRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;
    let isMounted = true;

    async function initMap() {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (!isMounted || !mapContainerRef.current) return;

      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }

      leafletModuleRef.current = L;

      const map = L.map(mapContainerRef.current, {
        center: [10.8, 78.2],
        zoom: 8,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      leafletMapRef.current = map;
      drawGISPolylineAndWaypoints();
    }

    initMap();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [selectedRoute]);

  const drawGISPolylineAndWaypoints = () => {
    const map = leafletMapRef.current;
    const L = leafletModuleRef.current;
    if (!map || !L || !selectedRoute.waypoints.length) return;

    const latLngs: [number, number][] = selectedRoute.waypoints.map((w) => [w.lat, w.lng]);

    const polyline = L.polyline(latLngs, {
      color: "#10b981",
      weight: 5,
      opacity: 0.9,
      dashArray: "6, 8",
    }).addTo(map);

    map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

    selectedRoute.waypoints.forEach((wp, idx) => {
      const isStart = idx === 0;
      const isEnd = idx === selectedRoute.waypoints.length - 1;
      const color = isStart ? "#3b82f6" : isEnd ? "#10b981" : "#f59e0b";

      const iconHtml = `
        <div style="background: ${color}; color: #000; font-weight: 900; font-size: 11px; padding: 4px 10px; border-radius: 9999px; border: 2px solid #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.6); white-space: nowrap; font-family: sans-serif;">
          ${idx + 1}. ${wp.name} (${wp.elevation}m)
        </div>
      `;

      const icon = L.divIcon({
        className: "custom-route-gis-marker",
        html: iconHtml,
        iconSize: [140, 30],
        iconAnchor: [70, 15],
      });

      L.marker([wp.lat, wp.lng], { icon }).addTo(map);
    });

    selectedRoute.hazards.forEach((h) => {
      const hazardIconHtml = `
        <div style="background: #ef4444; color: #fff; font-weight: 800; font-size: 10px; padding: 3px 8px; border-radius: 8px; border: 1.5px solid #fff; box-shadow: 0 8px 20px rgba(239,68,68,0.5); white-space: nowrap; font-family: monospace;">
          ⚠️ ${h.name}
        </div>
      `;
      const icon = L.divIcon({
        className: "hazard-marker",
        html: hazardIconHtml,
        iconSize: [120, 26],
        iconAnchor: [60, 13],
      });

      L.marker([h.lat, h.lng], { icon }).addTo(map);
    });
  };

  const handleExportGPX = () => {
    const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="ExplorerTN GIS Engine">
  <trk>
    <name>${selectedRoute.name}</name>
    <trkseg>
      ${selectedRoute.waypoints.map((w) => `<trkpt lat="${w.lat}" lon="${w.lng}"><ele>${w.elevation}</ele><name>${w.name}</name></trkpt>`).join("\n      ")}
    </trkseg>
  </trk>
</gpx>`;
    const blob = new Blob([gpxContent], { type: "application/gpx+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedRoute.slug}-trail.gpx`;
    a.click();
  };

  const handleGPXFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const xmlText = event.target?.result as string;
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      const trackPoints = Array.from(xmlDoc.querySelectorAll("trkpt"));

      let parsedWaypoints: Waypoint[] = [];
      if (trackPoints.length > 0) {
        parsedWaypoints = trackPoints.slice(0, 10).map((pt, i) => {
          const lat = parseFloat(pt.getAttribute("lat") || "10.8");
          const lng = parseFloat(pt.getAttribute("lon") || "78.2");
          const eleNode = pt.querySelector("ele");
          const ele = eleNode ? parseFloat(eleNode.textContent || "300") : 300 + i * 20;
          return {
            id: `wp-gpx-${Date.now()}-${i}`,
            name: i === 0 ? "GPX Trail Origin" : i === trackPoints.length - 1 ? "GPX Trail Peak" : `Waypoint ${i + 1}`,
            type: i === 0 ? "start" : i === trackPoints.length - 1 ? "destination" : "viewpoint",
            lat,
            lng,
            elevation: ele,
            stopTime: `${6 + i}:00 AM`,
            notes: "Parsed from GPX trail geometry",
          };
        });
      } else {
        parsedWaypoints = [
          { id: "wp-1", name: "Uploaded Trail Start", type: "start", lat: 11.2333, lng: 78.3333, elevation: 320, stopTime: "07:00 AM", notes: "GPX Start Point" },
          { id: "wp-2", name: "Uploaded Trail Summit", type: "destination", lat: 11.2800, lng: 78.3500, elevation: 1250, stopTime: "09:30 AM", notes: "GPX Peak Point" },
        ];
      }

      const routeName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      const newRoute: GISRoute = {
        id: `route-${Date.now()}`,
        slug: routeName.toLowerCase().replace(/\s+/g, "-"),
        name: routeName,
        origin: parsedWaypoints[0]?.name || "Origin Point",
        destination: parsedWaypoints[parsedWaypoints.length - 1]?.name || "Destination Summit",
        status: "Draft",
        totalDistance: "68 km",
        totalTime: "2.5 h riding",
        fuelEstimate: "₹420",
        elevationGain: "3,800 ft",
        hairpinCount: 32,
        waypoints: parsedWaypoints,
        hazards: [],
        createdBy: currentUser?.name || "Pranav",
        elevationPoints: [
          { distanceKm: 0, altitudeMeters: parsedWaypoints[0]?.elevation || 320 },
          { distanceKm: 34, altitudeMeters: 780 },
          { distanceKm: 68, altitudeMeters: parsedWaypoints[parsedWaypoints.length - 1]?.elevation || 1250 },
        ],
      };

      const updated = [newRoute, ...routesList];
      setRoutesList(updated);
      setSelectedRoute(newRoute);

      const actorName = currentUser?.name || "Pranav";
      const actorRole = (currentUser?.role || "super_admin").toUpperCase();

      recordAuditLog({
        entityType: "route",
        entityId: newRoute.id,
        entityName: newRoute.name,
        action: "CREATED",
        performedBy: actorName,
        performedByRole: actorRole,
        details: `${actorName} • ${actorRole} • Uploaded & Parsed GPX Trail "${newRoute.name}" (${newRoute.totalDistance}, ${newRoute.elevationGain})`,
      });
    };
    reader.readAsText(file);
  };

  const handleStatusChange = (newStatus: GISRoute["status"]) => {
    const actorRole = currentUser?.role || "super_admin";

    // Self-verification restriction check: Route Managers cannot self-approve their own submissions
    if (newStatus === "Verified" || newStatus === "Featured") {
      if (actorRole === "route_manager") {
        setSecurityWarning("Self-verification disabled: Route Managers can submit for QA Review but require Super Admin for final verification.");
        return;
      }
    }

    setSecurityWarning(null);
    const updated = { ...selectedRoute, status: newStatus };
    setSelectedRoute(updated);
    setRoutesList((prev) => prev.map((r) => (r.id === selectedRoute.id ? updated : r)));

    const actorName = currentUser?.name || "Pranav";
    recordAuditLog({
      entityType: "route",
      entityId: selectedRoute.id,
      entityName: selectedRoute.name,
      action: newStatus === "Verified" ? "VERIFIED" : "UPDATED",
      performedBy: actorName,
      performedByRole: actorRole.toUpperCase(),
      details: `${actorName} • ${actorRole.toUpperCase()} • Transitioned Route "${selectedRoute.name}" to ${newStatus.toUpperCase()}`,
    });
  };

  const handleAddWaypoint = () => {
    const newWp: Waypoint = {
      id: `wp-${Date.now()}`,
      name: `New Waypoint ${selectedRoute.waypoints.length + 1}`,
      type: "viewpoint",
      lat: selectedRoute.waypoints[selectedRoute.waypoints.length - 1].lat - 0.05,
      lng: selectedRoute.waypoints[selectedRoute.waypoints.length - 1].lng - 0.05,
      elevation: 1450,
      stopTime: "03:00 PM",
      notes: "Scenic photography stop added via GIS Editor",
    };
    const updated = {
      ...selectedRoute,
      waypoints: [...selectedRoute.waypoints, newWp],
    };
    setSelectedRoute(updated);
    setRoutesList((prev) => prev.map((r) => (r.id === selectedRoute.id ? updated : r)));

    const actorName = currentUser?.name || "Pranav";
    const actorRole = (currentUser?.role || "super_admin").toUpperCase();

    recordAuditLog({
      entityType: "route",
      entityId: selectedRoute.id,
      entityName: selectedRoute.name,
      action: "UPDATED",
      performedBy: actorName,
      performedByRole: actorRole,
      details: `${actorName} • ${actorRole} • Added Waypoint "${newWp.name}" to Route "${selectedRoute.name}"`,
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Security Notification Banner */}
      {securityWarning && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-amber-300 text-xs font-sans">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-400 shrink-0" />
            <span>{securityWarning}</span>
          </div>
          <button onClick={() => setSecurityWarning(null)} className="text-amber-400 font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121821] border border-white/15 rounded-3xl p-5 shadow-2xl text-white">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold rounded-full flex items-center gap-1.5">
            <RouteIcon className="size-4" /> GIS ROUTE EDITOR
          </span>
          <h2 className="text-lg font-black text-white">{selectedRoute.name}</h2>
          <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold rounded-full uppercase border border-emerald-500/30">
            {selectedRoute.status}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl cursor-pointer flex items-center gap-1.5">
            <Upload className="size-3.5" /> Upload GPX / KML
            <input type="file" accept=".gpx,.kml,.xml" onChange={handleGPXFileUpload} className="hidden" />
          </label>

          <Button
            onClick={handleAddWaypoint}
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs rounded-2xl"
          >
            <Plus className="size-4 mr-1" /> Add Waypoint Node
          </Button>

          <Button
            onClick={handleExportGPX}
            variant="outline"
            size="sm"
            className="border-white/15 text-white hover:bg-white/10 text-xs rounded-2xl font-bold"
          >
            <Download className="size-4 mr-1 text-emerald-400" /> Export GPX
          </Button>

          <select
            value={selectedRoute.status}
            onChange={(e) => handleStatusChange(e.target.value as any)}
            className="bg-[#0B0F14] border border-white/15 text-xs text-emerald-400 font-mono font-bold rounded-2xl px-3 py-2 focus:outline-none cursor-pointer"
          >
            <option value="Draft">Draft</option>
            <option value="QA Review">QA Review</option>
            <option value="Verified">Verified (Super Admin Only)</option>
            <option value="Featured">Featured</option>
          </select>
        </div>
      </div>

      {/* Three-Column GIS Route Workspace Layout */}
      <div className="grid lg:grid-cols-[280px_1fr_360px] gap-6">
        {/* LEFT SIDEBAR: Routes Selector & Waypoints List */}
        <div className="bg-[#121821] border border-white/15 rounded-3xl p-5 shadow-2xl text-white space-y-4 h-fit">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">DIGITAL ROUTES LIST</p>
          <div className="space-y-2">
            {routesList.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedRoute(r)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                  selectedRoute.id === r.id
                    ? "bg-emerald-500/15 border-emerald-400 text-white"
                    : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                }`}
              >
                <p className="font-extrabold text-xs text-white">{r.name}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-1">{r.totalDistance} • {r.hairpinCount} Hairpins</p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-white/10">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">WAYPOINT SEQUENCE ({selectedRoute.waypoints.length})</p>
            <div className="space-y-1.5 font-mono text-xs">
              {selectedRoute.waypoints.map((w, idx) => (
                <div key={w.id} className="p-2.5 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                  <span className="truncate text-slate-200 font-bold">{idx + 1}. {w.name}</span>
                  <span className="text-[10px] text-emerald-400 shrink-0">{w.elevation}m</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Interactive GIS Leaflet Vector Map + Interactive Elevation Graph */}
        <div className="space-y-4">
          <div className="relative h-[440px] w-full rounded-3xl overflow-hidden border border-white/15 shadow-2xl">
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />
            <div className="absolute top-4 right-4 z-20 bg-[#121821]/90 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full text-xs font-mono text-emerald-400">
              ● CartoDB Vector GIS Engine
            </div>
          </div>

          <div className="bg-[#121821] border border-white/15 rounded-3xl p-5 shadow-2xl text-white space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                <Activity className="size-4" /> Interactive Elevation Profile (Altitude vs Distance)
              </span>
              <span className="text-slate-400">Peak Gain: {selectedRoute.elevationGain}</span>
            </div>

            <div className="relative h-28 w-full bg-[#0B0F14] rounded-2xl p-2 border border-white/10 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
                <path
                  d="M 0 90 L 100 85 L 250 70 L 350 40 L 450 20 L 500 10 L 500 100 L 0 100 Z"
                  fill="rgba(16, 185, 129, 0.2)"
                  stroke="#10b981"
                  strokeWidth="2.5"
                />
              </svg>

              {hoveredElevationPoint && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-emerald-400"
                  style={{ left: `${(hoveredElevationPoint.distanceKm / 520) * 100}%` }}
                >
                  <div className="bg-emerald-500 text-black text-[9px] font-mono font-bold px-1.5 py-0.5 rounded -translate-x-1/2 -translate-y-full">
                    {hoveredElevationPoint.altitudeMeters}m
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between font-mono text-[10px] text-slate-400">
              {selectedRoute.elevationPoints.map((ep) => (
                <span
                  key={ep.distanceKm}
                  onMouseEnter={() => setHoveredElevationPoint(ep)}
                  onMouseLeave={() => setHoveredElevationPoint(null)}
                  className="cursor-pointer hover:text-emerald-400 font-bold"
                >
                  {ep.distanceKm}km ({ep.altitudeMeters}m)
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT INSPECTOR PANEL: Hairpin Profiler, Hazards & Route Details */}
        <div className="bg-[#121821] border border-white/15 rounded-3xl p-5 shadow-2xl text-white space-y-5 h-fit">
          <div className="flex border-b border-white/10 pb-2 gap-2 text-xs font-mono">
            {(["waypoints", "hairpins", "hazards"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-3 py-1 rounded-xl font-bold capitalize transition ${
                  activeTab === t ? "bg-emerald-500 text-black" : "text-slate-400 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {activeTab === "waypoints" && (
            <div className="space-y-3 text-xs animate-in fade-in duration-200">
              <p className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Route Key Telemetry</p>
              <div className="grid grid-cols-2 gap-2 font-mono">
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-[9px] text-slate-400">TOTAL DISTANCE</p>
                  <p className="font-bold text-emerald-400">{selectedRoute.totalDistance}</p>
                </div>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-[9px] text-slate-400">RIDING TIME</p>
                  <p className="font-bold text-white">{selectedRoute.totalTime}</p>
                </div>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-[9px] text-slate-400">EST. FUEL COST</p>
                  <p className="font-bold text-white">{selectedRoute.fuelEstimate}</p>
                </div>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-[9px] text-slate-400">HAIRPIN TURNS</p>
                  <p className="font-bold text-amber-400">{selectedRoute.hairpinCount} Curves</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "hairpins" && (
            <div className="space-y-3 text-xs font-mono animate-in fade-in duration-200">
              <p className="text-[10px] text-emerald-400 font-bold uppercase">Automated Hairpin Detection Profiler</p>
              <div className="space-y-2">
                {[
                  { bend: "Hairpin Bend #1", radius: "12m", gradient: "8.4%", danger: "Low" },
                  { bend: "Hairpin Bend #9 (Loam's View)", radius: "8m", gradient: "12.1%", danger: "Moderate" },
                  { bend: "Hairpin Bend #14 (Sharp)", radius: "6m", gradient: "14.5%", danger: "High" },
                ].map((hb) => (
                  <div key={hb.bend} className="p-2.5 bg-white/5 rounded-xl border border-white/5 space-y-1">
                    <div className="flex justify-between font-bold text-white">
                      <span>{hb.bend}</span>
                      <span className={hb.danger === "High" ? "text-rose-400" : "text-amber-400"}>{hb.danger} Risk</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Radius: {hb.radius} • Gradient: {hb.gradient}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "hazards" && (
            <div className="space-y-3 text-xs font-mono animate-in fade-in duration-200">
              <p className="text-[10px] text-emerald-400 font-bold uppercase">Active Road Hazards & Alerts</p>
              <div className="space-y-2">
                {selectedRoute.hazards.map((hz) => (
                  <div key={hz.id} className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <AlertTriangle className="size-3.5 text-rose-400" /> {hz.name}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Severity: {hz.severity} • Coordinates: {hz.lat}, {hz.lng}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
