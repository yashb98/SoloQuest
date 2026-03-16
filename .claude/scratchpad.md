# SoloQuest — Working Scratchpad

## Current Task
- Expanding from single Next.js app → pnpm monorepo (web + mobile + agents)
- Adding 13 AI agents via LangGraph + Langfuse + Kimi Code API
- Building React Native (Expo) mobile app

## What's Done
- Monorepo structure created (pnpm-workspace.yaml, apps/web/, apps/mobile/, packages/shared/, agents/)
- Web app moved to apps/web/
- Root CLAUDE.md written with full architecture
- Web CLAUDE.md updated for monorepo context
- SKILL.md updated with agent system + game mechanics
- New .claude/ agents: agent-reviewer, mobile-reviewer
- New .claude/ commands: dev-mobile, dev-agents, add-agent
- New .claude/ skill: agent-system
- All existing commands updated for monorepo paths

## What's Next
1. Install dependencies in apps/web/ (pnpm install)
2. Create packages/shared/ with extracted types
3. Add new Prisma models (AgentRun, DeviceData, AgentConfig)
4. Add API auth middleware
5. Scaffold Expo mobile app
6. Set up Python agent backend
7. Build agents one by one

## Discoveries
- Web app has 33 API routes — all need bearer token auth for mobile/agent access
- Existing AI integration (ai.ts) has clean call+fallback pattern — agent backend follows same pattern
- HunterContext.tsx HunterData interface needs to be extracted to shared package
- Game math in xp.ts needs to be shared between web, mobile, and agents
