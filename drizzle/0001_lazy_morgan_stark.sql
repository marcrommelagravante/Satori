ALTER TABLE "document_chunks" ADD COLUMN IF NOT EXISTS "search_vector" "tsvector";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "document_chunks_embedding_hnsw_idx" ON "document_chunks" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "document_chunks_search_vector_gin_idx" ON "document_chunks" USING gin ("search_vector");--> statement-breakpoint
UPDATE "document_chunks" SET "search_vector" = to_tsvector('english', "content") WHERE "search_vector" IS NULL;