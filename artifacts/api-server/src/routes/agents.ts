import { Router } from "express";
import { db } from "@workspace/db";
import {
  agentTasksTable,
  contentItemsTable,
  usersTable,
  sitesTable,
} from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

const AGENTS = [
  { type: "seo", name: "SEO Optimizer" },
  { type: "geo", name: "GEO Strategist" },
  { type: "writer", name: "Content Writer" },
  { type: "reddit", name: "Reddit Scout" },
  { type: "hackernews", name: "HN Launcher" },
  { type: "x", name: "X Presence" },
];

const AGENT_DESCRIPTIONS: Record<string, string> = {
  seo: "Runs comprehensive SEO audits, identifies ranking opportunities, and auto-generates optimized meta tags, headings, and structured data.",
  geo: "Optimizes your content for AI search engines (ChatGPT, Claude, Perplexity, Gemini). Ensures your brand gets picked up by LLM responses.",
  writer: "Generates high-quality blog posts, case studies, and landing page copy in your brand voice.",
  reddit: "Monitors 100+ subreddits 24/7 for relevant discussions. Drafts authentic, helpful replies that drive organic traffic without spam.",
  hackernews: "Crafts compelling Hacker News Show HN posts with the perfect title, framing, and first comment to maximize your launch impact.",
  x: "Maintains your brand voice across X/Twitter. Generates threaded content, engagement replies, and consistent daily posting.",
};

const GENERATE_PROMPTS: Record<string, (siteName?: string) => string> = {
  seo: (site = "your website") =>
    `You are an SEO expert. Provide specific, actionable recommendations for optimizing "${site}". Include: keyword strategy, meta tag improvements, content structure, technical SEO, and backlink opportunities. Format as bullet points.`,
  geo: (site = "your website") =>
    `You are a GEO expert. Provide recommendations for optimizing "${site}" for AI search engines (ChatGPT, Claude, Perplexity, Gemini). Include: entity optimization, structured data, citation building, and LLM-friendly content formatting. Format as bullet points.`,
  writer: (site = "your website") =>
    `Write a high-quality, engaging blog post (400-600 words) for "${site}" that would drive organic traffic. Include a compelling title, introduction, structured body with subheadings, and a call-to-action conclusion.`,
  reddit: (site = "your website") =>
    `Draft an authentic, helpful Reddit reply about topics related to "${site}" that provides genuine value. Natural opening, useful information, subtle mention of the site. Keep it under 200 words.`,
  hackernews: (site = "your website") =>
    `Craft a compelling Hacker News "Show HN" post for "${site}". Include: attention-grabbing title (under 80 chars), a first comment explaining what you built and why it matters, and key differentiators. Focus on technical value.`,
  x: (site = "your website") =>
    `Write a tweet thread (5-7 tweets) for "${site}" that drives engagement. Hook tweet, valuable insights, clear call-to-action. Professional but approachable tone.`,
};

const FALLBACK_MODEL = "google/gemma-4-26b-a4b-it";

const AGENT_MODELS: Record<string, string> = {
  seo:         "deepseek/deepseek-v4-flash",
  geo:         "deepseek/deepseek-v4-flash",
  writer:      "google/gemma-4-26b-a4b-it",
  reddit:      "qwen/qwen3.6-flash",
  hackernews:  "google/gemma-4-26b-a4b-it",
  x:           "qwen/qwen3.6-flash",
};

export function aiKeyConfigured(): boolean {
  return !!(process.env.OPENROUTER_API_KEY ?? "");
}

async function askAi(prompt: string, agentType?: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY ?? "";
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Add it in the Replit Secrets panel to enable AI generation."
    );
  }
  const model =
    process.env.OPENROUTER_MODEL ??
    (agentType ? (AGENT_MODELS[agentType] ?? FALLBACK_MODEL) : FALLBACK_MODEL);
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 512,
    }),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`OpenRouter error (${response.status}): ${body}`);
  }
  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("OpenRouter returned empty content.");
  return text;
}

