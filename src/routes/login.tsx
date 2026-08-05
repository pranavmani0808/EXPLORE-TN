import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Sparkles, Compass, CheckCircle2, ArrowRight, Lock, UserCheck } from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import { MOCK_USERS, UserRole, getAuthorizedRedirectRoute } from "@/lib/auth-rbac";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "ExplorerTN Auth — Role-Based Gateway Login" },
      {
        name: "description",
        content: "Automated RBAC Supabase Authentication Gateway. Login routes users automatically to assigned workspace.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>("super_admin");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStep, setAuthStep] = useState<"idle" | "authenticating" | "fetching_role" | "authorized">("idle");

  const selectedUser = MOCK_USERS[selectedRoleKey] || MOCK_USERS.super_admin;

  const handleLogin = () => {
    setIsAuthenticating(true);
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
              Explorer<span className="text-gradient">TN</span> Authentication
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Automated Supabase RBAC Gateway
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
                {/* Role Switcher Demo Selector */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-slate-300 mb-2">
                    Select Account Profile (RBAC Test Demo)
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

                {/* Submit Sign In Button */}
                <Button
                  onClick={handleLogin}
                  size="lg"
                  className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-black font-black py-6 text-sm shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2 mt-2"
                >
                  <Lock className="size-4" /> Sign In with Supabase OAuth <ArrowRight className="size-4" />
                </Button>
              </motion.div>
            )}

            {authStep !== "idle" && (
              <motion.div
                key="authenticating-flow"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center space-y-4"
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

                <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-mono text-slate-300">
                  {authStep === "authenticating" && "Authenticating token with Supabase Auth..."}
                  {authStep === "fetching_role" && "Checking RBAC permission matrix..."}
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
