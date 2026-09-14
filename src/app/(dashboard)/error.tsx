"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DASHBOARD VIEW ERROR]:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center space-y-4">
      <div className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
        <AlertTriangle className="h-6 w-6" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h3 className="text-lg font-semibold text-foreground">
          Failed to load dashboard content
        </h3>
        <p className="text-xs text-muted-foreground">
          A temporary issue prevented this section from rendering. You can retry loading or navigate to another section.
        </p>
        {error.digest && (
          <p className="text-[10px] text-muted-foreground/60 font-mono mt-1">
            Digest: {error.digest}
          </p>
        )}
      </div>

      <Button
        onClick={() => reset()}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Retry View
      </Button>
    </div>
  );
}
