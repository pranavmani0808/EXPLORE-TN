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
  AlertTriangle,
  RefreshCw,
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
   1. USER MANAGEMENT MODAL & 360° USER PANEL (WITH SOFT DELETION & SAFEGUARDS)
   ========================================================================== */
export function UserManagementModal({ isOpen, onClose }: ModalProps) {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [activeUserTab, setActiveUserTab] = useState<"info" | "permissions" | "activity" | "audit">("info");
  
  // Add User Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<ManagedUser["role"]>("explorer");

  // Soft Deletion Safeguard State
  const [userToDelete, setUserToDelete] = useState<ManagedUser | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const currentUser = getCurrentAuthUser();

  useEffect(() => {
    if (isOpen) {
      setUsers(getManagedUsers());
    }
  }, [isOpen]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    const newUser: ManagedUser = {
      id: `usr-${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      status: "ACTIVE",
      district: "Tamil Nadu Wide",
      lastLogin: "Never",
      joinedDate: "Today",
    };

    const updated = [newUser, ...users];
    setUsers(updated);
    saveManagedUsers(updated);

    const actorName = currentUser?.name || "Pranav";
    const actorRole = (currentUser?.role || "super_admin").toUpperCase();

    recordAuditLog({
      entityType: "user",
      entityId: newUser.id,
      entityName: newUser.name,
      action: "CREATED",
      performedBy: actorName,
      performedByRole: actorRole,
      details: `${actorName} • ${actorRole} • Created User "${newUser.name}" (${newUser.role.toUpperCase()})`,
    });

    setNewUserName("");
    setNewUserEmail("");
    setShowAddForm(false);
  };

  const handleRoleChange = (userId: string, newRole: ManagedUser["role"]) => {
    const targetUser = users.find((u) => u.id === userId);
    const oldRole = targetUser?.role || "explorer";

    const updated = users.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
    setUsers(updated);
    saveManagedUsers(updated);

    const actorName = currentUser?.name || "Pranav";
    const actorRole = (currentUser?.role || "super_admin").toUpperCase();

    // REACTIVE SESSION SYNCHRONIZATION: Update current session if modifying self
    if (currentUser && (currentUser.id === userId || currentUser.email === targetUser?.email || currentUser.name === targetUser?.name)) {
      updateAuthRole(newRole);
    }

    recordAuditLog({
      entityType: "user",
      entityId: userId,
      entityName: targetUser?.name || "User",
      action: "ROLE_CHANGED",
      performedBy: actorName,
      performedByRole: actorRole,
      details: `${actorName} • ${actorRole} • Changed ${targetUser?.name || "User"}'s role from ${oldRole.toUpperCase()} → ${newRole.toUpperCase()}`,
    });
  };

  const handleToggleStatus = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    const oldStatus = targetUser?.status || "ACTIVE";
    const newStatus = oldStatus === "ACTIVE" ? ("INACTIVE" as const) : ("ACTIVE" as const);

    const updated = users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u));
    setUsers(updated);
    saveManagedUsers(updated);

    const actorName = currentUser?.name || "Pranav";
    const actorRole = (currentUser?.role || "super_admin").toUpperCase();

    recordAuditLog({
      entityType: "user",
      entityId: userId,
      entityName: targetUser?.name || "User",
      action: "SUSPENDED",
      performedBy: actorName,
      performedByRole: actorRole,
      details: `${actorName} • ${actorRole} • ${newStatus === "INACTIVE" ? "Suspended" : "Reactivated"} User "${targetUser?.name || "User"}"`,
    });
  };

  const handleConfirmSoftDelete = () => {
    if (!userToDelete || deleteConfirmText !== "DELETE") return;

    // Soft deletion: mark user as INACTIVE / DELETED to preserve historical audit logs
    const updated = users.map((u) => (u.id === userToDelete.id ? { ...u, status: "INACTIVE" as const } : u));
    setUsers(updated);
    saveManagedUsers(updated);

    const actorName = currentUser?.name || "Pranav";
    const actorRole = (currentUser?.role || "super_admin").toUpperCase();

    recordAuditLog({
      entityType: "user",
      entityId: userToDelete.id,
      entityName: userToDelete.name,
      action: "DELETED",
      performedBy: actorName,
      performedByRole: actorRole,
      details: `${actorName} • ${actorRole} • Soft-deleted user account "${userToDelete.name}" (Status set to INACTIVE)`,
    });

    setUserToDelete(null);
    setDeleteConfirmText("");
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
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl cursor-pointer">
            <X className="size-5" />
          </button>
        </div>

        {/* Soft Deletion Confirmation Sub-Modal */}
        {userToDelete ? (
          <div className="py-6 space-y-4 font-sans">
            <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                <AlertTriangle className="size-5" /> Confirm Account Soft Deletion
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                You are about to soft-delete user account <strong>"{userToDelete.name}"</strong> ({userToDelete.email}). This action will revoke platform access while preserving historical audit logs.
              </p>
              <div className="pt-2">
                <label className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                  Type <span className="font-bold text-rose-600">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  placeholder="DELETE"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full h-9 px-3 mt-1 bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button onClick={() => { setUserToDelete(null); setDeleteConfirmText(""); }} variant="outline" size="sm" className="text-xs font-bold rounded-xl">
                Cancel
              </Button>
              <Button
                disabled={deleteConfirmText !== "DELETE"}
                onClick={handleConfirmSoftDelete}
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Confirm Soft Delete
              </Button>
            </div>
          </div>
        ) : showAddForm ? (
          <form onSubmit={handleAddUser} className="py-4 space-y-4 font-sans">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add New Platform User</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase">User Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Santhosh"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="santhosh@exploretn.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase">Platform Role</label>
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as any)}
                className="w-full h-9 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400"
              >
                <option value="super_admin">Super Admin</option>
                <option value="place_manager">Place Manager</option>
                <option value="route_manager">Route Manager</option>
                <option value="community_manager">Community Manager</option>
                <option value="explorer">Explorer</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" onClick={() => setShowAddForm(false)} variant="outline" size="sm" className="text-xs font-bold rounded-xl">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl">
                Create User
              </Button>
            </div>
          </form>
        ) : selectedUser ? (
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
                  <p><strong>Explorer Rank:</strong> <span className="font-mono text-amber-600 font-bold">Level 0 Explorer (0 / 100 XP)</span></p>
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
                <p className="text-slate-500 font-sans">Active session initiated today at 10:21 AM.</p>
              )}

              {activeUserTab === "audit" && (
                <div className="space-y-1 font-mono">
                  <p className="text-slate-400">[10:21 AM] Login via authenticated credential verified</p>
                  <p className="text-slate-400">[10:25 AM] Role RBAC claims synchronized</p>
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

              <Button onClick={() => setShowAddForm(true)} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer">
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
                  {filteredUsers.map((u) => {
                    const isSelf = currentUser && (u.id === currentUser.id || u.name === currentUser.name || u.email === currentUser.email);

                    return (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <span className="grid size-7 place-items-center rounded-lg bg-emerald-600 text-white font-black text-[10px]">
                              {u.name.slice(0, 2).toUpperCase()}
                            </span>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white font-sans flex items-center gap-1.5">
                                {u.name} {isSelf && <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">(You)</span>}
                              </p>
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
                            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                            title="View 360 Workspace"
                          >
                            <Eye className="size-4" />
                          </button>
                          <button
                            disabled={isSelf}
                            onClick={() => handleToggleStatus(u.id)}
                            className="p-1.5 text-amber-500 hover:text-amber-600 disabled:opacity-30 cursor-pointer"
                            title={isSelf ? "Self-suspension disabled" : "Toggle Status"}
                          >
                            <Ban className="size-4" />
                          </button>
                          <button
                            disabled={isSelf}
                            onClick={() => setUserToDelete(u)}
                            className="p-1.5 text-rose-500 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                            title={isSelf ? "Self-deletion disabled for security" : "Soft Delete User"}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="border-t border-slate-200 dark:border-white/10 pt-3 flex justify-end">
          <Button onClick={onClose} variant="outline" size="sm" className="text-xs font-bold rounded-xl cursor-pointer">
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

  // Create New Place Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState("");
  const [newPlaceDistrict, setNewPlaceDistrict] = useState("");
  const [newPlaceCategory, setNewPlaceCategory] = useState("hill_station");
  const [newPlaceLat, setNewPlaceLat] = useState("11.2333");
  const [newPlaceLng, setNewPlaceLng] = useState("78.3333");
  const [newPlaceTagline, setNewPlaceTagline] = useState("");

  const currentUser = getCurrentAuthUser();

  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");

  useEffect(() => {
    if (selectedPlace) {
      setLat(selectedPlace.coordinates[0].toString());
      setLng(selectedPlace.coordinates[1].toString());
    }
  }, [selectedPlace]);

  const handleCreatePlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaceName || !newPlaceDistrict) return;

    const newPlace: Place = {
      slug: newPlaceName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: newPlaceName,
      district: newPlaceDistrict,
      category: newPlaceCategory as any,
      tagline: newPlaceTagline || "Scenic mountain destination",
      description: `Scenic ${newPlaceCategory} destination located in ${newPlaceDistrict} district, Tamil Nadu.`,
      coordinates: [parseFloat(newPlaceLat) || 11.2333, parseFloat(newPlaceLng) || 78.3333],
      elevation: "1,200m MSL",
      nearestTown: newPlaceDistrict,
      distanceFromChennai: "320 km",
      bestMonths: ["Oct", "Nov", "Dec", "Jan", "Feb"],
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop",
      heroImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop",
      activities: ["Trekking", "Photography", "Sightseeing"],
      seasonalNotes: "Excellent weather during post-monsoon months.",
      permitRequired: false,
    };

    const updated = [newPlace, ...placesList];
    setPlacesList(updated);

    const actorName = currentUser?.name || "Pranav";
    const actorRole = (currentUser?.role || "super_admin").toUpperCase();

    recordAuditLog({
      entityType: "place",
      entityId: newPlace.slug,
      entityName: newPlace.name,
      action: "CREATED",
      performedBy: actorName,
      performedByRole: actorRole,
      details: `${actorName} • ${actorRole} • Created Place "${newPlace.name}" (${newPlace.district})`,
    });

    setNewPlaceName("");
    setNewPlaceDistrict("");
    setNewPlaceTagline("");
    setShowAddForm(false);
  };

  const handleUpdateCoordinates = () => {
    if (!selectedPlace) return;
    const actorName = currentUser?.name || "Pranav";
    const actorRole = (currentUser?.role || "super_admin").toUpperCase();

    recordAuditLog({
      entityType: "place",
      entityId: selectedPlace.slug,
      entityName: selectedPlace.name,
      action: "UPDATED",
      performedBy: actorName,
      performedByRole: actorRole,
      details: `${actorName} • ${actorRole} • Updated GPS Coordinates for "${selectedPlace.name}" [${lat}, ${lng}]`,
    });
  };

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
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl cursor-pointer">
            <X className="size-5" />
          </button>
        </div>

        {showAddForm ? (
          <form onSubmit={handleCreatePlace} className="py-4 space-y-4 font-sans">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create New Destination Node</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase">Place Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kolli Hills Viewpoint"
                  value={newPlaceName}
                  onChange={(e) => setNewPlaceName(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase">District</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Namakkal"
                  value={newPlaceDistrict}
                  onChange={(e) => setNewPlaceDistrict(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase">Category</label>
                <select
                  value={newPlaceCategory}
                  onChange={(e) => setNewPlaceCategory(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400"
                >
                  <option value="hill_station">Hill Station</option>
                  <option value="waterfall">Waterfall</option>
                  <option value="heritage">Heritage Temple</option>
                  <option value="wildlife">Wildlife Sanctuary</option>
                  <option value="coastal">Coastal Beach</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase">Latitude</label>
                <input
                  type="text"
                  value={newPlaceLat}
                  onChange={(e) => setNewPlaceLat(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase">Longitude</label>
                <input
                  type="text"
                  value={newPlaceLng}
                  onChange={(e) => setNewPlaceLng(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase">Tagline / Short Summary</label>
              <input
                type="text"
                placeholder="70 hairpin bends mountain trail"
                value={newPlaceTagline}
                onChange={(e) => setNewPlaceTagline(e.target.value)}
                className="w-full h-9 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" onClick={() => setShowAddForm(false)} variant="outline" size="sm" className="text-xs font-bold rounded-xl">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl">
                Save Destination Node
              </Button>
            </div>
          </form>
        ) : selectedPlace ? (
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
                  <Button onClick={handleUpdateCoordinates} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl">
                    Save GPS Coordinates
                  </Button>
                </div>
              )}

              {activePlaceTab === "history" && (
                <div className="space-y-2 font-mono">
                  <p className="text-slate-400">[July 21] Pranav (SUPER_ADMIN) Created Place Node</p>
                  <p className="text-slate-400">[July 24] Pranav (SUPER_ADMIN) Verified Coordinates</p>
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

              <Button onClick={() => setShowAddForm(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer">
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
                          className="p-1.5 text-slate-400 hover:text-blue-600 cursor-pointer"
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
          <Button onClick={onClose} variant="outline" size="sm" className="text-xs font-bold rounded-xl cursor-pointer">
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
