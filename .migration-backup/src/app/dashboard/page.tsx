"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Brain,
  PenLine,
  MessageCircle,
  Newspaper,
  AtSign,
  Globe,
  Activity,
  BarChart3,
  FileText,
  Loader2,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Site {
  id: string;
  url: string;
  name: string;
  lastAnalysis: {
    score: number;
    issues: number;
    created_at: string;
  } | null;
}

interface Task {
  id: string;
  agentType: string;
  title: string;
  status: string;
  createdAt: string;
}

interface DashboardData {
  sites: Site[];
  recentTasks: Task[];
  agentCounts: Record<string, number>;
  totalAnalyses: number;
  contentGenerated: number;
}

const AGENT_CONFIG: Record<
  string,
  { name: string; icon: React.ElementType; color: string; glow: string }
> = {
  seo: {
    name: "SEO Optimizer",
    icon: Search,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    glow: "shadow-blue-500/10",
  },
  geo: {
    name: "GEO Strategist",
    icon: Brain,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    glow: "shadow-purple-500/10",
  },
  writer: {
    name: "Content Writer",
    icon: PenLine,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    glow: "shadow-amber-500/10",
  },
  reddit: {
    name: "Reddit Scout",
    icon: MessageCircle,
    color: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    glow: "shadow-orange-500/10",
  },
  hackernews: {
    name: "HN Launcher",
    icon: Newspaper,
    color: "text-red-400 bg-red-500/10 border-red-500/20",
    glow: "shadow-red-500/10",
  },
  x: {
    name: "X Presence",
    icon: AtSign,
    color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    glow: "shadow-sky-500/10",
  },
};

const STATUS_COLORS: Record<string, string> = {
  completed: "text-emerald-400",
  running: "text-blue-400",
  pending: "text-muted-foreground",
  failed: "text-red-400",
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  completed: CheckCircle2,
  running: RefreshCw,
  pending: Clock,
  failed: AlertCircle,
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "Z");
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-400">Failed to load dashboard: {error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const avgScore =
    data.sites.length > 0
      ? Math.round(
          data.sites.reduce(
            (sum, s) => sum + (s.lastAnalysis?.score ?? 0),
            0
          ) / data.sites.length
        )
      : 0;

  const runningTasks = data.recentTasks.filter(
    (t) => t.status === "running"
  ).length;

  const kpis = [
    {
      label: "Sites Analyzed",
      value: data.sites.length,
      icon: Globe,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "SEO Score Avg",
      value: `${avgScore}`,
      suffix: "/100",
      icon: BarChart3,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Tasks Running",
      value: runningTasks,
      icon: Activity,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      label: "Content Generated",
      value: data.contentGenerated,
      icon: FileText,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Your Growth Dashboard
            </h1>
            <p className="mt-1 text-muted-foreground">
              {data.sites.length} site{data.sites.length !== 1 ? "s" : ""} under management
            </p>
          </div>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl glass text-sm text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Back to Home
          </a>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-muted-foreground">
                  {kpi.label}
                </span>
                <div
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center",
                    kpi.bg
                  )}
                >
                  <kpi.icon className={cn("w-4.5 h-4.5", kpi.color)} />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{kpi.value}</span>
                {kpi.suffix && (
                  <span className="text-sm text-muted-foreground">
                    {kpi.suffix}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Agent Status Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Agent Status</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(AGENT_CONFIG).map(([type, config]) => {
              const taskCount = data.agentCounts[type] ?? 0;
              const Icon = config.icon;
              return (
                <a
                  key={type}
                  href={`/agents/${type}`}
                  className={cn(
                    "rounded-2xl border p-5 transition-all duration-200 hover:scale-[1.02] group",
                    config.color
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-inherit bg-inherit">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{config.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {taskCount} task{taskCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Two-column: Activity Feed + Sites */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Activity Feed */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] divide-y divide-white/5">
              {data.recentTasks.length === 0 && (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  No activity yet. Run an SEO analysis to get started!
                </div>
              )}
              {data.recentTasks.slice(0, 10).map((task) => {
                const config = AGENT_CONFIG[task.agentType];
                const StatusIcon = STATUS_ICONS[task.status] ?? Clock;
                const statusColor = STATUS_COLORS[task.status] ?? "text-muted-foreground";
                const Icon = config?.icon ?? Activity;

                return (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 shrink-0">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {config?.name ?? task.agentType}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusIcon
                        className={cn("w-3.5 h-3.5", statusColor)}
                      />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(task.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sites List */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Sites</h2>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] divide-y divide-white/5">
              {data.sites.length === 0 && (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  No sites added yet.
                </div>
              )}
              {data.sites.map((site) => (
                <div
                  key={site.id}
                  className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {site.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {site.url}
                    </p>
                  </div>
                  {site.lastAnalysis && (
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <div className="text-right">
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            site.lastAnalysis.score >= 80
                              ? "text-emerald-400"
                              : site.lastAnalysis.score >= 50
                              ? "text-amber-400"
                              : "text-red-400"
                          )}
                        >
                          {site.lastAnalysis.score}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          /100
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {site.lastAnalysis.issues} issues
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}