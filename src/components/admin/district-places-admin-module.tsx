import React, { useState, useEffect, useMemo } from "react";
import {
  Compass,
  MapPin,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
  Upload,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Clock,
  Star,
  RefreshCw,
  X,
  Check,
  Building2,
  Table as TableIcon,
  ExternalLink,
  Info
} from "lucide-react";
import { toast } from "sonner";
import {
  TAMIL_NADU_DISTRICTS,
  DistrictData,
  DistrictSpot,
  addDistrictSpot,
  updateDistrictSpot,
  deleteDistrictSpot,
  DistrictCategoryKey
} from "@/lib/data/districts";
import { SupabaseDatabaseRepository } from "@/lib/supabase-database";
import { recordAuditLog } from "@/lib/audit-trail-store";
import { getCurrentAuthUser } from "@/lib/auth-rbac";
import { Button } from "@/components/ui/button";

export function DistrictPlacesAdminModule() {
  const [selectedDistrictSlug, setSelectedDistrictSlug] = useState<string>("virudhunagar");
  const [districtSearch, setDistrictSearch] = useState<string>("");
  const [spotSearch, setSpotSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<DistrictCategoryKey>("all");
  
  // Data state
  const [districtsState, setDistrictsState] = useState<Record<string, DistrictData>>(TAMIL_NADU_DISTRICTS);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSpot, setEditingSpot] = useState<DistrictSpot | null>(null);

  // Inspection drawer
  const [inspectSpot, setInspectSpot] = useState<DistrictSpot | null>(null);

  const currentUser = getCurrentAuthUser();
  const districtList = useMemo(() => Object.values(districtsState), [districtsState]);

  // Current active district
  const currentDistrict = districtsState[selectedDistrictSlug] || districtList[0];

  // Set default inspect spot when district changes
  useEffect(() => {
    if (currentDistrict && currentDistrict.spots.length > 0) {
      setInspectSpot(currentDistrict.spots[0]);
    } else {
      setInspectSpot(null);
    }
  }, [selectedDistrictSlug]);

  // Filter districts in sidebar
  const filteredDistricts = useMemo(() => {
    return districtList.filter((d) =>
      d.name.toLowerCase().includes(districtSearch.toLowerCase()) ||
      d.region.toLowerCase().includes(districtSearch.toLowerCase()) ||
      d.slug.toLowerCase().includes(districtSearch.toLowerCase())
    );
  }, [districtList, districtSearch]);

  // Filter spots in current district
  const filteredSpots = useMemo(() => {
    if (!currentDistrict) return [];
    return currentDistrict.spots.filter((s) => {
      const matchesCategory = categoryFilter === "all" || s.category === categoryFilter;
      const q = spotSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q) ||
        s.categoryLabel.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.highlights.some((h) => h.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [currentDistrict, categoryFilter, spotSearch]);

  // Form State for Adding / Editing Place
  const [formData, setFormData] = useState<Partial<DistrictSpot>>({
    name: "",
    category: "tourist-spots",
    categoryLabel: "Tourist Spot",
    tagline: "",
    description: "",
    latitude: 9.5872,
    longitude: 77.9624,
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviewsCount: 1500,
    address: "",
    timings: "09:00 AM – 06:00 PM Daily",
    highlights: [],
    mustTry: [],
    verified: true,
  });

  const [highlightInput, setHighlightInput] = useState("");
  const [mustTryInput, setMustTryInput] = useState("");

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingSpot(null);
    setFormData({
      id: `${selectedDistrictSlug}-spot-${Date.now()}`,
      name: "",
      category: "tourist-spots",
      categoryLabel: "Tourist Attraction",
      tagline: "",
      description: "",
      latitude: currentDistrict ? currentDistrict.centerCoords[0] : 10.5,
      longitude: currentDistrict ? currentDistrict.centerCoords[1] : 78.5,
      image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
      rating: 4.8,
      reviewsCount: 1200,
      address: `${currentDistrict?.name}, Tamil Nadu`,
      timings: "08:00 AM – 06:00 PM Daily",
      highlights: ["Family Friendly", "Scenic Atmosphere"],
      mustTry: [],
      verified: true,
    });
    setHighlightInput("Family Friendly, Scenic Atmosphere");
    setMustTryInput("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (spot: DistrictSpot) => {
    setIsEditing(true);
    setEditingSpot(spot);
    setFormData({ ...spot });
    setHighlightInput(spot.highlights.join(", "));
    setMustTryInput((spot.mustTry || []).join(", "));
    setIsModalOpen(true);
  };

  const handleSaveSpot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Please provide a name for this place.");
      return;
    }

    const highlights = highlightInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const mustTry = mustTryInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const finalSpot: DistrictSpot = {
      id: formData.id || `${selectedDistrictSlug}-${Date.now()}`,
      name: formData.name,
      category: (formData.category as DistrictSpot["category"]) || "tourist-spots",
      categoryLabel: formData.categoryLabel || "Tourist Attraction",
      tagline: formData.tagline || `Popular destination in ${currentDistrict.name}`,
      description: formData.description || `Explore ${formData.name} located in ${currentDistrict.name}, Tamil Nadu.`,
      latitude: Number(formData.latitude) || currentDistrict.centerCoords[0],
      longitude: Number(formData.longitude) || currentDistrict.centerCoords[1],
      image: formData.image || "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
      rating: Number(formData.rating) || 4.8,
      reviewsCount: Number(formData.reviewsCount) || 1000,
      address: formData.address || `${currentDistrict.name}, Tamil Nadu`,
      timings: formData.timings || "09:00 AM – 06:00 PM Daily",
      highlights: highlights.length > 0 ? highlights : ["Sightseeing"],
      mustTry: mustTry.length > 0 ? mustTry : undefined,
      verified: formData.verified ?? true,
    };

    if (isEditing && editingSpot) {
      updateDistrictSpot(selectedDistrictSlug, editingSpot.id, finalSpot);
      toast.success(`Updated "${finalSpot.name}" in ${currentDistrict.name}`);
    } else {
      addDistrictSpot(selectedDistrictSlug, finalSpot);
      toast.success(`Added "${finalSpot.name}" to ${currentDistrict.name}`);
    }

    // Also sync to Supabase database repository
    try {
      await SupabaseDatabaseRepository.createPlace({
        id: finalSpot.id,
        name: finalSpot.name,
        slug: finalSpot.id,
        district: currentDistrict.name.replace(/\s+District$/i, ""),
        category: finalSpot.category,
        primary_category: finalSpot.category,
        tagline: finalSpot.tagline,
        description: finalSpot.description,
        latitude: finalSpot.latitude,
        longitude: finalSpot.longitude,
        image_url: finalSpot.image,
        rating: finalSpot.rating,
        review_count: finalSpot.reviewsCount,
        tags: [finalSpot.category, selectedDistrictSlug, ...(finalSpot.highlights || [])],
      });
    } catch (err) {
      console.warn("Supabase background sync notice:", err);
    }

    // Record audit log
    recordAuditLog({
      entityType: "place",
      entityId: finalSpot.id,
      entityName: finalSpot.name,
      action: isEditing ? "UPDATED" : "CREATED",
      performedBy: currentUser?.name || "Admin",
      performedByRole: (currentUser?.role || "admin").toUpperCase(),
      details: `${isEditing ? "Updated" : "Added"} place in ${currentDistrict.name} table: ${finalSpot.name} (${finalSpot.category})`,
    });

    // Refresh state
    setDistrictsState({ ...TAMIL_NADU_DISTRICTS });
    setIsModalOpen(false);
    setInspectSpot(finalSpot);
  };

  const handleDeleteSpot = async (spot: DistrictSpot) => {
    if (!confirm(`Are you sure you want to delete "${spot.name}" from ${currentDistrict.name}?`)) {
      return;
    }

    deleteDistrictSpot(selectedDistrictSlug, spot.id);
    
    // Also delete from Supabase
    try {
      await SupabaseDatabaseRepository.deletePlace(spot.id);
    } catch (err) {
      console.warn("Supabase delete notice:", err);
    }

    recordAuditLog({
      entityType: "place",
      entityId: spot.id,
      entityName: spot.name,
      action: "DELETED",
      performedBy: currentUser?.name || "Admin",
      performedByRole: (currentUser?.role || "admin").toUpperCase(),
      details: `Deleted place "${spot.name}" from ${currentDistrict.name} table`,
    });

    toast.success(`Deleted "${spot.name}" from ${currentDistrict.name}`);
    setDistrictsState({ ...TAMIL_NADU_DISTRICTS });

    if (inspectSpot?.id === spot.id) {
      const remaining = currentDistrict.spots.filter((s) => s.id !== spot.id);
      setInspectSpot(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const handleSyncAllToSupabase = async () => {
    setIsSyncingSupabase(true);
    try {
      await SupabaseDatabaseRepository.seedCanonicalPlacesToSupabase();
      toast.success("Successfully synced all 38 district tables into Supabase Primary Database Memory!");
    } catch (err) {
      toast.error("Failed to sync district tables to Supabase.");
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  return (
    <div className="space-y-6 text-zinc-100">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold">
            <Building2 className="size-3.5" /> 38 DISTRICT TABLES & SUPABASE SYNC
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-2 font-serif">
            District-Wise Places Management Table
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Add, modify, or delete places categorized into Tourist Spots, Food, Temples, Hills, Falls, and Beaches across any of the 38 districts of Tamil Nadu.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={handleSyncAllToSupabase}
            variant="outline"
            size="sm"
            disabled={isSyncingSupabase}
            className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-xl font-bold cursor-pointer"
          >
            <RefreshCw className={`size-3.5 mr-1.5 ${isSyncingSupabase ? "animate-spin text-amber-400" : ""}`} />
            {isSyncingSupabase ? "Syncing Supabase..." : "Sync All to Supabase"}
          </Button>

          <Button
            onClick={handleOpenAddModal}
            size="sm"
            className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="size-4 mr-1" /> Add Place in {currentDistrict.name.replace(/\s+District$/i, "")}
          </Button>
        </div>
      </div>

      {/* Main Workspace: District Selector Left + Places Table Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: District List (3 cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-zinc-900/90 border border-zinc-800 p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div>
              <h3 className="font-bold text-sm text-white">Select District Table</h3>
              <p className="text-[11px] text-zinc-400">{districtList.length} Tamil Nadu Districts</p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
              38 Active
            </span>
          </div>

          {/* Search Districts */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search district (e.g. Virudhunagar, Nilgiris)..."
              value={districtSearch}
              onChange={(e) => setDistrictSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* District Buttons List */}
          <div className="space-y-1 max-h-[620px] overflow-y-auto scrollbar-none pr-1">
            {filteredDistricts.map((d) => {
              const isSelected = d.slug === selectedDistrictSlug;
              return (
                <button
                  key={d.slug}
                  onClick={() => setSelectedDistrictSlug(d.slug)}
                  className={`w-full text-left p-3 rounded-2xl transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20"
                      : "bg-zinc-950/60 hover:bg-zinc-800 text-zinc-300 border border-zinc-800/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-base">{isSelected ? "📍" : "🏛️"}</span>
                    <div className="truncate">
                      <p className={`text-xs truncate ${isSelected ? "text-zinc-950 font-bold" : "text-white font-medium"}`}>
                        {d.name.replace(/\s+District$/i, "")}
                      </p>
                      <p className={`text-[10px] truncate ${isSelected ? "text-zinc-900/80" : "text-zinc-500"}`}>
                        {d.region}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                      isSelected
                        ? "bg-zinc-950 text-amber-300"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {d.spots.length} spots
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: District Places Table & Inspector (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Active District Banner & Filter Bar */}
          <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white font-display">
                    {currentDistrict.name} Table
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                    {currentDistrict.spots.length} Places Total
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">{currentDistrict.tagline}</p>
              </div>

              {/* Spot Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter places in this district..."
                  value={spotSearch}
                  onChange={(e) => setSpotSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-zinc-800/80">
              {[
                { key: "all", label: "All Spots", icon: "📍" },
                { key: "tourist-spots", label: "Tourist", icon: "🏛️" },
                { key: "food-spots", label: "Food & Sweets", icon: "🍲" },
                { key: "temples", label: "Temples", icon: "🛕" },
                { key: "hills", label: "Hills", icon: "⛰️" },
                { key: "falls", label: "Waterfalls", icon: "💦" },
                { key: "beaches", label: "Beaches", icon: "🌊" },
              ].map((tab) => {
                const isActive = categoryFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setCategoryFilter(tab.key as DistrictCategoryKey)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? "bg-amber-500 text-zinc-950 font-bold"
                        : "bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800"
                    }`}
                  >
                    <span className="mr-1">{tab.icon}</span>
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Places Table */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950/80 text-[11px] font-mono uppercase text-zinc-400">
                    <th className="py-3 px-4">Place Name & Image</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 hidden md:table-cell">Coordinates</th>
                    <th className="py-3 px-4 text-center">Rating</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredSpots.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-zinc-400">
                        <Compass className="size-8 mx-auto text-zinc-600 mb-2" />
                        <p className="font-semibold">No places found in {currentDistrict.name} matching filter.</p>
                        <p className="text-[11px] text-zinc-500 mt-1">Click "Add Place" above to add new tourist spots, food shops, or temples.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredSpots.map((spot) => {
                      const isSelected = inspectSpot?.id === spot.id;
                      return (
                        <tr
                          key={spot.id}
                          onClick={() => setInspectSpot(spot)}
                          className={`hover:bg-zinc-800/50 transition cursor-pointer ${
                            isSelected ? "bg-amber-500/10" : ""
                          }`}
                        >
                          {/* Name & Photo */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={spot.image}
                                alt={spot.name}
                                className="size-11 rounded-xl object-cover shrink-0 border border-zinc-800"
                                loading="lazy"
                              />
                              <div>
                                <p className="font-bold text-white text-sm hover:text-amber-400 transition-colors">
                                  {spot.name}
                                </p>
                                <p className="text-[11px] text-zinc-400 line-clamp-1 max-w-[220px]">
                                  {spot.tagline}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category Badge */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-800 border border-zinc-700 text-zinc-200">
                              {spot.category === "tourist-spots" && "🏛️ Tourist"}
                              {spot.category === "food-spots" && "🍲 Food"}
                              {spot.category === "temples" && "🛕 Temple"}
                              {spot.category === "hills" && "⛰️ Hills"}
                              {spot.category === "falls" && "💦 Waterfall"}
                              {spot.category === "beaches" && "🌊 Beach"}
                              {spot.category === "thrift-streets" && "🛍️ Shopping"}
                            </span>
                          </td>

                          {/* Coordinates */}
                          <td className="py-3 px-4 hidden md:table-cell text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                            {spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}
                          </td>

                          {/* Rating */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1 font-bold text-amber-400">
                              <Star className="size-3 fill-amber-400 text-amber-400" />
                              <span>{spot.rating}</span>
                            </div>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditModal(spot)}
                                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-300 transition-colors cursor-pointer"
                                title="Edit Place"
                              >
                                <Edit className="size-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSpot(spot)}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                                title="Delete Place"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Place Inspector Drawer / Details Card */}
          {inspectSpot && (
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔍</span>
                  <div>
                    <h4 className="font-bold text-base text-white">{inspectSpot.name}</h4>
                    <p className="text-xs text-amber-400 font-mono">{inspectSpot.categoryLabel} • {currentDistrict.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleOpenEditModal(inspectSpot)}
                    size="sm"
                    variant="outline"
                    className="border-zinc-700 bg-zinc-800 text-xs rounded-xl font-bold cursor-pointer"
                  >
                    <Edit className="size-3 mr-1" /> Edit
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-44 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800">
                  <img src={inspectSpot.image} alt={inspectSpot.name} className="size-full object-cover" />
                </div>

                <div className="md:col-span-2 space-y-3 text-xs">
                  <div>
                    <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-mono">Description:</span>
                    <p className="text-zinc-300 mt-0.5 leading-relaxed">{inspectSpot.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800 text-[11px]">
                    <div>
                      <span className="text-zinc-500">Address:</span>
                      <p className="text-zinc-300 font-medium">{inspectSpot.address}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500">Timings:</span>
                      <p className="text-zinc-300 font-medium">{inspectSpot.timings}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800">
                    <span className="text-zinc-500 text-[10px] font-mono uppercase">Highlights:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {inspectSpot.highlights.map((h, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                          ✓ {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{isEditing ? "✏️" : "✨"}</span>
                <div>
                  <h3 className="font-bold text-lg text-white">
                    {isEditing ? `Edit "${editingSpot?.name}"` : `Add New Place to ${currentDistrict.name}`}
                  </h3>
                  <p className="text-xs text-zinc-400">Save directly to {currentDistrict.name} collection table & Supabase</p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSpot} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Place Name */}
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Place / Spot Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Srivilliputhur Andal Temple"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as DistrictSpot["category"] })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="tourist-spots">🏛️ Tourist Spot</option>
                    <option value="food-spots">🍲 Food & Sweets</option>
                    <option value="temples">🛕 Temple</option>
                    <option value="hills">⛰️ Hills & Forest</option>
                    <option value="falls">💦 Waterfalls & Dams</option>
                    <option value="beaches">🌊 Beach & Shore</option>
                    <option value="thrift-streets">🛍️ Shopping / Thrift</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Label */}
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Category Sub-Label</label>
                  <input
                    type="text"
                    value={formData.categoryLabel || ""}
                    onChange={(e) => setFormData({ ...formData, categoryLabel: e.target.value })}
                    placeholder="e.g. 192ft State Emblem Tower, GI Sweet"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Tagline */}
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Short Tagline</label>
                  <input
                    type="text"
                    value={formData.tagline || ""}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="One-line summary of this destination"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Detailed Description</label>
                <textarea
                  rows={3}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide comprehensive travel context, history, and experience details..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Latitude (decimal)</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude || 0}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Longitude (decimal)</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude || 0}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Photo URL */}
              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Image Photo URL</label>
                <input
                  type="url"
                  value={formData.image || ""}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Address & Timings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Address / Location</label>
                  <input
                    type="text"
                    value={formData.address || ""}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Car Street, Srivilliputhur 626125"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Timings</label>
                  <input
                    type="text"
                    value={formData.timings || ""}
                    onChange={(e) => setFormData({ ...formData, timings: e.target.value })}
                    placeholder="e.g. 06:00 AM – 08:30 PM Daily"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Highlights & Must Try */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Highlights (comma separated)</label>
                  <input
                    type="text"
                    value={highlightInput}
                    onChange={(e) => setHighlightInput(e.target.value)}
                    placeholder="192ft Emblem Tower, Chola Frescoes, Family Friendly"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Must Try / Specialties (comma separated)</label>
                  <input
                    type="text"
                    value={mustTryInput}
                    onChange={(e) => setMustTryInput(e.target.value)}
                    placeholder="Fresh Milk Palkova, Ennai Parotta"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="border-zinc-700 bg-zinc-800 text-zinc-300 text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs rounded-xl"
                >
                  {isEditing ? "Save Place Updates" : `Add Place to ${currentDistrict.name}`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
