import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { db } from "../src/lib/db";
import { sql } from "drizzle-orm";

async function backfillFts() {
  console.log("=== Backfilling document_chunks search_vector ===");
  try {
    const updateResult = await db.execute(
      sql`UPDATE document_chunks SET search_vector = to_tsvector('english', content) WHERE search_vector IS NULL;`
    );
    console.log("Update executed successfully.");

    const statsResult = await db.execute(
      sql`SELECT 
            count(*) as total_chunks,
            count(search_vector) as fts_indexed_chunks,
            count(embedding) as vector_indexed_chunks
          FROM document_chunks;`
    );
    console.log("Chunk statistics:", statsResult.rows || statsResult);
  } catch (error) {
    console.error("Backfill failed:", error);
    process.exit(1);
  }
}

backfillFts();
