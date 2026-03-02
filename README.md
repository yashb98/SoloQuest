# SoloQuest

A gamified productivity and career development platform built with Next.js. Turn your daily habits, job search, learning goals, and financial discipline into an RPG-style progression system with XP, levels, stats, and rewards.

---

## Features

### Core Game Systems

- **XP & Leveling** - Exponential XP curve with 9 rank tiers (E-Rank through National). Gate levels at 5, 10, 15, 20, 25, 30, 35, 40, 50 lock progression until AI-generated exams are passed.
- **6 Core Stats** - Vitality, Intelligence, Hustle, Wealth, Focus, AgentIQ. Each quest targets a specific stat. Allocate stat points earned per level.
- **Streak System** - Daily streak tracking with multipliers (1.0x to 2.0x). Streak shields, freezes, milestone titles (Iron Will, Consistent, Unbreakable, Monarch, Sovereign), and gold penalties for breaks.
- **Class System** - 4 classes (Warrior, Scholar, Rogue, Paladin) with +10% XP bonus on matching stat quests.
- **Gold Currency** - Earned from quests, spent in the reward shop on real-world treats and items.

### Quest Board

- **48+ Quests** across 8 categories (Health, Learning, Jobs, Finance, Focus, AI/Tech, Food, Mental)
- **Daily/Weekly/Custom tiers** with difficulty levels (Normal, Hard, Legendary)
- **Search and filter** quests by name, category, and tier
- **One-click completion** with animated reward notification popup
- **Expandable details** with step-by-step guides, pro tips, and tool recommendations
- **Daily auto-reset** - daily quests refresh automatically each day
- **Custom quest creation** with AI-generated specifications

### Dungeons (7-Day Challenges)

10 themed dungeons with daily objectives and bonus rewards:

| Dungeon | Focus |
|---------|-------|
| The Iron Body | Fitness + cooking |
| The Algorithm Gauntlet | DSA + ML problems |
| The Application Blitz | Job search sprint |
| The Agent Architect | AI agent building |
| The Wealth Fortress | Financial discipline |
| The Cert Sprint | Intensive study |
| The Focus Forge | Deep work training |
| The Portfolio Week | Showcase projects |
| The MLOps Forge | ML infrastructure |
| The Full Stack Trial | Full-stack development |

### AI-Powered Features

All AI uses Anthropic Claude as primary with Mistral free tier as fallback:

- **Morning Briefing** - Daily dramatic briefing from "The System"
- **Gate Exams** - AI-generated questions with rubrics and AI grading
- **AI Mentor** - Context-aware coaching chatbot that knows your stats, quests, and progress
- **Task Specs** - AI-generated actionable breakdowns for quests and todos
- **Quest Chains** - AI-creates multi-step linked quest sequences from goals
- **Weekly Reports** - AI-powered analytics summaries
- **Career Roadmaps** - AI generates complete career paths with quests, dungeons, certs, goals, habits, and milestones
- **Cert Study Plans** - AI creates week-by-week study schedules with resources
- **Roadmap Vision** - Upload a roadmap image or PDF and AI extracts all topics with priorities and timelines

### Job Roadmap Engine

- **Build from Scratch** - Enter target role, skills, experience, and timeline. AI generates 8-12 quests, 2-3 dungeons, 2-4 certifications, 4-6 goals, 5-8 habits, quest chains, and milestones.
- **Upload Roadmap** - Upload PDF/image (supports roadmap.sh-style graphical PDFs). AI extracts topics using vision, groups by section, assigns priorities, estimates hours, and suggests resources. Create todos or full roadmaps from extracted data.

### Certification Planning

- AI-generated week-by-week study plans
- Topic-level resources (YouTube search links, blog/doc URLs)
- Pause/Resume certs (preserves study plan, removes from active timeline)
- Progress tracking and gold bonuses on completion

### Daily Planner

- Priority-based todo lists (Critical, High, Normal)
- 6 categories with color coding
- AI-generated task descriptions
- Recurring todos (daily, weekly, weekdays, custom)
- Drag-and-drop reordering
- Roadmap-linked and cert-linked todos

### Analytics & Tracking

- **Radar Chart** - 300x300 stat distribution visualization
- **Heatmap** - GitHub-style 365-day completion history
- **XP Trends** - Daily/weekly XP charts
- **Category Breakdowns** - Completion rates per quest category
- **Streak Visualization** - Current and best streak tracking
- **Daily Snapshots** - XP, gold, quests, todos, and focus minutes per day

### Reward Shop

6 tiers of real-world rewards purchasable with earned gold:

| Tier | Gold Range | Examples |
|------|-----------|----------|
| E | 50-300 | Snacks, coffee |
| D | 300-800 | Accessories, courses |
| C | 800-1500 | Gadgets, dining |
| B | 1500-3000 | Electronics |
| A | 3000-6000 | Premium tech |
| S | 6000+ | Luxury items |

