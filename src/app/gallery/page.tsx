"use client";

import { useEffect, useState } from "react";
import {
  Image as ImageIcon,
  Heart,
  Trash2,
  Download,
  RotateCcw,
  Flag,
  Filter,
  Film,
  Lock,
  CheckCircle2,
  AlertTriangle,
  FolderPlus,
  Folder,
} from "lucide-react";
import Link from "next/link";

interface GenerationItem {
  id: string;
  type: string;
  prompt: string;
  negativePrompt?: string;
  stylePreset: string;
  aspectRatio: string;
  seed: number;
  isFavorite: boolean;
  collectionName: string;
  createdAt: string;
  character?: {
    id: string;
    name: string;
    apparentAge: number;
  };
  assets: Array<{
    id: string;
    url: string;
    mimeType: string;
    width: number;
    height: number;
    duration?: number;
  }>;
}

export default function GalleryPage() {
  const [generations, setGenerations] = useState<GenerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedCollection, setSelectedCollection] = useState<string>("ALL");

  // Inspection modal
  const [activeItem, setActiveItem] = useState<GenerationItem | null>(null);

  // Reporting modal
  const [reportingItem, setReportingItem] = useState<GenerationItem | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);

  // Collection modal
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [targetCollection, setTargetCollection] = useState("");

  const handleMoveCollection = async (newCollection: string) => {
    if (!activeItem || !newCollection.trim()) return;
    try {
      const res = await fetch(`/api/generations/${activeItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionName: newCollection.trim() }),
      });
      if (res.ok) {
        setGenerations((prev) =>
          prev.map((g) => (g.id === activeItem.id ? { ...g, collectionName: newCollection.trim() } : g))
        );
        setActiveItem((prev: any) => ({ ...prev, collectionName: newCollection.trim() }));
        setShowCollectionModal(false);
      }
    } catch {
      //
    }
  };

  const fetchGenerations = async () => {
    try {
      const url = new URL("/api/generations", window.location.origin);
      if (favoriteOnly) url.searchParams.set("favoriteOnly", "true");
      if (selectedType !== "ALL") url.searchParams.set("type", selectedType);
      if (selectedCollection !== "ALL") url.searchParams.set("collection", selectedCollection);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setGenerations(data.generations || []);
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenerations();
  }, [favoriteOnly, selectedType, selectedCollection]);

  const handleToggleFavorite = async (id: string, currentFav: boolean) => {
    try {
      const res = await fetch(`/api/generations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !currentFav }),
      });
      if (res.ok) {
        setGenerations((prev) =>
          prev.map((g) => (g.id === id ? { ...g, isFavorite: !currentFav } : g))
        );
        if (activeItem?.id === id) {
          setActiveItem((prev: any) => ({ ...prev, isFavorite: !currentFav }));
        }
      }
    } catch {
      //
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this generation?")) return;
    try {
      const res = await fetch(`/api/generations/${id}`, { method: "DELETE" });
      if (res.ok) {
        setGenerations((prev) => prev.filter((g) => g.id !== id));
        if (activeItem?.id === id) setActiveItem(null);
      }
    } catch {
      //
    }
  };

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingItem) return;

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationId: reportingItem.id,
          reason: reportReason,
        }),
      });

      if (res.ok) {
        setReportSuccess(true);
        setTimeout(() => {
          setReportingItem(null);
          setReportSuccess(false);
          setReportReason("");
        }, 2000);
      }
    } catch {
      //
    }
  };

  const collections = Array.from(new Set(generations.map((g) => g.collectionName))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
            <ImageIcon className="w-7 h-7 text-pink-500" /> Private Gallery
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-pink-400" /> Private by default: only visible to you.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Favorite filter */}
          <button
            onClick={() => setFavoriteOnly(!favoriteOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
              favoriteOnly
                ? "bg-pink-600/20 text-pink-400 border-pink-500"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${favoriteOnly ? "fill-pink-500" : ""}`} />
            Favorites
          </button>

          {/* Type filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-pink-500"
          >
            <option value="ALL">All Media</option>
            <option value="IMAGE">Images Only</option>
            <option value="VIDEO">Videos Only</option>
          </select>

          {/* Collection filter */}
          {collections.length > 0 && (
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-pink-500"
            >
              <option value="ALL">All Collections</option>
              {collections.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="aspect-square bg-zinc-900/60 rounded-2xl border border-zinc-800" />
          ))}
        </div>
      ) : generations.length === 0 ? (
        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-12 text-center space-y-4">
          <ImageIcon className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">Your Gallery is Empty</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            You haven&apos;t generated any fictional character media yet. Visit the Studio to begin.
          </p>
          <Link
            href="/create"
            className="py-2.5 px-5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold inline-flex items-center gap-2 transition"
          >
            Go to Creation Studio &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {generations.map((g) => {
            const firstAsset = g.assets?.[0];
            return (
              <div
                key={g.id}
                onClick={() => setActiveItem(g)}
                className="group relative rounded-2xl overflow-hidden bg-black border border-zinc-800/80 hover:border-pink-500/40 aspect-square cursor-pointer transition duration-300"
              >
                {g.type === "VIDEO" || firstAsset?.mimeType?.includes("video") ? (
                  <video
                    src={firstAsset?.url}
                    muted
                    loop
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <img
                    src={firstAsset?.url}
                    alt={g.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                )}

                {/* Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                  {g.type === "VIDEO" && (
                    <span className="p-1 rounded-md bg-black/70 backdrop-blur-md text-pink-400">
                      <Film className="w-3.5 h-3.5" />
                    </span>
                  )}
                  {g.character && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white">
                      {g.character.name}
                    </span>
                  )}
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-200 flex flex-col justify-end p-3">
                  <p className="text-xs text-white truncate font-medium">{g.prompt}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-zinc-400 capitalize">{g.stylePreset}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(g.id, g.isFavorite);
                      }}
                      className="p-1 text-white hover:text-pink-400 transition"
                    >
                      <Heart
                        className={`w-4 h-4 ${g.isFavorite ? "fill-pink-500 text-pink-500" : ""}`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Item Inspection Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto">
          <div className="max-w-4xl w-full bg-[#121215] border border-zinc-800 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 shadow-2xl my-8">
            {/* Visual media preview */}
            <div className="md:col-span-7 bg-black flex items-center justify-center p-4">
              {activeItem.type === "VIDEO" || activeItem.assets[0]?.mimeType?.includes("video") ? (
                <video
                  src={activeItem.assets[0]?.url}
                  controls
                  autoPlay
                  loop
                  className="max-h-[500px] w-auto rounded-xl object-contain"
                />
              ) : (
                <img
                  src={activeItem.assets[0]?.url}
                  alt={activeItem.prompt}
                  className="max-h-[500px] w-auto rounded-xl object-contain"
                />
              )}
            </div>

            {/* Metadata & Controls */}
            <div className="md:col-span-5 p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-pink-400">
                    Generation Details
                  </span>
                  <button
                    onClick={() => setActiveItem(null)}
                    className="text-zinc-400 hover:text-white text-sm"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase">Prompt</label>
                  <p className="text-xs text-zinc-200 leading-relaxed bg-zinc-900/80 p-3 rounded-xl border border-zinc-800/80">
                    {activeItem.prompt}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-300">
                  <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                    <span className="text-zinc-400 block text-[10px]">Seed:</span>
                    <span className="font-mono text-pink-400">{activeItem.seed}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                    <span className="text-zinc-400 block text-[10px]">Ratio:</span>
                    <span>{activeItem.aspectRatio}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                    <span className="text-zinc-400 block text-[10px]">Style Preset:</span>
                    <span className="capitalize">{activeItem.stylePreset}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                    <span className="text-zinc-400 block text-[10px]">Type:</span>
                    <span>{activeItem.type}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t border-zinc-800">
                <div className="flex gap-2">
                  <Link
                    href={`/create?prompt=${encodeURIComponent(activeItem.prompt)}&seed=${activeItem.seed}&style=${activeItem.stylePreset}`}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Re-run in Studio
                  </Link>

                  <a
                    href={activeItem.assets[0]?.url}
                    download={`nudy_${activeItem.id}.jpg`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white transition"
                    title="Download Asset"
                  >
                    <Download className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => handleToggleFavorite(activeItem.id, activeItem.isFavorite)}
                    className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white transition"
                    title="Favorite"
                  >
                    <Heart
                      className={`w-4 h-4 ${activeItem.isFavorite ? "fill-pink-500 text-pink-500" : ""}`}
                    />
                  </button>

                  <button
                    onClick={() => {
                      setTargetCollection(activeItem.collectionName || "Default");
                      setShowCollectionModal(true);
                    }}
                    className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white transition flex items-center gap-1 text-xs"
                    title="Organize Collection"
                  >
                    <Folder className="w-4 h-4 text-pink-400" />
                  </button>
                </div>

                {/* Collection Tag */}
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 pt-1">
                  <Folder className="w-3.5 h-3.5 text-pink-500" />
                  <span>Collection: <strong className="text-zinc-200">{activeItem.collectionName || "Default"}</strong></span>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    onClick={() => setReportingItem(activeItem)}
                    className="text-zinc-500 hover:text-amber-400 flex items-center gap-1 transition"
                  >
                    <Flag className="w-3.5 h-3.5" /> Report Content
                  </button>
                  <button
                    onClick={() => handleDelete(activeItem.id)}
                    className="text-zinc-500 hover:text-red-400 flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Generation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Organize Collection Modal */}
      {showCollectionModal && activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="max-w-sm w-full bg-[#121215] border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-pink-500" /> Organize Collection
              </h3>
              <button
                onClick={() => setShowCollectionModal(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs text-zinc-400 block">
                Assign to collection or type a new one:
              </label>

              <input
                type="text"
                value={targetCollection}
                onChange={(e) => setTargetCollection(e.target.value)}
                placeholder="e.g. Cyberpunk, Portraits, Videos..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
              />

              {collections.length > 0 && (
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1.5">
                    Existing Collections:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {collections.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setTargetCollection(c)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                          targetCollection === c
                            ? "bg-pink-600/20 text-pink-400 border-pink-500"
                            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCollectionModal(false)}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveCollection(targetCollection)}
                  className="px-4 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs transition"
                >
                  Save Collection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Moderation Report Modal */}
      {reportingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="max-w-md w-full bg-[#121215] border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flag className="w-4 h-4 text-amber-500" /> Report Content Violation
              </h3>
              <button
                onClick={() => setReportingItem(null)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center text-xs space-y-1">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-1" />
                <p className="font-semibold text-white">Report Logged</p>
                <p>The compliance team will review this item within our moderation queue.</p>
              </div>
            ) : (
              <form onSubmit={handleSendReport} className="space-y-4">
                <p className="text-xs text-zinc-400">
                  Please specify the reason this output or prompt violates our Content Policy.
                </p>

                <select
                  required
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                >
                  <option value="">Select violation reason...</option>
                  <option value="POTENTIAL_UNDERAGE_APPEARANCE">Appearance resembles minor</option>
                  <option value="REAL_PERSON_LIKENESS">Real person / celebrity depiction</option>
                  <option value="NON_CONSENSUAL_THEME">Non-consensual depiction</option>
                  <option value="EXTREME_VIOLENCE">Extreme violence or gore</option>
                  <option value="OTHER_LEGAL_ISSUE">Other legal / safety concern</option>
                </select>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportingItem(null)}
                    className="px-4 py-2 text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

