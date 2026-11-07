"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

export function CookieBanner() {
  const [accepted, setAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    const isAccepted = localStorage.getItem("nudy_cookies_accepted");
    setAccepted(isAccepted === "true");
  }, []);

  if (accepted === null || accepted === true) {
    return null;
  }

  const handleAccept = () => {
    localStorage.setItem("nudy_cookies_accepted", "true");
    setAccepted(true);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-[#16161a] border border-zinc-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-start gap-3">
        <Cookie className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
        <div className="text-xs text-zinc-400 space-y-1">
          <p className="font-semibold text-zinc-200">Cookie & Privacy Consent</p>
          <p>
            We use essential cookies to maintain your authenticated session, enforce age verification,
            and manage security tokens. See our{" "}
            <Link href="/legal/privacy" className="text-pink-400 underline">
              Privacy Policy
            </Link>
            .
          </p>
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={handleAccept}
              className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-medium text-xs transition"
            >
              Accept Essential Cookies
            </button>
          </div>
        </div>
        <button
          onClick={handleAccept}
          className="text-zinc-500 hover:text-zinc-300 transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
