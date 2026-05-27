import { Link } from "wouter"
import { Sparkles } from "lucide-react"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="font-semibold text-lg tracking-tight">
              Growth<span className="text-emerald-400">OS</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#agents" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Agents
            </a>
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-emerald-950 text-sm font-medium hover:bg-emerald-400 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Get Started
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
