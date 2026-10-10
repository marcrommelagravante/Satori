"use client";

import * as React from "react";
import { Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
      />
    </svg>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M10 1L2 4.5v6.2c0 5.4 3.4 10.1 8 11.3 4.6-1.2 8-5.9 8-11.3V4.5L10 1z" />
      <path d="M6.8 11.2l2.2 2.2 4.2-4.2" strokeWidth="1.8" />
    </svg>
  );
}

function LoginFormContent() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const [isLoading, setIsLoading] = React.useState(false);

  const getErrorMessage = (error: string | null) => {
    if (!error) return null;
    if (error === "OAuthAccountNotLinked") {
      return "An account with this email already exists with a different login provider.";
    }
    if (error === "OAuthCallbackError" || error === "OAuthSignin") {
      return "Unable to sign in with Google. Please check your Google account and try again.";
    }
    return "Sign in failed. Please try again.";
  };

  const errorMessage = getErrorMessage(errorParam);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 p-3 text-xs text-red-700 dark:text-red-300 font-medium flex items-start gap-2.5 leading-relaxed"
        >
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div>
        <Button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full h-[52px] rounded-xl bg-white dark:bg-card hover:bg-[#F8FAFC] dark:hover:bg-muted/40 text-[#0F2D4A] dark:text-white border border-[#D9E2EC] dark:border-border hover:border-slate-400 dark:hover:border-slate-500 text-[15px] font-medium shadow-none flex items-center justify-center gap-3 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-slate-500 dark:text-slate-400" />
          ) : (
            <GoogleIcon className="h-5 w-5 shrink-0" />
          )}
          <span>{isLoading ? "Connecting to Google..." : "Continue with Google"}</span>
        </Button>
      </div>

      <div className="space-y-4 pt-1">
        <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed text-center">
          By continuing, you agree to Satori&apos;s{" "}
          <Link
            href="/terms"
            className="text-[#3B82F6] dark:text-blue-400 hover:underline font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2563EB] rounded-xs"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-[#3B82F6] dark:text-blue-400 hover:underline font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2563EB] rounded-xs"
          >
            Privacy Policy
          </Link>
          .
        </p>

        {/* Security Note with Shield Check icon */}
        <div className="flex items-center justify-center gap-2 pt-1 text-xs text-[#64748B] dark:text-slate-400">
          <ShieldCheckIcon className="h-4 w-4 text-[#64748B] dark:text-slate-400 shrink-0" />
          <span>Secure sign-in · Your documents stay in your workspace</span>
        </div>
      </div>
    </div>
  );
}

export function LoginForm() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-24 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
