import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { askAi } from "@/lib/ai";
import { v4 as uuid } from "uuid";

const GENERATE_PROMPTS: Record<string, (siteName?: string) => string> = {
  seo: (site = "your website") =>
    `You are an SEO expert. Perform a comprehensive SEO analysis and provide specific, actionable recommendations for optimizing "${site}". Include: keyword strategy, meta tag improvements, content structure, technical SEO, and backlink opportunities. Format as bullet points.`,
  geo: (site = "your website") =>
    `You are a Generative Engine Optimization (GEO) expert. Provide recommendations for optimizing "${site}" for AI search engines (ChatGPT, Claude, Perplexity, Gemini). Include: entity optimization, structured data improvements, citation building, and LLM-friendly content formatting. Format as bullet points.`,
  writer: (site = "your website") =>
    `Write a high-quality, engaging blog post (800-1000 words) for "${site}" that would drive organic traffic. Include a compelling title, introduction, well-structured body sections with subheadings, and a call-to-action conclusion. Make it informative and valuable for readers.`,
  reddit: (site = "your website") =>
    `You are a community engagement expert. Draft an authentic, helpful Reddit reply about topics related to "${site}" that provides genuine value without being spammy. Include: a natural opening, useful information or insight, and a subtle way the reader could learn more. Keep it under 200 words.`,
  hackernews: (site = "your website") =>
    `You are a launch strategist. Craft a compelling Hacker News "Show HN" post for "${site}". Include: an attention-grabbing title (under 80 chars), a concise first comment explaining what you built and why it matters, and key differentiators. Focus on technical details and genuine value.`,
  x: (site = "your website") =>
    `You are a social media strategist. Write a tweet thread (5-7 tweets) for "${site}" that would drive engagement and followers. Each tweet should be concise and valuable. The thread should have a hook, valuable insights, and a clear call-to-action. Use a professional but approachable tone.`,
};

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const db = getDb();

    const validTypes = [
      "seo",
      "geo",
      "writer",
      "reddit",
      "hackernews",
      "x",
    ];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid agent type" },
        { status: 400 }
      );
    }

    // Ensure demo user exists
    db.prepare(
      `INSERT OR IGNORE INTO users (id, email, name) VALUES (?, ?, ?)`
    ).run("demo-user", "demo@growthos.app", "Demo User");

    // Get a site name for context
    const site = db
      .prepare(
        `SELECT url, name FROM sites ORDER BY created_at DESC LIMIT 1`
      )
      .get() as { url: string; name: string } | undefined;

    const siteName = site?.name ?? "your website";
    const siteUrl = site?.url ?? "";

    // Create task as "running"
    const taskId = uuid();
    const taskTitle =
      type === "seo"
        ? "SEO Recommendations"
        : type === "geo"
        ? "GEO Analysis Report"
        : type === "writer"
        ? "Blog Post Generation"
        : type === "reddit"
        ? "Reddit Reply Draft"
        : type === "hackernews"
        ? "HN Launch Post"
        : "Tweet Thread";

    const generatePrompt = GENERATE_PROMPTS[type];
    if (!generatePrompt) {
      return NextResponse.json(
        { error: "No generation prompt configured for this agent type" },
        { status: 500 }
      );
    }

    db.prepare(
      `INSERT INTO agent_tasks (id, site_id, agent_type, status, title, content)
       VALUES (?, ?, ?, 'running', ?, ?)`
    ).run(
      taskId,
      site?.url ?? "",
      type,
      taskTitle,
      JSON.stringify({ status: "running", siteUrl, siteName })
    );

    try {
      // Call AI
      const prompt = generatePrompt(siteName || siteUrl || "your website");
      const aiResponse = await askAi(prompt);

      // Update task to completed
      db.prepare(
        `UPDATE agent_tasks SET status = 'completed', content = ?, completed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`
      ).run(aiResponse, taskId);

      // For writer/reddit/x, create a content item as well
      if (["writer", "reddit", "x"].includes(type)) {
        const contentId = uuid();
        const contentTitle =
          type === "writer"
            ? `Blog Post - ${siteName}`
            : type === "reddit"
            ? `Reddit Reply - ${siteName}`
            : `Tweet Thread - ${siteName}`;

        db.prepare(
          `INSERT INTO content_items (id, user_id, agent_type, title, body, status, platform)
           VALUES (?, ?, ?, ?, ?, 'draft', ?)`
        ).run(
          contentId,
          "demo-user",
          type,
          contentTitle,
          aiResponse,
          type === "reddit" ? "reddit" : type === "x" ? "x" : "web"
        );
      }

      return NextResponse.json({
        task: {
          id: taskId,
          title: taskTitle,
          status: "completed",
        },
        content: aiResponse,
      });
    } catch (aiError) {
      // Mark task as failed if AI call fails
      const errorMessage =
        aiError instanceof Error ? aiError.message : "AI generation failed";
      db.prepare(
        `UPDATE agent_tasks SET status = 'failed', content = ?, updated_at = datetime('now') WHERE id = ?`
      ).run(errorMessage, taskId);

      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An error occurred";
    console.error("Agent generate API error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}