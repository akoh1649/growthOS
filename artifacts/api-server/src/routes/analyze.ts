import { Router } from "express";
import { db } from "@workspace/db";
import {
  sitesTable,
  analysesTable,
  agentTasksTable,
  usersTable,
} from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
// @ts-ignore
import * as cheerio from "cheerio";

const router = Router();

interface SeoIssue {
  type: string;
  severity: "high" | "medium" | "low";
  message: string;
}

interface SeoAnalysis {
  url: string;
  title: string | null;
  description: string | null;
  score: number;
  issues: SeoIssue[];
  headings: string[];
  linksCount: number;
  imagesCount: number;
  loadTimeMs: number;
}

async function analyzeSeo(url: string): Promise<SeoAnalysis> {
  const startTime = performance.now();
  let html: string;
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15_000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GrowthOS-SEO-Bot/1.0)" },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    html = await response.text();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { url, title: null, description: null, score: 0, issues: [{ type: "fetch_error", severity: "high", message: `Failed to fetch URL: ${message}` }], headings: [], linksCount: 0, imagesCount: 0, loadTimeMs: 0 };
  }

  const loadTimeMs = Math.round(performance.now() - startTime);
  const $ = cheerio.load(html);

  const title = $("title").first().text().trim() || null;
  const description = $('meta[name="description"]').first().attr("content")?.trim() || null;

  const headings: string[] = [];
  for (let level = 1; level <= 6; level++) {
    $(`h${level}`).each((_i: number, el: cheerio.Element) => {
      const text = $(el).text().trim();
      if (text) headings.push(text);
    });
  }

  const linksCount = $("a[href]").length;
  const imagesCount = $("img").length;
  const imagesWithoutAlt = $("img").filter((_i: number, el: cheerio.Element) => {
    const alt = $(el).attr("alt");
    return alt === undefined || alt.trim() === "";
  }).length;

  const h1Count = $("h1").length;
  const issues: SeoIssue[] = [];

  if (!title) issues.push({ type: "missing_title", severity: "high", message: "Page is missing a <title> tag." });
  if (!description) issues.push({ type: "missing_description", severity: "high", message: "Page is missing a meta description." });
  if (h1Count === 0) issues.push({ type: "missing_h1", severity: "high", message: "Page has no <h1> heading." });
  else if (h1Count > 1) issues.push({ type: "multiple_h1", severity: "medium", message: `Page has ${h1Count} <h1> headings. Best practice is one.` });
  if (loadTimeMs > 3000) issues.push({ type: "slow_load", severity: "medium", message: `Page loaded in ${loadTimeMs}ms (threshold: 3000ms).` });
  if (linksCount < 5) issues.push({ type: "few_links", severity: "low", message: `Page has only ${linksCount} links.` });
  if (imagesWithoutAlt > 0) issues.push({ type: "missing_alt_text", severity: "medium", message: `${imagesWithoutAlt} of ${imagesCount} images are missing alt text.` });

  const deductions: Record<string, number> = {
    missing_title: 20, missing_description: 15, missing_h1: 15, multiple_h1: 10,
    slow_load: 10, few_links: 10, missing_alt_text: Math.min(imagesWithoutAlt * 3, 15),
  };

  let deduction = 0;
  for (const issue of issues) deduction += deductions[issue.type] ?? 0;

  return { url, title, description, score: Math.max(0, Math.min(100, 100 - deduction)), issues, headings, linksCount, imagesCount, loadTimeMs };
}

const AGENT_TYPES = ["seo", "geo", "writer", "reddit", "hackernews", "x"];
const AGENT_TITLES: Record<string, string> = {
  seo: "SEO Analysis", geo: "GEO Optimization", writer: "Content Generation",
  reddit: "Reddit Strategy", hackernews: "HN Launch Strategy", x: "X/Twitter Strategy",
};

// POST /api/analyze
router.post("/", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL is required" });
    }

    const analysis = await analyzeSeo(url);

    // Ensure demo user
    await db.insert(usersTable)
      .values({ id: "demo-user", email: "demo@growthos.app", name: "Demo User" })
      .onConflictDoNothing();

    const parsedUrl = new URL(url);
    const siteName = parsedUrl.hostname;

    // Create or update site
    const existing = await db.select().from(sitesTable).where(eq(sitesTable.url, url)).limit(1);
    let siteId: string;

    if (existing.length === 0) {
      siteId = randomUUID();
      await db.insert(sitesTable).values({ id: siteId, url, name: siteName, userId: "demo-user" });
    } else {
      siteId = existing[0].id;
      await db.update(sitesTable).set({ updatedAt: new Date() }).where(eq(sitesTable.id, siteId));
    }

    // Create analysis
    const analysisId = randomUUID();
    await db.insert(analysesTable).values({
      id: analysisId,
      siteId,
      url: analysis.url,
      score: analysis.score,
      issues: analysis.issues.length,
      issuesJson: JSON.stringify(analysis.issues),
      title: analysis.title ?? "",
      description: analysis.description ?? "",
      headingsJson: JSON.stringify(analysis.headings),
      linksCount: analysis.linksCount,
      imagesCount: analysis.imagesCount,
      loadTimeMs: analysis.loadTimeMs,
    });

    // Create agent tasks
    for (const agentType of AGENT_TYPES) {
      await db.insert(agentTasksTable).values({
        id: randomUUID(),
        siteId,
        agentType,
        status: "pending",
        title: AGENT_TITLES[agentType] ?? `${agentType} Analysis`,
        content: JSON.stringify({ siteUrl: url, siteName, analysisScore: analysis.score, analysisId }),
      });
    }

    return res.json({
      analysis: {
        score: analysis.score,
        issues: analysis.issues,
        title: analysis.title,
        description: analysis.description,
        headings: analysis.headings,
        linksCount: analysis.linksCount,
        imagesCount: analysis.imagesCount,
        loadTimeMs: analysis.loadTimeMs,
        siteId,
      },
    });
  } catch (err) {
    req.log.error(err);
    const message = err instanceof Error ? err.message : "An unknown error occurred";
    return res.status(500).json({ error: message });
  }
});

export default router;
