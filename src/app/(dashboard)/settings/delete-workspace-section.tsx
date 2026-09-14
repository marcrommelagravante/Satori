"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteWorkspaceAction } from "@/lib/../app/actions/workspaces";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
        </div>
        <CardDescription>
          Irreversible actions for this workspace and its associated resources.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Delete this workspace</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Permanently purges all documents, vector embeddings, conversations, reports, and benchmarks.
            Physical files in storage will be removed. This action cannot be undone.
          </p>
        </div>

        {!isOwner ? (
          <p className="text-xs text-muted-foreground italic">
            Only workspace owners can delete this workspace.
          </p>
        ) : !isConfirming ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsConfirming(true)}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Workspace
          </Button>
        ) : (
          <div className="space-y-3 p-4 rounded-md border border-destructive/30 bg-background">
            <p className="text-xs text-foreground font-medium">
              To confirm deletion, type <span className="font-bold text-destructive">{workspaceName}</span> below:
            </p>
            <Input
              value={confirmationInput}
              onChange={(e) => {
                setConfirmationInput(e.target.value);
                setError(null);
              }}
              placeholder={workspaceName}
              className="text-sm"
              disabled={isPending}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={confirmationInput !== workspaceName || isPending}
                className="flex items-center gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
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
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
