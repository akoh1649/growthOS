export type AgentType = "seo" | "geo" | "writer" | "reddit" | "hackernews" | "x";

export interface AgentConfig {
  type: AgentType;
  name: string;
  description: string;
  icon: string;
  colorKey: "Blue" | "Purple" | "Amber" | "Orange" | "Red" | "Sky";
  generateLabel: string;
}

export const AGENTS: AgentConfig[] = [
  {
    type: "seo",
    name: "SEO Optimizer",
    description: "Runs comprehensive SEO audits and auto-generates optimized meta tags, headings, and structured data.",
    icon: "search",
    colorKey: "Blue",
    generateLabel: "Generate SEO Report",
  },
  {
    type: "geo",
    name: "GEO Strategist",
    description: "Optimizes content for AI search engines — ChatGPT, Claude, Perplexity, and Gemini.",
    icon: "cpu",
    colorKey: "Purple",
    generateLabel: "Run GEO Analysis",
  },
  {
    type: "writer",
    name: "Content Writer",
    description: "Generates high-quality blog posts, case studies, and landing page copy in your brand voice.",
    icon: "edit-2",
    colorKey: "Amber",
    generateLabel: "Generate Blog Post",
  },
  {
    type: "reddit",
    name: "Reddit Scout",
    description: "Monitors 100+ subreddits 24/7 and drafts authentic replies that drive organic traffic.",
    icon: "message-circle",
    colorKey: "Orange",
    generateLabel: "Draft Reddit Reply",
  },
  {
    type: "hackernews",
    name: "HN Launcher",
    description: "Crafts compelling Hacker News Show HN posts for maximum launch impact.",
    icon: "triangle",
    colorKey: "Red",
    generateLabel: "Craft HN Post",
  },
  {
    type: "x",
    name: "X Presence",
    description: "Maintains your brand voice across X/Twitter with threads, replies, and daily posting.",
    icon: "at-sign",
    colorKey: "Sky",
    generateLabel: "Write Tweet Thread",
  },
];

export const AGENT_MAP = Object.fromEntries(
  AGENTS.map((a) => [a.type, a])
) as Record<AgentType, AgentConfig>;
