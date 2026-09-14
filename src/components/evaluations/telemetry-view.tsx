"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Zap,
  Search,
  ChevronDown,
  ChevronUp,
  Wrench,
  BarChart2,
} from "lucide-react";
import type { TelemetrySummary } from "@/lib/observability";

interface TelemetryViewProps {
  telemetry: TelemetrySummary | null;
}

export function TelemetryView({ telemetry }: TelemetryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOperation, setSelectedOperation] = useState<string>("all");
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);

  if (!telemetry || telemetry.totalRuns === 0) {
    return (
      <Card className="border-dashed border-border bg-card/40">
        <CardContent className="p-8 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Activity className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-foreground text-base">No Telemetry Recorded Yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Interact with Chat, execute Agent requests, or run Evaluations to stream live AI operational metrics, latency percentiles, and token consumption.
          </p>
        </CardContent>
      </Card>
    );
  }

  const filteredTraces = telemetry.recentTraces.filter((trace) => {
    const matchesOp =
      selectedOperation === "all" || trace.operation === selectedOperation;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      trace.operation.toLowerCase().includes(query) ||
      trace.model.toLowerCase().includes(query) ||
      (trace.status && trace.status.toLowerCase().includes(query));
    return matchesOp && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Total AI Requests</span>
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {telemetry.totalRuns.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {telemetry.successRuns} succeeded • {telemetry.failedRuns} failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Success Rate</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {telemetry.successRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Reliability across RAG, Agent, and Eval calls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Total Token Volume</span>
              <Cpu className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {telemetry.totalTokens.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              In: {telemetry.totalInputTokens.toLocaleString()} • Out: {telemetry.totalOutputTokens.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Latency Profile</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {telemetry.avgLatencyMs}ms
            </div>
            <p className="text-xs text-muted-foreground">
              p50: {telemetry.p50LatencyMs}ms • p95: {telemetry.p95LatencyMs}ms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Operation Breakdown Cards */}
      {telemetry.operations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Operations Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {telemetry.operations.map((op) => (
                <div
                  key={op.operation}
                  className="p-3 rounded-lg border border-border bg-card/60 space-y-1 text-xs"
                >
                  <div className="font-semibold text-foreground capitalize truncate">
                    {op.operation.replace(/_/g, " ")}
                  </div>
                  <div className="text-muted-foreground flex justify-between items-center">
                    <span>{op.count} calls</span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono">
                      {op.avgLatencyMs}ms
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live AI Trace Log */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">Live AI Request Traces</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Audit log of recent model calls, latencies, tokens, and tool executions.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-48">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Filter traces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-card"
              />
            </div>

            <select
              value={selectedOperation}
              onChange={(e) => setSelectedOperation(e.target.value)}
              className="rounded-md border border-input bg-card px-2 text-xs h-8 text-foreground"
            >
              <option value="all">All Operations</option>
              {telemetry.operations.map((op) => (
                <option key={op.operation} value={op.operation}>
                  {op.operation}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>

        <CardContent>
          {filteredTraces.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-border rounded-lg">
              No matching trace records found.
            </div>
          ) : (
            <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
              {filteredTraces.map((trace) => {
                const isExpanded = expandedTraceId === trace.id;
                const toolCalls = Array.isArray(trace.toolCalls) ? trace.toolCalls : [];

                return (
                  <div
                    key={trace.id}
                    className="p-3 hover:bg-muted/30 transition-colors space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2 flex-1">
                        {trace.status === "success" ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                        )}

                        <span className="font-mono font-semibold text-foreground capitalize">
                          {trace.operation.replace(/_/g, " ")}
                        </span>

                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono">
                          {trace.model}
                        </Badge>

                        {toolCalls.length > 0 && (
                          <Badge
                            variant="outline"
                            className="bg-primary/10 text-primary border-primary/20 text-[10px] py-0 px-1.5"
                          >
                            <Wrench className="h-2.5 w-2.5 mr-1" />
                            {toolCalls.length} tool {toolCalls.length === 1 ? "call" : "calls"}
                          </Badge>
                        )}

                        <span className="text-muted-foreground ml-auto sm:ml-0">
                          {new Date(trace.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-muted-foreground">
                          {trace.latencyMs ?? 0}ms
                        </span>

                        <span className="text-muted-foreground hidden sm:inline">
                          Tokens: <strong className="text-foreground">{(trace.inputTokens || 0) + (trace.outputTokens || 0)}</strong>
                        </span>

                        {toolCalls.length > 0 && (
                          <button
                            onClick={() => setExpandedTraceId(isExpanded ? null : trace.id)}
                            className="text-muted-foreground hover:text-foreground p-1 rounded"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expandable tool calls trace */}
                    {isExpanded && toolCalls.length > 0 && (
                      <div className="p-3 rounded-md bg-muted/60 border border-border/50 space-y-2 mt-2">
                        <div className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px] flex items-center gap-1">
                          <Wrench className="h-3 w-3" />
                          Tool Execution Chain:
                        </div>
                        <div className="space-y-1.5">
                          {toolCalls.map((tc: any, i: number) => (
                            <div
                              key={i}
                              className="p-2 rounded bg-card border border-border flex items-center justify-between text-[11px]"
                            >
                              <div className="space-y-0.5">
                                <span className="font-mono font-medium text-primary">
                                  {tc.toolName}
                                </span>
                                {tc.resultSummary && (
                                  <p className="text-muted-foreground line-clamp-1">
                                    {tc.resultSummary}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground font-mono">
                                  {tc.durationMs}ms
                                </span>
                                {tc.success ? (
                                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] py-0 px-1">
                                    OK
                                  </Badge>
                                ) : (
                                  <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-[9px] py-0 px-1">
                                    FAIL
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