// GET /api/agents/:type
router.get("/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const agentInfo = AGENTS.find((a) => a.type === type);
    if (!agentInfo) {
      return res.status(404).json({ error: "Agent type not found" });
    }

    const tasks = await db
      .select()
      .from(agentTasksTable)
      .where(eq(agentTasksTable.agentType, type))
      .orderBy(desc(agentTasksTable.createdAt))
      .limit(20);

    const content = await db
      .select()
      .from(contentItemsTable)
      .where(eq(contentItemsTable.agentType, type))
      .orderBy(desc(contentItemsTable.createdAt))
      .limit(20);

    return res.json({
      agent: {
        ...agentInfo,
        description: AGENT_DESCRIPTIONS[type] ?? "",
      },
      tasks: tasks.map((t) => ({
        id: t.id,
        agentType: t.agentType,
        title: t.title,
        status: t.status,
        content: t.content,
        createdAt: t.createdAt?.toISOString() ?? "",
        completedAt: t.completedAt?.toISOString() ?? null,
      })),
      content: content.map((c) => ({
        id: c.id,
        title: c.title,
        body: c.body,
        status: c.status,
        createdAt: c.createdAt?.toISOString() ?? "",
      })),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/agents/:type/generate
router.post("/:type/generate", async (req, res) => {
  try {
    const { type } = req.params;
    const validTypes = ["seo", "geo", "writer", "reddit", "hackernews", "x"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid agent type" });
    }

    // Ensure demo user exists
    await db
      .insert(usersTable)
      .values({ id: "demo-user", email: "demo@growthos.app", name: "Demo User" })
      .onConflictDoNothing();

    // Get a site for context
    const sites = await db.select().from(sitesTable).limit(1).orderBy(desc(sitesTable.createdAt));
    const site = sites[0];
    const siteName = site?.name ?? "your website";
    const siteUrl = site?.url ?? "";

    const taskTitle =
      type === "seo" ? "SEO Recommendations" :
      type === "geo" ? "GEO Analysis Report" :
      type === "writer" ? "Blog Post Generation" :
      type === "reddit" ? "Reddit Reply Draft" :
      type === "hackernews" ? "HN Launch Post" :
      "Tweet Thread";

    const taskId = randomUUID();

    await db.insert(agentTasksTable).values({
      id: taskId,
      siteId: site?.id ?? "demo",
      agentType: type,
      status: "running",
      title: taskTitle,
      content: JSON.stringify({ status: "running", siteUrl, siteName }),
    });

    try {
      const promptFn = GENERATE_PROMPTS[type];
      if (!promptFn) throw new Error("No prompt for agent type");
      const aiResponse = await askAi(promptFn(siteName || siteUrl || "your website"), type);

      await db
        .update(agentTasksTable)
        .set({ status: "completed", content: aiResponse, completedAt: new Date(), updatedAt: new Date() })
        .where(eq(agentTasksTable.id, taskId));

      // Create content item for writer/reddit/x
      if (["writer", "reddit", "x"].includes(type)) {
        const contentTitle =
          type === "writer" ? `Blog Post - ${siteName}` :
          type === "reddit" ? `Reddit Reply - ${siteName}` :
          `Tweet Thread - ${siteName}`;
        await db.insert(contentItemsTable).values({
          id: randomUUID(),
          userId: "demo-user",
          agentType: type,
          title: contentTitle,
          body: aiResponse,
          status: "draft",
          platform: type === "reddit" ? "reddit" : type === "x" ? "x" : "web",
        });
      }

      return res.json({ task: { id: taskId, title: taskTitle, status: "completed" }, content: aiResponse });
    } catch (aiError) {
      const message = aiError instanceof Error ? aiError.message : "AI generation failed";
      await db
        .update(agentTasksTable)
        .set({ status: "failed", content: message, updatedAt: new Date() })
        .where(eq(agentTasksTable.id, taskId));
      return res.status(500).json({ error: message });
    }
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
