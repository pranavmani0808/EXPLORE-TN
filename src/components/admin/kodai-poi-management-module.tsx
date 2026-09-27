import React, { useState, useEffect } from "react";
import {
  Mountain,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Car,
  Clock,
  Navigation,
  Eye,
  RefreshCw,
  X,
  Check,
  Sparkles,
  Droplets,
  Trees,
  Footprints,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import {
  KodaiPoiRecord,
  KodaiPoiCategory,
  getAllKodaiPois,
  addKodaiPoi,
  updateKodaiPoi,
  deleteKodaiPoi
} from "@/lib/data/kodaikanal-pois";
import { VerificationStatusBadge, KODAI_CATEGORY_META } from "@/components/site/kodai-poi-components";

export function KodaiPoiManagementModule() {
  const [pois, setPois] = useState<KodaiPoiRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<KodaiPoiCategory | "all">("all");
  const [editingPoi, setEditingPoi] = useState<KodaiPoiRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadPois();
  }, []);

  const loadPois = () => {
    setPois(getAllKodaiPois());
  };

  const filteredPois = pois.filter((poi) => {
    const matchesSearch =
      poi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poi.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poi.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || poi.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete POI: "${name}"?`)) {
      deleteKodaiPoi(id);
      loadPois();
      toast.success(`Deleted POI: ${name}`);
    }
  };

  const handleSavePoi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPoi) return;

    if (isCreating) {
      addKodaiPoi(editingPoi);
      toast.success(`Created new POI: ${editingPoi.name}`);
    } else {
      updateKodaiPoi(editingPoi.id, editingPoi);
      toast.success(`Updated POI: ${editingPoi.name}`);
    }

    setEditingPoi(null);
    setIsCreating(false);
    loadPois();
  };

  const createBlankPoi = (): KodaiPoiRecord => ({
    id: `kodai-poi-${Date.now()}`,
    name: "New Kodaikanal POI",
    slug: `new-kodai-poi-${Date.now()}`,
    destinationId: "kodaikanal",
    category: "lakes",
    subcategory: "Lake",
    description: "Detailed travel description for this Kodaikanal attraction.",
    shortDescription: "Short summary.",
    latitude: 10.2381,
    longitude: 77.4892,
    elevation: 2133,
    images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"],
    gallery: [],
    accessibility: "Fully Accessible",
    openingHours: "6:00 AM - 6:00 PM",
    entryFee: "Free Entry",
    bestTimeToVisit: "Morning / Post-Monsoon",
    estimatedVisitDuration: "1 - 2 Hours",
    popularity: 8,
    crowdLevel: "Moderate",
    weather: "Cool & Pleasant",
    visibility: "Crystal Clear",
    roadCondition: "Good Asphalt",
    parking: {
      carParking: "Available",
      bikeParking: "Available",
      parkingDistance: "At Location",
      parkingFee: "Free"
    },
    facilities: {
      restroom: { available: true, details: "Public rest rooms available" },
      drinkingWater: { available: true, details: "RO Water station" },
      foodStalls: { available: true, details: "Tea and snack stalls nearby" },
      firstAid: { available: true, details: "Basic first aid kit" },
      medicalFacility: { available: "Nearby", details: "Government Hospital 2km" }
    },
    nearbyEssentials: [],
    nearbyPlaces: [],
    nearbyFood: ["Local Cafe", "Standard Restaurant"],
    nearbyFuel: ["IOCL Kodaikanal"],
    nearbyMedical: ["GH Kodaikanal"],
    nearbyHotels: ["Resort & Stays"],
    nearbyShops: ["Spices & Tea Shops"],
    safetyInformation: ["Drive carefully along narrow hairpin turns."],
    routeInformation: {
      roadQuality: "Good Asphalt Road",
      lastFuelStation: "Kodaikanal Town (2 km)",
      lastFoodStop: "Kodaikanal Lake Area",
      lastRestroom: "At Entrance",
      networkAvailability: "Strong 4G (Airtel / Jio)",
      nearestHospital: "Government Hospital Kodaikanal",
      isRemoteStretch: false
    },
    lastVerified: "Today",
    dataSource: "Official District Records",
    confidence: 95
  });

  return (
    <div className="space-y-6 text-slate-200">
      {/* Top Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Mountain className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white">Kodaikanal POI Travel Intelligence CMS</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage all 30 individual tourist attraction records under Kodaikanal region.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingPoi(createBlankPoi());
              setIsCreating(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-950/40"
          >
            <Plus className="w-4 h-4" />
            Add New POI Record
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400">Total Mapped POIs</span>
          <p className="text-lg font-bold text-white mt-0.5">{pois.length}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400">Verified On-Ground</span>
          <p className="text-lg font-bold text-emerald-400 mt-0.5">
            {pois.filter((p) => p.confidence >= 90).length}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400">Waterfalls & Lakes</span>
          <p className="text-lg font-bold text-cyan-400 mt-0.5">
            {pois.filter((p) => p.category === "waterfalls" || p.category === "lakes").length}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400">Remote Stretches</span>
          <p className="text-lg font-bold text-rose-400 mt-0.5">
            {pois.filter((p) => p.routeInformation.isRemoteStretch).length}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search POI by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
          {(["all", "lakes", "waterfalls", "viewpoints", "parks", "forest", "trekking", "temples"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* POI Table List */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">POI Name & Category</th>
                <th className="py-3 px-4">Elevation & Accessibility</th>
                <th className="py-3 px-4">Parking Status</th>
                <th className="py-3 px-4">Confidence / Source</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPois.map((poi) => {
                const catMeta = KODAI_CATEGORY_META[poi.category] || KODAI_CATEGORY_META.all;
                return (
                  <tr key={poi.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={poi.images[0] || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"}
                          alt={poi.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-950 shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-white text-sm">{poi.name}</h4>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${catMeta.text}`}>
                            <span>{catMeta.icon}</span> {poi.subcategory}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-emerald-400 font-semibold">{poi.elevation}m MSL</div>
                      <div className="text-slate-400 text-[11px]">{poi.accessibility}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200">Car: {poi.parking.carParking}</div>
                      <div className="text-slate-400 text-[11px]">Fee: {poi.parking.parkingFee}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <VerificationStatusBadge status={poi.confidence >= 90 ? "verified" : "community"} />
                      <div className="text-slate-500 text-[10px] mt-1">{poi.dataSource}</div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingPoi(poi);
                            setIsCreating(false);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                          title="Edit POI"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(poi.id, poi.name)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="Delete POI"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit POI Modal Form */}
      {editingPoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-emerald-400" />
                {isCreating ? "Add New Kodaikanal POI" : `Edit POI: ${editingPoi.name}`}
              </h2>
              <button
                onClick={() => setEditingPoi(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePoi} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1">POI Name</label>
                  <input
                    type="text"
                    value={editingPoi.name}
                    onChange={(e) => setEditingPoi({ ...editingPoi, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Slug (URL string)</label>
                  <input
                    type="text"
                    value={editingPoi.slug}
                    onChange={(e) => setEditingPoi({ ...editingPoi, slug: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={editingPoi.category}
                    onChange={(e) => setEditingPoi({ ...editingPoi, category: e.target.value as KodaiPoiCategory })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500"
                  >
                    {(["lakes", "waterfalls", "viewpoints", "parks", "caves", "forest", "temples", "museums", "villages", "trekking"] as const).map((c) => (
                      <option key={c} value={c}>
                        {c.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Subcategory Badge</label>
                  <input
                    type="text"
                    value={editingPoi.subcategory}
                    onChange={(e) => setEditingPoi({ ...editingPoi, subcategory: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editingPoi.latitude}
                    onChange={(e) => setEditingPoi({ ...editingPoi, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editingPoi.longitude}
                    onChange={(e) => setEditingPoi({ ...editingPoi, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Elevation (meters MSL)</label>
                  <input
                    type="number"
                    value={editingPoi.elevation}
                    onChange={(e) => setEditingPoi({ ...editingPoi, elevation: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Accessibility Grade</label>
                  <select
                    value={editingPoi.accessibility}
                    onChange={(e) => setEditingPoi({ ...editingPoi, accessibility: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500"
                  >
                    <option value="Fully Accessible">Fully Accessible</option>
                    <option value="Steep Walk Required">Steep Walk Required</option>
                    <option value="Trek Access Only">Trek Access Only</option>
                    <option value="Permit Restricted">Permit Restricted</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={editingPoi.description}
                  onChange={(e) => setEditingPoi({ ...editingPoi, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500"
                />
              </div>

              {/* Parking Sub-section */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                  <Car className="w-4 h-4" /> Parking & Vehicle Settings
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Car Parking</label>
                    <select
                      value={editingPoi.parking.carParking}
                      onChange={(e) => setEditingPoi({
                        ...editingPoi,
                        parking: { ...editingPoi.parking, carParking: e.target.value as any }
                      })}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                    >
                      <option value="Available">Available</option>
                      <option value="Limited">Limited</option>
                      <option value="Not Available">Not Available</option>
                      <option value="Information not yet verified">Information not yet verified</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Parking Fee</label>
                    <input
                      type="text"
                      value={editingPoi.parking.parkingFee}
                      onChange={(e) => setEditingPoi({
                        ...editingPoi,
                        parking: { ...editingPoi.parking, parkingFee: e.target.value }
                      })}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPoi(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-950/40"
                >
                  Save POI Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
