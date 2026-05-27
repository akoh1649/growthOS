"use client"

import { BarChart3, Globe, TrendingUp, Zap } from "lucide-react"

const features = [
  {
    icon: Globe,
    name: "Full SEO Suite",
    description: "Technical audits, keyword gap analysis, backlink tracking, and automated on-page optimization.",
  },
  {
    icon: BarChart3,
    name: "Growth Analytics",
    description: "Unified dashboard showing traffic sources, conversion trends, and agent performance metrics.",
  },
  {
    icon: TrendingUp,
    name: "AI Search Ready",
    description: "LLM-optimized content strategies ensuring your brand appears in ChatGPT, Claude, and Perplexity answers.",
  },
  {
    icon: Zap,
    name: "Auto-Publish",
    description: "Connect your CMS, blog, and social accounts. Your agents draft, review, and publish — you approve.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 lg:py-32 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                grow
              </span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Most founders spend 70% of their time on product and 30% on distribution.
              GrowthOS flips that — your AI agents handle the distribution so you stay focused on building.
            </p>
            <div className="mt-8 space-y-4">
              {features.map((f) => (
                <div key={f.name} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <f.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-medium">{f.name}</div>
                    <div className="text-sm text-muted-foreground">{f.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            {/* Mock dashboard preview */}
            <div className="glass rounded-2xl p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="text-xs text-muted-foreground">Agent Activity Dashboard</div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  ["SEO Fixes", "12", "↑ 8%"],
                  ["Content Drafts", "24", "↑ 34%"],
                  ["Reddit Mentions", "47", "↑ 12%"],
                  ["X Posts", "18", "↑ 22%"],
                ].map(([label, value, trend]) => (
                  <div key={label} className="rounded-xl bg-white/[0.02] border border-white/5 p-3">
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="text-xl font-bold mt-1">{value}</div>
                    <div className="text-xs text-emerald-400 mt-0.5">{trend}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
                <div className="text-xs text-muted-foreground mb-3">Recent Agent Activity</div>
                {[
                  ["SEO Agent", "Fixed 3 broken internal links", "2m ago"],
                  ["Content Writer", "Published '10 SEO Tips' post", "5m ago"],
                  ["Reddit Scout", "Found discussion in r/SaaS", "12m ago"],
                  ["X Presence", "Posted thread: Growth tips", "24m ago"],
                ].map(([agent, action, time]) => (
                  <div key={time} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-emerald-400">{agent}</span>
                      <span className="text-xs text-muted-foreground">{action}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
