"use client"

import { useState } from "react";
import { ArrowRight, Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function CTASection() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ score: number; issues: string[]; title?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Analysis failed");
      }

      const json = await res.json();
      setResult({
        score: json.analysis.score,
        issues: json.analysis.issues,
        title: json.analysis.title,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative py-24 lg:py-32 border-t border-white/5">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="glass rounded-3xl p-8 sm:p-12 lg:p-16 border border-emerald-500/10 relative overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Ready to{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                grow on autopilot
              </span>
              ?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg mx-auto">
              Paste your website URL. Get a full growth engine running in 60 seconds.
              No meetings. No contracts. Just results.
            </p>

            <div className="mt-10 max-w-md mx-auto">
              <div className="flex items-center gap-2 glass rounded-xl border border-white/10 p-1 pl-4">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loading && url.trim()) handleAnalyze();
                  }}
                  placeholder="https://your-startup.com"
                  className="flex-1 bg-transparent text-sm py-3 outline-none placeholder:text-muted-foreground/50"
                />
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !url.trim()}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap",
                    loading || !url.trim()
                      ? "bg-white/5 text-muted-foreground cursor-not-allowed"
                      : "bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
                  )}
                >
                  {loading ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" />Analyzing...</>
                  ) : (
                    <>Analyze<ArrowRight className="w-3.5 h-3.5" /></>
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">Free analysis. No credit card required.</p>
            </div>

            {result && (
              <div className="mt-6 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-left max-w-md mx-auto">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-400">Analysis Complete</span>
                </div>
                {result.title && <p className="text-xs text-muted-foreground mb-2">{result.title}</p>}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", result.score >= 80 ? "bg-emerald-500" : result.score >= 50 ? "bg-amber-500" : "bg-red-500")}
                      style={{ width: `${result.score}%` }}
                    />
                  </div>
                  <span className={cn("text-sm font-bold", result.score >= 80 ? "text-emerald-400" : result.score >= 50 ? "text-amber-400" : "text-red-400")}>
                    {result.score}/100
                  </span>
                </div>
                {result.issues.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {result.issues.length} issue{result.issues.length !== 1 ? "s" : ""} found
                  </p>
                )}
                <a href="/dashboard" className="inline-flex items-center gap-1.5 mt-3 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                  <Sparkles className="w-3 h-3" />
                  View full report on Dashboard
                </a>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-left max-w-md mx-auto">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-red-400">Analysis Failed</span>
                </div>
                <p className="text-xs text-red-400/80">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
