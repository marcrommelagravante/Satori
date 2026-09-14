"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { seedTechOrgDemoAction } from "@/app/actions/demo";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SeedDemoButtonProps {
  workspaceId: string;
}

export function SeedDemoButton({ workspaceId }: SeedDemoButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const handleSeed = () => {
    setResultMessage(null);
    startTransition(async () => {
      const res = await seedTechOrgDemoAction(workspaceId);
      if (res.success) {
        setResultMessage(
          `Demo data ready! Added ${res.documentsCreated} documents and ${res.benchmarksCreated} benchmark cases.`
        );
        router.refresh();
      } else {
        setResultMessage(res.error || "Failed to load demo data.");
      }
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      <Button
        onClick={handleSeed}
        disabled={isPending}
        variant="secondary"
        size="sm"
        className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 flex items-center gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Indexing Tech Org Data...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Load Tech Org Demo Data</span>
          </>
        )}
      </Button>

      {resultMessage && (
        <span className="text-xs text-muted-foreground flex items-center gap-1.5 animate-in fade-in">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          {resultMessage}
        </span>
      )}
    </div>
  );
}
