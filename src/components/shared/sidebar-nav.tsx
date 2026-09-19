"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutGrid,
  FileText,
  Network,
  Sparkles,
  FileBarChart,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Knowledge Hub", href: "/knowledge", icon: Network },
  { name: "AI Chat", href: "/chat", icon: Sparkles },
  { name: "Reports", href: "/reports", icon: FileBarChart },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarNavProps {
  workspaceId: string;
}

export function SidebarNav({ workspaceId }: SidebarNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeWorkspaceId = searchParams.get("ws") || workspaceId;

  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const href = `${item.href}?ws=${activeWorkspaceId}`;

        return (
          <Link
            key={item.name}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all group select-none",
              isActive
                ? "bg-[#EEF2FF] dark:bg-indigo-950/50 text-[#4F46E5] dark:text-indigo-400 font-semibold"
                : "text-slate-500 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-muted/50 hover:text-slate-900 dark:hover:text-foreground"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0 transition-transform group-hover:scale-105",
                isActive
                  ? "text-[#4F46E5] dark:text-indigo-400"
                  : "text-slate-400 dark:text-muted-foreground group-hover:text-slate-900 dark:group-hover:text-foreground"
              )}
            />
            <span className="tracking-tight">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

