# GrowthOS 🌱

> **Your AI Growth Team, working around the clock.**

GrowthOS is a full-stack AI-powered marketing operating system for indie founders, solopreneurs, and small teams. Replace a $150K marketing team with 6 autonomous AI agents for $99/mo.

**Tech Stack:** Next.js 16 | React 19 | Tailwind CSS 4 | SQLite | OpenRouter AI | cheerio

---

## ✨ Features

### 6 AI Growth Agents

| Agent | What It Does |
|-------|-------------|
| **SEO Optimizer** | Website audits, meta tag analysis, heading structure, link optimization |
| **GEO Strategist** | AI search engine optimization (ChatGPT, Claude, Perplexity) |
| **Content Writer** | Blog posts, case studies, landing page copy in your brand voice |
| **Reddit Scout** | 24/7 subreddit monitoring + authentic reply drafts |
| **HN Launcher** | Show HN post crafting with title + framing optimization |
| **X Presence** | Brand voice tweets, threads, and engagement content |

### Full Dashboard
- Live agent task tracking
- SEO analysis history with scores (0-100)
- Content generation pipeline
- Per-agent detail pages

---

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- npm or bun

### Installation

```bash
# Clone
git clone https://github.com/your-username/growthos.git
cd growthos

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local — add your OPENROUTER_API_KEY

# Initialize database
npm run dev
# DB auto-creates on first run

# Build
npm run build

# Start production
npm start
```

### Development
```bash
npm run dev
# Opens at http://localhost:3000
```

---

## 🧭 Routes

| Route | Type | Description |
|-------|------|-------------|
| `/` | Static | Landing page with hero, agents, features, pricing, CTA |
| `/dashboard` | SSR | Live dashboard — KPIs, agent grid, activity feed, sites table |
| `/agents/seo` | SSR | SEO agent detail — tasks, content generation |
| `/agents/geo` | SSR | GEO strategist detail |
| `/agents/writer` | SSR | Content writer detail |
| `/agents/reddit` | SSR | Reddit scout detail |
| `/agents/hackernews` | SSR | HN launcher detail |
| `/agents/x` | SSR | X presence detail |

---

## 🔌 API Reference

### `POST /api/analyze`
Analyze a website for SEO.

```json
// Request
{ "url": "https://example.com" }

// Response
{
  "analysis": {
    "id": "uuid",
    "score": 72,
    "issues": [
      { "type": "missing_title", "severity": "high", "message": "Page has no title tag" }
    ],
    "title": "Example Domain",
    "description": "...",
    "linksCount": 5,
    "imagesCount": 0,
    "loadTimeMs": 342
  }
}
```

### `GET /api/dashboard`
Returns dashboard data: sites, recent tasks, agent counts.

### `GET /api/agents/:type`
Returns agent info, task history, and generated content.

### `POST /api/agents/:type/generate`
Generate content via AI. Type-specific prompts:
- `writer` → blog post
- `reddit` → Reddit reply
- `x` → tweet thread
- `seo` → SEO recommendations
- `geo` → GEO analysis
- `hackernews` → Show HN post

---

## 🚢 Deployment

### Replit (Recommended)
1. Fork/create repo on GitHub
2. Create Replit account → **Import from GitHub**
3. Add `OPENROUTER_API_KEY` to Replit **Secrets**
4. Run: `npm run build && npm start`
5. Done. Your GrowthOS is live.

### Vercel
```bash
npm i -g vercel
vercel
```
Note: SQLite is ephemeral on Vercel serverless — data resets on cold starts. For persistent DB, swap to PostgreSQL (see below).

### Persistent Database (Production)
For production, swap SQLite for PostgreSQL:
1. Install `@neondatabase/serverless` + `pg`
2. Replace `src/lib/db.ts` with Postgres client
3. Set `DATABASE_URL` to your Neon/Postgres connection string

---

## 🧠 AI Configuration

GrowthOS uses **OpenRouter** for AI content generation. Default model: `google/gemma-4-26b-a4b-it`.

To change the model, edit `src/lib/ai.ts`:
```typescript
const MODEL = "your/preferred-model"; // e.g. "openai/gpt-4o"
```

---

## 📁 Project Structure

```
growthos/
├── prisma/
│   ├── dev.db               # SQLite database (auto-created)
│   └── migrations/           # Schema migrations
├── src/
│   ├── app/
│   │   ├── page.tsx          # Landing page
│   │   ├── layout.tsx        # Root layout (dark theme, fonts)
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx      # Dashboard page
│   │   ├── agents/
│   │   │   └── [type]/
│   │   │       └── page.tsx  # Agent detail pages
│   │   └── api/
│   │       ├── analyze/route.ts
│   │       ├── dashboard/route.ts
│   │       └── agents/[type]/
│   │           ├── route.ts
│   │           └── generate/route.ts
│   ├── components/
│   │   ├── layout/           # Header, Hero, Features, Pricing, CTA, Footer
│   │   └── agents/           # AgentGrid
│   └── lib/
│       ├── db.ts             # SQLite connection via better-sqlite3
│       ├── seo.ts            # SEO analysis engine (cheerio)
│       ├── ai.ts             # OpenRouter AI client
│       └── utils.ts          # cn() utility
├── replit.nix
├── .env.example
└── package.json
```

---

## 🔑 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENROUTER_API_KEY` | Yes | — | API key for AI content generation |
| `DATABASE_URL` | No | `file:./prisma/dev.db` | SQLite database path |

---

## 🏗️ Built By

**AK Agency** — Multi-agent AI agency for automation, design, and development.

| Agent | Role |
|-------|------|
| **Prism** 🎯 | Lead — market analysis, copywriting, design vision |
| **Spectrum** 🔬 | Market research, competitive analysis |
| **Codex** 💻 | Implementation — full-stack React/Next.js |
| **Canvas** 🎨 | Design system, UI/UX |
| **Clasp** 🔗 | Deployment, infrastructure |

---

## 📄 License

MIT — use it, fork it, ship it.