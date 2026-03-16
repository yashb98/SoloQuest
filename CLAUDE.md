# SoloQuest — Monorepo

## Architecture Overview
Pnpm monorepo with 3 workspaces + 1 Python backend:

```
soloquest/
├── apps/web/          # Next.js 14 web app (existing)
├── apps/mobile/       # React Native (Expo) mobile app
├── packages/shared/   # Shared TypeScript types + game math
└── agents/            # Python LangGraph multi-agent backend
```

## Workspaces

### apps/web/ — Next.js Web App
- **Stack:** Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS
- **Backend:** 33+ API routes (source of truth for all DB mutations)
- **Database:** SQLite (dev) / Turso (prod) via Prisma 7.4
- **AI:** Anthropic Claude SDK (primary) + Mistral SDK (fallback)
- See `apps/web/CLAUDE.md` for web-specific conventions

### apps/mobile/ — React Native Mobile App
- **Stack:** Expo SDK 52+ with Expo Router + NativeWind + Zustand
- **Native:** HealthKit/Google Fit, notification listener, screen time, background tasks
- **State:** Zustand stores (useHunterStore, useQuestStore, useTodoStore, useAgentStore)
- Talks to same Next.js API as web app

### packages/shared/ — Shared Package
- `types.ts` — HunterData, Quest, Todo, AgentRun interfaces
- `xp.ts` — XP engine, rank system, class buffs (shared between web + mobile)
- `categories.ts` — Category/stat/difficulty constants
- `api-client.ts` — Typed fetch wrapper for all API endpoints

### agents/ — Python Agent Backend
- **Stack:** FastAPI + LangGraph + Langfuse + Kimi Code API + Anthropic
- **13 AI agents** — autonomous tracking, planning, and optimization
- See `agents/` section below for full agent architecture

## Build & Run
```bash
# Web
pnpm dev                    # Next.js dev server
pnpm build                  # Production build
pnpm db:push                # Sync Prisma schema
pnpm db:seed                # Seed database

# Mobile
pnpm dev:mobile             # Expo dev server

# Agent Backend
pnpm dev:agents             # FastAPI server (uvicorn)
cd agents && python -m pytest  # Agent tests
```

## Multi-Agent System (13 Agents)

### Design Philosophy: Zero-Manual-Logging
The user never manually logs steps, expenses, screen time, or creates daily todos. Agents handle all tracking. The user's only job: do the work.

### Agent Architecture: Supervisor + Scheduler
- **Supervisor Agent** (Kimi) routes events to specialized agents
- **Event-driven:** Mobile pushes data → agent reacts immediately
- **Scheduled:** Cron triggers at 7am (plan), every 2hrs (check), 9pm (wrap), Sunday (strategy)

### All 13 Agents
| # | Agent | LLM | Trigger | What It Does |
|---|-------|-----|---------|-------------|
| 1 | Steps Agent | Kimi | Every 30min (HealthKit/Fit) | Auto-complete health quests from step count |
| 2 | Screen Time Agent | Kimi | Hourly (device stats) | Auto-complete focus quests, penalize excess social media |
| 3 | Expense Agent | Anthropic | On bank notification | Parse spending, auto-log, deduct gold, categorize |
| 4 | Todo Agent | Kimi | Morning/2hr/evening | Generate daily plan, reprioritize, carry over |
| 5 | Quest Agent | Anthropic | Daily/on roadmap update | Curate daily quests, adaptive difficulty, chain progression |
| 6 | Streak Guardian | Kimi | Hourly after 6pm | Protect streaks, warn at risk, auto-apply shields |
| 7 | Sleep Agent | Kimi | Morning/evening | Auto-complete sleep quests, recovery mode on bad sleep |
| 8 | Weekly Strategist | Anthropic | Sunday/Monday | Weekly reports, next-week planning, difficulty adjustment |
| 9 | Daily Focus Agent | Kimi+Anthropic | Morning (interactive) | "What's your focus?" → reshuffle quests/todos for the day |
| 10 | Notion Sync Agent | Kimi | On expense/daily/weekly | Log expenses to Notion, daily journal, weekly reports |
| 11 | Adaptive Learning | Anthropic | On cert/exam/weekly | Detect knowledge gaps, micro-learning todos, pacing |
| 12 | Calendar Agent | Kimi | Morning/on change | Read calendar, adjust quest load for busy days |
| 13 | Social Accountability | Anthropic | Daily/weekly | Progress cards, milestone celebrations, motivation |

### LLM Routing
- **Kimi Code API** (OpenAI-compatible): Fast/cheap tasks — routing, thresholds, formatting
- **Anthropic Claude**: Complex tasks — notification parsing, creative generation, analysis
- **Fallback chain:** Primary → secondary → hardcoded defaults

### Observability
- **Langfuse:** Every agent run traced with cost, latency, actions taken
- **AgentRun table:** All actions logged in DB with Langfuse trace ID
- **Agent Dashboard (mobile):** View actions, undo, toggle agents, set thresholds

## Environment Variables
```
# Web (.env in apps/web/)
ANTHROPIC_API_KEY=         # Claude API
MISTRAL_API_KEY=           # Mistral fallback
DATABASE_URL=file:./dev.db # SQLite dev
TURSO_DATABASE_URL=        # Turso prod
TURSO_AUTH_TOKEN=          # Turso auth
SOLOQUEST_API_TOKEN=       # Bearer token for mobile/agent access

# Agent Backend (.env in agents/)
KIMI_API_KEY=              # Kimi Code API
ANTHROPIC_API_KEY=         # Claude API
LANGFUSE_PUBLIC_KEY=       # Langfuse observability
LANGFUSE_SECRET_KEY=       # Langfuse secret
LANGFUSE_HOST=             # Langfuse host (default: cloud.langfuse.com)
SOLOQUEST_API_URL=         # Next.js API URL (http://localhost:3000)
SOLOQUEST_API_TOKEN=       # Same bearer token
NOTION_API_KEY=            # Notion integration (optional)
NOTION_DATABASE_ID=        # Notion expense DB (optional)
```

## Non-Negotiables
- NEVER commit `.env` or API keys
- Web app API routes are the SINGLE SOURCE OF TRUTH for all DB writes
- Agent backend calls web API for mutations, reads DB directly for context
- All agent actions must be undoable
- AI features must gracefully degrade (primary → fallback → defaults)
- All agent runs logged to AgentRun table + Langfuse
