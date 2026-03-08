# SoloQuest Documentation

> Complete technical and feature documentation for SoloQuest - a gamified productivity and career development platform.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [Database Schema](#database-schema)
5. [Pages & Features](#pages--features)
6. [API Reference](#api-reference)
7. [Core Game Systems](#core-game-systems)
8. [AI Integration](#ai-integration)
9. [Components](#components)
10. [Seed Data](#seed-data)
11. [Configuration](#configuration)

---

## Architecture Overview

SoloQuest follows a standard Next.js App Router architecture:

```
src/
  app/
    (app)/           # All authenticated pages (19 pages)
      layout.tsx     # Shared layout with TopBar, BottomNav, HunterProvider
      dashboard/     # Main hub
      quests/        # Quest board
      penalties/     # Gold penalty history
      ...
    api/             # 33 API route handlers
  components/        # Reusable UI components
  contexts/          # React context providers (HunterContext)
  lib/               # Core logic (XP engine, AI, DB, quest details)
prisma/
  schema.prisma      # 20 database models
  seed.ts            # Seed data (56+ quests, 10 dungeons, 40 rewards, 30 achievements)
```

**Data flow:** Pages fetch from API routes, which read/write via Prisma ORM to a LibSQL/SQLite database. AI features call Anthropic Claude (primary) with Mistral (fallback).

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 14.2.35 |
| Language | TypeScript | 5.x |
| UI | React | 18.x |
| Styling | Tailwind CSS | 3.4.1 |
| Animations | Framer Motion | 11.18.2 |
| Icons | Lucide React | 0.575.0 |
| Charts | Recharts | 3.7.0 |
| Database | Prisma ORM + LibSQL | 7.4.2 |
| AI (Primary) | Anthropic Claude SDK | 0.78.0 |
| AI (Fallback) | Mistral AI SDK | 1.14.1 |
| Audio | Howler.js | 2.2.4 |
| PDF Parsing | pdf-parse | 2.4.5 |
| PWA | next-pwa | 5.6.0 |

**Database:**
- Development: Local SQLite via `dev.db`
- Production: Turso edge database (LibSQL)

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm

### Installation

```bash
# Clone and install
git clone <repo-url>
cd SoloQuest
npm install

# Set up environment
cp .env.example .env
# Add your API keys to .env:
#   ANTHROPIC_API_KEY=sk-ant-...
#   MISTRAL_API_KEY=...

# Initialize database
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema changes to database |
| `npm run db:seed` | Seed database with initial data |
| `npm run db:studio` | Open Prisma Studio (database GUI) |

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Anthropic Claude API key for AI features |
| `MISTRAL_API_KEY` | Recommended | Mistral API key (free tier fallback) |
| `DATABASE_URL` | Yes | Database connection string (`file:./dev.db` for local) |
| `TURSO_DATABASE_URL` | Production | Turso database URL |
| `TURSO_AUTH_TOKEN` | Production | Turso auth token |

---

## Database Schema

### 20 Models Overview

#### Hunter (Player Profile)
The core player model with all progression data.

| Field | Type | Description |
|-------|------|-------------|
| hunterName | String | Player display name |
| class | String | warrior, scholar, rogue, paladin, none |
| rank | String | E through National (9 tiers) |
| level | Int | Current level (1+) |
| xp / xpToNext | Int | Current XP and threshold for next level |
| gold | Int | Currency earned from quests |
| streak / bestStreak | Int | Current and all-time best streak |
| streakShields | Int | Shields to protect streak (max 3) |
| vitality, intel, hustle, wealth, focus, agentIQ | Int | 6 core stats |
| statPoints | Int | Unallocated stat points |
| wakeUpTime | String | Preferred wake-up time |
| activeRoadmapId | Int? | Currently active job roadmap |

#### Quest
| Field | Type | Description |
|-------|------|-------------|
| title | String | Quest name |
| category | String | health, learning, jobs, finance, focus, agentiq, food, mental |
| difficulty | String | normal, hard, legendary |
| tier | String | daily, weekly, custom |
| xpBase / goldBase | Int | Base rewards (modified by multipliers) |
| statTarget / statGain | String/Int | Which stat to increase and by how much |
| isDaily | Boolean | Resets daily |
| isCompleted | Boolean | Current completion state |
| unlocksAtLevel | Int | Level required to access |

#### Dungeon (7-Day Challenges)
| Field | Type | Description |
|-------|------|-------------|
| name / description | String | Dungeon identity |
| objectives | String | JSON array of daily objectives |
| bonusXP / bonusGold | Int | Rewards on completion |
| statReward / statRewardAmount | String/Int | Stat bonus |
| deadline | DateTime? | 7-day countdown end |
| isActive / isCompleted / isFailed | Boolean | Status tracking |

#### Penalty (Gold Penalties)
| Field | Type | Description |
|-------|------|-------------|
| questId | Int? | Links to quest (null for spending penalties) |
| questTitle | String | Quest name for display |
| goldLost | Int | Amount of gold deducted |
| reason | String | "quest_failed" or "spending" |
| description | String | Human-readable explanation |
| createdAt | DateTime | When the penalty was applied |

#### Additional Models
- **Completion** - Historical quest completion records
- **Reward** - Shop items with gold costs and real-world equivalents
- **Exam** - Gate-level exam records with AI-generated questions
- **Achievement** - 30+ unlockable achievements with rarity tiers
- **Goal** - Sprint, monthly, and life goals
- **Application** - Job application pipeline tracker
- **CertRoadmap** - Certification study plans with weekly topics
- **TodoItem** - Daily planner items with priority and recurrence
- **QuestChain / QuestChainStep** - Multi-step linked quest sequences
- **TimeSession** - Pomodoro/focus timer records
- **JobRoadmap** - AI-generated career paths with milestones
- **DailySnapshot** - Analytics data (XP, quests, focus minutes per day)
- **Briefing** - Cached daily AI briefings
- **SavingsLog / SpendLog** - Financial tracking
- **MentorLog** - AI mentor chat history

---

## Pages & Features

### 1. Dashboard (`/dashboard`)
The main hub displaying an overview of all active systems.

**Widgets:**
- Quick stats bar (Rank, Level, XP progress, Gold, Streak)
- Weekly XP chart (Recharts bar chart, last 7 days)
- Today's planner progress (completed/total todos)
- Quest completion progress
- Active dungeon countdown timer
- Weekly totals (XP earned, gold earned, quests done)
- Upcoming goals list
- Achievement progress highlights

---

### 2. Quest Board (`/quests`)
The core quest system with 56+ quests across 8 categories (32 daily, 18 weekly, 7 custom).

**Features:**
- Search bar to filter quests by title
- Tier filters (Daily, Weekly, Custom)
- Category filters (Health, Learning, Jobs, Finance, Focus, AI/Tech, Food, Mental)
- Quest cards showing XP, Gold, and Stat rewards
- One-click completion with animated feedback
- Undo functionality (reverses XP/gold/stats)
- Expandable detail panels (steps, tips, tools, estimated time)
- Add custom quest modal with AI-generated specs
- Quest completion notification popup (shows rewards earned)
- Quest deletion (soft delete for completed one-time quests)
- Daily quests reset each morning via penalty-aware reset engine
- Weekly quests reset every Monday with penalty check

---

### 3. Dungeons (`/dungeons`)
7-day challenge quests with daily objectives and bonus rewards.

**10 Dungeons:**
| Dungeon | Focus | Bonus XP | Stat |
|---------|-------|----------|------|
| The Iron Body | Fitness + cooking | 1000 | Vitality |
| The Algorithm Gauntlet | DSA + ML problems | 1200 | Intel |
| The Application Blitz | Job search sprint | 1100 | Hustle |
| The Agent Architect | AI agent building | 1300 | AgentIQ |
| The Wealth Fortress | Financial discipline | 900 | Wealth |
| The Cert Sprint | Intensive study | 1100 | Intel |
| The Focus Forge | Deep work training | 1000 | Focus |
| The Portfolio Week | Showcase projects | 1200 | Hustle |
| The MLOps Forge | ML infrastructure | 1100 | AgentIQ |
| The Full Stack Trial | Full-stack dev | 1300 | Intel |

**Features:**
- Activate dungeon to start 7-day timer
- Daily breakdown of tasks
- Progress tracking
- Success/fail conditions
- Bonus rewards on completion

---

### 4. Planner (`/planner`)
Daily todo list with priorities, categories, and AI descriptions.

**Features:**
- Today's todos organized by priority (Critical, High, Normal)
- Category tags (General, Health, Learning, Jobs, Finance, Focus)
- Add todos with AI-generated actionable descriptions
- Drag-and-drop reordering
- Recurring todo setup (daily, weekly, weekdays, custom)
- Time-based scheduling
- Roadmap/Cert-linked todos (created by roadmap engine)

---

### 5. Timer (`/timer`)
Pomodoro/focus timer for deep work sessions.

**Features:**
- 4x25 minute Pomodoro sessions
- Custom timer durations
- Link timer to specific quest or todo
- Session history with completion tracking
- Audio notifications (via Howler.js)

---

### 6. Gate Exams (`/exam`)
AI-generated exams that lock level progression at gate levels.

**Gate Levels:** 5, 10, 15, 20, 25, 30, 35, 40, 50

**Features:**
- AI-generated questions (MCQ, short answer, code, case study)
- Custom rubrics per question
- Timed exam mode
- AI-powered grading with detailed feedback
- Pass/fail tracking with attempt history
- XP rewards on pass
- Must pass to unlock next level tier

---

### 7. Quest Chains (`/chains`)
Multi-step linked quest sequences for structured learning.

**Features:**
- AI-generated quest chains from goals
- Step-by-step progression tracking
- Category and stat targeting per step
- Completion bonuses (XP + gold)
- Roadmap integration

---

### 8. Goals (`/goals`)
Personal goal planning with three timeframes.

**Goal Types:**
- Sprint goals (1-2 weeks)
- Monthly goals
- Life goals (long-term)

**Features:**
- Target date setting
- XP/gold rewards on completion
- Roadmap association
- Progress tracking

---

### 9. Achievements (`/achievements`)
30+ unlockable achievements across 6 categories.

**Categories & Examples:**
- Health: First Steps, Iron Body, Marathon Runner
- Career: First Application, Application Machine, Offer Hunter
- Learning: First Solve, Algorithm Adept, Scholar Supreme
- Discipline: Day One, Week Warrior, The Sovereign
- Financial: Penny Pincher, Budget Master, Wealth Sovereign
- AI/Tech: First Agent, Fine-Tuner, Agent Sovereign

**Rarities:** Common, Rare, Epic, Legendary, Mythic

**Rewards:** XP bonuses, gold bonuses, exclusive titles

---

### 10. Profile (`/profile`)
Hunter identity and customization.

**Features:**
- Name and class selection
- 4 classes: Warrior (+10% Hustle XP), Scholar (+10% Intel XP), Rogue (+10% Wealth XP), Paladin (+10% Vitality XP)
- Stat point allocation (earned per level)
- Wake-up time preference
- Prestige tracking

---

### 11. Hunter Analytics (`/stats`)
Visual stat breakdown and progression data.

**Features:**
- 300x300 radar chart showing all 6 stats
- Stat detail bars with visual progress
- Strongest/weakest stat analysis
- Streak history
- XP progress percentage

---

### 12. Advanced Analytics (`/analytics`)
Detailed historical analytics and trends.

**Features:**
- GitHub-style heatmap (365-day completion history)
- XP trend charts
- Category completion breakdowns
- Weekly summary reports
- Focus minutes tracking

---

### 13. Reward Shop (`/shop`)
Spend earned gold on real-world rewards.

**Reward Tiers:**
| Tier | Gold Range | Examples |
|------|-----------|----------|
| E | 50-300 | Snacks, coffee, small treats |
| D | 300-800 | Accessories, online courses |
| C | 800-1500 | Gadgets, dining experiences |
| B | 1500-3000 | Electronics, premium subscriptions |
| A | 3000-6000 | High-value tech, fitness equipment |
| S | 6000+ | Luxury items, travel |

**Features:**
- Category filtering (treat, personal, gadget, learning, entertainment, fitness, travel)
- Real-world cost equivalents displayed
- Gold-to-currency ratio tracking
- Redemption history

---

### 14. Penalties (`/penalties`)
Gold penalty tracking and debt management.

**Features:**
- Current gold display (red when in debt)
- Debt warning banner with amount owed
- Summary cards: Today / This Week / This Month penalty totals
- Monthly breakdown: Failed quests vs Spending split
- Today's penalty list with icons (swords for quest fails, credit card for spending)
- Full penalty history (last 50 entries with timestamps)

---

### 15. Savings Tracker (`/savings`)
Financial discipline and expense tracking.

**Features:**
- Expense logging by category
- Savings pot management
- Budget vs actual tracking
- Spending trends
- Financial goal integration

---

### 15. Job Applications (`/applications`)
Full job application pipeline management.

**Status Pipeline:** Discovered -> Applied -> Interview -> Offer -> Rejected

**Features:**
- Company, role, and salary tracking
- Application links and contact persons
- Resume version management
- Follow-up scheduling
- Notes per application

---

### 16. Certifications (`/certs`)
AI-generated certification study plans.

**Features:**
- Create cert study plans with target exam dates
- AI generates week-by-week study schedules
- Topic-level resources (YouTube queries, blog/doc links)
- Progress tracking per week
- Pause/Resume certification (preserves study plan)
- Gold bonuses on pass
- Integration with planner (creates todos)

---

### 17. Job Roadmap (`/roadmap`)
AI-powered career path generation.

**Two Modes:**
1. **Build from Scratch** - AI generates a complete roadmap
2. **Upload Roadmap** - Upload PDF/image, AI extracts topics

**Build from Scratch:**
- Input: Target role, experience level, current skills, timeline (3m/6m/1y)
- AI generates: 8-12 quests, 2-3 dungeons, 2-4 certs, 4-6 goals, 5-8 habits, 1-2 quest chains, 4-6 milestones
- All content linked to roadmap for unified tracking

**Upload Roadmap:**
- Supports: PNG, JPG, WebP images and PDF files
- Vision AI extraction (Anthropic Claude + Mistral fallback)
- PDF processing: Native document blocks, Mistral OCR, text extraction fallback
- Topic extraction with priority (core/recommended/optional)
- Section grouping with collapsible review
- Timeline estimation with manual override
- Creates todos spread across weeks

---

### 18. AI Mentor (`/mentor`)
Context-aware AI coaching chatbot.

**Features:**
- Knows hunter stats, quests, class, rank, and progress
- Game-themed motivational coaching
- Actionable career and productivity advice
- Feature-specific guidance (exams, job search, learning paths)
- Chat history logging

---

## API Reference

### Hunter
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hunter` | Fetch hunter profile |
| PUT | `/api/hunter/class` | Select class |
| POST | `/api/hunter/stats` | Allocate stat points |

### Quests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quests` | Fetch quests (read-only, no side effects) |
| POST | `/api/quests` | Create custom quest |
| DELETE | `/api/quests?id=X` | Soft-delete a completed quest |
| POST | `/api/quests/complete` | Complete or undo quest |
| POST | `/api/quests/reset` | Daily reset with penalty engine (optimistic lock) |

### Penalties
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/penalties` | Get penalty history + today/weekly/monthly summaries |

### Dungeons
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dungeons` | Fetch all dungeons |
| POST | `/api/dungeons` | Activate/complete dungeon |

### Exams
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/exam/generate` | AI-generate exam for gate level |
| POST | `/api/exam/grade` | AI-grade exam answer |

### Achievements
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/achievements` | Fetch all achievements |
| POST | `/api/achievements/check` | Check for newly unlocked |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Aggregated widget data |

### Goals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/goals` | Fetch goals |
| POST | `/api/goals` | Create goal |

### Quest Chains
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quest-chains` | Fetch chains |
| POST | `/api/quest-chains` | Create/update chain |

### Todos
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/todos` | Fetch todos for date |
| POST | `/api/todos` | Create todo |
| POST | `/api/todos/recurring` | Set up recurring todos |

### Certifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/certs` | Fetch/create/pause/resume certs |

### Roadmaps
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/roadmap` | Fetch active roadmap |
| POST | `/api/roadmap/generate` | AI-generate career roadmap |
| POST | `/api/roadmap/upload` | Upload and extract roadmap from file |
| GET | `/api/roadmap/progress` | Fetch milestone progress |

### AI Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ai/briefing` | Daily AI briefing |
| POST | `/api/ai/generate-chain` | Generate quest chain |
| POST | `/api/ai/generate-task-details` | Generate task steps/tips |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/mentor` | AI mentor chat |
| GET/POST | `/api/timer` | Timer sessions |
| GET/POST | `/api/savings` | Savings/spending logs |
| GET/POST | `/api/rewards` | Shop items and redemption |
| GET/POST | `/api/applications` | Job applications |
| GET | `/api/analytics` | DailySnapshot data |

---

## Core Game Systems

### XP & Leveling Engine (`lib/xp.ts`)

**XP Formula:** `100 * N * 1.15^(N/10)` where N = current level

**Rank Progression:**
| Rank | Levels | Stat Cap |
|------|--------|----------|
| E-Rank | 1-9 | 15 |
| D-Rank | 10-19 | 30 |
| C-Rank | 20-29 | 50 |
| B-Rank | 30-39 | 75 |
| A-Rank | 40-49 | 100 |
| S-Rank | 50-59 | 150 |
| National | 60+ | 200 |

**Gate Levels:** 5, 10, 15, 20, 25, 30, 35, 40, 50
- Hard caps on progression
- Must pass AI-generated exam to unlock next tier
- Prevents level skipping

**Effective XP Calculation:**
```
effectiveXP = baseXP * streakMultiplier * classBonus
```

### Streak System

**Multiplier Curve:**
| Streak | Multiplier |
|--------|-----------|
| 0 days | 1.0x |
| 7 days | 1.07x |
| 30 days | 1.3x |
| 100 days | 1.6x |
| 365+ days | 2.0x |

**Streak Protections:**
- Streak Shields (max 3) - earned every 21-day milestone
- Streak Freezes (max 2/month)
- 10% gold penalty on streak break (capped at 500G)

**Streak Titles:**
| Milestone | Title |
|-----------|-------|
| 7 days | Iron Will |
| 30 days | Consistent |
| 100 days | Unbreakable |
| 365 days | Monarch |
| 500 days | Sovereign |

### Class System

| Class | Stat Boost | Bonus |
|-------|-----------|-------|
| Warrior | Hustle | +10% XP on matching quests |
| Scholar | Intel | +10% XP on matching quests |
| Rogue | Wealth | +10% XP on matching quests |
| Paladin | Vitality | +10% XP on matching quests |

### Daily Reset Logic
- Triggers automatically on app load via HunterContext (`POST /api/quests/reset`)
- `GET /api/quests` is read-only — no reset side effects
- Uses optimistic locking to prevent duplicate penalty creation from race conditions
- Fresh start protection: no penalties when `lastStreakDate` is null (first day or after reset)
- Idempotent (safe to call multiple times per day — second call returns "Already reset today")

**Reset flow:**
1. Fresh start check (skip penalties if first day)
2. Optimistic lock (claim reset atomically, bail if another request won)
3. Streak engine (increment/break/shield)
4. Streak milestone bonuses
5. Penalize incomplete daily quests (create Penalty records, deduct gold)
6. If Monday: penalize incomplete weekly quests, reset weekly quests
7. Reset all daily quests to incomplete
8. Update hunter gold: `+streakBonus - streakPenalty - dailyPenalties - weeklyPenalties`

---

## AI Integration

### Provider Chain
All AI calls follow: **Anthropic Claude (primary) -> Mistral (fallback) -> graceful empty**

### AI-Powered Features

| Feature | Function | Description |
|---------|----------|-------------|
| Morning Briefing | `generateBriefing()` | Daily dramatic briefing from "The System" |
| Exam Generation | `generateExam()` | Creates gate-level questions with rubrics |
| Exam Grading | `gradeAnswer()` | Grades answers with detailed feedback |
| Mentor Chat | `mentorChat()` | Context-aware coaching conversations |
| Quest Chains | `generateQuestChain()` | Creates linked quest sequences from goals |
| Task Details | `generateTaskDetails()` | Generates steps/tips (plain text, no markdown) |
| Weekly Report | `generateWeeklyReport()` | Analytics summary and directive |
| Cert Study Plans | `generateCertStudyPlan()` | Week-by-week study schedules |
| Job Roadmaps | `generateJobRoadmap()` | Complete career paths with quests/dungeons/certs |
| Image Extraction | `extractRoadmapFromImage()` | Vision API for roadmap images |
| PDF Extraction | `extractRoadmapFromPdf()` | Native PDF document processing |
| PDF OCR | Mistral OCR fallback | Handles graphical PDFs (like roadmap.sh) |
| Text Extraction | `extractRoadmapFromText()` | PDF text-based topic extraction |

### Description Formatting
All AI-generated descriptions use **plain text only** (no markdown). Structure uses:
- Emojis for visual hierarchy (target, clipboard, lightbulb, wrench)
- Numbered steps with `)` format (not `.`)
- Plain text URLs (not markdown links)
- Line breaks for separation

---

## Components

| Component | File | Purpose |
|-----------|------|---------|
| QuestBoard | `QuestBoard.tsx` | Quest list with search, filters, add modal |
| QuestCard | `QuestCard.tsx` | Individual quest with completion, details panel |
| TopBar | `TopBar.tsx` | Header with dark mode, hunter info |
| BottomNav | `BottomNav.tsx` | Mobile navigation |
| XPBar | `XPBar.tsx` | Visual XP progress bar |
| LevelUpModal | `LevelUpModal.tsx` | Celebration on level-up |
| MorningBriefing | `MorningBriefing.tsx` | Daily AI briefing display |
| ToastContainer | `ToastContainer.tsx` | Notification system |

### HunterContext (`contexts/HunterContext.tsx`)
Global state provider wrapping all pages.

**Provides:**
- `hunter` - Current hunter data
- `refreshHunter()` - Refetch from API
- `updateHunterOptimistic()` - Instant UI updates
- `addToast()` / `removeToast()` - 6 toast types (xp, gold, level, achievement, info, error)
- `darkMode` / `toggleDarkMode()` - Theme toggle
- `checkAchievements()` - Trigger achievement checks
- Auto daily reset on load (`POST /api/quests/reset` — penalty-aware, with post-reset refresh)

---

## Seed Data

### Quests (56+ total)

**Daily Quests (32)** across 6 stat categories:
- Health/Vitality (8): Workout, walk, hydration, sleep, cooking, nutrition, stretching, meditation
- Jobs/Hustle (7): Apply to 7 jobs, resume, cover letters, networking, STAR interviews, follow-ups
- Learning/Intel (5): LeetCode, SQL challenge, tutorials, technical notes, ML/AI deep-dive
- Finance/Wealth (6): Expense logging, spending discipline, savings transfer, cooking instead of ordering, no coffee shop, side income
- Focus/Discipline (6): No social media until 12 PM, deep work block, morning routine, evening review, screen time limit, inbox zero, plan tomorrow

**Weekly Quests (18):** 50 job applications/week, 4 workouts/week, 5 LeetCode/week, budget week, 7 deep work sessions, AI mini-project, 5K run, study cert material (5 hrs/week), research companies, read tech book, practice system design, build AI agent, prompt engineering doc, LangChain practice, read AI paper, MLOps task

**Custom Quests (7):** Update LinkedIn profile, cancel subscription, fine-tune model, deploy to production, Kaggle submission, mock interview, portfolio feature

### Dungeons (10)
Each with 7-day objectives, 700-1300 bonus XP, specific stat rewards.

### Rewards (40+)
Across 6+ tiers (E through S), categories: treat, personal, gadget, learning, entertainment, fitness, travel.

### Achievements (30)
5 per category (Health, Career, Learning, Discipline, Financial, AI/Tech) with Common through Mythic rarity.

---

## Configuration

### Tailwind CSS
- Dark mode via CSS class strategy
- Custom CSS variables for theming (`--sq-bg`, `--sq-accent`, `--sq-gold`, etc.)
- Custom colors: sq-accent (warm brown), sq-gold, sq-green, sq-blue, sq-purple

### Next.js Config
- PWA support via next-pwa
- App Router architecture
- Server-side API routes

### Prisma
- LibSQL adapter for Turso (production) and local SQLite (development)
- 19 models with relations
- Auto-generate on postinstall

---

## Dark Mode

Full dark theme support with:
- Tailwind `dark:` variant classes
- CSS variable switching
- localStorage persistence
- Toggle in TopBar component
- Automatic restoration on page load

---

## Toast Notification System

6 notification types with auto-dismiss:

| Type | Usage | Duration |
|------|-------|----------|
| xp | Quest/action completion | 2.5s |
| gold | Gold earned | 2.5s |
| level | Level up | 5s |
| achievement | Achievement unlocked | 5s |
| info | General information | 3.5s |
| error | Error messages | 3.5s |

---

## Quest Completion Flow

1. User clicks complete button on quest card
2. API call to `/api/quests/complete` with questId
3. Server calculates effective XP/gold (base * streak multiplier * class bonus)
4. Updates Hunter stats (XP, gold, stat points, level, rank)
5. Creates Completion record
6. Updates DailySnapshot for analytics
7. Returns reward data to client
8. Client shows completion notification popup with animated rewards
9. Optimistic UI update (instant XP bar change)
10. Background achievement check
11. Background hunter data refresh
