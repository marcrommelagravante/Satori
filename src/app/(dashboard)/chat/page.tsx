import { requireAuth } from "@/lib/auth/session";
import { getUserWorkspaces } from "@/lib/workspaces/service";
import { BotMessageSquare, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ ws?: string }>;
}) {
  const user = await requireAuth();
  const params = await searchParams;
  const workspaces = await getUserWorkspaces(user.id);
  const activeWorkspace =
    (params.ws && workspaces.find((w) => w.id === params.ws)) || workspaces[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="border-b border-border pb-6">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold tracking-tight">AI Chat</h1>
          <Badge variant="ai">Phase 4</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Grounded conversational intelligence with source citations and conversation history.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/15 text-secondary mb-4">
          <BotMessageSquare className="h-6 w-6" />
        </div>
        <h2 className="text-base font-semibold text-foreground mb-1">
          Grounded RAG Chat Coming in Phase 4
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
          Chat threads, Gemini prompt grounding, and deterministic citation mapping connecting answers to source document chunks will be integrated in Phase 4.
        </p>
        <div className="inline-flex items-center gap-1.5 text-xs text-secondary bg-secondary/10 px-3 py-1.5 rounded-lg font-medium">
          <Sparkles className="h-3.5 w-3.5" />
          Tenant Isolated for: <strong>{activeWorkspace?.name}</strong>
        </div>
      </div>
    </div>
  );
}
