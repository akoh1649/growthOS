"use client"

import {
  Search,
  Brain,
  PenLine,
  MessageCircle,
  Newspaper,
  AtSign,
  ArrowRight,
} from "lucide-react"

const agents = [
  {
    type: "seo",
    icon: Search,
    name: "SEO Optimizer",
    description:
      "Runs comprehensive SEO audits, identifies ranking opportunities, and auto-generates optimized meta tags, headings, and structured data.",
    color: "from-blue-500 to-cyan-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-400",
  },
  {
    type: "geo",
    icon: Brain,
    name: "GEO Strategist",
    description:
      "Optimizes your content for AI search engines (ChatGPT, Claude, Perplexity, Gemini). Ensures your brand gets picked up by LLM responses.",
    color: "from-purple-500 to-pink-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    text: "text-purple-400",
  },
  {
    type: "writer",
    icon: PenLine,
    name: "Content Writer",
    description:
      "Generates high-quality blog posts, case studies, and landing page copy in your brand voice. Publishes directly to your CMS.",
    color: "from-amber-500 to-orange-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-400",
  },
  {
    type: "reddit",
    icon: MessageCircle,
    name: "Reddit Scout",
    description:
      "Monitors 100+ subreddits 24/7 for relevant discussions. Drafts authentic, helpful replies that drive organic traffic without spam.",
    color: "from-orange-500 to-red-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    text: "text-orange-400",
  },
  {
    type: "hackernews",
    icon: Newspaper,
    name: "HN Launcher",
    description:
      "Crafts compelling Hacker News Show HN posts with the perfect title, framing, and first comment to maximize your launch impact.",
    color: "from-red-500 to-rose-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    text: "text-red-400",
  },
  {
    type: "x",
    icon: AtSign,
    name: "X Presence",
    description:
      "Maintains your brand voice across X/Twitter. Generates threaded content, engagement replies, and consistent daily posting.",
    color: "from-sky-500 to-blue-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    text: "text-sky-400",
  },
  {
    type: "support",
    icon: MessageCircle,
    name: "Customer Support",
    description:
      "Answers your GrowthOS questions, guides you through onboarding, suggests which agent to use, and helps with troubleshooting.",
    color: "from-teal-500 to-cyan-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    text: "text-teal-400",
  },
]

export function AgentsSection() {
  return (
    <section id="agents" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Meet Your{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              Growth Agents
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Seven specialized AI agents working in parallel to drive traffic, users, and growth — 
            completely autonomous, always learning.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <a
              key={agent.name}
              href={`/agents/${agent.type}`}
              className={`group relative rounded-2xl p-6 border ${agent.border} ${agent.bg} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] no-underline`}
            >
              <div className={`w-12 h-12 rounded-xl ${agent.bg} border ${agent.border} flex items-center justify-center mb-4`}>
                <agent.icon className={`w-6 h-6 ${agent.text}`} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{agent.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{agent.description}</p>
              <div className="mt-4 flex items-center gap-1 text-xs text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                View activity log <ArrowRight className="w-3 h-3" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
