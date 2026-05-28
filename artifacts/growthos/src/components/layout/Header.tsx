import { Link } from "wouter"
import { Sparkles, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

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
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/analytics" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Analytics
            </Link>
            <Link href="/generate" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Generate
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-emerald-950 text-sm font-medium hover:bg-emerald-400 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Dashboard
            </Link>
          </nav>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors">
                  <Menu className="w-5 h-5 text-foreground" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background border-white/10 w-64">
                <nav className="flex flex-col gap-2 mt-8">
                  <Link href="/dashboard" className="px-4 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-white/5 transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/analytics" className="px-4 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-white/5 transition-colors">
                    Analytics
                  </Link>
                  <Link href="/generate" className="px-4 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-white/5 transition-colors">
                    Generate
                  </Link>
                  <div className="border-t border-white/10 my-2" />
                  <Link href="/" className="px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-white/5 transition-colors">
                    Home
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
