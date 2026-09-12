import { requireAuth } from "@/lib/auth/session";
import { FileSpreadsheet } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function ReportsPage() {
  await requireAuth();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="border-b border-border pb-6">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <Badge variant="outline">Phase 6</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Structured document comparisons, summaries, and agent-generated artifacts.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
          <FileSpreadsheet className="h-6 w-6" />
        </div>
        <h2 className="text-base font-semibold text-foreground mb-1">
          Document Intelligence Reports
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          AI agent tool execution and structured synthesis reports will be delivered in Phase 6.
        </p>
      </div>
    </div>
  );
}
