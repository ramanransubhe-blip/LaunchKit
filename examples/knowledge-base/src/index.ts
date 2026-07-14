import express from "express";
import { createLogger } from "@devlaunchkit/logger";
import { initAuth, requireAuth } from "@devlaunchkit/auth";
import { db } from "@devlaunchkit/database";
import { documentsRouter } from "./routes/documents.js";
import { searchRouter } from "./routes/search.js";

const logger = createLogger({ service: "knowledge-base" });
const app = express();
const PORT = process.env.PORT ?? 4005;

/* ------------------------------------------------------------------ */
/*  Middleware                                                         */
/* ------------------------------------------------------------------ */

app.use(express.json({ limit: "10mb" }));

const auth = initAuth({
  provider: "better-auth",
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
});
app.use(auth.middleware);

/* ------------------------------------------------------------------ */
/*  Routes                                                             */
/* ------------------------------------------------------------------ */

app.use("/api/documents", requireAuth(), documentsRouter);
app.use("/api/search", requireAuth(), searchRouter);

/** Health check */
app.get("/health", async (_req, res) => {
  try {
    await db.raw("SELECT 1");
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: "unhealthy" });
  }
});

/** Collection statistics */
app.get("/api/stats", requireAuth(), async (_req, res) => {
  try {
    const [docCount] = await db("documents").count("* as count");
    const [chunkCount] = await db("document_chunks").count("* as count");

    const recentDocs = await db("documents")
      .select("id", "title", "created_at")
      .orderBy("created_at", "desc")
      .limit(5);

    res.json({
      totalDocuments: Number(docCount?.count ?? 0),
      totalChunks: Number(chunkCount?.count ?? 0),
      recentDocuments: recentDocs,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Failed to fetch stats", { error });
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ------------------------------------------------------------------ */
/*  Start                                                              */
/* ------------------------------------------------------------------ */

app.listen(PORT, () => {
  logger.info(`Knowledge Base running on http://localhost:${PORT}`);
  logger.info("Routes:");
  logger.info("  POST /api/documents             → Upload & index document");
  logger.info("  GET  /api/documents/:id          → Get document");
  logger.info("  DELETE /api/documents/:id         → Delete document");
  logger.info("  POST /api/search                → Semantic search");
  logger.info("  GET  /api/search/suggest          → Autocomplete suggestions");
  logger.info("  GET  /api/stats                  → Collection statistics");
});

export { app };
