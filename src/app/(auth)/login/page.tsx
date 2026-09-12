import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { LoginForm } from "./login-form";
import { Sparkles } from "lucide-react";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  const hasGithub = Boolean(
    process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl text-center">
          {/* Satori Brand Mark */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md mb-5">
            <span className="text-2xl font-bold tracking-tight">悟</span>
          </div>

          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Satori
            </h1>
            <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-semibold text-secondary flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> AI
            </span>
          </div>

          <p className="text-sm text-muted-foreground mb-8">
            Your knowledge, intelligently connected.
          </p>

          <LoginForm hasGithub={hasGithub} />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Satori Document Intelligence & Knowledge Management &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
