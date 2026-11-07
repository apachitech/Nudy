import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function Section2257NoticePage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 sm:p-10 space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold mb-3">
            <FileText className="w-3.5 h-3.5" /> Statutory Notice
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">18 U.S.C. § 2257 Record-Keeping Statement</h1>
          <p className="text-zinc-400 text-sm">Exemption and compliance notice regarding synthetic and AI-generated media.</p>
        </div>

        <section className="space-y-4 text-zinc-300 text-sm leading-relaxed">
          <p>
            All visual depictions, images, animations, and video sequences produced, generated, or displayed through
            Nudy are entirely synthetic computer-generated imagery (&quot;CGI&quot;) created through artificial intelligence
            diffusion algorithms, neural networks, and mathematical seed calculations.
          </p>

          <p>
            <strong>No actual living human beings were photographed, filmed, or physically participated in the creation of
            any visual content produced by this service.</strong> Consequently, the materials generated on this platform
            are not subject to the record-keeping provisions of 18 U.S.C. § 2257 and 28 C.F.R. Part 75, which apply exclusively
            to actual human performers depicted in sexually explicit conduct.
          </p>

          <p>
            Notwithstanding this exemption, Nudy strictly enforces policies that require all fictional characters
            synthesized by users to portray adult attributes with a minimum apparent age of 18 years (and minimum 21 years
            in user-facing creation controls). No synthetic depictions resembling minors or children are permitted.
          </p>
        </section>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 space-y-1">
          <p className="font-semibold text-zinc-200">Custodian of Records:</p>
          <p>Compliance Officer, Legal Department</p>
          <p>Nudy Technologies & Compliance Operations</p>
          <p>Email: legal@nudy.local</p>
        </div>
      </div>
    </div>
  );
}

