import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SatoriLogo } from "@/components/shared/satori-logo";

export const metadata: Metadata = {
  title: "Privacy Policy — Satori",
  description: "Privacy and data protection policy for the Satori knowledge workspace.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-background text-foreground flex flex-col">
      <header className="border-b border-[#D7E0EA] dark:border-border bg-white dark:bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="inline-block">
            <SatoriLogo size={30} showWordmark={true} />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#0F2D4A] dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to sign in</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="rounded-2xl border border-[#D9E2EC] dark:border-border bg-white dark:bg-card p-6 sm:p-10 shadow-xs space-y-8">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Data Protection & Privacy
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#0F2D4A] dark:text-white mt-1">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Last updated: October 2026
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
            <section className="space-y-2">
              <h2 className="font-heading text-base sm:text-lg font-bold text-[#0F2D4A] dark:text-white">
                1. Workspace Isolation
              </h2>
              <p>
                Every document, text chunk, and vector embedding stored in Satori is strictly scoped to your authenticated workspace ID. Multi-tenant database queries and similarity scans are isolated so that your organizational documents remain inaccessible to any other user or workspace.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-base sm:text-lg font-bold text-[#0F2D4A] dark:text-white">
                2. Zero Foundation Model Training
              </h2>
              <p>
                Your uploaded documents, extracted passages, search queries, and generated answers are never used to train public foundation models. Content is processed solely for generating real-time grounded responses within your session.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-base sm:text-lg font-bold text-[#0F2D4A] dark:text-white">
                3. Encryption in Transit and at Rest
              </h2>
              <p>
                All data transmission between your browser and Satori servers is encrypted using modern Transport Layer Security (TLS 1.3). Uploaded files and database records are stored with AES-256 encryption at rest.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-base sm:text-lg font-bold text-[#0F2D4A] dark:text-white">
                4. Data Retention and Deletion
              </h2>
              <p>
                You retain complete control over your data. When you delete a document or remove a workspace, all associated text extracts, metadata, and vector embeddings are permanently purged from our primary database and vector index.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-base sm:text-lg font-bold text-[#0F2D4A] dark:text-white">
                5. Authentication Information
              </h2>
              <p>
                We use secure OAuth authentication (such as Google OAuth) to verify your identity. Satori receives only your verified email, display name, and avatar, and does not access or store your third-party account passwords.
              </p>
            </section>
          </div>

          <div className="pt-6 border-t border-[#D9E2EC] dark:border-border flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Questions regarding our privacy practices? Contact privacy@satori.dev</span>
            <Link href="/terms" className="text-[#2563EB] hover:underline font-medium">
              Terms of Service &rarr;
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
