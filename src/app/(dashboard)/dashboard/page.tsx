import { requireAuth } from "@/lib/auth/session";
import {
  getUserWorkspaces,
  getOrCreateDefaultWorkspace,
} from "@/lib/workspaces/service";
import { db } from "@/lib/db";
import { documents, conversations, documentChunks } from "@/lib/db/schema";
import { eq, count, desc } from "drizzle-orm";
import Link from "next/link";
import {
  FileText,
  BotMessageSquare,
  Network,
  Upload,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SeedDemoButton } from "./seed-demo-button";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ ws?: string }>;
}) {
  const user = await requireAuth();
  const params = await searchParams;

  let workspaces = await getUserWorkspaces(user.id);
  if (workspaces.length === 0) {
    const defaultWorkspace = await getOrCreateDefaultWorkspace(user);
    workspaces = [defaultWorkspace];
  }

  const activeWorkspace =
    (params.ws && workspaces.find((w) => w.id === params.ws)) || workspaces[0];

  // Fetch metrics for this specific workspace (strictly scoped)
  const [docCountRes] = await db
    .select({ value: count() })
    .from(documents)
    .where(eq(documents.workspaceId, activeWorkspace.id));

  const [chatCountRes] = await db
    .select({ value: count() })
    .from(conversations)
    .where(eq(conversations.workspaceId, activeWorkspace.id));

  const recentConversations = await db
    .select()
    .from(conversations)
    .where(eq(conversations.workspaceId, activeWorkspace.id))
    .orderBy(desc(conversations.updatedAt))
    .limit(3);

  const docCount = docCountRes?.value ?? 0;
  const chatCount = chatCountRes?.value ?? 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Workspace Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {activeWorkspace.name}
            </h1>
            <Badge variant="outline" className="capitalize text-xs font-medium">
              <ShieldCheck className="h-3 w-3 mr-1 text-primary" />
              {activeWorkspace.role}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Workspace ID: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{activeWorkspace.slug}</code> &bull; Scoped multi-tenant knowledge workspace
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <SeedDemoButton workspaceId={activeWorkspace.id} />
          <Button asChild variant="outline" size="sm">
            <Link href={`/chat?ws=${activeWorkspace.id}`}>
              <BotMessageSquare className="h-4 w-4" />
              AI Chat
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href={`/documents?ws=${activeWorkspace.id}`}>
              <Upload className="h-4 w-4" />
              Upload Documents
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Documents
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{docCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              PDF, DOCX, and TXT files
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Indexed Chunks
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Processed knowledge segments
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-secondary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vector Embeddings
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary">
              <Network className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              768-dim pgvector index
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-secondary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversations
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary">
              <Sparkles className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chatCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active grounded chat threads
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Showcase & Quick Start */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
              <Upload className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Document Ingestion</CardTitle>
            <CardDescription>
              Upload organizational policies, manuals, guidelines, and notes. Cleaned, structured, and chunked automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm" className="w-full justify-between">
              <Link href={`/documents?ws=${activeWorkspace.id}`}>
                Upload Files
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between border-secondary/20 bg-secondary/[0.02]">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/15 text-secondary mb-3">
              <BotMessageSquare className="h-5 w-5" />
            </div>
            <CardTitle className="text-base flex items-center gap-1.5">
              Custom RAG Chat
              <Badge variant="ai" className="text-[10px] px-1.5 py-0">AI</Badge>
            </CardTitle>
            <CardDescription>
              Ask questions grounded directly in your uploaded workspace documents with clickable source citations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="ai" size="sm" className="w-full justify-between">
              <Link href={`/chat?ws=${activeWorkspace.id}`}>
                Start Conversation
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
              <Network className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Knowledge Index</CardTitle>
            <CardDescription>
              Inspect vectors, review chunk boundaries, and verify semantic retrieval health inside PostgreSQL.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm" className="w-full justify-between">
              <Link href={`/knowledge?ws=${activeWorkspace.id}`}>
                Explore Knowledge
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Grounded Conversations */}
      {recentConversations.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Recent Conversations
              </CardTitle>
              <CardDescription>
                Continue previous grounded question-and-answer threads in this workspace.
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link href={`/chat?ws=${activeWorkspace.id}`}>
                View All
                <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {recentConversations.map((conv) => (
                <div
                  key={conv.id}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/chat?ws=${activeWorkspace.id}&conv=${conv.id}`}
                        className="text-xs font-semibold text-foreground hover:text-primary transition-colors truncate block"
                      >
                        {conv.title}
                      </Link>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        Updated {new Date(conv.updatedAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm" className="h-7 text-xs shrink-0">
                    <Link href={`/chat?ws=${activeWorkspace.id}&conv=${conv.id}`}>
                      Open Chat
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State / Guided Next Steps */}
      {docCount === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 md:p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <Upload className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-1">
            No documents in this workspace yet
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
            Get started by uploading your first PDF, DOCX, or TXT file to enable custom RAG retrieval and verifiable AI answers.
          </p>
          <Button asChild>
            <Link href={`/documents?ws=${activeWorkspace.id}`}>
              <Upload className="h-4 w-4 mr-2" />
              Upload your first document
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
