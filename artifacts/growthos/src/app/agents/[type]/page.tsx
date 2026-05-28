"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Brain,
  PenLine,
  MessageCircle,
  Newspaper,
  AtSign,
  ArrowLeft,
  Loader2,
  Send,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useParams } from "wouter";

const AGENTS = [
  {
    type: "seo",
    name: "SEO Optimizer",
    icon: Search,
    color: "blue",
    gradient: "from-blue-500 to-cyan-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-400",
    description:
      "Runs comprehensive SEO audits, identifies ranking opportunities, and auto-generates optimized meta tags, headings, and structured data.",
  },
  {
    type: "geo",
    name: "GEO Strategist",
    icon: Brain,
    color: "purple",
    gradient: "from-purple-500 to-pink-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    text: "text-purple-400",
    description:
      "Optimizes your content for AI search engines (ChatGPT, Claude, Perplexity, Gemini). Ensures your brand gets picked up by LLM responses.",
  },
  {
    type: "writer",
    name: "Content Writer",
    icon: PenLine,
    color: "amber",
    gradient: "from-amber-500 to-orange-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-400",
    description:
      "Generates high-quality blog posts, case studies, and landing page copy in your brand voice.",
  },
  {
    type: "reddit",
    name: "Reddit Scout",
    icon: MessageCircle,
    color: "orange",
    gradient: "from-orange-500 to-red-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    text: "text-orange-400",
    description:
      "Monitors 100+ subreddits 24/7 for relevant discussions. Drafts authentic, helpful replies that drive organic traffic without spam.",
  },
  {
    type: "hackernews",
    name: "HN Launcher",
    icon: Newspaper,
    color: "red",
    gradient: "from-red-500 to-rose-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    text: "text-red-400",
    description:
      "Crafts compelling Hacker News Show HN posts with the perfect title, framing, and first comment to maximize your launch impact.",
  },
  {
    type: "x",
    name: "X Presence",
    icon: AtSign,
    color: "sky",
    gradient: "from-sky-500 to-blue-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    text: "text-sky-400",
    description:
      "Maintains your brand voice across X/Twitter. Generates threaded content, engagement replies, and consistent daily posting.",
  },
  {
    type: "support",
    name: "Customer Support",
    icon: MessageCircle,
    color: "teal",
    gradient: "from-teal-500 to-cyan-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    text: "text-teal-400",
    description:
      "Answers your GrowthOS questions, guides you through onboarding, suggests which agent to use for your goals, and helps with troubleshooting.",
  },
];

const GENERATE_LABELS: Record<string, string> = {
  seo: "Generate SEO Recommendations",
  geo: "Run GEO Analysis",
  writer: "Generate Blog Post",
  reddit: "Draft Reddit Reply",
  hackernews: "Craft HN Post",
  x: "Write Tweet Thread",
  support: "Ask Customer Support",
};

const STATUS_COLORS: Record<string, string> = {
  completed: "text-emerald-400 bg-emerald-500/10",
  running: "text-blue-400 bg-blue-500/10",
  pending: "text-muted-foreground bg-white/5",
  failed: "text-red-400 bg-red-500/10",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "Z");
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

interface Task {
  id: string;
  agentType: string;
  title: string;
  status: string;
  content: string;
  createdAt: string;
  completedAt: string | null;
}

interface ContentItem {
  id: string;
  title: string;
  body: string;
  status: string;
  createdAt: string;
}

interface AgentPageData {
  agent: (typeof AGENTS)[number];
  tasks: Task[];
  content: ContentItem[];
}

export default function AgentDetailPage() {
  const params = useParams();
  const agentType = params.type as string;
  const agent = AGENTS.find((a) => a.type === agentType);

  const [data, setData] = useState<AgentPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generateResult, setGenerateResult] = useState<string | null>(null);

  useEffect(() => {
    if (!agentType) return;
    setLoading(true);
    fetch(`/api/agents/${agentType}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [agentType]);

  if (!agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-400">Agent not found</p>
          <a href="/dashboard" className="inline-flex items-center gap-1.5 mt-4 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const Icon = agent.icon;

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerateResult(null);
    try {
      const res = await fetch(`/api/agents/${agentType}/generate`, { method: "POST" });
      const json = await res.json();
      if (json.error) {
        setGenerateResult(`Error: ${json.error}`);
      } else {
        setGenerateResult(json.content ?? json.task?.content ?? "Generated successfully!");
        const refreshRes = await fetch(`/api/agents/${agentType}`);
        const refreshJson = await refreshRes.json();
        setData(refreshJson);
      }
    } catch (err) {
      setGenerateResult(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <a href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </a>

        <div className={cn("rounded-2xl border p-6 sm:p-8 mb-8", agent.border, agent.bg)}>
          <div className="flex items-start gap-4">
            <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center border shrink-0", agent.border, agent.bg)}>
              <Icon className={cn("w-7 h-7", agent.text)} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{agent.name}</h1>
              <p className="mt-2 text-muted-foreground leading-relaxed">{agent.description}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="font-semibold">Generate New Content</h2>
              <p className="text-sm text-muted-foreground mt-1">Let {agent.name} create something for you</p>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all",
                agent.bg, agent.text, agent.border,
                "hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed border"
              )}
            >
              {generating ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Generating...</>
              ) : (
                <><Sparkles className="w-4 h-4" />{GENERATE_LABELS[agentType] ?? "Generate"}</>
              )}
            </button>
          </div>

          {generateResult && (
            <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/5">
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">{generateResult}</pre>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Recent Tasks</h2>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8">
              <Loader2 className="w-4 h-4 animate-spin" />Loading tasks...
            </div>
          ) : (
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] divide-y divide-white/5">
              {(!data?.tasks || data.tasks.length === 0) && (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  No tasks yet. Click Generate to create your first one!
                </div>
              )}
              {data?.tasks.map((task) => (
                <div key={task.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{task.title}</p>
                      {task.content && (
                        <pre className="text-xs text-muted-foreground mt-1.5 whitespace-pre-wrap font-sans line-clamp-3">
                          {task.content}
                        </pre>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium", STATUS_COLORS[task.status] ?? "text-muted-foreground bg-white/5")}>
                        {task.status === "completed" && <CheckCircle2 className="w-3 h-3" />}
                        {task.status === "running" && <RefreshCw className="w-3 h-3 animate-spin" />}
                        {task.status}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatDate(task.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Generated Content</h2>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8">
              <Loader2 className="w-4 h-4 animate-spin" />Loading content...
            </div>
          ) : (
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] divide-y divide-white/5">
              {(!data?.content || data.content.length === 0) && (
                <div className="p-6 text-center text-muted-foreground text-sm">No content generated yet.</div>
              )}
              {data?.content.map((item) => (
                <div key={item.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <pre className="text-xs text-muted-foreground mt-1.5 whitespace-pre-wrap font-sans line-clamp-4">{item.body}</pre>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", item.status === "published" ? "text-emerald-400 bg-emerald-500/10" : "text-muted-foreground bg-white/5")}>
                        {item.status}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
