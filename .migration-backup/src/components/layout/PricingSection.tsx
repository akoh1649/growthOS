"use client"

import { Check, Sparkles } from "lucide-react"

const tiers = [
  {
    name: "Starter",
    price: "$49",
    description: "For solo founders validating their idea",
    features: [
      "1 website connection",
      "SEO audit agent",
      "Content writer (5 posts/mo)",
      "Reddit monitoring (basic)",
      "Email support",
    ],
    cta: "Get Started",
    featured: false,
  },
  {
    name: "Growth",
    price: "$99",
    description: "For early-stage teams scaling distribution",
    features: [
      "3 website connections",
      "All 6 AI agents",
      "Unlimited content generation",
      "Reddit + HN + X monitoring",
      "GEO/LLM optimization",
      "Auto-publish to CMS",
      "Priority support",
      "Growth analytics dashboard",
    ],
    cta: "Most Popular",
    featured: true,
  },
  {
    name: "Scale",
    price: "$249",
    description: "For growing startups with multiple products",
    features: [
      "10 website connections",
      "All agents + custom agent builder",
      "Unlimited everything",
      "Multi-platform monitoring",
      "Custom brand voice profiles",
      "API access",
      "Team collaboration (5 seats)",
      "Dedicated account manager",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    featured: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 lg:py-32 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Simple pricing.{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              10x leverage.
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Compare to a $150K/year marketing hire. One SEO fix or one viral Reddit post pays for itself.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-6 border ${
                tier.featured
                  ? "border-emerald-500/40 bg-emerald-500/5 shadow-lg shadow-emerald-500/10"
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500 text-emerald-950 text-xs font-semibold">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{tier.description}</p>
              </div>
              <ul className="space-y-3 mb-8">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className={`block text-center py-3 rounded-xl font-medium transition-all ${
                  tier.featured
                    ? "bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
                    : "glass hover:bg-white/10"
                }`}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
