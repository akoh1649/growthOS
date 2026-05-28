"use client";

import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  BarChart3,
  Globe,
  FileText,
  Activity,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  TrendingUp,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsData {
  totalSites: number;
  totalAnalyses: number;
  contentGenerated: number;
  avgScore: number;
  tasksByAgent: Record<string, number>;
  tasksByStatus: Record<string, number>;
  scoresOverTime: { date: string; score: number; name: string }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard").then((r) => r.json()),
    ])
      .then(([dashboard]) => {
        const avgScore =
          dashboard.sites.length > 0
            ? Math.round(
                dashboard.sites.reduce(
                  (sum: number, s: { lastAnalysis?: { score: number } }) =>
                    sum + (s.lastAnalysis?.score ?? 0),
                  0,
                ) / dashboard.sites.length,
              )
            : 0;

        const tasksByStatus: Record<string, number> = {};
        for (const task of dashboard.recentTasks) {
          tasksByStatus[task.status] =
            (tasksByStatus[task.status] ?? 0) + 1;
        }

        const scoresOverTime = dashboard.sites
          .filter(
            (s: { lastAnalysis: { score: number; created_at: string } | null }) =>
              s.lastAnalysis?.score != null,
          )
          .slice(0, 10)
          .map(
            (s: { name: string; lastAnalysis: { score: number; created_at: string } }) => ({
              date: s.lastAnalysis.created_at.split("T")[0],
              score: s.lastAnalysis.score,
              name: s.name,
            }),
          );

        setData({
          totalSites: dashboard.sites.length,
          totalAnalyses: dashboard.totalAnalyses,
          contentGenerated: dashboard.contentGenerated,
          avgScore,
          tasksByAgent: dashboard.agentCounts,
          tasksByStatus,
          scoresOverTime,
        });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading analytics...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-400">Failed to load analytics</p>
        </div>
      </div>
    );
  }

  const totalTasks = Object.values(data.tasksByAgent).reduce((a, b) => a + b, 0);
  const completedTasks = data.tasksByStatus["completed"] ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="mt-1 text-muted-foreground">Performance metrics and trends</p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl glass text-sm text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Avg SEO Score", value: `${data.avgScore}`, suffix: "/100", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Total Analyses", value: data.totalAnalyses, icon: BarChart3, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Content Generated", value: data.contentGenerated, icon: FileText, color: "text-amber-400", bg: "bg-amber-500/10" },
            { label: "Tasks Completed", value: completedTasks, suffix: `/ ${totalTasks}`, icon: Activity, color: "text-purple-400", bg: "bg-purple-500/10" },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-muted-foreground">{kpi.label}</span>
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", kpi.bg)}>
                  <kpi.icon className={cn("w-4.5 h-4.5", kpi.color)} />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{kpi.value}</span>
                {kpi.suffix && <span className="text-sm text-muted-foreground">{kpi.suffix}</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <h2 className="text-lg font-semibold mb-4">Tasks by Agent</h2>
            <div className="space-y-3">
              {Object.entries(data.tasksByAgent).map(([agentType, count]) => {
                const COLORS: Record<string, { bar: string; text: string; label: string }> = {
                  seo: { bar: "bg-blue-500", text: "text-blue-400", label: "SEO Optimizer" },
                  geo: { bar: "bg-purple-500", text: "text-purple-400", label: "GEO Strategist" },
                  writer: { bar: "bg-amber-500", text: "text-amber-400", label: "Content Writer" },
                  reddit: { bar: "bg-orange-500", text: "text-orange-400", label: "Reddit Scout" },
                  hackernews: { bar: "bg-red-500", text: "text-red-400", label: "HN Launcher" },
                  x: { bar: "bg-sky-500", text: "text-sky-400", label: "X Presence" },
                };
                const c = COLORS[agentType] ?? { bar: "bg-gray-500", text: "text-gray-400", label: agentType };
                const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                return (
                  <div key={agentType}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn("text-sm", c.text)}>{c.label}</span>
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", c.bar)} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <h2 className="text-lg font-semibold mb-4">Task Status Breakdown</h2>
            <div className="flex items-center justify-center h-48">
              <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                {[
                  { status: "completed", label: "Completed", count: data.tasksByStatus["completed"] ?? 0, color: "bg-emerald-500", text: "text-emerald-400" },
                  { status: "running", label: "Running", count: data.tasksByStatus["running"] ?? 0, color: "bg-blue-500", text: "text-blue-400" },
                  { status: "pending", label: "Pending", count: data.tasksByStatus["pending"] ?? 0, color: "bg-amber-500", text: "text-amber-400" },
                  { status: "failed", label: "Failed", count: data.tasksByStatus["failed"] ?? 0, color: "bg-red-500", text: "text-red-400" },
                ].map((item) => (
                  <div key={item.status} className="text-center p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                    <div className={cn("text-2xl font-bold mb-1", item.text)}>{item.count}</div>
                    <div className="flex items-center justify-center gap-1.5">
                      <div className={cn("w-2 h-2 rounded-full", item.color)} />
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {data.scoresOverTime.length > 0 && (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Site Scores</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {data.scoresOverTime.map((item, i) => {
                const scoreColor = item.score >= 80 ? "text-emerald-400" : item.score >= 50 ? "text-amber-400" : "text-red-400";
                const barColor = item.score >= 80 ? "bg-emerald-500" : item.score >= 50 ? "bg-amber-500" : "bg-red-500";
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                    <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", barColor)} style={{ width: `${item.score}%` }} />
                        </div>
                        <span className={cn("text-xs font-semibold shrink-0", scoreColor)}>{item.score}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        <Clock className="w-3 h-3 inline mr-0.5" />
                        {item.date}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {data.totalSites === 0 && (
          <div className="text-center py-16">
            <BarChart3 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No analytics data yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Run an analysis to start seeing metrics</p>
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl glass text-sm text-foreground hover:bg-white/[0.06] transition-all">
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
