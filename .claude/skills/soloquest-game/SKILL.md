---
name: soloquest-game
description: SoloQuest game mechanics + multi-agent AI system. XP, leveling, ranks, stats, quests, penalties, streaks, class buffs, and 13 AI agents (steps, screen time, expenses, todos, quests, streaks, sleep, weekly planning, daily focus, Notion sync, learning, calendar, social). Use when working on game logic, balancing, quest systems, or agent orchestration.
allowed-tools: Read, Grep, Glob
---

# SoloQuest Game Mechanics Reference

## Project Structure (Monorepo)
- `apps/web/` — Next.js web app (API source of truth)
- `apps/mobile/` — React Native (Expo) mobile app
- `packages/shared/` — Shared types + game math
- `agents/` — Python LangGraph multi-agent backend

## XP & Leveling
- XP to next level: `100 * level * 1.15^(level/10)`
- Source: `apps/web/src/lib/xp.ts` — `xpForLevel()`, `rankFromLevel()`, `rankLevel()`

## Rank Thresholds (rank-relative levels)
| Rank | Global Levels | Display | Color |
|------|--------------|---------|-------|
| E-Rank | 1–9 | E-1 to E-9 | Gray |
| D-Rank | 10–18 | D-1 to D-9 | Green |
| C-Rank | 19–26 | C-1 to C-8 | Blue |
| B-Rank | 27–39 | B-1 to B-13 | Purple |
| A-Rank | 40–54 | A-1 to A-15 | Gold |
| S-Rank | 55–65 | S-1 to S-11 | Red |
| National | 66+ | National-1+ | Rainbow |

## Gate Exam System
- Gates at global levels: 5, 10, 15, 20, 25, 30, 35, 40, 50
- Must pass exam to advance past gate level
- AI generates exam questions based on quest category focus
- Graded by AI with pass/fail threshold

## Quest System
- **Categories:** health, learning, jobs, finance, focus, food, mental, agentiq
- **Tiers:** daily (reset midnight), weekly (reset Monday), custom (no reset)
- **Difficulties:** normal (1x), hard (1.5x XP), legendary (2x XP)
- **Completion:** Awards XP + gold + stat points based on category
- **Checklist:** JSON array `[{id, text, done}]` — all must be checked to complete
- **Auto-completion:** AI agents can complete quests when real-world signals match (e.g., step count meets health quest target)

## Stat → Category Mapping
| Stat | Category | Class |
|------|----------|-------|
| Vitality | health | Warrior |
| Intelligence | learning | Scholar |
| Hustle | jobs | Rogue |
| Wealth | finance | Paladin |
| Focus | focus | — |
| AgentIQ | agentiq | — |

## Class Buffs
- Each class gets 10% XP multiplier on their matching category
- Warrior → health, Scholar → learning, Rogue → jobs, Paladin → finance

## Streak System
- Daily login streak tracked
- Multiplier: linear from 1.0x (day 0) to 2.0x (day 365)
- Streak break penalty: lose 10% of current gold
- **Streak Guardian Agent** protects streaks: warns at 8pm, suggests easiest quest, auto-applies shields

## Penalty System
- Quest failure/skip: costs `goldBase` amount
- Debt allowed: gold can go negative
- Penalties tracked in `Penalty` model with reason and amount
- **Screen Time Agent** can auto-create penalties for excessive social media

## Currency
- 1 GBP = 10 gold (configurable in spending tracker)
- Gold earned from quest completion
- Gold spent in reward shop or deducted by penalties/spending
- **Expense Agent** auto-deducts gold from bank notification parsing

---

# Multi-Agent AI System (13 Agents)

## Architecture
- **Framework:** LangGraph (Python) with Supervisor pattern
- **LLMs:** Kimi Code API (fast/cheap) + Anthropic Claude (complex tasks)
- **Observability:** Langfuse (traces, costs, latency)
- **Execution:** Event-driven (mobile pushes data) + Scheduled (cron triggers)

## Agent Summary
| Agent | LLM | Trigger | Auto-Actions |
|-------|-----|---------|-------------|
| Steps | Kimi | 30min health sync | Complete health quests from step count, nudge if behind |
| Screen Time | Kimi | Hourly device stats | Complete focus quests, penalize social media excess |
| Expense | Anthropic | Bank notifications | Parse spending, log expense, deduct gold, categorize |
| Todo | Kimi | Morning/2hr/evening | Generate daily plan, reprioritize, carry over |
| Quest | Anthropic | Daily/roadmap update | Curate quests, adaptive difficulty, chain progression |
| Streak Guardian | Kimi | Hourly after 6pm | Warn at risk, suggest easiest quest, auto-apply shields |
| Sleep | Kimi | Morning/evening | Complete sleep quests, recovery mode on bad sleep |
| Weekly Strategist | Anthropic | Sunday/Monday | Weekly report, next-week plan, difficulty adjustment |
| Daily Focus | Kimi+Anthropic | Morning interactive | "What's your focus?" → reshuffle day |
| Notion Sync | Kimi | On expense/daily/weekly | Log to Notion database, daily journal, weekly report |
| Adaptive Learning | Anthropic | On cert/exam/weekly | Knowledge gaps, micro-learning, cert pacing |
| Calendar | Kimi | Morning/on change | Read calendar, adjust load for busy days |
| Social | Anthropic | Daily/weekly | Progress cards, milestones, motivation |

## Agent Database Models
- `AgentRun` — Logs every agent execution (name, event, input/output, status, Langfuse traceId)
- `DeviceData` — Raw device data from mobile (steps, screen time, notifications)
- `AgentConfig` — Per-agent enabled/disabled flag + JSON config (thresholds, schedules)

## Agent API (FastAPI at agents/)
```
POST /agents/health-sync         # Steps + sleep data
POST /agents/screen-time-update  # Screen time + app breakdown
POST /agents/expense-notification # Bank notification text
POST /agents/daily-focus         # User's focus choice (or auto-pick)
POST /agents/morning-plan        # Generate today's plan
POST /agents/check-progress      # Mid-day review
POST /agents/evening-wrap        # End-of-day summary
POST /agents/weekly-strategy     # Sunday planning
GET  /agents/status              # Agent health
GET  /agents/actions             # Recent actions with undo
```

## Key Principle
Agents call **Next.js API routes** for all DB writes (quest complete, expense log, todo create). They read DB directly via libsql for efficient context gathering. This keeps the web app as the single source of truth.
