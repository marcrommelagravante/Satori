"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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

function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#00A4EF" d="M1 13h10v10H1z" />
      <path fill="#7FBA00" d="M13 1h10v10H13z" />
      <path fill="#FFB900" d="M13 13h10v10H13z" />
    </svg>
  );
}

export function LoginForm({ hasGithub }: { hasGithub: boolean }) {
  const router = useRouter();
  const [email, setEmail] = React.useState("you@company.com");
  const [password, setPassword] = React.useState("••••••••");
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        name: email.split("@")[0] || "User",
        redirect: false,
      });

      if (res?.error) {
        setError("Unable to sign in. Please verify your credentials.");
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

  return (
    <div className="w-full space-y-4">
      {error && (
        <div className="rounded-[8px] bg-error/10 border border-error/20 p-2.5 text-xs text-error font-medium text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-semibold text-foreground">
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@company.com"
            className="w-full h-10 px-3 rounded-[8px] border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-semibold text-foreground">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="w-full h-10 pl-3 pr-10 rounded-[8px] border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-muted-foreground select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
            />
            <span>Remember me</span>
          </label>

          <a href="#" className="text-primary hover:underline font-medium">
            Forgot password?
          </a>
        </div>

        {/* Sign In Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 rounded-[8px] bg-primary hover:bg-primary-dark text-primary-foreground font-semibold text-xs shadow-xs transition-all"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          <span>Sign In</span>
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-4">
        <div className="w-full border-t border-border" />
        <span className="absolute bg-card px-2 text-[11px] text-muted-foreground">
          or continue with
        </span>
      </div>

      {/* Social Logins matching Mockup Panel 6 */}
      <div className="grid grid-cols-2 gap-2.5">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setEmail("google.user@satori.local");
          }}
          className="h-9 rounded-[8px] border-border text-xs font-medium flex items-center justify-center gap-2 hover:bg-muted/60"
        >
          <GoogleIcon className="h-4 w-4" />
          <span>Google</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setEmail("microsoft.user@satori.local");
          }}
          className="h-9 rounded-[8px] border-border text-xs font-medium flex items-center justify-center gap-2 hover:bg-muted/60"
        >
          <MicrosoftIcon className="h-4 w-4" />
          <span>Microsoft</span>
        </Button>
      </div>

      {/* Footer */}
      <p className="text-center text-[11px] text-muted-foreground pt-3">
        Don&apos;t have an account?{" "}
        <a href="mailto:admin@satori.local" className="text-primary hover:underline font-medium">
          Contact your administrator
        </a>
      </p>
    </div>
  );
}
