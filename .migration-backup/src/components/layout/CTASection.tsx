"use client"

import { ArrowRight, Sparkles } from "lucide-react"

export function CTASection() {
  return (
    <section className="relative py-24 lg:py-32 border-t border-white/5">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="glass rounded-3xl p-8 sm:p-12 lg:p-16 border border-emerald-500/10 relative overflow-hidden">
          {/* Background decoration */}
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
                  placeholder="https://your-startup.com"
                  className="flex-1 bg-transparent text-sm py-3 outline-none placeholder:text-muted-foreground/50"
                />
                <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 text-emerald-950 text-sm font-semibold hover:bg-emerald-400 transition-all whitespace-nowrap">
                  Analyze
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Free analysis. No credit card required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
