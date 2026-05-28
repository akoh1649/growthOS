/**
 * GrowthOS Knowledge Base
 *
 * Structured facts about GrowthOS itself — service catalog, pricing tiers,
 * agent capabilities, common setup flows. Used by the Support agent to
 * answer user questions accurately.
 */

export interface KBEntry {
  question: string;
  answer: string;
  tags: string[];
}

export const KNOWLEDGE_BASE: KBEntry[] = [
  // ─── Service Overview ───────────────────────────
  {
    question: "What is GrowthOS?",
    answer: "GrowthOS is an AI-powered marketing platform with 7 specialized agents (SEO, GEO, Content Writer, Reddit Scout, HN Launcher, X Presence, and Customer Support) that help startups and founders automate their content marketing, SEO, and social media presence. Enter a URL or topic and each agent produces domain-specific analysis and content.",
    tags: ["overview", "general", "what is"],
  },
  {
    question: "How do I get started?",
    answer: "1. Go to your Dashboard (/dashboard). 2. Click 'Analyze Site' to run an SEO analysis on your URL. 3. Navigate to the Generate page (/generate) and pick an agent. 4. Type your input (URL, topic, or brief). 5. Select a model (Gemma 4 for speed, DeepSeek for analysis, Kimi for complex). 6. Click 'Run' to generate. 7. Check the Dashboard for your results.",
    tags: ["onboarding", "setup", "getting started", "first steps"],
  },
  {
    question: "What do I need to run GrowthOS?",
    answer: "GrowthOS runs in any modern browser. The only requirement is an OpenRouter API key (set as OPENROUTER_API_KEY environment variable). The free tier of OpenRouter provides limited credits; paid plans start at $5-10 for moderate usage. Each generation call costs approximately $0.0001-$0.002 depending on the model selected.",
    tags: ["requirements", "setup", "prerequisites", "api key"],
  },

  // ─── Agent Descriptions ─────────────────────────
  {
    question: "What does the SEO Optimizer do?",
    answer: "The SEO Optimizer runs a structured SEO audit using the seo-audit framework. It checks meta tags (title, description, canonical, Open Graph, Twitter Cards), content quality (H1, headings, word count, alt text, internal/external links), technical SEO (mobile viewport, HTTPS, clean URLs, Schema.org, robots meta), and performance indicators (HTML size, image count, external resources). It produces a scored report (0-100) broken into four categories with prioritized fix recommendations.",
    tags: ["seo", "agent", "seo optimizer"],
  },
  {
    question: "What does the GEO Strategist do?",
    answer: "The GEO Strategist specializes in AI search engine optimization. It audits your content for AI visibility across Google AI Overviews, ChatGPT, Perplexity, Gemini, Claude, and Copilot. It checks robots.txt for AI crawler access, recommends Schema.org markup, analyses citation patterns, and identifies third-party sources (Wikipedia, Reddit, review sites) where your brand should appear. Uses the ai-seo framework.",
    tags: ["geo", "ai search", "generative engine", "agent"],
  },
  {
    question: "What does the Content Writer do?",
    answer: "The Content Writer generates blog posts, case studies, and landing page copy using the AIDA (Attention, Interest, Desire, Action) framework. It considers audience, content pillar fit, headline formulas (The Promise, The Question, The How-To, The Number, etc.), emotional triggers (FOMO, fear of loss, desire for status, hope), and CTA best practices (action verb + what they get + urgency/ease). It uses the copywriting and content-strategy frameworks.",
    tags: ["writer", "content", "blog", "copywriting", "agent"],
  },
  {
    question: "What does the Reddit Scout do?",
    answer: "The Reddit Scout drafts authentic, helpful Reddit replies. It evaluates community context (r/startups, r/SaaS, r/entrepreneur each have different tones), hooks with natural curiosity or shared experience, provides 80% value-first content before mentioning any resource, keeps replies under 200 words, and uses conversational tone with proper Reddit markdown formatting.",
    tags: ["reddit", "social", "community", "agent"],
  },
  {
    question: "What does the HN Launcher do?",
    answer: "The HN Launcher crafts Hacker News Show HN posts. It engineers titles under 80 characters using proven formats ('[X] — a [Y] for [Z]' or 'Show HN: I built [X] to solve [Y]'), writes first-person builder-style first comments (what was built, why, what makes it different, learnings, anticipated questions), and maintains technical credibility without marketing hype.",
    tags: ["hacker news", "hn", "launch", "show hn", "agent"],
  },
  {
    question: "What does the X Presence do?",
    answer: "The X Presence generates tweet threads that drive engagement. It selects a thread type (educational, narrative, listicle, argument, or announcement), crafts a 1-2 second hook tweet, structures body tweets to stand alone while building on each other, uses proper formatting (line breaks, bold key phrases, sparse emojis), and ends with a CTA that invites engagement, traffic, or follows.",
    tags: ["x", "twitter", "social media", "thread", "agent"],
  },
  {
    question: "What does the Customer Support agent do?",
    answer: "The Customer Support agent answers questions about GrowthOS itself — how to use the platform, what each agent does, pricing, troubleshooting setup issues, and guidance through common workflows. It can explain agent capabilities, help with onboarding, suggest which agent to use for specific goals, and escalate complex issues. It does not have access to user accounts, billing data, or live agent task results.",
    tags: ["support", "help", "customer service", "faq", "agent"],
  },

  // ─── Pricing ────────────────────────────────────
  {
    question: "How much does GrowthOS cost?",
    answer: "GrowthOS offers three tiers: Starter ($49/mo) — 1 website, SEO audit agent, Content Writer (5 posts/mo), basic Reddit monitoring, email support. Growth ($99/mo) — 3 websites, all agents, unlimited generation, Reddit+HN+X monitoring, GEO optimization, CMS auto-publish, priority support, analytics dashboard. Scale ($249/mo) — 10 websites, all features, custom agent training, dedicated support, API access, team seats, custom integrations.",
    tags: ["pricing", "cost", "plans", "subscription"],
  },
  {
    question: "Is there a free trial?",
    answer: "The 'Analyze' feature on the landing page is free — enter any URL and get an instant SEO score with recommendations. For full agent-generated content, a paid subscription is required. Contact support for evaluation access or partnership pricing.",
    tags: ["free trial", "demo", "evaluation", "pricing"],
  },
  {
    question: "What payment methods are accepted?",
    answer: "Payment processing is handled through Stripe. Credit and debit cards (Visa, Mastercard, Amex) are supported. Enterprise invoicing available for Scale tier. Contact support@ for custom billing arrangements.",
    tags: ["payment", "billing", "stripe", "credit card"],
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes. Subscriptions can be cancelled at any time. Access continues until the end of the current billing period. No cancellation fees. Contact support@ for account closure.",
    tags: ["cancellation", "cancel", "refund", "billing"],
  },

  // ─── Model & Tech ───────────────────────────────
  {
    question: "Which AI models does GrowthOS use?",
    answer: "Each agent has a recommended model: SEO and GEO use DeepSeek V4 Flash (analytical, structured), Content Writer and HN Launcher use Gemma 4 (creative, long-form), Reddit Scout and X Presence use Qwen 3.6 Flash (fast, economical). Users can override on the Generate page — choose from Gemma 4 ($0.06/M tokens), DeepSeek V4 Flash ($0.15/M), or Kimi k2.5 ($1.50/M, complex reasoning). The OPENROUTER_MODEL environment variable overrides all agent routing.",
    tags: ["models", "ai", "openrouter", "gemma", "deepseek", "kimi"],
  },
  {
    question: "Where is my data stored?",
    answer: "GrowthOS stores analysis results and generated content in a PostgreSQL database. API calls are routed through OpenRouter — see their privacy policy for data handling during AI inference. No user data is used for model training. For self-hosted deployments, data remains within your infrastructure.",
    tags: ["data", "privacy", "storage", "security", "database"],
  },
  {
    question: "What happens if my OpenRouter API key is missing?",
    answer: "If OPENROUTER_API_KEY is not set as an environment variable, all agent generation calls will fail with a clear error message. Set it in the Replit Secrets panel (or your hosting environment's env var configuration). The /api/healthz endpoint will show whether the key is configured.",
    tags: ["openrouter", "api key", "error", "setup", "troubleshooting"],
  },

  // ─── Troubleshooting ────────────────────────────
  {
    question: "Why is my Dashboard empty?",
    answer: "The Dashboard shows results from previous analyses and generations. If it's empty, you probably haven't run any yet. Start by going to the Generate page and running an agent task, or use the Analyze feature on the landing page with a URL. Results appear in the Dashboard after successful generation.",
    tags: ["dashboard", "empty", "no data", "troubleshooting"],
  },
  {
    question: "Why did my agent generation fail?",
    answer: "Generation failures are typically caused by: (1) missing OPENROUTER_API_KEY — ensure it's set as an environment variable, (2) the Express API server is not running — the Vite dev server's built-in API routes don't work, the separate Express server must be started, (3) rate limiting — OpenRouter has per-minute rate limits on free tiers, (4) invalid input — some agents need a valid URL (SEO) or sufficient context. Check the error message for specifics.",
    tags: ["generation", "failed", "error", "troubleshooting", "api"],
  },
  {
    question: "How do I contact human support?",
    answer: "For issues the automated support agent cannot resolve: email support@growthos.app (Growth/Scale tiers get priority responses), or open a GitHub issue if you're self-hosting. Response times: Starter (48hrs), Growth (24hrs), Scale (4hrs business hours).",
    tags: ["contact", "human", "support", "email", "escalation"],
  },
  {
    question: "Can I self-host GrowthOS?",
    answer: "Yes. GrowthOS is open-source and can be self-hosted. Clone from GitHub, set up the monorepo (pnpm install), configure OPENROUTER_API_KEY and PostgreSQL connection string, and build both the frontend (Vite) and API server (Express). The Scale tier ($249) includes priority self-hosting support.",
    tags: ["self-host", "self hosted", "open source", "deploy"],
  },

  // ─── Capabilities ───────────────────────────────
  {
    question: "Can GrowthOS post to my social media accounts automatically?",
    answer: "Currently, GrowthOS generates the content for social media posts but does not auto-publish to external platforms (Reddit, X, HN, CMS). The generated text is displayed on the Agent Detail page where you can copy and manually post it. Auto-publishing to CMS and social platforms is on the roadmap for future releases.",
    tags: ["auto publish", "social media", "posting", "cms", "integration"],
  },
  {
    question: "Can I customize the agent prompts?",
    answer: "Agent prompts are pre-configured per agent type using domain-specific frameworks (seo-audit for SEO, AIDA for writing, etc.). Custom prompt configuration is available on the Scale tier. For self-hosted deployments, you can modify the prompts directly in the skill-prompts.ts file.",
    tags: ["customize", "prompts", "configuration", "settings"],
  },
  {
    question: "Does GrowthOS support multiple users?",
    answer: "Team collaboration is available on the Scale tier. Starter and Growth tiers are single-user. Team features include shared agent results, collaborative content review, and role-based access (admin, editor, viewer).",
    tags: ["team", "multi user", "collaboration", "seats"],
  },
];

// ─── Search Helpers ────────────────────────────────

export function searchKnowledge(query: string): KBEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const scored = KNOWLEDGE_BASE.map((entry) => {
    let score = 0;
    const terms = q.split(/\s+/);

    for (const term of terms) {
      if (entry.question.toLowerCase().includes(term)) score += 5;
      if (entry.answer.toLowerCase().includes(term)) score += 2;
      for (const tag of entry.tags) {
        if (tag.includes(term)) score += 10;
      }
    }

    return { entry, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((s) => s.entry);
}

export function getAllKnowledge(): KBEntry[] {
  return KNOWLEDGE_BASE;
}
