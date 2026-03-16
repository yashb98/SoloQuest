---
name: soloquest-game
description: SoloQuest game mechanics — XP, leveling, ranks, stats, quests, penalties, streaks, class buffs. Use when working on game logic, balancing, or quest systems.
allowed-tools: Read, Grep, Glob
---

# SoloQuest Game Mechanics Reference

## XP & Leveling
- XP to next level: `100 * level * 1.15^(level/10)`
- Source: `src/lib/xp.ts` — `xpForLevel()`, `getRank()`, `getClassBuff()`

## Rank Thresholds
| Rank | Levels | Color |
|------|--------|-------|
| E-Rank | 1–9 | Gray |
| D-Rank | 10–18 | Green |
| C-Rank | 19–26 | Blue |
| B-Rank | 27–40 | Purple |
| A-Rank | 40–55 | Gold |
| S-Rank | 55-66 | Red |
| National | 66+ | Rainbow |

## Gate Exam System
- Gates at levels: 5, 10, 15, 20, 25, 30, 35, 40, 50
- Must pass exam to advance past gate level
- AI generates exam questions based on quest category focus
- Graded by AI with pass/fail threshold

## Quest System
- **Categories:** health, learning, jobs, finance, focus, food, mental, agentiq
- **Tiers:** daily (reset midnight UTC), weekly (reset Monday), custom (no reset)
- **Difficulties:** normal (1x), hard (1.5x XP), legendary (2x XP)
- **Completion:** Awards XP + gold + stat points based on category
- **Checklist:** JSON array `[{id, text, done}]` — all must be checked to complete

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

## Penalty System
- Quest failure/skip: costs `goldBase` amount
- Debt allowed: gold can go negative
- Penalties tracked in `Penalty` model with reason and amount

## Currency
- 1 GBP = 10 gold (configurable in spending tracker)
- Gold earned from quest completion
- Gold spent in reward shop or deducted by penalties/spending
