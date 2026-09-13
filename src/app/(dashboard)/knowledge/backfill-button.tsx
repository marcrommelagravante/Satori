"use client";

import * as React from "react";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reindexWorkspaceAction } from "@/app/actions/knowledge";
import { useRouter } from "next/navigation";

export function BackfillButton({
  workspaceId,
  unindexedCount,
}: {
  workspaceId: string;
  unindexedCount: number;
}) {
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const router = useRouter();

  const handleBackfill = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      const res = await reindexWorkspaceAction(workspaceId);
      if (res.success) {
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Backfill failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {success ? (
        <span className="inline-flex items-center gap-1.5 text-xs text-success font-medium">
          <CheckCircle2 className="h-4 w-4" />
          Embeddings Generated!
        </span>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleBackfill}
          disabled={loading}
          className="text-xs h-8 gap-1.5 border-warning/50 hover:bg-warning/10 text-warning-foreground"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading
            ? "Generating Embeddings..."
            : `Backfill ${unindexedCount} Missing Embeddings`}
        </Button>
      )}
    </div>
  );
}
