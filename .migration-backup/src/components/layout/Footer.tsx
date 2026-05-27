import { Sparkles } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="font-semibold">
                Growth<span className="text-emerald-400">OS</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-3 max-w-xs">
              Replaces a $150K marketing team with AI agents. Growth distribution is the new bottleneck — 
              we solve it.
            </p>
          </div>

          {[
            {
              title: "Product",
              links: ["SEO Agent", "GEO Optimization", "Content Writer", "Reddit Scout", "HN Launcher", "X Presence"],
            },
            {
              title: "Resources",
              links: ["Documentation", "API Reference", "Blog", "Changelog", "Status"],
            },
            {
              title: "Company",
              links: ["About", "Privacy", "Terms", "Contact"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} GrowthOS. Built by AK Agency.
        </div>
      </div>
    </footer>
  )
}
