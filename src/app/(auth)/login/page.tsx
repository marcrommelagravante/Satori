import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { LoginForm } from "./login-form";
import { SatoriLogo } from "@/components/shared/satori-logo";

export const metadata: Metadata = {
  title: "Sign In — Satori",
  description: "Sign in to access your Satori document knowledge workspace.",
};

/**
 * Custom outline icons exactly matching Satori brand reference mockup
 */
function DocumentLinesIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 30"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 2.5h11l5 5V26a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4.5a2 2 0 0 1 2-2z" />
      <path d="M15 2.5v5h5" />
      <path d="M6.5 13.5h7" />
      <path d="M6.5 17.5h7" />
      <path d="M6.5 21.5h4" />
    </svg>
  );
}

function LockKeyholeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 30"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="15" rx="2.5" />
      <path d="M6.5 11V7a5.5 5.5 0 0 1 11 0v4" />
      <circle cx="12" cy="17.5" r="1.2" fill="currentColor" stroke="none" />
      <path d="M12 18.5v3" strokeWidth="1.6" />
    </svg>
  );
}

function DocumentPlusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 30"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 2.5h11l5 5V26a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4.5a2 2 0 0 1 2-2z" />
      <path d="M15 2.5v5h5" />
      <path d="M12 14v7" />
      <path d="M8.5 17.5h7" />
    </svg>
  );
}

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen min-h-[100svh] w-full flex flex-col lg:grid lg:grid-cols-2 bg-[#F8FAFC] dark:bg-background">
      {/* Left Column: Brand Hero Panel */}
      <div className="hidden lg:flex flex-col justify-between p-8 sm:p-12 lg:p-16 xl:p-20 2xl:p-24 border-r border-[#D7E0EA] dark:border-border bg-[#F8FAFC] dark:bg-background select-none">
        {/* Top brand row */}
        <div>
          <Link
            href="/"
            className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded-md"
            aria-label="Satori Home"
          >
            <SatoriLogo size={36} showWordmark={true} wordmarkClassName="text-xl" />
          </Link>
        </div>

        {/* Center content group */}
        <div className="max-w-[580px] w-full my-auto py-12 xl:py-16 space-y-7">
          <div className="space-y-3.5">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#3B82F6] dark:text-blue-400">
              YOUR KNOWLEDGE WORKSPACE
            </p>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-[42px] xl:text-[46px] font-bold tracking-tight text-[#0F2D4A] dark:text-white leading-[1.14]">
              Your knowledge,<br />intelligently connected.
            </h1>
          </div>

          <p className="text-base lg:text-[17px] text-[#64748B] dark:text-slate-300 leading-relaxed max-w-lg">
            Search your documents. Get clear answers<br className="hidden sm:inline" /> with sources you can verify.
          </p>

          {/* Three Feature Points arranged horizontally in a row exactly matching the mockup */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-7 xl:gap-8 pt-4">
            {/* 1. Source-backed answers */}
            <div className="flex items-center gap-3">
              <DocumentLinesIcon className="w-7 h-7 text-[#4A6582] dark:text-slate-300 shrink-0" />
              <div className="text-[13px] font-medium text-[#1E3A56] dark:text-slate-200 leading-snug">
                Source-backed<br />answers
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="hidden sm:block h-8 w-[1px] bg-[#D7E0EA] dark:bg-border/80" />

            {/* 2. Private workspace */}
            <div className="flex items-center gap-3">
              <LockKeyholeIcon className="w-7 h-7 text-[#4A6582] dark:text-slate-300 shrink-0" />
              <div className="text-[13px] font-medium text-[#1E3A56] dark:text-slate-200 leading-snug">
                Private<br />workspace
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="hidden sm:block h-8 w-[1px] bg-[#D7E0EA] dark:bg-border/80" />

            {/* 3. PDF, DOCX, TXT */}
            <div className="flex items-center gap-3">
              <DocumentPlusIcon className="w-7 h-7 text-[#4A6582] dark:text-slate-300 shrink-0" />
              <div className="text-[13px] font-medium text-[#1E3A56] dark:text-slate-200 leading-snug whitespace-nowrap">
                PDF, DOCX, TXT
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Statement */}
        <div className="pt-8">
          <p className="text-xs sm:text-[13px] text-[#64748B] dark:text-slate-400 font-normal">
            Knowledge you can trust. Sources you can inspect.
          </p>
        </div>
      </div>

      {/* Right Column: Authentication Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 xl:p-16 bg-[#EEF3F8] dark:bg-[#111827]">
        {/* Mobile Brand Header (< lg) */}
        <div className="w-full max-w-[480px] lg:hidden mb-8 space-y-4">
          <Link
            href="/"
            className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded-md"
            aria-label="Satori Home"
          >
            <SatoriLogo size={34} showWordmark={true} />
          </Link>
          <div className="space-y-1.5">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#3B82F6] dark:text-blue-400">
              YOUR KNOWLEDGE WORKSPACE
            </p>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-[#0F2D4A] dark:text-white">
              Your knowledge, intelligently connected.
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-300 leading-relaxed">
              Search your documents. Get clear answers with sources you can verify.
            </p>
          </div>

          {/* Mobile Horizontal Feature Points */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-2">
              <DocumentLinesIcon className="w-5 h-5 text-[#4A6582] dark:text-slate-300 shrink-0" />
              <span className="text-xs font-medium text-[#1E3A56] dark:text-slate-200">
                Source-backed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <LockKeyholeIcon className="w-5 h-5 text-[#4A6582] dark:text-slate-300 shrink-0" />
              <span className="text-xs font-medium text-[#1E3A56] dark:text-slate-200">
                Private workspace
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DocumentPlusIcon className="w-5 h-5 text-[#4A6582] dark:text-slate-300 shrink-0" />
              <span className="text-xs font-medium text-[#1E3A56] dark:text-slate-200">
                PDF, DOCX, TXT
              </span>
            </div>
          </div>
        </div>

        {/* Sign-in Card */}
        <div className="w-full max-w-[480px] xl:max-w-[500px] rounded-2xl border border-[#D9E2EC] dark:border-border bg-white dark:bg-card p-8 sm:p-10 lg:p-12 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.08),0_2px_6px_-1px_rgba(15,23,42,0.04)] dark:shadow-none">
          <div className="mb-7 text-left">
            <h2 className="font-heading text-2xl sm:text-[28px] font-bold tracking-tight text-[#0F2D4A] dark:text-white leading-tight">
              Welcome to Satori
            </h2>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mt-2">
              Sign in to continue to your workspace.
            </p>
          </div>

          <LoginForm />
        </div>

        {/* Mobile Bottom Trust Note */}
        <div className="lg:hidden mt-8 text-center">
          <p className="text-xs text-[#64748B] dark:text-slate-400">
            Knowledge you can trust. Sources you can inspect.
          </p>
        </div>
      </div>
    </main>
  );
}
