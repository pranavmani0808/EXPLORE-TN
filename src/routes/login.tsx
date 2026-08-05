import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { Compass, ArrowRight, Lock, UserCheck, UserPlus, Mail, Key, User, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import { UserRole, getAuthorizedRedirectRoute, setAuthSession, UserProfile } from "@/lib/auth-rbac";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "ExplorerTN Auth — Sign In & Create Account" },
      {
        name: "description",
        content: "Sign in or create an account for ExplorerTN.",
      },
    ],
  }),
  component: LoginPage,
});

export function GoogleLogoSVG() {
  return (
    <svg className="size-5 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.26v3.15C3.25 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.26C.46 8.2.0 10.04.0 12s.46 3.8 1.26 5.39l4.02-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.26 6.61l4.02 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
      />
    </svg>
  );
}

function LoginPage() {
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authStep, setAuthStep] = useState<"idle" | "authenticating" | "authorized">("idle");

  const [form, setForm] = useState({
    fullName: "",
    email: "admin@exploretn.com",
    password: "popz",
  });

  const handleAuthSubmit = () => {
    setAuthStep("authenticating");

    const emailLower = form.email.trim().toLowerCase();
    const isAdminCreds =
      emailLower === "admin@exploretn.com" ||
      emailLower === "admin@explorertn.com" ||
      emailLower.endsWith("@explorertn.com");

    const assignedRole: UserRole = isAdminCreds ? "super_admin" : "explorer";

    const createdUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: isAdminCreds
        ? "Platform Super Admin"
        : form.fullName.trim() || (authMode === "signin" ? form.email.split("@")[0] || "Explorer User" : "New Explorer"),
      email: form.email.trim() || "admin@exploretn.com",
      avatar: isAdminCreds ? "AD" : (form.fullName || form.email || "EX").slice(0, 2).toUpperCase(),
      role: assignedRole,
      status: "active",
      rank: isAdminCreds ? "Super Admin" : "Verified Explorer",
      districtCount: isAdminCreds ? 38 : 1,
    };

    setAuthSession(createdUser);

    setTimeout(() => {
      setAuthStep("authorized");
    }, 1000);

    setTimeout(() => {
      const redirectUrl = getAuthorizedRedirectRoute(createdUser.role);
      window.location.href = redirectUrl;
    }, 1800);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-md px-4 pt-32 pb-20 sm:pt-36 font-sans">
        <div className="bg-[#121821] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white relative overflow-hidden">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex size-14 place-items-center rounded-2xl bg-emerald-500 text-black font-black shadow-lg shadow-emerald-500/20 mb-3">
              <Compass className="size-8 text-black" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Explorer<span className="text-gradient">TN</span> Gateway
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Authentication & Admin Access Portal
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-white/5 border border-white/10 rounded-2xl mb-6 font-mono text-xs">
            <button
              onClick={() => setAuthMode("signin")}
              className={`py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === "signin" ? "bg-emerald-500 text-black shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <Lock className="size-3.5" /> Sign In
            </button>
            <button
              onClick={() => setAuthMode("signup")}
              className={`py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === "signup" ? "bg-emerald-500 text-black shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <UserPlus className="size-3.5" /> Create Account
            </button>
          </div>

          <AnimatePresence mode="wait">
            {authStep === "idle" && (
              <motion.div
                key={authMode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 text-xs font-sans"
              >
                {/* Google SSO Button */}
                <Button
                  onClick={handleAuthSubmit}
                  size="lg"
                  className="w-full rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold py-6 text-sm shadow-xl transition flex items-center justify-center gap-3 cursor-pointer"
                >
                  <GoogleLogoSVG /> Continue with Google
                </Button>

                <div className="flex items-center my-3">
                  <div className="w-full border-t border-white/15" />
                  <span className="px-3 text-[10px] font-mono text-slate-400 uppercase shrink-0">OR WITH EMAIL & PASSWORD</span>
                  <div className="w-full border-t border-white/15" />
                </div>

                {authMode === "signup" && (
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 size-4 text-slate-400" />
                      <input
                        type="text"
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        placeholder="e.g. Tamil Selvan"
                        className="w-full bg-[#0B0F14] border border-white/15 rounded-xl pl-10 pr-3 py-2.5 text-white focus:outline-none focus:border-emerald-400 font-medium"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 size-4 text-slate-400" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="admin@exploretn.com"
                      className="w-full bg-[#0B0F14] border border-white/15 rounded-xl pl-10 pr-3 py-2.5 text-white focus:outline-none focus:border-emerald-400 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Password</label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-3 size-4 text-slate-400" />
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="popz"
                      className="w-full bg-[#0B0F14] border border-white/15 rounded-xl pl-10 pr-3 py-2.5 text-white focus:outline-none focus:border-emerald-400 font-medium"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAuthSubmit}
                  size="lg"
                  className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-black font-black py-5 text-xs shadow-lg shadow-emerald-500/20 mt-2 cursor-pointer"
                >
                  {authMode === "signup" ? (
                    <>
                      <UserPlus className="size-4 mr-1.5" /> Create Account →
                    </>
                  ) : (
                    <>
                      <Lock className="size-4 mr-1.5" /> Sign In →
                    </>
                  )}
                </Button>

                {/* Admin Access Hint Badge */}
                <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-[11px] font-mono text-emerald-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
                    <span>Admin Credential Configured</span>
                  </div>
                  <span className="font-bold text-white">popz</span>
                </div>
              </motion.div>
            )}

            {authStep !== "idle" && (
              <motion.div
                key="authenticating-flow"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center space-y-4 font-sans"
              >
                <div className="relative inline-flex size-16 place-items-center rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                  <UserCheck className="size-8 animate-bounce text-emerald-400" />
                  <span className="absolute -inset-2 rounded-full border-2 border-emerald-400/40 animate-ping" />
                </div>

                <div>
                  <h3 className="text-lg font-black text-white">
                    {form.email.toLowerCase().includes("admin") ? "Super Admin Access Granted!" : "Welcome Back!"}
                  </h3>
                  <p className="text-xs text-emerald-400 font-mono mt-1">
                    Authenticating {form.email}
                  </p>
                </div>

                <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl text-xs font-mono text-slate-300">
                  {authStep === "authenticating" && "Verifying credentials & granting Super Admin privileges..."}
                  {authStep === "authorized" && "Redirecting to /ops Operations Command Center..."}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  );
}
