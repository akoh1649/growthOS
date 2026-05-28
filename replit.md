# GrowthOS

AI-powered growth marketing platform with 6 autonomous agents: SEO optimizer, GEO strategist, content writer, Reddit scout, HN launcher, and X presence.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/growthos run dev` — run the frontend (Vite)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Optional env: `OPENROUTER_API_KEY` — for AI content generation (OpenRouter)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind v4, wouter (routing)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- AI: OpenRouter (nvidia/nemotron-3-nano-30b-a3b:free by default)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/growthos/` — React + Vite frontend at `/`
  - `src/app/` — page components (Next.js style dirs, now client-only)
  - `src/components/layout/` — landing page sections (Header, Hero, etc.)
  - `src/components/agents/` — AgentGrid component
  - `src/index.css` — Tailwind v4 theme (emerald green primary, dark navy)
- `artifacts/api-server/src/routes/` — Express API routes
  - `agents.ts` — GET `/api/agents/:type`, POST `/api/agents/:type/generate`
  - `dashboard.ts` — GET `/api/dashboard`
  - `analyze.ts` — POST `/api/analyze` (SEO analysis via cheerio)
- `lib/db/src/schema/growthos.ts` — Drizzle schema (users, sites, analyses, agent_tasks, content_items)

## Architecture decisions

- Migrated from Next.js → Vite + React + wouter. All pages are client-rendered.
- SQLite (better-sqlite3) replaced with PostgreSQL + Drizzle ORM for Replit compatibility.
- API routes (formerly Next.js `app/api/`) moved to Express in `artifacts/api-server/`.
- OpenRouter AI key optional — generate endpoints return error if `OPENROUTER_API_KEY` unset.
- `"use client"` and `"use server"` directives left in files (ignored by Vite, harmless).

## Product

- Landing page: Hero, 6 agent cards, features, pricing (Starter $49, Growth $99, Scale $249), CTA
- Dashboard: KPI cards, agent status grid, recent activity feed, sites list
- Agent pages: per-agent task list, generated content, AI generation button
- Analyze endpoint: crawls a URL with cheerio, returns SEO score + issues, seeds agent tasks

## Gotchas

- The `OPENROUTER_API_KEY` secret must be set for AI generation to work. Without it, generate endpoints return a 500.
- `lib/db/src/schema/index.ts` exports all tables — add new tables there.
- Tailwind v4 uses `@theme` block (not `tailwind.config.js`) — do not create a `postcss.config.mjs`.
- `useParams()` is from `wouter`, not `next/navigation`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
