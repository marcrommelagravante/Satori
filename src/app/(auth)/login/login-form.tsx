"use client";

import * as React from "react";
import { Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
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
    <div className="w-full space-y-5">
      {errorMessage && (
        <div className="rounded-xl bg-error/10 border border-error/20 p-3 text-xs text-error font-medium text-center leading-relaxed">
          {errorMessage}
        </div>
      )}

      <div className="space-y-3">
        <Button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full h-12 rounded-xl bg-card hover:bg-muted/80 text-foreground border border-border hover:border-primary/40 text-sm font-medium shadow-xs flex items-center justify-center gap-3 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/20"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <GoogleIcon className="h-5 w-5" />
          )}
          <span>{isLoading ? "Connecting to Google..." : "Sign in with Google"}</span>
        </Button>
      </div>

      <div className="pt-4 border-t border-border/50 text-center space-y-2">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          By signing in, you agree to Satori&apos;s workspace data and security policies.
        </p>
      </div>
    </div>
  );
}

export function LoginForm() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-24 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
