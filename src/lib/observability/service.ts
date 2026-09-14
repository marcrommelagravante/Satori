import { db } from "@/lib/db";
import { aiRuns, type AiRun } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export interface TelemetrySummary {
  totalRuns: number;
  successRuns: number;
  failedRuns: number;
  successRate: number; // 0 - 100
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  operations: Array<{
    operation: string;
    count: number;
    avgLatencyMs: number;
  }>;
  recentTraces: AiRun[];
}

/**
 * Computes telemetry analytics for a workspace from the ai_runs table.
 * Strictly multi-tenant safe (filtered by workspaceId).
 */
export async function getWorkspaceTelemetry(
  workspaceId: string,
  traceLimit: number = 30
): Promise<TelemetrySummary> {
  const allRuns = await db
    .select()
    .from(aiRuns)
    .where(eq(aiRuns.workspaceId, workspaceId))
    .orderBy(desc(aiRuns.createdAt));

  const totalRuns = allRuns.length;

  if (totalRuns === 0) {
    return {
      totalRuns: 0,
      successRuns: 0,
      failedRuns: 0,
      successRate: 100,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalTokens: 0,
      avgLatencyMs: 0,
      p50LatencyMs: 0,
      p95LatencyMs: 0,
      operations: [],
      recentTraces: [],
    };
  }

  let successRuns = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalLatency = 0;
  const latencies: number[] = [];

  const opMap = new Map<string, { count: number; totalLatency: number }>();

  for (const run of allRuns) {
    if (run.status === "success") {
      successRuns++;
    }
    const input = run.inputTokens || 0;
    const output = run.outputTokens || 0;
    totalInputTokens += input;
    totalOutputTokens += output;

    if (typeof run.latencyMs === "number") {
      totalLatency += run.latencyMs;
      latencies.push(run.latencyMs);
    }

    const op = run.operation || "unknown";
    const current = opMap.get(op) || { count: 0, totalLatency: 0 };
    current.count++;
    current.totalLatency += run.latencyMs || 0;
    opMap.set(op, current);
  }

  latencies.sort((a, b) => a - b);
  const p50Index = Math.floor(latencies.length * 0.5);
  const p95Index = Math.floor(latencies.length * 0.95);
  const p50LatencyMs = latencies[p50Index] || 0;
  const p95LatencyMs = latencies[p95Index] || 0;

  const avgLatencyMs = latencies.length > 0 ? Math.round(totalLatency / latencies.length) : 0;
  const successRate = Number(((successRuns / totalRuns) * 100).toFixed(1));

  const operations = Array.from(opMap.entries()).map(([operation, data]) => ({
    operation,
    count: data.count,
    avgLatencyMs: Math.round(data.totalLatency / data.count),
  }));

  return {
    totalRuns,
    successRuns,
    failedRuns: totalRuns - successRuns,
    successRate,
    totalInputTokens,
    totalOutputTokens,
    totalTokens: totalInputTokens + totalOutputTokens,
    avgLatencyMs,
    p50LatencyMs,
    p95LatencyMs,
    operations,
    recentTraces: allRuns.slice(0, traceLimit),
  };
}
