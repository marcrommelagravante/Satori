"use client";

import * as React from "react";
import { Building2, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { renameWorkspaceAction } from "@/app/actions/workspaces";

interface WorkspaceCardProps {
  workspaceId: string;
  initialName: string;
  userRole: string;
  createdAt?: Date | string;
}

export function WorkspaceCard({
  workspaceId,
  initialName,
  userRole,
  createdAt,
}: WorkspaceCardProps) {
  const [name, setName] = React.useState(initialName);
  const [savedName, setSavedName] = React.useState(initialName);
  const [isPending, startTransition] = React.useTransition();
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  React.useEffect(() => {
    setName(initialName);
    setSavedName(initialName);
  }, [initialName]);

  const canEdit = userRole === "owner" || userRole === "admin";
  const trimmed = name.trim();
  const isDirty = trimmed !== savedName;
  const isValid = trimmed.length >= 2 && trimmed.length <= 50;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!canEdit || !isDirty || !isValid || isPending) return;

    setFeedback(null);
    startTransition(async () => {
      const res = await renameWorkspaceAction(workspaceId, trimmed);
      if (res.success && res.name) {
        setSavedName(res.name);
        setName(res.name);
        setFeedback({
          type: "success",
          message: "Workspace name updated successfully.",
        });
        setTimeout(() => {
          setFeedback((prev) => (prev?.type === "success" ? null : prev));
        }, 4000);
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Failed to update workspace name.",
        });
      }
    });
  };

  const formattedDate = React.useMemo(() => {
    if (!createdAt) return null;
    try {
      const d = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return null;
    }
  }, [createdAt]);

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] dark:bg-indigo-950/50 text-[#4F46E5] dark:text-indigo-400 shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-heading text-sm sm:text-base font-bold text-slate-900 dark:text-foreground">
              Workspace Details
            </h2>
            <p className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5">
              Manage your workspace identity across navigation and generated reports.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40 px-2.5 py-0.5 text-[11px] font-semibold capitalize">
            {userRole}
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-border/60">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <form onSubmit={handleSave} className="lg:col-span-2 space-y-3.5">
            <div>
              <label
                htmlFor="workspace-name-input"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5"
              >
                Workspace Name
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <Input
                  id="workspace-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (feedback) setFeedback(null);
                  }}
                  disabled={!canEdit || isPending}
                  placeholder="Workspace Name"
                  maxLength={50}
                  className="h-9 text-xs rounded-xl border-slate-200 dark:border-border bg-white dark:bg-background focus:border-[#4F46E5] flex-1"
                />
                {canEdit && (
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!isDirty || !isValid || isPending}
                    className="rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white h-9 px-4 text-xs font-semibold shrink-0 cursor-pointer shadow-2xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                )}
              </div>
              {!canEdit && (
                <p className="text-[11px] text-slate-500 dark:text-muted-foreground mt-1.5 italic">
                  Only workspace owners and administrators can rename this workspace.
                </p>
              )}
              {canEdit && trimmed.length > 0 && trimmed.length < 2 && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
                  Workspace name must be at least 2 characters long.
                </p>
              )}
            </div>

            {feedback && (
              <div
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium ${
                  feedback.type === "success"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40"
                    : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40"
                }`}
              >
                {feedback.type === "success" ? (
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <p className="text-[11px] text-slate-400 dark:text-muted-foreground">
              Renaming updates your workspace title in the navigation sidebar, breadcrumbs, and generated reports.
            </p>
          </form>

          {/* Quick Info Metadata Panel on Right */}
          <div className="rounded-xl sm:rounded-2xl border border-slate-100 dark:border-border/60 bg-slate-50/50 dark:bg-muted/15 p-4 space-y-2.5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-muted-foreground uppercase tracking-wider">
                Workspace Metadata
              </span>
              <div className="mt-2 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="text-[11px]">Role</span>
                  <span className="capitalize font-semibold text-slate-900 dark:text-foreground text-[11px]">
                    {userRole}
                  </span>
                </div>
                {formattedDate && (
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="text-[11px]">Created</span>
                    <span className="font-medium text-slate-900 dark:text-foreground text-[11px]">
                      {formattedDate}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="text-[11px]">Isolation</span>
                  <span className="text-[11px] font-mono text-[#4F46E5] dark:text-indigo-400 font-medium">
                    Strict pgvector
                  </span>
                </div>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 dark:text-muted-foreground pt-2 border-t border-slate-200/50 dark:border-border/40 font-mono truncate">
              ID: {workspaceId}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
