"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

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
        className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium shadow-xs hover:bg-muted transition-colors"
      >
        <div className="flex items-center gap-2.5 truncate">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary font-semibold text-xs">
            {currentWorkspace.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col text-left truncate">
            <span className="truncate text-foreground font-semibold">
              {currentWorkspace.name}
            </span>
            <span className="text-xs text-muted-foreground capitalize">
              {currentWorkspace.role}
            </span>
          </div>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-border bg-popover p-1.5 shadow-lg">
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
            Workspaces
          </div>
          <div className="mt-1 space-y-0.5">
            {workspaces.map((ws) => {
              const isSelected = ws.id === currentWorkspace.id;
              return (
                <button
                  key={ws.id}
                  onClick={() => {
                    setIsOpen(false);
                    router.push(`/dashboard?ws=${ws.id}`);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm text-left transition-colors ${
                    isSelected
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{ws.name}</span>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
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
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create new workspace</span>
          </button>
        </div>
      )}
    </div>
  );
}
