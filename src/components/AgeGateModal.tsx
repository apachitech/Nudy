"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, AlertTriangle, ExternalLink } from "lucide-react";

export function AgeGateModal() {
  const [hasConfirmed, setHasConfirmed] = useState<boolean | null>(null);

  useEffect(() => {
    const confirmed = localStorage.getItem("nudy_age_confirmed");
    setHasConfirmed(confirmed === "true");
  }, []);

  if (hasConfirmed === null || hasConfirmed === true) {
    return null;
  }

  const handleConfirm = () => {
    localStorage.setItem("nudy_age_confirmed", "true");
    setHasConfirmed(true);
  };

  const handleExit = () => {
    window.location.href = "https://www.google.com";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl">
      <div className="max-w-lg w-full bg-[#121215] border border-pink-500/30 rounded-2xl p-6 sm:p-8 text-center shadow-2xl relative glow-pink">
        <div className="w-16 h-16 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center mx-auto mb-5 text-pink-500">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="inline-block px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold tracking-wider uppercase mb-3">
          18+ Adult Fictional Content Only
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
          Age Verification Required
        </h2>

        <p className="text-zinc-400 text-sm leading-relaxed mb-6">
          This platform contains artificial intelligence generation tools intended strictly
          for adults (aged 18 and older, or 21 where required by local law). All characters
          depicted are purely fictional adults.
        </p>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-left text-xs text-zinc-400 mb-6 space-y-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              Zero-tolerance: Depictions of minors, non-consensual acts, or real persons are strictly prohibited and monitored.
            </span>
          </div>
          <p>
            By entering, you confirm you are of legal adult age in your jurisdiction and agree to our{" "}
            <a href="/legal/terms" className="text-pink-400 underline" target="_blank">
              Terms
            </a>{" "}
            and{" "}
            <a href="/legal/content-policy" className="text-pink-400 underline" target="_blank">
              Content Policy
            </a>
            .
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-6 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-medium transition duration-200 shadow-lg shadow-pink-600/30 text-sm"
          >
            I am 18 or Older &mdash; Enter
          </button>
          <button
            onClick={handleExit}
            className="flex-1 py-3 px-6 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition duration-200 text-sm"
          >
            I am Under 18 &mdash; Exit
          </button>
        </div>
      </div>
    </div>
  );
}
