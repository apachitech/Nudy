"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle2 } from "lucide-react";

export default function DmcaTakedownPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rightsHolder: "",
    infringingUrl: "",
    statement: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 sm:p-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">DMCA & Content Takedown Notice</h1>
          <p className="text-zinc-400 text-sm">
            Digital Millennium Copyright Act Notice & Personal Likeness Removal Requests
          </p>
        </div>

        <p className="text-zinc-300 text-sm leading-relaxed">
          Nudy respects the intellectual property rights and personal rights of others. If you believe
          your copyrighted work, trademark, or personal likeness has been used without authorization, please submit
          a formal notice using this form. Notices are reviewed by our compliance team within 24 hours.
        </p>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto" />
            <h3 className="text-lg font-semibold text-white">Takedown Request Received</h3>
            <p className="text-xs text-zinc-400">
              A designated compliance agent has been assigned to your notice (Ref: DMCA-{Date.now().toString().slice(-6)}).
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Your Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Your Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Copyright Owner / Aggrieved Party *
              </label>
              <input
                type="text"
                required
                value={formData.rightsHolder}
                onChange={(e) => setFormData({ ...formData, rightsHolder: e.target.value })}
                placeholder="Self, or Company Name"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                URL or Identification of Content *
              </label>
              <input
                type="text"
                required
                value={formData.infringingUrl}
                onChange={(e) => setFormData({ ...formData, infringingUrl: e.target.value })}
                placeholder="https://..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Statement of Good Faith Belief *
              </label>
              <textarea
                rows={4}
                required
                value={formData.statement}
                onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
                placeholder="Describe why you believe the material infringes your rights..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <button
              type="submit"
              className="py-3 px-6 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-medium text-sm inline-flex items-center gap-2 transition"
            >
              <Send className="w-4 h-4" /> Submit Takedown Notice
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
