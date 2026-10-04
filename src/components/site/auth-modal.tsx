import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { Compass, X, Mail, Lock, User, ArrowRight, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase-client";
import { setAuthSession, UserProfile } from "@/lib/auth-rbac";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  promptMessage?: string;
}

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

export function AuthModal({ isOpen, onClose, onSuccess, promptMessage }: AuthModalProps) {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "forgot_password" | "email_verification">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    otpCode: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email) {
      setError("Please enter your email address.");
      return;
    }

    if (authMode !== "forgot_password" && authMode !== "email_verification" && !form.password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Handle Forgot Password flow
    if (authMode === "forgot_password") {
      try {
        const { error: resetErr } = await supabase.auth.resetPasswordForEmail(form.email.trim());
        if (resetErr && !resetErr.message.includes("fetch")) {
          console.warn("[AuthModal] Reset password warning:", resetErr.message);
        }
        setSuccessMessage(`Password reset link has been sent to ${form.email}. Please check your inbox.`);
        setLoading(false);
        return;
      } catch (err: any) {
        setLoading(false);
        setError(err?.message || "Failed to send reset email. Please try again.");
        return;
      }
    }

    // Handle Email Verification OTP or Link flow
    if (authMode === "email_verification") {
      // First check if user is already confirmed via email link
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          const u = sessionData.session.user;
          const verifiedName = form.fullName.trim() || u.user_metadata?.full_name || u.email?.split("@")[0] || "Explorer User";
          const verifiedUser: UserProfile = {
            id: u.id,
            name: verifiedName,
            email: u.email || form.email.trim(),
            avatar: verifiedName.slice(0, 2).toUpperCase(),
            role: "explorer",
            status: "active",
            rank: "Verified Explorer",
            districtCount: 1,
          };
          await fetch("/api/v1/user/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user: verifiedUser, isSignUp: true }),
          }).catch(() => null);
          setAuthSession(verifiedUser);
          setLoading(false);
          onClose();
          navigate({ to: "/onboarding" });
          return;
        }
      } catch (checkErr) {
        console.warn("[AuthModal] Session check:", checkErr);
      }

      if (!form.otpCode || form.otpCode.trim().length < 4) {
        setError("Please check your email and click the 'Confirm email address' link, or enter the 6-digit verification code below.");
        setLoading(false);
        return;
      }

      try {
        const { data: verifyData, error: verifyErr } = await supabase.auth.verifyOtp({
          email: form.email.trim(),
          token: form.otpCode.trim(),
          type: "signup",
        });

        if (verifyErr) {
          setError(verifyErr.message || "Invalid or expired verification code. You can also click the link sent to your email.");
          setLoading(false);
          return;
        }

        const verifiedUserId = verifyData?.user?.id || `usr-${Date.now()}`;
        const verifiedName = form.fullName.trim() || form.email.split("@")[0] || "Explorer User";
        const verifiedEmail = form.email.trim();

        const verifiedUser: UserProfile = {
          id: verifiedUserId,
          name: verifiedName,
          email: verifiedEmail,
          avatar: verifiedName.slice(0, 2).toUpperCase(),
          role: "explorer",
          status: "active",
          rank: "Verified Explorer",
          districtCount: 1,
        };

        await fetch("/api/v1/user/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: verifiedUser,
            isSignUp: true,
          }),
        }).catch(() => null);

        setAuthSession(verifiedUser);
        setLoading(false);
        onClose();
        navigate({ to: "/onboarding" });
        return;
      } catch (err: any) {
        setLoading(false);
        setError(err?.message || "Email verification failed.");
        return;
      }
    }

    try {
      let userId = `usr-${Date.now()}`;
      let name = form.fullName.trim() || form.email.split("@")[0] || "Explorer User";
      let email = form.email.trim();

      // Try Supabase Auth authentication if available
      try {
        if (authMode === "signup") {
          const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/login` : undefined;
          const { data, error: sbErr } = await supabase.auth.signUp({
            email,
            password: form.password,
            options: {
              data: { full_name: name },
              emailRedirectTo: redirectTo,
            }
          });
          if (sbErr) {
            setError(sbErr.message || "Failed to create account. Please try again.");
            setLoading(false);
            return;
          }
          if (data?.user) userId = data.user.id;

          // Transition to verification step
          setAuthMode("email_verification");
          setSuccessMessage(`Account created for ${email}! Click the "Confirm email address" link in your email to activate your account.`);
          setLoading(false);
          return;
        } else {
          const { data, error: sbErr } = await supabase.auth.signInWithPassword({
            email,
            password: form.password,
          });
          if (sbErr) {
            // Check if email actually exists in the database
            try {
              const checkRes = await fetch(`/api/v1/user/sync?email=${encodeURIComponent(email)}`);
              const checkData = await checkRes.json().catch(() => ({}));
              if (checkRes.ok && checkData.emailFound) {
                // Email is in database -> wrong password!
                setError("Password was wrong. Please check your password or click Forgot Password to reset it.");
              } else {
                // Email is NOT in database -> switch to Create Account / Register!
                setAuthMode("signup");
                setError(null);
                setSuccessMessage("New to ExplorerTN? Register your account in ExplorerTN — Discover Tamil Nadu's hidden trails, pristine hill stations, and living heritage.");
              }
            } catch {
              setError("Password was wrong or credentials are invalid. Please try again.");
            }
            setLoading(false);
            return;
          }
          if (data?.user) {
            userId = data.user.id;
            if (data.user.user_metadata?.full_name) {
              name = data.user.user_metadata.full_name;
            }
          }
        }
      } catch (err: any) {
        // Fallback check if email exists in database
        try {
          const checkRes = await fetch(`/api/v1/user/sync?email=${encodeURIComponent(email)}`);
          const checkData = await checkRes.json().catch(() => ({}));
          if (checkRes.ok && checkData.emailFound) {
            setError("Password was wrong. Please try again or use Forgot Password.");
          } else {
            setAuthMode("signup");
            setError(null);
            setSuccessMessage("New to ExplorerTN? Register your account in ExplorerTN — Discover Tamil Nadu's hidden trails, pristine hill stations, and living heritage.");
          }
        } catch {
          setError(err?.message || "Invalid credentials. Please try again.");
        }
        setLoading(false);
        return;
      }

      const assignedRole = email.endsWith("@explorertn.com") ? "super_admin" : "explorer";

      const authenticatedUser: UserProfile = {
        id: userId,
        name: name,
        email: email,
        avatar: name.slice(0, 2).toUpperCase(),
        role: assignedRole as any,
        status: "active",
        rank: assignedRole === "super_admin" ? "Super Admin" : "Verified Explorer",
        districtCount: assignedRole === "super_admin" ? 38 : 1,
      };

      let isProfileComplete = assignedRole === "super_admin";
      // Sync user to Supabase and check if user exists on normal sign in
      try {
        const syncRes = await fetch("/api/v1/user/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: authenticatedUser,
            isSignUp: authMode === "signup"
          })
        });

        if (syncRes.status === 404 && authMode === "signin") {
          const data = await syncRes.json().catch(() => ({}));
          const alertMsg = data.message || "user not found";
          setError(alertMsg);
          setLoading(false);
          return;
        }

        if (syncRes.ok) {
          const syncData = await syncRes.json().catch(() => ({}));
          if (syncData.profileComplete !== undefined) {
            isProfileComplete = syncData.profileComplete;
          }
        }
      } catch (syncErr) {
        console.warn("[AuthModal] Sync attempt notice:", syncErr);
      }

      setAuthSession(authenticatedUser);
      setLoading(false);
      onClose();

      if (!isProfileComplete && assignedRole !== "super_admin") {
        navigate({ to: "/onboarding" });
      } else if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || "Authentication failed. Please check credentials.");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { triggerGoogleSignIn } = await import("@/lib/google-auth");
      const user = await triggerGoogleSignIn();
      if (user) {
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setError(err?.message || "Google sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-md bg-[#121821] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white overflow-hidden"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="size-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex size-12 place-items-center rounded-2xl bg-emerald-500 text-black font-black shadow-lg shadow-emerald-500/20 mb-3">
              <Compass className="size-6 text-black" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              {authMode === "signin" ? "Sign in to ExplorerTN" : "Create Explorer Account"}
            </h2>
            <p className="mt-1.5 text-xs text-slate-300 font-sans leading-relaxed">
              {promptMessage || "Save places, build personal trips, and unlock trails across Tamil Nadu."}
            </p>
          </div>

          {/* Google Auth CTA */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full h-11 flex items-center justify-center gap-3 rounded-2xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition shadow-md cursor-pointer mb-4"
          >
            <GoogleLogoSVG />
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#121821] px-3 text-[11px] font-mono text-slate-400 uppercase shrink-0">
              or continue with email
            </span>
          </div>

          {/* Mode Switcher Tabs */}
          {authMode !== "forgot_password" ? (
            <div className="grid grid-cols-2 p-1 bg-white/5 border border-white/10 rounded-2xl mb-5 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setAuthMode("signin"); setError(null); setSuccessMessage(null); }}
                className={`py-2 rounded-xl transition cursor-pointer ${authMode === "signin" ? "bg-emerald-500 text-black shadow-md font-black" : "text-slate-400 hover:text-white"}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode("signup"); setError(null); setSuccessMessage(null); }}
                className={`py-2 rounded-xl transition cursor-pointer ${authMode === "signup" ? "bg-emerald-500 text-black shadow-md font-black" : "text-slate-400 hover:text-white"}`}
              >
                New Account
              </button>
            </div>
          ) : (
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-5 text-center">
              <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider">Account Password Recovery</h3>
              <p className="text-[11px] text-slate-300 mt-0.5">Enter your email and we'll send you a password reset link.</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authMode === "signup" && (
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Full Name</label>
                <div className="relative mt-1">
                  <User className="absolute left-3.5 top-2.5 size-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Santhosh Kumar"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full h-10 pl-10 pr-4 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Email Address</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3.5 top-2.5 size-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="explorer@domain.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full h-10 pl-10 pr-4 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {authMode === "email_verification" && (
              <div className="space-y-3">
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-left space-y-1.5">
                  <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 shrink-0" />
                    Confirmation sent to {form.email}
                  </p>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Check your email and click <strong className="text-white">"Confirm email address"</strong> to instantly activate your account.
                  </p>
                  <p className="text-[10px] text-slate-400">
                    If you received a 6-digit verification code instead, you can also enter it below:
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Verification Code (Optional)</label>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/login` : undefined;
                          await supabase.auth.resend({
                            type: "signup",
                            email: form.email.trim(),
                            options: { emailRedirectTo: redirectTo }
                          });
                          setSuccessMessage(`New confirmation email dispatched to ${form.email}.`);
                        } catch {
                          setError("Failed to resend confirmation email. Please wait a moment.");
                        }
                      }}
                      className="text-[10px] font-mono text-emerald-400 hover:underline cursor-pointer"
                    >
                      Resend Email ↻
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={form.otpCode}
                    onChange={(e) => setForm({ ...form, otpCode: e.target.value })}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl text-center font-mono text-lg tracking-[0.4em] text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 mt-1"
                  />
                </div>
              </div>
            )}

            {authMode !== "forgot_password" && authMode !== "email_verification" && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Password</label>
                  <button
                    type="button"
                    onClick={() => { setAuthMode("forgot_password"); setError(null); setSuccessMessage(null); }}
                    className="text-[10px] font-mono text-emerald-400 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 size-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full h-10 pl-10 pr-4 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-medium">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-medium flex items-start gap-2">
                <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-2xl shadow-lg shadow-emerald-500/20 cursor-pointer mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : authMode === "forgot_password" ? (
                <>
                  <span>Send Password Reset Link</span>
                  <ArrowRight className="size-4" />
                </>
              ) : authMode === "email_verification" ? (
                <>
                  <span>Verify Email & Complete Registration</span>
                  <CheckCircle2 className="size-4" />
                </>
              ) : (
                <>
                  <span>{authMode === "signin" ? "Sign In & Continue" : "Create Account & Verify Email"}</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>

          {/* Footer note */}
          <div className="mt-5 text-center text-[11px] text-slate-400 font-mono">
            {authMode === "forgot_password" ? (
              <p>
                Remembered your password?{" "}
                <button
                  type="button"
                  onClick={() => { setAuthMode("signin"); setError(null); setSuccessMessage(null); }}
                  className="text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            ) : authMode === "signin" ? (
              <div className="space-y-1">
                <p>
                  New to ExplorerTN?{" "}
                  <button
                    type="button"
                    onClick={() => { setAuthMode("signup"); setError(null); setSuccessMessage(null); }}
                    className="text-emerald-400 font-bold hover:underline cursor-pointer"
                  >
                    Create account
                  </button>
                </p>
                <p>
                  Forgot your credentials?{" "}
                  <button
                    type="button"
                    onClick={() => { setAuthMode("forgot_password"); setError(null); setSuccessMessage(null); }}
                    className="text-amber-400 font-bold hover:underline cursor-pointer"
                  >
                    Reset password
                  </button>
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => { setAuthMode("signin"); setError(null); setSuccessMessage(null); }}
                    className="text-emerald-400 font-bold hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </p>
                <p>
                  Forgot password?{" "}
                  <button
                    type="button"
                    onClick={() => { setAuthMode("forgot_password"); setError(null); setSuccessMessage(null); }}
                    className="text-amber-400 font-bold hover:underline cursor-pointer"
                  >
                    Recover account
                  </button>
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
