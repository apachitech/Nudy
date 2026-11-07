import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 sm:p-10 space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold mb-3">
            <ShieldAlert className="w-3.5 h-3.5" /> Mandatory Legal Agreement
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-zinc-400 text-sm">Last updated: November 2026</p>
        </div>

        <section className="space-y-3 text-zinc-300 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-white">1. Eligibility and Mandatory 18+ Verification</h2>
          <p>
            You must be at least 18 years of age (or the legal age of majority in your jurisdiction, whichever is higher)
            to access or use Nudy (&quot;the Service&quot;). Prior to utilizing any artificial intelligence generation
            features, you must submit to and successfully pass identity and age verification through our third-party
            KYC verification providers.
          </p>
          <p>
            Misrepresenting your age, using fraudulent identification credentials, or creating accounts on behalf of minors
            will result in immediate permanent termination, forfeiture of credits, and referral to relevant legal authorities.
          </p>
        </section>

        <section className="space-y-3 text-zinc-300 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-white">2. Purely Fictional AI Characters</h2>
          <p>
            All characters created, conditioned, or generated on this platform are synthetic, computer-generated,
            and purely fictional entities. No real living persons, public figures, celebrities, or identifiable private
            individuals may be depicted. Prompts attempting to generate likenesses of actual individuals are strictly
            prohibited and blocked by automated filters.
          </p>
        </section>

        <section className="space-y-3 text-zinc-300 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-white">3. Zero-Tolerance Prohibited Conduct</h2>
          <p>You strictly agree not to use the Service to generate, prompt, or distribute:</p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400">
            <li>Any representation of minors, children, or individuals appearing under the age of 18 (CSAM/CSAE).</li>
            <li>Non-consensual sexual content, sexual violence, rape, coercion, or intoxication.</li>
            <li>Real-person deepfakes or unauthorized likenesses.</li>
            <li>Extreme violence, gore, mutilation, necrophilia, or bestiality.</li>
            <li>Prompts inciting suicide or self-harm.</li>
          </ul>
        </section>

        <section className="space-y-3 text-zinc-300 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-white">4. Account Termination & Forfeiture</h2>
          <p>
            Nudy reserves the unconditional right to suspend or terminate accounts that trigger safety filters or violate
            the Content Policy. Credit balances on suspended or banned accounts are non-refundable.
          </p>
        </section>
      </div>
    </div>
  );
}

