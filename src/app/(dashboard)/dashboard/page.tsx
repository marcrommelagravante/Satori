import { requireAuth } from "@/lib/auth/session";
import { getUserWorkspaces } from "@/lib/workspaces/service";
import { db } from "@/lib/db";
import {
  documents,
  conversations,
  documentChunks,
  documentVersions,
} from "@/lib/db/schema";
import { eq, count, desc, and, inArray, isNotNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Upload,
  Sparkles,
  Network,
  MessageSquare,
  ArrowRight,
  Compass,
} from "lucide-react";

interface DashboardPageProps {
  searchParams: Promise<{ ws?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await requireAuth();
  const params = await searchParams;

  const workspaces = await getUserWorkspaces(user.id);
  if (workspaces.length === 0) {
    redirect("/workspaces/new");
  }

  const activeWorkspace =
    (params.ws && workspaces.find((w) => w.id === params.ws)) || workspaces[0];

  // Fetch 100% REAL metrics for this specific workspace
  const [docCountRes] = await db
    .select({ value: count() })
    .from(documents)
    .where(eq(documents.workspaceId, activeWorkspace.id));

  const [processingDocCountRes] = await db
    .select({ value: count() })
    .from(documents)
    .where(
      and(
        eq(documents.workspaceId, activeWorkspace.id),
        inArray(documents.status, ["processing", "pending"])
      )
    );

  const [chatCountRes] = await db
    .select({ value: count() })
    .from(conversations)
    .where(eq(conversations.workspaceId, activeWorkspace.id));

  const [chunkCountRes] = await db
    .select({ value: count() })
    .from(documentChunks)
    .innerJoin(
      documentVersions,
      eq(documentChunks.documentVersionId, documentVersions.id)
    )
    .innerJoin(documents, eq(documentVersions.documentId, documents.id))
    .where(eq(documents.workspaceId, activeWorkspace.id));

  const [embeddingCountRes] = await db
    .select({ value: count() })
    .from(documentChunks)
    .innerJoin(
      documentVersions,
      eq(documentChunks.documentVersionId, documentVersions.id)
    )
    .innerJoin(documents, eq(documentVersions.documentId, documents.id))
    .where(
      and(
        eq(documents.workspaceId, activeWorkspace.id),
        isNotNull(documentChunks.embedding)
      )
    );

  // Real recent documents for active workspace
  const recentDocs = await db
    .select()
    .from(documents)
    .where(eq(documents.workspaceId, activeWorkspace.id))
    .orderBy(desc(documents.createdAt))
    .limit(4);

  const realDocCount = docCountRes?.value ?? 0;
  const processingDocCount = processingDocCountRes?.value ?? 0;
  const realChatCount = chatCountRes?.value ?? 0;
  const realChunkCount = chunkCountRes?.value ?? 0;
  const realEmbeddingCount = embeddingCountRes?.value ?? 0;

  // Format real embedding counts nicely without fake defaults
  const formatCount = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(1)}k`;
    return val.toLocaleString();
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "0 KB";
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const getFileBadge = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") {
      return {
        label: "PDF",
        iconColor: "text-rose-500 dark:text-rose-400",
        iconBg: "bg-rose-50 dark:bg-rose-950/40",
      };
    }
    if (ext === "docx" || ext === "doc") {
      return {
        label: "DOCX",
        iconColor: "text-blue-500 dark:text-blue-400",
        iconBg: "bg-blue-50 dark:bg-blue-950/40",
      };
    }
    return {
      label: ext?.toUpperCase() || "TXT",
      iconColor: "text-indigo-500 dark:text-indigo-400",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/40",
    };
  };

  return (
    <div className="space-y-6 w-full" data-density="high">
      {/* Greeting Header (without icon) */}
      <div>
        <h1 className="font-heading text-2xl md:text-[28px] font-bold tracking-tight text-slate-900 dark:text-foreground">
          Welcome to {activeWorkspace.name}
        </h1>
        <p className="text-sm text-slate-500 dark:text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening in your workspace today.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Total Documents */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-5 shadow-xs hover:border-slate-300 dark:hover:border-border transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-muted-foreground">Total Documents</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EEF2FF] dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="font-heading text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight">
              {realDocCount}
            </span>
            {processingDocCount > 0 ? (
              <span className="inline-flex items-center text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/40">
                {processingDocCount} Processing
              </span>
            ) : realDocCount > 0 ? (
              <span className="inline-flex items-center text-[11px] font-semibold text-[#059669] dark:text-emerald-400 bg-[#ECFDF5] dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-[#A7F3D0] dark:border-emerald-800/40">
                All Indexed
              </span>
            ) : (
              <span className="inline-flex items-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-muted px-2 py-0.5 rounded-full">
                Ready
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Indexed Chunks */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-5 shadow-xs hover:border-slate-300 dark:hover:border-border transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-muted-foreground">Indexed Chunks</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EEF2FF] dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400">
              <Network className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="font-heading text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight">
              {realChunkCount.toLocaleString()}
            </span>
            {realChunkCount > 0 ? (
              <span className="inline-flex items-center text-[11px] font-semibold text-[#059669] dark:text-emerald-400 bg-[#ECFDF5] dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-[#A7F3D0] dark:border-emerald-800/40">
                Vectorized
              </span>
            ) : (
              <span className="inline-flex items-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-muted px-2 py-0.5 rounded-full">
                Ready
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Vector Embeddings */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-5 shadow-xs hover:border-slate-300 dark:hover:border-border transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-muted-foreground">Vector Embeddings</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EEF2FF] dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="font-heading text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight">
              {formatCount(realEmbeddingCount)}
            </span>
            {realEmbeddingCount > 0 ? (
              <span className="inline-flex items-center text-[11px] font-semibold text-[#4F46E5] dark:text-indigo-400 bg-[#EEF2FF] dark:bg-indigo-950/50 px-2 py-0.5 rounded-full border border-[#C7D2FE] dark:border-indigo-800/40">
                pgvector
              </span>
            ) : (
              <span className="inline-flex items-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-muted px-2 py-0.5 rounded-full">
                768-dim
              </span>
            )}
          </div>
        </div>

        {/* Card 4: Conversations */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-5 shadow-xs hover:border-slate-300 dark:hover:border-border transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-muted-foreground">Conversations</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EEF2FF] dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="font-heading text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight">
              {realChatCount}
            </span>
            {realChatCount > 0 ? (
              <span className="inline-flex items-center text-[11px] font-semibold text-[#059669] dark:text-emerald-400 bg-[#ECFDF5] dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-[#A7F3D0] dark:border-emerald-800/40">
                Active
              </span>
            ) : (
              <span className="inline-flex items-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-muted px-2 py-0.5 rounded-full">
                Ready
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid with Equal Height Symmetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Column: Recent Documents Card */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-6 shadow-xs flex flex-col justify-between h-full min-h-[380px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-base font-bold text-slate-900 dark:text-foreground">
                Recent Documents
              </h2>
              <Link
                href={`/documents?ws=${activeWorkspace.id}`}
                className="text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] dark:text-indigo-400 transition-colors flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {recentDocs.length === 0 ? (
              <div className="py-14 flex flex-col items-center justify-center text-center gap-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-muted text-slate-400 mb-1">
                  <FileText className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  No documents in this workspace yet
                </p>
                <p className="text-xs text-slate-400 dark:text-muted-foreground max-w-xs">
                  Upload files to activate search, citations, and grounded AI answers.
                </p>
                <Link
                  href={`/documents?ws=${activeWorkspace.id}&upload=open`}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F46E5] dark:text-indigo-400 hover:underline"
                >
                  <span>Upload a document</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-border/40">
                {recentDocs.map((doc) => {
                  const badge = getFileBadge(doc.name);
                  const isProcessing = doc.status === "processing" || doc.status === "pending";
                  const isFailed = doc.status === "failed";
                  const dateStr = new Date(doc.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <div
                      key={doc.id}
                      className="py-3.5 flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3.5 truncate">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${badge.iconBg}`}>
                          <FileText className={`h-4.5 w-4.5 ${badge.iconColor}`} />
                        </div>
                        <div className="flex flex-col truncate">
                          <span className="text-sm font-semibold text-slate-800 dark:text-foreground truncate group-hover:text-[#4F46E5] transition-colors">
                            {doc.name}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-muted-foreground mt-0.5 font-normal">
                            {badge.label} &bull; {formatFileSize(doc.sizeBytes)} &bull; {dateStr}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isProcessing ? (
                          <span className="inline-flex items-center rounded-full bg-[#F5F3FF] dark:bg-purple-950/50 px-3 py-0.5 text-xs font-semibold text-[#7C3AED] dark:text-purple-400 border border-[#DDD6FE] dark:border-purple-800/40">
                            Processing
                          </span>
                        ) : isFailed ? (
                          <span className="inline-flex items-center rounded-full bg-rose-50 dark:bg-red-950/50 px-3 py-0.5 text-xs font-semibold text-rose-600 dark:text-red-400 border border-rose-200 dark:border-red-800/40">
                            Failed
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-[#ECFDF5] dark:bg-emerald-950/50 px-3 py-0.5 text-xs font-semibold text-[#059669] dark:text-emerald-400 border border-[#A7F3D0] dark:border-emerald-800/40">
                            Indexed
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions Enclosed in Matching Card */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-6 shadow-xs flex flex-col justify-between h-full min-h-[380px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-base font-bold text-slate-900 dark:text-foreground">
                Quick Actions
              </h2>
            </div>

            {/* 3 Structured Action Items */}
            <div className="space-y-3">
              {/* Action 1: Upload Documents */}
              <Link
                href={`/documents?ws=${activeWorkspace.id}&upload=open`}
                className="p-3.5 rounded-xl border border-slate-200/70 dark:border-border/60 hover:border-[#4F46E5]/40 hover:bg-slate-50/70 dark:hover:bg-muted/40 transition-all flex items-center gap-3.5 group cursor-pointer"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400 group-hover:scale-105 transition-transform">
                  <Upload className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-900 dark:text-foreground tracking-tight">
                    Upload Documents
                  </div>
                  <div className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5 truncate">
                    Add files to your workspace for indexing
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-[#4F46E5] group-hover:translate-x-0.5 transition-all" />
              </Link>

              {/* Action 2: Ask AI */}
              <Link
                href={`/chat?ws=${activeWorkspace.id}`}
                className="p-3.5 rounded-xl border border-slate-200/70 dark:border-border/60 hover:border-[#4F46E5]/40 hover:bg-slate-50/70 dark:hover:bg-muted/40 transition-all flex items-center gap-3.5 group cursor-pointer"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400 group-hover:scale-105 transition-transform">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-900 dark:text-foreground tracking-tight">
                    Ask AI
                  </div>
                  <div className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5 truncate">
                    Get answers grounded in your workspace
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-[#4F46E5] group-hover:translate-x-0.5 transition-all" />
              </Link>

              {/* Action 3: Explore Knowledge */}
              <Link
                href={`/knowledge?ws=${activeWorkspace.id}`}
                className="p-3.5 rounded-xl border border-slate-200/70 dark:border-border/60 hover:border-[#4F46E5]/40 hover:bg-slate-50/70 dark:hover:bg-muted/40 transition-all flex items-center gap-3.5 group cursor-pointer"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400 group-hover:scale-105 transition-transform">
                  <Compass className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-900 dark:text-foreground tracking-tight">
                    Explore Knowledge
                  </div>
                  <div className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5 truncate">
                    Search vector embeddings and text chunks
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-[#4F46E5] group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>

          {/* Promo Feature Banner neatly docked at the bottom of the card */}
          <div className="rounded-xl bg-[#EEF2FF] dark:bg-indigo-950/40 border border-[#E0E7FF] dark:border-indigo-900/50 p-4 flex items-center justify-between gap-3 mt-4 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4F46E5] text-white shadow-xs">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <div className="font-heading text-xs sm:text-sm font-bold text-slate-900 dark:text-foreground tracking-tight truncate">
                  Turn your documents into insights
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-300 mt-0.5 line-clamp-1">
                  Let Satori index, connect, and cite information for you.
                </p>
              </div>
            </div>

            <Link
              href={`/documents?ws=${activeWorkspace.id}&upload=open`}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-xs transition-colors"
              aria-label="Upload documents"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
