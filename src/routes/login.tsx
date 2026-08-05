import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Sparkles, Compass, CheckCircle2, ArrowRight, Lock, UserCheck } from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import { MOCK_USERS, UserRole, getAuthorizedRedirectRoute } from "@/lib/auth-rbac";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "ExplorerTN Auth — Google SSO & RBAC Gateway" },
      {
        name: "description",
        content: "Automated Google Single Sign-On (SSO) & RBAC Authentication Gateway for ExplorerTN.",
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
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>("super_admin");
  const [authStep, setAuthStep] = useState<"idle" | "authenticating" | "fetching_role" | "authorized">("idle");

  const selectedUser = MOCK_USERS[selectedRoleKey] || MOCK_USERS.super_admin;

  const handleGoogleLogin = () => {
    setAuthStep("authenticating");

    setTimeout(() => {
      setAuthStep("fetching_role");
    }, 900);

    setTimeout(() => {
      setAuthStep("authorized");
    }, 1800);

    setTimeout(() => {
      const redirectUrl = getAuthorizedRedirectRoute(selectedUser.role);
      window.location.href = redirectUrl;
    }, 2800);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-md px-4 pt-32 pb-20 sm:pt-40 font-sans">
        <div className="bg-[#121821] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white relative overflow-hidden">
          {/* Top Brand Header */}
          <div className="text-center mb-6">
            <div className="inline-flex size-14 place-items-center rounded-2xl bg-emerald-500 text-black font-black shadow-lg shadow-emerald-500/20 mb-3">
              <Compass className="size-8 text-black" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Explorer<span className="text-gradient">TN</span> Single Sign-On
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Google Workspace SSO & RBAC Gateway
            </p>
          </div>

          <AnimatePresence mode="wait">
            {authStep === "idle" && (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* PROMINENT GOOGLE SIGN IN BUTTON */}
                <Button
                  onClick={handleGoogleLogin}
                  size="lg"
                  className="w-full rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold py-6 text-sm shadow-xl transition flex items-center justify-center gap-3"
                >
                  <GoogleLogoSVG /> Sign in with Google Account
                </Button>

                <div className="flex items-center my-4">
                  <div className="w-full border-t border-white/15" />
                  <span className="px-3 text-[10px] font-mono text-slate-400 uppercase shrink-0">OR SIMULATE ROLE</span>
                  <div className="w-full border-t border-white/15" />
                </div>

                {/* Role Switcher Selector */}
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-300 mb-2">
                    Assigned Platform Role (Simulate OAuth Claim)
                  </label>
                  <div className="space-y-2">
                    {Object.entries(MOCK_USERS).map(([key, u]) => (
                      <div
                        key={key}
                        onClick={() => setSelectedRoleKey(key)}
                        className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                          selectedRoleKey === key
                            ? "bg-emerald-500/15 border-emerald-400 text-white shadow-md"
                            : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="size-8 rounded-xl bg-emerald-500 text-black font-black text-xs flex items-center justify-center">
                            {u.avatar}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-white">{u.name}</p>
                            <p className="text-[10px] text-emerald-400 font-mono capitalize">{u.role.replace("_", " ")}</p>
                          </div>
                        </div>
                        {selectedRoleKey === key && <CheckCircle2 className="size-4 text-emerald-400" />}
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleGoogleLogin}
                  variant="outline"
                  size="lg"
                  className="w-full rounded-2xl border-white/15 text-white hover:bg-white/10 font-bold text-xs py-5"
                >
                  <Lock className="size-4 mr-2 text-emerald-400" /> Continue with Role Permissions <ArrowRight className="size-4 ml-1" />
                </Button>
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
                  <h3 className="text-lg font-black text-white">Welcome back, {selectedUser.name}</h3>
                  <p className="text-xs text-emerald-400 font-mono mt-1">
                    Role Assigned: <span className="uppercase font-bold">{selectedUser.role.replace("_", " ")}</span>
                  </p>
                </div>

                <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl text-xs font-mono text-slate-300">
                  {authStep === "authenticating" && "Connecting to Google Single Sign-On (SSO)..."}
                  {authStep === "fetching_role" && "Extracting OAuth claims & RBAC permission matrix..."}
                  {authStep === "authorized" && `Redirecting to authorized workspace: ${getAuthorizedRedirectRoute(selectedUser.role)}...`}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  );
}
