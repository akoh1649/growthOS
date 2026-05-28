import app from "./app";
import { logger } from "./lib/logger";
import { aiKeyConfigured } from "./routes/agents";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  const keyReady = aiKeyConfigured();
  const model = process.env.OPENROUTER_MODEL ?? "nvidia/nemotron-3-nano-30b-a3b:free";
  if (keyReady) {
    logger.info({ model }, "AI generation ready");
  } else {
    logger.warn("OPENROUTER_API_KEY not set — AI generation disabled. Add it in Replit Secrets.");
  }
});
