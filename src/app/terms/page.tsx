import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SatoriLogo } from "@/components/shared/satori-logo";

export const metadata: Metadata = {
  title: "Terms of Service — Satori",
  description: "Terms and conditions for using the Satori knowledge workspace.",
};

export default function TermsPage() {
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
              Legal Agreement
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#0F2D4A] dark:text-white mt-1">
              Terms of Service
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Last updated: October 2026
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
            <section className="space-y-2">
              <h2 className="font-heading text-base sm:text-lg font-bold text-[#0F2D4A] dark:text-white">
                1. Agreement to Terms
              </h2>
              <p>
                By accessing or using Satori, you agree to be bound by these Terms of Service. Satori is a document knowledge workspace designed to help individuals and teams upload documents, ask natural language questions, and inspect verified source passages.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-base sm:text-lg font-bold text-[#0F2D4A] dark:text-white">
                2. Workspace and Account Responsibilities
              </h2>
              <p>
                You are responsible for maintaining the security of your authentication credentials and for all activities that occur under your account. You agree not to upload content that violates intellectual property rights, applicable privacy laws, or acceptable use standards.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-base sm:text-lg font-bold text-[#0F2D4A] dark:text-white">
                3. Document Ownership and Processing
              </h2>
              <p>
                You retain full ownership and rights to all documents, files, and queries uploaded to Satori. Documents are processed exclusively to extract text, compute embeddings, and provide grounded retrieval within your authenticated workspace.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-base sm:text-lg font-bold text-[#0F2D4A] dark:text-white">
                4. Source Inspection and Verification
              </h2>
              <p>
                Satori is engineered to provide source citations linking generated responses to actual text passages in your documents. Users are encouraged to inspect source citations and exercise professional judgment before acting on generated information.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-base sm:text-lg font-bold text-[#0F2D4A] dark:text-white">
                5. Service Modifications and Termination
              </h2>
              <p>
                We reserve the right to update or modify features to improve reliability, security, and performance. You may export or delete your workspace content and discontinue use of the service at any time.
              </p>
            </section>
          </div>

          <div className="pt-6 border-t border-[#D9E2EC] dark:border-border flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Questions regarding our terms? Contact support@satori.dev</span>
            <Link href="/privacy" className="text-[#2563EB] hover:underline font-medium">
              Privacy Policy &rarr;
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
