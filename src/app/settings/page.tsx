"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  ShieldCheck,
  ShieldAlert,
  Download,
  Trash2,
  Lock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Loader2,
  LogIn,
} from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Auth form state if logged out
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // KYC Verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [kycSuccess, setKycSuccess] = useState<string | null>(null);

  // Deletion confirm
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/signup";
    const body: any = { email, password };
    if (authMode === "signup") {
      body.name = name;
      body.confirmAge = true;
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      setUser(data.user);
      setToastMsg(`Welcome, ${data.user.name || data.user.email}!`);
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleKycVerify = async () => {
    setIsVerifying(true);
    setKycSuccess(null);

    try {
      const res = await fetch("/api/kyc/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idDocumentType: "DRIVERS_LICENSE" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setKycSuccess(data.message);
      setUser((prev: any) => ({ ...prev, isAgeVerified: true }));
      setToastMsg("Age & Identity successfully verified (18+)!");
    } catch (err: any) {
      alert("Verification error: " + err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleExportData = () => {
    window.open("/api/user/export", "_blank");
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== "DELETE MY ACCOUNT") {
      alert("Please type 'DELETE MY ACCOUNT' to confirm.");
      return;
    }

    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      if (res.ok) {
        alert("Your account and all associated assets have been permanently deleted.");
        window.location.href = "/";
      }
    } catch {
      alert("Failed to delete account");
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-zinc-400">Loading settings...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-pink-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5" />
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-pink-500" /> Account & Compliance Settings
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Manage your account credentials, age verification status, data exports, and privacy controls.
        </p>
      </div>

      {/* If Logged Out: Authentication Portal */}
      {!user ? (
        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 sm:p-8 max-w-md mx-auto space-y-6 glow-pink">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-white">
              {authMode === "login" ? "Sign In to Nudy" : "Create 18+ Account"}
            </h2>
            <p className="text-xs text-zinc-400">
              {authMode === "login"
                ? "Enter your credentials to access your private studio"
                : "Register with adult age confirmation"}
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Veronica"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            {authMode === "signup" && (
              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                <span className="text-white font-semibold block">Statutory 18+ Requirement:</span>
                <p>By creating an account, you legally affirm you are 18 years of age or older.</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs transition shadow-lg shadow-pink-600/30"
            >
              {authMode === "login" ? "Sign In" : "Register Account"}
            </button>
          </form>

          <div className="text-center text-xs text-zinc-400">
            {authMode === "login" ? (
              <p>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => setAuthMode("signup")}
                  className="text-pink-400 font-semibold hover:underline"
                >
                  Create one
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  onClick={() => setAuthMode("login")}
                  className="text-pink-400 font-semibold hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Account Profile Card */}
          <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">{user.name || "Authenticated User"}</h2>
              <p className="text-xs text-zinc-400">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-medium">
                  Role: {user.role}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 font-medium">
                  {user.creditBalance} Credits
                </span>
              </div>
            </div>
          </div>

          {/* 18+ Identity Verification (KYC) Section */}
          <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-pink-500" /> Statutory Age Verification (KYC)
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Required by legal standards before generating any adult fictional character imagery or video.
                </p>
              </div>

              {user.isAgeVerified ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> 18+ Verified
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Verification Required
                </span>
              )}
            </div>

            {user.isAgeVerified ? (
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300">
                ✓ Your account has passed third-party identity and age verification. You are fully authorized to generate content.
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <p className="text-xs text-zinc-300">
                  Our system connects to trusted third-party verification providers (Persona, Veriff, Sumsub).
                  In this development environment, clicking the button below verifies the account via the KYC adapter stub.
                </p>

                <button
                  onClick={handleKycVerify}
                  disabled={isVerifying}
                  className="py-2.5 px-5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-pink-600/30"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying Credentials...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" /> Complete Age Verification (18+)
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* GDPR / CCPA Data Export Section */}
          <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-pink-500" /> Export Personal Data (GDPR / CCPA)
            </h3>
            <p className="text-xs text-zinc-400">
              Download a complete JSON archive of your personal profile, fictional characters, generation parameters,
              and credit ledger history.
            </p>

            <button
              onClick={handleExportData}
              className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4" /> Download My Data Archive (JSON)
            </button>
          </div>

          {/* Danger Zone: Account Deletion */}
          <div className="bg-red-950/10 border border-red-500/20 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" /> Permanent Account Deletion
            </h3>
            <p className="text-xs text-zinc-400">
              Permanently delete your user account, all fictional characters, all generated images, videos, and private storage assets.
              This action is immediate and cannot be undone.
            </p>

            {confirmDelete ? (
              <div className="space-y-3 p-4 bg-zinc-950 rounded-xl border border-red-500/30">
                <p className="text-xs text-red-300">
                  Please type <strong className="text-white">DELETE MY ACCOUNT</strong> to confirm:
                </p>
                <input
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition"
                  >
                    Confirm Permanent Erasure
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="py-2 px-4 rounded-xl bg-zinc-800 text-zinc-300 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="py-2.5 px-4 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs font-semibold transition flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete Account & Purge Data
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

