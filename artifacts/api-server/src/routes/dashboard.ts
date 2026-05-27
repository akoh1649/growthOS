import { Router } from "express";
import { db } from "@workspace/db";
import {
  sitesTable,
  analysesTable,
  agentTasksTable,
  contentItemsTable,
} from "@workspace/db";
import { desc, eq, count, sql } from "drizzle-orm";

const router = Router();

// GET /api/dashboard
router.get("/", async (req, res) => {
  try {
    // Get all sites
    const sites = await db.select().from(sitesTable).orderBy(desc(sitesTable.updatedAt)).limit(20);

    // Get latest analysis for each site
    const sitesWithAnalysis = await Promise.all(
      sites.map(async (site) => {
        const analyses = await db
          .select()
          .from(analysesTable)
          .where(eq(analysesTable.siteId, site.id))
          .orderBy(desc(analysesTable.createdAt))
          .limit(1);
        const latest = analyses[0];
        return {
          id: site.id,
          url: site.url,
          name: site.name ?? site.url,
          lastAnalysis: latest
            ? {
                score: latest.score ?? 0,
                issues: latest.issues ?? 0,
                created_at: latest.createdAt?.toISOString() ?? "",
              }
            : null,
        };
      })
    );

    // Recent tasks
    const recentTasks = await db
      .select()
      .from(agentTasksTable)
      .orderBy(desc(agentTasksTable.createdAt))
      .limit(20);

    // Count tasks per agent type
    const agentCountsRaw = await db
      .select({
        agentType: agentTasksTable.agentType,
        count: count(),
      })
      .from(agentTasksTable)
      .groupBy(agentTasksTable.agentType);

    const agentCounts: Record<string, number> = {
      seo: 0, geo: 0, writer: 0, reddit: 0, hackernews: 0, x: 0,
    };
    for (const row of agentCountsRaw) {
      agentCounts[row.agentType] = Number(row.count);
    }

    // Total analyses
    const totalAnalysesRow = await db.select({ count: count() }).from(analysesTable);
    const totalAnalyses = Number(totalAnalysesRow[0]?.count ?? 0);

    // Content generated
    const contentGeneratedRow = await db.select({ count: count() }).from(contentItemsTable);
    const contentGenerated = Number(contentGeneratedRow[0]?.count ?? 0);

    return res.json({
      sites: sitesWithAnalysis,
      recentTasks: recentTasks.map((t) => ({
        id: t.id,
        agentType: t.agentType,
        title: t.title,
        status: t.status,
        createdAt: t.createdAt?.toISOString() ?? "",
      })),
      agentCounts,
      totalAnalyses,
      contentGenerated,
    });
  } catch (err) {
    req.log.error(err);
    return res.json({
      sites: [],
      recentTasks: [],
      agentCounts: { seo: 0, geo: 0, writer: 0, reddit: 0, hackernews: 0, x: 0 },
      totalAnalyses: 0,
      contentGenerated: 0,
    });
  }
});

export default router;
