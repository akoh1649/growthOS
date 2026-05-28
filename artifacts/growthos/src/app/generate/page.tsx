"use client";

import { useState } from "react";
import { Link } from "wouter";
import {
  Search,
  Brain,
  PenLine,
  MessageCircle,
  Newspaper,
  AtSign,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Toaster, toast } from "sonner";

const AGENTS = [
  { type: "seo", name: "SEO Optimizer", icon: Search, color: "border-blue-500/20", bg: "bg-blue-500/10", text: "text-blue-400", ring: "ring-blue-500/30", placeholder: "https://example.com", inputLabel: "Website URL" },
  { type: "geo", name: "GEO Strategist", icon: Brain, color: "border-purple-500/20", bg: "bg-purple-500/10", text: "text-purple-400", ring: "ring-purple-500/30", placeholder: "Your brand or topic", inputLabel: "Brand / Topic" },
  { type: "writer", name: "Content Writer", icon: PenLine, color: "border-amber-500/20", bg: "bg-amber-500/10", text: "text-amber-400", ring: "ring-amber-500/30", placeholder: "Blog post, case study, landing page...", inputLabel: "Content Brief" },
  { type: "reddit", name: "Reddit Scout", icon: MessageCircle, color: "border-orange-500/20", bg: "bg-orange-500/10", text: "text-orange-400", ring: "ring-orange-500/30", placeholder: "Topic or keyword to monitor", inputLabel: "Topic" },
  { type: "hackernews", name: "HN Launcher", icon: Newspaper, color: "border-red-500/20", bg: "bg-red-500/10", text: "text-red-400", ring: "ring-red-500/30", placeholder: "Your product or article", inputLabel: "Submission Title" },
  { type: "x", name: "X Presence", icon: AtSign, color: "border-sky-500/20", bg: "bg-sky-500/10", text: "text-sky-400", ring: "ring-sky-500/30", placeholder: "Campaign or topic", inputLabel: "Campaign Topic" },
];

const MODELS = [
  { value: "google/gemma-4-26b-a4b-it", label: "Gemma 4 (Fast)", cost: "$0.06/M" },
  { value: "deepseek/deepseek-v4-flash", label: "DeepSeek V4 Flash", cost: "$0.15/M" },
  { value: "moonshotai/kimi-k2.5", label: "Kimi k2.5 (Complex)", cost: "$1.50/M" },
];

export default function GeneratePage() {
  const [selectedAgent, setSelectedAgent] = useState<string>("seo");
  const [input, setInput] = useState("");
  const [model, setModel] = useState(MODELS[0].value);
  const [submitting, setSubmitting] = useState(false);

  const agent = AGENTS.find((a) => a.type === selectedAgent)!;

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setSubmitting(true);
    toast.loading(`Starting ${agent.name} task...`, { id: "task-toast" });
    try {
      const res = await fetch(`/api/agents/${selectedAgent}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input.trim(), model }),
      });
      if (!res.ok) throw new Error(await res.text());
      const result = await res.json();
      toast.success(`${agent.name} task created!`, {
        id: "task-toast",
        description: `Task #${result.task?.id?.slice(0, 8) ?? "unknown"} — ${agent.name} is processing your request.`,
        duration: 5000,
      });
      setInput("");
    } catch (err) {
      toast.error("Task failed", {
        id: "task-toast",
        description: err instanceof Error ? err.message : "Something went wrong",
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "hsl(222.2 84% 6.9%)",
            border: "1px solid hsl(217.2 32.6% 17.5%)",
            color: "hsl(210 40% 98%)",
          },
        }}
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Generate</h1>
            <p className="mt-1 text-muted-foreground">Trigger a task for any AI agent</p>
          </div>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl glass text-sm text-muted-foreground hover:text-foreground transition-all">
            <ArrowUpRight className="w-3.5 h-3.5" />
            Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Select Agent</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {AGENTS.map((a) => {
              const Icon = a.icon;
              const isSelected = selectedAgent === a.type;
              return (
                <button
                  key={a.type}
                  onClick={() => setSelectedAgent(a.type)}
                  className={cn(
                    "p-4 rounded-2xl border text-center transition-all duration-200",
                    isSelected ? `${a.bg} ${a.color} ring-2 ${a.ring}` : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]",
                  )}
                >
                  <Icon className={cn("w-6 h-6 mx-auto mb-2", isSelected ? a.text : "text-muted-foreground")} />
                  <p className={cn("text-xs font-medium", isSelected ? a.text : "text-muted-foreground")}>
                    {a.name.split(" ")[0]}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className={cn("rounded-2xl border p-6 mb-6", agent.color)}>
          <div className="flex items-center gap-3 mb-4">
            <agent.icon className={cn("w-6 h-6", agent.text)} />
            <div>
              <h2 className="font-semibold">{agent.name}</h2>
              <p className="text-sm text-muted-foreground">{agent.inputLabel}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={agent.placeholder}
                disabled={submitting}
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-sm"
                onKeyDown={(e) => { if (e.key === "Enter" && !submitting && input.trim()) handleSubmit(); }}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {MODELS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setModel(m.value)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-lg border transition-all",
                    model === m.value
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "border-white/10 text-muted-foreground hover:border-white/20",
                  )}
                >
                  {m.label} <span className="opacity-60">{m.cost}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !input.trim()}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all",
                submitting || !input.trim()
                  ? "bg-white/5 text-muted-foreground cursor-not-allowed"
                  : "bg-emerald-500 text-black hover:bg-emerald-400 active:scale-[0.98]",
              )}
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Running {agent.name}...</>
              ) : (
                <><Send className="w-4 h-4" />Run {agent.name}</>
              )}
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <Sparkles className="w-5 h-5 text-emerald-400 mb-2" />
            <h3 className="text-sm font-semibold mb-1">Model Routing</h3>
            <p className="text-xs text-muted-foreground">Choose your model. Gemma 4 for speed, DeepSeek for analysis, Kimi for complex reasoning.</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <CheckCircle2 className="w-5 h-5 text-blue-400 mb-2" />
            <h3 className="text-sm font-semibold mb-1">Auto-Routing</h3>
            <p className="text-xs text-muted-foreground">Tasks are automatically assigned to the correct agent with fallback model selection.</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <AlertCircle className="w-5 h-5 text-amber-400 mb-2" />
            <h3 className="text-sm font-semibold mb-1">Notifications</h3>
            <p className="text-xs text-muted-foreground">Task status updates appear here. Check the Dashboard for full history.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
