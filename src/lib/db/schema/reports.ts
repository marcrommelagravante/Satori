import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces";
import { users } from "./users";
import { conversations } from "./chat";

export const reportTypeEnum = pgEnum("report_type", [
  "document_summary",
  "document_comparison",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "generating",
  "completed",
  "failed",
]);

export const reports = pgTable(
  "reports",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    conversationId: text("conversation_id").references(() => conversations.id, {
      onDelete: "set null",
    }),
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    type: reportTypeEnum("type").notNull(),
    content: jsonb("content").notNull(),
    sourceDocumentIds: text("source_document_ids").array(),
    status: reportStatusEnum("status").default("generating").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("reports_workspace_idx").on(table.workspaceId),
    index("reports_created_at_idx").on(table.createdAt),
  ]
);

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
export type ReportType = (typeof reportTypeEnum.enumValues)[number];
export type ReportStatus = (typeof reportStatusEnum.enumValues)[number];
