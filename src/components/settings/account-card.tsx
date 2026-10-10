"use client";

import * as React from "react";
import { User, ShieldCheck } from "lucide-react";
import Image from "next/image";

interface AccountCardProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function AccountCard({ user }: AccountCardProps) {
  const [imageError, setImageError] = React.useState(false);

  const initial = user.name
    ? user.name.trim().charAt(0).toUpperCase()
    : user.email
    ? user.email.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-3.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] dark:bg-indigo-950/50 text-[#4F46E5] dark:text-indigo-400 shrink-0">
          <User className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-heading text-sm sm:text-base font-bold text-slate-900 dark:text-foreground">
            Account Profile
          </h2>
          <p className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5">
            Your personal identity and single sign-on authentication details.
          </p>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-border/60 bg-slate-50/50 dark:bg-muted/15">
          <div className="flex items-center gap-3.5">
            {user.image && !imageError ? (
              <div className="relative h-12 w-12 rounded-full overflow-hidden border border-slate-200 dark:border-border shrink-0 shadow-2xs">
                <Image
                  src={user.image}
                  alt={user.name || "Profile"}
                  fill
                  sizes="48px"
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white font-bold text-base shrink-0 shadow-2xs">
                {initial}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-foreground">
                  {user.name || "Satori Member"}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5">
                {user.email || "No email available"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-card border border-slate-200/80 dark:border-border px-3 py-1 shadow-2xs">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Connected with Google
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <p className="text-[11px] text-slate-400 dark:text-muted-foreground mt-3">
          Your profile photo, display name, and login credentials are automatically synced from your linked Google OAuth account.
        </p>
      </div>
    </div>
  );
}
