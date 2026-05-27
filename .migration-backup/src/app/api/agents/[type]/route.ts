import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

const AGENTS = [
  { type: "seo", name: "SEO Optimizer" },
  { type: "geo", name: "GEO Strategist" },
  { type: "writer", name: "Content Writer" },
  { type: "reddit", name: "Reddit Scout" },
  { type: "hackernews", name: "HN Launcher" },
  { type: "x", name: "X Presence" },
];

const AGENT_COLORS: Record<string, string> = {
  seo: "blue",
  geo: "purple",
  writer: "amber",
  reddit: "orange",
  hackernews: "red",
  x: "sky",
};

const AGENT_DESCRIPTIONS: Record<string, string> = {
  seo: "Runs comprehensive SEO audits, identifies ranking opportunities, and auto-generates optimized meta tags, headings, and structured data.",
  geo: "Optimizes your content for AI search engines (ChatGPT, Claude, Perplexity, Gemini). Ensures your brand gets picked up by LLM responses.",
  writer: "Generates high-quality blog posts, case studies, and landing page copy in your brand voice.",
  reddit: "Monitors 100+ subreddits 24/7 for relevant discussions. Drafts authentic, helpful replies that drive organic traffic without spam.",
  hackernews: "Crafts compelling Hacker News Show HN posts with the perfect title, framing, and first comment to maximize your launch impact.",
  x: "Maintains your brand voice across X/Twitter. Generates threaded content, engagement replies, and consistent daily posting.",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const db = getDb();

    const agentInfo = AGENTS.find((a) => a.type === type);
    if (!agentInfo) {
      return NextResponse.json({ error: "Agent type not found" }, { status: 404 });
    }

    // Get tasks for this agent
    const tasks = db
      .prepare(
        `SELECT id, agent_type, title, status, content, created_at, completed_at
         FROM agent_tasks
         WHERE agent_type = ?
         ORDER BY created_at DESC
         LIMIT 20`
      )
      .all(type) as Array<{
      id: string;
      agent_type: string;
      title: string;
      status: string;
      content: string;
      created_at: string;
      completed_at: string | null;
    }>;

    // Get content items for this agent
    const content = db
      .prepare(
        `SELECT id, title, body, status, platform, created_at
         FROM content_items
         WHERE agent_type = ?
         ORDER BY created_at DESC
         LIMIT 20`
      )
      .all(type) as Array<{
      id: string;
      title: string;
      body: string;
      status: string;
      platform: string | null;
      created_at: string;
    }>;

    return NextResponse.json({
      agent: {
        type: agentInfo.type,
        name: agentInfo.name,
        color: AGENT_COLORS[type] ?? "gray",
        description: AGENT_DESCRIPTIONS[type] ?? "",
      },
      tasks: tasks.map((t) => ({
        id: t.id,
        agentType: t.agent_type,
        title: t.title,
        status: t.status,
        content: t.content,
        createdAt: t.created_at,
        completedAt: t.completed_at,
      })),
      content: content.map((c) => ({
        id: c.id,
        title: c.title,
        body: c.body,
        status: c.status,
        platform: c.platform,
        createdAt: c.created_at,
      })),
    });
  } catch (error) {
    console.error("Agent API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent data" },
      { status: 500 }
    );
  }
}