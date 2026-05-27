import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();

    // Get all sites with their latest analysis
    const sites = db
      .prepare(
        `SELECT s.id, s.url, s.name,
                a.score, a.issues, a.created_at as last_analysis_at
         FROM sites s
         LEFT JOIN (
           SELECT site_id, score, issues, created_at,
                  ROW_NUMBER() OVER (PARTITION BY site_id ORDER BY created_at DESC) as rn
           FROM analyses
         ) a ON s.id = a.site_id AND a.rn = 1
         ORDER BY s.updated_at DESC
         LIMIT 20`
      )
      .all() as Array<{
      id: string;
      url: string;
      name: string;
      score: number | null;
      issues: number | null;
      last_analysis_at: string | null;
    }>;

    const mappedSites = sites.map((s) => ({
      id: s.id,
      url: s.url,
      name: s.name,
      lastAnalysis: s.score !== null
        ? {
            score: s.score,
            issues: s.issues ?? 0,
            created_at: s.last_analysis_at,
          }
        : null,
    }));

    // Get recent tasks
    const recentTasks = db
      .prepare(
        `SELECT id, agent_type, title, status, created_at
         FROM agent_tasks
         ORDER BY created_at DESC
         LIMIT 20`
      )
      .all() as Array<{
      id: string;
      agent_type: string;
      title: string;
      status: string;
      created_at: string;
    }>;

    // Count tasks per agent type
    const agentCountsRaw = db
      .prepare(
        `SELECT agent_type, COUNT(*) as count
         FROM agent_tasks
         GROUP BY agent_type`
      )
      .all() as Array<{ agent_type: string; count: number }>;

    const agentCounts: Record<string, number> = {
      seo: 0,
      geo: 0,
      writer: 0,
      reddit: 0,
      hackernews: 0,
      x: 0,
    };
    for (const row of agentCountsRaw) {
      agentCounts[row.agent_type] = row.count;
    }

    // Total analyses
    const totalAnalysesRow = db
      .prepare(`SELECT COUNT(*) as count FROM analyses`)
      .get() as { count: number };

    // Content generated
    const contentGeneratedRow = db
      .prepare(`SELECT COUNT(*) as count FROM content_items`)
      .get() as { count: number };

    return NextResponse.json({
      sites: mappedSites,
      recentTasks: recentTasks.map((t) => ({
        id: t.id,
        agentType: t.agent_type,
        title: t.title,
        status: t.status,
        createdAt: t.created_at,
      })),
      agentCounts,
      totalAnalyses: totalAnalysesRow.count,
      contentGenerated: contentGeneratedRow.count,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      {
        sites: [],
        recentTasks: [],
        agentCounts: { seo: 0, geo: 0, writer: 0, reddit: 0, hackernews: 0, x: 0 },
        totalAnalyses: 0,
        contentGenerated: 0,
      },
      { status: 200 }
    );
  }
}