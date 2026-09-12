"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Files,
  Network,
  BotMessageSquare,
  FileSpreadsheet,
  Gauge,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Documents", href: "/documents", icon: Files },
  { name: "Knowledge", href: "/knowledge", icon: Network },
  { name: "AI Chat", href: "/chat", icon: BotMessageSquare, isAi: true },
  { name: "Reports", href: "/reports", icon: FileSpreadsheet },
  { name: "Evaluations", href: "/evaluations", icon: Gauge },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarNavProps {
  workspaceId: string;
}

export function SidebarNav({ workspaceId }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const href = `${item.href}?ws=${workspaceId}`;

        return (
          <Link
            key={item.name}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all group select-none",
              isActive
                ? item.isAi
                  ? "bg-secondary/15 text-secondary font-semibold"
                  : "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                isActive
                  ? item.isAi
                    ? "text-secondary"
                    : "text-primary"
                  : "text-muted-foreground group-hover:text-foreground"
              )}
            />
            <span>{item.name}</span>
            {item.isAi && (
              <span className="ml-auto rounded-full bg-secondary/15 px-1.5 py-0.5 text-[10px] font-semibold text-secondary">
                AI
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
