import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit,
  Shield,
  Ban,
  Trash2,
  X,
  CheckCircle2,
  MapPin,
  Route as RouteIcon,
  FolderKanban,
  FileText,
  Clock,
  Activity,
  Lock,
  Globe,
  Sliders,
  Check,
  Award,
  Layers,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getManagedUsers,
  saveManagedUsers,
  recordAuditLog,
  ManagedUser,
  getAuditTrail,
  AuditTrailEntry,
} from "@/lib/audit-trail-store";
import { places as initialPlaces, Place } from "@/data/places";
import { getCurrentAuthUser, updateAuthRole } from "@/lib/auth-rbac";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ==========================================================================
   1. USER MANAGEMENT MODAL & 360° USER PANEL
   ========================================================================== */
export function UserManagementModal({ isOpen, onClose }: ModalProps) {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [activeUserTab, setActiveUserTab] = useState<"info" | "permissions" | "activity" | "audit">("info");
  const currentUser = getCurrentAuthUser();

  useEffect(() => {
    if (isOpen) {
      setUsers(getManagedUsers());
    }
  }, [isOpen]);

  const handleRoleChange = (userId: string, newRole: ManagedUser["role"]) => {
    const updated = users.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
    setUsers(updated);
    saveManagedUsers(updated);

    const targetUser = users.find((u) => u.id === userId);

    // REACTIVE SESSION SYNCHRONIZATION: If modifying current session user, update active auth session immediately
    if (currentUser && (currentUser.id === userId || currentUser.email === targetUser?.email || currentUser.name === targetUser?.name)) {
      updateAuthRole(newRole);
    }

    recordAuditLog({
      entityType: "user",
      entityId: userId,
      entityName: targetUser?.name || "User",
      action: "ROLE_CHANGED",
      performedBy: currentUser?.name || "Admin",
      performedByRole: currentUser?.role || "Super Admin",
      details: `Changed role to ${newRole.toUpperCase()}`,
    });
  };

  const handleToggleStatus = (userId: string) => {
    const updated = users.map((u) =>
      u.id === userId ? { ...u, status: u.status === "ACTIVE" ? ("INACTIVE" as const) : ("ACTIVE" as const) } : u
    );
    setUsers(updated);
    saveManagedUsers(updated);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#121821] border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-white overflow-hidden flex flex-col justify-between"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Users className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">User Management & RBAC</h2>
              <p className="text-xs text-slate-500 font-mono">Manage accounts, roles, permissions, and reactive session claims</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl">
            <X className="size-5" />
          </button>
        </div>

        {/* 360 User Detail Workspace OR User Table */}
        {selectedUser ? (
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            <button
              onClick={() => setSelectedUser(null)}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              ← Back to User Directory
            </button>

            <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-emerald-600 text-white font-black text-lg">
                  {selectedUser.name.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{selectedUser.name}</h3>
                  <p className="text-xs font-mono text-slate-500">{selectedUser.email}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-bold rounded-full border border-emerald-500/30 uppercase">
                {selectedUser.role}
              </span>
            </div>

            {/* Workspace Tabs */}
            <div className="flex border-b border-slate-200 dark:border-white/10 text-xs font-mono font-bold">
              {[
                { id: "info", label: "Basic Info" },
                { id: "permissions", label: "Permissions Matrix" },
                { id: "activity", label: "Recent Activity" },
                { id: "audit", label: "Audit Logs" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveUserTab(tab.id as any)}
                  className={`px-4 py-2 border-b-2 transition ${
                    activeUserTab === tab.id
                      ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-mono text-xs space-y-2">
              {activeUserTab === "info" && (
                <div className="space-y-2 font-sans">
                  <p><strong>Platform Role:</strong> <span className="font-mono text-emerald-600 font-bold uppercase">{selectedUser.role}</span></p>
                  <p><strong>Explorer Rank:</strong> <span className="font-mono text-amber-600 font-bold">Level 0 Explorer</span></p>
                  <p><strong>District Scope:</strong> {selectedUser.district || "Tamil Nadu Wide"}</p>
                  <p><strong>Status:</strong> {selectedUser.status}</p>
                  <p><strong>Last Login:</strong> {selectedUser.lastLogin}</p>
                </div>
              )}

              {activeUserTab === "permissions" && (
                <div className="space-y-1 font-sans">
                  <p className="text-emerald-600 dark:text-emerald-400 font-bold">✓ GIS Module Access Granted</p>
                  <p className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Content Publishing Allowed</p>
                  <p className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Audit Log Telemetry Granted</p>
                </div>
              )}

              {activeUserTab === "activity" && (
                <p className="text-slate-500 font-sans">Active session initiated today at 09:12 AM.</p>
              )}

              {activeUserTab === "audit" && (
                <div className="space-y-1 font-mono">
                  <p className="text-slate-400">[09:12 AM] Login via password credential verified</p>
                  <p className="text-slate-400">[09:15 AM] Role RBAC telemetry claims synchronized</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-2.5 size-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-10 pr-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl">
                <Plus className="size-3.5 mr-1" /> Add User
              </Button>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-white/10 rounded-2xl">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 font-mono text-slate-500 text-[10px] uppercase">
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Platform Role</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Last Login</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10 font-mono">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <span className="grid size-7 place-items-center rounded-lg bg-emerald-600 text-white font-black text-[10px]">
                            {u.name.slice(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white font-sans">{u.name}</p>
                            <p className="text-[10px] text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                          className="bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 focus:outline-none cursor-pointer"
                        >
                          <option value="super_admin">Super Admin</option>
                          <option value="place_manager">Place Manager</option>
                          <option value="route_manager">Route Manager</option>
                          <option value="community_manager">Community Manager</option>
                          <option value="explorer">Explorer</option>
                        </select>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${u.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" : "bg-rose-500/10 text-rose-600 border-rose-500/30"}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">{u.lastLogin}</td>
                      <td className="py-3 px-3 text-right space-x-1 font-sans">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          title="View 360 Workspace"
                        >
                          <Eye className="size-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          className="p-1.5 text-amber-500 hover:text-amber-600"
                          title="Toggle Status"
                        >
                          <Ban className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="border-t border-slate-200 dark:border-white/10 pt-3 flex justify-end">
          <Button onClick={onClose} variant="outline" size="sm" className="text-xs font-bold rounded-xl">
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

/* ==========================================================================
   2. PLACES MANAGER MODAL & 360° PLACE WORKSPACE
   ========================================================================== */
export function PlacesManagerModal({ isOpen, onClose }: ModalProps) {
  const [placesList, setPlacesList] = useState<Place[]>(initialPlaces);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [activePlaceTab, setActivePlaceTab] = useState<"overview" | "gps" | "gallery" | "routes" | "history">("overview");

  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");

  useEffect(() => {
    if (selectedPlace) {
      setLat(selectedPlace.coordinates[0].toString());
      setLng(selectedPlace.coordinates[1].toString());
    }
  }, [selectedPlace]);

  const filtered = placesList.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#121821] border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-white overflow-hidden flex flex-col justify-between"
      >
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <MapPin className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Places GIS Manager</h2>
              <p className="text-xs text-slate-500 font-mono">Verified geospatial destination database across 38 districts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl">
            <X className="size-5" />
          </button>
        </div>

        {selectedPlace ? (
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            <button
              onClick={() => setSelectedPlace(null)}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              ← Back to Places Directory
            </button>

            <div className="relative h-36 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10">
              <img src={selectedPlace.image} alt={selectedPlace.name} className="size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-end text-white">
                <span className="px-2.5 py-0.5 bg-emerald-500 text-black text-[10px] font-mono font-bold rounded-full w-fit uppercase">
                  VERIFIED DESTINATION
                </span>
                <h3 className="text-xl font-extrabold mt-1">{selectedPlace.name}</h3>
                <p className="text-xs font-mono text-slate-300">{selectedPlace.district} District • {selectedPlace.elevation}</p>
              </div>
            </div>

            <div className="flex border-b border-slate-200 dark:border-white/10 text-xs font-mono font-bold">
              {[
                { id: "overview", label: "Overview" },
                { id: "gps", label: "Map & GPS Coordinates" },
                { id: "gallery", label: "Media Assets" },
                { id: "history", label: "Version History & Audit Log" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActivePlaceTab(tab.id as any)}
                  className={`px-4 py-2 border-b-2 transition ${
                    activePlaceTab === tab.id
                      ? "border-blue-500 text-blue-600 dark:text-blue-400 font-bold"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-mono space-y-3">
              {activePlaceTab === "overview" && (
                <div className="space-y-2 font-sans">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{selectedPlace.tagline}</p>
                  <p className="text-xs text-slate-500">{selectedPlace.description}</p>
                  <div className="pt-2 font-mono text-xs space-y-1">
                    <p><strong>Category:</strong> {selectedPlace.category}</p>
                    <p><strong>Distance:</strong> {selectedPlace.distanceFromChennai} from Chennai</p>
                    <p><strong>Best Time:</strong> {selectedPlace.bestMonths.join(", ")}</p>
                  </div>
                </div>
              )}

              {activePlaceTab === "gps" && (
                <div className="space-y-3 font-sans">
                  <p className="text-xs text-slate-500 font-mono">Edit exact WGS84 latitude & longitude coordinates:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase">Latitude</label>
                      <input
                        type="text"
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        className="w-full h-9 px-3 bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase">Longitude</label>
                      <input
                        type="text"
                        value={lng}
                        onChange={(e) => setLng(e.target.value)}
                        className="w-full h-9 px-3 bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activePlaceTab === "history" && (
                <div className="space-y-2 font-mono">
                  <p className="text-slate-400">[July 21] Pranav (Super Admin) Created Place Node</p>
                  <p className="text-slate-400">[July 24] Arun Kumar (Operations) Verified Coordinates</p>
                  <p className="text-slate-400">[Today 09:12] Gemini AI Generated Description</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-2.5 size-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search places by name or district..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-10 pr-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl">
                <Plus className="size-3.5 mr-1" /> Add Place
              </Button>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-white/10 rounded-2xl">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 font-mono text-slate-500 text-[10px] uppercase">
                    <th className="py-2.5 px-3">Destination</th>
                    <th className="py-2.5 px-3">District</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10 font-mono">
                  {filtered.map((p) => (
                    <tr key={p.slug} className="hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white font-sans">{p.name}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{p.district}</td>
                      <td className="py-3 px-3 text-blue-600 dark:text-blue-400 capitalize">{p.category}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold rounded-full border border-emerald-500/30 uppercase">
                          VERIFIED
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1 font-sans">
                        <button
                          onClick={() => setSelectedPlace(p)}
                          className="p-1.5 text-slate-400 hover:text-blue-600"
                          title="Open 360 Workspace"
                        >
                          <Eye className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="border-t border-slate-200 dark:border-white/10 pt-3 flex justify-end">
          <Button onClick={onClose} variant="outline" size="sm" className="text-xs font-bold rounded-xl">
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
