import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { analyzeSeo } from "@/lib/seo";
import { v4 as uuid } from "uuid";

const AGENT_TYPES = [
  "seo",
  "geo",
  "writer",
  "reddit",
  "hackernews",
  "x",
];

const AGENT_TITLES: Record<string, string> = {
  seo: "SEO Audit Analysis",
  geo: "GEO Optimization Report",
  writer: "Content Strategy Brief",
  reddit: "Reddit Opportunity Scan",
  hackernews: "HN Launch Strategy",
  x: "X Presence Analysis",
};

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body as { url: string };

    if (!url || !isValidUrl(url)) {
      return NextResponse.json(
        { error: "Invalid URL. Please provide a valid http:// or https:// URL." },
        { status: 400 }
      );
    }

    // Run SEO analysis
    const analysis = await analyzeSeo(url);
    const db = getDb();

    // Ensure demo user exists
    db.prepare(
      `INSERT OR IGNORE INTO users (id, email, name) VALUES (?, ?, ?)`
    ).run("demo-user", "demo@growthos.app", "Demo User");

    // Create or find site
    const parsedUrl = new URL(url);
    const siteName = parsedUrl.hostname;
    let site = db
      .prepare(`SELECT * FROM sites WHERE url = ?`)
      .get(url) as { id: string; url: string; name: string } | undefined;

    if (!site) {
      const siteId = uuid();
      db.prepare(
        `INSERT INTO sites (id, url, name, user_id) VALUES (?, ?, ?, ?)`
      ).run(siteId, url, siteName, "demo-user");
      site = { id: siteId, url, name: siteName };
    } else {
      // Update timestamp
      db.prepare(
        `UPDATE sites SET updated_at = datetime('now') WHERE id = ?`
      ).run(site.id);
    }

    // Create analysis record
    const analysisId = uuid();
    db.prepare(
      `INSERT INTO analyses (id, site_id, url, score, issues, issues_json, title, description, headings_json, links_count, images_count, load_time_ms)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      analysisId,
      site.id,
      analysis.url,
      analysis.score,
      analysis.issues.length,
      JSON.stringify(analysis.issues),
      analysis.title ?? "",
      analysis.description ?? "",
      JSON.stringify(analysis.headings),
      analysis.linksCount,
      analysis.imagesCount,
      analysis.loadTimeMs
    );

    // Create agent tasks for each agent type
    const insertTask = db.prepare(
      `INSERT INTO agent_tasks (id, site_id, agent_type, status, title, content)
       VALUES (?, ?, ?, 'pending', ?, ?)`
    );

    const taskInsert = db.transaction(() => {
      for (const agentType of AGENT_TYPES) {
        const taskId = uuid();
        const title = AGENT_TITLES[agentType] ?? `${agentType} Analysis`;
        const content = JSON.stringify({
          siteUrl: url,
          siteName,
          analysisScore: analysis.score,
          analysisId,
        });
        insertTask.run(taskId, site.id, agentType, title, content);
      }
    });
    taskInsert();

    return NextResponse.json({
      analysis: {
        score: analysis.score,
        issues: analysis.issues,
        title: analysis.title,
        description: analysis.description,
        headings: analysis.headings,
        linksCount: analysis.linksCount,
        imagesCount: analysis.imagesCount,
        loadTimeMs: analysis.loadTimeMs,
        siteId: site.id,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Analyze API error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}