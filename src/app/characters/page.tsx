"use client";

import { useEffect, useState } from "react";
import {
  Users2,
  Plus,
  Trash2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface CharacterItem {
  id: string;
  name: string;
  apparentAge: number;
  gender: string;
  bodyType: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  faceFeatures?: string;
  outfit?: string;
  personality?: string;
  setting?: string;
  baseSeed: number;
  _count?: { generations: number };
}

export default function CharactersPage() {
  const [characters, setCharacters] = useState<CharacterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form state - Note: UI apparentAge minimum is strictly 21 as required by product specs
  const [name, setName] = useState("");
  const [apparentAge, setApparentAge] = useState(23); // Default 23, min 21 in UI
  const [gender, setGender] = useState("female");
  const [bodyType, setBodyType] = useState("hourglass athletic");
  const [hairColor, setHairColor] = useState("blonde");
  const [hairStyle, setHairStyle] = useState("long wavy");
  const [eyeColor, setEyeColor] = useState("blue");
  const [faceFeatures, setFaceFeatures] = useState("subtle makeup, high cheekbones, radiant skin");
  const [outfit, setOutfit] = useState("silk evening gown with delicate straps");
  const [personality, setPersonality] = useState("confident, playful, artistic");
  const [setting, setSetting] = useState("luxury penthouse terrace overlooking a city skyline at dusk");
  const [baseSeed, setBaseSeed] = useState(418290);
  const [submitting, setSubmitting] = useState(false);

  const fetchCharacters = async () => {
    try {
      const res = await fetch("/api/characters");
      if (res.ok) {
        const data = await res.json();
        setCharacters(data.characters || []);
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => setUser(data.user));

    fetchCharacters();
  }, []);

  const handleCreateCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          apparentAge,
          gender,
          bodyType,
          hairStyle,
          hairColor,
          eyeColor,
          faceFeatures,
          outfit,
          personality,
          setting,
          baseSeed,
          defaultPrompt: `${faceFeatures}, ${outfit}, ${setting}`,
          negativePrompt: "deformed, blurry, bad anatomy, low quality",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create character");
      }

      setToastMsg(`Character "${name}" saved successfully!`);
      setShowModal(false);
      setName("");
      fetchCharacters();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this character?")) return;
    try {
      const res = await fetch(`/api/characters/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCharacters(characters.filter((c) => c.id !== id));
        setToastMsg("Character deleted.");
      }
    } catch {
      //
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-pink-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5" />
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
            <Users2 className="w-7 h-7 text-pink-500" /> Character Creator
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Build persistent fictional adult characters with consistent features and fixed seeds across generations.
          </p>
        </div>

        <button
          onClick={() => {
            if (user && !user.isAgeVerified) {
              alert("Please verify your 18+ age in Settings before creating characters.");
              return;
            }
            setShowModal(true);
          }}
          className="py-3 px-5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-pink-600/30 shrink-0"
        >
          <Plus className="w-4 h-4" /> Create New Character
        </button>
      </div>

      {/* Characters List Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-zinc-900/60 border border-zinc-800" />
          ))}
        </div>
      ) : characters.length === 0 ? (
        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-12 text-center space-y-4">
          <Users2 className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Characters Created Yet</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Design your first adult fictional character with face, hair, and physique styling to ensure consistent looks across all images and videos.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="py-2.5 px-5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold inline-flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" /> Build Character Profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((c) => (
            <div
              key={c.id}
              className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-pink-500/40 transition duration-300 relative group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-pink-400 transition">
                      {c.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-400 border border-pink-500/20 font-medium">
                        Age: {c.apparentAge} (Adult)
                      </span>
                      <span className="text-xs text-zinc-400 capitalize">
                        {c.gender} &bull; {c.bodyType}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition"
                    title="Delete character"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-xs text-zinc-300">
                  <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-400">Hair:</span>
                    <span className="capitalize">{c.hairColor} {c.hairStyle}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-400">Eyes:</span>
                    <span className="capitalize">{c.eyeColor}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-400">Base Seed:</span>
                    <span className="font-mono text-pink-400">{c.baseSeed}</span>
                  </div>
                  {c.personality && (
                    <div className="py-1">
                      <span className="text-zinc-400 block mb-0.5">Personality & Vibe:</span>
                      <p className="text-zinc-300 italic">{c.personality}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">
                  {c._count?.generations || 0} Generations
                </span>
                <Link
                  href={`/create?characterId=${c.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-400 hover:text-pink-300 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Generate Now &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
          <div className="max-w-xl w-full bg-[#121215] border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users2 className="w-5 h-5 text-pink-500" /> New Adult Character Profile
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateCharacter} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Character Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vanessa Vane"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                {/* Apparent Age: strictly minimum 21 in UI */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Apparent Age: <span className="text-pink-400 font-bold">{apparentAge}</span> (Min 21 in UI)
                  </label>
                  <input
                    type="range"
                    min={21}
                    max={60}
                    value={apparentAge}
                    onChange={(e) => setApparentAge(parseInt(e.target.value))}
                    className="w-full accent-pink-500 mt-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="androgynous">Androgynous</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Body Type</label>
                  <select
                    value={bodyType}
                    onChange={(e) => setBodyType(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="hourglass athletic">Hourglass Athletic</option>
                    <option value="slim toned">Slim Toned</option>
                    <option value="curvy voluptuous">Curvy Voluptuous</option>
                    <option value="muscular defined">Muscular Defined</option>
                    <option value="petite adult">Petite Adult</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Eye Color</label>
                  <input
                    type="text"
                    value={eyeColor}
                    onChange={(e) => setEyeColor(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Hair Color</label>
                  <input
                    type="text"
                    value={hairColor}
                    onChange={(e) => setHairColor(e.target.value)}
                    placeholder="blonde, raven black, ginger..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Hair Style</label>
                  <input
                    type="text"
                    value={hairStyle}
                    onChange={(e) => setHairStyle(e.target.value)}
                    placeholder="long wavy, pixie cut, sleek bob..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Signature Outfit & Style
                </label>
                <input
                  type="text"
                  value={outfit}
                  onChange={(e) => setOutfit(e.target.value)}
                  placeholder="e.g. black silk lingerie, neon cyberpunk jacket, satin cocktail dress..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Atmospheric Setting & Lighting
                </label>
                <input
                  type="text"
                  value={setting}
                  onChange={(e) => setSetting(e.target.value)}
                  placeholder="e.g. luxury yacht cabin at sunset, neon bedroom, Parisian hotel suite..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Personality</label>
                  <input
                    type="text"
                    value={personality}
                    onChange={(e) => setPersonality(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Base Consistency Seed</label>
                  <input
                    type="number"
                    value={baseSeed}
                    onChange={(e) => setBaseSeed(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition flex items-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Save Character Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