### Achievement System

30+ achievements across 6 categories with 5 rarity tiers (Common through Mythic). Unlock rewards include XP, gold, and exclusive titles.

### Additional Features

- **Timer** - Pomodoro/focus timer with quest/todo linking and session history
- **Job Applications** - Full pipeline tracker (Discovered, Applied, Interview, Offer, Rejected)
- **Savings Tracker** - Expense logging, savings pots, budget tracking
- **Quest Chains** - Multi-step linked quests with progression and completion bonuses
- **Dark Mode** - Full dark theme with localStorage persistence
- **Toast Notifications** - 6 types (XP, gold, level-up, achievement, info, error)
- **PWA Support** - Progressive Web App for mobile

---

## Tech Stack

| | Technology |
|---|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Charts | Recharts |
| Database | Prisma + LibSQL (SQLite dev / Turso prod) |
| AI Primary | Anthropic Claude (claude-sonnet-4-6) |
| AI Fallback | Mistral AI (mistral-small-latest, free tier) |
| Icons | Lucide React |
| Audio | Howler.js |
| PDF | pdf-parse + Mistral OCR |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Anthropic API key (recommended) and/or Mistral API key (free tier)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your API keys

# Initialize database and seed data
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Claude API key for AI features |
| `MISTRAL_API_KEY` | Recommended | Mistral free tier fallback |
| `DATABASE_URL` | Yes | `file:./dev.db` for local development |

### Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run db:push      # Push schema to database
npm run db:seed      # Seed initial data
npm run db:studio    # Open database GUI
```

---

## Project Structure

```
src/
  app/
    (app)/              # 18 authenticated pages
      dashboard/        # Main hub with widgets
      quests/           # Quest board with search/filters
      dungeons/         # 7-day challenge system
      planner/          # Daily todo list
      timer/            # Pomodoro/focus timer
      exam/             # Gate-level AI exams
      chains/           # Multi-step quest chains
      goals/            # Sprint/monthly/life goals
      achievements/     # Achievement gallery
      profile/          # Hunter settings
      stats/            # Radar chart analytics
      analytics/        # Heatmap and trends
      shop/             # Reward store
      savings/          # Financial tracker
      applications/     # Job application pipeline
      certs/            # Certification study plans
      roadmap/          # AI career path generator
      mentor/           # AI coaching chatbot
    api/                # 31 API endpoints
  components/           # Reusable UI components
  contexts/             # HunterContext (global state)
  lib/                  # Core logic
    ai.ts               # All AI functions (12+ exports)
    xp.ts               # XP formulas, ranks, streaks
    leveling.ts         # Level-up logic, gates
    quest-details.ts    # 50+ quest step-by-step guides
    db.ts               # Prisma client singleton
prisma/
  schema.prisma         # 19 database models
  seed.ts               # 48 quests, 10 dungeons, 40 rewards, 30 achievements
```

---

## Database

19 Prisma models including: Hunter, Quest, Completion, Dungeon, Exam, Achievement, Goal, Application, CertRoadmap, TodoItem, QuestChain, QuestChainStep, TimeSession, JobRoadmap, DailySnapshot, Briefing, Reward, SavingsLog, SpendLog, MentorLog.

See [documentation.md](./documentation.md) for full schema details.

---

## AI Provider Fallback

All AI features follow a graceful degradation chain:

1. **Anthropic Claude** (primary) - claude-sonnet-4-6
2. **Mistral AI** (fallback) - mistral-small-latest (free tier)
3. **Graceful empty** - features degrade without crashing

Vision features (image/PDF extraction) also support fallback:
- Image: Anthropic Vision -> Mistral Vision
- PDF: Anthropic Document -> Mistral OCR + Chat -> pdf-parse text

---

## Pages Overview

| Page | Path | Description |
|------|------|-------------|
| Dashboard | `/dashboard` | Main hub with all widgets |
| Quests | `/quests` | Quest board with search and filters |
| Dungeons | `/dungeons` | 7-day challenge quests |
| Planner | `/planner` | Daily todo list |
| Timer | `/timer` | Pomodoro/focus timer |
| Exam | `/exam` | AI gate-level exams |
| Chains | `/chains` | Multi-step quest chains |
| Goals | `/goals` | Sprint/monthly/life goals |
| Achievements | `/achievements` | Achievement gallery |
| Profile | `/profile` | Hunter identity and settings |
| Stats | `/stats` | Radar chart analytics |
| Analytics | `/analytics` | Heatmap and trend data |
| Shop | `/shop` | Reward store |
| Savings | `/savings` | Financial tracker |
| Applications | `/applications` | Job application pipeline |
| Certs | `/certs` | Certification study plans |
| Roadmap | `/roadmap` | AI career path generator |
| Mentor | `/mentor` | AI coaching chatbot |

---

## License

Private project.
