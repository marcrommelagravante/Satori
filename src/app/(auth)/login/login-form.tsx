"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function LoginForm({ hasGithub }: { hasGithub: boolean }) {
  const router = useRouter();
  const [email, setEmail] = React.useState("demo@satori.local");
  const [name, setName] = React.useState("Alex Rivera");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGithubLoading, setIsGithubLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleCredentialsLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        email,
        name,
        redirect: false,
      });

      if (res?.error) {
        setError("Unable to sign in. Please try again.");
        setIsLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  }

  async function handleGithubLogin() {
    setIsGithubLoading(true);
    try {
      await signIn("github", { callbackUrl: "/dashboard" });
    } catch {
      setIsGithubLoading(false);
    }
  }

  return (
    <div className="w-full space-y-5">
      {error && (
        <div className="rounded-lg bg-error/10 border border-error/20 p-3 text-xs text-error font-medium">
          {error}
        </div>
      )}

      {hasGithub && (
        <>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-center gap-2 h-10 font-medium"
            onClick={handleGithubLogin}
            disabled={isGithubLoading || isLoading}
          >
            {isGithubLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GithubIcon className="h-4 w-4" />
            )}
            Continue with GitHub
          </Button>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-border" />
            <span className="absolute bg-card px-2 text-xs text-muted-foreground uppercase">
              Or continue with demo
            </span>
          </div>
        </>
      )}

      <form onSubmit={handleCredentialsLogin} className="space-y-3.5">
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-semibold text-muted-foreground">
            Display Name
          </label>
          <Input
            type="text"
            placeholder="Alex Rivera"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-1.5 text-left">
          <label className="text-xs font-semibold text-muted-foreground">
            Email Address
          </label>
          <Input
            type="email"
            placeholder="demo@satori.local"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full justify-center gap-2 h-10 mt-1 font-semibold"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Sign In to Satori
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="rounded-lg bg-secondary/10 border border-secondary/20 p-3 text-xs text-left text-secondary flex items-start gap-2">
        <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-secondary" />
        <span>
          <strong>Fast Demo Mode:</strong> Instant sign-in generates a dedicated workspace and PostgreSQL user record automatically.
        </span>
      </div>
    </div>
  );
}
