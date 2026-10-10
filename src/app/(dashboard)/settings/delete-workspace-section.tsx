"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteWorkspaceAction } from "@/app/actions/workspaces";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DeleteWorkspaceSectionProps {
  workspaceId: string;
  workspaceName: string;
  userRole: string;
}

export function DeleteWorkspaceSection({
  workspaceId,
  workspaceName,
  userRole,
}: DeleteWorkspaceSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isOwner = userRole === "owner";

  const handleDelete = () => {
    if (confirmationInput !== workspaceName) {
      setError(`Please type "${workspaceName}" exactly to confirm.`);
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await deleteWorkspaceAction(workspaceId);
      if (res.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(res.error || "Failed to delete workspace.");
      }
    });
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-rose-200/80 dark:border-rose-950/60 bg-rose-50/30 dark:bg-rose-950/10 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-3.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 shrink-0">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-heading text-sm sm:text-base font-bold text-rose-900 dark:text-rose-300">
            Danger Zone
          </h3>
          <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-0.5">
            Irreversible actions for this workspace and its associated resources.
          </p>
        </div>
      </div>

      <div className="pt-2 border-t border-rose-200/60 dark:border-rose-950/40 space-y-3">
        <div>
          <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-foreground">
            Delete this workspace
          </h4>
          <p className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5 leading-relaxed">
            Permanently purges all documents, vector embeddings, conversations, reports, and benchmarks.
            Physical files in storage will be removed immediately. This action cannot be undone.
          </p>
        </div>

        {!isOwner ? (
          <p className="text-xs text-slate-500 dark:text-muted-foreground italic">
            Only workspace owners have permission to delete this workspace.
          </p>
        ) : !isConfirming ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsConfirming(true)}
            className="rounded-xl h-9 px-4 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Workspace
          </Button>
        ) : (
          <div className="space-y-3 p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-background">
            <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
              To confirm deletion, type <span className="font-bold text-rose-600 dark:text-rose-400">{workspaceName}</span> below:
            </p>
            <Input
              value={confirmationInput}
              onChange={(e) => {
                setConfirmationInput(e.target.value);
                setError(null);
              }}
              placeholder={workspaceName}
              className="h-9 text-xs rounded-xl border-slate-200 dark:border-border"
              disabled={isPending}
            />
            {error && <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>}
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={confirmationInput !== workspaceName || isPending}
                className="rounded-xl h-8 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    Permanently Delete
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsConfirming(false);
                  setConfirmationInput("");
                  setError(null);
                }}
                disabled={isPending}
                className="rounded-xl h-8 text-xs cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

