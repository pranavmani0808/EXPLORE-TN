import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, Smartphone, Key, Download, Trash2, CheckCircle2 } from "lucide-react";
import { getCurrentAuthUser } from "@/lib/auth-rbac";
import { sanitizePiiResponse, maskEmail } from "@/lib/security/encryption";
import { recordChainedAuditLog } from "@/lib/security/hash-chain-audit";
import { toast } from "sonner";

export const Route = createFileRoute("/settings/security")({
  head: () => ({
    meta: [
      { title: "Security & Privacy Center — ExploreTN" },
      { name: "description", content: "Manage password, active sessions, PII privacy masking, and account security controls." },
    ],
  }),
  component: UserSecurityCenterPage,
});

function UserSecurityCenterPage() {
  const user = getCurrentAuthUser() || {
    id: "usr-1",
    name: "Pranav",
    email: "pranavviper7@gmail.com",
    role: "super_admin" as const,
    avatar: "/avatars/pranav.jpg",
    status: "active" as const,
    rank: "Master Explorer",
    districtCount: 38,
  };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [activeSessions, setActiveSessions] = useState([
    { id: "sess-1", device: "MacBook Pro (macOS Sonoma)", location: "Chennai, TN", ip: "49.207.xxx.xxx", current: true, time: "Active now" },
    { id: "sess-2", device: "iPhone 15 Pro (iOS 17)", location: "Kodaikanal, TN", ip: "157.48.xxx.xxx", current: false, time: "2 hours ago" },
  ]);

  const [showPiiPreview, setShowPiiPreview] = useState(false);

  function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsUpdatingPassword(true);
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      recordChainedAuditLog({
        actorId: user.id,
        performedBy: user.name,
        performedByRole: user.role,
        action: "PASSWORD_CHANGED",
        entityType: "user",
        entityId: user.id,
        entityName: user.name,
        details: "User updated account security password",
        severity: "MEDIUM",
      });

      toast.success("Security password updated successfully!");
    }, 800);
  }

  function handleRevokeOtherSessions() {
    setActiveSessions(activeSessions.filter((s) => s.current));
    recordChainedAuditLog({
      actorId: user.id,
      performedBy: user.name,
      performedByRole: user.role,
      action: "SESSION_REVOKED",
      entityType: "user",
      entityId: user.id,
      entityName: user.name,
      details: "Revoked all active secondary device sessions",
      severity: "LOW",
    });
    toast.success("All other active device sessions have been revoked");
  }

  function handleExportData() {
    const rawData = {
      profile: user,
      exportTimestamp: new Date().toISOString(),
      cainProtection: "AES-256-GCM Field Classification",
    };

    const blob = new Blob([JSON.stringify(rawData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `explore-tn-user-data-${user.id}.json`;
    a.click();
    toast.success("Personal data archive downloaded");
  }

  const maskedUserData = sanitizePiiResponse({
    name: user.name,
    email: user.email,
    phone: "+91 98765 43210",
    role: user.role,
  });

  return (
    <AppShell>
      <div className="min-h-screen bg-[#09090b] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-7 h-7 text-emerald-400" />
                Security & Privacy Controls
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                CAIN Architecture • AES-256-GCM Confidentiality & Session Controls
              </p>
            </div>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold">
              ENCRYPTED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Password Management */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-bold text-white">Change Security Password</h2>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">New Password (Min 8 characters)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="••••••••"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold mt-2"
                >
                  {isUpdatingPassword ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </div>

            {/* Active Sessions */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-bold text-white">Active Device Sessions</h2>
                </div>
                <Button onClick={handleRevokeOtherSessions} variant="outline" size="sm" className="text-xs text-red-400 border-red-500/30">
                  Revoke Others
                </Button>
              </div>

              <div className="space-y-3">
                {activeSessions.map((session) => (
                  <div key={session.id} className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex items-start justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                        {session.device}
                        {session.current && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded">Current</span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">{session.location} • {session.ip}</div>
                    </div>
                    <span className="text-[10px] text-zinc-400">{session.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Privacy & PII Data Protection */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-400" /> PII Data Privacy & Export
                </h2>
                <p className="text-xs text-zinc-400">
                  ExploreTN masks sensitive details according to CAIN Data Classification standards.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={() => setShowPiiPreview(!showPiiPreview)} variant="outline" size="sm" className="text-xs border-zinc-700">
                  {showPiiPreview ? "Hide Masked PII" : "Preview Masked PII"}
                </Button>
                <Button onClick={handleExportData} size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 text-xs">
                  <Download className="w-3.5 h-3.5" /> Export Data JSON
                </Button>
              </div>
            </div>

            {showPiiPreview && (
              <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 font-mono text-xs text-zinc-300 space-y-1">
                <div><span className="text-zinc-400">Name:</span> {maskedUserData.name}</div>
                <div><span className="text-zinc-400">Email (Masked):</span> {maskedUserData.email}</div>
                <div><span className="text-zinc-400">Phone (Masked):</span> {maskedUserData.phone}</div>
                <div><span className="text-zinc-400">Role:</span> {maskedUserData.role}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
