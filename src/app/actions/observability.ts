"use server";

import { requireAuth } from "@/lib/auth/session";
import { requireWorkspaceMember } from "@/lib/workspaces/guard";
import { getWorkspaceTelemetry } from "@/lib/observability";

export async function getObservabilityDataAction(workspaceId: string) {
  await requireAuth();
  await requireWorkspaceMember(workspaceId, "member");

  try {
    const telemetry = await getWorkspaceTelemetry(workspaceId, 40);
    return { success: true, telemetry };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load telemetry data",
      telemetry: null,
    };
  }
}
