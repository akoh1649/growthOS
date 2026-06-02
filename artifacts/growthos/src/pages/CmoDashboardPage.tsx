import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, LinkIcon, Radio, Scan } from "lucide-react";
import { toast } from "sonner";

interface Tactic {
  tactic: string;
  priority: number;
  effort: string;
  impact: string;
  channels?: string[];
}

interface EvaluateResult {
  recommended_tactics?: Tactic[];
  quick_wins?: string[];
  monthly_budget_allocation?: Record<string, number>;
  kpis?: string[];
}

function StrategyEvaluation() {
  const [domain, setDomain] = useState("");
  const [niche, setNiche] = useState("");

  const m = useMutation<EvaluateResult, Error, { domain: string; niche: string }>({
    mutationFn: (p) =>
      fetch("/api/agents/cmo/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      }).then((r) => {
        if (!r.ok) throw new Error("Evaluation failed");
        return r.json();
      }),
    onSuccess: () => toast.success("Strategy evaluation complete"),
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Input
          placeholder="Domain (e.g. example.com)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
        <Input
          placeholder="Niche (e.g. fintech)"
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
        />
        <Button
          onClick={() => m.mutate({ domain, niche })}
          disabled={m.isPending || !domain || !niche}
        >
          {m.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
          Evaluate
        </Button>
      </div>

      {m.data?.recommended_tactics && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Recommended Tactics</p>
          {m.data.recommended_tactics.map((t, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
              <div>
                <p className="text-sm font-medium">{t.tactic}</p>
                <p className="text-xs text-muted-foreground">
                  Effort: {t.effort} · Impact: {t.impact}
                  {t.channels?.length ? ` · ${t.channels.join(", ")}` : ""}
                </p>
              </div>
              <Badge variant={t.priority <= 2 ? "default" : "secondary"}>
                P{t.priority}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {m.data?.quick_wins && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Quick Wins This Week</p>
          {m.data.quick_wins.map((w, i) => (
            <div key={i} className="flex gap-2 text-sm p-2 border rounded bg-emerald-500/5 border-emerald-500/20">
              <span className="text-emerald-400">✓</span>
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {m.data?.kpis && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">KPIs to Track</p>
          <div className="flex flex-wrap gap-2">
            {m.data.kpis.map((k, i) => (
              <Badge key={i} variant="outline">{k}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HaroPanel() {
  const [keywords, setKeywords] = useState("");
  const m = useMutation({
    mutationFn: (kws: string[]) =>
      fetch("/api/agents/cmo/haro/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: kws }),
      }).then((r) => r.json()),
    onSuccess: () => toast.success("HARO queries fetched"),
    onError: () => toast.error("HARO fetch failed"),
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Input
          placeholder="Keywords (comma-separated, e.g. marketing, SaaS)"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
        />
        <Button
          onClick={() => m.mutate(keywords.split(",").map((k) => k.trim()).filter(Boolean))}
          disabled={m.isPending}
        >
          {m.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Radio className="h-4 w-4 mr-1" />}
          Fetch Queries
        </Button>
      </div>
      {m.data?.queries?.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">No matching queries found.</p>
      )}
      {m.data?.queries?.map((q: any) => (
        <div key={q.id} className="p-3 border rounded-lg space-y-1">
          <p className="text-sm font-medium">{q.title}</p>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">{q.category}</Badge>
            {q.deadline && <span className="text-xs text-muted-foreground">Due: {q.deadline}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function BrokenLinksPanel() {
  const [url, setUrl] = useState("");
  const m = useMutation({
    mutationFn: (u: string) =>
      fetch("/api/agents/cmo/broken-links/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: u }),
      }).then((r) => r.json()),
    onSuccess: (d) => toast.success(`Scan complete — ${d.brokenLinks?.length ?? 0} broken links found`),
    onError: () => toast.error("Scan failed"),
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Input
          placeholder="Target URL (e.g. https://competitor.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button onClick={() => m.mutate(url)} disabled={m.isPending || !url}>
          {m.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Scan className="h-4 w-4 mr-1" />}
          Scan
        </Button>
      </div>
      {m.data && (
        <div className="space-y-3">
          <div className="flex gap-4 text-sm">
            <span>Checked: <strong>{m.data.totalChecked}</strong></span>
            <span className="text-red-400">Broken: <strong>{m.data.brokenLinks?.length ?? 0}</strong></span>
            <span className="text-emerald-400">Linkable assets: <strong>{m.data.linkableAssets?.length ?? 0}</strong></span>
          </div>
          {m.data.brokenLinks?.map((l: any, i: number) => (
            <div key={i} className="p-3 border border-red-500/20 rounded-lg bg-red-500/5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground truncate max-w-sm">{l.url}</p>
                <Badge variant="destructive" className="text-xs">{l.statusCode || "Timeout"}</Badge>
              </div>
              <p className="text-xs mt-1 text-muted-foreground">Anchor: "{l.anchorText}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CmoDashboard() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-emerald-400" />
            Strategy Evaluation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StrategyEvaluation />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="haro">
            <TabsList>
              <TabsTrigger value="haro">HARO</TabsTrigger>
              <TabsTrigger value="broken">Broken Links</TabsTrigger>
            </TabsList>
            <TabsContent value="haro" className="mt-4">
              <HaroPanel />
            </TabsContent>
            <TabsContent value="broken" className="mt-4">
              <BrokenLinksPanel />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export function CmoDashboardPage() {
  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">CMO Dashboard</h1>
        <p className="text-muted-foreground">AI-powered backlink strategy orchestration</p>
      </div>
      <CmoDashboard />
    </div>
  );
}
