import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { aiKeyConfigured } from "./agents";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json({
    ...data,
    ai: {
      keyConfigured: aiKeyConfigured(),
      model: process.env.OPENROUTER_MODEL ?? "nvidia/nemotron-3-nano-30b-a3b:free",
    },
  });
});

export default router;
