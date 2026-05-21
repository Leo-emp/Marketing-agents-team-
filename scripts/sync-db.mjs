/* ============================================================
   SYNC DB - Create tables and add missing columns in Turso
   ============================================================
   Runs during Vercel builds to ensure the production database
   has all tables and columns the Prisma schema expects.
   Uses CREATE TABLE IF NOT EXISTS + ALTER TABLE ADD COLUMN.
   ============================================================ */

import { createClient } from "@libsql/client";

/* -- Schema mirrors prisma/schema.prisma -- */
const SCHEMA = {
  Content: {
    id: "TEXT PRIMARY KEY",
    agent: "TEXT",
    platform: "TEXT",
    contentType: "TEXT",
    title: "TEXT",
    body: "TEXT",
    captionText: "TEXT",
    hashtags: "TEXT",
    mediaPrompt: "TEXT",
    hook: "TEXT",
    status: "TEXT DEFAULT 'pending'",
    scheduledFor: "DATETIME",
    postedAt: "DATETIME",
    platformPostId: "TEXT",
    notes: "TEXT",
    researchBrief: "TEXT",
    visualData: "TEXT",
    imageUrl: "TEXT",
    videoUrl: "TEXT",
    videoRenderId: "TEXT",
    createdAt: "DATETIME DEFAULT CURRENT_TIMESTAMP",
    updatedAt: "DATETIME DEFAULT CURRENT_TIMESTAMP",
  },
  ContentPlan: {
    id: "TEXT PRIMARY KEY",
    weekOf: "TEXT",
    plan: "TEXT",
    status: "TEXT DEFAULT 'draft'",
    createdAt: "DATETIME DEFAULT CURRENT_TIMESTAMP",
    updatedAt: "DATETIME DEFAULT CURRENT_TIMESTAMP",
  },
  PlatformCredential: {
    id: "TEXT PRIMARY KEY",
    platform: "TEXT UNIQUE",
    accessToken: "TEXT",
    refreshToken: "TEXT",
    expiresAt: "DATETIME",
    metadata: "TEXT",
    createdAt: "DATETIME DEFAULT CURRENT_TIMESTAMP",
    updatedAt: "DATETIME DEFAULT CURRENT_TIMESTAMP",
  },
  Visual: {
    id: "TEXT PRIMARY KEY",
    contentId: "TEXT",
    type: "TEXT",
    slideIndex: "INTEGER DEFAULT 0",
    templateId: "TEXT",
    data: "TEXT",
    width: "INTEGER DEFAULT 1080",
    height: "INTEGER DEFAULT 1080",
    createdAt: "DATETIME DEFAULT CURRENT_TIMESTAMP",
    updatedAt: "DATETIME DEFAULT CURRENT_TIMESTAMP",
  },
  KpiMetric: {
    id: "TEXT PRIMARY KEY",
    platform: "TEXT",
    contentId: "TEXT",
    metricType: "TEXT",
    value: "REAL",
    date: "TEXT",
    source: "TEXT DEFAULT 'manual'",
    notes: "TEXT",
    createdAt: "DATETIME DEFAULT CURRENT_TIMESTAMP",
    updatedAt: "DATETIME DEFAULT CURRENT_TIMESTAMP",
  },
  KpiGoal: {
    id: "TEXT PRIMARY KEY",
    platform: "TEXT",
    metricType: "TEXT",
    targetValue: "REAL",
    period: "TEXT",
    startDate: "TEXT",
    endDate: "TEXT",
    createdAt: "DATETIME DEFAULT CURRENT_TIMESTAMP",
    updatedAt: "DATETIME DEFAULT CURRENT_TIMESTAMP",
  },
};

async function syncDatabase() {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  if (!url || !authToken || url.startsWith("file:")) {
    console.log("[sync-db] Skipping — local or no Turso credentials");
    return;
  }

  console.log("[sync-db] Connecting to production database...");
  const client = createClient({ url, authToken });

  for (const [table, columns] of Object.entries(SCHEMA)) {
    /* -- Create table if it doesn't exist (uses first column as PK) -- */
    const colDefs = Object.entries(columns)
      .map(([col, type]) => `${col} ${type}`)
      .join(", ");
    const createSql = `CREATE TABLE IF NOT EXISTS ${table} (${colDefs})`;
    console.log(`[sync-db] Ensuring table: ${table}`);
    await client.execute(createSql);

    /* -- Add any missing columns -- */
    const existing = await client.execute(`PRAGMA table_info(${table})`);
    const existingCols = new Set(existing.rows.map((r) => r.name));

    for (const [col, type] of Object.entries(columns)) {
      if (!existingCols.has(col)) {
        const cleanType = type.replace("PRIMARY KEY", "").replace("UNIQUE", "").trim();
        const sql = `ALTER TABLE ${table} ADD COLUMN ${col} ${cleanType}`;
        console.log(`[sync-db] Adding column: ${table}.${col}`);
        await client.execute(sql);
      }
    }
  }

  /* -- Create indexes for common queries -- */
  const indexes = [
    "CREATE INDEX IF NOT EXISTS idx_content_status ON Content(status)",
    "CREATE INDEX IF NOT EXISTS idx_content_platform ON Content(platform)",
    "CREATE INDEX IF NOT EXISTS idx_content_scheduled ON Content(scheduledFor)",
    "CREATE INDEX IF NOT EXISTS idx_visual_contentId ON Visual(contentId)",
    "CREATE INDEX IF NOT EXISTS idx_kpi_platform ON KpiMetric(platform)",
    "CREATE INDEX IF NOT EXISTS idx_kpi_date ON KpiMetric(date)",
    "CREATE INDEX IF NOT EXISTS idx_kpi_contentId ON KpiMetric(contentId)",
  ];
  for (const sql of indexes) {
    await client.execute(sql);
  }

  console.log("[sync-db] Database sync complete");
}

syncDatabase().catch((e) => {
  console.error("[sync-db] Failed:", e.message);
  process.exit(0);
});
