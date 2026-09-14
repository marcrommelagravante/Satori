CREATE TYPE "public"."eval_run_status" AS ENUM('pending', 'running', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "eval_cases" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"created_by" text,
	"question" text NOT NULL,
	"expected_answer" text NOT NULL,
	"expected_chunk_ids" text[] DEFAULT '{}' NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"difficulty" text DEFAULT 'medium' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eval_results" (
	"id" text PRIMARY KEY NOT NULL,
	"run_id" text NOT NULL,
	"case_id" text NOT NULL,
	"retrieved_chunk_ids" text[] DEFAULT '{}' NOT NULL,
	"generated_answer" text,
	"citations" jsonb,
	"recall_k" double precision,
	"precision_k" double precision,
	"hit_rate" double precision,
	"correctness_score" double precision,
	"groundedness_score" double precision,
	"citation_score" double precision,
	"judge_feedback" text,
	"latency_ms" integer,
	"status" text DEFAULT 'passed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eval_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"created_by" text,
	"name" text NOT NULL,
	"status" "eval_run_status" DEFAULT 'pending' NOT NULL,
	"is_baseline" boolean DEFAULT false NOT NULL,
	"total_cases" integer DEFAULT 0 NOT NULL,
	"retrieval_recall_k" double precision,
	"retrieval_precision_k" double precision,
	"answer_correctness" double precision,
	"groundedness_score" double precision,
	"citation_accuracy" double precision,
	"avg_latency_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "eval_cases" ADD CONSTRAINT "eval_cases_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eval_cases" ADD CONSTRAINT "eval_cases_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eval_results" ADD CONSTRAINT "eval_results_run_id_eval_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."eval_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eval_results" ADD CONSTRAINT "eval_results_case_id_eval_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."eval_cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eval_runs" ADD CONSTRAINT "eval_runs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eval_runs" ADD CONSTRAINT "eval_runs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "eval_cases_workspace_idx" ON "eval_cases" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "eval_cases_created_at_idx" ON "eval_cases" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "eval_results_run_idx" ON "eval_results" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "eval_results_case_idx" ON "eval_results" USING btree ("case_id");--> statement-breakpoint
CREATE INDEX "eval_runs_workspace_idx" ON "eval_runs" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "eval_runs_created_at_idx" ON "eval_runs" USING btree ("created_at");