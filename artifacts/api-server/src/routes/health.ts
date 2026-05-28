import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { aiKeyConfigured } from "./agents";

const AGENT_MODEL_MAP: Record<string, string> = {
  seo:        "deepseek/deepseek-v4-flash",
  geo:        "deepseek/deepseek-v4-flash",
  writer:     "google/gemma-4-26b-a4b-it",
  reddit:     "qwen/qwen3.6-flash",
  hackernews: "google/gemma-4-26b-a4b-it",
  x:          "qwen/qwen3.6-flash",
  _fallback:  "google/gemma-4-26b-a4b-it",
};

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json({
    ...data,
    ai: {
      keyConfigured: aiKeyConfigured(),
      models: process.env.OPENROUTER_MODEL
        ? { override: process.env.OPENROUTER_MODEL }
        : AGENT_MODEL_MAP,
    },
  });
});

export default router;
