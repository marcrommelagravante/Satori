"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Plus, Building2, Check } from "lucide-react";
import type { WorkspaceWithRole } from "@/lib/workspaces/service";

interface WorkspaceSwitcherProps {
  workspaces: WorkspaceWithRole[];
  currentWorkspace: WorkspaceWithRole;
}

export function WorkspaceSwitcher({
  workspaces,
  currentWorkspace,
}: WorkspaceSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Dynamically resolve active workspace from URL searchParams if present
  const currentWsId = searchParams.get("ws") || currentWorkspace.id;
  const activeWorkspace =
    workspaces.find((w) => w.id === currentWsId) || currentWorkspace;

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200/80 dark:border-border bg-slate-50/60 dark:bg-muted/30 hover:bg-slate-100/80 dark:hover:bg-muted/60 p-2.5 text-sm font-medium transition-all group"
      >
        <div className="flex items-center gap-2.5 truncate">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="flex flex-col text-left truncate leading-tight">
            <span className="truncate text-slate-800 dark:text-foreground font-bold text-xs tracking-tight">
              {activeWorkspace.name}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-muted-foreground capitalize">
              {activeWorkspace.role || "Owner"}
            </span>
          </div>
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 shrink-0 ml-2 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 bottom-full z-50 mb-2 w-64 rounded-xl border border-border bg-popover p-1.5 shadow-xl animate-in fade-in-50 zoom-in-95 duration-100">
          <div className="px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Workspaces
          </div>
          <div className="mt-1 space-y-0.5 max-h-56 overflow-y-auto">
            {workspaces.map((ws) => {
              const isSelected = ws.id === activeWorkspace.id;
              return (
                <button
                  key={ws.id}
                  onClick={() => {
                    setIsOpen(false);
                    router.push(`${pathname}?ws=${ws.id}`);
                  }}
                  className={`flex w-full items-center justify-between rounded-[8px] px-2.5 py-2 text-xs text-left transition-colors ${
                    isSelected
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate font-medium">{ws.name}</span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="my-1.5 border-t border-border" />

          <button
            onClick={() => {
              setIsOpen(false);
              router.push("/workspaces/new");
            }}
            className="flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create new workspace</span>
          </button>
        </div>
      )}
    </div>
  );
}
