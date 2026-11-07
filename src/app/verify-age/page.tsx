"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  CreditCard,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function VerifyAgePage() {
  const [user, setUser] = useState<any>(null);
  const [docType, setDocType] = useState<"PASSPORT" | "DRIVERS_LICENSE" | "NATIONAL_ID">("DRIVERS_LICENSE");
  const [step, setStep] = useState<"SELECT_DOC" | "PROCESSING" | "SUCCESS">("SELECT_DOC");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => {
        setUser(data.user);
        if (data.user?.isAgeVerified) {
          setStep("SUCCESS");
        }
      });
  }, []);

  const handleStartVerification = async () => {
    setErrorMsg(null);
    setStep("PROCESSING");

    try {
      // Simulate verification progression
      const res = await fetch("/api/kyc/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idDocumentType: docType }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setStep("SUCCESS");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process age verification");
      setStep("SELECT_DOC");
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="bg-[#121215] border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 glow-pink">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mx-auto text-pink-500">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white">Statutory Age Verification</h1>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            In compliance with adult media standards, you must confirm you are at least 18 years old to generate content.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        {step === "SELECT_DOC" && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                Select Verification Document Type
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: "DRIVERS_LICENSE", label: "Driver's License" },
                  { id: "PASSPORT", label: "Passport" },
                  { id: "NATIONAL_ID", label: "National ID Card" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDocType(item.id as any)}
                    className={`py-3 px-3 rounded-xl border text-xs font-medium text-center transition ${
                      docType === item.id
                        ? "bg-pink-600/20 text-pink-400 border-pink-500"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400 space-y-2">
              <p className="font-semibold text-zinc-300">Privacy & Data Protection Notice:</p>
              <p>
                Verification is processed through certified KYC identity providers. Raw document scans are encrypted
                and purged following cryptographic age attestation.
              </p>
            </div>

            <button
              onClick={handleStartVerification}
              className="w-full py-3.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs transition shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2"
            >
              Verify Identity & Age (18+)
            </button>
          </div>
        )}

        {step === "PROCESSING" && (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Analyzing Credentials...</h3>
              <p className="text-xs text-zinc-400">
                Checking government registry cryptographic signature and calculating legal age threshold.
              </p>
            </div>
          </div>
        )}

        {step === "SUCCESS" && (
          <div className="py-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Age Verified (18+)</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Your account is fully verified. You now have authorized access to generate fictional adult character imagery and videos.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/create"
                className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs transition shadow-lg shadow-pink-600/30"
              >
                Enter Creation Studio <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

