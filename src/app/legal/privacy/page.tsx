import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 sm:p-10 space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold mb-3">
            <Lock className="w-3.5 h-3.5" /> Data Security & Compliance
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Privacy & Verification Records Policy</h1>
          <p className="text-zinc-400 text-sm">GDPR, CCPA, and statutory age verification data retention practices.</p>
        </div>

        <section className="space-y-3 text-zinc-300 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-white">1. Private by Default Architecture</h2>
          <p>
            All AI-generated images, videos, and custom character profiles you create are strictly private to your account.
            We do not maintain a public community feed or searchable indexing of your generated content. Assets are stored
            in encrypted object storage and served exclusively through short-lived cryptographic pre-signed URLs.
          </p>
        </section>

        <section className="space-y-3 text-zinc-300 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-white">2. Age and Identity Verification Data Retention</h2>
          <p>
            To comply with applicable child protection laws and adult content age verification mandates, verification tokens,
            proof hashes, and verified age dates are retained securely. Government-issued photo IDs processed by third-party
            KYC providers are verified on certified systems; raw images of government documents are never stored on unencrypted
            application servers.
          </p>
        </section>

        <section className="space-y-3 text-zinc-300 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-white">3. User Rights: Data Export & Account Deletion</h2>
          <p>
            Under GDPR and CCPA, you retain the full right to export all personal data, character configurations, and generation
            history in JSON format at any time via the User Settings page. You may also request complete cryptographic account
            deletion, which permanently purges all assets and profile records.
          </p>
        </section>
      </div>
    </div>
  );
}

