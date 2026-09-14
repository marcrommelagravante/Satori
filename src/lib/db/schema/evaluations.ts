import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  jsonb,
  index,
  boolean,
  integer,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces";
import { users } from "./users";

export const evalRunStatusEnum = pgEnum("eval_run_status", [
  "pending",
  "running",
  "completed",
  "failed",
]);

export const evalCases = pgTable(
  "eval_cases",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    question: text("question").notNull(),
    expectedAnswer: text("expected_answer").notNull(),
    expectedChunkIds: text("expected_chunk_ids").array().notNull().default([]),
    category: text("category").notNull().default("general"),
    difficulty: text("difficulty").notNull().default("medium"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("eval_cases_workspace_idx").on(table.workspaceId),
    index("eval_cases_created_at_idx").on(table.createdAt),
  ]
);

export const evalRuns = pgTable(
  "eval_runs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    status: evalRunStatusEnum("status").default("pending").notNull(),
    isBaseline: boolean("is_baseline").default(false).notNull(),
    totalCases: integer("total_cases").default(0).notNull(),
    retrievalRecallK: doublePrecision("retrieval_recall_k"),
    retrievalPrecisionK: doublePrecision("retrieval_precision_k"),
    answerCorrectness: doublePrecision("answer_correctness"),
    groundednessScore: doublePrecision("groundedness_score"),
    citationAccuracy: doublePrecision("citation_accuracy"),
    avgLatencyMs: integer("avg_latency_ms"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { mode: "date" }),
  },
  (table) => [
    index("eval_runs_workspace_idx").on(table.workspaceId),
    index("eval_runs_created_at_idx").on(table.createdAt),
  ]
);

export const evalResults = pgTable(
  "eval_results",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    runId: text("run_id")
      .notNull()
      .references(() => evalRuns.id, { onDelete: "cascade" }),
    caseId: text("case_id")
      .notNull()
      .references(() => evalCases.id, { onDelete: "cascade" }),
    retrievedChunkIds: text("retrieved_chunk_ids").array().notNull().default([]),
    generatedAnswer: text("generated_answer"),
    citations: jsonb("citations"),
    recallK: doublePrecision("recall_k"),
    precisionK: doublePrecision("precision_k"),
    hitRate: doublePrecision("hit_rate"),
    correctnessScore: doublePrecision("correctness_score"),
    groundednessScore: doublePrecision("groundedness_score"),
    citationScore: doublePrecision("citation_score"),
    judgeFeedback: text("judge_feedback"),
    latencyMs: integer("latency_ms"),
    status: text("status").default("passed").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("eval_results_run_idx").on(table.runId),
    index("eval_results_case_idx").on(table.caseId),
  ]
);

export type EvalCase = typeof evalCases.$inferSelect;
export type NewEvalCase = typeof evalCases.$inferInsert;
export type EvalRun = typeof evalRuns.$inferSelect;
export type NewEvalRun = typeof evalRuns.$inferInsert;
export type EvalResult = typeof evalResults.$inferSelect;
export type NewEvalResult = typeof evalResults.$inferInsert;
export type EvalRunStatus = (typeof evalRunStatusEnum.enumValues)[number];
