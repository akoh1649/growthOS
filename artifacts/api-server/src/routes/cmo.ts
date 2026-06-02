import { Router } from "express";
import { HaroScraper } from "../lib/haro-scraper";
import { generateHaroPitch } from "../lib/haro-pitch";
import { BrokenLinkChecker } from "../lib/broken-link-checker";

const router = Router();
const haro = new HaroScraper();
const bl = new BrokenLinkChecker();

router.post("/cmo/evaluate", async (req, res) => {
  try {
    const { domain, niche, competitors = [], budgetTier = "growth" } = req.body;
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) return res.status(500).json({ error: "OPENROUTER_API_KEY not set" });

    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-v4-flash",
        messages: [
          {
            role: "user",
            content: `You are a CMO and backlink strategy expert. Evaluate the backlink opportunity for:
Domain: ${domain}
Niche: ${niche}
Budget tier: ${budgetTier}
Competitors: ${competitors.join(", ") || "none specified"}

Return a JSON object with:
- recommended_tactics: array of { tactic, priority (1-5, lower=higher priority), effort (low/medium/high), impact (low/medium/high), channels (array of strings) }
- quick_wins: array of strings (actionable items doable this week)
- monthly_budget_allocation: object with category keys and percentage values summing to 100
- kpis: array of strings (metrics to track)`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    const data = await r.json();
    const result = JSON.parse(data.choices[0].message.content);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/cmo/haro/fetch", async (req, res) => {
  try {
    const queries = await haro.fetchQueries(req.body.keywords || []);
    res.json({ queries, count: queries.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/cmo/haro/pitch", async (req, res) => {
  try {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) return res.status(500).json({ error: "OPENROUTER_API_KEY not set" });
    res.json(await generateHaroPitch(req.body, key));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/cmo/broken-links/scan", async (req, res) => {
  try {
    if (!req.body.url) return res.status(400).json({ error: "url required" });
    res.json(await bl.scan(req.body.url));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
