"use client";

import { useEffect, useState } from "react";
import {
  Wand2,
  Film,
  Sparkles,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Download,
  Heart,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface CharacterOption {
  id: string;
  name: string;
  apparentAge: number;
  gender: string;
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  bodyType: string;
  baseSeed: number;
  defaultPrompt?: string;
  negativePrompt?: string;
}

export default function CreateStudioPage() {
  const [user, setUser] = useState<any>(null);
  const [characters, setCharacters] = useState<CharacterOption[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("");

  // Generation parameters
  const [genType, setGenType] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const [prompt, setPrompt] = useState<string>(
    "Elena Vance in an upscale penthouse balcony at twilight, wearing silk corset, cinematic soft lighting, 8k resolution"
  );
  const [negativePrompt, setNegativePrompt] = useState<string>(
    "lowres, bad anatomy, deformed, blurry, cartoon"
  );
  const [stylePreset, setStylePreset] = useState<"realistic" | "anime" | "3d" | "illustration">("realistic");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16" | "4:3" | "3:4">("1:1");
  const [seed, setSeed] = useState<number>(428912);
  const [numOutputs, setNumOutputs] = useState<number>(1);

  // Video parameters
  const [videoDuration, setVideoDuration] = useState<number>(4.0);
  const [motionStrength, setMotionStrength] = useState<number>(0.65);
  const [resolution, setResolution] = useState<string>("1024x1024");

  // State & Feedback
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepDescription, setStepDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [latestGeneration, setLatestGeneration] = useState<any>(null);

  // Fetch initial profile & characters
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => setUser(data.user));

    fetch("/api/characters")
      .then((res) => (res.ok ? res.json() : { characters: [] }))
      .then((data) => {
        setCharacters(data.characters || []);
        if (data.characters && data.characters.length > 0) {
          setSelectedCharacterId(data.characters[0].id);
        }
      });
  }, []);

  // Update prompt and seed when character is picked
  const handleSelectCharacter = (charId: string) => {
    setSelectedCharacterId(charId);
    const char = characters.find((c) => c.id === charId);
    if (char) {
      setSeed(char.baseSeed);
      if (char.defaultPrompt) {
        setPrompt(`${char.name}, ${char.apparentAge}yo adult fictional character, ${char.defaultPrompt}`);
      }
      if (char.negativePrompt) {
        setNegativePrompt(char.negativePrompt);
      }
    }
  };

  const handleRandomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 900000) + 100000);
  };

  // Keyboard shortcut Ctrl+Enter / Cmd+Enter to dispatch generation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isGenerating) {
          handleGenerate();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isGenerating,
    prompt,
    negativePrompt,
    selectedCharacterId,
    genType,
    stylePreset,
    aspectRatio,
    seed,
    numOutputs,
    videoDuration,
    motionStrength,
  ]);

  const handleGenerate = async () => {
    setErrorMsg(null);
    setToastMsg(null);

    if (!user) {
      setErrorMsg("Please sign in or register to generate.");
      return;
    }

    if (!user.isAgeVerified) {
      setErrorMsg("18+ Identity verification is required before generating. Visit Settings to verify.");
      return;
    }

    setIsGenerating(true);
    setProgress(15);
    setStepDescription("Applying safety checks & prompt conditioning...");

    try {
      // Simulated progress intervals for realistic feedback
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev < 85) return prev + 18;
          return prev;
        });
      }, 500);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: selectedCharacterId || undefined,
          type: genType,
          prompt,
          negativePrompt,
          stylePreset,
          aspectRatio,
          seed,
          numOutputs,
          videoDuration: genType === "VIDEO" ? videoDuration : undefined,
          motionStrength: genType === "VIDEO" ? motionStrength : undefined,
          resolution,
        }),
      });

      clearInterval(timer);
      setProgress(100);
      setStepDescription("Finalizing render...");

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Generation request failed");
      }

      setLatestGeneration(data.generation);
      if (data.remainingCredits !== undefined && user) {
        setUser({ ...user, creditBalance: data.remainingCredits });
      }
      setToastMsg("Generation completed successfully!");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate");
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setStepDescription("");
    }
  };

  const handleFavoriteToggle = async (genId: string, currentFav: boolean) => {
    try {
      const res = await fetch(`/api/generations/${genId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !currentFav }),
      });
      if (res.ok) {
        setLatestGeneration((prev: any) => ({ ...prev, isFavorite: !currentFav }));
      }
    } catch {
      // Silent error handling
    }
  };

  const creditCost = genType === "VIDEO" ? 10 : 2 * numOutputs;

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-pink-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
            <Wand2 className="w-7 h-7 text-pink-500" /> Creation Studio
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Conditioned AI synthesis with persistent fictional adult characters.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-[#121215] border border-zinc-800 p-1 rounded-xl">
          <button
            onClick={() => setGenType("IMAGE")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              genType === "IMAGE"
                ? "bg-pink-600 text-white shadow-md shadow-pink-600/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" /> Text-to-Image
          </button>
          <button
            onClick={() => setGenType("VIDEO")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              genType === "VIDEO"
                ? "bg-pink-600 text-white shadow-md shadow-pink-600/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Film className="w-4 h-4" /> Image-to-Video
          </button>
        </div>
      </div>

      {/* Age Verification Warning (If unverified) */}
      {user && !user.isAgeVerified && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white">Age Verification Required</p>
              <p className="text-xs text-zinc-400">
                You must complete 18+ identity verification before generating content.
              </p>
            </div>
          </div>
          <Link
            href="/settings"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition shrink-0"
          >
            Verify Age Now
          </Link>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parameter Controls */}
        <div className="lg:col-span-5 space-y-5">
          {/* Character Selector */}
          <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Fictional Character Profile
              </label>
              <Link href="/characters" className="text-xs text-pink-400 hover:underline">
                + New Character
              </Link>
            </div>

            <select
              value={selectedCharacterId}
              onChange={(e) => handleSelectCharacter(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
            >
              <option value="">No Character (Standalone Prompt)</option>
              {characters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Apparent age {c.apparentAge}, {c.hairColor} {c.hairStyle})
                </option>
              ))}
            </select>
          </div>

          {/* Prompt Box */}
          <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Prompt Box
              </label>
              <span className="text-[11px] text-zinc-400">Ctrl + Enter to render</span>
            </div>

            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe scene, wardrobe, lighting, atmosphere..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-pink-500"
            />

            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">Negative Prompt</label>
              <input
                type="text"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="What to avoid (lowres, bad anatomy, blur...)"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          {/* Presets & Aspect Ratio */}
          <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-5 space-y-4">
            {/* Style Presets */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                Style Preset
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["realistic", "anime", "3d", "illustration"] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => setStylePreset(style)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium capitalize border transition ${
                      stylePreset === style
                        ? "bg-pink-600/20 text-pink-400 border-pink-500"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {(["1:1", "16:9", "9:16", "4:3", "3:4"] as const).map((ar) => (
                  <button
                    key={ar}
                    onClick={() => setAspectRatio(ar)}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition ${
                      aspectRatio === ar
                        ? "bg-pink-600/20 text-pink-400 border-pink-500"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {ar}
                  </button>
                ))}
              </div>
            </div>

            {/* Seed & Outputs */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1">Seed</label>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                  <button
                    onClick={handleRandomizeSeed}
                    title="Randomize seed"
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {genType === "IMAGE" ? (
                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1">
                    Outputs ({numOutputs})
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={4}
                    value={numOutputs}
                    onChange={(e) => setNumOutputs(parseInt(e.target.value))}
                    className="w-full accent-pink-500 mt-2"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1">
                    Motion ({motionStrength})
                  </label>
                  <input
                    type="range"
                    min={0.1}
                    max={1.0}
                    step={0.05}
                    value={motionStrength}
                    onChange={(e) => setMotionStrength(parseFloat(e.target.value))}
                    className="w-full accent-pink-500 mt-2"
                  />
                </div>
              )}
            </div>

            {/* Video specific controls */}
            {genType === "VIDEO" && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1">Duration (sec)</label>
                  <select
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(parseFloat(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value={3.0}>3.0 seconds</option>
                    <option value={4.0}>4.0 seconds</option>
                    <option value={5.0}>5.0 seconds</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1">Resolution</label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="1280x720">720p HD</option>
                    <option value="1024x1024">1024x1024 Square</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-xs text-red-400 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300">Generation Blocked</p>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || (user && !user.isAgeVerified)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-bold text-sm tracking-wide shadow-xl shadow-pink-600/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Synthesizing... ({progress}%)
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Generate {genType === "VIDEO" ? "Video" : "Image"} ({creditCost} Credits)
              </>
            )}
          </button>
        </div>

        {/* Right Column: Generation Preview & Live Queue */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 min-h-[580px] flex flex-col justify-between">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Generation Canvas
              </span>
              {latestGeneration && (
                <span className="text-xs text-zinc-400">
                  Seed: {latestGeneration.seed} | {latestGeneration.aspectRatio} | {latestGeneration.stylePreset}
                </span>
              )}
            </div>

            {/* Display Canvas Content */}
            {isGenerating ? (
              <div className="my-auto flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-4 border-pink-500/20 border-t-pink-500 animate-spin" />
                  <div className="absolute inset-3 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-400">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-semibold text-white">Generating Fictional Character</h4>
                  <p className="text-xs text-zinc-400">{stepDescription}</p>
                </div>

                {/* Progress bar */}
                <div className="w-64 bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
                  <div
                    className="bg-pink-500 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : latestGeneration && latestGeneration.assets?.length > 0 ? (
              <div className="space-y-4 my-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {latestGeneration.assets.map((asset: any) => (
                    <div
                      key={asset.id}
                      className="group relative rounded-2xl overflow-hidden border border-zinc-800 bg-black aspect-square"
                    >
                      {asset.mimeType?.includes("video") ? (
                        <video
                          src={asset.url}
                          controls
                          autoPlay
                          loop
                          muted
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={asset.url}
                          alt={latestGeneration.prompt}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      )}

                      {/* Floating actions */}
                      <div className="absolute top-3 right-3 flex gap-2 opacity-90 group-hover:opacity-100 transition">
                        <button
                          onClick={() =>
                            handleFavoriteToggle(latestGeneration.id, latestGeneration.isFavorite)
                          }
                          className="p-2 rounded-xl bg-black/60 backdrop-blur-md text-white hover:text-pink-500 transition"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              latestGeneration.isFavorite ? "fill-pink-500 text-pink-500" : ""
                            }`}
                          />
                        </button>
                        <a
                          href={asset.url}
                          download={`nudy_${asset.id}.jpg`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-black/60 backdrop-blur-md text-white hover:text-pink-500 transition"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Prompt Details and Re-Run */}
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs text-zinc-300 flex items-center justify-between gap-4">
                  <p className="truncate max-w-md">{latestGeneration.prompt}</p>
                  <button
                    onClick={() => {
                      setPrompt(latestGeneration.prompt);
                      setSeed(latestGeneration.seed);
                      setAspectRatio(latestGeneration.aspectRatio);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white shrink-0 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Re-run Settings
                  </button>
                </div>
              </div>
            ) : (
              <div className="my-auto text-center p-12 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-600">
                  <Wand2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-semibold text-zinc-300">Ready to Render</h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Select or create a character profile, enter your creative prompt, and click Generate to produce high-resolution imagery.
                </p>
              </div>
            )}

            {/* Privacy notice footer */}
            <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Private Generation (Creator Eyes Only)
              </span>
              <Link href="/gallery" className="text-pink-400 hover:underline">
                View Gallery &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
