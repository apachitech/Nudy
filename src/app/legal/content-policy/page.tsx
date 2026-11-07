import Link from "next/link";
import { ArrowLeft, Ban, CheckCircle2, AlertOctagon } from "lucide-react";

export default function ContentPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 sm:p-10 space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold mb-3">
            <AlertOctagon className="w-3.5 h-3.5" /> Enforcement Standards
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Content Policy & Safety Guidelines</h1>
          <p className="text-zinc-400 text-sm">Mandatory rules governing all prompt synthesis and media output.</p>
        </div>

        {/* Permitted vs Prohibited Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-3">
              <CheckCircle2 className="w-4 h-4" /> Permitted Content
            </div>
            <ul className="text-xs text-zinc-300 space-y-2">
              <li>✓ Original fictional adult characters (apparent age 21+ in UI).</li>
              <li>✓ Consensual glamour, artistic, and adult thematic styling.</li>
              <li>✓ Creative fantasy, cyberpunk, sci-fi, and contemporary fictional settings.</li>
              <li>✓ Consistent character conditioning utilizing user-controlled seeds and profiles.</li>
            </ul>
          </div>

          <div className="bg-red-950/20 border border-red-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 text-red-400 font-semibold text-sm mb-3">
              <Ban className="w-4 h-4" /> Strictly Prohibited (Zero Tolerance)
            </div>
            <ul className="text-xs text-zinc-300 space-y-2">
              <li>✗ Any depiction of minors or persons under 18 years of age.</li>
              <li>✗ School settings, uniforms, or child-associated themes.</li>
              <li>✗ Non-consensual acts, coercion, or sexual assault.</li>
              <li>✗ Real living public figures, politicians, celebrities, or private individuals.</li>
              <li>✗ Extreme violence, dismemberment, gore, bestiality, or self-harm.</li>
            </ul>
          </div>
        </div>

        <section className="space-y-3 text-zinc-300 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-white">Automated and Human Enforcement</h2>
          <p>
            Every prompt submitted to our API is processed through a multi-stage lexical and semantic classifier.
            Attempts to circumvent filters through leetspeak, punctuation obfuscation, or homoglyphs are logged.
            Repeated violations result in automated account bans and permanent forfeiture of credits.
          </p>
        </section>
      </div>
    </div>
  );
}

