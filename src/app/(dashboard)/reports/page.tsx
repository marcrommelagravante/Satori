import { requireAuth } from "@/lib/auth/session";
import { getUserWorkspaces } from "@/lib/workspaces/service";
import { getReports } from "@/lib/reports";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ReportsView } from "@/components/reports/reports-view";

interface ReportsPageProps {
  searchParams: Promise<{ ws?: string }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const user = await requireAuth();
  const params = await searchParams;
  const workspaces = await getUserWorkspaces(user.id);

  if (workspaces.length === 0) {
    redirect("/workspaces/new");
  }

  const activeWorkspace =
    (params.ws && workspaces.find((w) => w.id === params.ws)) || workspaces[0];

  // Fetch reports for active workspace
  const reportsList = await getReports(activeWorkspace.id);

  // Fetch workspace documents to map IDs to names
  const workspaceDocs = await db
    .select({ id: documents.id, name: documents.name })
    .from(documents)
    .where(eq(documents.workspaceId, activeWorkspace.id));

  const documentNamesMap: Record<string, string> = {};
  for (const doc of workspaceDocs) {
    documentNamesMap[doc.id] = doc.name;
  }

  return (
    <ReportsView
      reports={reportsList}
      workspaceId={activeWorkspace.id}
      documentNamesMap={documentNamesMap}
      availableDocuments={workspaceDocs}
    />
  );
}
