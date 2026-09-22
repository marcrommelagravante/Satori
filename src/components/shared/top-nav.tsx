"use client";

import * as React from "react";
import { Search, User as UserIcon, LogOut, ChevronDown, Bell } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { signOut } from "next-auth/react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface TopNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
  workspaceName?: string;
  workspaceRole?: string;
}

export function TopNav({ user, workspaceRole }: TopNavProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const profileMenuRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const ws = searchParams.get("ws");

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Only display the TopNav header controls on the dashboard page
  if (pathname !== "/dashboard") {
    return null;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const wsParam = ws ? `&ws=${ws}` : "";
    router.push(`/knowledge?q=${encodeURIComponent(searchQuery.trim())}${wsParam}`);
  };

  const displayName = user.name || "User";
  const displayRole = workspaceRole || user.role || "Member";

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-[#EEF2F6]/80 dark:bg-background/80 backdrop-blur-md px-6 md:px-8 flex items-center justify-between gap-4 transition-colors">
      {/* Search Input Bar */}
      <div className="flex-1 max-w-sm ml-auto mr-2">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search anything in your workspace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 text-xs rounded-xl bg-white dark:bg-card border border-slate-200/80 dark:border-border text-slate-800 dark:text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all shadow-2xs"
          />
        </form>
      </div>

      {/* Right Controls: Bell, Theme, Profile */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-muted transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        <ThemeToggle />

        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-slate-50 dark:hover:bg-muted/80 transition-colors text-left"
            aria-label="User profile menu"
          >
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#4F46E5] to-[#7C3AED] text-white font-semibold text-xs shadow-2xs overflow-hidden">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={displayName}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span>
                  {displayName
                    .split(" ")
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "U"}
                </span>
              )}
            </div>

            <div className="hidden md:flex flex-col text-left leading-tight">
              <span className="text-xs font-bold text-slate-900 dark:text-foreground tracking-tight">
                {displayName}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-muted-foreground capitalize">
                {displayRole}
              </span>
            </div>

            <ChevronDown className="hidden md:block h-3.5 w-3.5 text-slate-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-1.5 shadow-lg text-xs z-50 animate-in fade-in-50 zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-border mb-1">
                <p className="font-semibold text-foreground text-sm">{displayName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    router.push(ws ? `/settings?ws=${ws}` : "/settings");
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-md hover:bg-muted text-foreground transition-colors flex items-center gap-2"
                >
                  <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Account Settings</span>
                </button>
              </div>

              <div className="border-t border-border pt-1">
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full text-left px-3 py-1.5 rounded-md hover:bg-error/10 text-error transition-colors flex items-center gap-2"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
