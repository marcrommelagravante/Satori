import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { LoginForm } from "./login-form";
import { SatoriLogo } from "@/components/shared/satori-logo";
import { ShieldCheck, Lock, Users } from "lucide-react";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* Left Column: Brand Hero & Value Proposition matching Mockup Panel 6 */}
      <div className="hidden lg:flex flex-col justify-between p-12 lg:p-16 border-r border-border/70 bg-gradient-to-br from-card via-background to-secondary/10 relative overflow-hidden">
        {/* Subtle background ambient blur */}
        <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-secondary/10 blur-3xl pointer-events-none -z-10" />

        {/* Top brand */}
        <div>
          <SatoriLogo size={36} showWordmark={true} wordmarkClassName="text-xl" />
        </div>

        {/* Center message */}
        <div className="max-w-md space-y-3 my-auto py-12">
          <div className="mb-2">
            <SatoriLogo size={56} />
          </div>
          <h1 className="font-heading text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
            Your knowledge. Intelligently connected.
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Upload, search, and get insights from your documents with the power of AI.
          </p>
        </div>

        {/* Bottom Feature Badges matching Mockup Panel 6 */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-8 border-t border-border/50">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <Lock className="h-4 w-4 text-primary" />
            <span>Private</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <Users className="h-4 w-4 text-primary" />
            <span>Collaborative</span>
          </div>
        </div>
      </div>

      {/* Right Column: Authentication Card */}
      <div className="flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-background">
        <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-8 shadow-xl">
          {/* Mobile brand header */}
          <div className="lg:hidden mb-6 text-center">
            <div className="inline-block mb-2">
              <SatoriLogo size={36} showWordmark={true} />
            </div>
            <p className="text-xs text-muted-foreground">
              Your knowledge, intelligently connected.
            </p>
          </div>

          <div className="mb-6 text-left">
            <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">
              Welcome to Satori
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Sign in with your Google account to access your workspace
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
