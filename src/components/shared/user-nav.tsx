"use client";

import { signOut } from "next-auth/react";
import { LogOut, User as UserIcon } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

interface UserNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserNav({ user }: UserNavProps) {
  return (
    <div className="flex items-center justify-between border-t border-border pt-3">
      <div className="flex items-center gap-2.5 truncate">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs border border-border">
          {user.name ? (
            user.name.substring(0, 1).toUpperCase()
          ) : (
            <UserIcon className="h-4 w-4" />
          )}
        </div>
        <div className="flex flex-col truncate text-left">
          <span className="truncate text-xs font-semibold text-foreground">
            {user.name || "User"}
          </span>
          <span className="truncate text-[11px] text-muted-foreground">
            {user.email}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <ThemeToggle />
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-error/10 hover:text-error transition-colors"
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
