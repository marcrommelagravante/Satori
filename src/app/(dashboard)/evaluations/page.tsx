import { requireAuth } from "@/lib/auth/session";
import { getUserWorkspaces } from "@/lib/workspaces/service";
import {
  getEvalRuns,
  getActiveBaseline,
  getEvalCases,
  getEvalRunDetails,
} from "@/lib/evaluations";
import { getWorkspaceTelemetry } from "@/lib/observability";
import { RAGPlaygroundView } from "@/components/evaluations/rag-playground-view";
import { redirect } from "next/navigation";

export default async function EvaluationsPage({
  searchParams,
}: {
  searchParams: Promise<{ ws?: string }>;
}) {
  const user = await requireAuth();
  const params = await searchParams;

  const workspaces = await getUserWorkspaces(user.id);
  if (workspaces.length === 0) {
    redirect("/workspaces");
  }

  const activeWorkspace =
    (params.ws && workspaces.find((w) => w.id === params.ws)) || workspaces[0];

  const [runs, baseline, cases, telemetry] = await Promise.all([
    getEvalRuns(activeWorkspace.id),
    getActiveBaseline(activeWorkspace.id),
    getEvalCases(activeWorkspace.id),
    getWorkspaceTelemetry(activeWorkspace.id),
  ]);

  const latestRunDetails =
    runs.length > 0
      ? await getEvalRunDetails(activeWorkspace.id, runs[0].id)
      : null;

  return (
    <RAGPlaygroundView
      workspaceId={activeWorkspace.id}
      initialRuns={runs}
      initialBaseline={baseline}
      initialCases={cases}
      initialDetails={latestRunDetails}
      initialTelemetry={telemetry}
    />
  );
}
