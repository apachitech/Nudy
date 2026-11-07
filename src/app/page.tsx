"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Wand2,
  Users2,
  ShieldCheck,
  Flame,
  ArrowRight,
  Lock,
  Sparkles,
  Film,
  Camera,
} from "lucide-react";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  return (
    <div className="space-y-12 py-4">
      {/* 18+ Statutory Compliance Notice Bar */}
      <div className="bg-pink-950/20 border border-pink-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              Statutory 18+ Compliance & Fictional Characters Only
              <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full border border-red-500/30">
                STRICT POLICY
              </span>
            </h4>
            <p className="text-xs text-zinc-400">
              Zero tolerance for minors, real persons, or non-consensual content. All assets are private to your account.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/legal/content-policy"
            className="text-xs px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition"
          >
            Policy & Rules
          </Link>
          <Link
            href="/legal/2257"
            className="text-xs px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition"
          >
            18 U.S.C. 2257
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#18181d] to-[#101014] border border-zinc-800 p-8 sm:p-14 glow-pink">
        <div className="max-w-2xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold">
            <Flame className="w-4 h-4 fill-pink-500 text-pink-500" />
            AI Image & Video Studio for Fictional Characters
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Design characters. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-400 to-amber-300">
              Generate uncensored
            </span>{" "}
            visions.
          </h1>

          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Create persistent fictional adult characters with consistent face, body, and style conditioning.
            Render ultra-photorealistic images and dynamic motion videos in private, protected cloud storage.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/create"
              className="py-3.5 px-7 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-medium text-sm flex items-center gap-2 transition duration-200 shadow-lg shadow-pink-600/30"
            >
              <Wand2 className="w-4 h-4" /> Enter Studio
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/characters"
              className="py-3.5 px-6 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 font-medium text-sm flex items-center gap-2 border border-zinc-700/50 transition duration-200"
            >
              <Users2 className="w-4 h-4" /> Character Builder
            </Link>
          </div>
        </div>

        {/* Decorative Grid Backdrop */}
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
            <Users2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Consistent Character Profiles</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Build persistent identities with specific apparent age (21+), eye colors, hairstyle, body type, and seed
            conditioning for a recognizable look across generations.
          </p>
        </div>

        <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Film className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">High-Fidelity Image & Video</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Generate 8K-styled still imagery or convert portraits into animated videos with custom motion strength,
            cinematic lighting, and duration controls.
          </p>
        </div>

        <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">100% Private By Default</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            No public feed. Your prompts, characters, and assets are private to your user account and delivered exclusively
            over expiring pre-signed URLs.
          </p>
        </div>
      </div>
    </div>
  );
}

