# SoloQuest — Gamified Productivity Platform

## Architecture
- **Frontend:** Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes (33 endpoints)
- **Database:** SQLite (dev via `dev.db`) / Turso (prod via libsql)
- **ORM:** Prisma 7.4 with LibSQL adapter
- **AI:** Anthropic Claude SDK (primary) + Mistral SDK (fallback)
- **State:** React Context (`HunterContext`) — no Redux/Zustand
- **Styling:** Tailwind + CSS variables (`--sq-*` prefix) + Framer Motion
- **PWA:** next-pwa for installable mobile experience

## Build & Test
- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- DB push: `npm run db:push`
- DB seed: `npm run db:seed`
- DB studio: `npm run db:studio`
- Generate Prisma client: `npx prisma generate`

## Code Conventions
- All pages use `"use client"` directive for interactivity
- API routes export `GET`, `POST`, `PUT`, `DELETE` functions
- All API routes use `export const dynamic = "force-dynamic"`
- Import alias: `@/` maps to `src/`
- Components: PascalCase files in `src/components/`
- API routes: kebab-case in `src/app/api/[resource]/[action]/route.ts`
- Types: defined inline in component files, Prisma types for DB models
- Styling: Tailwind utilities + `sq-*` custom color theme (sq-blue, sq-gold, sq-green, sq-purple, sq-warm)
- Dark mode: `dark` class on `<html>`, CSS vars swap in `globals.css`

## Game Systems (Critical Domain Knowledge)
- **Categories:** health, learning, jobs, finance, focus, food, mental, agentiq
- **Quest Tiers:** daily (resets midnight), weekly (resets Monday), custom
- **Difficulties:** normal, hard, legendary
- **XP Formula:** `100 × n × 1.15^(n/10)` for level n
- **Ranks (with rank-relative levels):**
  - E-Rank: global 1–9 (displayed as E-1 through E-9)
  - D-Rank: global 10–18 (displayed as D-1 through D-9)
  - C-Rank: global 19–26 (displayed as C-1 through C-8)
  - B-Rank: global 27–39 (displayed as B-1 through B-13)
  - A-Rank: global 40–54 (displayed as A-1 through A-15)
  - S-Rank: global 55–65 (displayed as S-1 through S-11)
  - National: global 66+ (displayed as National-1+)
- **Level Display:** DB stores global level; UI shows rank-relative level via `rankLevel()` in `xp.ts`. Level resets to 1 at each rank boundary.
- **Gate Exams:** Required at global levels 5, 10, 15, 20, 25, 30, 35, 40, 50
- **Stats:** Vitality, Intelligence, Hustle, Wealth, Focus, AgentIQ
- **Classes:** Warrior, Scholar, Rogue, Paladin (10% XP buff on matching category)
- **Currency:** Gold (1 GBP = 10 gold, spending deducts gold)
- **Penalties:** Quest failure = goldBase cost; streak break = 10% gold
- **Streak:** Linear multiplier 1.0x → 2.0x over 0–365 days

## Key Files
- `src/lib/xp.ts` — XP engine, rank system, class buffs, streak multiplier
- `src/lib/ai.ts` — AI integration (Anthropic primary, Mistral fallback)
- `src/lib/db.ts` — Prisma client init (dev SQLite / prod Turso)
- `src/lib/quest-details.ts` — 56+ quest metadata, tips, checklist templates
- `src/contexts/HunterContext.tsx` — Global state (hunter data, toasts, dark mode)
- `prisma/schema.prisma` — 20 database models
- `prisma/seed.ts` — Seed data (quests, dungeons, achievements, rewards)

## Non-Negotiables
- NEVER commit `.env` or API keys — use environment variables
- AI features must gracefully degrade if both APIs fail (return sensible defaults)
- All database queries go through Prisma — no raw SQL
- Toast notifications for all user-facing actions (success/error)
- Mobile-first responsive design (bottom nav on mobile, sidebar on desktop)
- Optimistic UI updates where possible — update state before API confirmation
